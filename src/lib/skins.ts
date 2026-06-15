// 스킨 메타. color/bg = storefront.css 토큰과 매칭한 미리보기 색.
// desc = 스킨 느낌 상세 설명, recommend = 어울리는 업태(창업자 선택용).
export type Skin = {
  id: string;
  name: string;
  vibe: string;
  color: string;
  bg: string;
  desc: string;
  recommend: string;
  group: "food" | "general";
};

export const SKINS: Skin[] = [
  // ── 식품 · 농축수산물 · 업태 특화 ──
  {
    id: "harvest", name: "Harvest", vibe: "유기농 내추럴 그린", color: "#5c8a3a", bg: "#f3f6ec", group: "food",
    desc: "흙내음 나는 따뜻한 올리브 그린과 크림 바탕, 손글씨 같은 세리프 서체로 ‘정직하게 기른 것’의 신뢰감을 줍니다. 과하지 않고 건강한 무드.",
    recommend: "유기농·친환경 농산물, 로컬푸드, 쌀·잡곡, 건강 먹거리",
  },
  {
    id: "ocean", name: "Ocean", vibe: "청량한 바다 블루", color: "#0e8aa8", bg: "#eef5f6", group: "food",
    desc: "맑은 바닷물 같은 틸 블루와 포말 화이트. 시원하고 신선한 인상이라 ‘오늘 들어온 물건’의 생동감이 살아납니다.",
    recommend: "수산물·활어, 건어물, 젓갈, 횟집·해산물, 김·해조류",
  },
  {
    id: "butcher", name: "Butcher", vibe: "프리미엄 정육 버건디", color: "#9c2b2b", bg: "#f5efe9", group: "food",
    desc: "깊은 버건디 레드와 따뜻한 크림. 묵직한 세리프가 한우·숙성육의 ‘고급스러운 한 점’ 같은 품격을 냅니다.",
    recommend: "정육·한우, 육가공·소시지, 델리, 숙성·수입육",
  },
  {
    id: "bakery", name: "Bakery", vibe: "포근한 베이커리 카라멜", color: "#c8893f", bg: "#fbf3e7", group: "food",
    desc: "갓 구운 빵 같은 카라멜 브라운과 버터 크림. 둥근 모서리와 부드러운 서체로 따뜻하고 다정한 동네 빵집 무드.",
    recommend: "베이커리·제과, 수제 디저트, 카페·브런치, 잼·수제청",
  },
  {
    id: "orchard", name: "Orchard", vibe: "상큼한 과수원 오렌지", color: "#ff7a3d", bg: "#fff3ee", group: "food",
    desc: "잘 익은 과일의 주스 같은 오렌지·코랄. 통통 튀고 비타민 가득한 인상이라 보기만 해도 군침이 돕니다.",
    recommend: "과일·청과, 생과일주스·스무디, 잼·말랭이, 선물 과일",
  },
  {
    id: "hanok", name: "Hanok", vibe: "전통 한지 단청", color: "#b23a2e", bg: "#f4eee1", group: "food",
    desc: "한지 빛 바탕에 단청 붉은 포인트, 정갈한 세리프. 발효·전통의 깊은 시간과 장인의 손맛을 담은 클래식 한국 무드.",
    recommend: "전통식품·장류, 한방·약재, 김치·발효, 전통주·차, 명절 선물세트",
  },
  {
    id: "market", name: "Market", vibe: "활기찬 전통시장 레드", color: "#e8442e", bg: "#fff7e8", group: "food",
    desc: "빨강·호박색이 부딪히는 시장통의 에너지. 굵고 큰 글씨로 ‘싸고 푸짐하게’ 외치는 정겹고 북적이는 활기.",
    recommend: "반찬가게·밑반찬, 분식·떡, 시장 먹거리, 푸드트럭, 만물상",
  },
  {
    id: "sprout", name: "Sprout", vibe: "싱그러운 새싹 그린", color: "#3fa64f", bg: "#f0f7ee", group: "food",
    desc: "아침 채소밭처럼 맑은 라이트 그린과 화이트. 깨끗하고 가벼워 신선·건강·비건의 청정한 이미지를 줍니다.",
    recommend: "신선 채소·쌈, 샐러드·밀키트, 비건·채식, 착즙주스·즙",
  },
  {
    id: "dairy", name: "Dairy", vibe: "포근한 낙농 밀키블루", color: "#5b8fd6", bg: "#f3f6fb", group: "food",
    desc: "우유빛 화이트에 맑은 하늘색. 둥글고 보드라워 유제품·디저트의 ‘부드럽고 순한’ 감성에 잘 어울립니다.",
    recommend: "유제품·우유·치즈, 요거트·아이스크림, 목장 디저트, 베이비푸드",
  },
  {
    id: "gourmet", name: "Gourmet", vibe: "다크 골드 프리미엄 델리", color: "#c9a44f", bg: "#14130f", group: "food",
    desc: "짙은 차콜 위에 절제된 골드. 어둡고 묵직해 프리미엄 식료·선물세트의 ‘귀한 한 상자’ 같은 럭셔리를 연출합니다.",
    recommend: "프리미엄 식료·선물세트, 수입식품·델리, 와인·차, 명품 먹거리",
  },

  // ── 범용 (모든 업태) ──
  { id: "mono", name: "Mono", vibe: "흑백 미니멀 에디토리얼", color: "#15150f", bg: "#f4f3ef", group: "general",
    desc: "군더더기 없는 흑백과 넓은 여백, 잡지 같은 편집미. 제품 그 자체에 집중시키는 차분하고 세련된 무드.",
    recommend: "디자인 소품·오브제, 패션·잡화, 문구, 미니멀 라이프스타일" },
  { id: "noir", name: "Noir", vibe: "골드 포인트 다크 럭셔리", color: "#c9a44f", bg: "#0d0d11", group: "general",
    desc: "깊은 어둠 위 한 줄기 골드. 야간의 고급 부티크처럼 한정·시그니처 상품을 돋보이게 합니다.",
    recommend: "명품·주얼리, 향수·뷰티, 한정판, 프리미엄 기프트" },
  { id: "bloom", name: "Bloom", vibe: "파스텔 소프트 큐트", color: "#ff5d8f", bg: "#fff5f7", group: "general",
    desc: "보기만 해도 기분 좋아지는 파스텔 핑크. 사랑스럽고 다정해 ‘작은 행복’을 파는 가게에 잘 맞습니다.",
    recommend: "뷰티·팬시, 플라워·소품, 아동·베이비, 디저트" },
  { id: "citrus", name: "Citrus", vibe: "비비드 Z세대 팝", color: "#c2ee00", bg: "#fbffe9", group: "general",
    desc: "쨍한 라임 옐로의 힙한 에너지. 트렌디하고 발랄해 남들보다 한 발 빠른 드롭 감성에 어울립니다.",
    recommend: "스트릿 패션, 굿즈·캐릭터, 테크 액세서리, 한정 드롭" },
  { id: "azure", name: "Azure", vibe: "청량 글래스 블루", color: "#2f6bff", bg: "#eef4ff", group: "general",
    desc: "투명하고 산뜻한 블루. 깔끔하고 신뢰감 있어 테크·생활용품에 두루 어울리는 청량한 무드.",
    recommend: "테크·가전, 생활·아웃도어, 스포츠, 베이직 의류" },
  { id: "mocha", name: "Mocha", vibe: "따뜻한 뉴트럴 우드", color: "#9c6b43", bg: "#f3ece2", group: "general",
    desc: "손에 익는 우드와 흙빛 뉴트럴. 느리고 다정한 슬로우 리빙의 따뜻한 질감.",
    recommend: "홈·키친, 우드·공예, 패브릭, 핸드메이드" },
  { id: "grape", name: "Grape", vibe: "네온 사이버 퍼플", color: "#a855f7", bg: "#0f0a1c", group: "general",
    desc: "어둠 속 네온 퍼플 글로우. 미래적이고 강렬해 디지털·게이밍 감성을 톡톡 살립니다.",
    recommend: "게이밍·테크, 디지털 굿즈, 클럽·뮤직, 스트릿" },
  { id: "pine", name: "Pine", vibe: "차분한 내추럴 그린", color: "#1f7a4d", bg: "#eef3ec", group: "general",
    desc: "숲처럼 안정적인 딥 그린. 믿음직하고 편안해 친환경·아웃도어에 잘 어울립니다.",
    recommend: "아웃도어·캠핑, 친환경·리빙, 식물·가드닝, 건강" },
  { id: "midnight", name: "Midnight", vibe: "딥 네이비 테크 다크", color: "#22d3ee", bg: "#0a1020", group: "general",
    desc: "깊은 네이비에 사이안 글로우. 첨단·프리미엄 테크의 미니멀하고 또렷한 다크 무드.",
    recommend: "전자·테크, 오디오·가젯, 구독·소프트웨어, 프리미엄" },
  { id: "coral", name: "Coral", vibe: "코랄 선셋 웜", color: "#ff6f5e", bg: "#fff4ef", group: "general",
    desc: "노을빛 코랄의 따뜻한 환영. 부드럽고 친근해 라이프스타일·뷰티에 두루 좋습니다.",
    recommend: "뷰티·바디, 리빙·소품, 카페·디저트, 데일리" },
  { id: "lavender", name: "Lavender", vibe: "라벤더 드리미 소프트", color: "#8b6cf0", bg: "#f6f3ff", group: "general",
    desc: "꿈결 같은 라벤더 퍼플. 우아하고 몽환적이라 향·웰니스 감성에 잘 맞습니다.",
    recommend: "향수·아로마, 웰니스·요가, 뷰티, 팬시·소품" },
  { id: "slate", name: "Slate", vibe: "쿨 그레이 프리미엄", color: "#3b4654", bg: "#eef0f3", group: "general",
    desc: "절제된 쿨 그레이. 군더더기 없이 단단해 비즈니스·프리미엄 제품에 신뢰를 더합니다.",
    recommend: "사무·문구, 가구·인테리어, B2B, 프리미엄 가전" },
  { id: "berry", name: "Berry", vibe: "비비드 베리 볼드", color: "#e91e8c", bg: "#fff0f6", group: "general",
    desc: "강렬한 베리 핑크의 자신감. 화려하고 볼드해 시선을 단번에 사로잡습니다.",
    recommend: "뷰티·코스메틱, 패션, 액세서리, 이벤트·기프트" },
  { id: "crimson", name: "Crimson", vibe: "스포티 크림슨 액티브", color: "#e23b2e", bg: "#fdf1f0", group: "general",
    desc: "역동적인 크림슨 레드. 빠르고 힘찬 인상이라 스포츠·액티브 브랜드에 활기를 줍니다.",
    recommend: "스포츠·피트니스, 액티브웨어, 자동차·용품, 에너지" },
];

export const SKIN_IDS = SKINS.map((s) => s.id);

export const SKIN_BY_ID: Record<string, Skin> = Object.fromEntries(
  SKINS.map((s) => [s.id, s])
);
