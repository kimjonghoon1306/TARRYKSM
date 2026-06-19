"use client";

import { useState } from "react";
import { addFaq, updateFaq, deleteFaq, moveFaq, seedDefaultFaqs, type StoreFaq } from "@/app/dashboard/[id]/faq/actions";

const INPUT =
  "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 dark:border-white/10 dark:bg-white/[0.04]";

// 쇼핑몰 챗봇(FAQ) 관리 — 창업자가 직접 질문/답을 넣고 순서·수정·삭제.
export default function StoreFaqManager({ storeId, initial }: { storeId: string; initial: StoreFaq[] }) {
  const [list, setList] = useState<StoreFaq[]>(initial);
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editQ, setEditQ] = useState("");
  const [editA, setEditA] = useState("");

  async function add() {
    setErr("");
    setBusy(true);
    const res = await addFaq(storeId, q, a);
    setBusy(false);
    if (!res.ok) return setErr(res.error || "추가 실패");
    // 낙관적 추가
    setList((l) => [...l, { id: `tmp-${Date.now()}`, question: q.trim(), answer: a.trim(), position: l.length }]);
    setQ("");
    setA("");
  }

  async function seedDefaults() {
    setErr("");
    setBusy(true);
    const res = await seedDefaultFaqs(storeId);
    setBusy(false);
    if (!res.ok) return setErr(res.error || "기본 질문 채우기 실패");
    if (res.list) setList(res.list);
  }

  async function save(id: string) {
    setErr("");
    setBusy(true);
    const res = await updateFaq(storeId, id, editQ, editA);
    setBusy(false);
    if (!res.ok) return setErr(res.error || "수정 실패");
    setList((l) => l.map((it) => (it.id === id ? { ...it, question: editQ.trim(), answer: editA.trim() } : it)));
    setEditId(null);
  }

  async function remove(id: string) {
    if (!confirm("이 질문을 삭제할까요?")) return;
    setBusy(true);
    await deleteFaq(storeId, id);
    setBusy(false);
    setList((l) => l.filter((it) => it.id !== id));
  }

  async function move(id: string, dir: -1 | 1) {
    const idx = list.findIndex((it) => it.id === id);
    const j = idx + dir;
    if (idx < 0 || j < 0 || j >= list.length) return;
    const next = [...list];
    [next[idx], next[j]] = [next[j], next[idx]];
    setList(next);
    await moveFaq(storeId, id, dir);
  }

  return (
    <div className="space-y-4">
      {/* 추가 폼 */}
      <div className="rounded-xl border border-black/10 bg-black/[0.02] p-3 dark:border-white/10 dark:bg-white/[0.03]">
        <div className="mb-1.5 text-xs font-semibold text-neutral-500">새 질문/답 추가</div>
        <input className={INPUT + " mb-2"} placeholder="질문 (예: 배송은 얼마나 걸려요?)" value={q} onChange={(e) => setQ(e.target.value)} maxLength={100} />
        <textarea className={INPUT} placeholder="답변 (예: 결제 후 2~3일 내 출고돼요.)" value={a} onChange={(e) => setA(e.target.value)} rows={2} maxLength={2000} />
        {err && <div className="mt-1.5 text-xs text-rose-500">{err}</div>}
        <div className="mt-2 flex flex-wrap gap-2">
          <button onClick={add} disabled={busy} className="press-glow rounded-lg bg-gradient-to-r from-violet-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-50">
            ＋ 질문 추가
          </button>
          <button onClick={seedDefaults} disabled={busy} className="rounded-lg border border-violet-400/50 px-4 py-2 text-sm font-semibold text-violet-600 transition hover:bg-violet-500/10 disabled:opacity-50 dark:text-violet-300">
            ✨ 기본 질문 자동 채우기
          </button>
        </div>
        <p className="mt-1.5 text-xs text-neutral-400">‘기본 질문 자동 채우기’를 누르면 배송·교환·입금 등 자주 묻는 질문이 예시로 들어와요. 보고 고쳐 쓰세요.</p>
      </div>

      {/* 목록 */}
      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-black/10 py-8 text-center text-sm text-neutral-400 dark:border-white/10">
          아직 등록한 질문이 없어요. 위에서 자주 묻는 질문을 추가하면 손님 쇼핑몰에 챗봇이 떠요.
        </div>
      ) : (
        <ul className="space-y-2">
          {list.map((it, i) => (
            <li key={it.id} className="rounded-xl border border-black/8 bg-white p-3 dark:border-white/10 dark:bg-white/[0.03]">
              {editId === it.id ? (
                <div className="space-y-2">
                  <input className={INPUT} value={editQ} onChange={(e) => setEditQ(e.target.value)} maxLength={100} />
                  <textarea className={INPUT} value={editA} onChange={(e) => setEditA(e.target.value)} rows={2} maxLength={2000} />
                  <div className="flex gap-2">
                    <button onClick={() => save(it.id)} disabled={busy} className="rounded-lg bg-violet-500 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50">저장</button>
                    <button onClick={() => setEditId(null)} className="rounded-lg border border-black/10 px-3 py-1.5 text-sm dark:border-white/15">취소</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <div className="text-sm font-bold">💬 {it.question}</div>
                    <div className="mt-1 whitespace-pre-wrap text-sm text-neutral-600 dark:text-neutral-300">{it.answer}</div>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-neutral-400">
                    <button onClick={() => move(it.id, -1)} disabled={i === 0} className="px-1 disabled:opacity-30" aria-label="위로">▲</button>
                    <button onClick={() => move(it.id, 1)} disabled={i === list.length - 1} className="px-1 disabled:opacity-30" aria-label="아래로">▼</button>
                  </div>
                  <div className="flex flex-col gap-1 text-xs">
                    <button onClick={() => { setEditId(it.id); setEditQ(it.question); setEditA(it.answer); }} className="font-semibold text-violet-500 hover:underline">수정</button>
                    <button onClick={() => remove(it.id)} className="text-neutral-400 hover:text-rose-500">삭제</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
