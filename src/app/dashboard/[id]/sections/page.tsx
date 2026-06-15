import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchSections } from "@/lib/sections";
import SectionEditor from "@/components/SectionEditor";

export default async function SectionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: store } = await supabase
    .from("stores")
    .select("id,name,slug")
    .eq("id", id)
    .maybeSingle();
  if (!store) notFound();

  // 숨김 포함 전체 섹션(에디터용)
  const sections = await fetchSections(supabase, id, false);

  const { data: prods } = await supabase
    .from("products")
    .select("id,name,emoji,image_url,category")
    .eq("store_id", id)
    .order("created_at", { ascending: false });
  const products = (prods ?? []) as {
    id: string;
    name: string;
    emoji: string | null;
    image_url: string | null;
    category: string | null;
  }[];

  // 카테고리 목록(중복 제거)
  const categories = Array.from(
    new Set(products.map((p) => (p.category || "").trim()).filter(Boolean))
  );

  return (
    <SectionEditor
      storeId={store.id as string}
      slug={store.slug as string}
      initialSections={sections}
      products={products}
      categories={categories}
    />
  );
}
