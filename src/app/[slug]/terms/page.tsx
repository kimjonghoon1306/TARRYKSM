import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { termsSections, type BizInfo } from "@/lib/legal";
import LegalView from "@/components/LegalView";

export default async function TermsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: store } = await supabase
    .from("stores")
    .select("name,biz_company,biz_owner,biz_number,biz_mailorder,biz_address,biz_phone,biz_email")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (!store) notFound();
  const s = store as Record<string, string | null>;
  const biz: BizInfo = {
    name: s.name as string,
    company: s.biz_company, owner: s.biz_owner, number: s.biz_number,
    mailorder: s.biz_mailorder, address: s.biz_address, phone: s.biz_phone, email: s.biz_email,
  };
  return <LegalView slug={slug} storeName={s.name as string} title="이용약관" sections={termsSections(biz)} />;
}
