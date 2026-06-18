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
