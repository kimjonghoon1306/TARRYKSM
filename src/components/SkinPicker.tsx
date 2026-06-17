"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SKINS, SKIN_BY_ID } from "@/lib/skins";
import { setStoreSkin } from "@/app/dashboard/actions";

// 스킨별 대표 미리보기 사진 (public/landing/img 재사용)
const FOOD = "/landing/img/food";
const PROD = "/landing/img/products";
const SKIN_THUMB: Record<string, string> = {
  // 식품 특화
  harvest: `${FOOD}/produce_spinach.webp`, ocean: `${FOOD}/seafood_hairtail.webp`,
  butcher: `${FOOD}/meat_beef.webp`, bakery: `${FOOD}/bakery_bread.webp`,
  orchard: `${FOOD}/fruit_apple.webp`, hanok: `${FOOD}/traditional_doenjang.webp`,
  market: `${FOOD}/banchan_anchovy.webp`, sprout: `${FOOD}/produce_ssam.webp`,
  dairy: `${FOOD}/dairy_milk.webp`, gourmet: `${FOOD}/gourmet_giftset.webp`,
  // 범용
  mono: `${PROD}/candle.webp`, noir: `${PROD}/watch.webp`, bloom: `${PROD}/serum.webp`,
  citrus: `${PROD}/sneaker.webp`, azure: `${PROD}/earbuds.webp`, mocha: `${PROD}/mug.webp`,
  grape: `${PROD}/sunglasses.webp`, pine: `${PROD}/plant.webp`, midnight: `${PROD}/earbuds.webp`,
  coral: `${PROD}/cap.webp`, lavender: `${PROD}/serum.webp`, slate: `${PROD}/tote.webp`,
  berry: `${PROD}/sunglasses.webp`, crimson: `${PROD}/sneaker.webp`,
};

// hex 색에 투명도 적용 (#rrggbb + alpha → rgba)
function hexA(hex: string, a: number) {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export default function SkinPicker({
  storeId,
  currentSkin,
  storeName,
}: {
  storeId: string;
  currentSkin: string;
  storeName?: string;
}) {
  const [selected, setSelected] = useState(currentSkin);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [device, setDevice] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const changed = selected !== currentSkin;
  const sel = SKIN_BY_ID[selected];
  const DEVICE_W = { mobile: 390, tablet: 720, desktop: 980 } as const;
  const DEVICE_COLS = { mobile: 2, tablet: 3, desktop: 4 } as const;
  const foodSkins = SKINS.filter((s) => s.group === "food");
  const generalSkins = SKINS.filter((s) => s.group === "general");

  return (
    <form action={setStoreSkin}>
      <input type="hidden" name="id" value={storeId} />
      <input type="hidden" name="skin" value={selected} />

      {/* 상단 저장 바 + 선택 스킨 상세 설명 */}
      <div className="sticky top-2 z-10 mb-5 rounded-2xl border border-black/5 bg-white/90 p-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-[#191a30]/90">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm">
            {changed ? (
              <span>
                <b className="text-violet-500">{sel?.name}</b> 스킨으로 변경 — 저장하면 적용돼요
              </span>
            ) : (
              <span className="text-neutral-500">현재 스킨: <b>{sel?.name}</b></span>
            )}
          </div>
          <button
            type="submit"
            disabled={!changed}
            className="press-glow shrink-0 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-105 active:scale-[.97] disabled:opacity-50"
          >
            저장하기
          </button>
        </div>
        {sel && (
          <div className="mt-2 border-t border-black/5 pt-2 text-xs dark:border-white/10">
            <p className="text-neutral-600 dark:text-neutral-300">{sel.desc}</p>
            <p className="mt-1 text-neutral-400">
              <b className="text-violet-500">추천 업태</b> · {sel.recommend}
            </p>
          </div>
        )}

        {/* 미리보기 버튼 (누르면 모달로 크게) */}
        {sel && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="w-full rounded-xl border border-violet-300 bg-violet-50 px-4 py-2.5 text-sm font-bold text-violet-600 transition hover:bg-violet-100 dark:border-violet-500/40 dark:bg-violet-500/10 dark:text-violet-300"
            >
              🔍 미리보기
            </button>
          </div>
        )}
      </div>

      {[
        { title: "🍱 식품 · 농축수산물 특화", list: foodSkins },
        { title: "✨ 범용 (모든 업태)", list: generalSkins },
      ].map((grp) => (
        <div key={grp.title} className="mb-7">
          <h3 className="mb-3 text-sm font-bold text-neutral-500">{grp.title}</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {grp.list.map((sk) => {
              const active = sk.id === selected;
              const isCurrent = sk.id === currentSkin;
              return (
                <button
                  type="button"
                  key={sk.id}
                  onClick={() => setSelected(sk.id)}
                  className={
                    "lift rounded-2xl border bg-white p-4 text-left shadow-sm transition dark:bg-white/[0.03] " +
                    (active
                      ? "border-violet-500 ring-2 ring-violet-500/30"
                      : "border-black/5 hover:border-violet-400 dark:border-white/10")
                  }
                >
                  <div
                    className="mb-3 h-16 w-full overflow-hidden rounded-xl"
                    style={{ background: sk.bg }}
                  >
                    {SKIN_THUMB[sk.id] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={SKIN_THUMB[sk.id]} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center">
                        <span
                          className="h-7 w-7 rounded-full"
                          style={{ background: sk.color, boxShadow: `0 4px 12px -2px ${sk.color}` }}
                        />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <b className="text-sm">{sk.name}</b>
                    <div className="flex gap-1">
                      {isCurrent && (
                        <span className="rounded-full bg-neutral-500/15 px-2 py-0.5 text-[10px] font-bold text-neutral-500">
                          현재
                        </span>
                      )}
                      {active && !isCurrent && (
                        <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-bold text-violet-500 dark:text-violet-300">
                          선택됨
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <span
                      className="inline-block h-3 w-3 flex-none rounded-full ring-1 ring-black/10 dark:ring-white/15"
                      style={{ background: sk.color }}
                    />
                    {sk.vibe}
                  </div>
                  <div className="mt-1 line-clamp-1 text-[11px] text-neutral-400/80">{sk.recommend}</div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* 미리보기 모달 (Portal · 버튼 누를 때만) */}
      {previewOpen && sel && mounted && createPortal(
        <div
          onClick={() => setPreviewOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 16, background: "rgba(0,0,0,0.7)" }}
        >
          {/* 기기 선택 */}
          <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", gap: 6, background: "rgba(255,255,255,0.15)", padding: 5, borderRadius: 999 }}>
            {([["mobile", "📱 모바일"], ["tablet", "📲 태블릿"], ["desktop", "🖥 데스크탑"]] as const).map(([d, label]) => (
              <button key={d} type="button" onClick={() => setDevice(d)}
                style={{ borderRadius: 999, padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none",
                  background: device === d ? "#fff" : "transparent", color: device === d ? "#111" : "#fff" }}>
                {label}
              </button>
            ))}
          </div>

          {/* 스토어프런트 미리보기 (선택 기기 너비) */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: `min(${DEVICE_W[device]}px, 94vw)`, maxHeight: "78vh", overflowY: "auto", borderRadius: 16, border: "1px solid rgba(0,0,0,.1)", background: sel.bg, boxShadow: "0 25px 60px rgba(0,0,0,.5)" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", color: sel.color, borderBottom: `1px solid ${hexA(sel.color, 0.14)}` }}>
              <b style={{ fontWeight: 800, fontSize: 16, letterSpacing: 0.3 }}>{storeName || "MY SHOP"}</b>
              <span style={{ fontSize: 14 }}>🔍 🛒</span>
            </div>
            <div style={{ position: "relative", height: device === "mobile" ? 150 : 220, overflow: "hidden", background: hexA(sel.color, 0.14) }}>
              {SKIN_THUMB[sel.id] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={SKIN_THUMB[sel.id]} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.92 }} />
              )}
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 18, background: "linear-gradient(to top, rgba(0,0,0,.5), transparent)" }}>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 22 }}>새로 들어왔어요</div>
                <span style={{ marginTop: 8, alignSelf: "flex-start", padding: "7px 16px", borderRadius: 8, background: sel.color, color: sel.bg, fontSize: 13, fontWeight: 800 }}>둘러보기</span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${DEVICE_COLS[device]}, 1fr)`, gap: 12, padding: 16 }}>
              {Array.from({ length: DEVICE_COLS[device] * 2 }).map((_, i) => (
                <div key={i} style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${hexA(sel.color, 0.15)}` }}>
                  <div style={{ aspectRatio: "1 / 1", overflow: "hidden", background: hexA(sel.color, 0.1) }}>
                    {SKIN_THUMB[sel.id] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={SKIN_THUMB[sel.id]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    )}
                  </div>
                  <div style={{ padding: "9px 10px", color: sel.color }}>
                    <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.85 }}>상품 이름</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 5 }}>
                      <b style={{ fontSize: 13 }}>₩12,000</b>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 7, background: sel.color, color: sel.bg }}>담기</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button type="button" onClick={() => setPreviewOpen(false)}
            style={{ color: "#fff", fontSize: 14, fontWeight: 700, padding: "9px 20px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.45)", background: "transparent", cursor: "pointer" }}>
            ✕ 닫기
          </button>
        </div>,
        document.body
      )}
    </form>
  );
}
