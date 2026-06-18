"use client";

import { useState, useTransition } from "react";
import { customerUpdateProfile, customerChangePassword } from "@/app/[slug]/customer-actions";

function Msg({ m }: { m: { ok: boolean; text: string } | null }) {
  if (!m) return null;
  return <p className={"pe-msg " + (m.ok ? "ok" : "err")}>{m.text}</p>;
}

const IconUser = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);
const IconLock = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="10" width="16" height="11" rx="2.5" /><path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);
const IconSave = (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 13l4 4L19 7" />
  </svg>
);

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
      if (res.ok) { setCur(""); setNw(""); setNw2(""); }
      setPwMsg({ ok: res.ok, text: res.ok ? "비밀번호가 변경됐어요 ✓" : res.error || "실패" });
    });
  }

  return (
    <div className="pe-forms">
      <div className="pe-card" style={{ animationDelay: ".05s" }}>
        <div className="pe-card-h"><span className="pe-card-ico">{IconUser}</span> 기본 정보</div>
        <label className="pe-label dim">이메일 (아이디)</label>
        <div className="pe-readonly">{email}</div>
        <label className="pe-label">이름</label>
        <input className="pe-input" value={nm} onChange={(e) => setNm(e.target.value)} placeholder="이름" />
        <label className="pe-label">연락처</label>
        <input className="pe-input" value={ph} onChange={(e) => setPh(e.target.value)} placeholder="010-1234-5678" />
        <button className="pe-btn" disabled={pending} onClick={saveProfile}>
          {IconSave} 정보 저장<span className="pe-shine" />
        </button>
        <Msg m={pMsg} />
      </div>

      <div className="pe-card" style={{ animationDelay: ".16s" }}>
        <div className="pe-card-h"><span className="pe-card-ico">{IconLock}</span> 비밀번호 변경</div>
        <label className="pe-label">현재 비밀번호</label>
        <input className="pe-input" type="password" value={cur} onChange={(e) => setCur(e.target.value)} />
        <label className="pe-label">새 비밀번호 (6자 이상)</label>
        <input className="pe-input" type="password" value={nw} onChange={(e) => setNw(e.target.value)} />
        <label className="pe-label">새 비밀번호 확인</label>
        <input className="pe-input" type="password" value={nw2} onChange={(e) => setNw2(e.target.value)} />
        <button className="pe-btn" disabled={pending} onClick={savePw}>
          {IconLock} 비밀번호 변경<span className="pe-shine" />
        </button>
        <Msg m={pwMsg} />
      </div>
    </div>
  );
}
