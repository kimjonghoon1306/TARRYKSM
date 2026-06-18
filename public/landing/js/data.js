/* ════════════════════════════════════════
   data.js — 스킨 메타 · 공통 상품셋
   상품은 단 하나의 셋을 공유 → 어떤 스킨을 입혀도
   동일 상품이 "다른 브랜드처럼" 보이는 것을 시연
════════════════════════════════════════ */

/* 8개 스킨 — 각자 다른 브랜드 정체성 */
const SKINS = [
  { id:'mono',   name:'Mono',   emoji:'⬜', vibe:'흑백 미니멀 에디토리얼',
    brand:'OBJECT', badge:'NEW ARRIVALS',
    heroTitle:'Less, but better.', heroSub:'군더더기를 덜어낸 단정한 물건들. 오래 곁에 두고 싶은 기본.',
    cta:'컬렉션 보기', chips:['전체','오브젝트','웨어','리빙','스테이셔너리'] },

  { id:'noir',   name:'Noir',   emoji:'🥂', vibe:'골드 포인트 다크 럭셔리',
    brand:'MAISON N', badge:'PRIVATE SELECTION',
    heroTitle:'밤이 어울리는 물건들', heroSub:'깊은 어둠 위에 얹은 한 줄기 골드. 당신의 취향을 위한 큐레이션.',
    cta:'멤버십 입장', chips:['ALL','시그니처','한정','기프트','액세서리'] },

  { id:'bloom',  name:'Bloom',  emoji:'🌷', vibe:'파스텔 소프트 큐트',
    brand:'dolce', badge:'오늘의 무드 💗',
    heroTitle:'오늘의 작은 기쁨', heroSub:'보기만 해도 기분 좋아지는 색감. 소소하지만 확실한 행복을 담았어요.',
    cta:'쇼핑 시작', chips:['전체','베스트','뷰티','패브릭','데일리'] },

  { id:'citrus', name:'Citrus', emoji:'🍋', vibe:'비비드 Z세대 팝',
    brand:'ZEST', badge:'FRESH DROP ⚡',
    heroTitle:'Fresh drop, every week', heroSub:'매주 새로 떨어지는 한정 드롭. 남들보다 한 발 빠르게, 더 쨍하게.',
    cta:'드롭 확인', chips:['ALL','HYPE','한정','스트릿','굿즈'] },

  { id:'azure',  name:'Azure',  emoji:'🌊', vibe:'청량 글래스 블루',
    brand:'MARINE', badge:'CLEAN & LIGHT',
    heroTitle:'맑고 가벼운 하루', heroSub:'투명하고 산뜻한 감각. 일상에 청량함을 더하는 셀렉션.',
    cta:'둘러보기', chips:['전체','신상','베이직','테크','아웃도어'] },

  { id:'mocha',  name:'Mocha',  emoji:'🤎', vibe:'따뜻한 뉴트럴 우드',
    brand:'kinfolk', badge:'SLOW LIVING',
    heroTitle:'느리게, 다정하게', heroSub:'손에 익는 따뜻한 질감. 천천히 쌓아가는 우리 집의 무드.',
    cta:'살펴보기', chips:['전체','홈','키친','우드','패브릭'] },

  { id:'grape',  name:'Grape',  emoji:'🍇', vibe:'네온 사이버 퍼플',
    brand:'HYPER', badge:'NIGHT MODE ON',
    heroTitle:'Night mode, always on', heroSub:'네온이 흐르는 밤의 무드. 빛나는 것들만 모았다.',
    cta:'엔터', chips:['ALL','테크','게이밍','네온','한정'] },

  { id:'pine',   name:'Pine',   emoji:'🌲', vibe:'차분한 내추럴 그린',
    brand:'FOREST', badge:'NATURE INSIDE',
    heroTitle:'자연을 곁에 두다', heroSub:'숲에서 온 차분한 색. 비우고 채우는 균형 잡힌 라이프스타일.',
    cta:'구경하기', chips:['전체','플랜트','리빙','클린','웰니스'] },

  { id:'midnight', name:'Midnight', emoji:'🌃', vibe:'딥 네이비 테크 다크',
    brand:'NOVA', badge:'TECH DROP',
    heroTitle:'Built for the night', heroSub:'깊은 네이비 위로 흐르는 사이안 라인. 테크 감성의 셀렉션.',
    cta:'둘러보기', chips:['ALL','테크','가젯','오디오','액세서리'] },

  { id:'coral',  name:'Coral',  emoji:'🪸', vibe:'코랄 선셋 웜',
    brand:'SUNDAY', badge:'WARM PICKS',
    heroTitle:'따뜻한 하루의 시작', heroSub:'노을빛 코랄로 물든 다정한 셀렉션. 보기만 해도 포근해요.',
    cta:'쇼핑하기', chips:['전체','베스트','홈','웨어','기프트'] },

  { id:'lavender', name:'Lavender', emoji:'💜', vibe:'라벤더 드리미 소프트',
    brand:'lumi', badge:'DREAMY',
    heroTitle:'부드럽게 스며드는', heroSub:'은은한 라벤더 톤의 무드. 포근한 일상을 위한 셀렉션.',
    cta:'구경하기', chips:['전체','뷰티','패브릭','데일리','기프트'] },

  { id:'slate',  name:'Slate',  emoji:'◾', vibe:'쿨 그레이 프리미엄',
    brand:'GRID', badge:'ESSENTIALS',
    heroTitle:'Quiet by design', heroSub:'차분한 무채색으로 정돈한 본질. 군더더기 없는 프리미엄.',
    cta:'컬렉션 보기', chips:['ALL','오브젝트','웨어','테크','리빙'] },

  { id:'berry',  name:'Berry',  emoji:'🫐', vibe:'비비드 베리 볼드',
    brand:'POP', badge:'HOT NOW 🔥',
    heroTitle:'Bold & juicy', heroSub:'쨍한 베리 컬러로 터뜨리는 무드. 눈에 띄는 게 좋아.',
    cta:'지금 보기', chips:['ALL','HOT','한정','뷰티','굿즈'] },

  { id:'crimson', name:'Crimson', emoji:'🔻', vibe:'스포티 크림슨 액티브',
    brand:'BLAZE', badge:'GO HARD',
    heroTitle:'Move faster', heroSub:'강렬한 레드로 밀어붙이는 액티브 셀렉션. 멈추지 않는 하루.',
    cta:'GEAR UP', chips:['ALL','스포츠','액티브','슈즈','기어'] },

  // ── 식품·농축수산물·업태 특화 10종 ──
  { id:'harvest', name:'Harvest', emoji:'🌾', vibe:'유기농 내추럴 그린',
    brand:'들녘', badge:'정직하게 기른',
    heroTitle:'땅이 키운 그대로', heroSub:'농약 대신 햇빛과 정성으로. 오늘 아침 밭에서 온 건강한 먹거리.',
    cta:'수확물 보기', chips:['전체','채소','쌀·잡곡','과일','가공'] },

  { id:'ocean', name:'Ocean', emoji:'🌊', vibe:'청량한 바다 블루',
    brand:'바다온', badge:'오늘 들어온',
    heroTitle:'바다에서 식탁까지', heroSub:'새벽 경매에서 막 올라온 신선함. 비린내 없이 깨끗하게.',
    cta:'수산물 보기', chips:['전체','활어·선어','건어물','젓갈','해조류'] },

  { id:'butcher', name:'Butcher', emoji:'🥩', vibe:'프리미엄 정육 버건디',
    brand:'한근정육', badge:'PREMIUM CUT',
    heroTitle:'한 점의 품격', heroSub:'엄선한 숙성과 정직한 등급. 특별한 식탁을 위한 고기.',
    cta:'부위별 보기', chips:['전체','한우','돼지','수입육','가공육'] },

  { id:'bakery', name:'Bakery', emoji:'🥐', vibe:'포근한 베이커리 카라멜',
    brand:'오늘의빵', badge:'갓 구운',
    heroTitle:'오늘도 따끈하게', heroSub:'버터 향 가득한 정직한 반죽. 매일 아침 갓 구워 냅니다.',
    cta:'빵 구경하기', chips:['전체','식빵','페이스트리','케이크','쿠키'] },

  { id:'orchard', name:'Orchard', emoji:'🍑', vibe:'상큼한 과수원 오렌지',
    brand:'과수원집', badge:'제철 과일 🍊',
    heroTitle:'햇살 담은 단맛', heroSub:'가장 맛있게 익은 순간에 수확. 한 입 베어 물면 과수원이 펼쳐져요.',
    cta:'제철 보기', chips:['전체','제철','선물세트','주스','말랭이'] },

  { id:'hanok', name:'Hanok', emoji:'🏮', vibe:'전통 한지 단청',
    brand:'고운결', badge:'전통의 손맛',
    heroTitle:'느린 시간이 빚은 맛', heroSub:'장독대에서 익어가는 정성. 대를 이어온 우리 발효의 깊이.',
    cta:'전통식품 보기', chips:['전체','장류','김치·발효','전통주','선물'] },

  { id:'market', name:'Market', emoji:'🛒', vibe:'활기찬 전통시장 레드',
    brand:'정다운반찬', badge:'오늘도 푸짐',
    heroTitle:'엄마손 반찬, 한가득', heroSub:'매일 아침 직접 만든 반찬. 싸고 푸짐하게, 정 담아 드려요.',
    cta:'반찬 보기', chips:['전체','밑반찬','국·찌개','김치','분식'] },

  { id:'sprout', name:'Sprout', emoji:'🥬', vibe:'싱그러운 새싹 그린',
    brand:'초록한끼', badge:'FRESH & CLEAN',
    heroTitle:'가볍고 깨끗한 한 끼', heroSub:'아침 이슬 머금은 채소 그대로. 몸이 가벼워지는 신선함.',
    cta:'신선채소 보기', chips:['전체','샐러드','쌈채소','비건','즙'] },

  { id:'dairy', name:'Dairy', emoji:'🥛', vibe:'포근한 낙농 밀키블루',
    brand:'목장하루', badge:'매일 신선',
    heroTitle:'순하고 부드럽게', heroSub:'좋은 목장에서 온 신선한 유제품. 아이도 안심하고 먹어요.',
    cta:'유제품 보기', chips:['전체','우유','치즈','요거트','아이스크림'] },

  { id:'gourmet', name:'Gourmet', emoji:'🎁', vibe:'다크 골드 프리미엄 델리',
    brand:'MAISON DELI', badge:'GIFT SELECTION',
    heroTitle:'귀한 분께, 귀한 맛', heroSub:'엄선한 프리미엄 식료와 선물세트. 격이 다른 한 상자.',
    cta:'선물세트 보기', chips:['ALL','선물세트','수입식품','와인·차','델리'] },
];

const SKIN_BY_ID = Object.fromEntries(SKINS.map(s => [s.id, s]));

/* 카테고리 — 스토어프런트 필터 레일 (첫 항목 "전체"는 고정) */
const CATS = ['전체', '패션', '리빙', '뷰티', '액세서리', '테크'];

/* 공통 상품셋 — 서로 다른 카테고리(향초·신발·세럼·시계…)지만
   동일 카드 규격으로 묶여 한 매장처럼 보인다.
   cat = 필터용 카테고리, d = 상세 설명 */
const PRODUCTS = [
  { e:'🕯️', img:'/landing/img/products/candle.webp', n:'소이 캔들 · Dusk',   b:'AROMA', p:28000,  tag:'NEW',  cat:'리빙', r:4.8, rc:132,
    d:'천연 소이왁스에 은은한 우디 머스크를 담았어요. 약 45시간 연소되는 데일리 캔들.' },
  { e:'👟', img:'/landing/img/products/sneaker.webp', n:'러너 로우 스니커즈',   b:'FOOT',  p:129000,            cat:'패션', r:4.6, rc:318,
    d:'가볍고 통기성 좋은 니트 어퍼. 어디에나 어울리는 미니멀 실루엣의 데일리 러너.' },
  { e:'🧴', img:'/landing/img/products/serum.webp', n:'글로우 세럼 30ml',     b:'SKIN',  p:42000,  tag:'BEST', cat:'뷰티', r:4.9, rc:521,
    d:'나이아신아마이드 5% 함유로 맑고 균일한 톤을 가꿔주는 데일리 글로우 세럼.' },
  { e:'👜', img:'/landing/img/products/tote.webp', n:'헤비 캔버스 토트백',    b:'BAG',   p:39000,             cat:'패션', r:4.5, rc:94,
    d:'16oz 헤비 코튼 캔버스. 노트북도 넉넉히 들어가는 데일리 토트.' },
  { e:'⌚', img:'/landing/img/products/watch.webp', n:'필드 워치 38mm',       b:'TIME',  p:186000,            cat:'액세서리', r:4.7, rc:76,
    d:'38mm 컴팩트 케이스에 야광 인덱스. 손목이 가벼운 클래식 필드 워치.' },
  { e:'🎧', img:'/landing/img/products/earbuds.webp', n:'미니 버즈 무선이어폰',  b:'SOUND', p:89000,  tag:'HOT',  cat:'테크', r:4.6, rc:430,
    d:'액티브 노이즈 캔슬링과 8시간 재생. 작지만 묵직한 사운드의 무선 버즈.' },
  { e:'🕶️', img:'/landing/img/products/sunglasses.webp', n:'아세테이트 셰이드',     b:'VIEW',  p:72000,             cat:'액세서리', r:4.4, rc:58,
    d:'이탈리아산 아세테이트 프레임. UV400 렌즈로 멋과 보호를 동시에.' },
  { e:'☕', img:'/landing/img/products/mug.webp', n:'세라믹 머그 320ml',     b:'HOME',  p:24000,             cat:'리빙', r:4.8, rc:210,
    d:'손맛이 살아있는 무광 세라믹. 전자레인지·식기세척기 사용 가능.' },
  { e:'🧢', img:'/landing/img/products/cap.webp', n:'코튼 6패널 캡',         b:'HEAD',  p:34000,             cat:'패션', r:4.5, rc:143,
    d:'부드러운 워싱 코튼에 조절 가능한 스트랩. 어떤 룩에도 얹기 좋은 데일리 캡.' },
  { e:'🌿', img:'/landing/img/products/plant.webp', n:'미니 식물 · 율마',      b:'GREEN', p:19000,  tag:'NEW',  cat:'리빙', r:4.9, rc:87,
    d:'레몬향이 은은한 율마. 햇빛 좋아하는 초보자용 반려식물, 화분 포함.' },
  { e:'🧶', img:'/landing/img/products/knit.webp', n:'케이블 니트 스웨터', b:'KNIT', p:59000, tag:'NEW', cat:'패션', r:4.7, rc:96, d:'도톰한 케이블 짜임의 데일리 니트.' },
  { e:'🧥', img:'/landing/img/products/coat.webp', n:'클래식 트렌치코트', b:'ATELIER', p:189000, tag:'BEST', cat:'패션', r:4.8, rc:74, d:'사계절 입기 좋은 베이지 트렌치코트.' },
  { e:'💎', img:'/landing/img/products/perfume.webp', n:'오 드 퍼퓸 50ml', b:'SCENT', p:78000, cat:'뷰티', r:4.7, rc:120, d:'은은하게 머무는 머스크 향수.' },
  { e:'💄', img:'/landing/img/products/lipstick.webp', n:'벨벳 매트 립스틱', b:'BLUSH', p:26000, tag:'HOT', cat:'뷰티', r:4.6, rc:210, d:'부드럽게 발리는 매트 립스틱.' },
  { e:'👜', img:'/landing/img/products/shoulderbag.webp', n:'미니 숄더백', b:'BAG', p:98000, cat:'패션', r:4.7, rc:64, d:'데일리로 메기 좋은 가죽 숄더백.' },
  { e:'🧴', img:'/landing/img/products/handcream.webp', n:'시어버터 핸드크림', b:'CARE', p:14000, cat:'뷰티', r:4.8, rc:160, d:'촉촉하게 스며드는 핸드크림.' },
  { e:'🪔', img:'/landing/img/products/diffuser.webp', n:'리드 디퓨저 200ml', b:'AROMA', p:32000, tag:'NEW', cat:'리빙', r:4.9, rc:88, d:'공간을 채우는 우디 디퓨저.' },
  { e:'☕', img:'/landing/img/products/coffeebean.webp', n:'스페셜티 원두 200g', b:'ROAST', p:18000, tag:'BEST', cat:'리빙', r:4.8, rc:142, d:'갓 볶은 싱글 오리진 원두.' },
  { e:'📿', img:'/landing/img/products/necklace.webp', n:'골드 펜던트 목걸이', b:'LUXE', p:62000, cat:'액세서리', r:4.7, rc:58, d:'데일리로 좋은 골드 펜던트 목걸이.' },
  { e:'🥤', img:'/landing/img/products/tumbler.webp', n:'보온 텀블러 500ml', b:'KEEP', p:29000, cat:'리빙', r:4.6, rc:96, d:'온도를 오래 유지하는 텀블러.' },
  { e:'💡', img:'/landing/img/products/moodlamp.webp', n:'무드 조명 램프', b:'GLOW', p:39000, tag:'HOT', cat:'리빙', r:4.8, rc:110, d:'따뜻한 빛의 세라믹 무드등.' },
  { e:'🎒', img:'/landing/img/products/backpack.webp', n:'캔버스 백팩', b:'PACK', p:69000, cat:'패션', r:4.5, rc:72, d:'노트북도 들어가는 데일리 백팩.' },
  { e:'💐', img:'/landing/img/products/bouquet.webp', n:'시즌 꽃다발', b:'BLOOM', p:42000, tag:'NEW', cat:'리빙', r:4.9, rc:64, d:'크라프트로 포장한 제철 꽃다발.' },
  { e:'👛', img:'/landing/img/products/wallet.webp', n:'가죽 반지갑', b:'LEATHER', p:48000, cat:'액세서리', r:4.7, rc:80, d:'슬림한 천연가죽 반지갑.' },
  { e:'✨', img:'/landing/img/products/earring.webp', n:'골드 후프 귀걸이', b:'LUXE', p:34000, cat:'액세서리', r:4.6, rc:90, d:'얼굴이 화사해지는 골드 후프 귀걸이.' },
  { e:'📓', img:'/landing/img/products/notebook.webp', n:'하드커버 노트', b:'PAPER', p:12000, cat:'리빙', r:4.7, rc:130, d:'매끄러운 필기감의 양장 노트.' },
];

/* 데모 리뷰 풀 — 상세에서 상품별로 deterministic하게 2개씩 노출 */
const REVIEWS = [
  { n:'민지',  s:5, t:'기대 이상이에요. 재구매 의사 100%!' },
  { n:'요한',  s:5, t:'배송 빠르고 마감이 깔끔합니다.' },
  { n:'sora',  s:4, t:'사진이랑 거의 똑같아요. 만족합니다 :)' },
  { n:'현우',  s:5, t:'선물했는데 너무 좋아하네요. 포장도 예뻐요.' },
  { n:'다은',  s:4, t:'가성비 좋아요. 색감이 특히 마음에 들어요.' },
  { n:'jay',   s:5, t:'고민하다 샀는데 진작 살 걸 그랬어요!' },
];

/* ════════════════════════════════════════
   스킨 테마별 미리보기 상품 — 업태에 맞는 이모지·이름·카테고리
   (미리보기가 스킨마다 다른 상품을 보여주도록)
════════════════════════════════════════ */
const THEMES = {
  produce: { cats:['전체','잎채소','뿌리채소','버섯','쌈·나물'], items:[
    { e:'🥬', img:'/landing/img/food/produce_spinach.webp', n:'유기농 시금치 한 단', b:'들녘', p:3900, tag:'NEW', cat:'잎채소', r:4.8, rc:120, d:'오늘 아침 수확한 유기농 시금치.' },
    { e:'🥕', img:'/landing/img/food/produce_carrot.webp', n:'흙당근 1kg', b:'들녘', p:5900, cat:'뿌리채소', r:4.7, rc:88, d:'단단하고 단맛 좋은 흙당근.' },
    { e:'🥦', img:'/landing/img/food/produce_broccoli.webp', n:'브로콜리 2송이', b:'그린팜', p:4500, tag:'BEST', cat:'잎채소', r:4.6, rc:64, d:'아삭한 제철 브로콜리.' },
    { e:'🧄', img:'/landing/img/food/produce_garlic.webp', n:'햇마늘 500g', b:'육쪽', p:6900, cat:'뿌리채소', r:4.9, rc:150, d:'알이 굵은 햇마늘.' },
    { e:'🍄', img:'/landing/img/food/produce_mushroom.webp', n:'생표고버섯 한 팩', b:'숲밭', p:5500, cat:'버섯', r:4.7, rc:42, d:'향이 진한 생표고.' },
    { e:'🥗', img:'/landing/img/food/produce_ssam.webp', n:'모둠 쌈채소', b:'초록', p:4200, tag:'HOT', cat:'쌈·나물', r:4.8, rc:97, d:'7종 신선 쌈채소 모둠.' },
  ]},
  seafood: { cats:['전체','활어·선어','조개·갑각','건어물','젓갈'], items:[
    { e:'🐟', img:'/landing/img/food/seafood_hairtail.webp', n:'손질 갈치 2마리', b:'바다온', p:19000, tag:'오늘들어온', cat:'활어·선어', r:4.7, rc:74, d:'제주 은갈치, 손질해서 보내드려요.' },
    { e:'🦐', img:'/landing/img/food/seafood_prawn.webp', n:'생새우 500g', b:'바다온', p:16000, tag:'BEST', cat:'조개·갑각', r:4.8, rc:131, d:'탱글한 대하, 급속냉동.' },
    { e:'🦑', img:'/landing/img/food/seafood_squid.webp', n:'손질 오징어 3마리', b:'동해상회', p:12000, cat:'활어·선어', r:4.6, rc:58, d:'내장 제거 손질 오징어.' },
    { e:'🦪', img:'/landing/img/food/seafood_oyster.webp', n:'생굴 1kg', b:'남해', p:14000, tag:'NEW', cat:'조개·갑각', r:4.7, rc:69, d:'통영 청정 해역 생굴.' },
    { e:'🍤', img:'/landing/img/food/seafood_driedshrimp.webp', n:'마른새우 200g', b:'건이정', p:9000, cat:'건어물', r:4.9, rc:88, d:'국물용 마른새우.' },
    { e:'🧂', img:'/landing/img/food/seafood_myeongnan.webp', n:'명란젓 300g', b:'젓갈명가', p:13000, cat:'젓갈', r:4.8, rc:102, d:'짭조름 감칠맛 명란젓.' },
  ]},
  meat: { cats:['전체','한우','돼지','수입육','가공육'], items:[
    { e:'🥩', img:'/landing/img/food/meat_beef.webp', n:'한우 등심 200g', b:'한근정육', p:39000, tag:'프리미엄', cat:'한우', r:4.9, rc:210, d:'1++ 등급 한우 등심.' },
    { e:'🍖', img:'/landing/img/food/meat_porkbelly.webp', n:'삼겹살 600g', b:'돈복', p:18000, tag:'BEST', cat:'돼지', r:4.7, rc:340, d:'두툼한 생삼겹.' },
    { e:'🥓', img:'/landing/img/food/meat_bacon.webp', n:'베이컨 슬라이스', b:'델리육', p:8900, cat:'가공육', r:4.6, rc:120, d:'훈연 향 가득 베이컨.' },
    { e:'🍗', img:'/landing/img/food/meat_chicken.webp', n:'닭다리살 1kg', b:'데일리', p:11000, tag:'NEW', cat:'돼지', r:4.5, rc:76, d:'순살 닭다리살.' },
    { e:'🌭', img:'/landing/img/food/meat_sausage.webp', n:'수제 소시지 4입', b:'델리육', p:9900, cat:'가공육', r:4.7, rc:64, d:'첨가물 줄인 수제 소시지.' },
    { e:'🥩', img:'/landing/img/food/meat_striploin.webp', n:'채끝 스테이크', b:'한근정육', p:29000, tag:'HOT', cat:'수입육', r:4.8, rc:95, d:'육즙 가득 채끝 스테이크.' },
  ]},
  bakery: { cats:['전체','식빵·바게트','페이스트리','케이크','쿠키'], items:[
    { e:'🍞', img:'/landing/img/food/bakery_bread.webp', n:'우리밀 식빵', b:'오늘의빵', p:6500, tag:'NEW', cat:'식빵·바게트', r:4.9, rc:180, d:'매일 아침 구운 우리밀 식빵.' },
    { e:'🥐', img:'/landing/img/food/bakery_croissant.webp', n:'버터 크루아상', b:'오늘의빵', p:3800, tag:'BEST', cat:'페이스트리', r:4.8, rc:240, d:'프랑스 버터로 결을 살린 크루아상.' },
    { e:'🥖', img:'/landing/img/food/bakery_baguette.webp', n:'바게트', b:'밀과불', p:4500, cat:'식빵·바게트', r:4.7, rc:96, d:'겉바속촉 정통 바게트.' },
    { e:'🧁', img:'/landing/img/food/bakery_cupcake.webp', n:'바닐라 컵케이크', b:'슈가룸', p:4200, tag:'HOT', cat:'케이크', r:4.6, rc:88, d:'폭신한 바닐라 컵케이크.' },
    { e:'🍪', img:'/landing/img/food/bakery_cookie.webp', n:'수제 쿠키 6입', b:'슈가룸', p:9000, cat:'쿠키', r:4.8, rc:130, d:'겉은 바삭 속은 쫀득.' },
    { e:'🥨', img:'/landing/img/food/bakery_pretzel.webp', n:'프레첼', b:'밀과불', p:3500, cat:'페이스트리', r:4.5, rc:54, d:'짭짤한 수제 프레첼.' },
  ]},
  fruit: { cats:['전체','제철','수입과일','선물세트','말랭이'], items:[
    { e:'🍎', img:'/landing/img/food/fruit_apple.webp', n:'부사 사과 5kg', b:'과수원집', p:28000, tag:'BEST', cat:'제철', r:4.8, rc:160, d:'당도 높은 햇사과.' },
    { e:'🍊', img:'/landing/img/food/fruit_tangerine.webp', n:'제주 감귤 3kg', b:'귤마을', p:15000, tag:'NEW', cat:'제철', r:4.7, rc:210, d:'새콤달콤 노지 감귤.' },
    { e:'🍓', img:'/landing/img/food/fruit_strawberry.webp', n:'설향 딸기 1팩', b:'베리팜', p:12000, tag:'HOT', cat:'제철', r:4.9, rc:280, d:'향 가득 설향 딸기.' },
    { e:'🍇', img:'/landing/img/food/fruit_grape.webp', n:'샤인머스캣 1송이', b:'포도원', p:18000, cat:'제철', r:4.8, rc:140, d:'씨 없는 청포도.' },
    { e:'🥭', img:'/landing/img/food/fruit_mango.webp', n:'애플망고 2입', b:'트로피칼', p:16000, cat:'수입과일', r:4.6, rc:72, d:'달콤한 애플망고.' },
    { e:'🍑', img:'/landing/img/food/fruit_peach.webp', n:'복숭아 선물세트', b:'과수원집', p:35000, cat:'선물세트', r:4.7, rc:60, d:'말랑 달콤 복숭아 선물.' },
  ]},
  traditional: { cats:['전체','장류','김치·발효','전통주','차·한방'], items:[
    { e:'🍯', img:'/landing/img/food/traditional_doenjang.webp', n:'재래식 막된장 1kg', b:'고운결', p:15000, tag:'인기', cat:'장류', r:4.9, rc:120, d:'장독에서 익힌 막된장.' },
    { e:'🌶️', img:'/landing/img/food/traditional_gochujang.webp', n:'태양초 고추장 500g', b:'고운결', p:13000, tag:'BEST', cat:'장류', r:4.8, rc:96, d:'태양초로 담근 고추장.' },
    { e:'🥬', img:'/landing/img/food/traditional_kimchi.webp', n:'포기김치 2kg', b:'손맛김치', p:22000, tag:'NEW', cat:'김치·발효', r:4.7, rc:150, d:'갓 담근 포기김치.' },
    { e:'🍶', img:'/landing/img/food/traditional_makgeolli.webp', n:'전통 막걸리', b:'주막', p:6000, cat:'전통주', r:4.6, rc:78, d:'생효모 살아있는 막걸리.' },
    { e:'🫖', img:'/landing/img/food/traditional_tea.webp', n:'국산 쌍화차', b:'한방원', p:12000, cat:'차·한방', r:4.8, rc:64, d:'몸을 데우는 쌍화차.' },
    { e:'🧧', img:'/landing/img/food/traditional_giftset.webp', n:'명절 선물세트', b:'고운결', p:39000, cat:'장류', r:4.9, rc:42, d:'장·청 모둠 명절 선물.' },
  ]},
  banchan: { cats:['전체','밑반찬','국·찌개','김치','분식'], items:[
    { e:'🥢', img:'/landing/img/food/banchan_anchovy.webp', n:'멸치볶음 200g', b:'정다운반찬', p:5000, tag:'BEST', cat:'밑반찬', r:4.8, rc:210, d:'바삭 고소한 멸치볶음.' },
    { e:'🍲', img:'/landing/img/food/banchan_stew.webp', n:'된장찌개 2인분', b:'엄마손', p:7000, tag:'HOT', cat:'국·찌개', r:4.7, rc:130, d:'데우기만 하면 끝.' },
    { e:'🥬', img:'/landing/img/food/banchan_geotjeori.webp', n:'겉절이 500g', b:'정다운반찬', p:6000, tag:'NEW', cat:'김치', r:4.6, rc:88, d:'아삭한 겉절이.' },
    { e:'🍢', img:'/landing/img/food/banchan_eomuk.webp', n:'어묵볶음', b:'엄마손', p:4500, cat:'밑반찬', r:4.7, rc:76, d:'달짝지근 어묵볶음.' },
    { e:'🍙', img:'/landing/img/food/banchan_riceball.webp', n:'주먹밥 세트', b:'분식방', p:5500, cat:'분식', r:4.5, rc:54, d:'한 끼 든든 주먹밥.' },
    { e:'🌶️', img:'/landing/img/food/banchan_jangjorim.webp', n:'장조림 300g', b:'정다운반찬', p:8000, cat:'밑반찬', r:4.8, rc:99, d:'짭짤 든든 소고기 장조림.' },
  ]},
  dairy: { cats:['전체','우유','치즈','요거트','아이스크림'], items:[
    { e:'🥛', img:'/landing/img/food/dairy_milk.webp', n:'유기농 우유 1L', b:'목장하루', p:3200, tag:'NEW', cat:'우유', r:4.9, rc:240, d:'좋은 목장의 신선한 우유.' },
    { e:'🧀', img:'/landing/img/food/dairy_cheese.webp', n:'수제 모짜렐라', b:'치즈공방', p:9000, tag:'BEST', cat:'치즈', r:4.8, rc:120, d:'쫀득한 생모짜렐라.' },
    { e:'🍦', img:'/landing/img/food/dairy_icecream.webp', n:'우유 아이스크림', b:'목장하루', p:6500, tag:'HOT', cat:'아이스크림', r:4.7, rc:160, d:'진한 우유맛 아이스크림.' },
    { e:'🧈', img:'/landing/img/food/dairy_butter.webp', n:'발효버터 200g', b:'목장하루', p:8500, cat:'치즈', r:4.6, rc:64, d:'고소한 발효버터.' },
    { e:'🥣', img:'/landing/img/food/dairy_yogurt.webp', n:'플레인 요거트', b:'데일리밀크', p:4500, cat:'요거트', r:4.8, rc:130, d:'담백한 그릭 요거트.' },
    { e:'🍮', img:'/landing/img/food/dairy_pudding.webp', n:'우유 푸딩 2입', b:'목장하루', p:5000, cat:'아이스크림', r:4.7, rc:58, d:'부드러운 우유 푸딩.' },
  ]},
  gourmet: { cats:['ALL','선물세트','수입식품','와인·차','델리'], items:[
    { e:'🎁', img:'/landing/img/food/gourmet_giftset.webp', n:'프리미엄 선물세트', b:'MAISON', p:89000, tag:'GIFT', cat:'선물세트', r:4.9, rc:88, d:'귀한 분께 드리는 모둠 선물.' },
    { e:'🍷', img:'/landing/img/food/gourmet_wine.webp', n:'내추럴 와인', b:'CAVE', p:42000, tag:'BEST', cat:'와인·차', r:4.8, rc:120, d:'엄선한 내추럴 와인.' },
    { e:'🧀', img:'/landing/img/food/gourmet_cheeseplatter.webp', n:'수입 치즈 플래터', b:'DELI', p:28000, cat:'델리', r:4.7, rc:64, d:'3종 수입 치즈 모둠.' },
    { e:'🫒', img:'/landing/img/food/gourmet_oliveoil.webp', n:'엑스트라버진 올리브유', b:'OLIO', p:24000, tag:'NEW', cat:'수입식품', r:4.8, rc:76, d:'콜드프레스 올리브유.' },
    { e:'🍫', img:'/landing/img/food/gourmet_chocolate.webp', n:'싱글오리진 초콜릿', b:'CACAO', p:15000, cat:'수입식품', r:4.9, rc:140, d:'카카오 70% 다크.' },
    { e:'🫖', img:'/landing/img/food/gourmet_teaset.webp', n:'프리미엄 티 세트', b:'MAISON', p:32000, cat:'와인·차', r:4.7, rc:52, d:'잎차 6종 기프트.' },
  ]},
};
const SKIN_THEME = {
  harvest:'produce', sprout:'produce', ocean:'seafood', butcher:'meat',
  bakery:'bakery', orchard:'fruit', hanok:'traditional', market:'banchan',
  dairy:'dairy', gourmet:'gourmet',
};
const LIFESTYLE = { cats: CATS, items: PRODUCTS };
function themeFor(skinId){ return THEMES[SKIN_THEME[skinId]] || LIFESTYLE; }
// 스킨 대표 썸네일 — 그 스킨 업태에 맞는 상품 사진 (스킨마다 다르게)
function skinThumb(skinId){
  const items = themeFor(skinId).items;
  const idx = SKINS.findIndex(s => s.id === skinId);
  return ((items[(idx < 0 ? 0 : idx) % items.length]) || {}).img || '';
}

/* 별점 → ★ 문자열 (반올림 정수 칸) */
const stars = r => '★★★★★☆☆☆☆☆'.slice(5 - Math.round(r), 10 - Math.round(r));

const won = n => '₩' + n.toLocaleString('ko-KR');
