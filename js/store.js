/* ════════════════════════════════════════
   store.js — 스토어프런트 렌더러 (스킨 토큰만 바뀌면 전체가 변신)
════════════════════════════════════════ */

/* 상품 카드 한 장 */
function productCard(p){
  return `<div class="pcard">
    <div class="pc-media">
      ${p.tag ? `<span class="pc-badge">${p.tag}</span>` : ''}
      <span class="pc-fav">♡</span>
      ${p.e}
    </div>
    <div class="pc-body">
      <div class="pc-brand">${p.b}</div>
      <div class="pc-name">${p.n}</div>
      <div class="pc-bottom">
        <span class="pc-price">${won(p.p)}</span>
        <span class="pc-add">＋</span>
      </div>
    </div>
  </div>`;
}

/* 전체 스토어프런트 — data-skin 으로 브랜드가 결정됨 */
function buildStore(skinId, brandOverride){
  const s = SKIN_BY_ID[skinId] || SKINS[0];
  const brand = brandOverride || s.brand;
  const chips = s.chips.map((c,i)=>`<span class="rail-chip ${i===0?'on':''}">${c}</span>`).join('');
  const grid = PRODUCTS.map(productCard).join('');

  return `<div class="store" data-skin="${s.id}">
    <div class="st-bar">
      <div class="stb-logo">${brand}</div>
      <nav class="stb-nav"><a>신상</a><a>베스트</a><a>카테고리</a><a>이벤트</a></nav>
      <div class="stb-actions">
        <span class="stb-ico">🔍</span>
        <span class="stb-cart">🛒 <b>2</b></span>
      </div>
    </div>

    <div class="st-hero">
      <span class="sth-badge">${s.badge}</span>
      <h1 class="sth-title">${s.heroTitle}</h1>
      <p class="sth-sub">${s.heroSub}</p>
      <a class="sth-cta">${s.cta} →</a>
      <div class="sth-art">${s.emoji}</div>
    </div>

    <div class="st-rail">${chips}</div>

    <div class="st-shelf">
      <div class="sh-head"><h3>이번 주 셀렉션</h3><a>전체보기 →</a></div>
      <div class="sh-grid">${grid}</div>
    </div>

    <div class="st-promo">
      <b>FREE SHIPPING</b>
      <span>5만원 이상 구매 시 무료배송 · 오늘의 단 하나의 큐레이션</span>
    </div>

    <div class="st-foot">
      <div class="stf-logo">${brand}</div>
      <div class="stf-links"><a>회사소개</a><a>이용약관</a><a>고객센터</a><a>인스타그램</a></div>
      <div class="stf-copy">Powered by 온종일 · 무한분양 · ${s.name} skin</div>
    </div>
  </div>`;
}

/* 갤러리/몰카드용 미니 프리뷰 (내부 HTML만 반환) */
function buildMini(skinId){
  const s = SKIN_BY_ID[skinId] || SKINS[0];
  return `
    <div class="skm-top"><span class="skm-logo">${s.brand}</span><span class="skm-dot"></span></div>
    <div class="skm-hero">${s.heroTitle}</div>
    <div class="skm-tiles"><div class="skm-tile">${PRODUCTS[0].e}</div><div class="skm-tile">${PRODUCTS[1].e}</div><div class="skm-tile">${PRODUCTS[2].e}</div></div>
    <span class="skm-pill">${s.cta}</span>`;
}
