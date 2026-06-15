"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CouponInput = {
  code: string;
  kind: "percent" | "amount";
  value: number;
  min_order: number;
  max_uses: number | null;
  expires_at: string | null;
};

// 쿠폰 발급 (RLS: 몰 소유자/관리자만)
export async function addCoupon(storeId: string, input: CouponInput) {
  const code = (input.code || "").trim().toUpperCase();
  if (!code) return { ok: false, error: "쿠폰 코드를 입력해 주세요." };
  if (!/^[A-Z0-9_-]{2,30}$/.test(code))
    return { ok: false, error: "코드는 영문/숫자 2~30자로 입력해 주세요." };
  const kind = input.kind === "amount" ? "amount" : "percent";
  const value = Math.max(0, input.value | 0);
  if (value <= 0) return { ok: false, error: "할인 값을 입력해 주세요." };
  if (kind === "percent" && value > 100) return { ok: false, error: "퍼센트는 100 이하로 입력해 주세요." };

  const supabase = await createClient();
  const { error } = await supabase.from("coupons").insert({
    store_id: storeId,
    code,
    kind,
    value,
    min_order: Math.max(0, input.min_order | 0),
    max_uses: input.max_uses && input.max_uses > 0 ? input.max_uses : null,
    expires_at: input.expires_at || null,
  });
  if (error) {
    if (error.code === "23505") return { ok: false, error: "이미 있는 쿠폰 코드예요." };
    return { ok: false, error: "쿠폰 발급에 실패했어요. (coupons.sql 실행 여부 확인)" };
  }
  revalidatePath(`/dashboard/${storeId}/coupons`);
  return { ok: true };
}

export async function toggleCoupon(storeId: string, id: string, active: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("coupons").update({ active }).eq("id", id);
  if (error) return { ok: false, error: "변경에 실패했어요." };
  revalidatePath(`/dashboard/${storeId}/coupons`);
  return { ok: true };
}

export async function deleteCoupon(storeId: string, id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) return { ok: false, error: "삭제에 실패했어요." };
  revalidatePath(`/dashboard/${storeId}/coupons`);
  return { ok: true };
}
