"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { signout } from "@/app/auth/actions";

type Role = "admin" | "founder";

const NAV = [
  { href: "/dashboard", label: "개요", icon: "📊" },
  { href: "/dashboard/stores", label: "쇼핑몰", icon: "🏬" },
  { href: "/dashboard/products", label: "상품", icon: "📦" },
  { href: "/dashboard/orders", label: "주문", icon: "🧾" },
  { href: "/dashboard/customers", label: "고객", icon: "👤" },
  { href: "/dashboard/analytics", label: "분석", icon: "📈" },
  { href: "/dashboard/settings", label: "계정 설정", icon: "⚙️" },
];

export default function AdminShell({
  email,
  role = "founder",
  children,
}: {
  email: string | null;
  role?: Role;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const isAdmin = role === "admin";

  const Side = (
    <>
      <Link href="/dashboard" className="flex items-center gap-2.5 px-2 py-1">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 font-bold text-white">
          O
        </span>
        <span className="leading-tight">
          <b className="block text-sm tracking-tight text-neutral-900 dark:text-white">ONJONGIL</b>
          <i className="block text-[11px] not-italic text-neutral-400">
            {isAdmin ? "CONTROL TOWER" : "STORE ADMIN"}
          </i>
        </span>
      </Link>

      {/* 역할 배지 */}
      <div
        className={
          "mt-3 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold " +
          (isAdmin
            ? "bg-violet-500/15 text-violet-600 dark:text-violet-300"
            : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300")
        }
      >
        {isAdmin ? "👑 플랫폼 관리자" : "🏪 창업자"}
      </div>

      <Link
        href="/?studio=1"
        className="mt-5 flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 px-3.5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-105"
      >
        <span>🎨</span> 스튜디오 열기
      </Link>

      <nav className="mt-5 flex flex-col gap-1">
        <span className="px-2 pb-1 text-[10px] font-bold tracking-widest text-neutral-400">관리</span>
        {NAV.map((n) => {
          const active =
            n.href === "/dashboard" ? path === n.href : path.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className={
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition " +
                (active
                  ? "bg-violet-500/12 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300"
                  : "text-neutral-600 hover:bg-black/5 dark:text-neutral-300 dark:hover:bg-white/5")
              }
            >
              <span>{n.icon}</span> {n.label}
            </Link>
          );
        })}

        {/* 플랫폼 관리자 전용 */}
        {isAdmin && (
          <>
            <span className="mt-3 px-2 pb-1 text-[10px] font-bold tracking-widest text-neutral-400">
              플랫폼
            </span>
            <Link
              href="/dashboard/platform"
              onClick={() => setOpen(false)}
              className={
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition " +
                (path.startsWith("/dashboard/platform")
                  ? "bg-violet-500/12 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300"
                  : "text-neutral-600 hover:bg-black/5 dark:text-neutral-300 dark:hover:bg-white/5")
              }
            >
              <span>🛰️</span> 전체 관리
            </Link>
          </>
        )}
      </nav>

      <div className="mt-auto space-y-2 pt-5">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-neutral-500 transition hover:bg-black/5 dark:hover:bg-white/5"
        >
          <span>←</span> 대문으로
        </Link>
        <div className="rounded-xl border border-black/5 bg-black/[0.02] p-3 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="truncate text-xs text-neutral-500">{email || "비로그인 (둘러보기)"}</div>
          {email ? (
            <form action={signout}>
              <button className="mt-2 w-full rounded-lg border border-black/10 py-1.5 text-xs text-neutral-600 transition hover:border-rose-400 hover:text-rose-500 dark:border-white/10 dark:text-neutral-300">
                로그아웃
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="mt-2 block w-full rounded-lg bg-violet-500 py-1.5 text-center text-xs font-semibold text-white"
            >
              🔒 관리자 로그인
            </Link>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-transparent dark:text-neutral-100">
      {/* 데스크탑 사이드바 */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-black/5 bg-white p-4 dark:border-white/10 dark:bg-[#191a30] lg:flex">
        {Side}
      </aside>

      {/* 모바일 상단바 */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/5 bg-white/80 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-[#191a30]/80 lg:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label="메뉴"
          className="grid h-9 w-9 place-items-center rounded-lg border border-black/10 dark:border-white/15"
        >
          ☰
        </button>
        <b className="text-sm tracking-tight">ONJONGIL Control</b>
        <ThemeToggle />
      </header>

      {/* 모바일 드로어 */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white p-4 dark:bg-[#191a30]">
            {Side}
          </aside>
        </div>
      )}

      {/* 데스크탑 우상단 테마토글 */}
      <div className="fixed right-5 top-4 z-20 hidden lg:block">
        <ThemeToggle />
      </div>

      {/* 콘텐츠 */}
      <main className="px-4 py-6 sm:px-6 lg:ml-64 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
