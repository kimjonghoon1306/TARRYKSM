import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SkinPicker from "@/components/SkinPicker";

type Store = { id: string; name: string; skin: string; slug: string };

export default async function DesignPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ msg?: string }>;
}) {
  const { id } = await params;
  const { msg } = await searchParams;
  const supabase = await createClient();
  const { data: store } = await supabase
    .from("stores")
    .select("id,name,skin,slug")
    .eq("id", id)
    .maybeSingle();
  if (!store) notFound();
  const s = store as Store;

  return (
    <div className="mx-auto max-w-4xl">
      <Link href={`/dashboard/${s.id}`} className="text-sm text-neutral-500 hover:text-violet-500">
        ← 몰 관리
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold sm:text-3xl">디자인 · 스킨</h1>
        <Link
          href={`/${s.slug}`}
          target="_blank"
          className="ml-auto rounded-lg border border-black/10 px-3 py-1.5 text-sm transition hover:border-violet-500 dark:border-white/15"
        >
          쇼핑몰 보기 ↗
        </Link>
      </div>
      <p className="mt-1 text-sm text-neutral-500">
        클릭 한 번으로 {s.name}의 색·서체·무드가 전부 바뀝니다.
      </p>

      {msg && (
        <p className="mt-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
          {msg}
        </p>
      )}

      <div className="mt-6">
        <SkinPicker storeId={s.id} currentSkin={s.skin} storeName={s.name} />
      </div>
    </div>
  );
}
