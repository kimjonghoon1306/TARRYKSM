import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCustomer, getWishlistProducts } from "../customer-actions";
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

  // 쇼핑몰 + 손님 정보 병렬 조회 (독립 → 순차 왕복 제거)
  const [{ data: store }, cust] = await Promise.all([
    supabase.from("stores").select("id,name,skin").eq("slug", slug).eq("published", true).maybeSingle(),
    getCustomer(),
  ]);
  if (!store) notFound();

  // 비로그인 손님 → 그냥 튕기지 말고 로그인/회원가입 안내
  if (!cust || cust.store_id !== store.id) {
    return (
      <main style={{ minHeight: "100vh", background: "linear-gradient(180deg,#eef0f7 0%,#f7f8fb 360px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, color: "#1a1a1a" }}>
        <div style={{ width: "100%", maxWidth: 420, background: "#fff", borderRadius: 24, padding: "40px 28px", textAlign: "center", boxShadow: "0 20px 50px -28px rgba(0,0,0,.3)" }}>
          <div style={{ fontSize: 46 }}>🔒</div>
          <h1 style={{ fontSize: 21, fontWeight: 900, marginTop: 14 }}>로그인이 필요해요</h1>
          <p style={{ fontSize: 14, color: "#6b7280", marginTop: 8, lineHeight: 1.6 }}>
            로그인하면 <b>주문 내역 · 찜한 상품 · 적립금</b>을<br />한곳에서 확인할 수 있어요.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
            <Link href={`/${slug}?auth=login`} style={{ padding: "14px", borderRadius: 14, background: "linear-gradient(135deg,#4f46e5,#6d28d9)", color: "#fff", fontWeight: 800, fontSize: 15, textDecoration: "none" }}>로그인하기</Link>
            <Link href={`/${slug}?auth=signup`} style={{ padding: "14px", borderRadius: 14, background: "#f3f4f6", color: "#374151", fontWeight: 800, fontSize: 15, textDecoration: "none" }}>회원가입하기</Link>
          </div>
          <Link href={`/${slug}`} style={{ display: "inline-block", marginTop: 18, fontSize: 13, color: "#9ca3af", fontWeight: 600, textDecoration: "none" }}>← {store.name} 쇼핑 계속하기</Link>
        </div>
      </main>
    );
  }

  // 주문내역 + 찜한 상품 병렬 조회
  const [{ data: orders }, wish] = await Promise.all([
    supabase.from("orders").select("id,total,status,created_at").eq("customer_id", cust.id).order("created_at", { ascending: false }),
    getWishlistProducts(),
  ]);
  const list = orders ?? [];

  const initial = (cust.name || "회").slice(0, 1);
  const totalSpent = list.filter((o) => o.status !== "취소").reduce((s, o) => s + (o.total || 0), 0);
  const done = list.filter((o) => o.status === "완료").length;

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(180deg,#eef0f7 0%,#f7f8fb 360px)", padding: "0 0 80px", color: "#1a1a1a" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 24px", background: "rgba(255,255,255,.8)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 10, borderBottom: "1px solid rgba(0,0,0,.05)" }}>
        <Link href={`/${slug}`} style={{ fontSize: 14, color: "#555", textDecoration: "none", fontWeight: 600 }}>← {store.name}</Link>
        <b style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", fontSize: 16, color: "#1a1a1a" }}>마이페이지</b>
        <span style={{ marginLeft: "auto" }}><CustomerLogoutButton slug={slug} /></span>
      </header>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>
        {/* 히어로 프로필 카드 (그라데이션, 꽉찬 느낌) */}
        <div style={{ position: "relative", overflow: "hidden", borderRadius: 26, padding: "34px 32px", color: "#fff", background: "linear-gradient(135deg,#312e81 0%,#4f46e5 55%,#6d28d9 100%)", boxShadow: "0 24px 60px -30px rgba(49,46,129,.6)" }}>
          <div style={{ position: "absolute", right: -40, top: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,.12)" }} />
          <div style={{ position: "absolute", right: 70, bottom: -60, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,.08)" }} />
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 68, height: 68, borderRadius: 20, background: "rgba(255,255,255,.25)", display: "grid", placeItems: "center", fontSize: 30, fontWeight: 900, flexShrink: 0 }}>{initial}</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-.5px" }}>{cust.name}님</div>
              <div style={{ fontSize: 13.5, opacity: .9, marginTop: 3 }}>{cust.email}</div>
              <div style={{ display: "inline-block", marginTop: 9, fontSize: 11.5, fontWeight: 800, padding: "4px 12px", borderRadius: 999, background: "rgba(255,255,255,.22)" }}>⭐ {store.name} 회원</div>
            </div>
          </div>
        </div>

        {/* 통계 4칸 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 14, marginTop: 18 }}>
          {[
            { l: "적립금", v: won(cust.points), c: "#4f46e5", ico: "💰" },
            { l: "전체 주문", v: `${list.length}건`, c: "#1e293b", ico: "🧾" },
            { l: "완료", v: `${done}건`, c: "#1e293b", ico: "✅" },
            { l: "누적 구매액", v: won(totalSpent), c: "#1e293b", ico: "🛍" },
          ].map((s) => (
            <div key={s.l} style={{ background: "#fff", borderRadius: 18, padding: "20px 18px", boxShadow: "0 8px 24px -18px rgba(0,0,0,.3)" }}>
              <div style={{ fontSize: 22 }}>{s.ico}</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>{s.l}</div>
              <div style={{ fontSize: 19, fontWeight: 800, color: s.c, marginTop: 2 }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* 빠른 메뉴 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginTop: 14 }}>
          {[
            { l: "쇼핑 계속하기", d: "신상품 보러가기", ico: "🛒", href: `/${slug}` },
            { l: "고객센터", d: store.name, ico: "💬", href: `/${slug}` },
            { l: "내 정보", d: cust.email, ico: "👤", href: `/${slug}/mypage` },
          ].map((m) => (
            <Link key={m.l} href={m.href} style={{ textDecoration: "none", color: "inherit", background: "#fff", borderRadius: 18, padding: "20px", boxShadow: "0 8px 24px -18px rgba(0,0,0,.3)", display: "block" }}>
              <div style={{ fontSize: 24 }}>{m.ico}</div>
              <div style={{ fontSize: 15, fontWeight: 800, marginTop: 8 }}>{m.l}</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{m.d}</div>
            </Link>
          ))}
        </div>

        {/* 찜한 상품 */}
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: "34px 4px 14px" }}>
          🩷 찜한 상품{wish.length > 0 && <span style={{ color: "#6d28d9", marginLeft: 6 }}>{wish.length}</span>}
        </h2>
        {wish.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 20, padding: "44px 20px", textAlign: "center", boxShadow: "0 8px 24px -18px rgba(0,0,0,.3)" }}>
            <div style={{ fontSize: 40 }}>🤍</div>
            <div style={{ fontWeight: 800, fontSize: 15, marginTop: 10 }}>아직 찜한 상품이 없어요</div>
            <div style={{ fontSize: 13, color: "#8b8f98", marginTop: 5 }}>상품의 ♡를 눌러 마음에 든 상품을 모아보세요!</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 14 }}>
            {wish.map((p) => (
              <Link key={p.id} href={`/${slug}`} style={{ textDecoration: "none", color: "inherit", background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 24px -20px rgba(0,0,0,.3)", display: "block" }}>
                <div style={{ position: "relative", width: "100%", paddingBottom: "100%", background: "#f4f2fb", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 40 }}>
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      p.emoji || "📦"
                    )}
                  </div>
                </div>
                <div style={{ padding: "12px 14px" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{p.name}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#4f46e5", marginTop: 6 }}>{won(p.price)}</div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 주문 내역 */}
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: "34px 4px 14px" }}>📦 주문 내역</h2>
        {list.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 20, padding: "60px 20px", textAlign: "center", boxShadow: "0 8px 24px -18px rgba(0,0,0,.3)" }}>
            <div style={{ fontSize: 44 }}>🛍</div>
            <div style={{ fontWeight: 800, fontSize: 16, marginTop: 12 }}>아직 주문 내역이 없어요</div>
            <div style={{ fontSize: 13, color: "#8b8f98", marginTop: 5 }}>마음에 드는 상품을 담아보세요!</div>
            <Link href={`/${slug}`} style={{ display: "inline-block", marginTop: 18, padding: "12px 26px", borderRadius: 999, background: "linear-gradient(135deg,#4f46e5,#6d28d9)", color: "#fff", fontWeight: 800, fontSize: 14, textDecoration: "none" }}>쇼핑하러 가기 →</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {list.map((o) => (
              <div key={o.id} style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 8px 24px -20px rgba(0,0,0,.3)" }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{won(o.total)}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>{fmt(o.created_at)}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 999, background: o.status === "취소" ? "#fee2e2" : "#eef6ff", color: o.status === "취소" ? "#e11d48" : "#2563eb" }}>
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
