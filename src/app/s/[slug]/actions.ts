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

  // 재고 차감 (관리 중인 상품만, RPC가 null이면 무시)
  await Promise.all(
    lines
      .filter((l) => typeof l.stock === "number")
      .map((l) => supabase.rpc("decrement_stock", { pid: l.product_id, qty: l.qty }))
  );

  return { ok: true, orderId: order.id as string };
}
