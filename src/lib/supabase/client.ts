import { createBrowserClient } from "@supabase/ssr";
import { toSessionCookie } from "./cookies";

// 브라우저(클라이언트 컴포넌트)용 Supabase 클라이언트.
// 쿠키를 "세션 쿠키"로 저장 → 브라우저를 닫으면 로그인이 풀린다.
// (탭이 열려 있는 동안 + 페이지 이동에는 로그인 유지)
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return document.cookie
            .split("; ")
            .filter(Boolean)
            .map((c) => {
              const eq = c.indexOf("=");
              return { name: c.slice(0, eq), value: decodeURIComponent(c.slice(eq + 1)) };
            });
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const o = toSessionCookie(options); // maxAge/expires 제거 → 세션 쿠키
            let str = `${name}=${encodeURIComponent(value)}`;
            str += `; path=${o.path || "/"}`;
            if (o.domain) str += `; domain=${o.domain}`;
            if (o.sameSite) str += `; samesite=${o.sameSite}`;
            if (o.secure) str += `; secure`;
            document.cookie = str;
          });
        },
      },
    }
  );
}
