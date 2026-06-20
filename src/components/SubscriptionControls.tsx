"use client";

import { useState } from "react";
import { markPlanPaidNow, adjustPlanDays } from "@/app/dashboard/platform/actions";
import { planStatus } from "@/lib/subscription";

// 운영자 회원 상세에서 구독 기간 관리: "오늘 결제 완료" + 날짜 가감(+/-).
export default function SubscriptionControls({
  userId,
  until,
}: {
  userId: string;
  until: string | null;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const st = planStatus(until);

  async function paidNow() {
    if (!confirm("오늘 결제 완료로 처리할까요? 오늘부터 한 달(만료일 자동 계산)로 설정됩니다.")) return;
    setErr("");
    setBusy(true);
    const res = await markPlanPaidNow(userId);
    setBusy(false);
    if (!res.ok) return setErr(res.error || "처리 실패");
    location.reload();
  }
  async function adjust(days: number) {
    setErr("");
    setBusy(true);
    const res = await adjustPlanDays(userId, days);
    setBusy(false);
    if (!res.ok) return setErr(res.error || "처리 실패");
    location.reload();
  }

  const pill =
    "rounded-lg border border-black/10 px-3 py-1.5 text-xs font-semibold transition hover:border-violet-500 disabled:opacity-50 dark:border-white/15";

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-bold">📅 구독 사용 기간</h2>
        {st.set ? (
          <span
            className={
              "rounded-full px-2 py-0.5 text-xs font-bold " +
              (st.expired
                ? "bg-rose-500/15 text-rose-600 dark:text-rose-300"
                : (st.days ?? 0) <= 7
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-300"
                  : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300")
            }
          >
            {st.expired ? "만료됨" : `D-${st.days}`}
          </span>
        ) : (
          <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs font-bold text-neutral-500 dark:bg-white/10">
            미설정
          </span>
        )}
      </div>

      <p className="mt-2 text-sm text-neutral-500">
        만료일: <b className="text-neutral-700 dark:text-neutral-200">{st.label}</b>
        {st.set && !st.expired && st.days !== null && <> · {st.days}일 남음</>}
        {st.expired && <> · 사용 기간이 지났어요</>}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={paidNow}
          disabled={busy}
          className="rounded-lg bg-gradient-to-r from-violet-500 to-pink-500 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-50"
        >
          💳 오늘 결제 완료 (오늘부터 1개월)
        </button>
        <span className="mx-1 text-xs text-neutral-400">날짜 조정:</span>
        <button onClick={() => adjust(7)} disabled={busy} className={pill}>+7일</button>
        <button onClick={() => adjust(30)} disabled={busy} className={pill}>+30일</button>
        <button onClick={() => adjust(-7)} disabled={busy} className={pill}>-7일</button>
        <button onClick={() => adjust(-30)} disabled={busy} className={pill}>-30일</button>
      </div>
      {err && <div className="mt-2 text-xs text-rose-500">{err}</div>}
    </div>
  );
}
