import { NextResponse, type NextRequest } from "next/server";
import { updateSession, resolveCustomDomain } from "@/lib/supabase/middleware";

// Next.js 16: 'middleware' 컨벤션이 'proxy'로 변경됨
export async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const host = (request.headers.get("host") || "").toLowerCase().split(":")[0];
  const root = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000")
    .toLowerCase()
    .split(":")[0];

  // ── 서브도메인 추출 (myshop.onjongil.com → "myshop") ──
  let subdomain = "";
  if (host && host !== root && host.endsWith("." + root)) {
    subdomain = host.slice(0, -(root.length + 1));
    if (subdomain === "www") subdomain = "";
  }

  // 플랫폼 자체 호스트 (루트/서브도메인/프리뷰/로컬) — 커스텀 도메인 아님
  const isPlatformHost =
    host === root ||
    host.endsWith("." + root) ||
    host.endsWith(".vercel.app") ||
    host === "localhost";

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
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|landing|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|html)$).*)",
  ],
};
