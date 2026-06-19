"use client";

import { useState } from "react";
import { answerQuestion, deleteQuestion } from "@/app/dashboard/qa/actions";

export type DashQuestion = {
  id: string;
  buyer_name: string;
  question: string;
  answer: string | null;
  secret: boolean;
  created_at: string;
  products: { name: string } | null;
  stores: { name: string } | null;
};

function fmt(d: string) {
  const t = new Date(d);
  return `${t.getFullYear()}.${String(t.getMonth() + 1).padStart(2, "0")}.${String(t.getDate()).padStart(2, "0")}`;
}

export default function QuestionItem({ q }: { q: DashQuestion }) {
  const [editing, setEditing] = useState(false);
  const [answer, setAnswer] = useState(q.answer || "");
  const [busy, setBusy] = useState(false);
  const [gone, setGone] = useState(false);
  const [savedAnswer, setSavedAnswer] = useState(q.answer || "");

  if (gone) return null;

  const card =
    "rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]";

  async function save() {
    setBusy(true);
    const res = await answerQuestion(q.id, answer);
    setBusy(false);
    if (res.ok) {
      setSavedAnswer(answer.trim());
      setEditing(false);
    }
  }
  async function remove() {
    if (!confirm("이 문의를 삭제할까요?")) return;
    setBusy(true);
    const res = await deleteQuestion(q.id);
    setBusy(false);
    if (res.ok) setGone(true);
  }

  return (
    <div className={card}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-bold">{q.buyer_name}</span>
        {q.secret && (
          <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs text-neutral-500 dark:bg-white/10">🔒 비밀글</span>
        )}
        {savedAnswer ? (
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">답변완료</span>
        ) : (
          <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-300">답변대기</span>
        )}
        {q.products && (
          <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs text-neutral-500 dark:bg-white/10">
            {q.products.name}
          </span>
        )}
        {q.stores && (
          <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-xs text-violet-500">
            {q.stores.name}
          </span>
        )}
        <span className="ml-auto text-xs text-neutral-400">{fmt(q.created_at)}</span>
      </div>

      <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-200">{q.question}</p>

      {/* 답변 영역 */}
      {savedAnswer && !editing && (
        <div className="mt-3 rounded-xl bg-violet-500/10 p-3 text-sm text-violet-700 dark:text-violet-200">
          <b className="mr-1.5 text-xs opacity-70">판매자 답변</b>
          <span className="whitespace-pre-wrap">{savedAnswer}</span>
        </div>
      )}

      {editing ? (
        <div className="mt-3 space-y-2">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="고객에게 남길 답변"
            maxLength={1000}
            className="min-h-[64px] w-full resize-y rounded-xl border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-white/5"
          />
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={busy}
              className="rounded-lg bg-violet-500 px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {busy ? "저장 중…" : "답변 저장"}
            </button>
            <button
              onClick={() => { setEditing(false); setAnswer(savedAnswer); }}
              className="rounded-lg border border-black/10 px-4 py-1.5 text-sm dark:border-white/15"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex gap-3 text-xs">
          <button onClick={() => setEditing(true)} className="font-semibold text-violet-500 hover:underline">
            {savedAnswer ? "답변 수정" : "답변 달기"}
          </button>
          <button onClick={remove} disabled={busy} className="text-neutral-400 hover:text-rose-500">
            삭제
          </button>
        </div>
      )}
    </div>
  );
}
