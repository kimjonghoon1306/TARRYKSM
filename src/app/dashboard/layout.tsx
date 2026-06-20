import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import ThemeToggle from "@/components/ThemeToggle";
import OnBot from "@/components/OnBot";
import FounderPopup from "@/components/FounderPopup";
import { getMe } from "@/lib/role";
import { createClient } from "@/lib/supabase/server";
import { fetchNotifications } from "@/lib/notifications";
import { fetchPopupAnnouncements } from "@/lib/announcements";
import { fetchPlanDates } from "@/lib/subscription";

// 대시보드는 계정별 데이터 → 절대 캐시 금지(다른 계정 화면이 남아 보이는 것 방지)
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = await getMe();

  // 비로그인 방문자(요금제 둘러보기 등)는 관리자 사이드바 대신 깔끔한 공개 레이아웃을 본다.
  // (게이트(proxy)에서 비로그인은 /dashboard/plan 만 통과하므로 사실상 요금제 페이지 전용)
  if (!me.userId) {
    return (
      <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        <header className="sticky top-0 z-10 border-b border-black/5 bg-neutral-50/80 backdrop-blur dark:border-white/10 dark:bg-neutral-950/80">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 text-lg font-bold text-white">
                O
              </span>
              <span className="text-base font-semibold tracking-tight">ONJONGIL</span>
            </Link>
            <div className="flex items-center gap-2 text-sm">
              <ThemeToggle />
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
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-5 py-10">{children}</main>
      </div>
    );
  }

  const supabase = await createClient();
  const { unread } = await fetchNotifications(supabase, 30);
  // 운영자가 띄운 팝업 공지 — 창업자(founder)에게만 모달로(운영자 본인은 발신자라 제외)
  const popups = me.role === "founder" ? await fetchPopupAnnouncements(supabase, 3) : [];
  // 구독 사용 만료일 — 창업자에게만 표시(운영자는 무제한)
  const planUntil =
    me.role === "founder" && me.userId ? (await fetchPlanDates(supabase, me.userId)).plan_until : null;
  return (
    <>
      <AdminShell email={me.email} role={me.role} unread={unread} planUntil={planUntil}>
        {children}
      </AdminShell>
      {/* 창업자 전용 도우미 — 손님 쇼핑몰(/[slug])엔 뜨지 않도록 대시보드에만 둠 */}
      <OnBot />
      {popups.length > 0 && (
        <FounderPopup items={popups.map((a) => ({ id: a.id, title: a.title, body: a.body }))} />
      )}
    </>
  );
}
