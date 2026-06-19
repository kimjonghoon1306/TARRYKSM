"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMe } from "@/lib/role";

// 관리자만 실행 가능 (RLS도 막지만 액션 레벨에서도 선검사)
async function assertAdmin() {
  const me = await getMe();
  return me.role === "admin";
}

// 회원 역할 변경 (창업자 ↔ 관리자)
export async function setUserRole(userId: string, role: "admin" | "founder") {
  if (!(await assertAdmin())) return;
  const supabase = await createClient();
  await supabase.from("profiles").update({ role }).eq("id", userId);
  revalidatePath("/dashboard/platform");
}

// 회원 요금제 변경 (free/basic/pro/premium) — 실결제 전 수동 적용
export async function setUserPlan(userId: string, plan: "free" | "basic" | "pro" | "premium") {
  if (!(await assertAdmin())) return;
  const supabase = await createClient();
  await supabase.from("profiles").update({ plan }).eq("id", userId);
  revalidatePath("/dashboard/platform");
}

// 쇼핑몰 강제 비공개/공개 토글
export async function adminSetPublished(storeId: string, published: boolean) {
  if (!(await assertAdmin())) return;
  const supabase = await createClient();
  await supabase.from("stores").update({ published }).eq("id", storeId);
  revalidatePath("/dashboard/platform");
}

// 쇼핑몰 삭제(회수)
export async function adminDeleteStore(storeId: string) {
  if (!(await assertAdmin())) return;
  const supabase = await createClient();
  await supabase.from("stores").delete().eq("id", storeId);
  revalidatePath("/dashboard/platform");
}

// 회원 삭제 — 그 회원의 쇼핑몰·프로필·계정을 모두 제거 (RPC, 자기 자신 불가)
export async function adminDeleteUser(userId: string): Promise<{ ok: boolean; error?: string }> {
  if (!(await assertAdmin())) return { ok: false, error: "권한이 없습니다" };
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_delete_user", { p_user: userId });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/platform");
  return { ok: true };
}
