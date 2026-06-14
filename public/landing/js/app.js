/* ════════════════════════════════════════
   app.js — 부트스트랩
════════════════════════════════════════ */
(function init(){
  applyLang();          // 셸 다국어 적용 (기본 ko)
  renderIntroSkins();   // 인트로 스킨 칩
  wireNav();            // 네비 이벤트 연결
  initAuth();           // Supabase 인증 상태 연결 (키 없으면 데모 모드)
  updateMallCount();    // 쇼핑몰 카운트
  renderStudio();       // 첫 뷰 미리 렌더 (입장 시 즉시 표시)

  tickClock();
  setInterval(tickClock, 30000);

  // ?studio 또는 #studio 로 들어오면 인트로 건너뛰고 바로 스튜디오로 (관리자 '스튜디오 열기')
  if (/[?&]studio\b/.test(location.search) || location.hash === '#studio') {
    enterApp();
  } else {
    startCinema();      // 시네마틱 대문 시퀀스 시작
  }
})();
