import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { resolveCustomDomain } from "@/lib/supabase/middleware";
import { PLATFORM_ROOTS } from "@/lib/domains";

// Next.js 16: 'middleware' 컨벤션이 'proxy'로 변경됨
export async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const p = url.pathname;
  const host = (request.headers.get("host") || "").toLowerCase().split(":")[0];

  const envRoot = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "").toLowerCase().split(":")[0];
  const roots = [...PLATFORM_ROOTS, envRoot].filter(Boolean);
  const matchedRoot = roots.find((r) => host === r || host.endsWith("." + r));

  // ── 서브도메인 추출 (myshop.on.온종일.com → "myshop") ──
  let subdomain = "";
  if (matchedRoot && host !== matchedRoot && host.endsWith("." + matchedRoot)) {
    subdomain = host.slice(0, -(matchedRoot.length + 1));
    if (subdomain === "www") subdomain = "";
  }
  const isPlatformHost = !!matchedRoot || host.endsWith(".vercel.app") || host === "localhost";

  // 1) 기본 서브도메인 → 스토어프런트 (인증 불필요)
  if (subdomain) {
    return NextResponse.rewrite(new URL(`/s/${subdomain}${p}`, request.url));
  }
  // 2) 커스텀 도메인 → 연결된 쇼핑몰 (인증 불필요)
  if (!isPlatformHost) {
    const slug = await resolveCustomDomain(host);
    return slug
      ? NextResponse.rewrite(new URL(`/s/${slug}${p}`, request.url))
      : NextResponse.next({ request });
  }

  // 3) 인증이 필요한 경로만 세션 검증/갱신 (그 외는 빠르게 통과)
  const needsAuth =
    p.startsWith("/dashboard") ||
    p === "/login" ||
    p === "/signup" ||
    p.startsWith("/reset-password") ||
    p.startsWith("/find-email");
  if (!needsAuth) {
    return NextResponse.next({ request });
  }

  // ── Supabase 공식 미들웨어 패턴 ──
  // setAll에서 request를 갱신하고 response를 재생성해야, 갱신된 토큰이
  // 하위 서버컴포넌트로 전달되어 세션이 안 끊긴다(로그인 유지).
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 관리자 컨트롤타워(/dashboard)는 로그인 필요
  if (p.startsWith("/dashboard") && !user) {
    const redirectRes = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.getAll().forEach((c) => redirectRes.cookies.set(c));
    return redirectRes;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|landing|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|html)$).*)",
  ],
};
