// 대시보드 페이지 이동 시 즉시 뜨는 로딩 표시 (텀 동안 빈 화면 방지 → 체감 속도↑)
export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse">
      <div className="h-7 w-40 rounded-lg bg-black/10 dark:bg-white/10" />
      <div className="mt-3 h-4 w-64 rounded bg-black/5 dark:bg-white/5" />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-black/5 dark:bg-white/5" />
        ))}
      </div>
      <div className="mt-6 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-black/5 dark:bg-white/5" />
        ))}
      </div>
      <div className="mt-6 flex items-center gap-2 text-sm text-neutral-400">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        불러오는 중…
      </div>
    </div>
  );
}
