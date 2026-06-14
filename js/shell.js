/* ════════════════════════════════════════
   shell.js — 라우팅 · 테마 · 사이드바 · 시계 · 토스트
════════════════════════════════════════ */
let currentView = 'studio';
let currentSoon = '';

/* 뷰 전환 */
function switchView(view, soonLabel){
  currentView = view;
  if(soonLabel) currentSoon = soonLabel;

  // 레일/탭바 활성화 동기화
  document.querySelectorAll('.rail-link[data-view]').forEach(l=>{
    const match = l.dataset.view === view && (view !== 'soon' || l.dataset.soon === currentSoon);
    l.classList.toggle('active', match);
  });
  document.querySelectorAll('.tab[data-view]').forEach(t=>{
    t.classList.toggle('active', t.dataset.view === view);
  });

  if(view === 'studio') renderStudio();
  else if(view === 'malls') renderMalls();
  else renderSoon(currentSoon || '기능');

  document.getElementById('view').scrollTop = 0;
  // 모바일에서 레일 닫기
  document.getElementById('rail')?.classList.remove('open');
  document.getElementById('navScrim')?.classList.remove('on');
}

function rerenderView(){
  if(currentView === 'studio') renderStudio();
  else if(currentView === 'malls') renderMalls();
  else renderSoon(currentSoon || '기능');
}

/* 네비 클릭 (레일 + 탭바) */
function wireNav(){
  document.querySelectorAll('.rail-link[data-view], .tab[data-view]').forEach(el=>{
    el.addEventListener('click', ()=> switchView(el.dataset.view, el.dataset.soon));
  });
}

/* 모바일 사이드바 */
function toggleMobileNav(){
  document.getElementById('rail').classList.toggle('open');
  document.getElementById('navScrim').classList.toggle('on');
}

/* 테마 */
function toggleTheme(){
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  const ico = next === 'dark' ? '🌙' : '☀️';
  document.querySelectorAll('#themeIco, #introThemeIco').forEach(el => el.textContent = ico);
}

/* 인트로 → 앱 */
function enterApp(skin){
  if(skin) activeSkin = skin;
  document.getElementById('intro').classList.add('gone');
  document.getElementById('app').classList.add('on');
  switchView('studio');
}

/* 토스트 */
let toastTimer;
function toast(html){
  document.querySelector('.toast')?.remove();
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = html;
  document.body.appendChild(t);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> t.remove(), 2800);
}

/* 시계 */
function tickClock(){
  const el = document.getElementById('clock');
  if(!el) return;
  const n = new Date();
  el.textContent = [n.getHours(), n.getMinutes()].map(v=>String(v).padStart(2,'0')).join(':');
}
