import { createClient } from "@/lib/supabase/server";
import { SKIN_BY_ID } from "@/lib/skins";
import LockedFeature from "@/components/LockedFeature";
import { getMe } from "@/lib/role";
import { canUse, requiredPlanName } from "@/lib/plans";

const won = (n: number) => "₩" + Math.round(n).toLocaleString("ko-KR");

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const me = await getMe();
  if (!canUse("analytics", me.plan, me.role)) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold sm:text-3xl">📈 분석</h1>
        <p className="mt-1 text-sm text-neutral-500">매출·상품·고객 통계를 한눈에 볼 수 있어요.</p>
        <div className="mt-6">
          <LockedFeature planName={requiredPlanName("analytics")} desc="매출 추이·상품별 판매·카테고리 분포 등 분석 리포트를 볼 수 있어요." />
        </div>
      </div>
    );
  }

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

  // 주문(매출) — RLS가 내 몰 주문만 반환. 테이블 없으면 빈 배열.
  let orders: { total: number; status: string }[] = [];
  let items: { name: string; qty: number; price: number }[] = [];
  const { data: oData } = await supabase.from("orders").select("total,status");
  if (oData) orders = oData as { total: number; status: string }[];
  const { data: iData } = await supabase.from("order_items").select("name,qty,price");
  if (iData) items = iData as { name: string; qty: number; price: number }[];

  const storeCount = (stores ?? []).length;
  const productCount = products.length;

  // 매출 지표 (취소 제외)
  const paid = orders.filter((o) => o.status !== "취소");
  const revenue = paid.reduce((s, o) => s + (o.total || 0), 0);
  const orderCount = paid.length;
  const avgOrder = orderCount ? revenue / orderCount : 0;

  // 인기 상품 (실제 판매 수량)
  const sold = new Map<string, { qty: number; amt: number }>();
  items.forEach((it) => {
    const ex = sold.get(it.name) || { qty: 0, amt: 0 };
    ex.qty += it.qty;
    ex.amt += it.qty * it.price;
    sold.set(it.name, ex);
  });
  const bestRows = [...sold.entries()].sort((a, b) => b[1].qty - a[1].qty).slice(0, 6);

  // 카테고리 분포 (상품 등록 기준)
  const catDist = new Map<string, number>();
  products.forEach((p) => {
    const c = p.category || "전체";
    catDist.set(c, (catDist.get(c) || 0) + 1);
  });
  const catRows = [...catDist.entries()].sort((a, b) => b[1] - a[1]);

  // 스킨 분포
  const skinDist = new Map<string, number>();
  (stores ?? []).forEach((s) => skinDist.set(s.skin, (skinDist.get(s.skin) || 0) + 1));
  const skinRows = [...skinDist.entries()].sort((a, b) => b[1] - a[1]);

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
  const bestMax = Math.max(1, ...bestRows.map((r) => r[1].qty));

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold sm:text-3xl">분석</h1>
      <p className="mt-1 text-sm text-neutral-500">매출과 운영 현황을 한눈에</p>

      {/* 매출 지표 (실주문 기반) */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className={card}>
          <div className="text-2xl font-bold sm:text-3xl">{won(revenue)}</div>
          <div className="mt-1 text-xs text-neutral-500">💰 총 매출 (취소 제외)</div>
        </div>
        <div className={card}>
          <div className="text-2xl font-bold sm:text-3xl">{orderCount}</div>
          <div className="mt-1 text-xs text-neutral-500">🧾 주문 수</div>
        </div>
        <div className={card}>
          <div className="text-2xl font-bold sm:text-3xl">{won(avgOrder)}</div>
          <div className="mt-1 text-xs text-neutral-500">📊 평균 주문액</div>
        </div>
        <div className={card}>
          <div className="text-2xl font-bold sm:text-3xl">{items.reduce((s, i) => s + i.qty, 0)}</div>
          <div className="mt-1 text-xs text-neutral-500">📦 판매 수량</div>
        </div>
      </div>

      {/* 운영 지표 */}
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className={card}>
          <div className="text-xl font-bold">{storeCount}</div>
          <div className="mt-1 text-xs text-neutral-500">운영 쇼핑몰</div>
        </div>
        <div className={card}>
          <div className="text-xl font-bold">{productCount}</div>
          <div className="mt-1 text-xs text-neutral-500">전체 상품</div>
        </div>
      </div>

      {/* 인기 상품 (실판매) */}
      <section className={card + " mt-6"}>
        <h2 className="mb-4 text-lg font-semibold">🏆 인기 상품 (실제 판매 수량)</h2>
        {bestRows.length === 0 ? (
          <p className="text-sm text-neutral-400">아직 판매된 상품이 없어요. 주문이 들어오면 표시돼요.</p>
        ) : (
          <div className="space-y-3">
            {bestRows.map(([name, v]) => (
              <div key={name} className="flex items-center gap-3">
                <span className="w-28 flex-none truncate text-sm">{name}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500"
                    style={{ width: `${(v.qty / bestMax) * 100}%` }}
                  />
                </div>
                <span className="w-12 flex-none text-right text-sm font-semibold text-neutral-500">{v.qty}개</span>
                <span className="w-20 flex-none text-right text-xs tabular-nums text-violet-500">{won(v.amt)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
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
