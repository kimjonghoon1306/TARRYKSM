"use client";

import { useState, useTransition } from "react";
import { bulkAddProducts } from "@/app/dashboard/[id]/products/actions";

const SAMPLE = `상품명,가격,카테고리,설명,재고,이모지
유기농 시금치,3900,채소,오늘 아침 수확,50,🥬
제주 감귤 3kg,15000,과일,새콤달콤 노지 감귤,30,🍊
한우 등심 200g,39000,정육,1++ 등급,10,🥩`;

// 상품 대량 등록 — 엑셀에서 복사한 CSV를 붙여넣어 한 번에 등록. (locked면 프로 요금제 안내)
export default function BulkUpload({ storeId, locked, planName }: { storeId: string; locked?: boolean; planName?: string }) {
  const [open, setOpen] = useState(false);
  const [csv, setCsv] = useState("");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function submit() {
    setMsg(null);
    start(() => {
      bulkAddProducts(storeId, csv).then((res) => {
        if (res.ok) {
          setMsg({ ok: true, text: `${res.added}개 상품을 등록했어요! 🎉` });
          setCsv("");
        } else {
          setMsg({ ok: false, text: res.error || "등록 실패" });
        }
      });
    });
  }

  // 프로 요금제 미만이면 잠금 안내
  if (locked) {
    return (
      <a
        href="/dashboard/plan"
        className="flex items-center gap-2 rounded-lg border border-dashed border-amber-400/50 bg-amber-50/60 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:brightness-105 dark:border-amber-400/30 dark:bg-amber-400/[0.06] dark:text-amber-300"
      >
        🔒 📋 대량 등록 (엑셀·CSV) — {planName || "프로"} 요금제부터 →
      </a>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-black/10 px-4 py-2 text-sm font-semibold transition hover:border-violet-500 dark:border-white/15"
      >
        📋 대량 등록 (엑셀·CSV)
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-violet-400/40 bg-violet-500/[0.04] p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold">📋 상품 대량 등록</h3>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-neutral-400 hover:text-neutral-600">✕ 닫기</button>
      </div>
      <p className="mb-2 text-xs text-neutral-500">
        엑셀·구글시트에서 표를 복사해 아래에 붙여넣으세요. 순서: <b>상품명, 가격, 카테고리, 설명, 재고, 이모지</b>
        <br />상품명·가격만 있어도 돼요. (재고·설명·이모지·카테고리는 비워도 됨) 첫 줄이 제목이면 자동으로 건너뛰어요.
      </p>
      <textarea
        value={csv}
        onChange={(e) => setCsv(e.target.value)}
        placeholder={SAMPLE}
        rows={8}
        className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 font-mono text-xs outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 dark:border-white/10 dark:bg-white/[0.04]"
      />
      <div className="mt-1.5 flex items-center justify-between">
        <button type="button" onClick={() => setCsv(SAMPLE)} className="text-xs font-semibold text-violet-500 hover:underline">
          예시 채우기
        </button>
        {msg && <span className={"text-xs font-semibold " + (msg.ok ? "text-emerald-600" : "text-rose-500")}>{msg.text}</span>}
      </div>
      <button
        type="button"
        onClick={submit}
        disabled={pending || !csv.trim()}
        className="press-glow mt-2 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 px-5 py-2.5 text-sm font-bold text-white shadow disabled:opacity-50"
      >
        {pending ? "등록 중…" : "한 번에 등록하기"}
      </button>
    </div>
  );
}
