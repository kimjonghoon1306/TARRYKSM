"use client";

import { useState } from "react";
import { addCoupon, toggleCoupon, deleteCoupon, type CouponInput } from "@/app/dashboard/[id]/coupons/actions";

export type Coupon = {
  id: string;
  code: string;
  kind: "percent" | "amount";
  value: number;
  min_order: number;
  max_uses: number | null;
  used_count: number;
  active: boolean;
  expires_at: string | null;
};

const won = (n: number) => "₩" + n.toLocaleString("ko-KR");

export default function CouponManager({ storeId, coupons }: { storeId: string; coupons: Coupon[] }) {
  const [list, setList] = useState<Coupon[]>(coupons);
  const [form, setForm] = useState<CouponInput>({
    code: "",
    kind: "percent",
    value: 10,
    min_order: 0,
    max_uses: null,
    expires_at: null,
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const input =
    "w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-white/5";
  const card =
    "rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]";

  async function create() {
    setErr("");
    setBusy(true);
    const res = await addCoupon(storeId, form);
    setBusy(false);
    if (!res.ok) return setErr(res.error || "발급에 실패했어요.");
    // 화면 갱신은 서버 revalidate가 처리 → 폼만 리셋. (간단히 새로고침 없이 표시하려면 reload)
    location.reload();
  }
  async function toggle(c: Coupon) {
    setList((l) => l.map((x) => (x.id === c.id ? { ...x, active: !x.active } : x)));
    await toggleCoupon(storeId, c.id, !c.active);
  }
  async function remove(c: Coupon) {
    if (!confirm(`쿠폰 '${c.code}'를 삭제할까요?`)) return;
    setList((l) => l.filter((x) => x.id !== c.id));
    await deleteCoupon(storeId, c.id);
  }

  return (
    <div className="space-y-5">
      {/* 발급 폼 */}
      <div className={card}>
        <h2 className="text-base font-bold">🎟️ 새 쿠폰 발급</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-neutral-500">쿠폰 코드</label>
            <input
              className={input}
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="WELCOME10"
              maxLength={30}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-500">할인 종류</label>
            <select
              className={input}
              value={form.kind}
              onChange={(e) => setForm({ ...form, kind: e.target.value as "percent" | "amount" })}
            >
              <option value="percent">퍼센트(%) 할인</option>
              <option value="amount">금액(원) 할인</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-500">
              할인 값 {form.kind === "percent" ? "(%)" : "(원)"}
            </label>
            <input
              type="number"
              className={input}
              value={form.value}
              onChange={(e) => setForm({ ...form, value: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-500">최소 주문금액 (원)</label>
            <input
              type="number"
              className={input}
              value={form.min_order}
              onChange={(e) => setForm({ ...form, min_order: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-500">사용 한도 (비우면 무제한)</label>
            <input
              type="number"
              className={input}
              value={form.max_uses ?? ""}
              onChange={(e) =>
                setForm({ ...form, max_uses: e.target.value ? parseInt(e.target.value) : null })
              }
              placeholder="무제한"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-500">만료일 (비우면 무기한)</label>
            <input
              type="date"
              className={input}
              value={form.expires_at ? form.expires_at.slice(0, 10) : ""}
              onChange={(e) =>
                setForm({ ...form, expires_at: e.target.value ? `${e.target.value}T23:59:59` : null })
              }
            />
          </div>
        </div>
        {err && <div className="mt-3 text-sm text-rose-500">{err}</div>}
        <button
          onClick={create}
          disabled={busy}
          className="mt-4 rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
        >
          {busy ? "발급 중…" : "쿠폰 발급"}
        </button>
      </div>

      {/* 목록 */}
      <div className={card}>
        <h2 className="text-base font-bold">발급된 쿠폰 ({list.length})</h2>
        {list.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">아직 발급한 쿠폰이 없어요.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {list.map((c) => {
              const expired = c.expires_at && new Date(c.expires_at) < new Date();
              const usedUp = c.max_uses != null && c.used_count >= c.max_uses;
              return (
                <div
                  key={c.id}
                  className="flex flex-wrap items-center gap-2 rounded-xl border border-black/5 p-3 dark:border-white/10"
                >
                  <span className="rounded-lg bg-violet-500/10 px-2.5 py-1 font-mono text-sm font-bold text-violet-600 dark:text-violet-300">
                    {c.code}
                  </span>
                  <span className="text-sm font-semibold">
                    {c.kind === "percent" ? `${c.value}% 할인` : `${won(c.value)} 할인`}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {c.min_order > 0 && `${won(c.min_order)} 이상 · `}
                    {c.used_count}{c.max_uses != null ? `/${c.max_uses}` : ""}회 사용
                    {c.expires_at && ` · ~${c.expires_at.slice(0, 10)}`}
                  </span>
                  {(expired || usedUp) && (
                    <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[11px] text-rose-500">
                      {expired ? "만료" : "한도 소진"}
                    </span>
                  )}
                  <div className="ml-auto flex items-center gap-3">
                    <button
                      onClick={() => toggle(c)}
                      className={
                        "text-xs font-semibold " +
                        (c.active ? "text-emerald-500" : "text-neutral-400")
                      }
                    >
                      {c.active ? "🟢 활성" : "⚪ 비활성"}
                    </button>
                    <button onClick={() => remove(c)} className="text-xs text-neutral-400 hover:text-rose-500">
                      삭제
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
