import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// 같은 요청(한 번의 화면 렌더) 안에서 auth.getUser()를 1번만 호출하도록 캐시.
// 레이아웃 getMe() + 각 페이지가 따로 인증서버를 왕복하던 걸 1회로 합쳐 전환 속도 개선.
// React cache()는 요청 단위라 사용자 간 섞이지 않음.
export const currentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

// 현재 로그인 유저가 운영자(role==='admin')인지 — 모든 몰 제어 허용용.
// (lib/role의 getMe를 쓰면 순환 import라 profiles.role 직접 조회)
async function viewerIsAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return (data as { role?: string } | null)?.role === "admin";
}

// 강한 소유 검증: 이 store가 현재 로그인 유저의 것인지 owner를 명시 비교.
// RLS가 막아주지만, RLS가 어긋날 경우 대비한 2차 방어(서버액션에서 호출).
// 운영자(role==='admin')는 모든 몰을 제어할 수 있다(전체 관리에서 회원 몰 운영).
export async function ownsStore(storeId: string): Promise<boolean> {
  if (!storeId) return false;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("stores")
    .select("id")
    .eq("id", storeId)
    .eq("owner", user.id)
    .maybeSingle();
  if (data) return true;
  return await viewerIsAdmin();
}

// 특정 테이블의 행(id)이 내 소유 몰에 속하는지 — store_id 컬럼 가진 테이블용(orders·reviews·product_questions·restock_requests).
// 운영자(admin)는 모든 행 허용.
export async function ownsRow(table: string, id: string): Promise<boolean> {
  if (!id) return false;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from(table).select("store_id").eq("id", id).maybeSingle();
  const storeId = (data as { store_id?: string } | null)?.store_id;
  if (!storeId) return false;
  const { data: s } = await supabase.from("stores").select("id").eq("id", storeId).eq("owner", user.id).maybeSingle();
  if (s) return true;
  return await viewerIsAdmin();
}
