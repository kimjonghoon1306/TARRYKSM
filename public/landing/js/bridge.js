/* ════════════════════════════════════════
   bridge.js — 정적 대문(구경 모드) ↔ Next.js 백엔드 연결
   기존 인페이지 인증(auth.js/supabase.js) 대신, 실제 동작은
   Next.js 라우트(/login · /signup · /dashboard)로 보낸다.
   대문은 "구경만" — 스킨 갤러리/디바이스 프리뷰는 그대로 둘러보고,
   실제로 쓸 사람은 좌하단 로그인/회원가입으로 진입.
════════════════════════════════════════ */
window.SB_ENABLED = false;      // 인페이지 백엔드 비활성 (데모/구경 모드)
window.currentUserObj = null;

/* 관리자 전용 컨트롤타워 — 모든 진입은 관리자 로그인으로 */
window.openAuth = function () { location.href = '/login'; };
window.openAdmin = function () { location.href = '/dashboard'; };

/* 새 쇼핑몰 만들기 / 스킨 사용하기 → 관리자 로그인 (구경만, 관리는 로그인 후) */
window.openCreate = function () { location.href = '/login'; };

/* app.js init이 호출 — 인페이지 인증 없음 */
window.initAuth = function () {};
