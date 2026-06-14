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

/* 무한분양 씬 — 스킨 수만큼 색이 다른 미니 매장 증식 */
function buildCineMalls(){
  const el = document.getElementById('cineMalls');
  if(!el) return;
  const emo = ['🕯️','👟','🧴','👜','⌚','🎧','🕶️','☕','🧢','🌿','💄','📷','🎒','🕰️'];
  const N = 14;
  let html = '';
  for(let i=0;i<N;i++){
    const hue = Math.round((360/N)*i);
    const d = (i*0.05).toFixed(2);
    const a = emo[i%emo.length], b = emo[(i+5)%emo.length];
    html += `<div class="cine-mall" style="--h:${hue}deg;--d:${d}s">
      <div class="cm-bar"></div>
      <div class="cm-body"><div class="cm-hero"></div><div class="cm-tiles"><i>${a}</i><i>${b}</i></div></div>
    </div>`;
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
  cineGo(0);
}
