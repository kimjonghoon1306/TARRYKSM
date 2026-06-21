"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type CheckoutItem = { product_id: string; qty: number; opts?: Record<string, string> };
type OptGroup = { name: string; choices: { label: string; add: number }[] };
export type CheckoutBuyer = {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  memo?: string;
  remote?: boolean; // 도서산간 (추가 배송비 부과)
};

// 손님 주문 접수 (비로그인 가능). 가격은 서버에서 DB값으로 재계산(클라 값 신뢰 안 함).
export async function placeOrder(
  storeId: string,
  buyer: CheckoutBuyer,
  items: CheckoutItem[],
  couponCode?: string,
  usePoints?: number
): Promise<{ ok: boolean; error?: string; orderId?: string }> {
  const name = (buyer.name || "").trim();
  const phone = (buyer.phone || "").trim();
  if (!name || !phone) return { ok: false, error: "이름과 연락처를 입력해 주세요." };
  if (!items.length) return { ok: false, error: "장바구니가 비어 있어요." };

  const supabase = await createClient();

  const token = (await cookies()).get("cust_session")?.value || null;
  const { data: atomicOrder, error: atomicErr } = await supabase.rpc("checkout_place_order_atomic", {
    p_store_id: storeId,
    p_buyer: buyer,
    p_items: items,
    p_coupon_code: couponCode || null,
    p_use_points: Math.max(0, Math.trunc(Number(usePoints) || 0)),
    p_token: token,
  });
  if (!atomicErr) {
    const r = atomicOrder as { ok?: boolean; error?: string; orderId?: string } | null;
    return r?.ok
      ? { ok: true, orderId: r.orderId }
      : { ok: false, error: r?.error || "주문 접수에 실패했어요. 잠시 후 다시 시도해 주세요." };
  }
  const missingAtomic =
    atomicErr.code === "42883" ||
    /checkout_place_order_atomic|function .* does not exist/i.test(atomicErr.message || "");
  if (!missingAtomic) {
    return {
      ok: false,
      error: /재고|품절|남았어요/.test(atomicErr.message || "")
        ? atomicErr.message
        : "주문 접수에 실패했어요. 잠시 후 다시 시도해 주세요.",
    };
  }

  // 발행된 몰인지 + 상품 가격 조회 (재계산)
  const ids = items.map((i) => i.product_id);
  const { data: prods } = await supabase
    .from("products")
    .select("id,name,price,store_id,stock,options,variants")
    .in("id", ids)
    .eq("store_id", storeId);
  if (!prods || prods.length === 0) return { ok: false, error: "상품 정보를 찾을 수 없어요." };

  const priceMap = new Map(prods.map((p) => [p.id as string, p]));
  const lines = items
    .map((i) => {
      const p = priceMap.get(i.product_id);
      if (!p) return null;
      const qty = Math.max(1, Math.min(999, i.qty | 0));
      // 옵션 추가금·표시명 서버 재계산 (클라 값 신뢰 안 함)
      const groups = (Array.isArray(p.options) ? p.options : []) as OptGroup[];
      let addPrice = 0;
      const labelParts: string[] = [];
      const comboLabels: string[] = [];
      for (const g of groups) {
        const sel = i.opts?.[g.name];
        const ch = g.choices.find((c) => c.label === sel);
        if (ch) {
          addPrice += ch.add || 0;
          labelParts.push(`${g.name}: ${ch.label}`);
          comboLabels.push(ch.label);
        }
      }
      const optText = labelParts.length ? ` (${labelParts.join(" / ")})` : "";
      // 옵션 조합별 재고(SKU) — variants 있고 모든 그룹 선택됐으면 그 조합 재고를 사용, key 보관
      const variants = (Array.isArray(p.variants) ? p.variants : []) as { key: string; stock: number }[];
      let variantKey: string | null = null;
      let effStock = (p.stock ?? null) as number | null;
      if (variants.length && groups.length > 0 && comboLabels.length === groups.length) {
        variantKey = comboLabels.join("|");
        const v = variants.find((x) => x.key === variantKey);
        effStock = v ? (v.stock ?? 0) : 0;
      }
      return {
        product_id: p.id as string,
        name: (p.name as string) + optText,
        price: (p.price as number) + addPrice,
        qty,
        stock: effStock,
        variantKey,
      };
    })
    .filter((l): l is { product_id: string; name: string; price: number; qty: number; stock: number | null; variantKey: string | null } => !!l);
  if (!lines.length) return { ok: false, error: "주문할 상품이 없어요." };

  // 재고 확인 (관리 중인 상품만)
  const short = lines.find((l) => typeof l.stock === "number" && l.qty > (l.stock as number));
  if (short) {
    return {
      ok: false,
      error:
        short.stock === 0
          ? `'${short.name}'은(는) 품절됐어요.`
          : `'${short.name}'은(는) ${short.stock}개만 남았어요.`,
    };
  }

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);

  // 쿠폰 적용 (서버에서 RPC로 재검증 — 클라 값 신뢰 안 함). RPC 없거나 실패 시 할인 0.
  let discount = 0;
  let appliedCode: string | null = null;
  const code = (couponCode || "").trim();
  if (code) {
    const { data: cv } = await supabase.rpc("validate_coupon", {
      p_store_id: storeId,
      p_code: code,
      p_subtotal: subtotal,
    });
    const r = cv as { ok?: boolean; discount?: number; code?: string } | null;
    if (r?.ok) {
      discount = Math.min(subtotal, r.discount || 0);
      appliedCode = r.code || code;
    }
  }
  const afterCoupon = subtotal - discount;

  // 회원 식별 (적립금·등급 공용)
  let custId: string | null = null;
  let custPoints = 0;
  try {
    const { getCustomer } = await import("@/app/[slug]/customer-actions");
    const cust = await getCustomer();
    if (cust && cust.store_id === storeId) {
      custId = cust.id;
      custPoints = cust.points || 0;
    }
  } catch { /* 비회원 주문은 그대로 */ }

  // 회원 등급 할인 — 등급 사용 켜진 몰 + 로그인 손님. 누적구매액 기준 등급의 할인%를 상품합계에 적용.
  // (grades.sql 미실행이면 조회 실패 → 0, 하위호환)
  let gradeDiscount = 0;
  if (custId) {
    const { data: stg } = await supabase.from("stores").select("grades_on").eq("id", storeId).maybeSingle();
    if (stg && (stg as { grades_on?: boolean }).grades_on) {
      const { data: c2 } = await supabase.from("customers").select("total_spent").eq("id", custId).maybeSingle();
      const spent = (c2 as { total_spent?: number } | null)?.total_spent ?? 0;
      const { data: g } = await supabase.rpc("grade_for_spent", { p_store: storeId, p_spent: spent });
      const gr = (Array.isArray(g) ? g[0] : g) as { discount_pct?: number } | null;
      const pct = Math.max(0, Math.min(100, gr?.discount_pct ?? 0));
      gradeDiscount = Math.min(afterCoupon, Math.floor((subtotal * pct) / 100));
    }
  }
  const afterGrade = afterCoupon - gradeDiscount;

  // 적립금 사용 — 로그인 손님 + 적립금 사용 켜진 몰에서만. 잔액·결제금액 한도로 클램프(서버 재검증).
  let pointsToUse = 0;
  if (custId && token) {
    const want = Math.max(0, Math.trunc(Number(usePoints) || 0));
    if (want > 0) {
      const { data: st } = await supabase.from("stores").select("points_on").eq("id", storeId).maybeSingle();
      if (st && (st as { points_on?: boolean }).points_on) {
        pointsToUse = Math.min(want, custPoints, afterGrade);
      }
    }
  }

  const afterPoints = afterGrade - pointsToUse;

  // 배송비 — 켜진 몰만. 무료배송 기준은 상품 합계(subtotal) 기준. 도서산간이면 추가비.
  // (배송비 컬럼 미생성 환경에선 조회 에러→shipping 0, 하위호환)
  let shipping = 0;
  {
    const { data: sh } = await supabase
      .from("stores")
      .select("ship_on,ship_fee,ship_free_over,ship_extra")
      .eq("id", storeId)
      .maybeSingle();
    const st = sh as { ship_on?: boolean; ship_fee?: number; ship_free_over?: number; ship_extra?: number } | null;
    if (st?.ship_on) {
      const freeOver = st.ship_free_over || 0;
      const base = freeOver > 0 && subtotal >= freeOver ? 0 : st.ship_fee || 0;
      shipping = base;
      if (base > 0 && buyer.remote) shipping += st.ship_extra || 0;
    }
  }

  const total = afterPoints + shipping;

  // 할인/적립금 적용 시에만 해당 컬럼 포함 (관련 SQL 미실행 환경 하위호환)
  const orderRow: Record<string, unknown> = {
    store_id: storeId,
    buyer_name: name,
    buyer_phone: phone,
    buyer_email: (buyer.email || "").trim() || null,
    address: (buyer.address || "").trim() || null,
    memo: (buyer.memo || "").trim() || null,
    total,
  };
  if (discount > 0) {
    orderRow.discount = discount;
    orderRow.coupon_code = appliedCode;
  }
  if (custId) orderRow.customer_id = custId;
  if (pointsToUse > 0) orderRow.points_used = pointsToUse;
  if (shipping > 0) orderRow.shipping = shipping;
  if (gradeDiscount > 0) orderRow.grade_discount = gradeDiscount;

  // id를 미리 생성해 insert (RLS상 anon은 insert 후 되읽기(select)가 막힐 수 있어 select 생략)
  const orderId = crypto.randomUUID();
  orderRow.id = orderId;
  const { error: oerr } = await supabase.from("orders").insert(orderRow);
  if (oerr) return { ok: false, error: "주문 접수에 실패했어요. 잠시 후 다시 시도해 주세요." };

  const { error: ierr } = await supabase.from("order_items").insert(
    lines.map((l) => ({
      order_id: orderId,
      product_id: l.product_id,
      name: l.name,
      price: l.price,
      qty: l.qty,
    }))
  );
  if (ierr) {
    // 줄 저장 실패 시 주문도 정리(주문은 본인이 못 지우므로 best-effort)
    return { ok: false, error: "주문 상품 저장에 실패했어요." };
  }

  // 재고 차감 (관리 중인 상품만, RPC가 null이면 무시). 조합(variant) 있으면 조합 재고 차감, 아니면 상품 재고.
  await Promise.all(
    lines
      .filter((l) => typeof l.stock === "number")
      .map((l) =>
        l.variantKey
          ? supabase.rpc("decrement_variant_stock", { pid: l.product_id, p_key: l.variantKey, qty: l.qty })
          : supabase.rpc("decrement_stock", { pid: l.product_id, qty: l.qty })
      )
  );

  // 쿠폰 사용횟수 +1 (적용된 경우만, RPC 없으면 무시)
  if (appliedCode) {
    await supabase.rpc("redeem_coupon", { p_store_id: storeId, p_code: appliedCode });
    // 로그인 손님이면 쿠폰함의 해당 쿠폰도 사용처리 (RPC 없으면 무시)
    if (token) {
      await supabase.rpc("mark_my_coupon_used", { p_token: token, p_code: appliedCode });
    }
  }

  // 적립금 차감 (주문 성공 후, 세션 토큰으로 서버 재검증·차감·내역기록. RPC 없으면 무시)
  if (pointsToUse > 0 && token) {
    await supabase.rpc("customer_use_points", { p_token: token, p_amount: pointsToUse, p_order: orderId });
  }

  // 재구매 쿠폰 자동 발급 (로그인 손님 + 설정된 몰만, 같은 쿠폰 중복발급은 RPC가 막음. SQL 없으면 무시)
  if (token) {
    await supabase.rpc("auto_issue_coupon", { p_token: token, p_reason: "repurchase" });
  }

  return { ok: true, orderId };
}

// 손님 리뷰 작성 (발행몰이면 비로그인 가능). reviews 테이블이 없으면 안내.
export async function submitReview(input: {
  storeId: string;
  productId: string;
  name: string;
  rating: number;
  comment?: string;
}): Promise<{ ok: boolean; error?: string; review?: { id: string; buyer_name: string; rating: number; comment: string | null; created_at: string } }> {
  const name = (input.name || "").trim();
  const rating = Math.max(1, Math.min(5, input.rating | 0));
  const comment = (input.comment || "").trim().slice(0, 1000) || null;
  if (!name) return { ok: false, error: "이름을 입력해 주세요." };
  if (!rating) return { ok: false, error: "별점을 선택해 주세요." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .insert({ store_id: input.storeId, product_id: input.productId, buyer_name: name, rating, comment })
    .select("id,buyer_name,rating,comment,created_at")
    .maybeSingle();
  if (error || !data) return { ok: false, error: "리뷰 등록에 실패했어요. 잠시 후 다시 시도해 주세요." };
  return {
    ok: true,
    review: data as { id: string; buyer_name: string; rating: number; comment: string | null; created_at: string },
  };
}

// ── 상품 문의(Q&A) ──
export type ProductQuestion = {
  id: string;
  buyer_name: string;
  question: string | null; // 비밀글이고 본인 아니면 null
  answer: string | null;
  secret: boolean;
  answered: boolean;
  is_mine: boolean;
  created_at: string;
};

// 상품 문의 목록 (비밀글은 작성 본인 외 내용 마스킹 — RPC에서 처리). 없으면 빈 배열.
export async function listQuestions(productId: string): Promise<ProductQuestion[]> {
  const supabase = await createClient();
  const token = (await cookies()).get("cust_session")?.value || null;
  const { data } = await supabase.rpc("list_product_questions", { p_product: productId, p_token: token });
  return (data ?? []) as ProductQuestion[];
}

// 손님 문의 등록 (발행몰이면 비로그인도 가능, 로그인 손님이면 작성자로 기록).
export async function askQuestion(input: {
  storeId: string;
  productId: string;
  name: string;
  question: string;
  secret?: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  const name = (input.name || "").trim();
  const q = (input.question || "").trim();
  if (!name) return { ok: false, error: "이름을 입력해 주세요." };
  if (!q) return { ok: false, error: "문의 내용을 입력해 주세요." };
  const supabase = await createClient();
  const token = (await cookies()).get("cust_session")?.value || null;
  const { data, error } = await supabase.rpc("ask_product_question", {
    p_store: input.storeId,
    p_product: input.productId,
    p_name: name,
    p_question: q,
    p_secret: !!input.secret,
    p_token: token,
  });
  if (error || data !== true) return { ok: false, error: "문의 등록에 실패했어요. 잠시 후 다시 시도해 주세요." };
  return { ok: true };
}

// 재입고 알림 신청 (품절 상품) — 발행몰이면 비로그인도 연락처로 신청 가능. RPC 없으면 무시.
export async function requestRestock(input: {
  storeId: string;
  productId: string;
  contact: string;
}): Promise<{ ok: boolean; error?: string }> {
  const contact = (input.contact || "").trim();
  if (!contact) return { ok: false, error: "연락받을 이메일이나 전화번호를 입력해 주세요." };
  const supabase = await createClient();
  const token = (await cookies()).get("cust_session")?.value || null;
  const { data, error } = await supabase.rpc("request_restock", {
    p_store: input.storeId,
    p_product: input.productId,
    p_contact: contact,
    p_token: token,
  });
  if (error || data !== true) return { ok: false, error: "신청에 실패했어요. 잠시 후 다시 시도해 주세요." };
  return { ok: true };
}

// 체크아웃 쿠폰 검증 (코드+소계 → 할인액). coupons 테이블/RPC 없으면 무시(할인 0).
export async function checkCoupon(
  storeId: string,
  code: string,
  subtotal: number
): Promise<{ ok: boolean; error?: string; discount?: number; code?: string }> {
  const c = (code || "").trim();
  if (!c) return { ok: false, error: "쿠폰 코드를 입력해 주세요." };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("validate_coupon", {
    p_store_id: storeId,
    p_code: c,
    p_subtotal: subtotal,
  });
  if (error) return { ok: false, error: "쿠폰을 확인할 수 없어요." };
  const r = data as { ok: boolean; error?: string; discount?: number; code?: string } | null;
  if (!r || !r.ok) return { ok: false, error: r?.error || "사용할 수 없는 쿠폰이에요." };
  return { ok: true, discount: r.discount || 0, code: r.code };
}
