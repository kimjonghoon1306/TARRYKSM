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
function persistLang(code){
  // 대시보드(Next.js)가 같은 언어를 보도록 쿠키 + localStorage에 보존
  try {
    document.cookie = 'lang=' + code + ';path=/;max-age=31536000;samesite=lax';
    localStorage.setItem('lang', code);
  } catch (e) {}
}
// 저장된 언어 복원(쿠키 → localStorage) — 페이지 새로고침/대시보드 이동에도 유지
try {
  const _m = document.cookie.match(/(?:^|;\s*)lang=(ko|en)/);
  const _s = (_m && _m[1]) || localStorage.getItem('lang');
  if (_s === 'en' || _s === 'ko') curLang = _s;
} catch (e) {}
persistLang(curLang); // 로드 시 쿠키를 현재 언어로 동기화(옛 캐시로 쿠키 누락돼도 자가복구)
const LANG_META = {
  ko:{flag:'🇰🇷',name:'한국어'}, en:{flag:'🇺🇸',name:'English'},
};

/* 번역 조회 (없으면 en → ko 폴백) */
function T(key){
  const dict = I18N[curLang] || I18N.en;
  return dict[key] ?? I18N.en[key] ?? I18N.ko[key] ?? key;
}

/* ── 스토어 미리보기·스킨 설명 다국어 ──
   한글 원문 → 영어 사전. 영어 모드면 변환, 없으면 원문 폴백(안 깨짐). */
const STORE_EN = {
  // 스킨 설명(vibe)
  '흑백 미니멀 에디토리얼':'B&W minimal editorial','골드 포인트 다크 럭셔리':'Gold-accent dark luxury',
  '파스텔 소프트 큐트':'Pastel soft & cute','비비드 Z세대 팝':'Vivid Gen-Z pop','청량 글래스 블루':'Crisp glass blue',
  '따뜻한 뉴트럴 우드':'Warm neutral wood','네온 사이버 퍼플':'Neon cyber purple','차분한 내추럴 그린':'Calm natural green',
  '딥 네이비 테크 다크':'Deep navy tech dark','코랄 선셋 웜':'Coral sunset warm','라벤더 드리미 소프트':'Lavender dreamy soft',
  '쿨 그레이 프리미엄':'Cool gray premium','비비드 베리 볼드':'Vivid berry bold','스포티 크림슨 액티브':'Sporty crimson active',
  '모노크롬 럭셔리 (다크·세리프)':'Monochrome luxury (dark serif)','따뜻한 뉴트로 (머스타드·브라운)':'Warm retro (mustard & brown)',
  '어스 뉴트럴 (테라코타·샌드)':'Earthy neutral (terracotta & sand)','딥 그린 보태니컬':'Deep green botanical',
  '유기농 내추럴 그린':'Organic natural green','청량한 바다 블루':'Fresh ocean blue','프리미엄 정육 버건디':'Premium butcher burgundy',
  '포근한 베이커리 카라멜':'Cozy bakery caramel','상큼한 과수원 오렌지':'Fresh orchard orange','전통 한지 단청':'Traditional hanji & dancheong',
  '활기찬 전통시장 레드':'Lively market red','싱그러운 새싹 그린':'Fresh sprout green','포근한 낙농 밀키블루':'Cozy dairy milky-blue',
  '다크 골드 프리미엄 델리':'Dark gold premium deli',
  // 배지(badge) — 한글만
  '오늘의 무드 💗':"TODAY'S MOOD 💗",'정직하게 기른':'HONESTLY GROWN','오늘 들어온':'JUST IN TODAY','갓 구운':'FRESHLY BAKED',
  '제철 과일 🍊':'IN SEASON 🍊','전통의 손맛':'TIME-HONORED','오늘도 푸짐':'ALWAYS GENEROUS','매일 신선':'FRESH DAILY',
  // 히어로 제목(heroTitle) — 한글만
  '밤이 어울리는 물건들':'Pieces made for the night','오늘의 작은 기쁨':"Today's little joys",'맑고 가벼운 하루':'A clear, light day',
  '느리게, 다정하게':'Slow and gentle','자연을 곁에 두다':'Keep nature close','따뜻한 하루의 시작':'A warm start',
  '부드럽게 스며드는':'Softly settling in','그 시절, 좋은 물건':'Good things from back then','흙과 햇살의 색':'Colors of earth & sun',
  '숲을 들이다':'Bring in the forest','땅이 키운 그대로':'Just as the earth grew it','바다에서 식탁까지':'From sea to table',
  '한 점의 품격':'A cut of class','오늘도 따끈하게':'Warm again today','햇살 담은 단맛':'Sunshine-sweet',
  '느린 시간이 빚은 맛':'Flavor aged by time','엄마손 반찬, 한가득':'Home-style sides, piled high','가볍고 깨끗한 한 끼':'A light, clean meal',
  '순하고 부드럽게':'Mild & smooth','귀한 분께, 귀한 맛':'Fine taste for fine people',
  // 히어로 부제(heroSub)
  '군더더기를 덜어낸 단정한 물건들. 오래 곁에 두고 싶은 기본.':'Pared-down, tidy goods. The basics you want to keep around.',
  '깊은 어둠 위에 얹은 한 줄기 골드. 당신의 취향을 위한 큐레이션.':'A streak of gold over deep darkness. A curation for your taste.',
  '보기만 해도 기분 좋아지는 색감. 소소하지만 확실한 행복을 담았어요.':'Colors that lift your mood. Small but certain joys.',
  '매주 새로 떨어지는 한정 드롭. 남들보다 한 발 빠르게, 더 쨍하게.':'New limited drops every week. A step ahead, a shade brighter.',
  '투명하고 산뜻한 감각. 일상에 청량함을 더하는 셀렉션.':'Clear and crisp. A selection that refreshes the everyday.',
  '손에 익는 따뜻한 질감. 천천히 쌓아가는 우리 집의 무드.':'Warm, familiar textures. The mood of a home built slowly.',
  '네온이 흐르는 밤의 무드. 빛나는 것들만 모았다.':'A neon-lit night mood. Only the things that glow.',
  '숲에서 온 차분한 색. 비우고 채우는 균형 잡힌 라이프스타일.':'Calm colors from the forest. A balanced lifestyle.',
  '깊은 네이비 위로 흐르는 사이안 라인. 테크 감성의 셀렉션.':'Cyan lines over deep navy. A tech-minded selection.',
  '노을빛 코랄로 물든 다정한 셀렉션. 보기만 해도 포근해요.':'A gentle selection in sunset coral. Warm at first glance.',
  '은은한 라벤더 톤의 무드. 포근한 일상을 위한 셀렉션.':'A soft lavender mood. A selection for cozy days.',
  '차분한 무채색으로 정돈한 본질. 군더더기 없는 프리미엄.':'Essentials in calm neutrals. Premium without excess.',
  '쨍한 베리 컬러로 터뜨리는 무드. 눈에 띄는 게 좋아.':'A mood bursting in vivid berry. Made to stand out.',
  '강렬한 레드로 밀어붙이는 액티브 셀렉션. 멈추지 않는 하루.':'An active selection pushing in bold red. A day that never stops.',
  '군더더기를 걷어낸 검정의 미학. 시간이 지나도 변치 않는 가치.':'The aesthetic of black, stripped bare. Value that lasts.',
  '머스타드빛 감성과 둥근 모서리. 오래 봐도 질리지 않는 레트로 무드.':'Mustard tones and rounded edges. A retro mood that never tires.',
  '테라코타와 모래빛이 주는 편안함. 자연을 닮은 따뜻한 톤의 물건들.':'The ease of terracotta and sand. Warm, nature-like goods.',
  '깊은 초록과 보태니컬 무드. 공간에 자연의 차분함을 더하는 셀렉션.':'Deep green, botanical mood. Bringing nature’s calm to your space.',
  '농약 대신 햇빛과 정성으로. 오늘 아침 밭에서 온 건강한 먹거리.':'Grown with sun and care, not chemicals. Healthy food from this morning’s field.',
  '새벽 경매에서 막 올라온 신선함. 비린내 없이 깨끗하게.':'Fresh from the dawn auction. Clean, without the fishy smell.',
  '엄선한 숙성과 정직한 등급. 특별한 식탁을 위한 고기.':'Careful aging and honest grades. Meat for a special table.',
  '버터 향 가득한 정직한 반죽. 매일 아침 갓 구워 냅니다.':'Honest dough, rich with butter. Freshly baked every morning.',
  '가장 맛있게 익은 순간에 수확. 한 입 베어 물면 과수원이 펼쳐져요.':'Picked at peak ripeness. One bite and the orchard unfolds.',
  '장독대에서 익어가는 정성. 대를 이어온 우리 발효의 깊이.':'Care fermenting in earthen jars. The depth of generations.',
  '매일 아침 직접 만든 반찬. 싸고 푸짐하게, 정 담아 드려요.':'Side dishes made fresh each morning. Generous, affordable, heartfelt.',
  '아침 이슬 머금은 채소 그대로. 몸이 가벼워지는 신선함.':'Greens still kissed by morning dew. Freshness that feels light.',
  '좋은 목장에서 온 신선한 유제품. 아이도 안심하고 먹어요.':'Fresh dairy from good farms. Safe enough for little ones.',
  '엄선한 프리미엄 식료와 선물세트. 격이 다른 한 상자.':'Curated premium foods and gift sets. A box of a different class.',
  // CTA
  '컬렉션 보기':'View collection','멤버십 입장':'Enter membership','쇼핑 시작':'Start shopping','드롭 확인':'See the drop',
  '둘러보기':'Browse','살펴보기':'Take a look','엔터':'Enter','구경하기':'Explore','쇼핑하기':'Shop now','지금 보기':'See now',
  '컬렉션 입장':'Enter collection','빈티지 둘러보기':'Browse vintage','그린 셀렉션':'Green selection','수확물 보기':'See the harvest',
  '수산물 보기':'See seafood','부위별 보기':'Shop by cut','빵 구경하기':'Browse breads','제철 보기':"See what's in season",
  '전통식품 보기':'See traditional foods','반찬 보기':'See side dishes','신선채소 보기':'See fresh greens','유제품 보기':'See dairy','선물세트 보기':'See gift sets',
  // 카테고리(CATS) + 칩(chips)
  '전체':'All','패션':'Fashion','리빙':'Living','뷰티':'Beauty','액세서리':'Accessories','테크':'Tech',
  '오브젝트':'Objects','웨어':'Wear','스테이셔너리':'Stationery','시그니처':'Signature','한정':'Limited','기프트':'Gifts',
  '베스트':'Best','패브릭':'Fabric','데일리':'Daily','신상':'New','베이직':'Basic','아웃도어':'Outdoor','홈':'Home','키친':'Kitchen','우드':'Wood',
  '게이밍':'Gaming','네온':'Neon','플랜트':'Plants','클린':'Clean','웰니스':'Wellness','가젯':'Gadgets','오디오':'Audio','스트릿':'Street','굿즈':'Goods',
  '스포츠':'Sports','액티브':'Active','슈즈':'Shoes','기어':'Gear','소품':'Goods','음반':'Records','홈데코':'Home Decor','오브제':'Objet','식물':'Plants','향':'Scent','가드닝':'Gardening',
  '채소':'Veggies','쌀·잡곡':'Rice & Grains','과일':'Fruit','가공':'Processed','활어·선어':'Fresh Fish','건어물':'Dried Fish','젓갈':'Salted','해조류':'Seaweed',
  '한우':'Hanwoo','돼지':'Pork','수입육':'Imported','가공육':'Deli Meat','식빵':'Loaf','페이스트리':'Pastry','케이크':'Cake','쿠키':'Cookies',
  '제철':'Seasonal','선물세트':'Gift Sets','주스':'Juice','말랭이':'Dried','장류':'Pastes','김치·발효':'Kimchi','전통주':'Liquor','선물':'Gifts',
  '밑반찬':'Sides','국·찌개':'Soups','김치':'Kimchi','분식':'Snacks','샐러드':'Salad','쌈채소':'Wrap Greens','비건':'Vegan','즙':'Juice',
  '우유':'Milk','치즈':'Cheese','요거트':'Yogurt','아이스크림':'Ice Cream','수입식품':'Imported','와인·차':'Wine & Tea','델리':'Deli',
  // 스킨 그룹 라벨
  '⬛ 미니멀·모던':'⬛ Minimal & Modern','🌑 다크·시크':'🌑 Dark & Chic','💗 러블리·소프트':'💗 Lovely & Soft',
  '⚡ 비비드·팝':'⚡ Vivid & Pop','🌿 내추럴·우드':'🌿 Natural & Wood','🥬 식품·신선':'🥬 Food & Fresh',
  // 상품명(n)
  '소이 캔들 · Dusk':'Soy Candle · Dusk','러너 로우 스니커즈':'Runner Low Sneakers','글로우 세럼 30ml':'Glow Serum 30ml',
  '헤비 캔버스 토트백':'Heavy Canvas Tote','필드 워치 38mm':'Field Watch 38mm','미니 버즈 무선이어폰':'Mini Buds Wireless Earbuds',
  '아세테이트 셰이드':'Acetate Shades','세라믹 머그 320ml':'Ceramic Mug 320ml','코튼 6패널 캡':'Cotton 6-Panel Cap','미니 식물 · 율마':'Mini Plant · Yulma',
  '케이블 니트 스웨터':'Cable Knit Sweater','클래식 트렌치코트':'Classic Trench Coat','오 드 퍼퓸 50ml':'Eau de Parfum 50ml','벨벳 매트 립스틱':'Velvet Matte Lipstick',
  '미니 숄더백':'Mini Shoulder Bag','시어버터 핸드크림':'Shea Butter Hand Cream','리드 디퓨저 200ml':'Reed Diffuser 200ml','스페셜티 원두 200g':'Specialty Beans 200g',
  '골드 펜던트 목걸이':'Gold Pendant Necklace','보온 텀블러 500ml':'Insulated Tumbler 500ml','무드 조명 램프':'Mood Lamp','캔버스 백팩':'Canvas Backpack',
  '시즌 꽃다발':'Seasonal Bouquet','가죽 반지갑':'Leather Bifold Wallet','골드 후프 귀걸이':'Gold Hoop Earrings','하드커버 노트':'Hardcover Notebook',
  '무선 기계식 키보드':'Wireless Mechanical Keyboard','무선 마우스':'Wireless Mouse','블루투스 스피커':'Bluetooth Speaker','미러리스 카메라':'Mirrorless Camera',
  '스마트워치':'Smartwatch','무선 충전패드':'Wireless Charging Pad','커버 쿠션팩트':'Cover Cushion Compact','볼륨 마스카라':'Volume Mascara','데일리 선크림':'Daily Sunscreen',
  // 상품 설명(d)
  '천연 소이왁스에 은은한 우디 머스크를 담았어요. 약 45시간 연소되는 데일리 캔들.':'Natural soy wax with a soft woody musk. A daily candle that burns ~45 hours.',
  '가볍고 통기성 좋은 니트 어퍼. 어디에나 어울리는 미니멀 실루엣의 데일리 러너.':'Light, breathable knit upper. A minimal daily runner that goes with anything.',
  '나이아신아마이드 5% 함유로 맑고 균일한 톤을 가꿔주는 데일리 글로우 세럼.':'With 5% niacinamide for a clear, even tone. A daily glow serum.',
  '16oz 헤비 코튼 캔버스. 노트북도 넉넉히 들어가는 데일리 토트.':'16oz heavy cotton canvas. A daily tote with room for a laptop.',
  '38mm 컴팩트 케이스에 야광 인덱스. 손목이 가벼운 클래식 필드 워치.':'A 38mm compact case with lume indices. A light, classic field watch.',
  '액티브 노이즈 캔슬링과 8시간 재생. 작지만 묵직한 사운드의 무선 버즈.':'Active noise canceling and 8-hour playback. Small buds, big sound.',
  '이탈리아산 아세테이트 프레임. UV400 렌즈로 멋과 보호를 동시에.':'Italian acetate frames. UV400 lenses for style and protection.',
  '손맛이 살아있는 무광 세라믹. 전자레인지·식기세척기 사용 가능.':'Handmade matte ceramic. Microwave- and dishwasher-safe.',
  '부드러운 워싱 코튼에 조절 가능한 스트랩. 어떤 룩에도 얹기 좋은 데일리 캡.':'Soft washed cotton with an adjustable strap. A daily cap for any look.',
  '레몬향이 은은한 율마. 햇빛 좋아하는 초보자용 반려식물, 화분 포함.':'Lemon-scented yulma. A beginner-friendly, sun-loving plant; pot included.',
  '도톰한 케이블 짜임의 데일리 니트.':'A thick cable-knit daily sweater.','사계절 입기 좋은 베이지 트렌치코트.':'A beige trench for all seasons.',
  '은은하게 머무는 머스크 향수.':'A subtle, lingering musk perfume.','부드럽게 발리는 매트 립스틱.':'A smooth, matte-finish lipstick.',
  '데일리로 메기 좋은 가죽 숄더백.':'A leather shoulder bag for everyday.','촉촉하게 스며드는 핸드크림.':'A rich, fast-absorbing hand cream.',
  '공간을 채우는 우디 디퓨저.':'A woody diffuser that fills the room.','갓 볶은 싱글 오리진 원두.':'Freshly roasted single-origin beans.',
  '데일리로 좋은 골드 펜던트 목걸이.':'A gold pendant necklace for everyday.','온도를 오래 유지하는 텀블러.':'A tumbler that keeps temperature long.',
  '따뜻한 빛의 세라믹 무드등.':'A warm-glow ceramic mood lamp.','노트북도 들어가는 데일리 백팩.':'A daily backpack that fits a laptop.',
  '크라프트로 포장한 제철 꽃다발.':'A seasonal bouquet wrapped in kraft.','슬림한 천연가죽 반지갑.':'A slim genuine-leather bifold wallet.',
  '얼굴이 화사해지는 골드 후프 귀걸이.':'Gold hoop earrings that brighten your face.','매끄러운 필기감의 양장 노트.':'A hardcover notebook with smooth writing.',
  '경쾌한 타건감의 무선 기계식 키보드.':'A wireless mechanical keyboard with a crisp feel.','손에 감기는 인체공학 무선 마우스.':'An ergonomic wireless mouse that fits the hand.',
  '어디서나 풍부한 사운드.':'Rich sound anywhere.','가볍게 담는 일상의 순간.':'Capture everyday moments, lightly.',
  '건강과 알림을 손목에서.':'Health and alerts on your wrist.','올려두면 바로 충전.':'Set it down and it charges.',
  '촉촉하게 밀착되는 쿠션.':'A cushion that clings with moisture.','풍성한 컬을 오래.':'Full curls that last.','산뜻한 자외선 차단.':'Light, fresh UV protection.',
  // 미리보기 UI 문구
  '신상':'New','베스트':'Best','카테고리':'Categories','이벤트':'Events','로그인':'Log in','담기':'Add','옵션':'Option',
  '리뷰':'Reviews','배송':'Shipping','5만원 이상 무료배송':'Free over ₩50,000','혜택':'Perk','첫 구매 5% 적립':'5% back on first order',
  '함께 보면 좋은 상품':'You may also like',
  '추천':'Recommended','낮은가격':'Price ↓','높은가격':'Price ↑','별점순':'Top rated',
  '이번 주 셀렉션':"This week's picks",'전체보기':'View all','상품 검색':'Search products',
  '회사소개':'About','이용약관':'Terms','고객센터':'Support','인스타그램':'Instagram','온종일로 만든 쇼핑몰':'Built with ONJONGIL',
  '5만원 이상 구매 시 무료배송 · 오늘의 단 하나의 큐레이션':'Free shipping over ₩50,000 · one daily curation',
  '검색 결과가 없어요':'No results','다른 키워드나 카테고리로 찾아보세요':'Try another keyword or category',
  '담았어요':'added','개 담았어요':'added',
};

/* 스토어/스킨 문자열 영문 변환 (영어 모드일 때만, 없으면 원문) */
function tx(s){
  if(curLang !== 'en' || s == null) return s;
  return STORE_EN[s] || s;
}
window.tx = tx;

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
  persistLang(code); // 대시보드까지 전달되도록 쿠키+로컬 저장
  document.getElementById('lang')?.classList.remove('open');
  applyLang();
  if(typeof rerenderView === 'function') rerenderView();
}
document.addEventListener('click', e=>{
  if(!e.target.closest('#lang')) document.getElementById('lang')?.classList.remove('open');
});
