import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16: 'middleware' 컨벤션이 'proxy'로 변경됨
export async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const host = (request.headers.get("host") || "").toLowerCase();
  const root = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000").toLowerCase();

  // ── 서브도메인 추출 (myshop.onjongil.com → "myshop") ──
  let subdomain = "";
  if (host && host !== root && host.endsWith("." + root)) {
    subdomain = host.slice(0, -(root.length + 1));
    if (subdomain === "www") subdomain = "";
  }

  // ── 서브도메인이면 스토어프런트로 rewrite ──
  let response: NextResponse;
  if (subdomain) {
    const rewriteUrl = new URL(`/s/${subdomain}${url.pathname}`, request.url);
    response = NextResponse.rewrite(rewriteUrl);
  } else {
    response = NextResponse.next({ request });
  }

  // ── Supabase 세션 갱신(쿠키 동기화) + user ──
  const user = await updateSession(request, response);

  // ── 대시보드는 로그인 필요 (루트 도메인에서만) ──
  if (!subdomain && url.pathname.startsWith("/dashboard") && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
