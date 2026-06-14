/* ════════════════════════════════════════
   i18n.js — 셸 다국어 (ko·en 완역, 그 외 en 폴백)
════════════════════════════════════════ */
const I18N = {
  ko:{
    new_mall:'새 쇼핑몰', new_sub:'무제한 생성',
    cap_build:'BUILD', cap_run:'OPERATE',
    nav_studio:'스킨 스튜디오', nav_malls:'내 쇼핑몰', nav_products:'상품',
    nav_orders:'주문', nav_customers:'고객', nav_analytics:'분석', nav_settings:'설정',
    user_name:'최고관리자', user_online:'온라인', to_landing:'대문',
    search_ph:'상품 · 주문 · 스킨 검색',
    cm_title:'새 쇼핑몰 만들기', cm_sub:'이름을 짓고 스킨을 고르면 끝',
    cm_name:'쇼핑몰 이름', cm_skin:'스킨 선택', cm_cancel:'취소', cm_create:'＋ 생성하기',
    // 스튜디오 뷰
    st_eyebrow:'SKIN STUDIO', st_title:'한 번의 클릭으로 <em>브랜드 전체</em>를 바꾸다',
    st_desc:'색·서체·라운드·무드까지 통째로 갈아입는 14가지 스킨. 같은 상품도 완전히 다른 매장이 됩니다.',
    st_apply:'이 스킨 적용', st_applied:'적용됨', st_gallery:'스킨 갤러리', st_gallery_sub:'카드를 누르면 위 미리보기가 바뀝니다',
    st_use:'이 스킨으로 쇼핑몰 만들기',
    ml_title:'내 쇼핑몰', ml_sub:'운영 중인 매장을 한눈에',
    ml_empty_t:'아직 만든 쇼핑몰이 없어요', ml_empty_s:'좌측 상단 “새 쇼핑몰”으로 1분 만에 시작하세요',
    ml_edit:'편집', ml_live:'운영중',
    ed_close:'닫기', ed_save:'저장', ed_skins:'스킨', ed_pick:'스킨을 눌러 실시간으로 바꿔보세요',
    soon_t:'준비 중인 기능이에요', soon_s:'스킨 스튜디오가 먼저 — 운영 기능은 순차 오픈됩니다',
    toast_made:'쇼핑몰이 생성됐어요', toast_skin:'스킨 적용:', toast_saved:'저장됐어요',
  },
  en:{
    new_mall:'New Store', new_sub:'Unlimited',
    cap_build:'BUILD', cap_run:'OPERATE',
    nav_studio:'Skin Studio', nav_malls:'My Stores', nav_products:'Products',
    nav_orders:'Orders', nav_customers:'Customers', nav_analytics:'Analytics', nav_settings:'Settings',
    user_name:'Super Admin', user_online:'Online', to_landing:'Intro',
    search_ph:'Search products · orders · skins',
    cm_title:'Create a Store', cm_sub:'Name it, pick a skin, done',
    cm_name:'Store name', cm_skin:'Choose a skin', cm_cancel:'Cancel', cm_create:'＋ Create',
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
  },
};

let curLang = 'ko';
const LANG_META = {
  ko:{flag:'🇰🇷',name:'한국어'}, en:{flag:'🇺🇸',name:'English'},
  ja:{flag:'🇯🇵',name:'日本語'}, vi:{flag:'🇻🇳',name:'Tiếng Việt'},
  th:{flag:'🇹🇭',name:'ภาษาไทย'}, id:{flag:'🇮🇩',name:'Indonesia'},
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
}

function toggleLang(e){ e && e.stopPropagation(); document.getElementById('lang').classList.toggle('open'); }
function setLang(code){
  curLang = code;
  document.getElementById('lang').classList.remove('open');
  applyLang();
  if(typeof rerenderView === 'function') rerenderView();
}
document.addEventListener('click', e=>{
  if(!e.target.closest('#lang')) document.getElementById('lang')?.classList.remove('open');
});
