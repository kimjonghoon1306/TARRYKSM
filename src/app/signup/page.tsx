import Link from "next/link";
import { signup } from "@/app/auth/actions";
import AuthShell from "@/components/AuthShell";
import Field from "@/components/Field";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  return (
    <AuthShell
      title="회원가입"
      subtitle="이메일로 1분 만에 시작"
      footer={
        <>
          이미 계정이 있으세요?{" "}
          <Link href="/login" className="font-semibold text-violet-500 hover:text-violet-400">
            로그인
          </Link>
        </>
      }
    >
      {sp.error && (
        <p className="mb-4 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">
          {sp.error}
        </p>
      )}

      <form action={signup} className="space-y-4">
        <Field name="name" type="text" label="이름" placeholder="홍길동" icon="user" autoComplete="name" />
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
          placeholder="6자 이상"
          icon="lock"
          required
          autoComplete="new-password"
        />
        <button className="mt-1 w-full rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-105 active:scale-[.99]">
          가입하기
        </button>
      </form>
    </AuthShell>
  );
}
