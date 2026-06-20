import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchSections } from "@/lib/sections";
import { fetchReviewsByProduct } from "@/lib/reviews";
import Storefront, { type Product } from "../s/[slug]/Storefront";
import StoreBot, { type BotStyle } from "@/components/StoreBot";
import StorePromo from "@/components/StorePromo";
import StoreLocked from "@/components/StoreLocked";
import RestockPopup from "@/components/RestockPopup";
import { getCustomer, getWishlistIds, getMyCoupons, getMyRestock, getMyAddresses } from "./customer-actions";

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
  // SEO 커스텀 필드 안전 조회 (seo.sql 미실행이면 컬럼 없음 → 기본값)
  let seo: { seo_title?: string | null; seo_desc?: string | null; seo_keywords?: string | null; seo_noindex?: boolean | null } = {};
  try {
    const { data: sd } = await supabase.from("stores").select("seo_title,seo_desc,seo_keywords,seo_noindex").eq("slug", slug).maybeSingle();
    seo = (sd ?? {}) as typeof seo;
  } catch { /* 컬럼 없으면 무시 */ }

  const img = data.hero_image_url || data.logo_url || undefined;
  const title = (seo.seo_title || "").trim() || data.name;
  const desc = (seo.seo_desc || "").trim() || data.hero_subtitle || `${data.name} — ONJONGIL로 만든 쇼핑몰`;
  const keywords = (seo.seo_keywords || "").split(",").map((k) => k.trim()).filter(Boolean);
  return {
    title,
    description: desc,
    keywords: keywords.length ? keywords : undefined,
    robots: seo.seo_noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description: desc,
      images: img ? [img] : undefined,
      type: "website",
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
  points_on: boolean | null;
  ship_on: boolean | null;
  ship_fee: number | null;
  ship_free_over: number | null;
  ship_extra: number | null;
  chat_on: boolean | null;
  chat_style: string | null;
  chat_greeting: string | null;
  chat_name: string | null;
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
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ auth?: string }>;
}) {
  const { slug } = await params;
  const sp = searchParams ? await searchParams : {};
  const openAuth = sp.auth === "signup" ? "signup" : sp.auth === "login" ? "login" : undefined;
  const supabase = await createClient();

  // 쇼핑몰 정보 + 손님 로그인 + 찜목록을 한 번에 병렬 조회 (서로 독립 → 순차 왕복 제거)
  const [{ data: store }, cust, wishlistIdsRaw, myCouponsRaw] = await Promise.all([
    supabase
      .from("stores")
      .select("id,name,skin,logo_url,hero_image_url,hero_title,hero_subtitle,pay_bank,pay_note,pay_bank_on,points_on,ship_on,ship_fee,ship_free_over,ship_extra,chat_on,chat_style,chat_greeting,chat_name,footer_text,biz_company,biz_owner,biz_number,biz_mailorder,biz_address,biz_phone,biz_email")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle(),
    getCustomer(),
    getWishlistIds(),
    getMyCoupons(),
  ]);
  if (!store) notFound();
  const s = store as Store;

  // 🔒 구독 만료 시 손님 화면 잠금 (주인 plan_until 만료 → is_store_locked RPC)
  const { data: locked } = await supabase.rpc("is_store_locked", { p_store: s.id });
  if (locked === true) return <StoreLocked name={s.name} />;

  // store.id 확정 후 상품/섹션/리뷰/챗봇FAQ + 토글 병렬 조회
  const [{ data: products }, sections, reviewsByProduct, { data: faqRows }, { data: tg }] = await Promise.all([
    supabase
      .from("products")
      .select("id,emoji,image_url,name,brand,price,compare_at,category,description,tag,stock,options,variants,created_at")
      .eq("store_id", s.id)
      .order("position", { ascending: true }),
    fetchSections(supabase, s.id),
    fetchReviewsByProduct(supabase, s.id),
    supabase
      .from("store_faqs")
      .select("id,question,answer")
      .eq("store_id", s.id)
      .order("position", { ascending: true }),
    // qa_on/reviews_on + 프로모(띠배너·팝업) 안전 조회 (컬럼 없으면 null → 미적용)
    supabase
      .from("stores")
      .select("qa_on,reviews_on,bar_on,bar_text,bar_link,bar_bg,bar_fg,popup_on,popup_title,popup_body,popup_image,popup_btn_text,popup_btn_link")
      .eq("id", s.id)
      .maybeSingle(),
  ]);
  const items = (products ?? []) as Product[];
  const faqs = (faqRows ?? []) as { id: string; question: string; answer: string }[];
  const toggles = (tg ?? {}) as {
    qa_on?: boolean | null; reviews_on?: boolean | null;
    bar_on?: boolean | null; bar_text?: string | null; bar_link?: string | null; bar_bg?: string | null; bar_fg?: string | null;
    popup_on?: boolean | null; popup_title?: string | null; popup_body?: string | null; popup_image?: string | null; popup_btn_text?: string | null; popup_btn_link?: string | null;
  };
  const customer = cust && cust.store_id === s.id ? { id: cust.id, name: cust.name, email: cust.email, points: cust.points } : null;
  const wishlistIds = customer ? wishlistIdsRaw : [];
  // 결제 화면에서 쓸 수 있는 보유 쿠폰 (미사용·유효·기간내)
  const myCoupons = customer
    ? myCouponsRaw
        .filter((c) => !c.used && c.active && (!c.expires_at || new Date(c.expires_at) > new Date()))
        .map((c) => ({ code: c.code, kind: c.kind, value: c.value, min_order: c.min_order }))
    : [];

  // 로그인 회원의 현재 등급(할인%) — 등급 사용 켜진 몰에서만. (grades.sql 미실행이면 안전하게 null)
  let memberGrade: { name: string; pct: number } | null = null;
  if (customer) {
    const { data: gr0 } = await supabase.from("stores").select("grades_on").eq("id", s.id).maybeSingle();
    if ((gr0 as { grades_on?: boolean } | null)?.grades_on) {
      const { data: c2 } = await supabase.from("customers").select("total_spent").eq("id", customer.id).maybeSingle();
      const { data: g } = await supabase.rpc("grade_for_spent", { p_store: s.id, p_spent: (c2 as { total_spent?: number } | null)?.total_spent ?? 0 });
      const gr = (Array.isArray(g) ? g[0] : g) as { name?: string; discount_pct?: number } | null;
      if (gr && (gr.discount_pct ?? 0) > 0) memberGrade = { name: gr.name || "회원", pct: gr.discount_pct as number };
    }
  }

  // 입고 완료(notified) 재입고 알림 — 로그인 손님에게 팝업으로 (restock2.sql 미실행이면 빈 배열)
  let restockReady: { id: string; name: string }[] = [];
  let myAddresses: { id: string; label: string | null; recipient: string; phone: string; address: string; memo: string | null; is_default: boolean }[] = [];
  if (customer) {
    try {
      const mr = await getMyRestock();
      restockReady = mr.filter((r) => r.notified).map((r) => ({ id: r.product_id, name: r.product_name || "상품" }));
    } catch { /* 무시 */ }
    try { myAddresses = await getMyAddresses(); } catch { /* 무시 */ }
  }

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Archivo:wght@500;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <StorePromo
        storeId={s.id}
        bar={{ on: toggles.bar_on === true, text: toggles.bar_text, link: toggles.bar_link, bg: toggles.bar_bg, fg: toggles.bar_fg }}
        popup={{ on: toggles.popup_on === true, title: toggles.popup_title, body: toggles.popup_body, image: toggles.popup_image, btnText: toggles.popup_btn_text, btnLink: toggles.popup_btn_link }}
      />
      <RestockPopup storeId={s.id} slug={slug} items={restockReady} />
      <Storefront
        slug={slug}
        customer={customer}
        wishlistIds={wishlistIds}
        myCoupons={myCoupons}
        openAuth={openAuth}
        memberGrade={memberGrade}
        addresses={myAddresses}
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
          points_on: s.points_on,
          ship_on: s.ship_on,
          ship_fee: s.ship_fee,
          ship_free_over: s.ship_free_over,
          ship_extra: s.ship_extra,
          qa_on: toggles.qa_on,
          reviews_on: toggles.reviews_on,
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
      {s.chat_on !== false && (
        <StoreBot
          faqs={faqs}
          storeName={s.name}
          style={(s.chat_style as BotStyle) || "designer"}
          greeting={s.chat_greeting}
          title={s.chat_name}
        />
      )}
    </>
  );
}
