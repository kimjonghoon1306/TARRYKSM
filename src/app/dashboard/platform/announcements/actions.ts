"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMe } from "@/lib/role";

async function assertAdmin() {
  const me = await getMe();
  return me.role === "admin";
}

export async function addAnnouncement(input: { title: string; body: string; pinned: boolean; popup?: boolean }) {
  if (!(await assertAdmin())) return { ok: false, error: "권한이 없어요." };
  const title = (input.title || "").trim();
  if (!title) return { ok: false, error: "제목을 입력해 주세요." };
  const supabase = await createClient();
  const row: Record<string, unknown> = {
    title,
    body: (input.body || "").trim() || null,
    pinned: !!input.pinned,
  };
  if (input.popup) row.popup = true; // popup 컬럼 없으면(미실행) 아래 폴백
  let { error } = await supabase.from("announcements").insert(row);
  if (error && input.popup) {
    // popup 컬럼 미생성 → popup 빼고 재시도(공지는 등록되게)
    delete row.popup;
    ({ error } = await supabase.from("announcements").insert(row));
  }
  if (error) return { ok: false, error: "등록에 실패했어요. (announcements.sql 실행 여부 확인)" };
  revalidatePath("/dashboard/platform/announcements");
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function toggleAnnouncement(id: string, field: "active" | "pinned" | "popup", value: boolean) {
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
