import { createClient as createSbClient } from "@supabase/supabase-js";

// ⚠️ 서버 전용 service_role 클라이언트 — RLS를 우회한다. 절대 클라이언트(브라우저)에 노출 금지.
// 손님 비밀번호 해시처럼 anon에 절대 내주면 안 되는 데이터를 서버 액션 안에서만 다룰 때 사용.
// 키(SUPABASE_SERVICE_ROLE_KEY)는 Vercel 서버 환경변수에만 존재(클라이언트 번들에 안 들어감).
let cached: ReturnType<typeof createSbClient> | null = null;

export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null; // 키 미설정 환경 → null (호출부가 폴백)
  if (!cached) {
    cached = createSbClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
