import Link from "next/link";
import { resetPassword } from "@/app/auth/actions";
import AuthShell from "@/components/AuthShell";
import Field from "@/components/Field";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; msg?: string }>;
}) {
  const sp = await searchParams;
  return (
    <AuthShell
      title="비밀번호 찾기"
      subtitle="가입한 이메일로 재설정 링크를 보냅니다"
      footer={
        <Link href="/login" className="font-semibold text-violet-500 hover:text-violet-400">
          ← 로그인으로
        </Link>
      }
    >
      {sp.msg && (
        <p className="mb-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">{sp.msg}</p>
      )}
      {sp.error && (
        <p className="mb-4 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">{sp.error}</p>
      )}
      <form action={resetPassword} className="space-y-4">
        <Field name="email" type="email" label="이메일" placeholder="you@email.com" icon="mail" required autoComplete="email" />
        <button className="mt-1 w-full rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-105">
          재설정 메일 보내기
        </button>
      </form>
    </AuthShell>
  );
}
