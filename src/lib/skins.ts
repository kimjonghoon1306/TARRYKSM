// 스킨 메타 (정적 데모 TARRYKSM에서 포팅 — 색 토큰은 추후 P2에서 이식)
export type Skin = { id: string; name: string; vibe: string };

export const SKINS: Skin[] = [
  { id: "mono", name: "Mono", vibe: "흑백 미니멀 에디토리얼" },
  { id: "noir", name: "Noir", vibe: "골드 포인트 다크 럭셔리" },
  { id: "bloom", name: "Bloom", vibe: "파스텔 소프트 큐트" },
  { id: "citrus", name: "Citrus", vibe: "비비드 Z세대 팝" },
  { id: "azure", name: "Azure", vibe: "청량 글래스 블루" },
  { id: "mocha", name: "Mocha", vibe: "따뜻한 뉴트럴 우드" },
  { id: "grape", name: "Grape", vibe: "네온 사이버 퍼플" },
  { id: "pine", name: "Pine", vibe: "차분한 내추럴 그린" },
  { id: "midnight", name: "Midnight", vibe: "딥 네이비 테크 다크" },
  { id: "coral", name: "Coral", vibe: "코랄 선셋 웜" },
  { id: "lavender", name: "Lavender", vibe: "라벤더 드리미 소프트" },
  { id: "slate", name: "Slate", vibe: "쿨 그레이 프리미엄" },
  { id: "berry", name: "Berry", vibe: "비비드 베리 볼드" },
  { id: "crimson", name: "Crimson", vibe: "스포티 크림슨 액티브" },
];

export const SKIN_IDS = SKINS.map((s) => s.id);
