"use client";

import { useState, useTransition } from "react";
import { setAutoCoupons } from "@/app/dashboard/[id]/coupons/actions";

type Coupon = { id: string; code: string; kind: string; value: number };

const won = (n: number) => "₩" + n.toLocaleString("ko-KR");
const SEL =
  "rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 dark:border-white/10 dark:bg-white/[0.04]";

// 가입축하 / 재구매 자동 쿠폰 — 만든 쿠폰 중에서 골라 자동 발급. 같은 쿠폰은 1회만 발급(서버 보장).
export default function AutoCouponSettings({
  storeId,
  coupons,
  welcome,
  repurchase,
}: {
  storeId: string;
  coupons: Coupon[];
  welcome: string | null;
  repurchase: string | null;
}) {
  const [w, setW] = useState(welcome || "");
  const [r, setR] = useState(repurchase || "");
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const dirty = w !== (welcome || "") || r !== (repurchase || "");

  const label = (c: Coupon) => `${c.code} (${c.kind === "amount" ? won(c.value) : c.value + "%"})`;

  function save() {
    setSaved(false);
    start(() => {
      setAutoCoupons(storeId, w || null, r || null).then((res) => {
        if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
      });
    });
  }

  if (coupons.length === 0) {
    return (
      <p className="text-sm text-neutral-400">
        먼저 위에서 쿠폰을 만들면, 그 쿠폰을 가입축하·재구매 시 <b>자동 발급</b>하도록 설정할 수 있어요.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-neutral-500">🎁 가입축하 쿠폰</label>
          <select value={w} onChange={(e) => setW(e.target.value)} className={SEL + " w-full"}>
            <option value="">자동 발급 안 함</option>
            {coupons.map((c) => <option key={c.id} value={c.id}>{label(c)}</option>)}
          </select>
          <p className="mt-1 text-xs text-neutral-400">손님이 회원가입하면 자동으로 쿠폰함에 들어가요.</p>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-neutral-500">🔄 재구매 쿠폰</label>
          <select value={r} onChange={(e) => setR(e.target.value)} className={SEL + " w-full"}>
            <option value="">자동 발급 안 함</option>
            {coupons.map((c) => <option key={c.id} value={c.id}>{label(c)}</option>)}
          </select>
          <p className="mt-1 text-xs text-neutral-400">로그인 손님이 주문하면 다음 구매용 쿠폰을 줘요. (1회)</p>
        </div>
      </div>
      <button
        onClick={save}
        disabled={!dirty || pending}
        className="press-glow rounded-lg bg-gradient-to-r from-violet-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-50"
      >
        {pending ? "저장 중…" : saved ? "✓ 저장됨" : "자동 쿠폰 저장"}
      </button>
    </div>
  );
}
