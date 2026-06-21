import Link from "next/link";
import { cookies } from "next/headers";
import AdminShell from "@/components/AdminShell";
import ThemeToggle from "@/components/ThemeToggle";
import OnBot from "@/components/OnBot";
import FounderPopup from "@/components/FounderPopup";
import SubscriptionExpiredGate from "@/components/SubscriptionExpiredGate";
import DashTranslator from "@/components/DashTranslator";
import { getMe } from "@/lib/role";
import { getActor } from "@/lib/actor";
import { createClient } from "@/lib/supabase/server";
import { fetchNotifications } from "@/lib/notifications";
import { fetchPopupAnnouncements } from "@/lib/announcements";
import { fetchPlanDates, isExpired } from "@/lib/subscription";

// 대시보드는 계정별 데이터 → 절대 캐시 금지(다른 계정 화면이 남아 보이는 것 방지)
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = await getMe();
  // 대문에서 고른 언어(쿠키) — 영어면 런타임 번역 레이어(DashTranslator) 가동
  const langEn = (await cookies()).get("lang")?.value === "en";

  // 비로그인 방문자(요금제 둘러보기 등)는 관리자 사이드바 대신 깔끔한 공개 레이아웃을 본다.
  // (게이트(proxy)에서 비로그인은 /dashboard/plan 만 통과하므로 사실상 요금제 페이지 전용)
  if (!me.userId) {
    const en = langEn;
    const L = {
      back: en ? "← Back to browse" : "← 둘러보기",
      login: en ? "Log in" : "로그인",
      start: en ? "Start free" : "무료로 시작",
    };
    return (
      <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        <header className="sticky top-0 z-10 border-b border-black/5 bg-neutral-50/80 backdrop-blur dark:border-white/10 dark:bg-neutral-950/80">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-3.5">
            <div className="flex items-center gap-3">
              {/* 구경 모드 대문(스튜디오 화면)으로 복귀 — /?studio 는 인트로 건너뛰고 앱 셸로 직행 */}
              <Link
                href="/?studio"
                className="inline-flex items-center rounded-lg border border-black/10 px-3 py-1.5 text-sm font-semibold text-neutral-600 transition hover:border-violet-500 hover:text-violet-500 dark:border-white/15 dark:text-neutral-300"
              >
                {L.back}
              </Link>
              <Link href="/?studio" className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 text-lg font-bold text-white">
                  O
                </span>
                <span className="hidden text-base font-semibold tracking-tight sm:inline">ONJONGIL</span>
              </Link>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ThemeToggle />
              <Link
                href="/login"
                className="rounded-lg border border-black/10 px-3.5 py-1.5 font-semibold hover:border-violet-500 dark:border-white/15"
              >
                {L.login}
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-gradient-to-r from-violet-500 to-pink-500 px-3.5 py-1.5 font-semibold text-white hover:brightness-105"
              >
                {L.start}
              </Link>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-5 py-10">{children}</main>
        <DashTranslator enabled={en} />
      </div>
    );
  }

  // 보는 대상(운영자가 창업자로 시크릿 입장 중이면 그 창업자) — 사이드바·요금제·기능은 이 기준.
  const actor = await getActor();

  const supabase = await createClient();
  const { unread } = await fetchNotifications(supabase, 30);
  // 운영자가 띄운 팝업 공지 — 진짜 창업자에게만(임퍼서네이션 중엔 방해되니 제외)
  const popups = !actor.impersonating && actor.role === "founder" ? await fetchPopupAnnouncements(supabase, 3) : [];
  // 구독 사용 만료일 — 보는 대상이 창업자일 때 그 사람 기준
  const planUntil =
    actor.role === "founder" && actor.userId ? (await fetchPlanDates(supabase, actor.userId)).plan_until : null;

  // 🔒 유료 구독 만료 → 대시보드 전체 잠금(기능 사용 불가, 갱신 안내만). 무료는 해당 없음.
  if (actor.role === "founder" && isExpired(actor.plan, planUntil)) {
    return <SubscriptionExpiredGate email={actor.email} impersonating={actor.impersonating} />;
  }

  return (
    <>
      <AdminShell
        email={actor.email}
        role={actor.role}
        plan={actor.plan}
        unread={unread}
        planUntil={planUntil}
        impersonating={actor.impersonating}
        realEmail={actor.realEmail}
      >
        {children}
      </AdminShell>
      {/* 창업자 전용 도우미 — 손님 쇼핑몰(/[slug])엔 뜨지 않도록 대시보드에만 둠 */}
      <OnBot />
      <DashTranslator enabled={langEn} />
      {popups.length > 0 && (
        <FounderPopup items={popups.map((a) => ({ id: a.id, title: a.title, body: a.body }))} />
      )}
    </>
  );
}
