"use client";

import { useState } from "react";
import Link from "next/link";
import type { Notification } from "@/lib/notifications";
import { markRead, markAllRead, deleteNotification } from "@/app/dashboard/notifications/actions";

function ago(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const day = Math.floor(h / 24);
  if (day < 7) return `${day}일 전`;
  const t = new Date(d);
  return `${t.getMonth() + 1}.${t.getDate()}`;
}

export default function NotificationList({ items }: { items: Notification[] }) {
  const [list, setList] = useState(items);
  const unread = list.filter((n) => !n.read).length;

  async function allRead() {
    setList((l) => l.map((n) => ({ ...n, read: true })));
    await markAllRead();
  }
  async function open(n: Notification) {
    if (!n.read) {
      setList((l) => l.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      markRead(n.id);
    }
  }
  async function remove(id: string) {
    setList((l) => l.filter((n) => n.id !== id));
    await deleteNotification(id);
  }

  const card =
    "rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]";

  if (list.length === 0)
    return (
      <div className={card + " mt-6 py-16 text-center"}>
        <div className="text-4xl">🔔</div>
        <div className="mt-3 font-semibold">알림이 없어요</div>
        <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500">
          새 주문이나 리뷰가 들어오면 여기에서 바로 알려드려요.
        </p>
      </div>
    );

  return (
    <>
      {unread > 0 && (
        <div className="mt-4 flex justify-end">
          <button onClick={allRead} className="text-sm font-semibold text-violet-500 hover:underline">
            전체 읽음 처리
          </button>
        </div>
      )}
      <div className="mt-2 space-y-2">
        {list.map((n) => {
          const body = (
            <div
              className={
                "flex items-start gap-3 rounded-2xl border p-4 transition " +
                (n.read
                  ? "border-black/5 bg-white dark:border-white/10 dark:bg-white/[0.03]"
                  : "border-violet-400/40 bg-violet-500/[0.06]")
              }
            >
              <span className="mt-0.5 text-xl">{n.type === "review" ? "⭐" : "🧾"}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-semibold">{n.title}</span>
                  {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-violet-500" />}
                  <span className="ml-auto shrink-0 text-xs text-neutral-400">{ago(n.created_at)}</span>
                </div>
                {n.body && <p className="mt-1 text-sm text-neutral-500">{n.body}</p>}
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  remove(n.id);
                }}
                className="shrink-0 text-neutral-300 hover:text-rose-500"
                aria-label="삭제"
              >
                ✕
              </button>
            </div>
          );
          return n.link ? (
            <Link key={n.id} href={n.link} onClick={() => open(n)} className="block">
              {body}
            </Link>
          ) : (
            <div key={n.id} onClick={() => open(n)}>
              {body}
            </div>
          );
        })}
      </div>
    </>
  );
}
