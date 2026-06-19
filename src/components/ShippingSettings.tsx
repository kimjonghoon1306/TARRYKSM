"use client";

import { useState } from "react";

// 배송비 설정 — 받기 ON/OFF + 기본 배송비 + 무료배송 기준액 + 도서산간 추가비.
// 끄면 모든 칸 비활성(배송비 0, 무료배송으로 표시). 저장은 부모 form의 SaveButton.
export default function ShippingSettings({
  on,
  fee,
  freeOver,
  extra,
}: {
  on: boolean;
  fee: number;
  freeOver: number;
  extra: number;
}) {
  const [enabled, setEnabled] = useState(on);
  const [f, setF] = useState(String(fee));
  const [fo, setFo] = useState(String(freeOver));
  const [ex, setEx] = useState(String(extra));

  const won = (n: number) => "₩" + n.toLocaleString("ko-KR");
  const num = (v: string) => Math.max(0, parseInt(v || "0", 10) || 0);
  const feeNum = num(f);
  const foNum = num(fo);
  const exNum = num(ex);

  const inputCls =
    "w-32 bg-white px-4 py-2.5 text-sm outline-none dark:bg-white/[0.04]";
  const wrapCls =
    "flex items-stretch overflow-hidden rounded-xl border border-black/10 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/25 dark:border-white/10";
  const wonTag =
    "flex items-center bg-black/[0.04] px-3 text-sm text-neutral-500 dark:bg-white/[0.06]";

  return (
    <div className="space-y-3">
      {/* ON/OFF 토글 */}
      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
        <span className="text-sm font-semibold">
          배송비 받기
          <span className="ml-2 text-xs font-normal text-neutral-400">
            {enabled ? "켜짐 — 주문 시 배송비가 더해져요" : "꺼짐 — 배송비 없이(무료) 받아요"}
          </span>
        </span>
        <span className="relative inline-flex shrink-0">
          <input
            type="checkbox"
            name="ship_on"
            value="1"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="peer sr-only"
          />
          <span className="h-6 w-11 rounded-full bg-neutral-300 transition peer-checked:bg-violet-500 dark:bg-white/15" />
          <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
        </span>
      </label>

      <div className={enabled ? "space-y-4" : "pointer-events-none space-y-4 opacity-40"}>
        {/* 기본 배송비 */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-neutral-500">기본 배송비</label>
          <div className="flex items-center gap-2">
            <div className={wrapCls}>
              <span className={wonTag}>₩</span>
              <input name="ship_fee" type="number" min={0} value={f} onChange={(e) => setF(e.target.value)} className={inputCls} />
            </div>
            <span className="text-xs text-neutral-500">주문마다 더해질 배송비예요.</span>
          </div>
        </div>

        {/* 무료배송 기준액 */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-neutral-500">무료배송 기준액</label>
          <div className="flex items-center gap-2">
            <div className={wrapCls}>
              <span className={wonTag}>₩</span>
              <input name="ship_free_over" type="number" min={0} value={fo} onChange={(e) => setFo(e.target.value)} className={inputCls} />
            </div>
            <span className="text-xs text-neutral-500">
              {foNum > 0 ? <>상품 합계 <b className="text-violet-500">{won(foNum)}</b> 이상이면 무료배송</> : "0이면 무료배송 없음"}
            </span>
          </div>
        </div>

        {/* 도서산간 추가비 */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-neutral-500">도서산간 추가 배송비</label>
          <div className="flex items-center gap-2">
            <div className={wrapCls}>
              <span className={wonTag}>₩</span>
              <input name="ship_extra" type="number" min={0} value={ex} onChange={(e) => setEx(e.target.value)} className={inputCls} />
            </div>
            <span className="text-xs text-neutral-500">제주·도서산간 주문이면 더 받을 금액 (0이면 안 받음).</span>
          </div>
        </div>

        {/* 실시간 예시 */}
        <div className="rounded-xl border border-black/5 bg-black/[0.02] px-4 py-3 text-xs text-neutral-500 dark:border-white/10 dark:bg-white/[0.03]">
          예) 상품 합계가 {foNum > 0 ? won(foNum) : "기준액"} 미만이면 배송비 <b className="text-violet-500">{won(feeNum)}</b>
          {exNum > 0 && <> (도서산간은 <b className="text-violet-500">{won(feeNum + exNum)}</b>)</>}
          {foNum > 0 && <>, {won(foNum)} 이상이면 <b className="text-emerald-500">무료배송</b></>}
        </div>
      </div>
    </div>
  );
}
