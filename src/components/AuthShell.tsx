import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-violet-50 via-white to-pink-50 px-4 py-10 dark:from-[#0b0c14] dark:via-[#0d0e1a] dark:to-[#0b0c14]">
      {/* 오로라 글로우 배경 */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-violet-400/30 blur-3xl dark:bg-violet-600/25" />
        <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-pink-400/30 blur-3xl dark:bg-pink-600/20" />
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-teal-300/20 blur-3xl dark:bg-teal-500/10" />
      </div>

      {/* 대문 가기 (좌상단) */}
      <Link
        href="/"
        className="absolute left-5 top-5 z-10 inline-flex h-10 items-center gap-1.5 rounded-full border border-black/10 bg-white/70 px-4 text-sm font-semibold text-neutral-700 shadow-sm backdrop-blur transition hover:scale-105 dark:border-white/15 dark:bg-white/10 dark:text-neutral-200"
      >
        <span aria-hidden>←</span> 대문
      </Link>

      {/* 테마 버튼 (우상단) */}
      <div className="absolute right-5 top-5 z-10">
        <ThemeToggle />
      </div>

      {/* 글래스 카드 */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-black/5 bg-white/70 p-8 shadow-2xl shadow-violet-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] dark:shadow-black/40 sm:p-10">
        <Link href="/" className="mb-7 flex items-center justify-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 text-lg font-bold text-white shadow-lg shadow-violet-500/30">
            O
          </span>
          <span className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
            ONJONGIL
          </span>
        </Link>

        <h1 className="text-center text-2xl font-bold text-neutral-900 dark:text-white">
          {title}
        </h1>
        <p className="mb-7 mt-1.5 text-center text-sm text-neutral-500 dark:text-neutral-400">
          {subtitle}
        </p>

        {children}

        {footer && (
          <div className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
            {footer}
          </div>
        )}
      </div>
    </main>
  );
}
