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
  { e:'🕯️', n:'소이 캔들 · Dusk',   b:'AROMA', p:28000,  tag:'NEW',  cat:'리빙', r:4.8, rc:132,
    d:'천연 소이왁스에 은은한 우디 머스크를 담았어요. 약 45시간 연소되는 데일리 캔들.' },
  { e:'👟', n:'러너 로우 스니커즈',   b:'FOOT',  p:129000,            cat:'패션', r:4.6, rc:318,
    d:'가볍고 통기성 좋은 니트 어퍼. 어디에나 어울리는 미니멀 실루엣의 데일리 러너.' },
  { e:'🧴', n:'글로우 세럼 30ml',     b:'SKIN',  p:42000,  tag:'BEST', cat:'뷰티', r:4.9, rc:521,
    d:'나이아신아마이드 5% 함유로 맑고 균일한 톤을 가꿔주는 데일리 글로우 세럼.' },
  { e:'👜', n:'헤비 캔버스 토트백',    b:'BAG',   p:39000,             cat:'패션', r:4.5, rc:94,
    d:'16oz 헤비 코튼 캔버스. 노트북도 넉넉히 들어가는 데일리 토트.' },
  { e:'⌚', n:'필드 워치 38mm',       b:'TIME',  p:186000,            cat:'액세서리', r:4.7, rc:76,
    d:'38mm 컴팩트 케이스에 야광 인덱스. 손목이 가벼운 클래식 필드 워치.' },
  { e:'🎧', n:'미니 버즈 무선이어폰',  b:'SOUND', p:89000,  tag:'HOT',  cat:'테크', r:4.6, rc:430,
    d:'액티브 노이즈 캔슬링과 8시간 재생. 작지만 묵직한 사운드의 무선 버즈.' },
  { e:'🕶️', n:'아세테이트 셰이드',     b:'VIEW',  p:72000,             cat:'액세서리', r:4.4, rc:58,
    d:'이탈리아산 아세테이트 프레임. UV400 렌즈로 멋과 보호를 동시에.' },
  { e:'☕', n:'세라믹 머그 320ml',     b:'HOME',  p:24000,             cat:'리빙', r:4.8, rc:210,
    d:'손맛이 살아있는 무광 세라믹. 전자레인지·식기세척기 사용 가능.' },
  { e:'🧢', n:'코튼 6패널 캡',         b:'HEAD',  p:34000,             cat:'패션', r:4.5, rc:143,
    d:'부드러운 워싱 코튼에 조절 가능한 스트랩. 어떤 룩에도 얹기 좋은 데일리 캡.' },
  { e:'🌿', n:'미니 식물 · 율마',      b:'GREEN', p:19000,  tag:'NEW',  cat:'리빙', r:4.9, rc:87,
    d:'레몬향이 은은한 율마. 햇빛 좋아하는 초보자용 반려식물, 화분 포함.' },
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

/* 별점 → ★ 문자열 (반올림 정수 칸) */
const stars = r => '★★★★★☆☆☆☆☆'.slice(5 - Math.round(r), 10 - Math.round(r));

const won = n => '₩' + n.toLocaleString('ko-KR');
