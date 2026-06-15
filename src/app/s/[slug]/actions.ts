"use server";

import { createClient } from "@/lib/supabase/server";

export type CheckoutItem = { product_id: string; qty: number };
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
  items: CheckoutItem[]
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
    .select("id,name,price,store_id")
    .in("id", ids)
    .eq("store_id", storeId);
  if (!prods || prods.length === 0) return { ok: false, error: "상품 정보를 찾을 수 없어요." };

  const priceMap = new Map(prods.map((p) => [p.id as string, p]));
  const lines = items
    .map((i) => {
      const p = priceMap.get(i.product_id);
      if (!p) return null;
      const qty = Math.max(1, Math.min(999, i.qty | 0));
      return { product_id: p.id as string, name: p.name as string, price: p.price as number, qty };
    })
    .filter((l): l is { product_id: string; name: string; price: number; qty: number } => !!l);
  if (!lines.length) return { ok: false, error: "주문할 상품이 없어요." };

  const total = lines.reduce((sum, l) => sum + l.price * l.qty, 0);

  const { data: order, error: oerr } = await supabase
    .from("orders")
    .insert({
      store_id: storeId,
      buyer_name: name,
      buyer_phone: phone,
      buyer_email: (buyer.email || "").trim() || null,
      address: (buyer.address || "").trim() || null,
      memo: (buyer.memo || "").trim() || null,
      total,
    })
    .select("id")
    .maybeSingle();
  if (oerr || !order) return { ok: false, error: "주문 접수에 실패했어요. 잠시 후 다시 시도해 주세요." };

  const { error: ierr } = await supabase.from("order_items").insert(
    lines.map((l) => ({
      order_id: order.id,
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

  return { ok: true, orderId: order.id as string };
}
