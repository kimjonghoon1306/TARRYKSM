"use client";

import { useEffect, useState } from "react";
import { customerLogin, customerSignup } from "@/app/[slug]/customer-actions";

// 쇼핑몰 손님 로그인/회원가입 — PC는 화면 중앙 카드, 모바일은 하단 시트.
export default function CustomerAuthSheet({
  storeId,
  storeName,
  slug,
  onClose,
}: {
  storeId: string;
  storeName?: string;
  slug: string;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 641px)");
    const on = () => setIsDesktop(mq.matches);
    on();
    mq.addEventListener("change", on);
    document.body.style.overflow = "hidden";
    return () => { mq.removeEventListener("change", on); document.body.style.overflow = ""; };
  }, []);

  async function submit() {
    setErr("");
    setBusy(true);
    try {
      const res =
        tab === "login"
          ? await customerLogin(storeId, { email, password: pw })
          : await customerSignup(storeId, { email, password: pw, name, phone });
      if (!res.ok) { setErr(res.error || "오류가 발생했어요."); return; }
      window.location.reload();
    } finally { setBusy(false); }
  }

  const C = { brand: "#8b5cf6", text: "#1a1a18", sub: "#9ca3af", border: "rgba(0,0,0,.07)", inputBg: "#f5f3ef" };
  const inputStyle: React.CSSProperties = {
    width: "100%", background: C.inputBg, border: "1.5px solid transparent", borderRadius: 12,
    padding: "13px 15px", fontSize: 14, color: C.text, outline: "none", boxSizing: "border-box", transition: "border-color .18s",
  };
  const label: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 700, color: C.sub, marginBottom: 7 };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999, display: "flex",
        alignItems: isDesktop ? "center" : "flex-end", justifyContent: "center",
        background: "rgba(0,0,0,.55)", backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 420, maxHeight: "92vh", overflowY: "auto", background: "#fff",
          borderRadius: isDesktop ? 24 : "24px 24px 0 0",
          padding: "30px 26px 32px", boxShadow: "0 30px 80px -30px rgba(0,0,0,.5)",
          animation: isDesktop ? "cafade .26s ease" : "caup .34s cubic-bezier(.2,.9,.2,1)",
        }}
      >
        <style>{`@keyframes caup{from{transform:translateY(50px);opacity:.5}to{transform:none;opacity:1}}@keyframes cafade{from{transform:scale(.96);opacity:0}to{transform:none;opacity:1}}`}</style>

        {/* 로고 */}
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{ width: 52, height: 52, margin: "0 auto 12px", borderRadius: 16, background: "linear-gradient(135deg,#8b5cf6,#ec4899)", display: "grid", placeItems: "center", color: "#fff", fontSize: 24, fontWeight: 800 }}>
            {(storeName || "S").slice(0, 1)}
          </div>
          <h2 style={{ fontSize: 21, fontWeight: 900, letterSpacing: "-.5px", margin: 0 }}>
            {tab === "login" ? "로그인" : "회원가입"}
          </h2>
          <p style={{ fontSize: 13, color: C.sub, marginTop: 5 }}>{storeName || "쇼핑몰"}</p>
        </div>

        {/* 탭 */}
        <div style={{ display: "flex", gap: 4, background: "#f3f0ff", borderRadius: 14, padding: 4, marginBottom: 20 }}>
          {(["login", "signup"] as const).map((t) => (
            <button key={t} type="button" onClick={() => { setTab(t); setErr(""); }}
              style={{ flex: 1, padding: "10px 0", borderRadius: 11, border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 800,
                background: tab === t ? "linear-gradient(135deg,#8b5cf6,#ec4899)" : "transparent",
                color: tab === t ? "#fff" : "#9ca3af", boxShadow: tab === t ? "0 4px 12px rgba(139,92,246,.3)" : "none", transition: "all .2s" }}>
              {t === "login" ? "로그인" : "회원가입"}
            </button>
          ))}
        </div>

        {tab === "signup" && (
          <div style={{ marginBottom: 13 }}>
            <label style={label}>이름</label>
            <input style={inputStyle} placeholder="홍길동" value={name} onChange={(e) => setName(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = C.brand)} onBlur={(e) => (e.target.style.borderColor = "transparent")} />
          </div>
        )}
        <div style={{ marginBottom: 13 }}>
          <label style={label}>이메일</label>
          <input style={inputStyle} type="email" inputMode="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = C.brand)} onBlur={(e) => (e.target.style.borderColor = "transparent")} />
        </div>
        <div style={{ marginBottom: 13 }}>
          <label style={label}>비밀번호</label>
          <div style={{ position: "relative" }}>
            <input style={{ ...inputStyle, paddingRight: 46 }} type={showPw ? "text" : "password"} placeholder={tab === "signup" ? "6자 이상" : "••••••••"}
              value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
              onFocus={(e) => (e.target.style.borderColor = C.brand)} onBlur={(e) => (e.target.style.borderColor = "transparent")} />
            <button type="button" onClick={() => setShowPw((v) => !v)} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", fontSize: 17, opacity: .6 }}>
              {showPw ? "🙈" : "👁"}
            </button>
          </div>
        </div>
        {tab === "signup" && (
          <div style={{ marginBottom: 13 }}>
            <label style={label}>전화번호 <span style={{ fontWeight: 500, opacity: .7 }}>(선택)</span></label>
            <input style={inputStyle} inputMode="tel" placeholder="010-0000-0000" value={phone} onChange={(e) => setPhone(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = C.brand)} onBlur={(e) => (e.target.style.borderColor = "transparent")} />
          </div>
        )}

        {err && <div style={{ color: "#e11d48", fontSize: 13, fontWeight: 600, margin: "2px 2px 10px" }}>{err}</div>}

        <button type="button" disabled={busy} onClick={submit}
          style={{ width: "100%", marginTop: 6, padding: 15, borderRadius: 14, border: "none", background: "linear-gradient(135deg,#8b5cf6,#ec4899)", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", opacity: busy ? .6 : 1, boxShadow: "0 10px 24px -10px rgba(139,92,246,.6)" }}>
          {busy ? "처리 중…" : tab === "login" ? "로그인" : "가입하고 시작하기"}
        </button>

        {tab === "login" && (
          <div style={{ marginTop: 16, textAlign: "center", fontSize: 12.5, color: "#aaa" }}>
            <a href={`/${slug}/find-id`} style={{ color: C.brand, fontWeight: 600, textDecoration: "none" }}>아이디 찾기</a>
            <span style={{ margin: "0 8px", opacity: .4 }}>·</span>
            <a href={`/${slug}/reset-pw`} style={{ color: C.brand, fontWeight: 600, textDecoration: "none" }}>비밀번호 찾기</a>
          </div>
        )}

        <button type="button" onClick={onClose} style={{ width: "100%", marginTop: 14, padding: 10, border: "none", background: "none", color: "#bbb", fontSize: 13, cursor: "pointer" }}>닫기</button>
      </div>
    </div>
  );
}
