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
];

const SKIN_BY_ID = Object.fromEntries(SKINS.map(s => [s.id, s]));

/* 공통 상품셋 — 서로 다른 카테고리(향초·신발·세럼·시계…)지만
   동일 카드 규격으로 묶여 한 매장처럼 보인다 */
const PRODUCTS = [
  { e:'🕯️', n:'소이 캔들 · Dusk',   b:'AROMA', p:28000,  tag:'NEW' },
  { e:'👟', n:'러너 로우 스니커즈',   b:'FOOT',  p:129000 },
  { e:'🧴', n:'글로우 세럼 30ml',     b:'SKIN',  p:42000,  tag:'BEST' },
  { e:'👜', n:'헤비 캔버스 토트백',    b:'BAG',   p:39000 },
  { e:'⌚', n:'필드 워치 38mm',       b:'TIME',  p:186000 },
  { e:'🎧', n:'미니 버즈 무선이어폰',  b:'SOUND', p:89000,  tag:'HOT' },
  { e:'🕶️', n:'아세테이트 셰이드',     b:'VIEW',  p:72000 },
  { e:'☕', n:'세라믹 머그 320ml',     b:'HOME',  p:24000 },
  { e:'🧢', n:'코튼 6패널 캡',         b:'HEAD',  p:34000 },
  { e:'🌿', n:'미니 식물 · 율마',      b:'GREEN', p:19000,  tag:'NEW' },
];

const won = n => '₩' + n.toLocaleString('ko-KR');
