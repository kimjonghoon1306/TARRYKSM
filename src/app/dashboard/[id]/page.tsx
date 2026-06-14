import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Store = {
  id: string;
  name: string;
  skin: string;
  slug: string;
  published: boolean;
};

export default async function StoreAdmin({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: store } = await supabase
    .from("stores")
    .select("id,name,skin,slug,published")
    .eq("id", id)
    .maybeSingle();
  if (!store) notFound();
  const s = store as Store;

  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("store_id", id);

  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-neutral-400 hover:text-neutral-100 text-sm">← 대시보드</Link>
          <b className="text-lg">{s.name}</b>
          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300">{s.skin}</span>
        </div>
        <Link href={`/s/${s.slug}`} target="_blank"
          className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm hover:border-violet-500">
          쇼핑몰 보기 ↗
        </Link>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-4">
        <h1 className="text-2xl font-bold mb-2">몰 관리</h1>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <div className="text-xs text-neutral-400 mb-1">주소</div>
          <div className="font-mono text-sm break-all">{s.slug}.{root}</div>
          <div className="text-xs text-neutral-500 mt-1">본인 도메인 연결은 추후 지원 예정</div>
        </section>

        <div className="grid gap-4 sm:grid-cols-3">
          <ManageCard title="🎨 디자인" desc={`스킨: ${s.skin}`} soon />
          <Link href={`/dashboard/${s.id}/products`} className="block">
            <ManageCard title="📦 상품" desc={`${count ?? 0}개 등록됨`} action="관리하기 →" />
          </Link>
          <ManageCard title="🧾 주문" desc="결제 연동 후" soon />
        </div>
      </div>
    </main>
  );
}

function ManageCard({ title, desc, soon, action }: { title: string; desc: string; soon?: boolean; action?: string }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 h-full hover:border-violet-500 transition-colors">
      <div className="font-semibold mb-1">{title}</div>
      <div className="text-sm text-neutral-400">{desc}</div>
      {soon && <div className="mt-3 text-xs text-neutral-600">준비중</div>}
      {action && <div className="mt-3 text-xs text-violet-400">{action}</div>}
    </div>
  );
}
