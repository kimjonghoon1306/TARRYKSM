"use client";

import { useState, useTransition } from "react";
import { customerUpdateProfile, customerChangePassword } from "@/app/[slug]/customer-actions";

const box: React.CSSProperties = {
  width: "100%",
  background: "#fff",
  borderRadius: 16,
  padding: "22px 20px",
  boxShadow: "0 8px 24px -18px rgba(0,0,0,.3)",
};
const input: React.CSSProperties = {
  width: "100%",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: "12px 14px",
  fontSize: 15,
  outline: "none",
  marginTop: 6,
};
const label: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: "#374151" };
const btn: React.CSSProperties = {
  marginTop: 14,
  width: "100%",
  padding: "13px",
  borderRadius: 12,
  background: "linear-gradient(135deg,#4f46e5,#6d28d9)",
  color: "#fff",
  fontWeight: 800,
  fontSize: 15,
  border: "none",
  cursor: "pointer",
};

function Msg({ m }: { m: { ok: boolean; text: string } | null }) {
  if (!m) return null;
  return (
    <p style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: m.ok ? "#059669" : "#e11d48" }}>{m.text}</p>
  );
}

export default function CustomerProfileForm({ name, phone, email }: { name: string; phone: string; email: string }) {
  const [nm, setNm] = useState(name);
  const [ph, setPh] = useState(phone);
  const [pMsg, setPMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [cur, setCur] = useState("");
  const [nw, setNw] = useState("");
  const [nw2, setNw2] = useState("");
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [pending, start] = useTransition();

  function saveProfile() {
    setPMsg(null);
    start(async () => {
      const res = await customerUpdateProfile({ name: nm, phone: ph });
      setPMsg({ ok: res.ok, text: res.ok ? "저장됐어요 ✓" : res.error || "실패" });
    });
  }
  function savePw() {
    setPwMsg(null);
    if (nw !== nw2) {
      setPwMsg({ ok: false, text: "새 비밀번호가 서로 달라요." });
      return;
    }
    start(async () => {
      const res = await customerChangePassword({ current: cur, next: nw });
      if (res.ok) {
        setCur("");
        setNw("");
        setNw2("");
      }
      setPwMsg({ ok: res.ok, text: res.ok ? "비밀번호가 변경됐어요 ✓" : res.error || "실패" });
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={box}>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>기본 정보</div>
        <div style={{ ...label, color: "#9ca3af" }}>이메일 (아이디)</div>
        <div style={{ ...input, background: "#f3f4f6", color: "#6b7280" }}>{email}</div>
        <div style={{ marginTop: 14 }}>
          <span style={label}>이름</span>
          <input style={input} value={nm} onChange={(e) => setNm(e.target.value)} placeholder="이름" />
        </div>
        <div style={{ marginTop: 14 }}>
          <span style={label}>연락처</span>
          <input style={input} value={ph} onChange={(e) => setPh(e.target.value)} placeholder="010-1234-5678" />
        </div>
        <button style={btn} disabled={pending} onClick={saveProfile}>정보 저장</button>
        <Msg m={pMsg} />
      </div>

      <div style={box}>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>비밀번호 변경</div>
        <div>
          <span style={label}>현재 비밀번호</span>
          <input style={input} type="password" value={cur} onChange={(e) => setCur(e.target.value)} />
        </div>
        <div style={{ marginTop: 14 }}>
          <span style={label}>새 비밀번호 (6자 이상)</span>
          <input style={input} type="password" value={nw} onChange={(e) => setNw(e.target.value)} />
        </div>
        <div style={{ marginTop: 14 }}>
          <span style={label}>새 비밀번호 확인</span>
          <input style={input} type="password" value={nw2} onChange={(e) => setNw2(e.target.value)} />
        </div>
        <button style={btn} disabled={pending} onClick={savePw}>비밀번호 변경</button>
        <Msg m={pwMsg} />
      </div>
    </div>
  );
}
