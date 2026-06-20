// 구독(사용 기간) 헬퍼 — profiles.plan_paid_at / plan_until
// plan_until 컬럼이 없을 수 있어(subscription-dates.sql 미실행) 조회는 전부 안전 폴백.
import type { SupabaseClient } from "@supabase/supabase-js";

export function fmtDate(d: string | Date): string {
  const t = typeof d === "string" ? new Date(d) : d;
  return `${t.getFullYear()}.${String(t.getMonth() + 1).padStart(2, "0")}.${String(t.getDate()).padStart(2, "0")}`;
}

export type PlanStatus = {
  set: boolean; // 만료일이 지정돼 있는지
  until: string | null;
  label: string; // 만료일 표기 or "미설정"
  days: number | null; // 남은 일수(음수=만료 지남)
  expired: boolean;
};

// 만료 여부 — 유료(basic/pro/premium)인데 사용기간이 지났으면 true.
// 무료는 기간 개념이 없어 만료되지 않음. (아임웹식: 한번 유료면 무료로 못 돌아감 → 만료=잠김)
export function isExpired(plan: string, until?: string | null): boolean {
  if (!["basic", "pro", "premium"].includes(plan)) return false;
  if (!until) return false;
  return new Date(until).getTime() < Date.now();
}

export function planStatus(until?: string | null): PlanStatus {
  if (!until) return { set: false, until: null, label: "미설정", days: null, expired: false };
  const end = new Date(until);
  const now = new Date();
  const days = Math.ceil((end.getTime() - now.getTime()) / 86400000);
  return { set: true, until, label: fmtDate(end), days, expired: days < 0 };
}

// 한 회원의 구독 정보(안전 조회)
export async function fetchPlanDates(
  supabase: SupabaseClient,
  userId: string
): Promise<{ plan_paid_at: string | null; plan_until: string | null }> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("plan_paid_at,plan_until")
      .eq("id", userId)
      .maybeSingle();
    if (error || !data) return { plan_paid_at: null, plan_until: null };
    return data as { plan_paid_at: string | null; plan_until: string | null };
  } catch {
    return { plan_paid_at: null, plan_until: null };
  }
}

// 쇼핑몰 잠금 판정은 손님(anon)이 profiles를 못 읽으므로 RPC(is_store_locked, SECURITY DEFINER)로 처리.
// → supabase/store-lock.sql, 스토어프런트 page.tsx에서 supabase.rpc("is_store_locked", { p_store }).

// 여러 회원의 만료일 맵(안전 조회) — 회원관리 표 배지용
export async function fetchPlanUntilMap(supabase: SupabaseClient): Promise<Map<string, string | null>> {
  try {
    const { data, error } = await supabase.from("profiles").select("id,plan_until");
    if (error || !data) return new Map();
    return new Map((data as { id: string; plan_until: string | null }[]).map((r) => [r.id, r.plan_until]));
  } catch {
    return new Map();
  }
}
