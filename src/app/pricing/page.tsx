import Link from "next/link";
import type { Metadata } from "next";
import { getMe } from "@/lib/role";
import { planOf } from "@/lib/plans";
import PlansGrid from "@/components/PlansGrid";

export const metadata: Metadata = {
  title: "요금제 — ONJONGIL",
  description: "ONJONGIL 퍼스널 쇼핑몰 빌더 요금제. 무료로 시작하고, 필요할 때 업그레이드하세요.",
};

// 공개 요금제 페이지 — 로그인 없이 누구나 볼 수 있다(/dashboard 밖이라 게이트 통과).
export default async function PricingPage() {
  const me = await getMe();
  // 로그인한 사용자에게만 현재 플랜을 표시. 비로그인은 전부 문의 버튼.
  const current = me.userId ? planOf(me.role, me.plan) : null;

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      {/* 상단바 */}
      <header className="sticky top-0 z-10 border-b border-black/5 bg-neutral-50/80 backdrop-blur dark:border-white/10 dark:bg-neutral-950/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 text-lg font-bold text-white">
              O
            </span>
            <span className="text-base font-semibold tracking-tight">ONJONGIL</span>
          </Link>
          <div className="flex items-center gap-2 text-sm">
            {me.userId ? (
              <Link
                href="/dashboard"
                className="rounded-lg border border-black/10 px-3.5 py-1.5 font-semibold hover:border-violet-500 dark:border-white/15"
              >
                내 대시보드
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg border border-black/10 px-3.5 py-1.5 font-semibold hover:border-violet-500 dark:border-white/15"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-gradient-to-r from-violet-500 to-pink-500 px-3.5 py-1.5 font-semibold text-white hover:brightness-105"
                >
                  무료로 시작
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">요금제</h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-neutral-500">
            무료로 시작해 나만의 퍼스널 쇼핑몰을 만들고, 필요할 때 업그레이드하세요.
            {current && (
              <>
                {" "}
                현재 플랜은 <b className="text-violet-500">{current.name}</b>입니다.
              </>
            )}
          </p>
        </div>

        <div className="mt-10">
          <PlansGrid currentId={current?.id} currentPrice={current?.price ?? 0} />
        </div>
      </main>
    </div>
  );
}
