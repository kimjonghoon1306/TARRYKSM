"use client";

import { useState } from "react";
import { markRestockNotified, deleteRestock } from "@/app/dashboard/restock/actions";

export type DashRestock = {
  id: string;
  product_id: string;
  contact: string;
  notified: boolean;
  created_at: string;
  products: { name: string } | null;
  stores: { name: string } | null;
};

function fmt(d: string) {
  const t = new Date(d);
  return `${t.getFullYear()}.${String(t.getMonth() + 1).padStart(2, "0")}.${String(t.getDate()).padStart(2, "0")}`;
}

export default function RestockItem({ r }: { r: DashRestock }) {
  const [notified, setNotified] = useState(r.notified);
  const [busy, setBusy] = useState(false);
  const [gone, setGone] = useState(false);
  if (gone) return null;

  const card = "rounded-2xl border border-black/5 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]";

  async function toggle() {
    setBusy(true);
    const v = !notified;
    const res = await markRestockNotified(r.id, v);
    setBusy(false);
    if (res.ok) setNotified(v);
  }
  async function remove() {
    if (!confirm("이 신청을 삭제할까요?")) return;
    setBusy(true);
    await deleteRestock(r.id);
    setBusy(false);
    setGone(true);
  }

  return (
    <div className={card + " flex flex-wrap items-center gap-2"}>
      {r.products && <span className="font-semibold">{r.products.name}</span>}
      {r.stores && (
        <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-xs text-violet-500">{r.stores.name}</span>
      )}
      <span className="rounded-lg bg-black/[0.04] px-2 py-1 font-mono text-sm dark:bg-white/[0.06]">{r.contact}</span>
      {notified ? (
        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">연락완료</span>
      ) : (
        <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-300">대기</span>
      )}
      <span className="ml-auto text-xs text-neutral-400">{fmt(r.created_at)}</span>
      <button onClick={toggle} disabled={busy} className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-semibold transition hover:border-violet-500 disabled:opacity-50 dark:border-white/15">
        {notified ? "대기로" : "연락완료"}
      </button>
      <button onClick={remove} disabled={busy} className="text-xs text-neutral-400 hover:text-rose-500">삭제</button>
    </div>
  );
}
