import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { changePassword } from "./actions";
import { currentUser } from "@/lib/auth";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; msg?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const user = await currentUser();

  const card =
    "rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]";
  const input =
    "w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 dark:border-white/10 dark:bg-white/[0.04]";

  const tipCard =
    "rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]";

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold sm:text-3xl">계정 설정</h1>
      <p className="mt-1 text-sm text-neutral-500">관리자 계정과 비밀번호를 관리하세요</p>

      {/* PC 2단: 좌(계정·비번) / 우(도움 사이드패널) */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* 좌 */}
        <div className="space-y-6">
          {/* 계정 정보 */}
          <section className={card}>
            <h2 className="mb-4 text-lg font-semibold">관리자 계정</h2>
            {user ? (
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 font-bold text-white">
                  {(user.email || "A")[0].toUpperCase()}
                </span>
                <div>
                  <div className="text-sm font-semibold">{user.email}</div>
                  <div className="text-xs text-neutral-400">관리자 · 컨트롤타워</div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-neutral-500">
                로그인되어 있지 않아요.{" "}
                <Link href="/login" className="font-semibold text-violet-500 underline">관리자 로그인</Link>
              </div>
            )}
          </section>

          {/* 비밀번호 변경 */}
          <section className={card}>
            <h2 className="mb-1 text-lg font-semibold">비밀번호 변경</h2>
            <p className="mb-4 text-xs text-neutral-500">로그인한 관리자 계정의 비밀번호를 바꿉니다.</p>

            {sp.msg && (
              <p className="mb-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">{sp.msg}</p>
            )}
            {sp.error && (
              <p className="mb-4 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">{sp.error}</p>
            )}

            {user ? (
              <form action={changePassword} className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-neutral-500">새 비밀번호</label>
                  <input name="password" type="password" required placeholder="6자 이상" autoComplete="new-password" className={input} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-neutral-500">새 비밀번호 확인</label>
                  <input name="password2" type="password" required placeholder="다시 입력" autoComplete="new-password" className={input} />
                </div>
                <button className="rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-105">
                  비밀번호 변경
                </button>
              </form>
            ) : (
              <div className="text-sm text-neutral-500">비밀번호를 바꾸려면 먼저 로그인하세요.</div>
            )}
          </section>
        </div>

        {/* 우: 도움 사이드패널 */}
        <aside className="space-y-4">
          {/* 보안 팁 */}
          <div className={tipCard}>
            <div className="mb-3 flex items-center gap-2 font-semibold">🔒 계정 보안 팁</div>
            <ul className="space-y-2.5 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-300">
              <li className="flex gap-2"><span className="text-violet-500">✓</span> 비밀번호는 <b>8자 이상</b>, 숫자·기호를 섞으면 더 안전해요.</li>
              <li className="flex gap-2"><span className="text-violet-500">✓</span> 다른 사이트와 <b>같은 비밀번호</b>는 쓰지 마세요.</li>
              <li className="flex gap-2"><span className="text-violet-500">✓</span> 공용 PC에서는 꼭 <b>로그아웃</b>하세요.</li>
              <li className="flex gap-2"><span className="text-violet-500">✓</span> 관리자 주소는 <b>나만 알고</b> 있어야 해요.</li>
            </ul>
          </div>

          {/* 빠른 이동 */}
          <div className={tipCard}>
            <div className="mb-3 flex items-center gap-2 font-semibold">⚡ 빠른 이동</div>
            <div className="grid grid-cols-2 gap-2 text-[13px] font-semibold">
              <Link href="/dashboard/stores" className="rounded-xl border border-black/10 px-3 py-2.5 text-center transition hover:border-violet-400 dark:border-white/15">🏬 쇼핑몰</Link>
              <Link href="/dashboard/orders" className="rounded-xl border border-black/10 px-3 py-2.5 text-center transition hover:border-violet-400 dark:border-white/15">🧾 주문</Link>
              <Link href="/dashboard/analytics" className="rounded-xl border border-black/10 px-3 py-2.5 text-center transition hover:border-violet-400 dark:border-white/15">📈 분석</Link>
              <Link href="/dashboard/plan" className="rounded-xl border border-black/10 px-3 py-2.5 text-center transition hover:border-violet-400 dark:border-white/15">💎 요금제</Link>
            </div>
          </div>

          {/* 도움말 */}
          <div className="rounded-2xl border border-violet-400/30 bg-gradient-to-br from-violet-500/[0.08] to-pink-500/[0.06] p-5">
            <div className="mb-2 flex items-center gap-2 font-semibold">💬 도움이 필요하세요?</div>
            <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-300">
              화면 오른쪽 아래 <b>온봇</b>을 누르면 기능별 사용법을 안내해요. 결제·요금제 문의는 <Link href="/dashboard/plan" className="font-semibold text-violet-500 underline">요금제 페이지</Link>의 카카오톡 채널로 주세요.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
