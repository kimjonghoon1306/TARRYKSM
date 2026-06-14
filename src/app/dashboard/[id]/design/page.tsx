import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { setStoreSkin } from "../../actions";
import { SKINS } from "@/lib/skins";

type Store = { id: string; name: string; skin: string; slug: string };

export default async function DesignPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ msg?: string }>;
}) {
  const { id } = await params;
  const { msg } = await searchParams;
  const supabase = await createClient();
  const { data: store } = await supabase
    .from("stores")
    .select("id,name,skin,slug")
    .eq("id", id)
    .maybeSingle();
  if (!store) notFound();
  const s = store as Store;

  return (
    <div className="mx-auto max-w-4xl">
      <Link href={`/dashboard/${s.id}`} className="text-sm text-neutral-500 hover:text-violet-500">
        ← 몰 관리
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold sm:text-3xl">디자인 · 스킨</h1>
        <Link
          href={`/${s.slug}`}
          target="_blank"
          className="ml-auto rounded-lg border border-black/10 px-3 py-1.5 text-sm transition hover:border-violet-500 dark:border-white/15"
        >
          쇼핑몰 보기 ↗
        </Link>
      </div>
      <p className="mt-1 text-sm text-neutral-500">
        클릭 한 번으로 {s.name}의 색·서체·무드가 전부 바뀝니다.
      </p>

      {msg && (
        <p className="mt-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
          {msg}
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {SKINS.map((sk) => {
          const active = sk.id === s.skin;
          return (
            <form key={sk.id} action={setStoreSkin}>
              <input type="hidden" name="id" value={s.id} />
              <input type="hidden" name="skin" value={sk.id} />
              <button
                type="submit"
                className={
                  "lift w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition dark:bg-white/[0.03] " +
                  (active
                    ? "border-violet-500 ring-2 ring-violet-500/30"
                    : "border-black/5 hover:border-violet-400 dark:border-white/10")
                }
              >
                {/* 스킨 미리보기 스와치 (실제 스킨 색) */}
                <div
                  className="mb-3 flex h-16 w-full items-center justify-center rounded-xl"
                  style={{ background: sk.bg }}
                >
                  <span
                    className="h-7 w-7 rounded-full"
                    style={{ background: sk.color, boxShadow: `0 4px 12px -2px ${sk.color}` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <b className="text-sm">{sk.name}</b>
                  {active && (
                    <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-bold text-violet-500 dark:text-violet-300">
                      현재
                    </span>
                  )}
                </div>
                <div className="text-xs text-neutral-400">{sk.vibe}</div>
              </button>
            </form>
          );
        })}
      </div>
    </div>
  );
}
