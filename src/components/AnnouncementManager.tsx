"use client";

import { useState } from "react";
import type { Announcement } from "@/lib/announcements";
import {
  addAnnouncement,
  toggleAnnouncement,
  deleteAnnouncement,
} from "@/app/dashboard/platform/announcements/actions";

function fmt(d: string) {
  const t = new Date(d);
  return `${t.getFullYear()}.${String(t.getMonth() + 1).padStart(2, "0")}.${String(t.getDate()).padStart(2, "0")}`;
}

export default function AnnouncementManager({ items }: { items: Announcement[] }) {
  const [list, setList] = useState(items);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const input =
    "w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-white/5";
  const card =
    "rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]";

  async function create() {
    setErr("");
    if (!title.trim()) return setErr("제목을 입력해 주세요.");
    setBusy(true);
    const res = await addAnnouncement({ title, body, pinned });
    setBusy(false);
    if (!res.ok) return setErr(res.error || "등록에 실패했어요.");
    location.reload();
  }
  async function toggle(a: Announcement, field: "active" | "pinned") {
    const next = !a[field];
    setList((l) => l.map((x) => (x.id === a.id ? { ...x, [field]: next } : x)));
    await toggleAnnouncement(a.id, field, next);
  }
  async function remove(a: Announcement) {
    if (!confirm("이 공지를 삭제할까요?")) return;
    setList((l) => l.filter((x) => x.id !== a.id));
    await deleteAnnouncement(a.id);
  }

  return (
    <div className="space-y-5">
      {/* 작성 */}
      <div className={card}>
        <h2 className="text-base font-bold">📢 새 공지 작성</h2>
        <div className="mt-4 space-y-3">
          <input
            className={input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="공지 제목"
            maxLength={120}
          />
          <textarea
            className={input + " min-h-[90px] resize-y"}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="공지 내용 (선택)"
          />
          <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
            <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
            📌 상단 고정
          </label>
          {err && <div className="text-sm text-rose-500">{err}</div>}
          <button
            onClick={create}
            disabled={busy}
            className="rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {busy ? "등록 중…" : "공지 등록"}
          </button>
        </div>
      </div>

      {/* 목록 */}
      <div className={card}>
        <h2 className="text-base font-bold">공지 목록 ({list.length})</h2>
        {list.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">아직 등록한 공지가 없어요.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {list.map((a) => (
              <div
                key={a.id}
                className={
                  "rounded-xl border p-4 " +
                  (a.active
                    ? "border-black/5 dark:border-white/10"
                    : "border-dashed border-black/10 opacity-60 dark:border-white/10")
                }
              >
                <div className="flex flex-wrap items-center gap-2">
                  {a.pinned && <span className="text-amber-500">📌</span>}
                  <span className="font-semibold">{a.title}</span>
                  <span className="ml-auto text-xs text-neutral-400">{fmt(a.created_at)}</span>
                </div>
                {a.body && <p className="mt-1.5 whitespace-pre-wrap text-sm text-neutral-500">{a.body}</p>}
                <div className="mt-3 flex gap-3 text-xs">
                  <button
                    onClick={() => toggle(a, "active")}
                    className={"font-semibold " + (a.active ? "text-emerald-500" : "text-neutral-400")}
                  >
                    {a.active ? "🟢 노출 중" : "⚪ 숨김"}
                  </button>
                  <button onClick={() => toggle(a, "pinned")} className="text-neutral-500 hover:text-amber-500">
                    {a.pinned ? "고정 해제" : "상단 고정"}
                  </button>
                  <button onClick={() => remove(a)} className="text-neutral-400 hover:text-rose-500">
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
