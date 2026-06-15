/* ════════════════════════════════════════
   store.js — 라이브 스토어프런트 (스킨 토큰 + 실제 쇼핑 동작)
   장바구니 · 상품상세 · 카테고리 필터 · 검색 · 위시리스트
   각 프리뷰 컨테이너(box)에 독립 상태(_ss)를 붙여 구동한다.
   상태는 데모용 — 백엔드 연동 시 cart/favs/products를 API로 교체.
════════════════════════════════════════ */

/* ── 상태 헬퍼 ── */
function cartCount(st){ return st.cart.reduce((n,c)=>n+c.qty,0); }
function cartTotal(st){ return st.cart.reduce((s,c)=>s+st.products[c.i].p*c.qty,0); }
function visibleProducts(st){
  const q = st.q.trim().toLowerCase();
  const list = st.products.map((p,i)=>({p,i}))
    .filter(({p}) => st.cat==='전체' || st.cat==='ALL' || p.cat===st.cat)
    .filter(({p}) => !q || p.n.toLowerCase().includes(q) || p.b.toLowerCase().includes(q) || p.cat.includes(q));
  const by = {
    reco: (a,b)=> a.i-b.i,
    low:  (a,b)=> a.p.p-b.p.p,
    high: (a,b)=> b.p.p-a.p.p,
    new:  (a,b)=> (b.p.tag==='NEW') - (a.p.tag==='NEW') || a.i-b.i,
    rating:(a,b)=> b.p.r-a.p.r || a.i-b.i,
  };
  return list.sort(by[st.sort] || by.reco);
}

/* 연관 상품 — 같은 카테고리 우선, 부족하면 다른 상품으로 채움 (자기 제외) */
function relatedProducts(st, i, n=3){
  const P = st.products, cur = P[i];
  const same = P.map((p,j)=>({p,j})).filter(o=>o.j!==i && o.p.cat===cur.cat);
  const rest = P.map((p,j)=>({p,j})).filter(o=>o.j!==i && o.p.cat!==cur.cat);
  return same.concat(rest).slice(0,n);
}

/* ── 마크업 조각 ── */
function productCard(p,i,st){
  const fav = st.favs.has(i);
  return `<div class="pcard" data-act="open" data-i="${i}">
    <div class="pc-media">
      ${p.tag ? `<span class="pc-badge">${p.tag}</span>` : ''}
      <span class="pc-fav ${fav?'on':''}" data-act="fav" data-i="${i}">${fav?'♥':'♡'}</span>
      <span class="pc-emoji">${p.e}</span>
    </div>
    <div class="pc-body">
      <div class="pc-brand">${p.b}</div>
      <div class="pc-name">${p.n}</div>
      <div class="pc-rating"><span class="pc-stars">${stars(p.r)}</span><span>${p.r} <i>(${p.rc})</i></span></div>
      <div class="pc-bottom">
        <span class="pc-price">${won(p.p)}</span>
        <span class="pc-add" data-act="add" data-i="${i}">＋</span>
      </div>
    </div>
  </div>`;
}

function gridHTML(st){
  const items = visibleProducts(st);
  if(!items.length){
    return `<div class="st-empty-grid"><span>🫥</span><b>검색 결과가 없어요</b><i>다른 키워드나 카테고리로 찾아보세요</i></div>`;
  }
  return items.map(({p,i})=>productCard(p,i,st)).join('');
}

function railHTML(st){
  return st.cats.map(c=>`<span class="rail-chip ${c===st.cat?'on':''}" data-act="filter" data-cat="${c}">${c}</span>`).join('');
}

const SORTS = [['reco','추천'],['low','낮은가격'],['high','높은가격'],['new','신상'],['rating','별점순']];
function sortHTML(st){
  return SORTS.map(([k,l])=>`<button class="sh-sort-b ${k===st.sort?'on':''}" data-act="sort" data-sort="${k}">${l}</button>`).join('');
}

function cartHTML(st){
  const head = `<div class="cp-head"><b>장바구니 <i>${cartCount(st)}</i></b><button class="cp-x" data-act="close">✕</button></div>`;
  if(!st.cart.length){
    return head + `<div class="cp-empty"><span>🛒</span><b>장바구니가 비었어요</b><button class="cp-shop" data-act="close">쇼핑하러 가기</button></div>`;
  }
  const rows = st.cart.map(c=>{
    const p = st.products[c.i];
    return `<div class="cp-row">
      <div class="cp-thumb">${p.e}</div>
      <div class="cp-info"><b>${p.n}</b><span>${won(p.p)}</span></div>
      <div class="cp-qty">
        <button data-act="dec" data-i="${c.i}">−</button>
        <em>${c.qty}</em>
        <button data-act="inc" data-i="${c.i}">＋</button>
      </div>
      <button class="cp-del" data-act="remove" data-i="${c.i}" aria-label="삭제">✕</button>
    </div>`;
  }).join('');
  const foot = `<div class="cp-foot">
    <div class="cp-sum"><span>합계</span><b>${won(cartTotal(st))}</b></div>
    <button class="cp-checkout" data-act="checkout">결제하기 →</button>
  </div>`;
  return head + `<div class="cp-body">${rows}</div>` + foot;
}

function detailHTML(i,st){
  const p = st.products[i];
  const fav = st.favs.has(i);
  const qty = st.dqty;
  const revs = [REVIEWS[i % REVIEWS.length], REVIEWS[(i+3) % REVIEWS.length]];
  const reviewHTML = revs.map(rv=>`<div class="dp-rev">
      <div class="dp-rev-top"><b>${rv.n}</b><span class="pc-stars">${stars(rv.s)}</span></div>
      <p>${rv.t}</p></div>`).join('');
  const related = relatedProducts(st,i).map(({p:rp,j})=>`<button class="dp-rel" data-act="open" data-i="${j}">
      <span class="dp-rel-em">${rp.e}</span>
      <b>${rp.n}</b>
      <span class="dp-rel-p">${won(rp.p)}</span></button>`).join('');
  return `<button class="dp-x" data-act="close">✕</button>
    <div class="dp-scroll">
      <div class="dp-media">
        ${p.tag ? `<span class="pc-badge">${p.tag}</span>` : ''}
        <span class="dp-emoji">${p.e}</span>
      </div>
      <div class="dp-body">
        <div class="pc-brand">${p.b} · ${p.cat}</div>
        <h3 class="dp-name">${p.n}</h3>
        <div class="dp-rating"><span class="pc-stars">${stars(p.r)}</span><b>${p.r}</b><span>리뷰 ${p.rc}개</span></div>
        <div class="dp-price">${won(p.p)}</div>
        <p class="dp-desc">${p.d || ''}</p>
        <ul class="dp-meta">
          <li><span>배송</span><b>5만원 이상 무료배송</b></li>
          <li><span>혜택</span><b>첫 구매 5% 적립</b></li>
        </ul>

        <div class="dp-sec-t">리뷰 <i>${p.rc}</i></div>
        ${reviewHTML}

        <div class="dp-sec-t">함께 보면 좋은 상품</div>
        <div class="dp-related">${related}</div>
      </div>
    </div>
    <div class="dp-actions">
      <button class="dp-fav ${fav?'on':''}" data-act="fav" data-i="${i}">${fav?'♥':'♡'}</button>
      <div class="dp-qty">
        <button data-act="dq-dec">−</button><em>${qty}</em><button data-act="dq-inc">＋</button>
      </div>
      <button class="dp-add" data-act="add-close" data-i="${i}">담기 · ${won(p.p*qty)}</button>
    </div>`;
}

/* ── 전체 스토어프런트 ── */
function buildStore(st){
  const s = SKIN_BY_ID[st.skin] || SKINS[0];
  const brand = st.brand;
  return `<div class="store" data-skin="${s.id}">
    <div class="st-bar">
      <div class="stb-logo">${brand}</div>
      <nav class="stb-nav"><a data-act="scroll-shelf">신상</a><a data-act="scroll-shelf">베스트</a><a data-act="scroll-shelf">카테고리</a><a data-act="scroll-shelf">이벤트</a></nav>
      <div class="stb-actions">
        <button class="stb-ico" data-act="toggle-search">🔍</button>
        <button class="stb-cart" data-act="open-cart">🛒 <b class="stb-cnt">${cartCount(st)}</b></button>
      </div>
    </div>

    <div class="st-hero">
      <span class="sth-badge">${s.badge}</span>
      <h1 class="sth-title">${s.heroTitle}</h1>
      <p class="sth-sub">${s.heroSub}</p>
      <button class="sth-cta" data-act="scroll-shelf">${s.cta} →</button>
      <div class="sth-art">${s.emoji}</div>
    </div>

    <div class="st-searchbar">
      <span>🔍</span>
      <input type="text" data-act="search-input" placeholder="상품 검색" value="${st.q}">
      <button class="ssb-x" data-act="toggle-search">✕</button>
    </div>

    <div class="st-rail">${railHTML(st)}</div>

    <div class="st-shelf">
      <div class="sh-head"><h3 class="sh-title">이번 주 셀렉션</h3><a data-act="reset">전체보기 →</a></div>
      <div class="sh-sort">${sortHTML(st)}</div>
      <div class="sh-grid">${gridHTML(st)}</div>
    </div>

    <div class="st-promo">
      <b>FREE SHIPPING</b>
      <span>5만원 이상 구매 시 무료배송 · 오늘의 단 하나의 큐레이션</span>
    </div>

    <div class="st-foot">
      <div class="stf-logo">${brand}</div>
      <div class="stf-links"><a>회사소개</a><a>이용약관</a><a>고객센터</a><a>인스타그램</a></div>
      <div class="stf-copy">Powered by ONJONGIL · 무한분양 · ${s.name} skin</div>
    </div>

    <!-- 오버레이: 스크림 · 장바구니 드로어 · 상품상세 -->
    <div class="st-overlay" data-act="close"></div>
    <aside class="st-cart-panel"></aside>
    <section class="st-detail-panel"></section>
  </div>`;
}

/* ════════════════════════════════════════
   라이브 컨트롤러 — box(컨테이너)에 마운트
════════════════════════════════════════ */
function mountStore(box, skinId, brandOverride){
  const s = SKIN_BY_ID[skinId] || SKINS[0];
  const theme = themeFor(s.id);
  const st = { box, skin:s.id, brand:brandOverride||s.brand, products:theme.items, cats:theme.cats, cart:[], cat:theme.cats[0], sort:'reco', q:'', search:false, favs:new Set(), detailIdx:-1, dqty:1 };
  box._ss = st;
  box.style.overflow = '';        // 이전 오버레이 lock 잔존 방지
  box.innerHTML = buildStore(st);
  st.root = box.querySelector('.store');
  if(!box._storeBound){
    box.addEventListener('click', onStoreClick);
    box.addEventListener('input', onStoreInput);
    box._storeBound = true;
  }
  return st;
}

function onStoreClick(e){
  const st = e.currentTarget._ss; if(!st) return;
  const a = e.target.closest('[data-act]'); if(!a) return;
  const i = a.dataset.i != null ? +a.dataset.i : null;
  switch(a.dataset.act){
    case 'add':        e.stopPropagation(); addToCart(st,i,1); bumpCart(st); storeToast(st,`🛒 <b>${st.products[i].n}</b> 담았어요`); break;
    case 'add-close':  addToCart(st,i,st.dqty); closeOverlay(st); bumpCart(st); storeToast(st,`🛒 <b>${st.products[i].n}</b> ${st.dqty}개 담았어요`); break;
    case 'open':       openDetail(st,i); break;
    case 'fav':        e.stopPropagation(); toggleFav(st,i); break;
    case 'filter':     st.cat = a.dataset.cat; refreshGrid(st); break;
    case 'sort':       st.sort = a.dataset.sort; refreshGrid(st); break;
    case 'reset':      st.cat='전체'; st.sort='reco'; st.q=''; setSearch(st,false); refreshGrid(st); refreshSearchInput(st); break;
    case 'toggle-search': setSearch(st, !st.search); break;
    case 'open-cart':  openCart(st); break;
    case 'inc':        changeQty(st,i,1); break;
    case 'dec':        changeQty(st,i,-1); break;
    case 'remove':     removeItem(st,i); break;
    case 'dq-inc':     st.dqty++; refreshDetailQty(st); break;
    case 'dq-dec':     st.dqty = Math.max(1, st.dqty-1); refreshDetailQty(st); break;
    case 'checkout':   checkout(st); break;
    case 'scroll-shelf': st.root.querySelector('.st-shelf')?.scrollIntoView({behavior:'smooth',block:'start'}); break;
    case 'close':      closeOverlay(st); break;
  }
}

function onStoreInput(e){
  const st = e.currentTarget._ss; if(!st) return;
  if(e.target.matches('[data-act="search-input"]')){ st.q = e.target.value; refreshGrid(st); }
}

/* ── 그리드 / 칩 / 검색 ── */
function refreshGrid(st){
  const g = st.root.querySelector('.sh-grid'); if(g) g.innerHTML = gridHTML(st);
  st.root.querySelectorAll('.st-rail .rail-chip').forEach(c=>c.classList.toggle('on', c.dataset.cat===st.cat));
  st.root.querySelectorAll('.sh-sort-b').forEach(b=>b.classList.toggle('on', b.dataset.sort===st.sort));
}
function refreshSearchInput(st){
  const inp = st.root.querySelector('[data-act="search-input"]'); if(inp) inp.value = st.q;
}
function setSearch(st, on){
  st.search = on;
  st.root.classList.toggle('search-on', on);
  const inp = st.root.querySelector('[data-act="search-input"]');
  if(on){ inp?.focus(); }
  else if(st.q){ st.q=''; if(inp) inp.value=''; refreshGrid(st); }
}

/* ── 위시리스트 ── */
function toggleFav(st,i){
  if(st.favs.has(i)) st.favs.delete(i); else st.favs.add(i);
  const on = st.favs.has(i);
  st.root.querySelectorAll(`[data-act="fav"][data-i="${i}"]`).forEach(h=>{
    h.classList.toggle('on', on); h.textContent = on ? '♥' : '♡';
  });
}

/* ── 장바구니 ── */
function addToCart(st,i,qty=1){
  const it = st.cart.find(c=>c.i===i);
  if(it) it.qty += qty; else st.cart.push({i, qty});
  refreshCart(st);
}
function refreshDetailQty(st){
  const d = st.root.querySelector('.st-detail-panel'); if(d) d.innerHTML = detailHTML(st.detailIdx, st);
}
function changeQty(st,i,d){
  const it = st.cart.find(c=>c.i===i); if(!it) return;
  it.qty += d;
  if(it.qty<=0) st.cart = st.cart.filter(c=>c.i!==i);
  refreshCart(st);
}
function removeItem(st,i){ st.cart = st.cart.filter(c=>c.i!==i); refreshCart(st); }
function refreshCart(st){
  const p = st.root.querySelector('.st-cart-panel'); if(p) p.innerHTML = cartHTML(st);
  const c = st.root.querySelector('.stb-cnt'); if(c) c.textContent = cartCount(st);
}
function bumpCart(st){
  const c = st.root.querySelector('.stb-cart'); if(!c) return;
  c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
}
function checkout(st){
  const n = cartCount(st), total = won(cartTotal(st));
  if(!n) return;
  st.cart = [];
  const c = st.root.querySelector('.stb-cnt'); if(c) c.textContent = 0;
  const p = st.root.querySelector('.st-cart-panel');
  p.innerHTML = `<div class="cp-head"><b>주문 완료</b><button class="cp-x" data-act="close">✕</button></div>
    <div class="cp-done">
      <span>✅</span>
      <b>주문이 접수됐어요!</b>
      <i>${n}개 · ${total}</i>
      <p>데모 결제입니다. 실제 결제·주문은 백엔드(창업자별 PG) 연동 후 동작해요.</p>
      <button class="cp-shop" data-act="close">계속 쇼핑하기</button>
    </div>`;
}

/* ── 오버레이(드로어 · 상세) ── */
function lockFrame(st){
  st.box.scrollTop = 0;
  st.box.style.overflow = 'hidden';
  const h = st.box.clientHeight + 'px';
  st.root.querySelectorAll('.st-overlay,.st-cart-panel,.st-detail-panel').forEach(el=>{
    el.style.top = '0'; el.style.height = h;
  });
}
function unlockFrame(st){ st.box.style.overflow = ''; }
function openCart(st){
  refreshCart(st);
  lockFrame(st);
  st.root.classList.add('cart-on');
}
function openDetail(st,i){
  st.detailIdx = i; st.dqty = 1;
  const d = st.root.querySelector('.st-detail-panel'); if(d){ d.innerHTML = detailHTML(i,st); d.scrollTop = 0; }
  st.root.querySelector('.dp-scroll')?.scrollTo(0,0);
  lockFrame(st);
  st.root.classList.add('detail-on');
}
function storeToast(st, html){
  st.root.querySelector('.st-toast')?.remove();
  const t = document.createElement('div');
  t.className = 'st-toast'; t.innerHTML = html;
  st.root.appendChild(t);
  t.style.top = (st.box.scrollTop + st.box.clientHeight - 64) + 'px';
  clearTimeout(st._toastTimer);
  st._toastTimer = setTimeout(()=> t.remove(), 1900);
}
function closeOverlay(st){
  st.root.classList.remove('cart-on','detail-on');
  unlockFrame(st);
}

/* ── 갤러리/몰카드용 미니 프리뷰 (내부 HTML만 반환) ── */
function buildMini(skinId){
  const s = SKIN_BY_ID[skinId] || SKINS[0];
  const it = themeFor(s.id).items;
  return `
    <div class="skm-top"><span class="skm-logo">${s.brand}</span><span class="skm-dot"></span></div>
    <div class="skm-hero">${s.heroTitle}</div>
    <div class="skm-tiles"><div class="skm-tile">${it[0].e}</div><div class="skm-tile">${it[1].e}</div><div class="skm-tile">${it[2].e}</div></div>
    <span class="skm-pill">${s.cta}</span>`;
}
