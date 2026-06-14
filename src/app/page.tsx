import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center px-6 text-center">
      <div className="flex items-center gap-2 mb-8">
        <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 grid place-items-center font-bold text-xl">O</span>
        <span className="text-xl font-semibold tracking-tight">ONJONGIL</span>
      </div>
      <h1 className="text-4xl sm:text-6xl font-bold leading-tight max-w-2xl">
        하나의 브랜드를,
        <br />
        <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-teal-300 bg-clip-text text-transparent">
          무한히 분양하다
        </span>
      </h1>
      <p className="text-neutral-400 mt-6 max-w-md">
        클릭 한 번으로 쇼핑몰을 찍어내는 버티컬 커머스 빌더.
        나만의 스킨, 나만의 도메인, 나만의 매장.
      </p>
      <div className="flex gap-3 mt-10">
        <Link href="/signup" className="rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 px-6 py-3 font-semibold">
          무료로 시작하기
        </Link>
        <Link href="/dashboard" className="rounded-xl border border-neutral-700 px-6 py-3 font-semibold hover:border-violet-500">
          내 쇼핑몰
        </Link>
      </div>
    </main>
  );
}
