// 구독 사용기간이 만료된 쇼핑몰을 손님에게 보여줄 "일시 중지" 화면.
export default function StoreLocked({ name }: { name?: string | null }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-6 text-center text-neutral-800 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="text-5xl">🔒</div>
      <h1 className="mt-5 text-2xl font-bold sm:text-3xl">
        {name ? `${name}` : "이 쇼핑몰"}은 현재 이용할 수 없습니다
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-500">
        운영 기간이 만료되어 일시적으로 영업을 중단했습니다.
        <br />
        잠시 후 다시 방문해 주세요.
      </p>
    </main>
  );
}
