"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/app/dashboard/orders/actions";

const STATUSES = ["신규", "처리중", "배송중", "완료", "취소"];
const COLOR: Record<string, string> = {
  신규: "bg-violet-500/15 text-violet-600 dark:text-violet-300",
  처리중: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
  배송중: "bg-sky-500/15 text-sky-600 dark:text-sky-300",
  완료: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  취소: "bg-rose-500/15 text-rose-600 dark:text-rose-300",
};

export default function OrderStatusSelect({ orderId, status }: { orderId: string; status: string }) {
  const [cur, setCur] = useState(status);
  const [pending, start] = useTransition();

  return (
    <select
      value={cur}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value;
        setCur(next);
        start(() => updateOrderStatus(orderId, next).then(() => {}));
      }}
      className={
        "rounded-lg border-0 px-2.5 py-1 text-xs font-bold outline-none ring-1 ring-black/5 dark:ring-white/10 " +
        (COLOR[cur] || "bg-black/5")
      }
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
