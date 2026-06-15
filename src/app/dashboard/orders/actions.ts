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
