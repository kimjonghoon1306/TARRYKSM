"use client";

import { useState } from "react";
import { SKINS, SKIN_BY_ID } from "@/lib/skins";
import { setStoreSkin } from "@/app/dashboard/actions";

export default function SkinPicker({
  storeId,
  currentSkin,
}: {
  storeId: string;
  currentSkin: string;
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
                    className="mb-3 flex h-16 w-full items-center justify-center rounded-xl"
                    style={{ background: sk.bg }}
                  >
                    <span
                      className="h-7 w-7 rounded-full"
                      style={{ background: sk.color, boxShadow: `0 4px 12px -2px ${sk.color}` }}
                    />
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
                  <div className="text-xs text-neutral-400">{sk.vibe}</div>
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
