import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Storefront, { type Product } from "./Storefront";

type Store = { id: string; name: string; skin: string };

export default async function StorefrontPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: store } = await supabase
    .from("stores")
    .select("id,name,skin")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (!store) notFound();
  const s = store as Store;

  const { data: products } = await supabase
    .from("products")
    .select("id,emoji,image_url,name,brand,price,category,description")
    .eq("store_id", s.id)
    .order("position", { ascending: true });
  const items = (products ?? []) as Product[];

  return (
    <>
      {/* 스킨 서체 (Space Grotesk / Fraunces / Archivo / Plus Jakarta / Inter) */}
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Archivo:wght@500;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <Storefront store={{ name: s.name, skin: s.skin }} products={items} />
    </>
  );
}
