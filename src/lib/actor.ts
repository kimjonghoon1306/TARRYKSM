import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getMe, type Me, type Role } from "@/lib/role";

export const ACTING_COOKIE = "acting_as";

// "보는 대상" 컨텍스트 — 운영자가 창업자로 시크릿 입장(임퍼서네이션)했을 때
// 화면(사이드바·요금제·기능 게이팅)과 데이터 범위를 그 창업자 기준으로 보여주기 위함.
// ⚠️ 권한/RLS는 항상 진짜 로그인 계정(getMe) 기준 — 여긴 표시·스코프 전용.
export type Actor = {
  userId: string | null; // 보는 대상(임퍼서네이션 중이면 창업자, 아니면 본인)
  email: string | null;
  role: Role; // 보는 대상의 역할
  plan: string; // 보는 대상의 요금제(기능 게이팅용)
  impersonating: boolean; // 운영자가 창업자로 보는 중인지
  realRole: Role; // 진짜 로그인 계정의 역할
  realEmail: string | null;
};

export async function getActor(): Promise<Actor> {
  const me: Me = await getMe();
  const base: Actor = {
    userId: me.userId,
    email: me.email,
    role: me.role,
    plan: me.plan,
    impersonating: false,
    realRole: me.role,
    realEmail: me.email,
  };
  // 운영자만 임퍼서네이션 가능
  if (me.role !== "admin") return base;
  const target = (await cookies()).get(ACTING_COOKIE)?.value;
  if (!target || target === me.userId) return base;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("role,plan,email")
    .eq("id", target)
    .maybeSingle();
  if (!data) return base; // 대상 없음 → 본인으로
  const d = data as { role?: string; plan?: string | null; email?: string | null };
  return {
    userId: target,
    email: d.email ?? null,
    role: d.role === "admin" ? "admin" : "founder",
    plan: d.plan ?? "free",
    impersonating: true,
    realRole: "admin",
    realEmail: me.email,
  };
}
