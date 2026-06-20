import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { currentUser } from "@/lib/auth";
import { deleteStore } from "../actions";
import { PRIMARY_DOMAIN } from "@/lib/domains";

type Store = { id: string; name: string; skin: string; slug: string };

export default async function StoresPage() {
  const supabase = await createClient();
  const user = await currentUser();
  // ⚠️ 멀티테넌트 격리: 내 소유 몰만
  const { data: stores } = user
    ? await supabase.from("stores").select("id,name,skin,slug").eq("owner", user.id).order("created_at", { ascending: false })
    : { data: [] };
  const list = (stores ?? []) as Store[];

  const card =
    "rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]";

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold sm:text-3xl">쇼핑몰</h1>
      <p className="mt-1 text-sm text-neutral-500">매장을 만들고 관리하세요</p>

      {/* 생성은 스튜디오에서 (미리보기 보며 스킨 선택) */}
      <Link
        href="/?studio=1"
        className={
          card +
          " lift mt-6 flex items-center gap-4 transition hover:border-violet-400"
        }
      >
        <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 text-2xl">
          🎨
        </span>
        <div>
          <div className="font-semibold">＋ 새 쇼핑몰 만들기</div>
          <div className="text-sm text-neutral-500">
            스튜디오에서 28가지 스킨을 미리보며 고르고 만드세요
          </div>
        </div>
        <span className="ml-auto text-violet-500">→</span>
      </Link>

      <h2 className="mb-4 mt-8 text-lg font-semibold">내 쇼핑몰 ({list.length})</h2>
      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/10 py-16 text-center text-sm text-neutral-400 dark:border-white/10">
          아직 만든 쇼핑몰이 없어요. 위에서 1분 만에 시작하세요.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => (
            <div key={s.id} className={card + " lift"}>
              <div className="mb-3 flex items-center justify-between">
                <b className="text-lg">{s.name}</b>
                <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-xs text-violet-500 dark:text-violet-300">
                  {s.skin}
                </span>
              </div>
              <div className="mb-4 break-all text-xs text-neutral-400">
                {PRIMARY_DOMAIN}/{s.slug}
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/${s.id}`}
                  className="flex-1 rounded-lg border border-black/10 px-3 py-2 text-center text-sm transition hover:border-violet-500 dark:border-white/15"
                >
                  관리
                </Link>
                <Link
                  href={`/${s.slug}`}
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
