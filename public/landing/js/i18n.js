/* ════════════════════════════════════════
   i18n.js — 셸 다국어 (ko·en 완역, 그 외 en 폴백)
════════════════════════════════════════ */
const I18N = {
  ko:{
    new_mall:'새 쇼핑몰', new_sub:'원클릭 제작',
    cap_build:'BUILD', cap_run:'OPERATE',
    nav_studio:'스킨 스튜디오', nav_malls:'내 쇼핑몰', nav_products:'상품',
    nav_orders:'주문', nav_customers:'고객', nav_analytics:'분석', nav_pricing:'요금제', nav_settings:'설정',
    user_name:'최고관리자', user_online:'온라인', to_landing:'대문',
    search_ph:'상품 · 주문 · 스킨 검색',
    cm_title:'새 쇼핑몰 만들기', cm_sub:'이름을 짓고 스킨을 고르면 끝',
    cm_name:'쇼핑몰 이름', cm_skin:'스킨 선택', cm_cancel:'취소', cm_create:'＋ 생성하기',
    au_title:'로그인이 필요해요', au_sub:'구경은 자유롭게! 만들기·저장은 로그인 후 이용할 수 있어요',
    au_desc:'회원가입하면 만든 쇼핑몰이 저장되어 어디서든 이어서 작업할 수 있어요.',
    au_login:'🔑 로그인', au_signup:'＋ 회원가입',
    // 스튜디오 뷰
    st_eyebrow:'SKIN STUDIO', st_title:'한 번의 클릭으로 <em>브랜드 전체</em>를 바꾸다',
    st_desc:'색·서체·라운드·무드까지 통째로 갈아입는 28가지 스킨. 같은 상품도 완전히 다른 매장이 됩니다.',
    st_apply:'이 스킨 적용', st_applied:'적용됨', st_gallery:'스킨 갤러리', st_gallery_sub:'카드를 누르면 위 미리보기가 바뀝니다',
    st_use:'이 스킨으로 쇼핑몰 만들기',
    ml_title:'내 쇼핑몰', ml_sub:'운영 중인 매장을 한눈에',
    ml_empty_t:'아직 만든 쇼핑몰이 없어요', ml_empty_s:'좌측 상단 “새 쇼핑몰”으로 1분 만에 시작하세요',
    ml_edit:'편집', ml_live:'운영중',
    ed_close:'닫기', ed_save:'저장', ed_skins:'스킨', ed_pick:'스킨을 눌러 실시간으로 바꿔보세요',
    soon_t:'준비 중인 기능이에요', soon_s:'스킨 스튜디오가 먼저 — 운영 기능은 순차 오픈됩니다',
    toast_made:'쇼핑몰이 생성됐어요', toast_skin:'스킨 적용:', toast_saved:'저장됐어요',
    // 시네마틱 인트로(대문)
    cine_hook1:'쇼핑몰', cine_hook2:'만들고 싶다', cine_hook3:'어디서부터<em>…?</em>',
    cine_brandtag:'하나의 브랜드를 — <em>퍼스널하게</em>',
    cine_demotitle:'<b>5분</b>이면 누구나', cine_dbnew:'＋ 새 쇼핑몰',
    prod_candle:'소이 캔들', prod_sneaker:'스니커즈', prod_serum:'세럼',
    prod_tote:'토트백', prod_watch:'워치', prod_earbuds:'이어버즈',
    cine_skinscap:'<b>28가지</b> 스킨 · 누구나 퍼스널 쇼핑몰',
    cine_tftitle:'한 클릭으로 <em>브랜드 전체</em>를 바꾸다', cine_tfbtn:'컬렉션 보기 →',
    cine_fttitle:'더 스마트하게 운영',
    ft_coupon_t:'쿠폰·적립', ft_coupon_s:'할인·포인트로 단골 만들기',
    ft_grade_t:'회원 등급', ft_grade_s:'VIP부터 등급제 관리',
    ft_bot_t:'나만의 챗봇', ft_bot_s:'고객 응대 자동화',
    ft_store_t:'퍼스널 쇼핑몰', ft_store_s:'5분이면 오픈 완성',
    cine_fintitle:'지금 시작하세요', cine_fincta:'제작하기 <span>→</span>', cine_finauto:'자동 입장',
    cine_skip:'건너뛰기 <span>→</span>',
  },
  en:{
    new_mall:'New Store', new_sub:'One-click',
    cap_build:'BUILD', cap_run:'OPERATE',
    nav_studio:'Skin Studio', nav_malls:'My Stores', nav_products:'Products',
    nav_orders:'Orders', nav_customers:'Customers', nav_analytics:'Analytics', nav_pricing:'Pricing', nav_settings:'Settings',
    user_name:'Super Admin', user_online:'Online', to_landing:'Intro',
    search_ph:'Search products · orders · skins',
    cm_title:'Create a Store', cm_sub:'Name it, pick a skin, done',
    cm_name:'Store name', cm_skin:'Choose a skin', cm_cancel:'Cancel', cm_create:'＋ Create',
    au_title:'Login required', au_sub:'Browse freely — creating & saving needs login',
    au_desc:'Sign up and your stores are saved so you can pick up anywhere.',
    au_login:'🔑 Log in', au_signup:'＋ Sign up',
    st_eyebrow:'SKIN STUDIO', st_title:'Reskin your <em>entire brand</em> in one click',
    st_desc:'14 skins swap color, type, radius and mood all at once. The same products become a totally different store.',
    st_apply:'Apply skin', st_applied:'Applied', st_gallery:'Skin Gallery', st_gallery_sub:'Tap a card to update the preview',
    st_use:'Build a store with this skin',
    ml_title:'My Stores', ml_sub:'All your shops at a glance',
    ml_empty_t:'No stores yet', ml_empty_s:'Hit “New Store” top-left to start in a minute',
    ml_edit:'Edit', ml_live:'Live',
    ed_close:'Close', ed_save:'Save', ed_skins:'Skin', ed_pick:'Tap a skin to switch live',
    soon_t:'Coming soon', soon_s:'Skin Studio first — operations roll out next',
    toast_made:'Store created', toast_skin:'Skin applied:', toast_saved:'Saved',
    cine_hook1:'My own', cine_hook2:'online store', cine_hook3:'but where to<em> start…?</em>',
    cine_brandtag:'One brand — <em>made personal</em>',
    cine_demotitle:'Anyone, in <b>5 minutes</b>', cine_dbnew:'＋ New store',
    prod_candle:'Soy Candle', prod_sneaker:'Sneakers', prod_serum:'Serum',
    prod_tote:'Tote Bag', prod_watch:'Watch', prod_earbuds:'Earbuds',
    cine_skinscap:'<b>28</b> skins · a personal store for anyone',
    cine_tftitle:'Reskin your <em>entire brand</em> in one click', cine_tfbtn:'View collection →',
    cine_fttitle:'Operate smarter',
    ft_coupon_t:'Coupons & Points', ft_coupon_s:'Turn buyers into regulars',
    ft_grade_t:'Member Tiers', ft_grade_s:'Manage VIPs & tiers',
    ft_bot_t:'Your own chatbot', ft_bot_s:'Automate customer support',
    ft_store_t:'Personal storefront', ft_store_s:'Open in 5 minutes',
    cine_fintitle:'Start now', cine_fincta:'Build it <span>→</span>', cine_finauto:'Auto-entering',
    cine_skip:'Skip <span>→</span>',
  },
};

let curLang = 'ko';
// 저장된 언어 복원(쿠키 → localStorage) — 페이지 새로고침/대시보드 이동에도 유지
try {
  const _m = document.cookie.match(/(?:^|;\s*)lang=(ko|en)/);
  const _s = (_m && _m[1]) || localStorage.getItem('lang');
  if (_s === 'en' || _s === 'ko') curLang = _s;
} catch (e) {}
const LANG_META = {
  ko:{flag:'🇰🇷',name:'한국어'}, en:{flag:'🇺🇸',name:'English'},
};

/* 번역 조회 (없으면 en → ko 폴백) */
function T(key){
  const dict = I18N[curLang] || I18N.en;
  return dict[key] ?? I18N.en[key] ?? I18N.ko[key] ?? key;
}

function applyLang(){
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    el.innerHTML = T(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el=>{
    el.placeholder = T(el.dataset.i18nPh);
  });
  const m = LANG_META[curLang] || LANG_META.ko;
  const f = document.getElementById('langFlag'); const n = document.getElementById('langName');
  if(f) f.textContent = m.flag; if(n) n.textContent = m.name;
  const introF = document.getElementById('introLangFlag');   // 시네마틱 인트로 상단 토글
  if(introF) introF.textContent = m.flag;
}

function toggleLang(e){ e && e.stopPropagation(); document.getElementById('lang').classList.toggle('open'); }
/* 인트로 상단 토글 — 언어가 2개뿐이라 클릭하면 순환(ko↔en) */
function cycleLang(){
  const order = Object.keys(LANG_META);
  const i = order.indexOf(curLang);
  setLang(order[(i + 1) % order.length]);
}
function setLang(code){
  curLang = code;
  // 대시보드(Next.js)까지 전달되도록 쿠키로 저장 + 로컬에도 보존
  try {
    document.cookie = 'lang=' + code + ';path=/;max-age=31536000;samesite=lax';
    localStorage.setItem('lang', code);
  } catch (e) {}
  document.getElementById('lang')?.classList.remove('open');
  applyLang();
  if(typeof rerenderView === 'function') rerenderView();
}
document.addEventListener('click', e=>{
  if(!e.target.closest('#lang')) document.getElementById('lang')?.classList.remove('open');
});
