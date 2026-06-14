import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 이미지 업로드(서버액션) 기본 1MB 한도 → 10MB로 (로고·배너·상품사진)
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
  async rewrites() {
    return {
      // 필터/페이지보다 먼저 검사 → 루트(/)는 시네마틱 대문(정적)을 서빙.
      // /login·/signup·/dashboard·/s/[slug] 등은 그대로 Next.js가 처리.
      beforeFiles: [{ source: "/", destination: "/landing/index.html" }],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
