import Link from "next/link";
import { redirect } from "next/navigation";
import { signup } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import AuthShell from "@/components/AuthShell";
import Field from "@/components/Field";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");
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
          name="phone"
          type="tel"
          label="전화번호"
          placeholder="010-1234-5678"
          icon="phone"
          autoComplete="tel"
        />
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
        <label className="flex items-start gap-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          <input type="checkbox" name="agree" required value="1" className="mt-0.5 shrink-0 accent-violet-500" />
          <span>
            <Link href="/terms" target="_blank" className="font-semibold text-violet-500 hover:text-violet-400 underline">ONJONGIL 이용약관</Link> 및 <Link href="/privacy" target="_blank" className="font-semibold text-violet-500 hover:text-violet-400 underline">개인정보 수집·이용</Link>에 동의합니다. (필수)
          </span>
        </label>
        <button className="mt-1 w-full rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-105 active:scale-[.99]">
          가입하기
        </button>
      </form>
    </AuthShell>
  );
}
