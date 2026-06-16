import type { CookieOptions } from "@supabase/ssr";

// 세션 쿠키로 강제: maxAge·expires 제거 → 브라우저(탭) 닫으면 삭제됨.
// 앱 사용 중(탭 유지)에는 로그인 유지, 브라우저 닫고 다시 열면 재로그인 필요.
export function toSessionCookie(options?: CookieOptions): CookieOptions {
  const o = { ...(options || {}) };
  delete o.maxAge;
  delete o.expires;
  return o;
}
