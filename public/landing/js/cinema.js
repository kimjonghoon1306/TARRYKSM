/* ════════════════════════════════════════
   cinema.js — 시네마틱 대문 컨트롤러 (6씬 · 씬당 타이머 · 자동전환)
   0 로고 · 1 골격 · 2 상품 · 3 360°스킨 · 4 무한분양 · 5 피날레
════════════════════════════════════════ */
const CINE = [
  { key:'logo',     d:3500 },
  { key:'build',    d:3500 },
  { key:'fill',     d:3500 },
  { key:'spin',     d:3500 },
  { key:'multiply', d:3500 },
  { key:'finale',   d:4500 },
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

/* 무한분양 씬 — 색뿐 아니라 레이아웃(모양)까지 다양한 미니 매장 증식 */
function buildCineMalls(){
  const el = document.getElementById('cineMalls');
  if(!el) return;
  const IMG = [
    '/landing/img/products/candle.webp','/landing/img/products/sneaker.webp','/landing/img/products/serum.webp',
    '/landing/img/products/tote.webp','/landing/img/products/watch.webp','/landing/img/products/earbuds.webp',
    '/landing/img/products/sunglasses.webp','/landing/img/products/mug.webp','/landing/img/products/cap.webp',
    '/landing/img/products/plant.webp','/landing/img/food/fruit_apple.webp','/landing/img/food/fruit_strawberry.webp',
    '/landing/img/food/bakery_bread.webp','/landing/img/food/bakery_croissant.webp','/landing/img/food/seafood_hairtail.webp',
    '/landing/img/food/meat_beef.webp','/landing/img/food/produce_broccoli.webp','/landing/img/food/dairy_milk.webp',
    '/landing/img/food/gourmet_wine.webp','/landing/img/food/traditional_kimchi.webp'
  ];
  const N = 14;
  let html = '';
  for(let i=0;i<N;i++){
    const hue = Math.round((360/N)*i);
    const d = (i*0.05).toFixed(2);
    const v = i % 6;                                   // 6가지 레이아웃 변형
    const e = (k)=> `<img class="cm-img" src="${IMG[(i*3+k) % IMG.length]}" alt="">`;
    let inner;
    if(v===0){            // 클래식: 바 + 히어로 + 타일2
      inner = `<div class="cm-bar"></div><div class="cm-body"><div class="cm-hero"></div><div class="cm-tiles"><i>${e(0)}</i><i>${e(1)}</i></div></div>`;
    } else if(v===1){     // 카탈로그: 바 + 타일4(2×2)
      inner = `<div class="cm-bar"></div><div class="cm-body"><div class="cm-tiles cm-4"><i>${e(0)}</i><i>${e(1)}</i><i>${e(2)}</i><i>${e(3)}</i></div></div>`;
    } else if(v===2){     // 배너형: 큰 히어로 + 와이드 타일
      inner = `<div class="cm-body cm-banner"><div class="cm-hero cm-hero-lg"><b>${e(0)}</b></div><div class="cm-tiles cm-wide"><i>${e(1)}</i></div></div>`;
    } else if(v===3){     // 브랜드형: 둥근 로고 + 라인 + 타일2
      inner = `<div class="cm-body"><div class="cm-brand"><span class="cm-dot"></span><span class="cm-lines"><i></i><i></i></span></div><div class="cm-tiles"><i>${e(0)}</i><i>${e(1)}</i></div></div>`;
    } else if(v===4){     // 리스트형: 얇은 바 + 가로 행 3
      inner = `<div class="cm-bar cm-bar-sm"></div><div class="cm-body"><div class="cm-rows"><span>${e(0)}</span><span>${e(1)}</span><span>${e(2)}</span></div></div>`;
    } else {              // 풀블리드: 큰 단일 상품 + 하단 캡션바
      inner = `<div class="cm-body cm-solo"><div class="cm-big">${e(0)}</div><div class="cm-cap"></div></div>`;
    }
    html += `<div class="cine-mall cm-v${v}" style="--h:${hue}deg;--d:${d}s">${inner}</div>`;
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

  // 씬1~3는 공유 빌드 스테이지의 상태를 바꿈
  const stage = document.getElementById('cineStore');
  const state = {1:'build', 2:'fill', 3:'spin'}[i];
  stage.className = state ? `cine-store-stage show ${state}` : 'cine-store-stage';

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
