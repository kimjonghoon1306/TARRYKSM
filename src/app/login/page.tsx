import Link from "next/link";
import { login } from "@/app/auth/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; msg?: string }>;
}) {
  const sp = await searchParams;
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100 px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 mb-8 justify-center">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 grid place-items-center font-bold">O</span>
          <span className="font-semibold tracking-tight">ONJONGIL</span>
        </Link>
        <h1 className="text-2xl font-bold mb-1">로그인</h1>
        <p className="text-sm text-neutral-400 mb-6">내 쇼핑몰을 관리하세요</p>

        {sp.msg && <p className="mb-4 text-sm text-emerald-400">{sp.msg}</p>}
        {sp.error && <p className="mb-4 text-sm text-rose-400">{sp.error}</p>}

        <form action={login} className="space-y-3">
          <input name="email" type="email" required placeholder="이메일"
            className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm outline-none focus:border-violet-500" />
          <input name="password" type="password" required placeholder="비밀번호"
            className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm outline-none focus:border-violet-500" />
          <button className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 py-3 font-semibold text-sm">
            로그인
          </button>
        </form>

        <p className="text-sm text-neutral-400 mt-5">
          계정이 없으세요?{" "}
          <Link href="/signup" className="text-violet-400 font-medium">회원가입</Link>
        </p>
      </div>
    </main>
  );
}
