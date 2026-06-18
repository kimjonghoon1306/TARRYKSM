"use client";

import { useState, useTransition } from "react";
import {
  adjustCustomerPoints,
  getCustomerPointsLog,
  type Member,
  type PointLog,
} from "@/app/dashboard/customers/actions";

const won = (n: number) => "₩" + (n || 0).toLocaleString("ko-KR");
const KIND: Record<string, { label: string; color: string }> = {
  earn: { label: "적립", color: "#16a34a" },
  use: { label: "사용", color: "#e11d48" },
  admin_add: { label: "지급", color: "#4f46e5" },
  admin_sub: { label: "차감", color: "#ea580c" },
  revoke: { label: "회수", color: "#6b7280" },
};
function fmt(d: string) {
  const t = new Date(d);
  return `${t.getFullYear()}.${String(t.getMonth() + 1).padStart(2, "0")}.${String(t.getDate()).padStart(2, "0")} ${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
}

export default function MemberPoints({ members }: { members: Member[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const [pts, setPts] = useState<Record<string, number>>(
    Object.fromEntries(members.map((m) => [m.id, m.points]))
  );

  if (members.length === 0) {
    return (
      <div className="rounded-2xl border border-black/5 bg-white p-8 text-center text-sm text-neutral-500 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
        아직 가입한 회원이 없어요. 손님이 쇼핑몰에서 회원가입하면 여기에 적립금과 함께 표시됩니다.
        <div className="mt-2 text-xs text-neutral-400">
          (적립금이 안 보이면 <code className="font-mono">supabase/points2.sql</code>을 한 번 실행해 주세요)
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {members.map((m) => (
        <Row
          key={m.id}
          m={m}
          points={pts[m.id] ?? m.points}
          isOpen={open === m.id}
          onToggle={() => setOpen(open === m.id ? null : m.id)}
          onPoints={(v) => setPts((p) => ({ ...p, [m.id]: v }))}
        />
      ))}
    </div>
  );
}

function Row({
  m,
  points,
  isOpen,
  onToggle,
  onPoints,
}: {
  m: Member;
  points: number;
  isOpen: boolean;
  onToggle: () => void;
  onPoints: (v: number) => void;
}) {
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [log, setLog] = useState<PointLog[] | null>(null);
  const [pending, start] = useTransition();

  function apply(sign: 1 | -1) {
    const a = Math.trunc(Number(amount));
    if (!a || a <= 0) {
      setMsg({ ok: false, text: "금액을 입력해 주세요." });
      return;
    }
    start(async () => {
      const res = await adjustCustomerPoints(m.id, sign * a, memo);
      if (res.ok) {
        onPoints(res.points ?? points);
        setAmount("");
        setMemo("");
        setMsg({ ok: true, text: sign > 0 ? `${won(a)} 지급했어요` : `${won(a)} 차감했어요` });
        if (log !== null) setLog(await getCustomerPointsLog(m.id)); // 펼쳐져 있으면 내역 갱신
      } else {
        setMsg({ ok: false, text: res.error || "처리 실패" });
      }
    });
  }

  function toggle() {
    onToggle();
    if (!isOpen && log === null) {
      start(async () => setLog(await getCustomerPointsLog(m.id)));
    }
  }

  const card =
    "rounded-2xl border border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]";

  return (
    <div className={card}>
      <button
        onClick={toggle}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <div className="min-w-0">
          <div className="truncate font-semibold">{m.name}</div>
          <div className="truncate text-xs text-neutral-500">
            {m.email}
            <span className="ml-2 text-neutral-400">· {m.store_name}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-base font-bold text-violet-500">{won(points)}</div>
            <div className="text-[11px] text-neutral-400">적립금</div>
          </div>
          <span className={"text-neutral-400 transition " + (isOpen ? "rotate-90" : "")}>›</span>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-black/5 p-4 dark:border-white/10">
          {/* 지급/차감 */}
          <div className="mb-2 text-xs font-semibold text-neutral-500">적립금 지급 / 차감</div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-stretch overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
              <input
                type="number"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="금액"
                className="w-28 bg-white px-3 py-2 text-sm outline-none dark:bg-white/[0.04]"
              />
              <span className="flex items-center bg-black/[0.04] px-2 text-xs text-neutral-500 dark:bg-white/[0.06]">원</span>
            </div>
            <input
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="사유 (선택, 예: 이벤트 보상)"
              className="min-w-[140px] flex-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-white/[0.04]"
            />
            <button
              type="button"
              disabled={pending}
              onClick={() => apply(1)}
              className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105 disabled:opacity-50"
            >
              ＋ 지급
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => apply(-1)}
              className="rounded-xl border border-black/10 px-4 py-2 text-sm font-semibold transition hover:border-rose-400 hover:text-rose-500 disabled:opacity-50 dark:border-white/15"
            >
              － 차감
            </button>
          </div>
          {msg && (
            <p className={"mt-2 text-xs font-semibold " + (msg.ok ? "text-emerald-600" : "text-rose-500")}>
              {msg.text}
            </p>
          )}

          {/* 내역 */}
          <div className="mb-2 mt-4 text-xs font-semibold text-neutral-500">적립금 내역</div>
          {log === null ? (
            <div className="text-xs text-neutral-400">불러오는 중…</div>
          ) : log.length === 0 ? (
            <div className="text-xs text-neutral-400">아직 적립금 변동 내역이 없어요.</div>
          ) : (
            <div className="space-y-1">
              {log.map((t, i) => {
                const k = KIND[t.kind] || { label: t.kind, color: "#6b7280" };
                return (
                  <div key={i} className="flex items-center justify-between gap-2 rounded-lg bg-black/[0.02] px-3 py-2 text-xs dark:bg-white/[0.03]">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full px-2 py-0.5 font-bold text-white" style={{ background: k.color }}>{k.label}</span>
                      <span className="text-neutral-500">{t.memo}</span>
                    </div>
                    <div className="flex items-center gap-3 whitespace-nowrap">
                      <span className="font-bold" style={{ color: t.amount >= 0 ? "#16a34a" : "#e11d48" }}>
                        {t.amount >= 0 ? "+" : ""}{won(t.amount)}
                      </span>
                      <span className="text-neutral-400">잔액 {won(t.balance_after)}</span>
                      <span className="text-neutral-400">{fmt(t.created_at)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
