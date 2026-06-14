import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createStore, deleteStore } from "../actions";
import { SKINS } from "@/lib/skins";

type Store = { id: string; name: string; skin: string; slug: string };

export default async function StoresPage() {
  const supabase = await createClient();
  const { data: stores } = await supabase
    .from("stores")
    .select("id,name,skin,slug")
    .order("created_at", { ascending: false });
  const list = (stores ?? []) as Store[];
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

  const card =
    "rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]";

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold sm:text-3xl">쇼핑몰</h1>
      <p className="mt-1 text-sm text-neutral-500">매장을 만들고 관리하세요</p>

      <section className={card + " mt-6"}>
        <h2 className="mb-4 text-lg font-semibold">새 쇼핑몰 만들기</h2>
        <form action={createStore} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <label className="mb-1.5 block text-xs font-semibold text-neutral-500">쇼핑몰 이름</label>
            <input
              name="name"
              required
              placeholder="예: OBJECT, ZEST"
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 dark:border-white/10 dark:bg-white/[0.04]"
            />
          </div>
          <div className="min-w-[150px]">
            <label className="mb-1.5 block text-xs font-semibold text-neutral-500">스킨</label>
            <select
              name="skin"
              defaultValue="mono"
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-violet-500 dark:border-white/10 dark:bg-white/[0.04]"
            >
              {SKINS.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <button className="rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-105">
            ＋ 만들기
          </button>
        </form>
      </section>

      <h2 className="mb-4 mt-8 text-lg font-semibold">내 쇼핑몰 ({list.length})</h2>
      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/10 py-16 text-center text-sm text-neutral-400 dark:border-white/10">
          아직 만든 쇼핑몰이 없어요. 위에서 1분 만에 시작하세요.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => (
            <div key={s.id} className={card}>
              <div className="mb-3 flex items-center justify-between">
                <b className="text-lg">{s.name}</b>
                <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-xs text-violet-500 dark:text-violet-300">
                  {s.skin}
                </span>
              </div>
              <div className="mb-4 break-all text-xs text-neutral-400">
                {s.slug}.{root}
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/${s.id}`}
                  className="flex-1 rounded-lg border border-black/10 px-3 py-2 text-center text-sm transition hover:border-violet-500 dark:border-white/15"
                >
                  관리
                </Link>
                <Link
                  href={`/s/${s.slug}`}
                  target="_blank"
                  className="flex-1 rounded-lg border border-black/10 px-3 py-2 text-center text-sm transition hover:border-violet-500 dark:border-white/15"
                >
                  보기 ↗
                </Link>
                <form action={deleteStore}>
                  <input type="hidden" name="id" value={s.id} />
                  <button className="rounded-lg border border-black/10 px-3 py-2 text-sm text-neutral-400 transition hover:border-rose-400 hover:text-rose-500 dark:border-white/10">
                    삭제
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
