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

/* ── 로그인/회원가입 안내 팝업 ──
   대문(구경 모드)에선 currentUserObj가 항상 비어 있으므로,
   "만들기·저장" 같은 기능 사용 시도는 전부 이 팝업으로 안내한다. */
window.openAuthPopup = function () {
  var m = document.getElementById('authModal');
  if (m) { m.classList.add('on'); }
  else { location.href = '/signup'; } // 팝업 마크업 없으면 회원가입으로 폴백
};
window.closeAuthPopup = function () {
  var m = document.getElementById('authModal');
  if (m) m.classList.remove('on');
};
/* 로그인돼 있으면 false(통과), 아니면 팝업 띄우고 true(차단) */
window.needLogin = function () {
  if (window.currentUserObj) return false;
  window.openAuthPopup();
  return true;
};

/* 새 쇼핑몰 만들기 / "이 스킨으로 제작하기" → 로그인 전엔 안내 팝업.
   로그인 상태면 해당 스킨으로 만들기 화면으로 이동. */
window.openCreate = function (skin) {
  if (window.needLogin()) return;          // 비로그인 → 로그인/회원가입 팝업
  var s =
    skin ||
    (document.querySelector('.ps-swatch') &&
      document.querySelector('.ps-swatch').getAttribute('data-skin')) ||
    'mono';
  location.href = '/dashboard/stores/new?skin=' + encodeURIComponent(s);
};

/* app.js init이 호출 — 인페이지 인증 없음 */
window.initAuth = function () {};

/* ── 비밀 입구: 로고 4번 연속 클릭 → 관리자 로그인 ──
   (대문에 버튼 노출 없이, 아는 사람만 들어가는 숨은 입구) */
let _adminTaps = 0;
let _adminTimer = null;
window.secretAdmin = function () {
  _adminTaps++;
  clearTimeout(_adminTimer);
  _adminTimer = setTimeout(function () { _adminTaps = 0; }, 1500); // 1.5초 내 연타

  const left = 4 - _adminTaps;
  if (_adminTaps >= 2 && _adminTaps < 4 && typeof toast === 'function') {
    toast('🔑 ' + left + '번 더…');
  }
  if (_adminTaps >= 4) {
    _adminTaps = 0;
    if (typeof toast === 'function') toast('🔓 관리자 로그인');
    setTimeout(function () { location.href = '/login?admin=1'; }, 250);  // 관리자 로그인 변형
  }
};
