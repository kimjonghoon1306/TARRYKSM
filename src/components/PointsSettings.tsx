"use client";

import { useState } from "react";

// 적립금 설정 — 사용 ON/OFF 토글 + 적립률(%). 끄면 적립률 칸 비활성.
// 예시 적립액을 실시간으로 보여줘 사장님이 감을 잡게 함. (저장은 부모 form의 SaveButton)
export default function PointsSettings({
  on,
  rate,
}: {
  on: boolean;
  rate: number;
}) {
  const [enabled, setEnabled] = useState(on);
  const [r, setR] = useState(String(rate));

  const rateNum = Math.max(0, Math.min(50, parseInt(r || "0", 10) || 0));
  const sample = Math.floor((10000 * rateNum) / 100);
  const won = (n: number) => "₩" + n.toLocaleString("ko-KR");

  return (
    <div className="space-y-3">
      {/* ON/OFF 토글 */}
      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
        <span className="text-sm font-semibold">
          적립금 사용
          <span className="ml-2 text-xs font-normal text-neutral-400">
            {enabled ? "켜짐 — 주문 완료 시 손님에게 적립돼요" : "꺼짐 — 적립하지 않아요"}
          </span>
        </span>
        <span className="relative inline-flex shrink-0">
          <input
            type="checkbox"
            name="points_on"
            value="1"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="peer sr-only"
          />
          <span className="h-6 w-11 rounded-full bg-neutral-300 transition peer-checked:bg-violet-500 dark:bg-white/15" />
          <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
        </span>
      </label>

      {/* 적립률 */}
      <div className={enabled ? "" : "pointer-events-none opacity-40"}>
        <label className="mb-1.5 block text-xs font-semibold text-neutral-500">적립률</label>
        <div className="flex items-center gap-2">
          <div className="flex items-stretch overflow-hidden rounded-xl border border-black/10 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/25 dark:border-white/10">
            <input
              name="points_rate"
              type="number"
              min={0}
              max={50}
              value={r}
              onChange={(e) => setR(e.target.value)}
              className="w-24 bg-white px-4 py-2.5 text-sm outline-none dark:bg-white/[0.04]"
            />
            <span className="flex items-center bg-black/[0.04] px-3 text-sm text-neutral-500 dark:bg-white/[0.06]">%</span>
          </div>
          <span className="text-xs text-neutral-500">
            예) 10,000원 주문 시 <b className="text-violet-500">{won(sample)}</b> 적립
          </span>
        </div>
        <p className="mt-1.5 text-xs text-neutral-400">
          적립금은 주문이 <b>완료(구매확정)</b>되면 손님 마이페이지에 자동으로 쌓여요. 0~50% 사이로 정할 수 있어요.
        </p>
      </div>
    </div>
  );
}
