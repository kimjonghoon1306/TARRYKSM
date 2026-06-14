// 플랫폼 루트 도메인들. host 헤더는 punycode(ASCII)로 오므로 ASCII로 적는다.
// 환경변수에 의존하지 않도록 코드에 직접 명시 (여기에 추가만 하면 인식됨).
export const PLATFORM_ROOTS = [
  "on.xn--zk5biyyw.com", // = on.온종일.com (한글도메인 punycode)
  "tarryksm-chi.vercel.app",
  "localhost",
];

// 화면 표시용 기본 도메인 (예쁜 한글)
export const PRIMARY_DOMAIN = "on.온종일.com";
