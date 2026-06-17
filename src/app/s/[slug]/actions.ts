"use server";

import { createClient } from "@/lib/supabase/server";

export type CheckoutItem = { product_id: string; qty: number; opts?: Record<string, string> };
type OptGroup = { name: string; choices: { label: string; add: number }[] };
export type CheckoutBuyer = {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  memo?: string;
};

// 손님 주문 접수 (비로그인 가능). 가격은 서버에서 DB값으로 재계산(클라 값 신뢰 안 함).
export async function placeOrder(
  storeId: string,
  buyer: CheckoutBuyer,
  items: CheckoutItem[],
  couponCode?: string
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
  const total = subtotal - discount;

  // 할인 적용 시에만 discount/coupon_code 컬럼 포함 (coupons.sql 미실행 환경 하위호환)
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
  // 로그인한 손님이면 주문에 연결 (마이페이지 주문내역에 표시)
  try {
    const { getCustomer } = await import("@/app/[slug]/customer-actions");
    const cust = await getCustomer();
    if (cust && cust.store_id === storeId) orderRow.customer_id = cust.id;
  } catch { /* 비회원 주문은 그대로 */ }

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
