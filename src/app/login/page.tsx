import { login } from "@/app/auth/actions";
import AuthShell from "@/components/AuthShell";
import Field from "@/components/Field";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; msg?: string }>;
}) {
  const sp = await searchParams;
  return (
    <AuthShell
      title="관리자 로그인"
      subtitle="사용자 · 프로그램 관리 컨트롤타워"
    >
      {sp.msg && (
        <p className="mb-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
          {sp.msg}
        </p>
      )}
      {sp.error && (
        <p className="mb-4 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">
          {sp.error}
        </p>
      )}

      <form action={login} className="space-y-4">
        <Field
          name="email"
          type="email"
          label="이메일"
          placeholder="you@email.com"
          icon="mail"
          required
          autoComplete="email"
        />
        <Field
          name="password"
          type="password"
          label="비밀번호"
          placeholder="비밀번호"
          icon="lock"
          required
          autoComplete="current-password"
        />
        <button className="mt-1 w-full rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-105 active:scale-[.99]">
          로그인
        </button>
      </form>
    </AuthShell>
  );
}
