// 스킨 메타 (정적 데모 TARRYKSM에서 포팅). color/bg = storefront.css 토큰과 매칭한 미리보기 색.
export type Skin = { id: string; name: string; vibe: string; color: string; bg: string };

export const SKINS: Skin[] = [
  { id: "mono", name: "Mono", vibe: "흑백 미니멀 에디토리얼", color: "#15150f", bg: "#f4f3ef" },
  { id: "noir", name: "Noir", vibe: "골드 포인트 다크 럭셔리", color: "#c9a44f", bg: "#0d0d11" },
  { id: "bloom", name: "Bloom", vibe: "파스텔 소프트 큐트", color: "#ff5d8f", bg: "#fff5f7" },
  { id: "citrus", name: "Citrus", vibe: "비비드 Z세대 팝", color: "#c2ee00", bg: "#fbffe9" },
  { id: "azure", name: "Azure", vibe: "청량 글래스 블루", color: "#2f6bff", bg: "#eef4ff" },
  { id: "mocha", name: "Mocha", vibe: "따뜻한 뉴트럴 우드", color: "#9c6b43", bg: "#f3ece2" },
  { id: "grape", name: "Grape", vibe: "네온 사이버 퍼플", color: "#a855f7", bg: "#0f0a1c" },
  { id: "pine", name: "Pine", vibe: "차분한 내추럴 그린", color: "#1f7a4d", bg: "#eef3ec" },
  { id: "midnight", name: "Midnight", vibe: "딥 네이비 테크 다크", color: "#22d3ee", bg: "#0a1020" },
  { id: "coral", name: "Coral", vibe: "코랄 선셋 웜", color: "#ff6f5e", bg: "#fff4ef" },
  { id: "lavender", name: "Lavender", vibe: "라벤더 드리미 소프트", color: "#8b6cf0", bg: "#f6f3ff" },
  { id: "slate", name: "Slate", vibe: "쿨 그레이 프리미엄", color: "#3b4654", bg: "#eef0f3" },
  { id: "berry", name: "Berry", vibe: "비비드 베리 볼드", color: "#e91e8c", bg: "#fff0f6" },
  { id: "crimson", name: "Crimson", vibe: "스포티 크림슨 액티브", color: "#e23b2e", bg: "#fdf1f0" },
];

export const SKIN_IDS = SKINS.map((s) => s.id);

export const SKIN_BY_ID: Record<string, Skin> = Object.fromEntries(
  SKINS.map((s) => [s.id, s])
);
