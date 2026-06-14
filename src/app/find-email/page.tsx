import Link from "next/link";
import { findEmailByPhone } from "@/app/auth/actions";
import AuthShell from "@/components/AuthShell";
import Field from "@/components/Field";

export default async function FindEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ found?: string; notfound?: string; error?: string }>;
}) {
  const sp = await searchParams;
  return (
    <AuthShell
      title="이메일 찾기"
      subtitle="가입할 때 등록한 전화번호로 찾습니다"
      footer={
        <Link href="/login" className="font-semibold text-violet-500 hover:text-violet-400">
          ← 로그인으로
        </Link>
      }
    >
      {sp.found && (
        <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm">
          <div className="text-neutral-500 dark:text-neutral-400">가입된 이메일</div>
          <div className="mt-1 font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
            {sp.found}
          </div>
          <Link href="/login" className="mt-2 inline-block text-xs font-semibold text-violet-500 hover:text-violet-400">
            이 이메일로 로그인 →
          </Link>
        </div>
      )}
      {sp.notfound && (
        <p className="mb-4 rounded-lg bg-amber-400/10 px-3 py-2 text-sm text-amber-600 dark:text-amber-300">
          그 번호로 가입된 계정을 찾지 못했어요. 번호를 확인하거나 회원가입해 주세요.
        </p>
      )}
      {sp.error && (
        <p className="mb-4 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">
          {sp.error}
        </p>
      )}

      <form action={findEmailByPhone} className="space-y-4">
        <Field
          name="phone"
          type="tel"
          label="전화번호"
          placeholder="010-1234-5678"
          icon="phone"
          required
          autoComplete="tel"
        />
        <button className="press-glow mt-1 w-full rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-105 active:scale-[.98]">
          이메일 찾기
        </button>
      </form>

      <div className="mt-5 text-center text-xs text-neutral-400">
        계정이 없으세요?{" "}
        <Link href="/signup" className="font-semibold text-violet-500 hover:text-violet-400">
          회원가입
        </Link>
      </div>
    </AuthShell>
  );
}
