/* ════════════════════════════════════════
   auth.js — 로그인/회원가입 모달 + 앱 인증 상태 연결
   SB_ENABLED(=Supabase 키 설정) 일 때만 활성화.
════════════════════════════════════════ */
let authMode = 'login';      // 'login' | 'signup'
let currentUserObj = null;

function openAuth(mode){
  if(!SB_ENABLED){ toast('⚙️ js/supabase.js 에 Supabase 키를 먼저 넣어주세요'); return; }
  authMode = mode || 'login';
  renderAuth();
  document.getElementById('authModal').classList.add('on');
  setTimeout(()=> document.getElementById('authEmail')?.focus(), 60);
}
function closeAuth(){ document.getElementById('authModal').classList.remove('on'); }
function switchAuthMode(m){ authMode = m; renderAuth(); }

function renderAuth(){
  const isLogin = authMode === 'login';
  document.getElementById('authTitle').textContent = isLogin ? '로그인' : '회원가입';
  document.getElementById('authSub').textContent   = isLogin ? '내 쇼핑몰을 불러옵니다' : '이메일로 1분 만에 시작';
  document.getElementById('authNameRow').style.display = isLogin ? 'none' : 'block';
  document.getElementById('authSubmit').textContent = isLogin ? '로그인' : '가입하기';
  document.getElementById('authSwitch').innerHTML = isLogin
    ? `계정이 없으세요? <a onclick="switchAuthMode('signup')">회원가입</a>`
    : `이미 계정이 있으세요? <a onclick="switchAuthMode('login')">로그인</a>`;
  const err = document.getElementById('authErr'); err.textContent = ''; err.style.color = 'var(--danger)';
}

async function submitAuth(){
  const email = document.getElementById('authEmail').value.trim();
  const pw    = document.getElementById('authPw').value;
  const name  = document.getElementById('authName').value.trim();
  const err   = document.getElementById('authErr');
  if(!email || !pw){ err.textContent = '이메일과 비밀번호를 입력하세요'; return; }
  const btn = document.getElementById('authSubmit');
  btn.disabled = true; btn.textContent = '처리 중…';
  try{
    const res = authMode === 'login'
      ? await sbSignIn(email, pw)
      : await sbSignUp(email, pw, name || email.split('@')[0]);
    if(res.error) throw res.error;
    if(authMode === 'signup' && !res.data.session){
      err.style.color = 'var(--ok)';
      err.textContent = '확인 메일을 보냈어요. 메일 인증 후 로그인하세요.';
      btn.disabled = false; btn.textContent = '가입하기';
      return;
    }
    closeAuth();
    toast('👋 환영합니다');
  }catch(e){
    err.style.color = 'var(--danger)';
    err.textContent = authErrMsg(e);
    btn.disabled = false; btn.textContent = authMode === 'login' ? '로그인' : '가입하기';
  }
}

function authErrMsg(e){
  const m = (e && e.message) || '';
  if(/Invalid login/i.test(m))        return '이메일 또는 비밀번호가 올바르지 않아요';
  if(/already registered/i.test(m))   return '이미 가입된 이메일이에요';
  if(/at least 6/i.test(m))           return '비밀번호는 6자 이상이어야 해요';
  if(/Email not confirmed/i.test(m))  return '메일 인증을 먼저 완료해주세요';
  return m || '오류가 발생했어요';
}

async function doLogout(){
  try{ await sbSignOut(); }catch(e){}
  toast('로그아웃 되었어요');
}

/* 인증 상태 → 레일 푸터 갱신 + 쇼핑몰 다시 로드 */
function reflectAuth(user){
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
  if(!SB_ENABLED) return;          // 데모 모드: 정적 푸터 유지
  sbOnAuth(reflectAuth);
  sbUser().then(reflectAuth).catch(()=>{});
}
