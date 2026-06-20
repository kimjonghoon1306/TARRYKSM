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

// 구독: "결제 완료" → 요금제 등급(plan)을 함께 지정하고 오늘부터 한 달(plan_until) 자동 계산.
// 등급 없이 날짜만 붙는 문제 방지 — 결제는 항상 등급+기간이 한 묶음.
export async function markPlanPaidNow(
  userId: string,
  plan: "basic" | "pro" | "premium"
): Promise<{ ok: boolean; error?: string }> {
  if (!(await assertAdmin())) return { ok: false, error: "권한이 없습니다" };
  if (!["basic", "pro", "premium"].includes(plan)) return { ok: false, error: "요금제를 선택해 주세요." };
  const supabase = await createClient();
  const now = new Date();
  const until = new Date(now);
  until.setMonth(until.getMonth() + 1); // 한 달 뒤
  const { error } = await supabase
    .from("profiles")
    .update({ plan, plan_paid_at: now.toISOString(), plan_until: until.toISOString() })
    .eq("id", userId);
  if (error) return { ok: false, error: "subscription-dates.sql 실행이 필요해요. (" + error.message + ")" };
  revalidatePath("/dashboard/platform");
  revalidatePath("/dashboard/platform/" + userId);
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

// 구독 해지 → 무료로 전환하고 사용기간 제거(쇼핑몰 잠금 해제 위해 plan_until null).
export async function cancelPlan(userId: string): Promise<{ ok: boolean; error?: string }> {
  if (!(await assertAdmin())) return { ok: false, error: "권한이 없습니다" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ plan: "free", plan_paid_at: null, plan_until: null })
    .eq("id", userId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/platform");
  revalidatePath("/dashboard/platform/" + userId);
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

// 구독: 사용 만료일을 days 만큼 더하거나(+) 뺀다(-). 기준일 없으면 오늘부터.
export async function adjustPlanDays(userId: string, days: number): Promise<{ ok: boolean; error?: string }> {
  if (!(await assertAdmin())) return { ok: false, error: "권한이 없습니다" };
  const supabase = await createClient();
  const { data, error: readErr } = await supabase
    .from("profiles")
    .select("plan_until")
    .eq("id", userId)
    .maybeSingle();
  if (readErr) return { ok: false, error: "subscription-dates.sql 실행이 필요해요." };
  const base = (data as { plan_until?: string | null } | null)?.plan_until
    ? new Date((data as { plan_until: string }).plan_until)
    : new Date();
  base.setDate(base.getDate() + days);
  const { error } = await supabase
    .from("profiles")
    .update({ plan_until: base.toISOString() })
    .eq("id", userId);
  if (error) return { ok: false, error: "변경 실패: " + error.message };
  revalidatePath("/dashboard/platform");
  revalidatePath("/dashboard", "layout");
  return { ok: true };
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
