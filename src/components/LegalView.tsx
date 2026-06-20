import Link from "next/link";

// 이용약관·개인정보처리방침 공용 렌더. 깔끔한 문서 레이아웃.
export default function LegalView({
  slug,
  storeName,
  title,
  sections,
  backHref,
}: {
  slug: string;
  storeName: string;
  title: string;
  sections: { h: string; body: string }[];
  backHref?: string;
}) {
  const back = backHref || `/${slug}`;
  return (
    <main style={{ minHeight: "100vh", background: "#f7f8fb", color: "#1a1a1a", padding: "0 0 80px" }}>
      <header
        style={{
          display: "flex", alignItems: "center", gap: 12, padding: "16px 24px",
          background: "rgba(255,255,255,.85)", backdropFilter: "blur(12px)",
          position: "sticky", top: 0, zIndex: 10, borderBottom: "1px solid rgba(0,0,0,.06)",
        }}
      >
        <Link href={back} style={{ fontSize: 14, color: "#555", textDecoration: "none", fontWeight: 600 }}>← {storeName}</Link>
        <b style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", fontSize: 16 }}>{title}</b>
      </header>

      <article style={{ maxWidth: 720, margin: "0 auto", padding: "36px 24px" }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-.5px" }}>{title}</h1>
        <p style={{ marginTop: 6, fontSize: 13, color: "#888" }}>{storeName}</p>

        <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 24 }}>
          {sections.map((s, i) => (
            <section key={i}>
              <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>{s.h}</h2>
              <p style={{ fontSize: 14, lineHeight: 1.75, color: "#444", whiteSpace: "pre-line" }}>{s.body}</p>
            </section>
          ))}
        </div>

        <p style={{ marginTop: 36, paddingTop: 18, borderTop: "1px solid rgba(0,0,0,.08)", fontSize: 12, color: "#aaa", lineHeight: 1.6 }}>
          본 문서는 표준 템플릿을 기반으로 자동 생성되었습니다. 사업 형태에 따라 내용이 다를 수 있으니 필요 시 전문가의 검토를 권장합니다.
        </p>
      </article>
    </main>
  );
}
