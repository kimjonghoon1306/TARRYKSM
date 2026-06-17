import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FindIdForm } from "@/components/CustomerFindForms";

export const dynamic = "force-dynamic";

export default async function FindId({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: store } = await supabase
    .from("stores").select("id,name").eq("slug", slug).eq("published", true).maybeSingle();
  if (!store) notFound();

  return (
    <main style={{ minHeight: "100vh", background: "#faf9f6", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420, background: "#fff", borderRadius: 22, padding: "30px 26px", boxShadow: "0 20px 50px -28px rgba(0,0,0,.4)" }}>
        <div style={{ fontSize: 13, color: "#999", fontWeight: 700 }}>{store.name}</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "4px 0 20px" }}>아이디(이메일) 찾기</h1>
        <FindIdForm storeId={store.id as string} slug={slug} />
      </div>
    </main>
  );
}
