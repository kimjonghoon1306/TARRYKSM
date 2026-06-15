"use client";

import { useState, useTransition } from "react";
import { setUserRole, adminSetPublished, adminDeleteStore } from "@/app/dashboard/platform/actions";

// 회원 역할 토글 (창업자 ↔ 관리자)
export function RoleToggle({
  userId,
  role,
  isSelf,
}: {
  userId: string;
  role: "admin" | "founder";
  isSelf: boolean;
}) {
  const [cur, setCur] = useState(role);
  const [pending, start] = useTransition();

  if (isSelf) {
    return (
      <span className="rounded-lg bg-violet-500/15 px-2.5 py-1 text-xs font-bold text-violet-600 dark:text-violet-300">
        👑 나 (관리자)
      </span>
    );
  }

  return (
    <select
      value={cur}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as "admin" | "founder";
        if (next === "admin" && !confirm("이 회원을 플랫폼 관리자로 올릴까요? 전체 권한을 갖게 됩니다.")) return;
        setCur(next);
        start(() => setUserRole(userId, next).then(() => {}));
      }}
      className={
        "rounded-lg border-0 px-2.5 py-1 text-xs font-bold outline-none ring-1 ring-black/5 dark:ring-white/10 " +
        (cur === "admin"
          ? "bg-violet-500/15 text-violet-600 dark:text-violet-300"
          : "bg-black/5 text-neutral-600 dark:bg-white/10 dark:text-neutral-300")
      }
    >
      <option value="founder">창업자</option>
      <option value="admin">관리자</option>
    </select>
  );
}

// 쇼핑몰 컨트롤 (비공개 토글 + 삭제)
export function StoreAdminControls({
  storeId,
  published,
  name,
}: {
  storeId: string;
  published: boolean;
  name: string;
}) {
  const [pub, setPub] = useState(published);
  const [pending, start] = useTransition();
  const [deleted, setDeleted] = useState(false);

  if (deleted) {
    return <span className="text-xs text-rose-500">삭제됨</span>;
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        disabled={pending}
        onClick={() => {
          const next = !pub;
          setPub(next);
          start(() => adminSetPublished(storeId, next).then(() => {}));
        }}
        className={
          "rounded-lg px-2.5 py-1 text-xs font-bold transition " +
          (pub
            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
            : "bg-black/5 text-neutral-500 dark:bg-white/10")
        }
        title={pub ? "강제 비공개로 전환" : "공개로 전환"}
      >
        {pub ? "🟢 공개" : "⚪ 비공개"}
      </button>
      <button
        disabled={pending}
        onClick={() => {
          if (!confirm(`'${name}' 쇼핑몰을 삭제(회수)할까요? 되돌릴 수 없어요.`)) return;
          setDeleted(true);
          start(() => adminDeleteStore(storeId).then(() => {}));
        }}
        className="rounded-lg px-2 py-1 text-xs text-neutral-400 transition hover:bg-rose-500/10 hover:text-rose-500"
        title="삭제(회수)"
      >
        🗑
      </button>
    </div>
  );
}
