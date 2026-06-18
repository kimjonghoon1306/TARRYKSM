import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchSections } from "@/lib/sections";
import { sampleSectionsForStore } from "@/lib/sampleData";
import SectionEditor from "@/components/SectionEditor";

export default async function SectionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: store } = await supabase
    .from("stores")
    .select("id,name,slug,skin")
    .eq("id", id)
    .maybeSingle();
  if (!store) notFound();

  // 숨김 포함 전체 섹션(에디터용). 비어 있으면 기본 대문 틀(신상·배너·베스트·전체)을 바로 채워서 보여줌.
  let sections = await fetchSections(supabase, id, false);
  if (sections.length === 0) {
    await supabase.from("store_sections").insert(sampleSectionsForStore(id));
    sections = await fetchSections(supabase, id, false);
  }

  const { data: prods } = await supabase
    .from("products")
    .select("id,name,emoji,image_url,category,price,tag,created_at")
    .eq("store_id", id)
    .order("created_at", { ascending: false });
  const products = (prods ?? []) as {
    id: string;
    name: string;
    emoji: string | null;
    image_url: string | null;
    category: string | null;
    price: number | null;
    tag: string | null;
    created_at: string | null;
  }[];

  // 카테고리 목록(중복 제거)
  const categories = Array.from(
    new Set(products.map((p) => (p.category || "").trim()).filter(Boolean))
  );

  return (
    <SectionEditor
      storeId={store.id as string}
      slug={store.slug as string}
      skin={store.skin as string}
      initialSections={sections}
      products={products}
      categories={categories}
    />
  );
}
