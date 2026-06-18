// 쇼핑몰 생성 시 "미리보기 그대로" 채워주기 위한 샘플 상품.
// 데이터는 미리보기 데모(public/landing/js/data.js)에서 자동 추출한 sample-products.json.
// (미리보기 상품이 바뀌면: node 스크립트로 sample-products.json 재생성)
import sample from "./sample-products.json";

export type SampleItem = {
  e?: string; img?: string; n: string; b?: string; p: number;
  tag?: string; cat?: string; r?: number; rc?: number; d?: string;
};
type Theme = { cats: string[]; items: SampleItem[] };

const data = sample as {
  themes: Record<string, Theme>;
  lifestyle: Theme;
  skinTheme: Record<string, string>;
  skinMeta: Record<string, { title: string; sub: string; img: string }>;
};

// 스킨별 대문 히어로(제목·문구·배너 이미지) — 신규 쇼핑몰을 미리보기처럼 채우기
export function heroForStore(skin: string) {
  const m = data.skinMeta?.[skin];
  if (!m) return {};
  return {
    hero_title: m.title || null,
    hero_subtitle: m.sub || null,
    hero_image_url: m.img || null,
  };
}

// 스킨 → 샘플 상품 세트 (식품 스킨은 해당 업태 테마, 그 외는 라이프스타일)
export function sampleProductsForSkin(skin: string): SampleItem[] {
  const themeKey = data.skinTheme[skin];
  const theme = (themeKey && data.themes[themeKey]) || data.lifestyle;
  return theme.items;
}

// products 테이블 insert용 행으로 변환
export function sampleRowsForStore(storeId: string, skin: string) {
  return sampleProductsForSkin(skin).map((it) => ({
    store_id: storeId,
    name: it.n,
    brand: it.b ?? null,
    price: it.p ?? 0,
    image_url: it.img ?? null,
    category: it.cat ?? null,
    description: it.d ?? null,
    tag: it.tag ?? null,
    emoji: it.e ?? null,
  }));
}

// 신규 쇼핑몰 대문 기본 틀 (store_sections) — 빈 화면 대신 완성된 구성에서 수정하게.
// 미리보기 리치뷰와 같은 구성: 신상 선반 → 기획전 배너 → 베스트 선반 → 전체 그리드.
export function sampleSectionsForStore(storeId: string) {
  return [
    { store_id: storeId, type: "shelf", position: 0, visible: true, config: { title: "🆕 신상품", subtitle: "방금 들어온 따끈한 신상", source: "new", limit: 8 } },
    { store_id: storeId, type: "banner", position: 1, visible: true, config: { eyebrow: "SPECIAL PICK", title: "이번 주 추천", subtitle: "놓치면 아쉬운 상품을 모았어요", cta_label: "지금 보기", height: "md" } },
    { store_id: storeId, type: "shelf", position: 2, visible: true, config: { title: "🔥 베스트", subtitle: "가장 사랑받는 상품", source: "best", limit: 8 } },
    { store_id: storeId, type: "grid", position: 3, visible: true, config: { title: "전체 상품", source: "all" } },
  ];
}
