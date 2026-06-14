export default function ComingSoon({
  title,
  icon,
  desc,
  note,
}: {
  title: string;
  icon: string;
  desc: string;
  note?: string;
}) {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
      <p className="mt-1 text-sm text-neutral-500">{desc}</p>

      <div className="mt-6 rounded-2xl border border-dashed border-black/10 bg-white/50 py-20 text-center dark:border-white/10 dark:bg-white/[0.02]">
        <div className="text-5xl">{icon}</div>
        <div className="mt-4 text-lg font-semibold">준비 중이에요</div>
        {note && (
          <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-500">{note}</p>
        )}
      </div>
    </div>
  );
}
