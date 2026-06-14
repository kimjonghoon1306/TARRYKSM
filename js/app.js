/* ════════════════════════════════════════
   app.js — 부트스트랩
════════════════════════════════════════ */
(function init(){
  applyLang();          // 셸 다국어 적용 (기본 ko)
  renderIntroSkins();   // 인트로 스킨 칩
  wireNav();            // 네비 이벤트 연결
  updateMallCount();    // 쇼핑몰 카운트
  renderStudio();       // 첫 뷰 미리 렌더 (입장 시 즉시 표시)

  tickClock();
  setInterval(tickClock, 30000);
})();
