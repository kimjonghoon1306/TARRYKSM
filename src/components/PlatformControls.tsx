"use client";

import { useState, useTransition } from "react";
import { setUserRole, setUserPlan, adminSetPublished, adminDeleteStore, adminDeleteUser } from "@/app/dashboard/platform/actions";

// 회원 삭제 (관리자) — 쇼핑몰·프로필·계정 모두 제거. 자기 자신은 불가.
export function DeleteUserButton({ userId, email, isSelf }: { userId: string; email: string; isSelf: boolean }) {
  const [pending, start] = useTransition();
  const [deleted, setDeleted] = useState(false);
  const [err, setErr] = useState("");
  if (isSelf) return <span className="text-xs text-neutral-300 dark:text-neutral-600">—</span>;
  if (deleted) return <span className="text-xs text-rose-500">삭제됨</span>;
  return (
    <span className="inline-flex items-center gap-1.5">
      <button
        disabled={pending}
        onClick={() => {
          if (!confirm(`'${email}' 회원을 삭제할까요?\n이 회원의 쇼핑몰·상품·주문 데이터가 모두 삭제되며 되돌릴 수 없어요.`)) return;
          setErr("");
          start(() =>
            adminDeleteUser(userId).then((r) => {
              if (r.ok) setDeleted(true);
              else setErr(r.error || "삭제 실패");
            })
          );
        }}
        className="rounded-lg px-2 py-1 text-xs text-neutral-400 transition hover:bg-rose-500/10 hover:text-rose-500 disabled:opacity-50"
        title="회원 삭제"
      >
        {pending ? "삭제 중…" : "🗑"}
      </button>
      {err && <span className="text-xs text-rose-500" title={err}>실패</span>}
    </span>
  );
}

// 회원 요금제 변경 — 드롭다운으로 고르고 저장 버튼으로 확정 (저장 피드백 표시)
export function PlanToggle({ userId, plan }: { userId: string; plan: string }) {
  const init = plan === "basic" || plan === "pro" ? plan : "free";
  const [cur, setCur] = useState(init);
  const [saved, setSaved] = useState(init); // 마지막으로 저장된 값
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const dirty = cur !== saved;
  return (
    <div className="flex items-center gap-1.5">
      <select
        value={cur}
        disabled={pending}
        onChange={(e) => {
          setCur(e.target.value);
          setDone(false);
        }}
        className="rounded-lg border-0 bg-black/5 px-2.5 py-1 text-xs font-bold text-neutral-600 outline-none ring-1 ring-black/5 dark:bg-white/10 dark:text-neutral-300 dark:ring-white/10"
      >
        <option value="free">무료</option>
        <option value="basic">베이직</option>
        <option value="pro">프로</option>
      </select>
      <button
        disabled={!dirty || pending}
        onClick={() =>
          start(() =>
            setUserPlan(userId, cur as "free" | "basic" | "pro").then(() => {
              setSaved(cur);
              setDone(true);
            })
          )
        }
        className={
          "rounded-lg px-2.5 py-1 text-xs font-bold transition " +
          (dirty
            ? "bg-violet-600 text-white hover:brightness-110"
            : done
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              : "cursor-default bg-black/5 text-neutral-400 dark:bg-white/10 dark:text-neutral-500")
        }
      >
        {pending ? "저장 중…" : !dirty && done ? "✓ 저장됨" : "저장"}
      </button>
    </div>
  );
}

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
