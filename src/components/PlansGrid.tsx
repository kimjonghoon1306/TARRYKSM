import { PLANS, PLAN_ORDER, type Plan } from "@/lib/plans";

const won = (n: number) => "₩" + n.toLocaleString("ko-KR");

const KAKAO = "https://open.kakao.com/o/sg6vJgAi";

// 요금제 카드 그리드 — 공개 요금제 페이지(/pricing)와 대시보드(/dashboard/plan) 공용.
// currentId가 있으면 그 플랜에 "현재 플랜" 표시(로그인 사용자), 없으면 전부 문의 버튼(비로그인).
export default function PlansGrid({
  currentId,
  currentPrice = 0,
}: {
  currentId?: Plan | null;
  currentPrice?: number;
}) {
  const card =
    "rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]";

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLAN_ORDER.map((id) => {
          const p = PLANS[id];
          const isCurrent = currentId === id;
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
                  인기
                </span>
              )}
              <div className="text-lg font-bold">{p.name}</div>
              <div className="mt-2 text-3xl font-extrabold">
                {p.price === 0 ? "무료" : won(p.price)}
                {p.price > 0 && (
                  <span className="text-sm font-medium text-neutral-400"> /월</span>
                )}
              </div>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-violet-500">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                {isCurrent ? (
                  <div className="rounded-xl bg-black/5 py-2.5 text-center text-sm font-semibold text-neutral-500 dark:bg-white/10">
                    현재 플랜
                  </div>
                ) : (
                  <a
                    href={KAKAO}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-105"
                  >
                    💬 {p.price > currentPrice ? "업그레이드 문의" : "변경 문의"}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-sm text-neutral-500">
        결제·요금제 문의는{" "}
        <a
          href={KAKAO}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-violet-500 hover:underline"
        >
          💬 카카오톡 오픈채팅
        </a>
        으로 주세요. 확인 후 플랜을 적용해 드려요.
      </p>
    </>
  );
}
