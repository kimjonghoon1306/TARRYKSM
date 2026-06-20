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

// 강한 소유 검증: 이 store가 현재 로그인 유저의 것인지 owner를 명시 비교.
// RLS가 막아주지만, RLS가 어긋날 경우 대비한 2차 방어(서버액션에서 호출).
// 관리자(is_admin)는 admin-control RLS가 허용하므로 여기선 owner 일치만 본다(관리자 작업은 platform 액션에서 별도 처리).
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
  return !!data;
}
