import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCustomer } from "../../customer-actions";
import CustomerProfileForm from "@/components/CustomerProfileForm";

export const dynamic = "force-dynamic";

const STYLE = `
.pe-wrap{min-height:100vh;background:#eef0f7;color:#16161d}
.pe-top{display:flex;align-items:center;gap:12px;padding:14px 22px;background:rgba(255,255,255,.82);backdrop-filter:blur(12px);position:sticky;top:0;z-index:20;border-bottom:1px solid rgba(0,0,0,.05)}
.pe-top a{font-size:14px;color:#555;text-decoration:none;font-weight:600}
.pe-top b{position:absolute;left:50%;transform:translateX(-50%);font-size:16px}
.pe-grid{display:grid;grid-template-columns:1fr}
@media(min-width:920px){.pe-grid{grid-template-columns:minmax(420px,5fr) 7fr;min-height:calc(100vh - 53px)}}
/* ── 좌측 장식 패널 ── */
.pe-aside{position:relative;overflow:hidden;padding:48px 40px;color:#fff;background:linear-gradient(125deg,#3b2f8f,#5b4be0 45%,#8b5cf6 80%,#b06ad6);background-size:220% 220%;animation:pe-grad 14s ease infinite;display:flex;flex-direction:column;justify-content:center;gap:26px;min-height:300px}
@keyframes pe-grad{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
.pe-blob{position:absolute;border-radius:50%;filter:blur(2px);opacity:.5;pointer-events:none}
.pe-b1{width:200px;height:200px;background:rgba(255,255,255,.16);top:-50px;right:-40px;animation:pe-float 7s ease-in-out infinite}
.pe-b2{width:150px;height:150px;background:rgba(176,106,214,.4);bottom:-30px;left:-30px;animation:pe-float2 9s ease-in-out infinite}
.pe-b3{width:90px;height:90px;background:rgba(255,255,255,.12);bottom:90px;right:60px;animation:pe-float 6s ease-in-out infinite .5s}
@keyframes pe-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
@keyframes pe-float2{0%,100%{transform:translate(0,0)}50%{transform:translate(10px,14px)}}
.pe-spark{position:absolute;animation:pe-twinkle 2.6s ease-in-out infinite}
@keyframes pe-twinkle{0%,100%{opacity:.25;transform:scale(.7)}50%{opacity:1;transform:scale(1.15)}}
.pe-mascot-wrap{position:relative;z-index:2;display:flex;justify-content:center}
.pe-mascot{width:200px;height:200px;animation:pe-float 5s ease-in-out infinite;filter:drop-shadow(0 18px 30px rgba(0,0,0,.25))}
.pe-eyes{transform-box:fill-box;transform-origin:center;animation:pe-blink 4.5s infinite}
@keyframes pe-blink{0%,93%,100%{transform:scaleY(1)}96%{transform:scaleY(.12)}}
.pe-hand{transform-box:fill-box;transform-origin:bottom center;animation:pe-wave 2.8s ease-in-out infinite}
@keyframes pe-wave{0%,100%{transform:rotate(0)}20%{transform:rotate(20deg)}40%{transform:rotate(-6deg)}60%{transform:rotate(16deg)}}
.pe-hello{position:relative;z-index:2;text-align:center}
.pe-hello h1{font-size:27px;font-weight:900;letter-spacing:-.6px;line-height:1.3;margin:0}
.pe-hello p{margin:10px 0 0;font-size:14.5px;opacity:.92;line-height:1.6}
.pe-chip{display:inline-flex;align-items:center;gap:6px;margin-top:16px;padding:8px 16px;border-radius:999px;background:rgba(255,255,255,.2);font-size:12.5px;font-weight:800;backdrop-filter:blur(4px)}
/* ── 우측 폼 ── */
.pe-main{display:flex;align-items:center;justify-content:center;padding:40px 22px}
.pe-forms{width:100%;max-width:480px;display:flex;flex-direction:column;gap:18px}
.pe-card{background:#fff;border-radius:22px;padding:26px 24px;box-shadow:0 18px 44px -26px rgba(40,30,90,.45);opacity:0;animation:pe-pop .55s cubic-bezier(.2,.8,.25,1) forwards}
@keyframes pe-pop{from{opacity:0;transform:translateY(22px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
.pe-card-h{display:flex;align-items:center;gap:10px;font-size:16px;font-weight:800;margin-bottom:16px}
.pe-card-ico{display:grid;place-items:center;width:34px;height:34px;border-radius:11px;color:#fff;background:linear-gradient(135deg,#4f46e5,#8b5cf6);box-shadow:0 8px 18px -8px rgba(79,70,229,.7)}
.pe-label{display:block;font-size:12.5px;font-weight:700;color:#4b5563;margin:14px 0 0}
.pe-label.dim{color:#9ca3af}
.pe-label:first-of-type{margin-top:0}
.pe-readonly{margin-top:6px;background:#f3f4f6;color:#6b7280;border-radius:12px;padding:12px 14px;font-size:14.5px}
.pe-input{width:100%;margin-top:6px;border:1.6px solid #e5e7eb;border-radius:12px;padding:12px 14px;font-size:15px;outline:none;transition:border-color .18s,box-shadow .18s,transform .12s;background:#fff}
.pe-input:focus{border-color:#7c6cf0;box-shadow:0 0 0 4px rgba(124,108,240,.18)}
.pe-btn{position:relative;overflow:hidden;margin-top:18px;width:100%;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:14px;border:none;border-radius:14px;background:linear-gradient(135deg,#4f46e5,#7c3aed 55%,#9333ea);color:#fff;font-weight:800;font-size:15px;cursor:pointer;box-shadow:0 12px 26px -12px rgba(124,58,237,.75);transition:transform .14s,box-shadow .14s,filter .14s}
.pe-btn:hover{transform:translateY(-2px) scale(1.012);filter:brightness(1.06);box-shadow:0 18px 34px -14px rgba(124,58,237,.85)}
.pe-btn:active{transform:translateY(0) scale(.97)}
.pe-btn:disabled{opacity:.6;cursor:default;transform:none}
.pe-shine{position:absolute;top:0;left:0;width:40%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.55),transparent);transform:translateX(-160%) skewX(-18deg);pointer-events:none}
.pe-btn:hover .pe-shine{animation:pe-shimmer .9s ease}
@keyframes pe-shimmer{from{transform:translateX(-160%) skewX(-18deg)}to{transform:translateX(320%) skewX(-18deg)}}
.pe-msg{margin-top:11px;font-size:13px;font-weight:700}
.pe-msg.ok{color:#059669}
.pe-msg.err{color:#e11d48}
@media(prefers-reduced-motion:reduce){.pe-mascot,.pe-blob,.pe-spark,.pe-eyes,.pe-hand,.pe-aside,.pe-card{animation:none!important}.pe-card{opacity:1}}
`;

function Mascot() {
  return (
    <svg className="pe-mascot" viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <linearGradient id="peBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#efe9ff" />
        </linearGradient>
      </defs>
      {/* antenna + star */}
      <line x1="100" y1="44" x2="100" y2="24" stroke="#ffe27a" strokeWidth="4" strokeLinecap="round" />
      <path d="M100 10l3.2 6.6 7.3 1-5.3 5.1 1.3 7.2-6.5-3.4-6.5 3.4 1.3-7.2-5.3-5.1 7.3-1z" fill="#ffe27a" />
      {/* body */}
      <rect x="38" y="44" width="124" height="120" rx="44" fill="url(#peBody)" />
      {/* eyes */}
      <g className="pe-eyes">
        <circle cx="80" cy="98" r="8.5" fill="#3b2a6b" />
        <circle cx="120" cy="98" r="8.5" fill="#3b2a6b" />
        <circle cx="83" cy="95" r="2.6" fill="#fff" />
        <circle cx="123" cy="95" r="2.6" fill="#fff" />
      </g>
      {/* cheeks */}
      <circle cx="68" cy="116" r="7" fill="#ff9fc0" opacity=".75" />
      <circle cx="132" cy="116" r="7" fill="#ff9fc0" opacity=".75" />
      {/* smile */}
      <path d="M83 118 Q100 134 117 118" stroke="#3b2a6b" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* waving hand */}
      <g className="pe-hand">
        <circle cx="158" cy="86" r="13" fill="#fff" />
        <circle cx="158" cy="86" r="13" fill="none" stroke="#e2dbff" strokeWidth="2" />
      </g>
      {/* little base shadow feet */}
      <ellipse cx="78" cy="168" rx="12" ry="6" fill="#3b2f8f" opacity=".25" />
      <ellipse cx="122" cy="168" rx="12" ry="6" fill="#3b2f8f" opacity=".25" />
    </svg>
  );
}

const Spark = ({ style }: { style: React.CSSProperties }) => (
  <svg className="pe-spark" width="22" height="22" viewBox="0 0 24 24" style={style} aria-hidden="true">
    <path d="M12 0l2.4 8.6L24 12l-9.6 3.4L12 24l-2.4-8.6L0 12l9.6-3.4z" fill="rgba(255,255,255,.85)" />
  </svg>
);

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
    <main className="pe-wrap">
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <header className="pe-top">
        <Link href={`/${slug}/mypage`}>← 마이페이지</Link>
        <b>내 정보 수정</b>
      </header>

      <div className="pe-grid">
        <aside className="pe-aside">
          <span className="pe-blob pe-b1" />
          <span className="pe-blob pe-b2" />
          <span className="pe-blob pe-b3" />
          <Spark style={{ top: 60, left: 48 }} />
          <Spark style={{ top: 150, right: 40, animationDelay: ".8s" }} />
          <Spark style={{ bottom: 70, left: 70, animationDelay: "1.4s" }} />

          <div className="pe-mascot-wrap"><Mascot /></div>
          <div className="pe-hello">
            <h1>{cust.name}님,<br />내 정보를 관리해요</h1>
            <p>이름·연락처·비밀번호를<br />언제든 바꿀 수 있어요.</p>
            <span className="pe-chip">✨ {store.name} 회원</span>
          </div>
        </aside>

        <section className="pe-main">
          <CustomerProfileForm name={cust.name} phone={cust.phone || ""} email={cust.email} />
        </section>
      </div>
    </main>
  );
}
