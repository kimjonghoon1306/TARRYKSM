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

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold sm:text-3xl">계정 설정</h1>
      <p className="mt-1 text-sm text-neutral-500">관리자 계정과 비밀번호를 관리하세요</p>

      {/* 계정 정보 */}
      <section className={card + " mt-6"}>
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
      <section className={card + " mt-6"}>
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
  );
}
