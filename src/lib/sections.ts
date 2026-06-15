// 섹션 빌더(A) — 블록 타입 정의 + 조회 헬퍼
import type { SupabaseClient } from "@supabase/supabase-js";

export type SectionType = "banner" | "shelf" | "text" | "grid";

// 모든 블록의 설정 필드를 한 평면 타입으로 (교집합 충돌 방지)
export type SectionConfig = {
  // 공통/배너
  image_url?: string | null;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  cta_label?: string;
  link_product_id?: string | null;
  link_url?: string | null;
  height?: "sm" | "md" | "lg";
  // 선반/그리드
  source?: "new" | "best" | "category" | "manual" | "all";
  category?: string;
  product_ids?: string[];
  limit?: number;
  // 텍스트
  body?: string;
  align?: "left" | "center";
};

export type Section = {
  id: string;
  type: SectionType;
  position: number;
  visible: boolean;
  config: SectionConfig;
};

// 블록 메뉴(에디터용) — 기본 설정 포함
export const SECTION_META: Record<
  SectionType,
  { label: string; icon: string; desc: string; default: SectionConfig }
> = {
  banner: {
    label: "기획전 배너",
    icon: "🖼️",
    desc: "이미지·문구·버튼으로 시선을 끄는 큰 배너",
    default: { eyebrow: "SPECIAL", title: "기획전 제목", subtitle: "부제를 입력하세요", cta_label: "보러가기" },
  },
  shelf: {
    label: "상품 선반",
    icon: "🛒",
    desc: "신상·베스트·카테고리·직접고른 상품을 가로 진열",
    default: { title: "상품 선반", source: "new", limit: 8 },
  },
  text: {
    label: "텍스트 블록",
    icon: "✍️",
    desc: "브랜드 스토리·안내 문구",
    default: { title: "제목을 입력하세요", body: "내용을 입력하세요.", align: "center" },
  },
  grid: {
    label: "전체 상품 그리드",
    icon: "🔲",
    desc: "전체 또는 특정 카테고리 상품 전부",
    default: { title: "전체 상품", source: "all" },
  },
};

// 발행 스토어프런트용 — 보이는 섹션만, 순서대로. 테이블 없거나 에러면 빈 배열(하위호환).
export async function fetchSections(
  supabase: SupabaseClient,
  storeId: string,
  onlyVisible = true
): Promise<Section[]> {
  try {
    let q = supabase
      .from("store_sections")
      .select("id,type,position,visible,config")
      .eq("store_id", storeId)
      .order("position", { ascending: true });
    if (onlyVisible) q = q.eq("visible", true);
    const { data, error } = await q;
    if (error || !data) return [];
    return data as Section[];
  } catch {
    return [];
  }
}
