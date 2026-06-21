import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { resolveCustomDomain } from "@/lib/supabase/middleware";
import { toSessionCookie } from "@/lib/supabase/cookies";
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
            response.cookies.set(name, value, toSessionCookie(options))
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── 1시간 비활성 자동 로그아웃 ──
  // 인증 쿠키는 세션 쿠키(브라우저/탭을 닫으면 삭제)라 "페이지를 끄면 로그아웃"은 자동.
  // 플랫폼 안에서 탭을 오가는 동안엔 매 요청마다 'la'(마지막 활동 시각)를 갱신해 로그인 유지.
  // 다만 마지막 활동 후 1시간이 지나면 강제 로그아웃한다.
  const IDLE_MS = 60 * 60 * 1000; // 1시간
  if (user) {
    const la = parseInt(request.cookies.get("la")?.value || "0", 10);
    if (la && Date.now() - la > IDLE_MS) {
      // 1시간 이상 아무 활동 없음 → 인증·활동 쿠키 모두 만료시키고 로그인으로
      const timeoutRes = NextResponse.redirect(new URL("/login?timeout=1", request.url));
      request.cookies.getAll().forEach((c) => {
        if (c.name.startsWith("sb-") || c.name === "la") {
          timeoutRes.cookies.set(c.name, "", { maxAge: 0, path: "/" });
        }
      });
      return timeoutRes;
    }
    // 활동 시각 갱신(세션 쿠키 — 브라우저를 닫으면 함께 삭제됨)
    response.cookies.set("la", String(Date.now()), { path: "/", sameSite: "lax", httpOnly: true });
  }

  // 관리자 컨트롤타워(/dashboard)는 로그인 필요.
  // 단, 요금제(/dashboard/plan)는 비로그인도 둘러볼 수 있게 예외 처리.
  const publicDash = p === "/dashboard/plan";
  if (p.startsWith("/dashboard") && !publicDash && !user) {
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
