import type { MetadataRoute } from "next";

const BASE = "https://on.xn--zk5biyyw.com"; // on.온종일.com

// 검색엔진 크롤러 안내 — 대시보드·로그인 등 관리 영역은 색인 제외, 나머지는 허용.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/login", "/signup", "/reset-password", "/find-email", "/api"],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
