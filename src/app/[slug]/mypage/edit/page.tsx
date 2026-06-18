import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCustomer } from "../../customer-actions";
import CustomerProfileForm from "@/components/CustomerProfileForm";

export const dynamic = "force-dynamic";

export default async function EditProfile({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const [{ data: store }, cust] = await Promise.all([
    supabase.from("stores").select("id,name").eq("slug", slug).eq("published", true).maybeSingle(),
    getCustomer(),
  ]);
  if (!store) notFound();

  if (!cust || cust.store_id !== store.id) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f7f8fb", color: "#1a1a1a" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 44 }}>🔒</div>
          <p style={{ marginTop: 12, fontWeight: 800 }}>로그인이 필요해요</p>
          <Link href={`/${slug}?auth=login`} style={{ display: "inline-block", marginTop: 14, padding: "12px 24px", borderRadius: 12, background: "linear-gradient(135deg,#4f46e5,#6d28d9)", color: "#fff", fontWeight: 800, textDecoration: "none" }}>로그인하기</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(180deg,#eef0f7 0%,#f7f8fb 280px)", padding: "0 0 80px", color: "#1a1a1a" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 24px", background: "rgba(255,255,255,.8)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 10, borderBottom: "1px solid rgba(0,0,0,.05)" }}>
        <Link href={`/${slug}/mypage`} style={{ fontSize: 14, color: "#555", textDecoration: "none", fontWeight: 600 }}>← 마이페이지</Link>
        <b style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", fontSize: 16 }}>내 정보 수정</b>
      </header>
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "28px 20px" }}>
        <CustomerProfileForm name={cust.name} phone={cust.phone || ""} email={cust.email} />
      </div>
    </main>
  );
}
