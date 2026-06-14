import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Row = {
  id: string;
  name: string;
  emoji: string | null;
  image_url: string | null;
  price: number;
  category: string | null;
  brand: string | null;
  store_id: string;
  stores: { name: string; slug: string } | null;
};

const won = (n: number) => "₩" + n.toLocaleString("ko-KR");

export default async function AllProductsPage() {
  const supabase = await createClient();

  const { data: stores } = await supabase.from("stores").select("id,name");
  const storeIds = (stores ?? []).map((s) => s.id);

  let rows: Row[] = [];
  if (storeIds.length) {
    const { data } = await supabase
      .from("products")
      .select("id,name,emoji,image_url,price,category,brand,store_id,stores(name,slug)")
      .in("store_id", storeIds)
      .order("created_at", { ascending: false });
    rows = (data ?? []) as unknown as Row[];
  }

  const card =
    "rounded-2xl border border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]";

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold sm:text-3xl">상품</h1>
      <p className="mt-1 text-sm text-neutral-500">
        모든 쇼핑몰의 상품을 한눈에 ({rows.length})
      </p>

      {rows.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-black/10 py-16 text-center text-sm text-neutral-400 dark:border-white/10">
          등록된 상품이 없어요. 쇼핑몰 관리에서 상품을 추가하세요.
          <div className="mt-3">
            <Link href="/dashboard/stores" className="font-semibold text-violet-500 underline">
              쇼핑몰로 가기 →
            </Link>
          </div>
        </div>
      ) : (
        <div className={card + " mt-6 overflow-hidden"}>
          {/* 헤더 (데스크탑) */}
          <div className="hidden border-b border-black/5 px-5 py-3 text-xs font-semibold text-neutral-400 dark:border-white/10 sm:grid sm:grid-cols-[1fr_140px_120px_110px] sm:gap-3">
            <span>상품</span>
            <span>쇼핑몰</span>
            <span>카테고리</span>
            <span className="text-right">가격</span>
          </div>
          <ul className="divide-y divide-black/5 dark:divide-white/10">
            {rows.map((p) => (
              <li
                key={p.id}
                className="grid grid-cols-[1fr_auto] items-center gap-3 px-5 py-3 sm:grid-cols-[1fr_140px_120px_110px]"
              >
                <Link
                  href={`/dashboard/${p.store_id}/products/${p.id}`}
                  className="flex min-w-0 items-center gap-3"
                >
                  <span className="grid h-10 w-10 flex-none place-items-center overflow-hidden rounded-lg bg-black/[0.03] text-xl dark:bg-white/[0.05]">
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      p.emoji || "📦"
                    )}
                  </span>
                  <span className="min-w-0">
                    {p.brand && (
                      <span className="block text-[10px] font-bold uppercase text-neutral-400">{p.brand}</span>
                    )}
                    <span className="block truncate text-sm font-medium">{p.name}</span>
                  </span>
                </Link>
                <span className="hidden truncate text-sm text-neutral-500 sm:block">
                  {p.stores?.name || "—"}
                </span>
                <span className="hidden text-sm text-neutral-500 sm:block">
                  {p.category || "전체"}
                </span>
                <span className="text-right text-sm font-bold">{won(p.price)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
