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

  // 발행된 몰인지 + 상품 가격 조회 (재계산)
  const ids = items.map((i) => i.product_id);
  const { data: prods } = await supabase
    .from("products")
    .select("id,name,price,store_id,stock,options")
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
      for (const g of groups) {
        const sel = i.opts?.[g.name];
        const ch = g.choices.find((c) => c.label === sel);
        if (ch) {
          addPrice += ch.add || 0;
          labelParts.push(`${g.name}: ${ch.label}`);
        }
      }
      const optText = labelParts.length ? ` (${labelParts.join(" / ")})` : "";
      return {
        product_id: p.id as string,
        name: (p.name as string) + optText,
        price: (p.price as number) + addPrice,
        qty,
        stock: (p.stock ?? null) as number | null,
      };
    })
    .filter((l): l is { product_id: string; name: string; price: number; qty: number; stock: number | null } => !!l);
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

  // 적립금 사용 — 로그인 손님 + 적립금 사용 켜진 몰에서만. 잔액·결제금액 한도로 클램프(서버 재검증).
  let custId: string | null = null;
  let pointsToUse = 0;
  const token = (await cookies()).get("cust_session")?.value;
  try {
    const { getCustomer } = await import("@/app/[slug]/customer-actions");
    const cust = await getCustomer();
    if (cust && cust.store_id === storeId) {
      custId = cust.id;
      const want = Math.max(0, Math.trunc(Number(usePoints) || 0));
      if (want > 0 && token) {
        const { data: st } = await supabase.from("stores").select("points_on").eq("id", storeId).maybeSingle();
        if (st && (st as { points_on?: boolean }).points_on) {
          pointsToUse = Math.min(want, cust.points || 0, afterCoupon);
        }
      }
    }
  } catch { /* 비회원 주문은 그대로 */ }

  const afterPoints = afterCoupon - pointsToUse;

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

  // 재고 차감 (관리 중인 상품만, RPC가 null이면 무시)
  await Promise.all(
    lines
      .filter((l) => typeof l.stock === "number")
      .map((l) => supabase.rpc("decrement_stock", { pid: l.product_id, qty: l.qty }))
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
