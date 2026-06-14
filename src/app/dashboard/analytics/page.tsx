import { createClient } from "@/lib/supabase/server";
import { SKIN_BY_ID } from "@/lib/skins";

const won = (n: number) => "₩" + Math.round(n).toLocaleString("ko-KR");

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const { data: stores } = await supabase.from("stores").select("id,skin");
  const storeIds = (stores ?? []).map((s) => s.id);

  let products: { price: number; category: string | null }[] = [];
  if (storeIds.length) {
    const { data } = await supabase
      .from("products")
      .select("price,category")
      .in("store_id", storeIds);
    products = (data ?? []) as { price: number; category: string | null }[];
  }

  const storeCount = (stores ?? []).length;
  const productCount = products.length;
  const totalValue = products.reduce((s, p) => s + (p.price || 0), 0);
  const avgPrice = productCount ? totalValue / productCount : 0;

  // 스킨 분포
  const skinDist = new Map<string, number>();
  (stores ?? []).forEach((s) => skinDist.set(s.skin, (skinDist.get(s.skin) || 0) + 1));
  const skinRows = [...skinDist.entries()].sort((a, b) => b[1] - a[1]);

  // 카테고리 분포
  const catDist = new Map<string, number>();
  products.forEach((p) => {
    const c = p.category || "전체";
    catDist.set(c, (catDist.get(c) || 0) + 1);
  });
  const catRows = [...catDist.entries()].sort((a, b) => b[1] - a[1]);

  const card =
    "rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]";

  const Bar = ({ label, n, max }: { label: string; n: number; max: number }) => (
    <div className="flex items-center gap-3">
      <span className="w-24 flex-none truncate text-sm">{label}</span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500"
          style={{ width: `${max ? (n / max) * 100 : 0}%` }}
        />
      </div>
      <span className="w-8 flex-none text-right text-sm font-semibold text-neutral-500">{n}</span>
    </div>
  );

  const skinMax = Math.max(1, ...skinRows.map((r) => r[1]));
  const catMax = Math.max(1, ...catRows.map((r) => r[1]));

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold sm:text-3xl">분석</h1>
      <p className="mt-1 text-sm text-neutral-500">운영 현황 한눈에</p>

      {/* 핵심 지표 */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className={card}>
          <div className="text-2xl font-bold sm:text-3xl">{storeCount}</div>
          <div className="mt-1 text-xs text-neutral-500">운영 쇼핑몰</div>
        </div>
        <div className={card}>
          <div className="text-2xl font-bold sm:text-3xl">{productCount}</div>
          <div className="mt-1 text-xs text-neutral-500">전체 상품</div>
        </div>
        <div className={card}>
          <div className="text-2xl font-bold sm:text-3xl">{won(avgPrice)}</div>
          <div className="mt-1 text-xs text-neutral-500">평균 상품가</div>
        </div>
        <div className={card}>
          <div className="text-2xl font-bold sm:text-3xl">{won(totalValue)}</div>
          <div className="mt-1 text-xs text-neutral-500">상품 가치 합계</div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className={card}>
          <h2 className="mb-4 text-lg font-semibold">스킨 분포</h2>
          {skinRows.length === 0 ? (
            <p className="text-sm text-neutral-400">데이터가 없어요.</p>
          ) : (
            <div className="space-y-3">
              {skinRows.map(([skin, n]) => (
                <Bar key={skin} label={SKIN_BY_ID[skin]?.name || skin} n={n} max={skinMax} />
              ))}
            </div>
          )}
        </section>

        <section className={card}>
          <h2 className="mb-4 text-lg font-semibold">카테고리 분포</h2>
          {catRows.length === 0 ? (
            <p className="text-sm text-neutral-400">데이터가 없어요.</p>
          ) : (
            <div className="space-y-3">
              {catRows.map(([cat, n]) => (
                <Bar key={cat} label={cat} n={n} max={catMax} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
