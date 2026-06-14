import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signout } from "@/app/auth/actions";
import { createStore, deleteStore } from "./actions";
import { SKINS } from "@/lib/skins";

type Store = { id: string; name: string; skin: string; slug: string };

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: stores } = await supabase
    .from("stores")
    .select("id,name,skin,slug")
    .order("created_at", { ascending: false });

  const list = (stores ?? []) as Store[];
  const name =
    (user?.user_metadata?.display_name as string) ||
    user?.email?.split("@")[0] ||
    "창업자";
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 grid place-items-center font-bold text-sm">O</span>
          <b className="tracking-tight">ONJONGIL</b>
          <span className="text-neutral-500 text-sm">Studio</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-neutral-400">{name}</span>
          <form action={signout}>
            <button className="rounded-lg border border-neutral-800 px-3 py-1.5 hover:border-rose-500 hover:text-rose-400">
              로그아웃
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-1">내 쇼핑몰</h1>
        <p className="text-neutral-400 mb-8">운영 중인 매장을 한눈에</p>

        {/* 생성 폼 */}
        <form
          action={createStore}
          className="flex flex-wrap gap-3 items-end bg-neutral-900 border border-neutral-800 rounded-2xl p-5 mb-10"
        >
          <div className="flex-1 min-w-50">
            <label className="block text-xs text-neutral-400 mb-1.5">쇼핑몰 이름</label>
            <input name="name" required placeholder="예: OBJECT, ZEST"
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-2.5 text-sm outline-none focus:border-violet-500" />
          </div>
          <div className="min-w-40">
            <label className="block text-xs text-neutral-400 mb-1.5">스킨</label>
            <select name="skin" defaultValue="mono"
              className="rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-2.5 text-sm outline-none focus:border-violet-500">
              {SKINS.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <button className="rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 px-5 py-2.5 font-semibold text-sm">
            ＋ 만들기
          </button>
        </form>

        {/* 목록 */}
        {list.length === 0 ? (
          <div className="text-center py-20 text-neutral-500">
            아직 만든 쇼핑몰이 없어요. 위에서 1분 만에 시작하세요.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((s) => (
              <div key={s.id} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                <div className="flex items-center justify-between mb-3">
                  <b className="text-lg">{s.name}</b>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300">{s.skin}</span>
                </div>
                <div className="text-xs text-neutral-500 mb-4 break-all">
                  {s.slug}.{root}
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/${s.id}`}
                    className="flex-1 text-center rounded-lg border border-neutral-700 px-3 py-2 text-sm hover:border-violet-500">
                    관리
                  </Link>
                  <Link href={`/s/${s.slug}`} target="_blank"
                    className="flex-1 text-center rounded-lg border border-neutral-700 px-3 py-2 text-sm hover:border-violet-500">
                    보기 ↗
                  </Link>
                  <form action={deleteStore}>
                    <input type="hidden" name="id" value={s.id} />
                    <button className="rounded-lg border border-neutral-800 px-3 py-2 text-sm text-neutral-500 hover:border-rose-500 hover:text-rose-400">
                      삭제
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
