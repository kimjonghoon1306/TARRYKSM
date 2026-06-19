"use client";

import { useState } from "react";
import { addGrade, updateGrade, deleteGrade, seedDefaultGrades, setGradesOn, type StoreGrade } from "@/app/dashboard/[id]/grades/actions";

const INPUT =
  "rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 dark:border-white/10 dark:bg-white/[0.04]";
const won = (n: number) => "₩" + (n || 0).toLocaleString("ko-KR");

// 회원 등급 — ON/OFF + 등급 단계(이름·기준 누적구매액·할인%) 관리.
export default function StoreGradeManager({ storeId, on, initial }: { storeId: string; on: boolean; initial: StoreGrade[] }) {
  const [enabled, setEnabled] = useState(on);
  const [list, setList] = useState<StoreGrade[]>(initial);
  const [name, setName] = useState("");
  const [min, setMin] = useState("");
  const [pct, setPct] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [eName, setEName] = useState("");
  const [eMin, setEMin] = useState("");
  const [ePct, setEPct] = useState("");

  async function toggle(v: boolean) {
    setEnabled(v);
    await setGradesOn(storeId, v);
  }
  async function add() {
    setErr("");
    setBusy(true);
    const res = await addGrade(storeId, name, parseInt(min || "0", 10), parseInt(pct || "0", 10));
    setBusy(false);
    if (!res.ok) return setErr(res.error || "추가 실패");
    setList((l) => [...l, { id: `tmp-${Date.now()}`, name: name.trim(), min_spent: parseInt(min || "0", 10) || 0, discount_pct: parseInt(pct || "0", 10) || 0, position: 0 }].sort((a, b) => a.min_spent - b.min_spent));
    setName(""); setMin(""); setPct("");
  }
  async function save(id: string) {
    setErr("");
    setBusy(true);
    const res = await updateGrade(storeId, id, eName, parseInt(eMin || "0", 10), parseInt(ePct || "0", 10));
    setBusy(false);
    if (!res.ok) return setErr(res.error || "수정 실패");
    setList((l) => l.map((g) => (g.id === id ? { ...g, name: eName.trim(), min_spent: parseInt(eMin || "0", 10) || 0, discount_pct: parseInt(ePct || "0", 10) || 0 } : g)).sort((a, b) => a.min_spent - b.min_spent));
    setEditId(null);
  }
  async function seed() {
    setErr("");
    setBusy(true);
    const res = await seedDefaultGrades(storeId);
    setBusy(false);
    if (!res.ok) return setErr(res.error || "기본 등급 채우기 실패");
    if (res.list) setList(res.list);
  }
  async function remove(id: string) {
    if (!confirm("이 등급을 삭제할까요?")) return;
    setBusy(true);
    await deleteGrade(storeId, id);
    setBusy(false);
    setList((l) => l.filter((g) => g.id !== id));
  }

  return (
    <div className="space-y-3">
      {/* ON/OFF */}
      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
        <span className="text-sm font-semibold">
          회원 등급 사용
          <span className="ml-2 text-xs font-normal text-neutral-400">
            {enabled ? "켜짐 — 구매액에 따라 등급 할인이 적용돼요" : "꺼짐 — 등급 미사용"}
          </span>
        </span>
        <span className="relative inline-flex shrink-0">
          <input type="checkbox" checked={enabled} onChange={(e) => toggle(e.target.checked)} className="peer sr-only" />
          <span className="h-6 w-11 rounded-full bg-neutral-300 transition peer-checked:bg-violet-500 dark:bg-white/15" />
          <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
        </span>
      </label>

      <div className={enabled ? "space-y-3" : "pointer-events-none space-y-3 opacity-40"}>
        {/* 추가 폼 */}
        <div className="rounded-xl border border-black/10 bg-black/[0.02] p-3 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="mb-1.5 text-xs font-semibold text-neutral-500">등급 추가</div>
          <div className="flex flex-wrap items-center gap-2">
            <input className={INPUT + " w-28"} placeholder="등급명 (VIP)" value={name} onChange={(e) => setName(e.target.value)} maxLength={20} />
            <span className="text-xs text-neutral-400">누적</span>
            <input className={INPUT + " w-28"} type="number" min={0} placeholder="구매액" value={min} onChange={(e) => setMin(e.target.value)} />
            <span className="text-xs text-neutral-400">원 이상 →</span>
            <input className={INPUT + " w-16"} type="number" min={0} max={100} placeholder="0" value={pct} onChange={(e) => setPct(e.target.value)} />
            <span className="text-xs text-neutral-400">% 할인</span>
          </div>
          {err && <div className="mt-1.5 text-xs text-rose-500">{err}</div>}
          <div className="mt-2 flex flex-wrap gap-2">
            <button onClick={add} disabled={busy} className="press-glow rounded-lg bg-gradient-to-r from-violet-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-50">＋ 등급 추가</button>
            {list.length === 0 && (
              <button onClick={seed} disabled={busy} className="rounded-lg border border-violet-400/50 px-4 py-2 text-sm font-semibold text-violet-600 transition hover:bg-violet-500/10 disabled:opacity-50 dark:text-violet-300">✨ 기본 등급 채우기 (일반·실버·골드·VIP)</button>
            )}
          </div>
        </div>

        {/* 목록 */}
        {list.length === 0 ? (
          <div className="rounded-xl border border-dashed border-black/10 py-6 text-center text-sm text-neutral-400 dark:border-white/10">아직 등급이 없어요. 위에서 추가하거나 기본 등급을 채워보세요.</div>
        ) : (
          <ul className="space-y-2">
            {list.map((g) => (
              <li key={g.id} className="rounded-xl border border-black/8 bg-white p-3 dark:border-white/10 dark:bg-white/[0.03]">
                {editId === g.id ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <input className={INPUT + " w-24"} value={eName} onChange={(e) => setEName(e.target.value)} maxLength={20} />
                    <input className={INPUT + " w-28"} type="number" value={eMin} onChange={(e) => setEMin(e.target.value)} />
                    <input className={INPUT + " w-16"} type="number" value={ePct} onChange={(e) => setEPct(e.target.value)} />
                    <button onClick={() => save(g.id)} disabled={busy} className="rounded-lg bg-violet-500 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50">저장</button>
                    <button onClick={() => setEditId(null)} className="rounded-lg border border-black/10 px-3 py-1.5 text-sm dark:border-white/15">취소</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-violet-500/15 px-2.5 py-0.5 text-sm font-bold text-violet-600 dark:text-violet-300">{g.name}</span>
                    <span className="text-sm text-neutral-500">{won(g.min_spent)} 이상</span>
                    <span className="ml-auto text-sm font-semibold text-emerald-600 dark:text-emerald-400">{g.discount_pct}% 할인</span>
                    <button onClick={() => { setEditId(g.id); setEName(g.name); setEMin(String(g.min_spent)); setEPct(String(g.discount_pct)); }} className="ml-2 text-xs font-semibold text-violet-500 hover:underline">수정</button>
                    <button onClick={() => remove(g.id)} className="text-xs text-neutral-400 hover:text-rose-500">삭제</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-neutral-400">손님이 <b>주문 완료(구매확정)</b>할 때마다 누적 구매액이 쌓이고, 해당 등급의 할인이 다음 주문부터 자동 적용돼요.</p>
      </div>
    </div>
  );
}
