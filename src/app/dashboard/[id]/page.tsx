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
  const card =
    "rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]";

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/dashboard/stores" className="text-sm text-neutral-500 hover:text-violet-500">
        ← 쇼핑몰
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold sm:text-3xl">{s.name}</h1>
        <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-xs text-violet-500 dark:text-violet-300">
          {s.skin}
        </span>
        <Link
          href={`/s/${s.slug}`}
          target="_blank"
          className="ml-auto rounded-lg border border-black/10 px-3 py-1.5 text-sm transition hover:border-violet-500 dark:border-white/15"
        >
          쇼핑몰 보기 ↗
        </Link>
      </div>

      <section className={card + " mt-6"}>
        <div className="mb-1 text-xs font-semibold text-neutral-500">주소</div>
        <div className="break-all font-mono text-sm">
          {s.slug}.{root}
        </div>
        <div className="mt-1 text-xs text-neutral-400">본인 도메인 연결은 추후 지원 예정</div>
      </section>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <ManageCard title="🎨 디자인" desc={`스킨: ${s.skin}`} soon />
        <Link href={`/dashboard/${s.id}/products`} className="block">
          <ManageCard title="📦 상품" desc={`${count ?? 0}개 등록됨`} action="관리하기 →" />
        </Link>
        <ManageCard title="🧾 주문" desc="결제 연동 후" soon />
      </div>
    </div>
  );
}

function ManageCard({
  title,
  desc,
  soon,
  action,
}: {
  title: string;
  desc: string;
  soon?: boolean;
  action?: string;
}) {
  return (
    <div className="h-full rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition hover:border-violet-400 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="mb-1 font-semibold">{title}</div>
      <div className="text-sm text-neutral-500">{desc}</div>
      {soon && <div className="mt-3 text-xs text-neutral-400">준비중</div>}
      {action && <div className="mt-3 text-xs font-semibold text-violet-500">{action}</div>}
    </div>
  );
}
