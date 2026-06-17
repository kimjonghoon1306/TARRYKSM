"use client";

import { useState } from "react";
import { customerFindEmail, customerResetPw } from "@/app/[slug]/customer-actions";

const input =
  "w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 mb-2.5";
const btn =
  "press-glow w-full mt-2 rounded-xl border-none py-3.5 text-[15px] font-extrabold text-white cursor-pointer";
const btnBg = { background: "linear-gradient(135deg,#8b5cf6,#ec4899)" } as const;

// 아이디(이메일) 찾기
export function FindIdForm({ storeId, slug }: { storeId: string; slug: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function go() {
    setErr(""); setResult(""); setBusy(true);
    try {
      const r = await customerFindEmail(storeId, name, phone);
      if (!r.ok) setErr(r.error || "찾지 못했어요.");
      else setResult(r.email || "");
    } finally { setBusy(false); }
  }

  return (
    <>
      <input className={input} placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} />
      <input className={input} inputMode="tel" placeholder="가입한 전화번호" value={phone} onChange={(e) => setPhone(e.target.value)} />
      {err && <div style={{ color: "#e11d48", fontSize: 13, fontWeight: 600, margin: "2px 2px 8px" }}>{err}</div>}
      {result && (
        <div style={{ background: "#f3f0ff", borderRadius: 12, padding: "14px 16px", margin: "6px 0 4px", fontSize: 14 }}>
          가입된 이메일: <b style={{ color: "#8b5cf6" }}>{result}</b>
        </div>
      )}
      <button className={btn} style={btnBg} disabled={busy} onClick={go}>{busy ? "찾는 중…" : "아이디 찾기"}</button>
      <div style={{ textAlign: "center", marginTop: 14 }}>
        <a href={`/${slug}`} style={{ fontSize: 13, color: "#8b5cf6", fontWeight: 600 }}>← 쇼핑몰로 돌아가기</a>
      </div>
    </>
  );
}

// 비밀번호 재설정 (이메일+이름+전화 일치)
export function ResetPwForm({ storeId, slug }: { storeId: string; slug: string }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [newPw, setNewPw] = useState("");
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function go() {
    setErr(""); setBusy(true);
    try {
      const r = await customerResetPw(storeId, { email, name, phone, newPassword: newPw });
      if (!r.ok) setErr(r.error || "재설정에 실패했어요.");
      else setDone(true);
    } finally { setBusy(false); }
  }

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ fontSize: 40 }}>✅</div>
        <div style={{ fontWeight: 800, fontSize: 17, marginTop: 8 }}>비밀번호가 변경됐어요</div>
        <a href={`/${slug}`} style={{ display: "inline-block", marginTop: 18, color: "#8b5cf6", fontWeight: 700, fontSize: 14 }}>← 쇼핑몰에서 로그인하기</a>
      </div>
    );
  }
  return (
    <>
      <input className={input} type="email" placeholder="가입 이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className={input} placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} />
      <input className={input} inputMode="tel" placeholder="전화번호" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <input className={input} type="password" placeholder="새 비밀번호 (6자 이상)" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
      {err && <div style={{ color: "#e11d48", fontSize: 13, fontWeight: 600, margin: "2px 2px 8px" }}>{err}</div>}
      <button className={btn} style={btnBg} disabled={busy} onClick={go}>{busy ? "변경 중…" : "비밀번호 재설정"}</button>
      <div style={{ textAlign: "center", marginTop: 14 }}>
        <a href={`/${slug}`} style={{ fontSize: 13, color: "#8b5cf6", fontWeight: 600 }}>← 쇼핑몰로 돌아가기</a>
      </div>
    </>
  );
}
