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

// 회원 요금제 변경 (free/basic/pro) — 실결제 전 수동 적용
export async function setUserPlan(userId: string, plan: "free" | "basic" | "pro") {
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
