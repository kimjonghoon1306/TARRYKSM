/* ════════════════════════════════════════
   supabase.js — 정적 사이트용 Supabase 연결

   ▼▼▼ 여기 두 값만 채우면 백엔드가 켜집니다 ▼▼▼
   (비워두면 기존 데모/메모리 모드로 그대로 동작 — 사이트 안 깨짐)
   · url  : Supabase → Project Settings → API → Project URL
   · anon : 같은 화면의 'anon public' 키  (service_role 절대 금지!)
════════════════════════════════════════ */
const SB_CONFIG = {
  url:  'https://nvswnasjtnbrmpdetcbv.supabase.co',
  anon: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52c3duYXNqdG5icm1wZGV0Y2J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MTYzNjUsImV4cCI6MjA5Njk5MjM2NX0.1EJZgsAs-lYdy5-d8nHaI1iNZ2qSR3nNKMQLtFKBwRw',
};

const SB_ENABLED = !!(SB_CONFIG.url && SB_CONFIG.anon && window.supabase);
const sb = SB_ENABLED ? window.supabase.createClient(SB_CONFIG.url, SB_CONFIG.anon) : null;

/* ── 인증 ── */
async function sbSignUp(email, password, name){
  return sb.auth.signUp({ email, password, options:{ data:{ display_name:name } } });
}
async function sbSignIn(email, password){
  return sb.auth.signInWithPassword({ email, password });
}
async function sbSignOut(){ return sb.auth.signOut(); }
async function sbUser(){
  if(!SB_ENABLED) return null;
  const { data } = await sb.auth.getUser();
  return data.user;
}
function sbOnAuth(cb){
  if(!SB_ENABLED) return;
  sb.auth.onAuthStateChange((event, session)=> cb(event, session ? session.user : null));
}
/* 비밀번호 재설정 메일 발송 (현재 페이지로 복귀) */
async function sbResetPassword(email){
  return sb.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + window.location.pathname,
  });
}
/* 복구 링크 진입 후 새 비밀번호 설정 */
async function sbUpdatePassword(newPassword){
  return sb.auth.updateUser({ password: newPassword });
}

/* ── 스토어(쇼핑몰) 데이터 레이어 ──
   RLS가 owner=auth.uid() 로 격리. insert 시 owner는 DB default(auth.uid())로 채워짐 */
async function dbListStores(){
  const { data, error } = await sb.from('stores')
    .select('id,name,skin,published,created_at')
    .order('created_at', { ascending:false });
  if(error) throw error;
  return data.map(r => ({ id:r.id, name:r.name, skin:r.skin }));
}
async function dbCreateStore(name, skin){
  const { data, error } = await sb.from('stores')
    .insert({ name, skin }).select('id,name,skin').single();
  if(error) throw error;
  return { id:data.id, name:data.name, skin:data.skin };
}
async function dbUpdateStore(id, patch){
  const { error } = await sb.from('stores').update(patch).eq('id', id);
  if(error) throw error;
}
async function dbDeleteStore(id){
  const { error } = await sb.from('stores').delete().eq('id', id);
  if(error) throw error;
}
