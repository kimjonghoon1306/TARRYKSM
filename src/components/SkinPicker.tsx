"use client";

import { useState } from "react";
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
  const changed = selected !== currentSkin;
  const sel = SKIN_BY_ID[selected];
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

        {/* 실시간 미리보기 — 스킨 고르면 이렇게 보여요 */}
        {sel && (
          <div className="mt-3">
            <div className="mb-1.5 text-[11px] font-semibold text-neutral-400">👀 이 스킨으로 보면</div>
            <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(0,0,0,.08)", background: sel.bg, boxShadow: "0 8px 22px -14px rgba(0,0,0,.4)" }}>
              {/* 상단바 */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 13px", color: sel.color, borderBottom: `1px solid ${hexA(sel.color, 0.12)}` }}>
                <b style={{ fontWeight: 800, fontSize: 13, letterSpacing: 0.3 }}>{storeName || "MY SHOP"}</b>
                <span style={{ fontSize: 12 }}>🔍 🛒</span>
              </div>
              {/* 히어로 */}
              <div style={{ position: "relative", height: 84, overflow: "hidden", background: hexA(sel.color, 0.14) }}>
                {SKIN_THUMB[sel.id] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={SKIN_THUMB[sel.id]} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.9 }} />
                )}
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 12, background: "linear-gradient(to top, rgba(0,0,0,.45), transparent)" }}>
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>새로 들어왔어요</div>
                </div>
              </div>
              {/* 상품 2개 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: 12 }}>
                {[0, 1].map((i) => (
                  <div key={i} style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${hexA(sel.color, 0.15)}` }}>
                    <div style={{ aspectRatio: "1 / 1", background: hexA(sel.color, 0.1), display: "grid", placeItems: "center", overflow: "hidden" }}>
                      {SKIN_THUMB[sel.id] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={SKIN_THUMB[sel.id]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      )}
                    </div>
                    <div style={{ padding: "7px 8px", color: sel.color }}>
                      <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.85 }}>상품 이름</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                        <b style={{ fontSize: 12 }}>₩12,000</b>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: sel.color, color: sel.bg }}>담기</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
    </form>
  );
}
