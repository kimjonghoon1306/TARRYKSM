import Link from "next/link";
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
      title="로그인"
      subtitle="내 쇼핑몰을 관리하세요"
      footer={
        <>
          계정이 없으세요?{" "}
          <Link href="/signup" className="font-semibold text-violet-500 hover:text-violet-400">
            회원가입
          </Link>
        </>
      }
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
