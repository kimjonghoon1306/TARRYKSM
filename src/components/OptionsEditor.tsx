"use client";

import { useState } from "react";

export type OptChoice = { label: string; add: number };
export type OptGroup = { name: string; choices: OptChoice[] };

const INPUT =
  "rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-violet-500 dark:border-white/10 dark:bg-white/[0.04]";

// 상품 옵션 편집 — 색상/사이즈 등 그룹과 선택지. 결과를 hidden input(name=options)에 JSON으로.
export default function OptionsEditor({ initial }: { initial?: OptGroup[] }) {
  const [groups, setGroups] = useState<OptGroup[]>(initial && initial.length ? initial : []);

  function addGroup() {
    setGroups((g) => [...g, { name: "", choices: [{ label: "", add: 0 }] }]);
  }
  function removeGroup(gi: number) {
    setGroups((g) => g.filter((_, i) => i !== gi));
  }
  function setGroupName(gi: number, name: string) {
    setGroups((g) => g.map((x, i) => (i === gi ? { ...x, name } : x)));
  }
  function addChoice(gi: number) {
    setGroups((g) => g.map((x, i) => (i === gi ? { ...x, choices: [...x.choices, { label: "", add: 0 }] } : x)));
  }
  function removeChoice(gi: number, ci: number) {
    setGroups((g) => g.map((x, i) => (i === gi ? { ...x, choices: x.choices.filter((_, j) => j !== ci) } : x)));
  }
  function setChoice(gi: number, ci: number, patch: Partial<OptChoice>) {
    setGroups((g) =>
      g.map((x, i) =>
        i === gi ? { ...x, choices: x.choices.map((c, j) => (j === ci ? { ...c, ...patch } : c)) } : x
      )
    );
  }

  // 빈 값 정리 후 직렬화
  const clean = groups
    .map((g) => ({
      name: g.name.trim(),
      choices: g.choices.map((c) => ({ label: c.label.trim(), add: c.add || 0 })).filter((c) => c.label),
    }))
    .filter((g) => g.name && g.choices.length);

  return (
    <div>
      <input type="hidden" name="options" value={JSON.stringify(clean)} />
      {groups.length === 0 && (
        <p className="mb-2 text-xs text-neutral-400">
          색상·사이즈처럼 손님이 고르는 옵션을 추가할 수 있어요. (없으면 비워두세요)
        </p>
      )}
      <div className="space-y-3">
        {groups.map((g, gi) => (
          <div key={gi} className="rounded-xl border border-black/10 p-3 dark:border-white/10">
            <div className="mb-2 flex items-center gap-2">
              <input
                value={g.name}
                onChange={(e) => setGroupName(gi, e.target.value)}
                placeholder="옵션명 (예: 사이즈)"
                className={INPUT + " flex-1"}
              />
              <button type="button" onClick={() => removeGroup(gi)} className="text-xs text-neutral-400 hover:text-rose-500">
                옵션 삭제
              </button>
            </div>
            <div className="space-y-1.5">
              {g.choices.map((c, ci) => (
                <div key={ci} className="flex items-center gap-2">
                  <input
                    value={c.label}
                    onChange={(e) => setChoice(gi, ci, { label: e.target.value })}
                    placeholder="선택지 (예: L)"
                    className={INPUT + " flex-1"}
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-neutral-400">+₩</span>
                    <input
                      type="number"
                      value={c.add || 0}
                      onChange={(e) => setChoice(gi, ci, { add: parseInt(e.target.value, 10) || 0 })}
                      className={INPUT + " w-20"}
                    />
                  </div>
                  <button type="button" onClick={() => removeChoice(gi, ci)} className="text-xs text-neutral-400 hover:text-rose-500">
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addChoice(gi)}
                className="text-xs font-semibold text-violet-500 hover:text-violet-400"
              >
                ＋ 선택지 추가
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addGroup}
        className="mt-2 rounded-lg border border-dashed border-black/15 px-3 py-1.5 text-xs font-semibold text-neutral-500 transition hover:border-violet-400 hover:text-violet-500 dark:border-white/15"
      >
        ＋ 옵션 추가 (색상·사이즈 등)
      </button>
    </div>
  );
}
