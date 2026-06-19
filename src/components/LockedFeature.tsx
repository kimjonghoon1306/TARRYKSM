import Link from "next/link";

// 요금제가 부족해 잠긴 기능 자리에 표시하는 안내 카드.
// 업그레이드 페이지(/dashboard/plan)로 유도.
export default function LockedFeature({ planName, desc }: { planName: string; desc?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-amber-400/50 bg-amber-50/60 p-5 text-center dark:border-amber-400/30 dark:bg-amber-400/[0.06]">
      <div className="text-2xl">🔒</div>
      <div className="mt-2 text-sm font-bold text-amber-700 dark:text-amber-300">
        {planName} 요금제부터 사용할 수 있어요
      </div>
      {desc && <p className="mx-auto mt-1 max-w-sm text-xs text-amber-700/70 dark:text-amber-200/70">{desc}</p>}
      <Link
        href="/dashboard/plan"
        className="mt-3 inline-block rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-bold text-white shadow transition hover:brightness-105"
      >
        요금제 보기 →
      </Link>
    </div>
  );
}
