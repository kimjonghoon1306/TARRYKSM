import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchSections } from "@/lib/sections";
import Storefront, { type Product } from "../s/[slug]/Storefront";

// 각 쇼핑몰 링크 공유 시: 가게 이름·로고(파비콘)·배너(미리보기 이미지)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("stores")
    .select("name,logo_url,hero_image_url,hero_subtitle")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (!data) return { title: "쇼핑몰" };
  const img = data.hero_image_url || data.logo_url || undefined;
  const desc = data.hero_subtitle || `${data.name} — ONJONGIL로 만든 쇼핑몰`;
  return {
    title: data.name,
    description: desc,
    openGraph: {
      title: data.name,
      description: desc,
      images: img ? [img] : undefined,
    },
    icons: data.logo_url ? { icon: data.logo_url } : undefined,
  };
}

type Store = {
  id: string;
  name: string;
  skin: string;
  logo_url: string | null;
  hero_image_url: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
};

// 경로 방식 스토어프런트: on.온종일.com/{slug}
// (예약 정적 경로 dashboard·login·s 등이 우선하므로 충돌 없음)
export default async function PrettyStorefront({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: store } = await supabase
    .from("stores")
    .select("id,name,skin,logo_url,hero_image_url,hero_title,hero_subtitle")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (!store) notFound();
  const s = store as Store;

  const { data: products } = await supabase
    .from("products")
    .select("id,emoji,image_url,name,brand,price,category,description,tag,created_at")
    .eq("store_id", s.id)
    .order("position", { ascending: true });
  const items = (products ?? []) as Product[];
  const sections = await fetchSections(supabase, s.id);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Archivo:wght@500;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <Storefront
        store={{
          name: s.name,
          skin: s.skin,
          logo_url: s.logo_url,
          hero_image_url: s.hero_image_url,
          hero_title: s.hero_title,
          hero_subtitle: s.hero_subtitle,
        }}
        products={items}
        sections={sections}
      />
    </>
  );
}
