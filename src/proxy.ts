import { NextResponse, type NextRequest } from "next/server";
import { updateSession, resolveCustomDomain } from "@/lib/supabase/middleware";
import { PLATFORM_ROOTS } from "@/lib/domains";

// Next.js 16: 'middleware' 컨벤션이 'proxy'로 변경됨
export async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const host = (request.headers.get("host") || "").toLowerCase().split(":")[0];

  // 플랫폼 루트 도메인 목록(코드 명시) + 환경변수 보조
  const envRoot = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "")
    .toLowerCase()
    .split(":")[0];
  const roots = [...PLATFORM_ROOTS, envRoot].filter(Boolean);

  // 이 host에 해당하는 루트 찾기 (host가 root이거나 *.root)
  const matchedRoot = roots.find(
    (r) => host === r || host.endsWith("." + r)
  );

  // ── 서브도메인 추출 (myshop.on.온종일.com → "myshop") ──
  let subdomain = "";
  if (matchedRoot && host !== matchedRoot && host.endsWith("." + matchedRoot)) {
    subdomain = host.slice(0, -(matchedRoot.length + 1));
    if (subdomain === "www") subdomain = "";
  }

  // 플랫폼 자체 호스트 (루트/서브도메인/프리뷰/로컬) — 커스텀 도메인 아님
  const isPlatformHost = !!matchedRoot || host.endsWith(".vercel.app") || host === "localhost";

  // ── 라우팅 결정 ──
  let response: NextResponse;
  if (subdomain) {
    // 기본 서브도메인 → 스토어프런트
    const rewriteUrl = new URL(`/s/${subdomain}${url.pathname}`, request.url);
    response = NextResponse.rewrite(rewriteUrl);
  } else if (!isPlatformHost) {
    // 커스텀 도메인 → 연결된 쇼핑몰로 rewrite (DB 조회)
    const slug = await resolveCustomDomain(host);
    response = slug
      ? NextResponse.rewrite(new URL(`/s/${slug}${url.pathname}`, request.url))
      : NextResponse.next({ request });
  } else {
    response = NextResponse.next({ request });
  }

  // ── Supabase 세션 갱신(쿠키 동기화) + user ──
  const user = await updateSession(request, response);

  // ── 관리자 컨트롤타워(/dashboard)는 로그인 필요 (플랫폼 호스트에서만) ──
  if (isPlatformHost && !subdomain && url.pathname.startsWith("/dashboard") && !user) {
    const redirectRes = NextResponse.redirect(new URL("/login", request.url));
    // updateSession이 갱신한 세션 쿠키를 리다이렉트 응답에도 실어, 세션 유실/튕김 방지
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
