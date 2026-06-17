import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCustomer } from "../customer-actions";
import CustomerLogoutButton from "@/components/CustomerLogoutButton";

export const dynamic = "force-dynamic";

const won = (n: number) => "₩" + (n || 0).toLocaleString("ko-KR");
function fmt(d: string) {
  const t = new Date(d);
  return `${t.getFullYear()}.${String(t.getMonth() + 1).padStart(2, "0")}.${String(t.getDate()).padStart(2, "0")}`;
}

export default async function MyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: store } = await supabase
    .from("stores").select("id,name,skin").eq("slug", slug).eq("published", true).maybeSingle();
  if (!store) notFound();

  const cust = await getCustomer();
  if (!cust || cust.store_id !== store.id) redirect(`/${slug}`); // 비로그인은 쇼핑몰로

  // 내 주문 내역 (customer_id 연결분)
  const { data: orders } = await supabase
    .from("orders").select("id,total,status,created_at").eq("customer_id", cust.id).order("created_at", { ascending: false });
  const list = orders ?? [];

  return (
    <main style={{ minHeight: "100vh", background: "#faf9f6", padding: "0 0 60px" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid #eee", background: "#fff", position: "sticky", top: 0, zIndex: 10 }}>
        <Link href={`/${slug}`} style={{ fontSize: 14, color: "#888" }}>← {store.name}</Link>
        <b style={{ marginLeft: "auto", fontSize: 16 }}>마이페이지</b>
        <span style={{ marginLeft: "auto" }}><CustomerLogoutButton slug={slug} /></span>
      </header>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 20px" }}>
        {/* 내 정보 카드 */}
        <div style={{ background: "#fff", borderRadius: 18, padding: 22, boxShadow: "0 10px 30px -18px rgba(0,0,0,.3)" }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{cust.name}님</div>
          <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{cust.email}</div>
          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <div style={{ flex: 1, background: "#f3f0ff", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: 12, color: "#888" }}>적립금</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#8b5cf6" }}>{won(cust.points)}</div>
            </div>
            <div style={{ flex: 1, background: "#f6f6f6", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: 12, color: "#888" }}>주문</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{list.length}건</div>
            </div>
          </div>
        </div>

        {/* 주문 내역 */}
        <h2 style={{ fontSize: 15, fontWeight: 800, margin: "28px 4px 12px" }}>주문 내역</h2>
        {list.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 16, padding: "44px 20px", textAlign: "center", color: "#aaa", fontSize: 14 }}>
            아직 주문 내역이 없어요.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {list.map((o) => (
              <div key={o.id} style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{won(o.total)}</div>
                  <div style={{ fontSize: 12, color: "#999", marginTop: 3 }}>{fmt(o.created_at)}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 999, background: o.status === "취소" ? "#fee" : "#eef6ff", color: o.status === "취소" ? "#e11d48" : "#2563eb" }}>
                  {o.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
