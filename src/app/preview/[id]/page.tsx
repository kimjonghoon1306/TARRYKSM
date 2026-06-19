import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchSections } from "@/lib/sections";
import { fetchReviewsByProduct } from "@/lib/reviews";
import Storefront, { type Product } from "@/app/s/[slug]/Storefront";

// 소유자 전용 "전체 미리보기" — 발행 여부와 무관하게 실제 스토어프런트를 그대로 렌더.
// 대시보드 레이아웃(AdminShell) 밖이라 진짜 고객 화면과 동일. iframe으로 띄워 기기별 미리보기.
export const dynamic = "force-dynamic";

export default async function StorePreview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS: 본인 소유 몰(또는 관리자)만 읽힘. published 필터 없음 = 발행 전에도 미리보기.
  const { data: store } = await supabase
    .from("stores")
    .select("id,name,skin,owner,published,logo_url,hero_image_url,hero_title,hero_subtitle,pay_bank,pay_note,footer_text,biz_company,biz_owner,biz_number,biz_mailorder,biz_address,biz_phone,biz_email")
    .eq("id", id)
    .maybeSingle();
  if (!store) notFound();
  const s = store as Record<string, string | null> & { published?: boolean };

  const { data: products } = await supabase
    .from("products")
    .select("id,emoji,image_url,name,brand,price,compare_at,category,description,tag,stock,options,variants,created_at")
    .eq("store_id", id)
    .order("position", { ascending: true });
  const items = (products ?? []) as Product[];
  const sections = await fetchSections(supabase, id);
  const reviewsByProduct = await fetchReviewsByProduct(supabase, id);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Archivo:wght@500;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      {/* 미리보기 안내 띠 */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "#8b5cf6", color: "#fff", textAlign: "center", padding: "6px 12px", fontSize: 12, fontWeight: 700 }}>
        🔍 미리보기 — 손님에게 이렇게 보여요{s.published ? "" : " (아직 발행 전)"}
      </div>
      <Storefront
        store={{
          id: s.id as string,
          name: s.name as string,
          skin: s.skin as string,
          logo_url: s.logo_url,
          hero_image_url: s.hero_image_url,
          hero_title: s.hero_title,
          hero_subtitle: s.hero_subtitle,
          pay_bank: s.pay_bank,
          pay_note: s.pay_note,
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
