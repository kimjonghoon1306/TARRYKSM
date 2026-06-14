import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Storefront, { type Product } from "../s/[slug]/Storefront";

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
    .select("id,emoji,image_url,name,brand,price,category,description,tag")
    .eq("store_id", s.id)
    .order("position", { ascending: true });
  const items = (products ?? []) as Product[];

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
      />
    </>
  );
}
