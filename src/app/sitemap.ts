import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE = "https://on.xn--zk5biyyw.com"; // on.온종일.com

// 발행된 모든 쇼핑몰을 사이트맵에 등록 → 검색엔진(구글·네이버)이 각 몰을 수집.
// (seo_noindex 켠 몰은 제외)
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  let stores: { slug: string; updated?: string | null }[] = [];
  try {
    const { data } = await supabase
      .from("stores")
      .select("slug,seo_noindex")
      .eq("published", true);
    stores = ((data ?? []) as { slug: string; seo_noindex?: boolean }[])
      .filter((s) => !s.seo_noindex)
      .map((s) => ({ slug: s.slug }));
  } catch {
    // seo_noindex 컬럼 없으면 전체 발행몰
    const { data } = await supabase.from("stores").select("slug").eq("published", true);
    stores = (data ?? []) as { slug: string }[];
  }

  const now = new Date();
  const storeUrls: MetadataRoute.Sitemap = stores.flatMap((s) => [
    { url: `${BASE}/${s.slug}`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/${s.slug}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/${s.slug}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ]);

  return [{ url: BASE, lastModified: now, changeFrequency: "daily", priority: 1 }, ...storeUrls];
}
