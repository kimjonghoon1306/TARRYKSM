"use client";

import { useState } from "react";
import { notifyRestockByProduct } from "@/app/dashboard/restock/actions";
import RestockItem, { type DashRestock } from "@/components/RestockItem";

// 한 상품의 재입고 신청자 묶음 — 미발송이 있으면 "입고 알림 보내기"로 전부 notified 처리.
export default function RestockGroup({ productId, name, rows }: { productId: string; name: string; rows: DashRestock[] }) {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const waiting = rows.filter((r) => !r.notified).length;

  async function notifyAll() {
    if (!confirm(`'${name}' 재입고 알림을 신청자 ${waiting}명에게 보낼까요?\n(손님 화면·팝업에 "입고됐어요"로 표시돼요)`)) return;
    setBusy(true);
    const res = await notifyRestockByProduct(productId);
    setBusy(false);
    if (res.ok) setSent(true);
  }

  const card = "rounded-2xl border border-black/5 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]";

  return (
    <div className={card}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="font-bold">{name}</span>
        <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs text-neutral-500 dark:bg-white/10">신청 {rows.length}명</span>
        {waiting > 0 && !sent ? (
          <button
            onClick={notifyAll}
            disabled={busy}
            className="press-glow ml-auto rounded-lg bg-gradient-to-r from-violet-500 to-pink-500 px-4 py-1.5 text-sm font-bold text-white shadow disabled:opacity-50"
          >
            {busy ? "보내는 중…" : `🔔 입고 알림 보내기 (${waiting})`}
          </button>
        ) : (
          <span className="ml-auto rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">✓ 알림 보냄</span>
        )}
      </div>
      <div className="space-y-2">
        {rows.map((r) => (
          <RestockItem key={r.id} r={sent ? { ...r, notified: true } : r} />
        ))}
      </div>
    </div>
  );
}
