"use client";

import { useState } from "react";
import { customerLogin, customerSignup } from "@/app/[slug]/customer-actions";

// 쇼핑몰 손님 로그인/회원가입 시트 (모달). 성공하면 새로고침해 로그인 상태 반영.
export default function CustomerAuthSheet({
  storeId,
  slug,
  onClose,
}: {
  storeId: string;
  slug: string;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setErr("");
    setBusy(true);
    try {
      const res =
        tab === "login"
          ? await customerLogin(storeId, { email, password: pw })
          : await customerSignup(storeId, { email, password: pw, name, phone });
      if (!res.ok) {
        setErr(res.error || "오류가 발생했어요.");
        return;
      }
      window.location.reload(); // 로그인 상태 반영
    } finally {
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-white/15 dark:bg-white/5";

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(0,0,0,.55)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#16172b]"
        style={{ width: "100%", maxWidth: 460, maxHeight: "92vh", overflowY: "auto", borderRadius: "22px 22px 0 0", padding: "26px 22px 30px", animation: "caup .32s cubic-bezier(.2,.9,.2,1)" }}
      >
        <style>{`@keyframes caup{from{transform:translateY(40px);opacity:0}to{transform:none;opacity:1}}`}</style>
        <div style={{ display: "flex", gap: 6, marginBottom: 18, background: "rgba(0,0,0,.05)", padding: 5, borderRadius: 999 }}>
          {(["login", "signup"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setTab(t); setErr(""); }}
              style={{ flex: 1, padding: "9px 0", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 800, background: tab === t ? "#8b5cf6" : "transparent", color: tab === t ? "#fff" : "#888" }}
            >
              {t === "login" ? "로그인" : "회원가입"}
            </button>
          ))}
        </div>

        {tab === "signup" && (
          <input className={input + " mb-2.5"} placeholder="이름 *" value={name} onChange={(e) => setName(e.target.value)} />
        )}
        <input className={input + " mb-2.5"} type="email" inputMode="email" placeholder="이메일 *" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className={input + " mb-2.5"} type="password" placeholder="비밀번호 * (6자 이상)" value={pw} onChange={(e) => setPw(e.target.value)} />
        {tab === "signup" && (
          <input className={input + " mb-2.5"} inputMode="tel" placeholder="전화번호 (선택)" value={phone} onChange={(e) => setPhone(e.target.value)} />
        )}

        {err && <div style={{ color: "#e11d48", fontSize: 13, fontWeight: 600, margin: "4px 2px 10px" }}>{err}</div>}

        <button
          type="button"
          disabled={busy}
          onClick={submit}
          className="press-glow"
          style={{ width: "100%", marginTop: 8, padding: "14px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#8b5cf6,#ec4899)", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", opacity: busy ? 0.6 : 1 }}
        >
          {busy ? "처리 중…" : tab === "login" ? "로그인" : "가입하고 시작하기"}
        </button>

        {tab === "login" && (
          <div style={{ marginTop: 14, textAlign: "center", fontSize: 12.5, color: "#999" }}>
            <a href={`/${slug}/find-id`} style={{ color: "#8b5cf6", fontWeight: 600 }}>아이디 찾기</a>
            <span style={{ margin: "0 8px", opacity: 0.4 }}>·</span>
            <a href={`/${slug}/reset-pw`} style={{ color: "#8b5cf6", fontWeight: 600 }}>비밀번호 찾기</a>
          </div>
        )}
      </div>
    </div>
  );
}
