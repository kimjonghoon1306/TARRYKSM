import { signout } from "@/app/auth/actions";
import { exitImpersonation } from "@/app/dashboard/impersonate-actions";

const KAKAO = "https://open.kakao.com/o/sg6vJgAi";

// 구독 만료 시 창업자 대시보드 전체를 잠그는 화면.
// (아임웹식: 갱신/등급 낮춰 결제로만 재개, 무료로는 못 돌아감)
export default function SubscriptionExpiredGate({
  email,
  impersonating = false,
}: {
  email?: string | null;
  impersonating?: boolean;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-6 text-center text-neutral-800 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="text-5xl">🔒</div>
      <h1 className="mt-5 text-2xl font-bold sm:text-3xl">구독 사용 기간이 만료되었어요</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-500">
        이용 기간이 끝나 쇼핑몰과 모든 기능이 잠겼습니다.
        계속 이용하시려면 <b className="text-neutral-700 dark:text-neutral-200">결제(갱신)</b>가 필요해요.
        <br />
        요금제를 <b className="text-neutral-700 dark:text-neutral-200">더 낮은 등급으로 낮춰서</b> 결제할 수도 있습니다.
        (무료로는 전환되지 않아요.)
      </p>
      {email && <p className="mt-2 text-xs text-neutral-400">{email}</p>}

      <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
        <a
          href={KAKAO}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-105"
        >
          💬 결제·갱신 문의 (카카오톡)
        </a>
        {impersonating ? (
          <form action={exitImpersonation}>
            <button className="rounded-xl border border-black/10 px-5 py-2.5 text-sm font-semibold transition hover:border-violet-500 dark:border-white/15">
              ← 운영자로 나가기
            </button>
          </form>
        ) : (
          <form action={signout}>
            <button className="rounded-xl border border-black/10 px-5 py-2.5 text-sm font-semibold transition hover:border-violet-500 dark:border-white/15">
              로그아웃
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
