import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getActor } from "@/lib/actor";
import { PLANS, PLAN_ORDER, planOf } from "@/lib/plans";

const won = (n: number) => "₩" + n.toLocaleString("ko-KR");

// 대문에서 고른 언어가 쿠키로 넘어옴(없으면 ko)
const STR = {
  ko: {
    title: "요금제",
    subGuest: "무료로 시작해 필요할 때 업그레이드하세요.",
    unlimited: "무제한",
    adminTail: " · 운영자는 모든 기능·쇼핑몰 무제한",
    curPlan: "현재 플랜: ",
    storesUsing: (used: number, max: string) => ` · 쇼핑몰 ${used}${max}개 사용 중`,
    popular: "인기",
    free: "무료",
    perMonth: " /월",
    adminUse: "♾️ 무제한 이용",
    current: "현재 플랜",
    upgrade: "업그레이드 문의",
    change: "변경 문의",
    footPre: "결제·요금제 문의는 ",
    footChat: "💬 카카오톡 오픈채팅",
    footPost: " 으로 주세요. 확인 후 플랜을 적용해 드려요.",
  },
  en: {
    title: "Pricing",
    subGuest: "Start free, upgrade when you need to.",
    unlimited: "Unlimited",
    adminTail: " · Admins get unlimited features & stores",
    curPlan: "Current plan: ",
    storesUsing: (used: number, max: string) => ` · ${used}${max} stores in use`,
    popular: "Popular",
    free: "Free",
    perMonth: " /mo",
    adminUse: "♾️ Unlimited",
    current: "Current plan",
    upgrade: "Upgrade",
    change: "Change plan",
    footPre: "For billing & plan questions, reach us on ",
    footChat: "💬 KakaoTalk open chat",
    footPost: ". We'll apply your plan after confirming.",
  },
} as const;

export default async function PlanPage() {
  const lang = ((await cookies()).get("lang")?.value === "en" ? "en" : "ko") as "ko" | "en";
  const t = STR[lang];

  const me = await getActor(); // 시크릿 입장 시 그 창업자의 요금제로 보임(관리자는 그냥 들여다봄)
  const supabase = await createClient();
  let storeCount = 0;
  if (me.userId) {
    const { count } = await supabase
      .from("stores")
      .select("id", { count: "exact", head: true })
      .eq("owner", me.userId);
    storeCount = count ?? 0;
  }
  const current = planOf(me.role, me.plan);
  const isAdmin = me.role === "admin"; // 운영자는 요금제 무관 무제한 — 특정 플랜에 묶이지 않음
  const planName = (p: { name: string; name_en: string }) => (lang === "en" ? p.name_en : p.name);

  const card =
    "rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]";

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold sm:text-3xl">{t.title}</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {!me.userId ? (
          t.subGuest
        ) : isAdmin ? (
          <>
            {t.curPlan}
            <b className="text-violet-500">{t.unlimited}</b>
            {t.adminTail}
          </>
        ) : (
          <>
            {t.curPlan}
            <b className="text-violet-500">{planName(current)}</b>
            {t.storesUsing(storeCount, current.maxStores === Infinity ? "" : ` / ${current.maxStores}`)}
          </>
        )}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLAN_ORDER.map((id) => {
          const p = PLANS[id];
          const isCurrent = current.id === id;
          const feats = lang === "en" ? p.features_en : p.features;
          return (
            <div
              key={id}
              className={
                card +
                " relative flex flex-col " +
                (p.highlight ? "ring-2 ring-violet-500" : "")
              }
            >
              {p.highlight && (
                <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 px-3 py-0.5 text-xs font-bold text-white">
                  {t.popular}
                </span>
              )}
              <div className="text-lg font-bold">{planName(p)}</div>
              <div className="mt-2 text-3xl font-extrabold">
                {p.price === 0 ? t.free : won(p.price)}
                {p.price > 0 && <span className="text-sm font-medium text-neutral-400">{t.perMonth}</span>}
              </div>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
                {feats.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-violet-500">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                {isAdmin ? (
                  <div className="rounded-xl bg-violet-500/10 py-2.5 text-center text-sm font-semibold text-violet-600 dark:text-violet-300">
                    {t.adminUse}
                  </div>
                ) : isCurrent ? (
                  <div className="rounded-xl bg-black/5 py-2.5 text-center text-sm font-semibold text-neutral-500 dark:bg-white/10">
                    {t.current}
                  </div>
                ) : (
                  <a
                    href="https://open.kakao.com/o/sg6vJgAi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-105"
                  >
                    💬 {p.price > (current.price || 0) ? t.upgrade : t.change}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-sm text-neutral-500">
        {t.footPre}
        <a
          href="https://open.kakao.com/o/sg6vJgAi"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-violet-500 hover:underline"
        >
          {t.footChat}
        </a>
        {t.footPost}
      </p>
    </div>
  );
}
