import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Store = { id: string; name: string; skin: string };
type Product = {
  id: string;
  emoji: string | null;
  name: string;
  brand: string | null;
  price: number;
};

const won = (n: number) => "₩" + n.toLocaleString("ko-KR");

export default async function Storefront({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: store } = await supabase
    .from("stores")
    .select("id,name,skin")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (!store) notFound();
  const s = store as Store;

  const { data: products } = await supabase
    .from("products")
    .select("id,emoji,name,brand,price")
    .eq("store_id", s.id)
    .order("position", { ascending: true });
  const items = (products ?? []) as Product[];

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <header className="sticky top-0 bg-white/80 backdrop-blur border-b px-6 py-4">
        <b className="text-lg tracking-tight">{s.name}</b>
      </header>

      <section className="px-6 py-12 text-center border-b">
        <h1 className="text-3xl font-bold">{s.name}</h1>
        <p className="text-neutral-500 mt-2">Powered by ONJONGIL · 무한분양</p>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-10">
        {items.length === 0 ? (
          <div className="text-center text-neutral-400 py-20">
            아직 등록된 상품이 없어요.
          </div>
        ) : (
          <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((p) => (
              <div key={p.id} className="rounded-2xl border overflow-hidden">
                <div className="aspect-square grid place-items-center text-5xl bg-neutral-50">
                  {p.emoji || "📦"}
                </div>
                <div className="p-3">
                  {p.brand && <div className="text-[10px] font-bold text-neutral-400 uppercase">{p.brand}</div>}
                  <div className="text-sm font-medium leading-tight">{p.name}</div>
                  <div className="mt-2 font-bold">{won(p.price)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
