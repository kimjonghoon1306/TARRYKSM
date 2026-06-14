"use client";

import { useState } from "react";
import { SKINS } from "@/lib/skins";
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

  return (
    <form action={setStoreSkin}>
      <input type="hidden" name="id" value={storeId} />
      <input type="hidden" name="skin" value={selected} />

      {/* 상단 저장 바 */}
      <div className="sticky top-2 z-10 mb-5 flex items-center justify-between gap-3 rounded-2xl border border-black/5 bg-white/90 p-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-[#191a30]/90">
        <div className="text-sm">
          {changed ? (
            <span>
              <b className="text-violet-500">{selected}</b> 스킨으로 변경 — 저장하면 적용돼요
            </span>
          ) : (
            <span className="text-neutral-500">현재 스킨: <b>{currentSkin}</b></span>
          )}
        </div>
        <button
          type="submit"
          disabled={!changed}
          className="press-glow rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-105 active:scale-[.97] disabled:opacity-50"
        >
          저장하기
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {SKINS.map((sk) => {
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
            </button>
          );
        })}
      </div>
    </form>
  );
}
