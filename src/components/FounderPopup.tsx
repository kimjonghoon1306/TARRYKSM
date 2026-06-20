"use client";

import { useEffect, useState } from "react";

type Item = { id: string; title: string; body: string | null };

// 운영자가 "팝업으로 띄우기" 한 공지를 창업자 화면에 모달로 표시.
// (레이아웃에서 role==='founder' 일 때만 렌더 → 운영자 본인에겐 안 뜸)
// "오늘 그만 보기"는 localStorage로 24시간 숨김(공지 id별).
export default function FounderPopup({ items }: { items: Item[] }) {
  const [show, setShow] = useState<Item[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const today = new Date().toDateString();
    const visible = items.filter((it) => {
      try {
        return localStorage.getItem("annpop:" + it.id) !== today;
      } catch {
        return true;
      }
    });
    setShow(visible);
  }, [items]);

  if (show.length === 0 || idx >= show.length) return null;
  const cur = show[idx];

  function next() {
    if (idx + 1 < show.length) setIdx(idx + 1);
    else setShow([]);
  }
  function hideToday() {
    try {
      localStorage.setItem("annpop:" + cur.id, new Date().toDateString());
    } catch {}
    next();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-5 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-neutral-900">
        <div className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-pink-500 px-5 py-3 text-white">
          <span className="text-lg">📢</span>
          <b className="text-sm font-bold">공지</b>
          {show.length > 1 && (
            <span className="ml-auto text-xs opacity-80">
              {idx + 1} / {show.length}
            </span>
          )}
        </div>
        <div className="px-5 py-5">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">{cur.title}</h3>
          {cur.body && (
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
              {cur.body}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-black/5 px-5 py-3 dark:border-white/10">
          <button
            onClick={hideToday}
            className="text-xs font-medium text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            오늘 그만 보기
          </button>
          <button
            onClick={next}
            className="rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:brightness-105"
          >
            {idx + 1 < show.length ? "다음" : "확인"}
          </button>
        </div>
      </div>
    </div>
  );
}
