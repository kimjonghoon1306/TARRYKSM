import Link from "next/link";
import { createStoreOpen } from "../../actions";
import { SKIN_BY_ID, SKIN_IDS } from "@/lib/skins";
import { PRIMARY_DOMAIN } from "@/lib/domains";

export default async function NewStorePage({
  searchParams,
}: {
  searchParams: Promise<{ skin?: string; err?: string; name?: string; slug?: string }>;
}) {
  const sp = await searchParams;
  const skin = sp.skin && SKIN_IDS.includes(sp.skin) ? sp.skin : "mono";
  const meta = SKIN_BY_ID[skin];

  const card =
    "rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]";

  return (
    <div className="mx-auto max-w-lg">
      <Link href="/?studio=1" className="text-sm text-neutral-500 hover:text-violet-500">
        ← 스튜디오에서 다른 스킨 보기
      </Link>
      <h1 className="mt-2 text-2xl font-bold sm:text-3xl">새 쇼핑몰 만들기</h1>
      <p className="mt-1 text-sm text-neutral-500">스튜디오에서 고른 스킨으로 만듭니다</p>

      <section className={card + " mt-6"}>
        {/* 선택한 스킨 */}
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-black/5 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 text-lg">🎨</span>
          <div>
            <div className="text-xs text-neutral-400">선택한 스킨</div>
            <div className="font-semibold">
              {meta?.name ?? skin}{" "}
              <span className="text-xs font-normal text-neutral-400">· {meta?.vibe}</span>
            </div>
          </div>
          <Link
            href="/?studio=1"
            className="ml-auto rounded-lg border border-black/10 px-3 py-1.5 text-xs transition hover:border-violet-500 dark:border-white/15"
          >
            변경
          </Link>
        </div>

        {sp.err && (
          <p className="mb-3 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">
            {sp.err}
          </p>
        )}

        <form action={createStoreOpen} className="space-y-4">
          <input type="hidden" name="skin" value={skin} />
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-neutral-500">쇼핑몰 이름</span>
            <input
              name="name"
              required
              autoFocus
              defaultValue={sp.name || ""}
              placeholder="예: OBJECT, ZEST, 오늘의가게"
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 dark:border-white/10 dark:bg-white/[0.04]"
            />
          </label>

          {/* 주소(슬러그) 직접 지정 */}
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-neutral-500">
              쇼핑몰 주소 <span className="text-neutral-400">(영문, 변경 불가)</span>
            </span>
            <div className="flex items-stretch overflow-hidden rounded-xl border border-black/10 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/25 dark:border-white/10">
              <span className="flex items-center whitespace-nowrap bg-black/[0.04] px-3 text-xs text-neutral-500 dark:bg-white/[0.06]">
                {PRIMARY_DOMAIN}/
              </span>
              <input
                name="slug"
                required
                defaultValue={sp.slug || ""}
                pattern="[a-z0-9][a-z0-9\-]{1,29}"
                placeholder="myshop"
                className="flex-1 bg-white px-3 py-2.5 text-sm outline-none dark:bg-white/[0.04]"
              />
            </div>
            <span className="mt-1 block text-xs text-neutral-400">
              영문 소문자·숫자·하이픈(-) 2~30자. 예: myshop → {PRIMARY_DOMAIN}/myshop
            </span>
          </label>

          <button className="press-glow w-full rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-105 active:scale-[.98]">
            🚀 이 스킨으로 만들기
          </button>
        </form>
      </section>
    </div>
  );
}
