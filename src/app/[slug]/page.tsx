import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchSections } from "@/lib/sections";
import { fetchReviewsByProduct } from "@/lib/reviews";
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
  pay_bank: string | null;
  pay_note: string | null;
  pay_bank_on: boolean | null;
  footer_text: string | null;
  biz_company: string | null;
  biz_owner: string | null;
  biz_number: string | null;
  biz_mailorder: string | null;
  biz_address: string | null;
  biz_phone: string | null;
  biz_email: string | null;
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
    .select("id,name,skin,logo_url,hero_image_url,hero_title,hero_subtitle,pay_bank,pay_note,pay_bank_on,footer_text,biz_company,biz_owner,biz_number,biz_mailorder,biz_address,biz_phone,biz_email")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (!store) notFound();
  const s = store as Store;

  const { data: products } = await supabase
    .from("products")
    .select("id,emoji,image_url,name,brand,price,category,description,tag,stock,options,created_at")
    .eq("store_id", s.id)
    .order("position", { ascending: true });
  const items = (products ?? []) as Product[];
  const sections = await fetchSections(supabase, s.id);
  const reviewsByProduct = await fetchReviewsByProduct(supabase, s.id);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Archivo:wght@500;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <Storefront
        store={{
          id: s.id,
          name: s.name,
          skin: s.skin,
          logo_url: s.logo_url,
          hero_image_url: s.hero_image_url,
          hero_title: s.hero_title,
          hero_subtitle: s.hero_subtitle,
          pay_bank: s.pay_bank,
          pay_note: s.pay_note,
          pay_bank_on: s.pay_bank_on,
          footer_text: s.footer_text,
          biz_company: s.biz_company,
          biz_owner: s.biz_owner,
          biz_number: s.biz_number,
          biz_mailorder: s.biz_mailorder,
          biz_address: s.biz_address,
          biz_phone: s.biz_phone,
          biz_email: s.biz_email,
        }}
        products={items}
        sections={sections}
        reviewsByProduct={reviewsByProduct}
      />
    </>
  );
}
