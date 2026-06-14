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

  // ── Supabase 세션 갱신(쿠키 동기화) ──
  // 주의: /dashboard는 강제 로그인 리다이렉트 안 함 — 테스트/관리 편의로 자유 열람.
  //       실제 데이터 쓰기/저장은 Supabase RLS(소유자 한정)가 막아준다.
  await updateSession(request, response);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|landing|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|html)$).*)",
  ],
};
