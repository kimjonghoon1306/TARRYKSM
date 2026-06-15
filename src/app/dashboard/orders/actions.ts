"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const STATUSES = ["신규", "처리중", "배송중", "완료", "취소"];

// 주문 상태 변경 (RLS가 소유자/관리자만 허용)
export async function updateOrderStatus(orderId: string, status: string) {
  if (!STATUSES.includes(status)) return;
  const supabase = await createClient();
  await supabase.from("orders").update({ status }).eq("id", orderId);
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard");
}

// 송장 등록 — 택배사+운송장번호 저장. 입력하면 상태를 '배송중'으로 자동 전환.
export async function setShipping(orderId: string, courier: string, trackingNo: string) {
  const supabase = await createClient();
  const c = courier.trim();
  const t = trackingNo.trim();
  const patch: Record<string, unknown> = { courier: c || null, tracking_no: t || null };
  if (c && t) patch.status = "배송중";
  await supabase.from("orders").update(patch).eq("id", orderId);
  revalidatePath("/dashboard/orders");
}
