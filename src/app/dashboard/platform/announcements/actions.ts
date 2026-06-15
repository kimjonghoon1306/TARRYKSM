"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMe } from "@/lib/role";

async function assertAdmin() {
  const me = await getMe();
  return me.role === "admin";
}

export async function addAnnouncement(input: { title: string; body: string; pinned: boolean }) {
  if (!(await assertAdmin())) return { ok: false, error: "권한이 없어요." };
  const title = (input.title || "").trim();
  if (!title) return { ok: false, error: "제목을 입력해 주세요." };
  const supabase = await createClient();
  const { error } = await supabase.from("announcements").insert({
    title,
    body: (input.body || "").trim() || null,
    pinned: !!input.pinned,
  });
  if (error) return { ok: false, error: "등록에 실패했어요. (announcements.sql 실행 여부 확인)" };
  revalidatePath("/dashboard/platform/announcements");
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function toggleAnnouncement(id: string, field: "active" | "pinned", value: boolean) {
  if (!(await assertAdmin())) return { ok: false, error: "권한이 없어요." };
  const supabase = await createClient();
  const { error } = await supabase.from("announcements").update({ [field]: value }).eq("id", id);
  if (error) return { ok: false, error: "변경에 실패했어요." };
  revalidatePath("/dashboard/platform/announcements");
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function deleteAnnouncement(id: string) {
  if (!(await assertAdmin())) return { ok: false, error: "권한이 없어요." };
  const supabase = await createClient();
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) return { ok: false, error: "삭제에 실패했어요." };
  revalidatePath("/dashboard/platform/announcements");
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
