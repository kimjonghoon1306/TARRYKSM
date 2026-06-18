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
};

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
