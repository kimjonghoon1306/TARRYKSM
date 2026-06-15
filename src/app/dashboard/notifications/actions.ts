"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// 알림 한 건 읽음 처리 (RLS: 본인 것만)
export async function markRead(id: string) {
  const supabase = await createClient();
  await supabase.from("notifications").update({ read: true }).eq("id", id);
  revalidatePath("/dashboard/notifications");
  return { ok: true };
}

// 전체 읽음 처리
export async function markAllRead() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };
  await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

// 알림 삭제
export async function deleteNotification(id: string) {
  const supabase = await createClient();
  await supabase.from("notifications").delete().eq("id", id);
  revalidatePath("/dashboard/notifications");
  return { ok: true };
}
