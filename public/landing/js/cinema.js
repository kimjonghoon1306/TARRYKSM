/* ════════════════════════════════════════
   cinema.js — 시네마틱 대문 컨트롤러 (7씬 스토리 · 씬당 타이머 · 자동전환)
   0 고민Hook · 1 브랜드공개 · 2 5분데모 · 3 스킨/증식 · 4 원클릭변환 · 5 기능 · 6 CTA
   (Claude 디자인모드 Story 7씬을 단축 이식 + 기존 매장증식 흡수)
════════════════════════════════════════ */
const CINE = [
  { key:'hook',      d:4000 },
  { key:'brand',     d:4000 },
  { key:'demo',      d:7000 },
  { key:'skins',     d:7000 },
  { key:'transform', d:6500 },
  { key:'features',  d:5000 },
  { key:'cta',       d:5000 },
];
let cineIdx = 0;
let cineTimer = null;
let cineStarted = false;

/* 진행바 6분할 */
function buildCineProgress(){
  const el = document.getElementById('cineProg');
  if(!el) return;
  el.innerHTML = CINE.map((_,i)=>`<div class="seg" onclick="cineGo(${i})"><span class="seg-fill"></span></div>`).join('');
}

/* 무한분양 씬 — 업종별로 통일된 미니 "쇼핑몰"이 대량 증식해 둥둥 떠다님
   (핵심: 한 카드 = 한 업종 상품 + 매장 헤더바 → 사진 모음이 아니라 진짜 쇼핑몰처럼) */
function buildCineMalls(){
  const el = document.getElementById('cineMalls');
  if(!el) return;
  const P = (n)=> `/landing/img/products/${n}.webp`;
  const F = (n)=> `/landing/img/food/${n}.webp`;
  // 업종(테마)별 상품 묶음 — 한 매장은 한 테마 안에서만 상품을 보여줌
  const THEMES = [
    [P('sneaker'),P('tote'),P('cap'),P('dress'),P('knit'),P('coat'),P('scarf'),P('backpack')],        // 패션
    [P('serum'),P('perfume'),P('lipstick'),P('cushion'),P('mascara'),P('sunscreen'),P('cleanser'),P('handcream')], // 뷰티
    [P('candle'),P('mug'),P('vase'),P('rug'),P('plant'),P('diffuser'),P('moodlamp'),P('pillow')],      // 리빙
    [P('earbuds'),P('keyboard'),P('camera'),P('speaker'),P('smartwatch'),P('mouse'),P('charger')],     // 테크
    [P('watch'),P('sunglasses'),P('necklace'),P('wallet'),P('earring'),P('ring'),P('bracelet'),P('belt')], // 액세서리
    [F('produce_broccoli'),F('produce_carrot'),F('produce_spinach'),F('produce_mushroom'),F('produce_garlic')], // 농산물
    [F('fruit_strawberry'),F('fruit_apple'),F('fruit_grape'),F('fruit_peach'),F('fruit_mango'),F('fruit_tangerine')], // 과일
    [F('bakery_croissant'),F('bakery_bread'),F('bakery_baguette'),F('bakery_cookie'),F('bakery_cupcake')], // 베이커리
    [F('meat_beef'),F('meat_porkbelly'),F('meat_chicken'),F('meat_sausage'),F('meat_striploin')],     // 정육
    [F('gourmet_wine'),F('gourmet_chocolate'),F('gourmet_cheeseplatter'),F('gourmet_oliveoil'),F('gourmet_teaset')], // 고메
    [F('dairy_milk'),F('dairy_cheese'),F('dairy_yogurt'),F('dairy_butter'),F('dairy_icecream')],      // 유제품
    [F('seafood_prawn'),F('seafood_oyster'),F('seafood_squid'),F('seafood_hairtail'),F('seafood_myeongnan')] // 수산
  ];
  const N = 30;                                        // 처음 14개 → 30개로 대폭 증식
  const NV = 6;                                        // 매장 레이아웃 6변형 (전부 헤더바 있는 쇼핑몰 형태)
  let html = '';
  for(let i=0;i<N;i++){
    const hue = Math.round((360/N)*i);
    const d  = (i*0.04).toFixed(2);                    // 빠른 캐스케이드
    const fd = (1.2 + (i%7)*0.18).toFixed(2);          // 등장 후 제각각 떠다니기 시작
    const fdur = (3.6 + (i%5)*0.5).toFixed(2);
    const v = i % NV;
    const theme = THEMES[i % THEMES.length];           // 이 매장의 업종
    const e = (k)=> `<img class="cm-img" src="${theme[(i + k) % theme.length]}" alt="" loading="lazy">`;
    // 매장 상단바(로고+장바구니) — 모든 카드가 진짜 쇼핑몰 헤더처럼 보이도록
    const BAR   = `<div class="cm-bar"><span class="cm-blogo"></span><span class="cm-bcart"></span></div>`;
    const BARSM = `<div class="cm-bar cm-bar-sm"><span class="cm-blogo"></span><span class="cm-bcart"></span></div>`;
    const HERO  = `<div class="cm-hero"><span class="cm-hbadge"></span><span class="cm-hline"></span></div>`;
    let inner;
    if(v===0){            // 클래식: 바 + 배너 + 타일2
      inner = `${BAR}<div class="cm-body">${HERO}<div class="cm-tiles"><i>${e(0)}</i><i>${e(1)}</i></div></div>`;
    } else if(v===1){     // 카탈로그: 바 + 타일4(2×2)
      inner = `${BAR}<div class="cm-body"><div class="cm-tiles cm-4"><i>${e(0)}</i><i>${e(1)}</i><i>${e(2)}</i><i>${e(3)}</i></div></div>`;
    } else if(v===2){     // 배너형: 바 + 큰 히어로(상품) + 와이드 타일
      inner = `${BAR}<div class="cm-body cm-banner"><div class="cm-hero cm-hero-lg"><b>${e(0)}</b></div><div class="cm-tiles cm-wide"><i>${e(1)}</i></div></div>`;
    } else if(v===3){     // 브랜드형: 바 + 로고/라인 + 타일2
      inner = `${BARSM}<div class="cm-body"><div class="cm-brand"><span class="cm-dot"></span><span class="cm-lines"><i></i><i></i></span></div><div class="cm-tiles"><i>${e(0)}</i><i>${e(1)}</i></div></div>`;
    } else if(v===4){     // 리스트형: 바 + 가로 행 3 (검색바 느낌)
      inner = `${BARSM}<div class="cm-body"><div class="cm-rows"><span>${e(0)}</span><span>${e(1)}</span><span>${e(2)}</span></div></div>`;
    } else {              // 갤러리형: 바 + 배너 + 타일3
      inner = `${BAR}<div class="cm-body">${HERO}<div class="cm-tiles cm-3"><i>${e(0)}</i><i>${e(1)}</i><i>${e(2)}</i></div></div>`;
    }
    html += `<div class="cine-mall cm-v${v}" style="--h:${hue}deg;--d:${d}s;--fd:${fd}s;--fdur:${fdur}s">${inner}</div>`;
  }
  el.innerHTML = html;
}

/* 현재 씬 진행바 채우기 (지난 칸 full, 현재 칸 duration 동안 0→100%) */
function updateCineProgress(idx){
  document.querySelectorAll('#cineProg .seg').forEach((seg,k)=>{
    const fill = seg.querySelector('.seg-fill');
    if(k < idx){ fill.style.transition='none'; fill.style.width='100%'; }
    else if(k === idx){
      fill.style.transition='none'; fill.style.width='0%';
      void fill.offsetWidth;                         // 리플로우 강제 → 애니 재시작
      fill.style.transition = `width ${CINE[idx].d}ms linear`;
      fill.style.width = '100%';
    } else { fill.style.transition='none'; fill.style.width='0%'; }
  });
}

/* 씬 전환 */
function cineGo(i){
  if(i < 0 || i >= CINE.length) return;
  clearTimeout(cineTimer);
  cineIdx = i;

  document.querySelectorAll('#cineScenes .scene').forEach((s,k)=> s.classList.toggle('on', k===i));
  updateCineProgress(i);

  const dur = CINE[i].d;
  cineTimer = setTimeout(()=> (i < CINE.length-1 ? cineGo(i+1) : cineEnter()), dur);
}

/* 시네마틱 완전 정지 — 씬/스테이지 정리(앱 위에 레이어가 남아 클릭 가로채는 것 방지) */
function stopCinema(){
  clearTimeout(cineTimer);
  document.querySelectorAll('#cineScenes .scene').forEach(s=> s.classList.remove('on'));
  const stage = document.getElementById('cineStore');
  if(stage) stage.className = 'cine-store-stage';
}

/* 스킵 / CTA / 자동입장 → 앱 진입 */
function cineEnter(){
  stopCinema();
  enterApp();
}

/* 대문으로 돌아왔을 때 처음부터 다시 재생 */
function replayCinema(){
  clearTimeout(cineTimer);
  if(!document.querySelector('#cineProg .seg')){ buildCineProgress(); buildCineMalls(); }
  cineGo(0);
}

/* 커서 패럴랙스(레이어 깊이감) + 마그네틱 CTA — 대기업 인터랙티브 마감 */
function setupCineFx(){
  const intro = document.getElementById('intro');
  if(!intro || intro._fx) return; intro._fx = true;
  let raf = null, tx = 0, ty = 0;
  intro.addEventListener('mousemove', (e)=>{
    if(intro.classList.contains('gone')) return;
    const r = intro.getBoundingClientRect();
    tx = ((e.clientX - r.left)/r.width) * 2 - 1;     // -1 ~ 1
    ty = ((e.clientY - r.top)/r.height) * 2 - 1;
    if(!raf) raf = requestAnimationFrame(()=>{
      intro.style.setProperty('--px', tx.toFixed(3));
      intro.style.setProperty('--py', ty.toFixed(3));
      raf = null;
    });
  });
  intro.addEventListener('mouseleave', ()=>{
    intro.style.setProperty('--px', 0); intro.style.setProperty('--py', 0);
  });
  // 마그네틱: 커서가 버튼 위를 지날 때 살짝 끌려옴 (translate=개별속성→entrance transform과 충돌X)
  const cta = intro.querySelector('.fin-cta');
  if(cta){
    cta.addEventListener('mousemove', (e)=>{
      const r = cta.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width/2)) * .28;
      const dy = (e.clientY - (r.top + r.height/2)) * .4;
      cta.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
    });
    cta.addEventListener('mouseleave', ()=>{ cta.style.translate = '0 0'; });
  }
}

/* 시작 */
function startCinema(){
  if(cineStarted) return;
  cineStarted = true;
  // 모션 최소화 선호 시 곧장 진입
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    enterApp(); return;
  }
  buildCineProgress();
  buildCineMalls();
  setupCineFx();
  cineGo(0);
}
