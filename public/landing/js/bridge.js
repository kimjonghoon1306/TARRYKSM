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

/* 새 쇼핑몰 만들기 / "이 스킨으로 제작하기" → 그 스킨으로 만들기 화면으로.
   현재 미리보기 중인 스킨을 넘겨서 대시보드에서 이름만 입력하면 생성됨.
   (로그인 안 했으면 /dashboard 게이트가 알아서 /login으로 보냄) */
window.openCreate = function (skin) {
  var s =
    skin ||
    (document.querySelector('.ps-swatch') &&
      document.querySelector('.ps-swatch').getAttribute('data-skin')) ||
    'mono';
  location.href = '/dashboard/stores/new?skin=' + encodeURIComponent(s);
};

/* app.js init이 호출 — 인페이지 인증 없음 */
window.initAuth = function () {};

/* ── 비밀 입구: 로고 5번 연속 클릭 → 관리자 로그인 ──
   (대문에 버튼 노출 없이, 아는 사람만 들어가는 숨은 입구) */
let _adminTaps = 0;
let _adminTimer = null;
window.secretAdmin = function () {
  _adminTaps++;
  clearTimeout(_adminTimer);
  _adminTimer = setTimeout(function () { _adminTaps = 0; }, 1500); // 1.5초 내 연타

  const left = 5 - _adminTaps;
  if (_adminTaps >= 3 && _adminTaps < 5 && typeof toast === 'function') {
    toast('🔑 ' + left + '번 더…');
  }
  if (_adminTaps >= 5) {
    _adminTaps = 0;
    if (typeof toast === 'function') toast('🔓 관리자 로그인');
    setTimeout(function () { location.href = '/login'; }, 250);
  }
};
