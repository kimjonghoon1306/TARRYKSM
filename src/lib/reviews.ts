// 리뷰 조회 헬퍼 — 테이블 없거나 에러면 빈 결과(하위호환)
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Review } from "@/app/s/[slug]/Storefront";

// 한 몰의 리뷰를 product_id로 묶어 반환 (스토어프런트 상세시트용)
export async function fetchReviewsByProduct(
  supabase: SupabaseClient,
  storeId: string
): Promise<Record<string, Review[]>> {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("id,product_id,buyer_name,rating,comment,reply,created_at")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error || !data) return {};
    const map: Record<string, Review[]> = {};
    for (const r of data as Review[]) {
      const pid = r.product_id as string;
      (map[pid] ||= []).push(r);
    }
    return map;
  } catch {
    return {};
  }
}
