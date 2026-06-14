import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SKINS } from "@/lib/skins";
import { PRIMARY_DOMAIN } from "@/lib/domains";
import { setStoreSlug } from "./actions";

type Store = { id: string; name: string; skin: string; slug: string };

export default async function Overview({
  searchParams,
}: {
  searchParams: Promise<{ smsg?: string; serr?: string }>;
}) {
  const { smsg, serr } = await searchParams;
  const supabase = await createClient();
  // 인증 확인과 목록 조회를 병렬로 (전환 속도 개선)
  const [{ data: userData }, { data: stores }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("stores").select("id,name,skin,slug").order("created_at", { ascending: false }),
  ]);
  const user = userData.user;
  const list = (stores ?? []) as Store[];

  const storeIds = list.map((s) => s.id);
  let productCount = 0;
  if (storeIds.length) {
    const { count } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .in("store_id", storeIds);
    productCount = count ?? 0;
  }

  const card =
    "rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]";

  const stats = [
    { n: list.length, label: "운영 쇼핑몰", href: "/dashboard/stores" },
    { n: productCount, label: "전체 상품", href: "/dashboard/products" },
    { n: SKINS.length, label: "사용 가능 스킨", href: "/?studio=1" },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold sm:text-3xl">대시보드</h1>
      <p className="mt-1 text-sm text-neutral-500">모든 쇼핑몰을 여기서 만들고 · 수정하고 · 관리하세요</p>

      {!user && (
        <div className="mt-5 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          둘러보기 모드예요. 쇼핑몰을 만들거나 저장하려면{" "}
          <Link href="/login" className="font-bold underline">로그인</Link>이 필요합니다.
        </div>
      )}

      {smsg && (
        <p className="mt-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">{smsg}</p>
      )}
      {serr && (
        <p className="mt-4 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">{serr}</p>
      )}

      {/* 요약 통계 */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className={card + " lift transition hover:border-violet-400"}>
            <div className="text-2xl font-bold sm:text-3xl">{s.n}</div>
            <div className="mt-1 text-xs text-neutral-500">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* 빠른 작업 */}
      <h2 className="mb-3 mt-8 text-lg font-semibold">빠른 작업</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/?studio=1" className={card + " lift transition hover:border-violet-400"}>
          <div className="text-2xl">🎨</div>
          <div className="mt-2 text-sm font-semibold">스튜디오 열기</div>
          <div className="text-xs text-neutral-500">스킨 디자인·미리보기</div>
        </Link>
        <Link href="/?studio=1" className={card + " lift transition hover:border-violet-400"}>
          <div className="text-2xl">🏬</div>
          <div className="mt-2 text-sm font-semibold">쇼핑몰 만들기</div>
          <div className="text-xs text-neutral-500">스튜디오에서 미리보며</div>
        </Link>
        <Link href="/dashboard/products" className={card + " lift transition hover:border-violet-400"}>
          <div className="text-2xl">📦</div>
          <div className="mt-2 text-sm font-semibold">상품 관리</div>
          <div className="text-xs text-neutral-500">전체 상품 보기</div>
        </Link>
        <Link href="/dashboard/analytics" className={card + " lift transition hover:border-violet-400"}>
          <div className="text-2xl">📈</div>
          <div className="mt-2 text-sm font-semibold">분석</div>
          <div className="text-xs text-neutral-500">현황 통계</div>
        </Link>
      </div>

      {/* 최근 쇼핑몰 */}
      <div className="mb-3 mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold">최근 쇼핑몰</h2>
        <Link href="/dashboard/stores" className="text-sm text-violet-500 hover:text-violet-400">
          전체 보기 →
        </Link>
      </div>
      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/10 py-16 text-center text-sm text-neutral-400 dark:border-white/10">
          아직 만든 쇼핑몰이 없어요.{" "}
          <Link href="/?studio=1" className="font-semibold text-violet-500 underline">
            스튜디오에서 만들기
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.slice(0, 6).map((s) => (
            <div key={s.id} className={card}>
              <div className="mb-3 flex items-center justify-between">
                <b className="text-lg">{s.name}</b>
                <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-xs text-violet-500 dark:text-violet-300">
                  {s.skin}
                </span>
              </div>
              {/* 주소(슬러그) 바로 수정 */}
              <form action={setStoreSlug} className="mb-3">
                <input type="hidden" name="id" value={s.id} />
                <input type="hidden" name="return" value="dashboard" />
                <label className="mb-1 block text-[11px] font-semibold text-neutral-400">주소 (수정 가능)</label>
                <div className="flex items-stretch overflow-hidden rounded-lg border border-black/10 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/25 dark:border-white/10">
                  <span className="flex items-center whitespace-nowrap bg-black/[0.04] px-2 text-[11px] text-neutral-500 dark:bg-white/[0.06]">
                    {PRIMARY_DOMAIN}/
                  </span>
                  <input
                    name="slug"
                    defaultValue={s.slug}
                    pattern="[a-z0-9][a-z0-9\-]{1,29}"
                    className="w-full min-w-0 bg-white px-2 py-1.5 font-mono text-xs outline-none dark:bg-white/[0.04]"
                  />
                  <button className="whitespace-nowrap bg-violet-500 px-2.5 text-[11px] font-bold text-white">
                    저장
                  </button>
                </div>
              </form>
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
