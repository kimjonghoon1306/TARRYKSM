"use client";

import { useState } from "react";
import { markPlanPaidNow, adjustPlanDays, cancelPlan } from "@/app/dashboard/platform/actions";
import { planStatus } from "@/lib/subscription";

const PLAN_LABEL: Record<string, string> = { basic: "베이직", pro: "프로", premium: "프리미엄" };

// 운영자 회원 상세에서 구독 관리: 요금제 등급 결제완료(등급+1개월) + 날짜 가감(+/-) + 해지.
export default function SubscriptionControls({
  userId,
  until,
  plan,
}: {
  userId: string;
  until: string | null;
  plan: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const st = planStatus(until);

  async function paid(p: "basic" | "pro" | "premium") {
    if (!confirm(`${PLAN_LABEL[p]} 결제 완료로 처리할까요? 요금제가 ${PLAN_LABEL[p]}(으)로 바뀌고 오늘부터 1개월로 설정됩니다.`)) return;
    setErr("");
    setBusy(true);
    const res = await markPlanPaidNow(userId, p);
    setBusy(false);
    if (!res.ok) return setErr(res.error || "처리 실패");
    location.reload();
  }
  async function cancel() {
    if (!confirm("구독을 해지할까요? 무료로 전환되고 사용기간이 제거됩니다.")) return;
    setErr("");
    setBusy(true);
    const res = await cancelPlan(userId);
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
        현재 요금제: <b className="text-neutral-700 dark:text-neutral-200">{PLAN_LABEL[plan] || "무료"}</b> · 만료일:{" "}
        <b className="text-neutral-700 dark:text-neutral-200">{st.label}</b>
        {st.set && !st.expired && st.days !== null && <> · {st.days}일 남음</>}
        {st.expired && <> · 만료됨 → 쇼핑몰 잠김</>}
      </p>

      {/* 결제 완료: 등급 + 1개월을 한 묶음으로 (날짜만 붙는 문제 방지) */}
      <div className="mt-4">
        <div className="text-[11px] font-semibold text-neutral-500">결제 완료 처리 (등급 + 오늘부터 1개월)</div>
        <div className="mt-1.5 flex flex-wrap gap-2">
          <button onClick={() => paid("basic")} disabled={busy} className="rounded-lg bg-gradient-to-r from-violet-500 to-pink-500 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-50">💳 베이직 결제완료</button>
          <button onClick={() => paid("pro")} disabled={busy} className="rounded-lg bg-gradient-to-r from-violet-500 to-pink-500 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-50">💳 프로 결제완료</button>
          <button onClick={() => paid("premium")} disabled={busy} className="rounded-lg bg-gradient-to-r from-violet-500 to-pink-500 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-50">💳 프리미엄 결제완료</button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold text-neutral-500">날짜 조정:</span>
        <button onClick={() => adjust(7)} disabled={busy} className={pill}>+7일</button>
        <button onClick={() => adjust(30)} disabled={busy} className={pill}>+30일</button>
        <button onClick={() => adjust(-7)} disabled={busy} className={pill}>-7일</button>
        <button onClick={() => adjust(-30)} disabled={busy} className={pill}>-30일</button>
        <button onClick={cancel} disabled={busy} className="ml-auto rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-500 transition hover:bg-rose-50 disabled:opacity-50 dark:border-rose-500/40 dark:hover:bg-rose-500/10">구독 해지(무료)</button>
      </div>
      {err && <div className="mt-2 text-xs text-rose-500">{err}</div>}
    </div>
  );
}
