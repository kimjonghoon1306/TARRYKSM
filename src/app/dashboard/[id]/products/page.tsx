import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { addProduct, deleteProduct } from "./actions";

type Store = { id: string; name: string; slug: string };
type Product = {
  id: string;
  emoji: string | null;
  name: string;
  brand: string | null;
  category: string | null;
  price: number;
  tag: string | null;
};

const CATS = ["전체", "패션", "리빙", "뷰티", "액세서리", "테크"];
const won = (n: number) => "₩" + n.toLocaleString("ko-KR");

export default async function ProductsAdmin({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: store } = await supabase
    .from("stores")
    .select("id,name,slug")
    .eq("id", id)
    .maybeSingle();
  if (!store) notFound();
  const s = store as Store;

  const { data: products } = await supabase
    .from("products")
    .select("id,emoji,name,brand,category,price,tag")
    .eq("store_id", id)
    .order("created_at", { ascending: false });
  const items = (products ?? []) as Product[];

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/${s.id}`} className="text-neutral-400 hover:text-neutral-100 text-sm">← 몰 관리</Link>
          <b className="text-lg">{s.name}</b>
          <span className="text-xs text-neutral-500">상품 관리</span>
        </div>
        <Link href={`/s/${s.slug}`} target="_blank"
          className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm hover:border-violet-500">
          쇼핑몰 보기 ↗
        </Link>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* 상품 추가 폼 */}
        <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 mb-8">
          <h2 className="font-semibold mb-4">＋ 상품 추가</h2>
          <form action={addProduct} className="grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="store_id" value={s.id} />
            <Field label="이모지(이미지 대신)">
              <input name="emoji" defaultValue="📦" maxLength={4}
                className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm outline-none focus:border-violet-500" />
            </Field>
            <Field label="상품명 *">
              <input name="name" required placeholder="예: 소이 캔들"
                className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm outline-none focus:border-violet-500" />
            </Field>
            <Field label="가격(원) *">
              <input name="price" type="number" min={0} required placeholder="28000"
                className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm outline-none focus:border-violet-500" />
            </Field>
            <Field label="브랜드">
              <input name="brand" placeholder="예: AROMA"
                className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm outline-none focus:border-violet-500" />
            </Field>
            <Field label="카테고리">
              <select name="category" defaultValue="전체"
                className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm outline-none focus:border-violet-500">
                {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="태그(NEW·BEST 등)">
              <input name="tag" placeholder="NEW"
                className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm outline-none focus:border-violet-500" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="설명">
                <textarea name="description" rows={2} placeholder="상품 설명"
                  className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm outline-none focus:border-violet-500" />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <button className="rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 px-5 py-2.5 font-semibold text-sm">
                ＋ 추가하기
              </button>
            </div>
          </form>
        </section>

        {/* 상품 목록 */}
        <h2 className="font-semibold mb-4">등록된 상품 <span className="text-neutral-500">{items.length}</span></h2>
        {items.length === 0 ? (
          <div className="text-center py-16 text-neutral-500">아직 상품이 없어요. 위에서 추가하세요.</div>
        ) : (
          <div className="grid gap-3">
            {items.map((p) => (
              <div key={p.id} className="flex items-center gap-4 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                <div className="w-12 h-12 grid place-items-center text-2xl rounded-lg bg-neutral-800 shrink-0">{p.emoji || "📦"}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <b className="truncate">{p.name}</b>
                    {p.tag && <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300">{p.tag}</span>}
                  </div>
                  <div className="text-xs text-neutral-500">{[p.brand, p.category].filter(Boolean).join(" · ")}</div>
                </div>
                <div className="font-bold shrink-0">{won(p.price)}</div>
                <div className="flex gap-2 shrink-0">
                  <Link href={`/dashboard/${s.id}/products/${p.id}`}
                    className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm hover:border-violet-500">수정</Link>
                  <form action={deleteProduct}>
                    <input type="hidden" name="store_id" value={s.id} />
                    <input type="hidden" name="id" value={p.id} />
                    <button className="rounded-lg border border-neutral-800 px-3 py-1.5 text-sm text-neutral-500 hover:border-rose-500 hover:text-rose-400">삭제</button>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs text-neutral-400 mb-1.5">{label}</span>
      {children}
    </label>
  );
}
