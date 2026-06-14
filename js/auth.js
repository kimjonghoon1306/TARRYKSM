/* ════════════════════════════════════════
   auth.js — 로그인/회원가입/비밀번호찾기 모달 + 관리자 패널
   SB_ENABLED(=Supabase 키 설정) 일 때만 활성화.
   authMode: 'login' | 'signup' | 'reset' | 'newpw'
════════════════════════════════════════ */
let authMode = 'login';
let currentUserObj = null;

function openAuth(mode){
  if(!SB_ENABLED){ toast('⚙️ js/supabase.js 에 Supabase 키를 먼저 넣어주세요'); return; }
  authMode = mode || 'login';
  renderAuth();
  document.getElementById('authModal').classList.add('on');
  setTimeout(()=> (document.getElementById(authMode==='newpw'?'authPw':'authEmail'))?.focus(), 60);
}
function closeAuth(){ document.getElementById('authModal').classList.remove('on'); }
function switchAuthMode(m){ authMode = m; renderAuth(); }

function renderAuth(){
  const meta = {
    login:  { t:'로그인',      s:'내 쇼핑몰을 불러옵니다',   btn:'로그인',          name:false, email:true,  pw:true,  forgot:true,  pwLbl:'비밀번호' },
    signup: { t:'회원가입',    s:'이메일로 1분 만에 시작',   btn:'가입하기',        name:true,  email:true,  pw:true,  forgot:false, pwLbl:'비밀번호' },
    reset:  { t:'비밀번호 찾기',s:'재설정 링크를 메일로 보냅니다', btn:'재설정 메일 보내기', name:false, email:true,  pw:false, forgot:false, pwLbl:'비밀번호' },
    newpw:  { t:'새 비밀번호 설정', s:'새 비밀번호를 입력하세요', btn:'비밀번호 변경',  name:false, email:false, pw:true,  forgot:false, pwLbl:'새 비밀번호' },
  }[authMode];

  document.getElementById('authTitle').textContent = meta.t;
  document.getElementById('authSub').textContent   = meta.s;
  document.getElementById('authSubmit').textContent = meta.btn;
  document.getElementById('authNameRow').style.display  = meta.name  ? 'block' : 'none';
  document.getElementById('authEmailRow').style.display = meta.email ? 'block' : 'none';
  document.getElementById('authPwRow').style.display    = meta.pw    ? 'block' : 'none';
  document.getElementById('authForgot').style.display   = meta.forgot? 'block' : 'none';
  document.getElementById('authPwLbl').textContent = meta.pwLbl;

  const sw = document.getElementById('authSwitch');
  if(authMode === 'login')      sw.innerHTML = `계정이 없으세요? <a onclick="switchAuthMode('signup')">회원가입</a>`;
  else if(authMode === 'signup')sw.innerHTML = `이미 계정이 있으세요? <a onclick="switchAuthMode('login')">로그인</a>`;
  else if(authMode === 'reset') sw.innerHTML = `<a onclick="switchAuthMode('login')">← 로그인으로 돌아가기</a>`;
  else                          sw.innerHTML = '';

  const err = document.getElementById('authErr'); err.textContent = ''; err.style.color = 'var(--danger)';
}

async function submitAuth(){
  const email = document.getElementById('authEmail').value.trim();
  const pw    = document.getElementById('authPw').value;
  const name  = document.getElementById('authName').value.trim();
  const err   = document.getElementById('authErr');
  const btn   = document.getElementById('authSubmit');
  const setBusy = (b)=>{ btn.disabled = b; };

  try{
    setBusy(true); btn.textContent = '처리 중…';

    if(authMode === 'reset'){
      if(!email){ throw { message:'이메일을 입력하세요' }; }
      const { error } = await sbResetPassword(email);
      if(error) throw error;
      err.style.color = 'var(--ok)';
      err.textContent = '재설정 메일을 보냈어요. 메일의 링크를 눌러주세요.';
      setBusy(false); btn.textContent = '재설정 메일 보내기';
      return;
    }

    if(authMode === 'newpw'){
      if(pw.length < 6){ throw { message:'비밀번호는 6자 이상이어야 해요' }; }
      const { error } = await sbUpdatePassword(pw);
      if(error) throw error;
      closeAuth(); toast('🔒 비밀번호가 변경됐어요');
      return;
    }

    if(!email || !pw){ throw { message:'이메일과 비밀번호를 입력하세요' }; }
    const res = authMode === 'login'
      ? await sbSignIn(email, pw)
      : await sbSignUp(email, pw, name || email.split('@')[0]);
    if(res.error) throw res.error;

    if(authMode === 'signup' && !res.data.session){
      err.style.color = 'var(--ok)';
      err.textContent = '확인 메일을 보냈어요. 메일 인증 후 로그인하세요.';
      setBusy(false); btn.textContent = '가입하기';
      return;
    }
    closeAuth(); toast('👋 환영합니다');
  }catch(e){
    err.style.color = 'var(--danger)';
    err.textContent = authErrMsg(e);
    setBusy(false);
    renderAuth(); // 버튼 텍스트 원복
  }
}

function authErrMsg(e){
  const m = (e && e.message) || '';
  if(/Invalid login/i.test(m))        return '이메일 또는 비밀번호가 올바르지 않아요';
  if(/already registered/i.test(m))   return '이미 가입된 이메일이에요';
  if(/at least 6/i.test(m))           return '비밀번호는 6자 이상이어야 해요';
  if(/Email not confirmed/i.test(m))  return '메일 인증을 먼저 완료해주세요';
  if(/rate limit|too many/i.test(m))  return '잠시 후 다시 시도해주세요';
  return m || '오류가 발생했어요';
}

async function doLogout(){
  try{ await sbSignOut(); }catch(e){}
  toast('로그아웃 되었어요');
}

/* ── 인증 상태 → 레일 푸터 + 쇼핑몰 갱신 ── */
function reflectAuth(event, user){
  // 비밀번호 복구 링크로 진입 → 새 비밀번호 설정 모달
  if(event === 'PASSWORD_RECOVERY'){
    currentUserObj = user;
    openAuth('newpw');
    return;
  }
  currentUserObj = user;
  const foot = document.getElementById('railFoot');
  if(SB_ENABLED && foot){
    if(user){
      const name = (user.user_metadata && user.user_metadata.display_name) || user.email.split('@')[0];
      foot.innerHTML = `<div class="rf-av">${name[0].toUpperCase()}</div>
        <div class="rf-id"><b>${name}</b><i><span class="rf-dot"></span>${user.email}</i></div>
        <button class="rf-out" onclick="doLogout()" title="로그아웃">⏻</button>`;
    } else {
      foot.innerHTML = `<button class="rf-login" onclick="openAuth('login')">🔑 로그인 / 회원가입</button>`;
    }
  }
  if(typeof reloadStores === 'function') reloadStores();
}

function initAuth(){
  if(!SB_ENABLED) return;            // 데모 모드: 정적 푸터 유지
  sbOnAuth(reflectAuth);
  sbUser().then(u => reflectAuth('INITIAL', u)).catch(()=>{});
}

/* ════════════════════════════════════════
   관리자 패널 (상단 🎛️) — 계정 · 몰 · 플랫폼
════════════════════════════════════════ */
function openAdmin(){
  renderAdmin();
  document.getElementById('adminModal').classList.add('on');
}
function closeAdmin(){ document.getElementById('adminModal').classList.remove('on'); }

function renderAdmin(){
  const body = document.getElementById('adminBody');

  if(!SB_ENABLED){
    body.innerHTML = `<div class="adm-note">백엔드(Supabase) 연결 후 사용할 수 있어요.<br>현재는 데모 모드입니다.</div>`;
    return;
  }
  if(!currentUserObj){
    body.innerHTML = `<div class="adm-note">관리자 패널은 로그인이 필요합니다.
      <button class="btn solid" style="margin-top:14px;width:100%" onclick="closeAdmin();openAuth('login')">로그인 / 회원가입</button></div>`;
    return;
  }

  const u = currentUserObj;
  const name = (u.user_metadata && u.user_metadata.display_name) || u.email.split('@')[0];
  const count = (typeof malls !== 'undefined') ? malls.length : 0;
  body.innerHTML = `
    <div class="adm-acct">
      <div class="adm-av">${name[0].toUpperCase()}</div>
      <div class="adm-acct-id"><b>${name}</b><span>${u.email}</span></div>
      <span class="adm-role">창업자</span>
    </div>
    <div class="adm-grid">
      <div class="adm-card"><b>${count}</b><span>내 쇼핑몰</span></div>
      <div class="adm-card"><b>FREE</b><span>요금제</span></div>
    </div>
    <div class="adm-sec">운영</div>
    <div class="adm-list">
      <button class="adm-item" onclick="closeAdmin();switchView('malls')">🏬 내 쇼핑몰 관리<i>${count}개</i></button>
      <button class="adm-item" onclick="closeAdmin();switchView('soon','상품')">📦 상품 관리<i>준비중</i></button>
      <button class="adm-item" onclick="closeAdmin();switchView('soon','주문')">🧾 주문 관리<i>준비중</i></button>
    </div>
    <div class="adm-sec">계정</div>
    <div class="adm-list">
      <button class="adm-item" onclick="closeAdmin();openAuth('reset')">🔒 비밀번호 변경<i>메일</i></button>
      <button class="adm-item adm-danger" onclick="doLogout();closeAdmin()">⏻ 로그아웃</button>
    </div>`;
}
