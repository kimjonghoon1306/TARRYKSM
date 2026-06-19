"use client";

import { useState } from "react";
import { BotAvatar, BOT_THEMES, type BotStyle } from "@/components/StoreBot";

const STYLES: BotStyle[] = ["designer", "robot", "bear"];

// 챗봇 모양 고르기 + 켜기/끄기 + 인사말. 저장은 부모 form의 SaveButton.
export default function BotStylePicker({
  on,
  style,
  greeting,
}: {
  on: boolean;
  style: BotStyle;
  greeting: string;
}) {
  const [enabled, setEnabled] = useState(on);
  const [sel, setSel] = useState<BotStyle>(STYLES.includes(style) ? style : "designer");

  return (
    <div className="space-y-4">
      {/* 켜기/끄기 */}
      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
        <span className="text-sm font-semibold">
          쇼핑몰에 챗봇 표시
          <span className="ml-2 text-xs font-normal text-neutral-400">
            {enabled ? "켜짐 — 손님 화면 오른쪽 아래에 떠요" : "꺼짐 — 챗봇 숨김"}
          </span>
        </span>
        <span className="relative inline-flex shrink-0">
          <input type="checkbox" name="chat_on" value="1" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="peer sr-only" />
          <span className="h-6 w-11 rounded-full bg-neutral-300 transition peer-checked:bg-violet-500 dark:bg-white/15" />
          <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
        </span>
      </label>

      {/* 모양 고르기 */}
      <div className={enabled ? "" : "pointer-events-none opacity-40"}>
        <input type="hidden" name="chat_style" value={sel} />
        <label className="mb-2 block text-xs font-semibold text-neutral-500">챗봇 모양 (스킨 분위기에 맞게 골라보세요)</label>
        <div className="grid grid-cols-3 gap-2">
          {STYLES.map((s) => {
            const t = BOT_THEMES[s];
            const active = sel === s;
            return (
              <button
                type="button"
                key={s}
                onClick={() => setSel(s)}
                className={
                  "flex flex-col items-center gap-1.5 rounded-2xl border p-3 transition active:scale-95 " +
                  (active
                    ? "border-violet-500 bg-violet-500/10 ring-2 ring-violet-500/25"
                    : "border-black/10 bg-black/[0.02] hover:border-violet-400/50 dark:border-white/10 dark:bg-white/[0.03]")
                }
              >
                <BotAvatar style={s} size={48} talking={active} />
                <span className="text-[13px] font-bold">{t.emoji} {t.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 인사말 */}
      <div className={enabled ? "" : "pointer-events-none opacity-40"}>
        <label className="mb-1.5 block text-xs font-semibold text-neutral-500">첫 인사말 (선택)</label>
        <input
          name="chat_greeting"
          defaultValue={greeting}
          placeholder="예: 안녕하세요! 무엇이든 물어보세요 😊"
          maxLength={200}
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 dark:border-white/10 dark:bg-white/[0.04]"
        />
        <p className="mt-1.5 text-xs text-neutral-400">비우면 기본 인사말이 나와요. 아래에서 질문/답을 추가해야 챗봇이 표시됩니다.</p>
      </div>
    </div>
  );
}
