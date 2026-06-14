import Link from "next/link";
import AuthShell from "@/components/AuthShell";

export default function FindEmailPage() {
  return (
    <AuthShell
      title="이메일 찾기"
      subtitle="로그인에 사용하는 아이디는 이메일입니다"
      footer={
        <Link href="/login" className="font-semibold text-violet-500 hover:text-violet-400">
          ← 로그인으로
        </Link>
      }
    >
      <div className="space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
        <p className="rounded-xl border border-black/5 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.03]">
          가입할 때 입력한 <b>이메일 주소</b>로 로그인합니다. 메일함에서 ONJONGIL 가입/인증 메일을
          검색하면 어떤 이메일로 가입했는지 확인할 수 있어요.
        </p>
        <p className="text-xs text-neutral-400">
          이메일이 기억나지 않으면 새로 가입하거나, 비밀번호 찾기로 재설정 메일을 받아보세요.
        </p>
      </div>
      <div className="mt-5 flex gap-2">
        <Link href="/signup" className="flex-1 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 py-2.5 text-center text-sm font-semibold text-white">
          회원가입
        </Link>
        <Link href="/reset-password" className="flex-1 rounded-xl border border-black/10 py-2.5 text-center text-sm font-semibold dark:border-white/15">
          비밀번호 찾기
        </Link>
      </div>
    </AuthShell>
  );
}
