"use client";

import { useEffect, useState } from "react";
import Typed from "./Typed";
import "./tutorial.css";

// 상단 꾸미기 튜토리얼 — 밋밋한 헤더가 로고·배너·제목·문구로 완성되는 모션그래픽
const STEPS = [
  { n: "", t: "기본 상태", d: "아무것도 안 꾸미면 상호명만 글씨로 나와요." },
  { n: "1", t: "🏷️ 로고 넣기", d: "내 가게 로고를 올리면 글씨 대신 로고가 보여요." },
  { n: "2", t: "🖼️ 대문 배너", d: "큰 배너 이미지를 넣어 첫 화면을 꽉 채워요." },
  { n: "3", t: "✍️ 대문 제목", d: "고객에게 가장 먼저 보일 한 줄을 적어요." },
  { n: "4", t: "💬 대문 문구", d: "제목 아래 부드러운 안내 문구를 더해요." },
  { n: "✓", t: "완성!", d: "이렇게 첫인상이 확 살아나는 대문이 완성됩니다." },
];

export default function BrandingTutorial() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!playing || collapsed) return;
    const ms = step === 0 ? 1700 : step === 5 ? 3200 : 2600;
    const t = setTimeout(() => setStep((s) => (s + 1) % STEPS.length), ms);
    return () => clearTimeout(t);
  }, [step, playing, collapsed]);

  const cur = STEPS[step];
  const show = (n: number) => step >= n;

  const card =
    "rounded-2xl border border-violet-500/15 bg-gradient-to-br from-violet-500/[0.06] to-pink-500/[0.04] shadow-sm dark:border-white/10";

  return (
    <div className={card + " mb-4 overflow-hidden"}>
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left"
      >
        <span className="text-lg">🎬</span>
        <span className="text-sm font-semibold">상단 꾸미기는 이렇게 — 따라 만드는 미리보기</span>
        <span className="ml-auto text-xs text-neutral-400">{collapsed ? "펼치기 ▼" : "접기 ▲"}</span>
      </button>

      {!collapsed && (
        <div className="grid gap-5 border-t border-black/5 p-4 dark:border-white/10 sm:grid-cols-[1fr_340px] sm:p-5">
          {/* 좌: 설명 */}
          <div className="order-2 sm:order-1">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-sm font-bold text-white">
                {cur.n || "•"}
              </span>
              <h3 className="text-base font-bold sm:text-lg">{cur.t}</h3>
            </div>
            <p className="mt-2 min-h-[40px] text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
              {cur.d}
            </p>

            <div className="mt-4 flex items-center gap-1.5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setStep(i);
                    setPlaying(false);
                  }}
                  className={
                    "h-1.5 rounded-full transition-all " +
                    (i === step ? "w-6 bg-gradient-to-r from-violet-500 to-pink-500" : "w-1.5 bg-black/15 dark:bg-white/20")
                  }
                  aria-label={`${i + 1}단계`}
                />
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setPlaying((v) => !v)}
                className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-semibold transition hover:border-violet-500 dark:border-white/15"
              >
                {playing ? "⏸ 일시정지" : "▶ 재생"}
              </button>
              <button
                onClick={() => {
                  setStep(0);
                  setPlaying(true);
                }}
                className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-semibold transition hover:border-violet-500 dark:border-white/15"
              >
                ↻ 처음부터
              </button>
            </div>
          </div>

          {/* 우: 쇼핑몰 상단 목업 */}
          <div className="order-1 mx-auto w-full max-w-[340px] sm:order-2">
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg dark:border-white/10 dark:bg-neutral-950">
              {/* 헤더 바: 로고 or 상호명 */}
              <div className="flex items-center justify-between border-b border-black/5 px-4 py-3 dark:border-white/10">
                <div className="h-7">
                  {show(1) ? (
                    <span className={"tut-pop inline-flex items-center gap-1.5 " + (show(1) ? "in" : "")}>
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 text-sm">
                        🍓
                      </span>
                      <span className="text-sm font-extrabold">베리팜</span>
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-neutral-400">우리가게</span>
                  )}
                </div>
                <span className="text-sm">🔍 🛒</span>
              </div>

              {/* 히어로: 배너 이미지(그라데이션) + 제목 + 문구 */}
              <div
                className={
                  "relative flex h-[200px] flex-col justify-end p-4 transition-all duration-700 " +
                  (show(2)
                    ? "bg-gradient-to-br from-rose-400 via-pink-500 to-violet-500 text-white"
                    : "bg-black/[0.03] dark:bg-white/[0.05]")
                }
              >
                {show(2) && (
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                )}
                {!show(2) && (
                  <span className="absolute inset-0 grid place-items-center text-3xl opacity-30">🖼️</span>
                )}
                <div className="relative">
                  {show(3) && (
                    <div className="text-[19px] font-extrabold leading-tight drop-shadow">
                      <Typed text="신선한 제철 과일, 베리팜" active={step === 3} />
                      {step !== 3 && show(3) ? "신선한 제철 과일, 베리팜" : ""}
                    </div>
                  )}
                  {show(4) && (
                    <div className={"mt-1.5 text-[12px] opacity-90 " + (show(2) ? "text-white" : "")}>
                      <Typed text="산지에서 오늘 수확해 바로 배송합니다" active={step === 4} />
                      {step !== 4 && show(4) ? "산지에서 오늘 수확해 바로 배송합니다" : ""}
                    </div>
                  )}
                </div>

                {step === 5 && (
                  <div className="tut-float absolute right-3 top-3 rounded-full bg-emerald-500 px-2 py-1 text-[10px] font-bold text-white shadow-lg">
                    ✓ 완성!
                  </div>
                )}
              </div>

              {/* 아래 상품 살짝(맥락용) */}
              <div className="grid grid-cols-3 gap-2 p-3">
                {["🍓", "🍎", "🍊"].map((e, i) => (
                  <div key={i} className="grid h-12 place-items-center rounded-lg bg-black/[0.04] text-xl dark:bg-white/[0.06]">
                    {e}
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-2 text-center text-[11px] text-neutral-400">
              {step === 5 ? "완성된 상단 예시" : "실시간으로 꾸며지는 모습"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
