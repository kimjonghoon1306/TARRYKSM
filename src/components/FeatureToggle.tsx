"use client";

import { useState, useTransition } from "react";
import { setStoreToggle } from "@/app/dashboard/actions";

// 상품문의(Q&A)·리뷰 같은 단순 ON/OFF 토글. 즉시 저장(낙관적) + 저장됨 표시.
export default function FeatureToggle({
  storeId,
  toggleKey,
  on,
  label,
  desc,
}: {
  storeId: string;
  toggleKey: "qa_on" | "reviews_on";
  on: boolean;
  label: string;
  desc?: string;
}) {
  const [enabled, setEnabled] = useState(on);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  function change(v: boolean) {
    setEnabled(v);
    setSaved(false);
    start(() => {
      setStoreToggle(storeId, toggleKey, v).then((r) => {
        if (r.ok) {
          setSaved(true);
          setTimeout(() => setSaved(false), 1800);
        } else {
          setEnabled(!v); // 실패 시 되돌림
        }
      });
    });
  }

  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
      <span className="text-sm font-semibold">
        {label}
        <span className="ml-2 text-xs font-normal text-neutral-400">
          {saved ? "✓ 저장됨" : enabled ? desc || "켜짐" : "꺼짐 — 손님 화면에 안 보여요"}
        </span>
      </span>
      <span className="relative inline-flex shrink-0">
        <input type="checkbox" checked={enabled} disabled={pending} onChange={(e) => change(e.target.checked)} className="peer sr-only" />
        <span className="h-6 w-11 rounded-full bg-neutral-300 transition peer-checked:bg-violet-500 dark:bg-white/15" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}
