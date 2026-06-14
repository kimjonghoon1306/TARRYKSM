"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t =
      (document.documentElement.getAttribute("data-theme") as "dark" | "light") ||
      "dark";
    setTheme(t);
    setMounted(true);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="테마 전환"
      title="테마 전환"
      className={
        "grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white/70 text-lg shadow-sm backdrop-blur transition hover:scale-105 dark:border-white/15 dark:bg-white/10 " +
        className
      }
    >
      {/* mounted 전엔 깜빡임 방지용 빈 표시 */}
      <span suppressHydrationWarning>{!mounted ? "" : theme === "dark" ? "🌙" : "☀️"}</span>
    </button>
  );
}
