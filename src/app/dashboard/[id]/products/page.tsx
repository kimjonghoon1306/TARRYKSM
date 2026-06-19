import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteProduct } from "./actions";
import ProductForm from "@/components/ProductForm";
import { listStoreCategories } from "../categories/actions";
import { getMe } from "@/lib/role";
import { canUse, requiredPlanName } from "@/lib/plans";

type Store = { id: string; name: string; slug: string; skin: string };
type Product = {
  id: string;
  emoji: string | null;
  image_url: string | null;
  name: string;
  brand: string | null;
  category: string | null;
  price: number;
  tag: string | null;
};

const won = (n: number) => "₩" + n.toLocaleString("ko-KR");
const CARD =
  "rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]";

export default async function ProductsAdmin({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: store } = await supabase
    .from("stores")
    .select("id,name,slug,skin")
    .eq("id", id)
    .maybeSingle();
  if (!store) notFound();
  const s = store as Store;

  const { data: products } = await supabase
    .from("products")
    .select("id,emoji,image_url,name,brand,category,price,tag")
    .eq("store_id", id)
    .order("created_at", { ascending: false });
  const items = (products ?? []) as Product[];

  const storeCats = (await listStoreCategories(id)).map((c) => c.name);
  const me = await getMe();
  const canCompareAt = canUse("compare_at", me.plan, me.role);

  return (
    <div className="mx-auto max-w-5xl">
      <Link href={`/dashboard/${s.id}`} className="text-sm text-neutral-500 hover:text-violet-500">
        ← 몰 관리
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold sm:text-3xl">{s.name} · 상품</h1>
        <Link
          href={`/${s.slug}`}
          target="_blank"
          className="ml-auto rounded-lg border border-black/10 px-3 py-1.5 text-sm transition hover:border-violet-500 dark:border-white/15"
        >
          쇼핑몰 보기 ↗
        </Link>
      </div>

      {/* 상품 추가 폼 + 소비자 미리보기 */}
      <section className={CARD + " mt-6"}>
        <h2 className="mb-4 font-semibold">＋ 상품 추가</h2>
        <ProductForm storeId={s.id} skin={s.skin} cats={storeCats} canCompareAt={canCompareAt} compareAtPlan={requiredPlanName("compare_at")} />
      </section>

      {/* 상품 목록 */}
      <h2 className="mb-4 mt-8 font-semibold">
        등록된 상품 <span className="text-neutral-400">{items.length}</span>
      </h2>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/10 py-16 text-center text-sm text-neutral-400 dark:border-white/10">
          아직 상품이 없어요. 위에서 추가하세요.
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((p) => (
            <div key={p.id} className={"flex items-center gap-4 p-4 " + CARD}>
              <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-black/[0.04] text-2xl dark:bg-white/[0.06]">
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  p.emoji || "📦"
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <b className="truncate">{p.name}</b>
                  {p.tag && (
                    <span className="rounded bg-violet-500/15 px-1.5 py-0.5 text-[10px] text-violet-500 dark:text-violet-300">
                      {p.tag}
                    </span>
                  )}
                </div>
                <div className="text-xs text-neutral-400">
                  {[p.brand, p.category].filter(Boolean).join(" · ")}
                </div>
              </div>
              <div className="shrink-0 font-bold">{won(p.price)}</div>
              <div className="flex shrink-0 gap-2">
                <Link
                  href={`/dashboard/${s.id}/products/${p.id}`}
                  className="rounded-lg border border-black/10 px-3 py-1.5 text-sm transition hover:border-violet-500 dark:border-white/15"
                >
                  수정
                </Link>
                <form action={deleteProduct}>
                  <input type="hidden" name="store_id" value={s.id} />
                  <input type="hidden" name="id" value={p.id} />
                  <button className="rounded-lg border border-black/10 px-3 py-1.5 text-sm text-neutral-400 transition hover:border-rose-400 hover:text-rose-500 dark:border-white/10">
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
