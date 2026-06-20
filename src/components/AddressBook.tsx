"use client";

import { useState, useTransition } from "react";
import { addAddress, deleteAddress, type Address } from "@/app/[slug]/customer-actions";

// 마이페이지 배송지 주소록 — 여러 배송지 저장·삭제·기본 지정.
export default function AddressBook({ initial }: { initial: Address[] }) {
  const [list, setList] = useState<Address[]>(initial);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ label: "", recipient: "", phone: "", address: "", memo: "", isDefault: initial.length === 0 });
  const [pending, start] = useTransition();
  const [err, setErr] = useState("");

  const inp: React.CSSProperties = { width: "100%", borderRadius: 12, border: "1px solid rgba(0,0,0,.1)", padding: "11px 14px", fontSize: 14, outline: "none", background: "#fff", color: "#1a1a1a" };

  function save() {
    setErr("");
    start(() => {
      addAddress(f).then((res) => {
        if (!res.ok) { setErr(res.error || "저장 실패"); return; }
        // 낙관적 추가
        setList((l) => {
          const next = f.isDefault ? l.map((a) => ({ ...a, is_default: false })) : l;
          return [...next, { id: `tmp-${Date.now()}`, label: f.label || null, recipient: f.recipient, phone: f.phone, address: f.address, memo: f.memo || null, is_default: f.isDefault }];
        });
        setF({ label: "", recipient: "", phone: "", address: "", memo: "", isDefault: false });
        setOpen(false);
      });
    });
  }
  function remove(id: string) {
    if (!confirm("이 배송지를 삭제할까요?")) return;
    start(() => { deleteAddress(id).then(() => setList((l) => l.filter((a) => a.id !== id))); });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {list.map((a) => (
        <div key={a.id} style={{ background: "#fff", borderRadius: 16, padding: "16px 20px", boxShadow: "0 8px 24px -20px rgba(0,0,0,.3)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {a.label && <span style={{ fontSize: 12, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: "#eef2ff", color: "#4f46e5" }}>{a.label}</span>}
            {a.is_default && <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: "#dcfce7", color: "#16a34a" }}>기본</span>}
            <b style={{ fontSize: 15 }}>{a.recipient}</b>
            <span style={{ fontSize: 13, color: "#6b7280" }}>{a.phone}</span>
            <button onClick={() => remove(a.id)} style={{ marginLeft: "auto", fontSize: 12, color: "#9ca3af", background: "none", border: "none", cursor: "pointer" }}>삭제</button>
          </div>
          <div style={{ marginTop: 6, fontSize: 14, color: "#374151" }}>{a.address}</div>
          {a.memo && <div style={{ marginTop: 3, fontSize: 12.5, color: "#9ca3af" }}>📝 {a.memo}</div>}
        </div>
      ))}

      {open ? (
        <div style={{ background: "#fff", borderRadius: 16, padding: 18, boxShadow: "0 8px 24px -20px rgba(0,0,0,.3)", display: "flex", flexDirection: "column", gap: 10 }}>
          <input style={inp} placeholder="별칭 (집·회사 등, 선택)" value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} maxLength={20} />
          <div style={{ display: "flex", gap: 10 }}>
            <input style={inp} placeholder="받는 사람" value={f.recipient} onChange={(e) => setF({ ...f, recipient: e.target.value })} maxLength={30} />
            <input style={inp} placeholder="연락처" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} maxLength={20} />
          </div>
          <input style={inp} placeholder="주소" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} maxLength={200} />
          <input style={inp} placeholder="배송 메모 (선택)" value={f.memo} onChange={(e) => setF({ ...f, memo: e.target.value })} maxLength={100} />
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "#555", cursor: "pointer" }}>
            <input type="checkbox" checked={f.isDefault} onChange={(e) => setF({ ...f, isDefault: e.target.checked })} /> 기본 배송지로 설정
          </label>
          {err && <div style={{ fontSize: 12.5, color: "#e11d48" }}>{err}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={save} disabled={pending} style={{ flex: 1, borderRadius: 12, border: "none", padding: "12px", fontWeight: 800, fontSize: 14, color: "#fff", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", cursor: "pointer", opacity: pending ? 0.6 : 1 }}>
              {pending ? "저장 중…" : "배송지 저장"}
            </button>
            <button onClick={() => setOpen(false)} style={{ borderRadius: 12, border: "1px solid rgba(0,0,0,.1)", padding: "12px 18px", fontSize: 14, background: "#fff", color: "#555", cursor: "pointer" }}>취소</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} style={{ borderRadius: 16, border: "1.5px dashed rgba(0,0,0,.15)", padding: "16px", fontSize: 14, fontWeight: 700, color: "#6b7280", background: "transparent", cursor: "pointer" }}>
          ＋ 배송지 추가
        </button>
      )}
    </div>
  );
}
