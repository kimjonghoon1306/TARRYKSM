import Link from "next/link";
import { redirect } from "next/navigation";
import { login } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import AuthShell from "@/components/AuthShell";
import Field from "@/components/Field";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; msg?: string; admin?: string }>;
}) {
  const sp = await searchParams;
  const isAdmin = sp.admin === "1"; // 비밀 입구(로고 연타) → 관리자 로그인 변형
  // 이미 로그인된 사용자는 대시보드로 (로그인 화면 재노출 방지)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");
  return (
    <AuthShell
      title={isAdmin ? "🔐 관리자 로그인" : "로그인"}
      subtitle={isAdmin ? "사용자·프로그램 관리 컨트롤타워" : "이메일로 로그인하세요"}
      footer={
        isAdmin ? (
          <div className="text-xs text-neutral-400">
            일반 회원이신가요?{" "}
            <Link href="/login" className="font-semibold text-violet-500 hover:text-violet-400">
              회원 로그인
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            <div>
              계정이 없으세요?{" "}
              <Link href="/signup" className="font-semibold text-violet-500 hover:text-violet-400">
                회원가입
              </Link>
            </div>
            <div className="text-xs text-neutral-400">
              <Link href="/find-email" className="hover:text-violet-500">이메일 찾기</Link>
              <span className="mx-2">·</span>
              <Link href="/reset-password" className="hover:text-violet-500">비밀번호 찾기</Link>
            </div>
          </div>
        )
      }
    >
      {sp.msg && (
        <p className="mb-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">{sp.msg}</p>
      )}
      {sp.error && (
        <p className="mb-4 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">{sp.error}</p>
      )}

      <form action={login} className="space-y-4">
        <Field name="email" type="email" label="이메일" placeholder="you@email.com" icon="mail" required autoComplete="email" />
        <Field name="password" type="password" label="비밀번호" placeholder="비밀번호" icon="lock" required autoComplete="current-password" />
        <button className="mt-1 w-full rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-105 active:scale-[.99]">
          로그인
        </button>
      </form>
    </AuthShell>
  );
}
