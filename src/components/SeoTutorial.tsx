"use client";

import { useEffect, useState } from "react";
import "./tutorial.css";

// 검색 노출(SEO) 튜토리얼 — 구글 검색결과가 단계별로 완성되는 모션 + 서치콘솔 등록 버튼.
const STEPS = [
  {
    n: "",
    t: "검색 노출(SEO)이 뭐예요?",
    d: "손님이 구글·네이버에서 검색했을 때 내 쇼핑몰이 뜨게 하는 거예요.",
    how: [
      "사람들이 ‘제철 과일’ 같은 걸 검색하면, 내 쇼핑몰이 검색 결과에 나오게 만드는 설정이에요.",
      "아래 3가지(제목·설명·키워드)만 채우면 끝이에요. 어렵지 않아요!",
      "오른쪽 화면이 검색 결과에 어떻게 보일지 미리보기예요.",
    ],
  },
  {
    n: "1",
    t: "🔤 검색 제목 적기",
    d: "검색했을 때 파란 글씨로 뜨는 제목이에요.",
    how: [
      "‘검색 제목’ 칸에 가게를 한마디로 적으세요.",
      "예: ‘온종일팜 — 산지직송 제철 과일’ 처럼요.",
      "비우면 가게 이름이 자동으로 들어가요.",
    ],
  },
  {
    n: "2",
    t: "📝 검색 설명 적기",
    d: "제목 아래 회색 글씨로 보이는 한 줄 소개예요.",
    how: [
      "‘검색 설명’ 칸에 어떤 가게인지 한 문장으로 적으세요.",
      "예: ‘산지에서 오늘 수확한 과일·채소를 합리적인 가격에’ 처럼요.",
      "손님이 클릭하고 싶게 매력적으로 적는 게 좋아요.",
    ],
  },
  {
    n: "3",
    t: "🏷️ 키워드 적기",
    d: "어떤 단어로 검색될지 정하는 거예요.",
    how: [
      "‘키워드’ 칸에 손님이 검색할 만한 단어를 쉼표로 적으세요.",
      "예: ‘제철과일, 산지직송, 유기농 채소’ 처럼요.",
      "내 상품과 관련된 단어를 3~5개 넣으면 충분해요.",
    ],
  },
  {
    n: "4",
    t: "🚀 검색엔진에 등록하기",
    d: "구글·네이버에 ‘내 쇼핑몰 있어요’라고 알려주면 더 빨리 떠요.",
    how: [
      "저장하면 ‘사이트맵’이 자동으로 만들어져요. (검색엔진이 읽는 목록)",
      "아래 ‘구글 서치콘솔 / 네이버 서치어드바이저’ 버튼을 눌러 들어가세요.",
      "거기에 내 사이트맵 주소를 등록하면 끝! (주소는 아래 ‘복사’ 버튼으로 복사)",
      "한 번만 등록해두면 이후엔 자동이에요.",
    ],
  },
];

const card = "rounded-2xl border border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]";

export default function SeoTutorial({ slug }: { slug?: string }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);

  const sitemapUrl = "https://on.온종일.com/sitemap.xml";

  useEffect(() => {
    if (!playing || collapsed) return;
    const ms = step === 0 ? 1900 : step === 4 ? 3600 : 2700;
    const t = setTimeout(() => setStep((s) => (s + 1) % STEPS.length), ms);
    return () => clearTimeout(t);
  }, [step, playing, collapsed]);

  const cur = STEPS[step];
  const show = (n: number) => step >= n;

  function copySitemap() {
    navigator.clipboard?.writeText(sitemapUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className={card + " mb-4 overflow-hidden"}>
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left"
      >
        <span className="text-lg">🎬</span>
        <span className="text-sm font-semibold">검색 노출(SEO)은 이렇게 — 따라 하는 미리보기</span>
        <span className="ml-auto text-xs text-neutral-400">{collapsed ? "펼치기 ▼" : "접기 ▲"}</span>
      </button>

      {!collapsed && (
        <div className="grid gap-5 border-t border-black/5 p-4 dark:border-white/10 sm:grid-cols-[1fr_340px] sm:p-5">
          {/* 좌: 설명 */}
          <div className="order-2 sm:order-1">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-sm font-bold text-white">
                {cur.n || "?"}
              </span>
              <h3 className="text-base font-bold sm:text-lg">{cur.t}</h3>
            </div>
            <p className="mt-2 min-h-[40px] text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">{cur.d}</p>

            <div className="mt-4 flex items-center gap-1.5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setStep(i); setPlaying(false); }}
                  className={"h-1.5 rounded-full transition-all " + (i === step ? "w-6 bg-gradient-to-r from-violet-500 to-pink-500" : "w-1.5 bg-black/15 dark:bg-white/20")}
                  aria-label={`${i + 1}단계`}
                />
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={() => setPlaying((p) => !p)} className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-semibold transition hover:border-violet-500 dark:border-white/15">
                {playing ? "⏸ 멈춤" : "▶ 재생"}
              </button>
              <button onClick={() => { setStep((s) => (s + 1) % STEPS.length); setPlaying(false); }} className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-semibold transition hover:border-violet-500 dark:border-white/15">
                다음 ›
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-50/60 p-4 dark:border-amber-300/20 dark:bg-amber-400/[0.06]">
              <div className="mb-2 flex items-center gap-1.5 text-sm font-bold text-amber-700 dark:text-amber-300">🙋 쉽게 따라하기</div>
              <ol className="space-y-2.5">
                {cur.how.map((h, i) => (
                  <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-200">
                    <span className="grid h-5 w-5 flex-none place-items-center rounded-full bg-amber-400/30 text-[11px] font-bold text-amber-700 dark:text-amber-300">{i + 1}</span>
                    {h}
                  </li>
                ))}
              </ol>
            </div>

            {/* 서치콘솔 등록 버튼 — 4단계에서 강조 */}
            <div className={"mt-4 rounded-xl border p-4 transition " + (step === 4 ? "border-violet-400/50 bg-violet-500/[0.06]" : "border-black/8 dark:border-white/10")}>
              <div className="mb-2 text-sm font-bold">🔧 검색엔진에 사이트맵 등록</div>
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
                <code className="flex-1 truncate font-mono text-xs">{sitemapUrl}</code>
                <button onClick={copySitemap} className="flex-none rounded-md bg-violet-500 px-2.5 py-1 text-xs font-bold text-white">
                  {copied ? "✓ 복사됨" : "복사"}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="flex-1 rounded-lg bg-[#4285F4] px-3 py-2 text-center text-xs font-bold text-white transition hover:brightness-105">
                  구글 서치콘솔 등록 ↗
                </a>
                <a href="https://searchadvisor.naver.com/" target="_blank" rel="noopener noreferrer" className="flex-1 rounded-lg bg-[#03C75A] px-3 py-2 text-center text-xs font-bold text-white transition hover:brightness-105">
                  네이버 서치어드바이저 등록 ↗
                </a>
              </div>
              <p className="mt-2 text-[11px] text-neutral-400">위 주소를 복사해 각 사이트의 ‘사이트맵 제출’에 붙여넣으세요. 한 번만 하면 돼요.</p>
            </div>
          </div>

          {/* 우: 구글 검색결과 미리보기가 채워지는 모션 */}
          <div className="order-1 mx-auto w-full max-w-[340px] sm:order-2">
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg dark:border-white/10 dark:bg-neutral-950">
              <div className="flex items-center gap-2 border-b border-black/5 px-4 py-3 dark:border-white/10">
                <span className="text-base">🔍</span>
                <div className="flex-1 rounded-full bg-black/[0.05] px-3 py-1.5 text-xs text-neutral-500 dark:bg-white/[0.08]">제철 과일 산지직송</div>
              </div>
              <div className="p-4">
                <div className="text-[11px] text-neutral-400">on.온종일.com › {slug || "myshop"}</div>
                {/* 제목 */}
                <div className={"mt-1 text-[17px] font-medium leading-snug " + (show(1) ? "tut-pop in text-[#1a0dab] dark:text-[#8ab4f8]" : "text-neutral-300")}>
                  {show(1) ? "온종일팜 — 산지직송 제철 과일" : "쇼핑몰 제목이 여기에"}
                </div>
                {/* 설명 */}
                <div className={"mt-1.5 text-[13px] leading-relaxed " + (show(2) ? "tut-pop in text-neutral-600 dark:text-neutral-300" : "text-neutral-300 dark:text-neutral-600")}>
                  {show(2) ? "산지에서 오늘 수확한 과일·채소를 합리적인 가격에 만나보세요. 신선함을 그대로 배송합니다." : "쇼핑몰 설명이 여기에 표시돼요"}
                </div>
                {/* 키워드 칩 */}
                {show(3) && (
                  <div className="tut-pop in mt-2.5 flex flex-wrap gap-1.5">
                    {["제철과일", "산지직송", "유기농 채소"].map((k) => (
                      <span key={k} className="rounded-full bg-violet-500/12 px-2 py-0.5 text-[11px] font-semibold text-violet-600 dark:text-violet-300">#{k}</span>
                    ))}
                  </div>
                )}
                {/* 4단계: 등록 완료 배지 */}
                {step === 4 && (
                  <div className="tut-float mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-bold text-white shadow-lg">
                    🚀 검색엔진에 등록됨
                  </div>
                )}
              </div>
            </div>
            <p className="mt-2 text-center text-[11px] text-neutral-400">
              {step === 4 ? "검색에 이렇게 노출돼요" : "검색 결과 미리보기"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
