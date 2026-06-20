"use client";

import { useState, useTransition } from "react";
import { setShipping } from "@/app/dashboard/orders/actions";
import { trackingUrl } from "@/lib/tracking";

const COURIERS = ["CJ대한통운", "우체국택배", "한진택배", "롯데택배", "로젠택배", "직접배송", "기타"];

export default function ShippingForm({
  orderId,
  courier,
  trackingNo,
}: {
  orderId: string;
  courier: string | null;
  trackingNo: string | null;
}) {
  const [c, setC] = useState(courier || "");
  const [t, setT] = useState(trackingNo || "");
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  const input =
    "rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-violet-500 dark:border-white/10 dark:bg-white/[0.04]";

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-black/[0.02] p-3 dark:bg-white/[0.03]">
      <span className="text-xs font-semibold text-neutral-500">🚚 송장</span>
      <select value={c} onChange={(e) => { setC(e.target.value); setSaved(false); }} className={input}>
        <option value="">택배사</option>
        {COURIERS.map((x) => (
          <option key={x} value={x}>{x}</option>
        ))}
      </select>
      <input
        value={t}
        onChange={(e) => { setT(e.target.value); setSaved(false); }}
        placeholder="운송장번호"
        className={input + " flex-1 min-w-[140px]"}
      />
      <button
        disabled={pending}
        onClick={() => {
          start(async () => {
            await setShipping(orderId, c, t);
            setSaved(true);
          });
        }}
        className="rounded-lg bg-violet-500 px-3 py-1.5 text-xs font-bold text-white transition hover:brightness-110 disabled:opacity-50"
      >
        {pending ? "저장중…" : saved ? "저장됨 ✓" : "송장 저장"}
      </button>
      {trackingUrl(c, t) && (
        <a
          href={trackingUrl(c, t) as string}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-violet-400/50 px-3 py-1.5 text-xs font-bold text-violet-600 transition hover:bg-violet-500/10 dark:text-violet-300"
        >
          🔍 배송 조회 ↗
        </a>
      )}
    </div>
  );
}
