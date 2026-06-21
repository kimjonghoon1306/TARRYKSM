/* ════════════════════════════════════════
   studio.js — 스킨 스튜디오 · 내 쇼핑몰 · 생성 모달
════════════════════════════════════════ */
let activeSkin = 'mono';     // 스튜디오에서 미리보는 스킨
// 보고 있는 화면 폭에 맞춰 미리보기 기본 디바이스 결정 (모바일이면 '모바일' 먼저)
let deviceMode = (typeof window !== 'undefined' && window.innerWidth <= 760) ? 'mobile' : 'desktop';
let createSkin = 'mono';     // 생성 모달에서 고른 스킨
const malls = [];            // 생성된 쇼핑몰 [{name, skin}]

/* ── 스튜디오 뷰 ── */
// 스킨 카드 하나
function skinCardHTML(s){
  return `
    <div class="sk-card ${s.id===activeSkin?'active':''}" onclick="applySkin('${s.id}')">
      <div class="sk-mini" data-skin="${s.id}">${buildMini(s.id)}</div>
      <div class="sk-meta">
        <span class="skm-em">${skinThumb(s.id) ? `<img class="skm-em-img" src="${skinThumb(s.id)}" alt="">` : s.emoji}</span>
        <span class="sk-meta-t"><b>${s.name}</b><i>${s.vibe}</i></span>
      </div>
    </div>`;
}

function renderStudio(){
  // 느낌별 카테고리로 묶어서 갤러리 렌더
  const groups = SKIN_GROUPS.map(g=>{
    const cards = g.ids.map(id=>SKIN_BY_ID[id]).filter(Boolean).map(skinCardHTML).join('');
    return `<div class="skin-group">
      <h4 class="skin-group-h">${g.label}<span>${g.ids.length}</span></h4>
      <div class="skin-gallery">${cards}</div>
    </div>`;
  }).join('');

  document.getElementById('view').innerHTML = `
    <div class="view-head">
      <div class="vh-eyebrow">${T('st_eyebrow')}</div>
      <h1 class="vh-title">${T('st_title')}</h1>
      <p class="vh-desc">${T('st_desc')}</p>
    </div>

    <div class="preview-stage">
      <div class="ps-bar">
        <div class="ps-now">
          <span class="ps-swatch" data-skin="${activeSkin}" style="background:var(--s-brand)"></span>
          <div>
            <div class="ps-name" id="psName"></div>
            <div class="ps-vibe" id="psVibe"></div>
          </div>
        </div>
        <div class="ps-tools">
          <div class="dev-toggle">
            <button id="devD" class="${deviceMode==='desktop'?'on':''}" onclick="setDevice('desktop')">🖥 데스크탑</button>
            <button id="devM" class="${deviceMode==='mobile'?'on':''}" onclick="setDevice('mobile')">📱 모바일</button>
          </div>
          <button class="btn solid" onclick="openCreate(activeSkin)">${T('st_use')}</button>
        </div>
      </div>
      <div class="device ${deviceMode}" id="device">
        <div class="device-screen" id="deviceScreen"></div>
      </div>
    </div>

    <div class="gallery-head">
      <h3>${T('st_gallery')}</h3><span>${T('st_gallery_sub')}</span>
    </div>
    ${groups}`;

  const screen = document.getElementById('deviceScreen');
  if(screen) mountStore(screen, activeSkin);
  updatePsBar();
}

function applySkin(id){
  activeSkin = id;
  const screen = document.getElementById('deviceScreen');
  if(screen) mountStore(screen, id);
  document.querySelectorAll('.sk-card').forEach(c=>c.classList.remove('active'));
  document.querySelector(`.sk-card .sk-mini[data-skin="${id}"]`)?.closest('.sk-card')?.classList.add('active');
  document.querySelector('.ps-swatch')?.setAttribute('data-skin', id);
  updatePsBar();
}

function updatePsBar(){
  const s = SKIN_BY_ID[activeSkin];
  const n = document.getElementById('psName'); const v = document.getElementById('psVibe');
  if(n) n.textContent = `${s.emoji} ${s.name}`;
  if(v) v.textContent = s.vibe;
}

function setDevice(mode){
  deviceMode = mode;
  const dev = document.getElementById('device');
  if(dev) dev.className = 'device ' + mode;
  document.getElementById('devD')?.classList.toggle('on', mode==='desktop');
  document.getElementById('devM')?.classList.toggle('on', mode==='mobile');
}

/* ── 내 쇼핑몰 뷰 ── */
function renderMalls(){
  const view = document.getElementById('view');
  let body;
  if(!currentUserObj){
    body = `<div class="empty">
      <div class="empty-ico">🔑</div>
      <h3>로그인하고 내 쇼핑몰을 만들어보세요</h3>
      <p>로그인하면 만든 쇼핑몰이 저장돼 어디서든 이어집니다</p>
      <button class="btn solid" style="margin-top:16px" onclick="openAuthPopup()">로그인 / 회원가입</button>
    </div>`;
  } else if(malls.length === 0){
    body = `<div class="empty">
      <div class="empty-ico">🏬</div>
      <h3>${T('ml_empty_t')}</h3>
      <p>${T('ml_empty_s')}</p>
    </div>`;
  } else {
    body = `<div class="mall-grid">` + malls.map((m,i)=>{
      const s = SKIN_BY_ID[m.skin] || SKINS[0];
      return `<div class="mall-card" onclick="openEditor(${i})">
        <div class="sk-mini" data-skin="${m.skin}">${buildMini(m.skin)}</div>
        <div class="mc-foot">
          <span class="skm-em">${skinThumb(s.id) ? `<img class="skm-em-img" src="${skinThumb(s.id)}" alt="">` : s.emoji}</span>
          <span class="mc-info"><b>${m.name}</b><i>${s.name} · ${s.vibe}</i></span>
          <span class="mc-edit">${T('ml_edit')} ↗</span>
        </div>
      </div>`;
    }).join('') + `</div>`;
  }
  view.innerHTML = `
    <div class="view-head">
      <div class="vh-eyebrow">MY STORES</div>
      <h1 class="vh-title">${T('ml_title')}</h1>
      <p class="vh-desc">${T('ml_sub')}</p>
    </div>${body}`;
}

/* ── 쇼핑몰 편집기 (풀스크린 슬라이드업) ── */
let editingIndex = -1;

function openEditor(i){
  if(window.needLogin && window.needLogin()) return;   // 비로그인 → 로그인 팝업
  editingIndex = i;
  const m = malls[i];
  if(!m) return;
  document.getElementById('edName').value = m.name;
  renderEditorSkins();
  renderEditorPreview();
  document.getElementById('editorScrim').classList.add('on');
  document.body.style.overflow = 'hidden';
}
function closeEditor(){
  document.getElementById('editorScrim').classList.remove('on');
  document.body.style.overflow = '';
  editingIndex = -1;
}
function renderEditorSkins(){
  const m = malls[editingIndex];
  document.getElementById('edSkinList').innerHTML = SKINS.map(s=>`
    <button class="ed-skin ${s.id===m.skin?'on':''}" onclick="editorSetSkin('${s.id}')">
      <span class="es-sw" data-skin="${s.id}" style="background:var(--s-brand)"></span>
      <span class="es-meta"><b>${s.emoji} ${s.name}</b><i>${s.vibe}</i></span>
    </button>`).join('');
}
function renderEditorPreview(){
  const m = malls[editingIndex];
  mountStore(document.getElementById('edPreview'), m.skin, m.name);
}
function editorSetSkin(id){
  if(!malls[editingIndex]) return;
  malls[editingIndex].skin = id;   // 실시간 반영
  renderEditorSkins();
  renderEditorPreview();
}
async function saveEditor(){
  if(window.needLogin && window.needLogin()){ closeEditor(); return; }  // 비로그인 → 로그인 팝업
  const m = malls[editingIndex];
  if(m){
    const nm = (document.getElementById('edName').value || '').trim();
    if(nm) m.name = nm;
    if(SB_ENABLED && m.id){
      try{ await dbUpdateStore(m.id, { name:m.name, skin:m.skin }); }
      catch(e){ toast('⚠️ 저장 실패: ' + (e.message || '')); }
    }
  }
  closeEditor();
  renderMalls();
  toast(`💾 ${T('toast_saved')}`);
}

/* ── 준비중 뷰 ── */
function renderSoon(label){
  document.getElementById('view').innerHTML = `
    <div class="soon">
      <div class="soon-ico">🚧</div>
      <h2>${label} — ${T('soon_t')}</h2>
      <p>${T('soon_s')}</p>
    </div>`;
}

/* ── 생성 모달 ── */
function renderSkinPick(){
  document.getElementById('skinPick').innerHTML = SKINS.map(s=>`
    <div class="sp-opt ${s.id===createSkin?'sel':''}" onclick="pickSkin('${s.id}')">
      <div class="sp-swatch" data-skin="${s.id}" style="background:var(--s-brand)"></div>
      <div class="sp-name">${s.name}</div>
    </div>`).join('');
}
function pickSkin(id){
  createSkin = id;
  document.querySelectorAll('.sp-opt').forEach(o=>o.classList.remove('sel'));
  document.querySelector(`.sp-opt .sp-swatch[data-skin="${id}"]`)?.closest('.sp-opt')?.classList.add('sel');
}
function openCreate(preset){
  if(preset) createSkin = preset;
  renderSkinPick();
  document.getElementById('createModal').classList.add('on');
}
function closeCreate(){ document.getElementById('createModal').classList.remove('on'); }

async function createMall(){
  if(!currentUserObj){ closeCreate(); openAuthPopup(); return; }   // 비로그인 → 로그인/회원가입 팝업
  const inp = document.getElementById('mallName');
  const name = (inp.value || '').trim();
  if(!name){ inp.style.borderColor = 'var(--danger)'; inp.focus(); return; }

  if(SB_ENABLED){
    if(!currentUserObj){ closeCreate(); openAuthPopup(); return; }
    try{
      const store = await dbCreateStore(name, createSkin);
      malls.unshift(store);
    }catch(e){ toast('⚠️ 저장 실패: ' + (e.message || '')); return; }
  } else {
    malls.push({ name, skin: createSkin });
  }

  inp.value = ''; inp.style.borderColor = '';
  closeCreate();
  updateMallCount();
  switchView('malls');
  toast(`🏬 <b>${name}</b> ${T('toast_made')}`);
}

/* 로그인/로그아웃 시 호출 — DB에서 쇼핑몰 다시 로드 */
async function reloadStores(){
  if(!SB_ENABLED) return;
  malls.length = 0;
  if(currentUserObj){
    try{ const list = await dbListStores(); malls.push(...list); }
    catch(e){ console.error('stores load', e); }
  }
  updateMallCount();
  if(currentView === 'malls') renderMalls();
}

function updateMallCount(){
  const el = document.getElementById('mallCount');
  if(el) el.textContent = malls.length;
}

/* 인트로 스킨 칩 */
function renderIntroSkins(){
  const el = document.getElementById('introSkins');
  if(!el) return;
  el.innerHTML = SKINS.map(s=>`
    <button onclick="enterApp('${s.id}')" style="display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:600;color:var(--txt-2);padding:7px 13px;border:1px solid var(--line-2);border-radius:99px;background:var(--surf);transition:.2s">
      <span data-skin="${s.id}" style="width:12px;height:12px;border-radius:50%;background:var(--s-brand)"></span>${s.name}
    </button>`).join('');
}
