"use client";

import { useEffect, useState } from "react";
import Typed from "./Typed";
import "./tutorial.css";

// 대문 구성 튜토리얼 — 빈 대문에서 블록이 하나씩 쌓여 완성되는 모션그래픽
const STEPS = [
  { n: "", t: "빈 대문에서 시작", d: "아무것도 없는 대문에 블록을 하나씩 쌓아 올려요." },
  { n: "1", t: "🖼️ 기획전 배너", d: "큰 배너에 제목·이미지·버튼을 넣어 시선을 사로잡아요." },
  { n: "2", t: "🛒 상품 선반", d: "베스트·신상품을 가로로 보기 좋게 진열해요." },
  { n: "3", t: "✍️ 텍스트 블록", d: "브랜드 이야기나 안내 문구를 자유롭게 적어요." },
  { n: "4", t: "🔲 전체 상품 그리드", d: "모든 상품을 한눈에 펼쳐 보여줘요." },
  { n: "✓", t: "완성!", d: "이렇게 나만의 쇼핑몰 대문이 완성됩니다." },
];

const DEMO = [
  { e: "🍓", n: "제철 딸기", p: "8,900" },
  { e: "🍎", n: "유기농 사과", p: "12,000" },
  { e: "🥬", n: "친환경 채소", p: "5,500" },
  { e: "🍊", n: "달콤 한라봉", p: "19,000" },
  { e: "🥚", n: "방사 유정란", p: "9,800" },
  { e: "🍯", n: "야생화 꿀", p: "24,000" },
];

export default function SectionsTutorial() {
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
  const show = (n: number) => step >= n; // 누적 등장

  const card =
    "rounded-2xl border border-violet-500/15 bg-gradient-to-br from-violet-500/[0.06] to-pink-500/[0.04] shadow-sm dark:border-white/10";

  return (
    <div className={card + " overflow-hidden"}>
      {/* 헤더 */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left"
      >
        <span className="text-lg">🎬</span>
        <span className="text-sm font-semibold">대문은 이렇게 만들어요 — 따라 만드는 미리보기</span>
        <span className="ml-auto text-xs text-neutral-400">{collapsed ? "펼치기 ▼" : "접기 ▲"}</span>
      </button>

      {!collapsed && (
        <div className="grid gap-5 border-t border-black/5 p-4 dark:border-white/10 sm:grid-cols-[1fr_280px] sm:p-5">
          {/* 좌: 설명 + 진행 */}
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

            {/* 진행 점 */}
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

          {/* 우: 폰 목업 */}
          <div className="order-1 mx-auto sm:order-2">
            <div className="relative h-[440px] w-[260px] overflow-hidden rounded-[28px] border-[6px] border-neutral-800 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-950">
              {/* 상단바 */}
              <div className="flex items-center justify-between border-b border-black/5 px-3 py-2 dark:border-white/10">
                <span className="text-[11px] font-bold">🏪 우리가게</span>
                <span className="text-[11px]">🔍 🛒</span>
              </div>

              <div className="space-y-2.5 overflow-hidden p-2.5">
                {/* 1. 기획전 배너 */}
                <div className={"tut-rise " + (show(1) ? "in" : "")}>
                  <div className="relative flex h-[88px] flex-col justify-center overflow-hidden rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 px-3 text-white">
                    {show(1) && step < 5 && step === 1 && <span className="tut-shimmer absolute inset-0" />}
                    <span className="text-[8px] font-bold tracking-widest opacity-80">SPECIAL</span>
                    <span className="text-sm font-extrabold">
                      <Typed text="여름 제철 대축제" active={step === 1} />
                      {step !== 1 && show(1) ? "여름 제철 대축제" : ""}
                    </span>
                    <span className="mt-1 w-fit rounded-full bg-white/25 px-2 py-0.5 text-[8px] font-bold">
                      보러가기 →
                    </span>
                  </div>
                </div>

                {/* 2. 상품 선반 */}
                <div className={"tut-rise " + (show(2) ? "in" : "")}>
                  <div className="mb-1 text-[10px] font-bold">🔥 베스트</div>
                  <div className="flex gap-1.5">
                    {DEMO.slice(0, 3).map((p, i) => (
                      <div
                        key={i}
                        className={"tut-pop flex-1 " + (show(2) ? "in" : "")}
                        style={{ transitionDelay: `${i * 130}ms` }}
                      >
                        <div className="grid h-12 place-items-center rounded-lg bg-black/[0.04] text-xl dark:bg-white/[0.06]">
                          {p.e}
                        </div>
                        <div className="mt-0.5 truncate text-[8px]">{p.n}</div>
                        <div className="text-[8px] font-bold">₩{p.p}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. 텍스트 블록 */}
                <div className={"tut-rise " + (show(3) ? "in" : "")}>
                  <div className="rounded-xl bg-black/[0.03] py-2.5 text-center dark:bg-white/[0.05]">
                    <div className="text-[8px] font-bold tracking-widest text-violet-500">ABOUT</div>
                    <div className="text-[10px] font-bold">
                      <Typed text="산지에서 식탁까지" active={step === 3} />
                      {step !== 3 && show(3) ? "산지에서 식탁까지" : ""}
                    </div>
                  </div>
                </div>

                {/* 4. 전체 상품 그리드 */}
                <div className={"tut-rise " + (show(4) ? "in" : "")}>
                  <div className="mb-1 text-[10px] font-bold">전체 상품</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {DEMO.map((p, i) => (
                      <div
                        key={i}
                        className={"tut-pop " + (show(4) ? "in" : "")}
                        style={{ transitionDelay: `${i * 70}ms` }}
                      >
                        <div className="grid h-11 place-items-center rounded-lg bg-black/[0.04] text-lg dark:bg-white/[0.06]">
                          {p.e}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 완성 배지 */}
              {step === 5 && (
                <div className="tut-float pointer-events-none absolute right-2 top-9 rounded-full bg-emerald-500 px-2 py-1 text-[9px] font-bold text-white shadow-lg">
                  ✓ 완성!
                </div>
              )}
            </div>
            <p className="mt-2 text-center text-[11px] text-neutral-400">
              {step === 5 ? "완성된 대문 예시" : "실시간으로 쌓이는 모습"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
