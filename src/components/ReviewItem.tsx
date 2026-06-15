"use client";

import { useState } from "react";
import { replyReview, deleteReview } from "@/app/dashboard/reviews/actions";

export type DashReview = {
  id: string;
  buyer_name: string;
  rating: number;
  comment: string | null;
  reply: string | null;
  created_at: string;
  products: { name: string } | null;
  stores: { name: string } | null;
};

const stars = (n: number) => "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);
function fmt(d: string) {
  const t = new Date(d);
  return `${t.getFullYear()}.${String(t.getMonth() + 1).padStart(2, "0")}.${String(t.getDate()).padStart(2, "0")}`;
}

export default function ReviewItem({ r }: { r: DashReview }) {
  const [editing, setEditing] = useState(false);
  const [reply, setReply] = useState(r.reply || "");
  const [busy, setBusy] = useState(false);
  const [gone, setGone] = useState(false);
  const [savedReply, setSavedReply] = useState(r.reply || "");

  if (gone) return null;

  const card =
    "rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]";

  async function save() {
    setBusy(true);
    const res = await replyReview(r.id, reply);
    setBusy(false);
    if (res.ok) {
      setSavedReply(reply.trim());
      setEditing(false);
    }
  }
  async function remove() {
    if (!confirm("이 리뷰를 삭제할까요?")) return;
    setBusy(true);
    const res = await deleteReview(r.id);
    setBusy(false);
    if (res.ok) setGone(true);
  }

  return (
    <div className={card}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-bold">{r.buyer_name}</span>
        <span className="text-sm text-amber-500">{stars(r.rating)}</span>
        {r.products && (
          <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs text-neutral-500 dark:bg-white/10">
            {r.products.name}
          </span>
        )}
        {r.stores && (
          <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-xs text-violet-500">
            {r.stores.name}
          </span>
        )}
        <span className="ml-auto text-xs text-neutral-400">{fmt(r.created_at)}</span>
      </div>

      {r.comment && (
        <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-200">{r.comment}</p>
      )}

      {/* 답글 영역 */}
      {savedReply && !editing && (
        <div className="mt-3 rounded-xl bg-violet-500/10 p-3 text-sm text-violet-700 dark:text-violet-200">
          <b className="mr-1.5 text-xs opacity-70">판매자 답글</b>
          <span className="whitespace-pre-wrap">{savedReply}</span>
        </div>
      )}

      {editing ? (
        <div className="mt-3 space-y-2">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="고객에게 남길 답글"
            maxLength={1000}
            className="min-h-[64px] w-full resize-y rounded-xl border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-white/5"
          />
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={busy}
              className="rounded-lg bg-violet-500 px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {busy ? "저장 중…" : "답글 저장"}
            </button>
            <button
              onClick={() => { setEditing(false); setReply(savedReply); }}
              className="rounded-lg border border-black/10 px-4 py-1.5 text-sm dark:border-white/15"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex gap-3 text-xs">
          <button onClick={() => setEditing(true)} className="font-semibold text-violet-500 hover:underline">
            {savedReply ? "답글 수정" : "답글 달기"}
          </button>
          <button onClick={remove} disabled={busy} className="text-neutral-400 hover:text-rose-500">
            삭제
          </button>
        </div>
      )}
    </div>
  );
}
