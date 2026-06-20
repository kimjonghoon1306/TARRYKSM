"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// 연락 완료 표시/해제 (RLS: 몰 소유자/관리자만)
export async function markRestockNotified(id: string, notified: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("restock_requests").update({ notified }).eq("id", id);
  if (error) return { ok: false };
  revalidatePath("/dashboard/restock");
  return { ok: true };
}

// 신청 삭제 (RLS: 몰 소유자/관리자만)
export async function deleteRestock(id: string) {
  const supabase = await createClient();
  await supabase.from("restock_requests").delete().eq("id", id);
  revalidatePath("/dashboard/restock");
  return { ok: true };
}
