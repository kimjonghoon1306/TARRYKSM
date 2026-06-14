import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMe } from "@/lib/role";

type Store = {
  id: string;
  name: string;
  slug: string;
  skin: string;
  owner: string | null;
  created_at: string;
};
type Profile = { id: string; role: string | null };

export default async function PlatformPage() {
  const me = await getMe();
  if (me.role !== "admin") redirect("/dashboard");

  const supabase = await createClient();
  const { data: storesData } = await supabase
    .from("stores")
    .select("id,name,slug,skin,owner,created_at")
    .order("created_at", { ascending: false });
  const stores = (storesData ?? []) as Store[];

  const { data: profilesData } = await supabase.from("profiles").select("id,role");
  const profiles = (profilesData ?? []) as Profile[];

  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
  const admins = profiles.filter((p) => p.role === "admin").length;
  const founders = profiles.length - admins;

  const card =
    "rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]";

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold sm:text-3xl">전체 관리</h1>
        <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-xs font-bold text-violet-600 dark:text-violet-300">
          👑 플랫폼
        </span>
      </div>
      <p className="mt-1 text-sm text-neutral-500">모든 사용자와 쇼핑몰을 총괄합니다</p>

      {/* 지표 */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className={card}>
          <div className="text-2xl font-bold sm:text-3xl">{profiles.length}</div>
          <div className="mt-1 text-xs text-neutral-500">전체 사용자</div>
        </div>
        <div className={card}>
          <div className="text-2xl font-bold sm:text-3xl">{founders}</div>
          <div className="mt-1 text-xs text-neutral-500">창업자</div>
        </div>
        <div className={card}>
          <div className="text-2xl font-bold sm:text-3xl">{stores.length}</div>
          <div className="mt-1 text-xs text-neutral-500">전체 쇼핑몰</div>
        </div>
      </div>

      {/* 전체 쇼핑몰 */}
      <h2 className="mb-4 mt-8 text-lg font-semibold">전체 쇼핑몰 ({stores.length})</h2>
      {stores.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/10 py-12 text-center text-sm text-neutral-400 dark:border-white/10">
          아직 등록된 쇼핑몰이 없어요.
          <div className="mt-2 text-xs">
            (관리자가 전체를 보려면 Supabase에서 admin RLS 정책이 필요합니다 —{" "}
            <code>supabase/admin-role.sql</code>)
          </div>
        </div>
      ) : (
        <div className={card + " overflow-hidden !p-0"}>
          <ul className="divide-y divide-black/5 dark:divide-white/10">
            {stores.map((s) => (
              <li key={s.id} className="flex items-center gap-3 px-5 py-3">
                <span className="grid h-9 w-9 flex-none place-items-center rounded-lg bg-black/[0.03] text-xs font-bold dark:bg-white/[0.05]">
                  {s.skin.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{s.name}</div>
                  <div className="truncate text-xs text-neutral-400">
                    {s.slug}.{root}
                  </div>
                </div>
                <Link
                  href={`/s/${s.slug}`}
                  target="_blank"
                  className="flex-none rounded-lg border border-black/10 px-3 py-1.5 text-xs transition hover:border-violet-500 dark:border-white/15"
                >
                  보기 ↗
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-6 text-xs text-neutral-400">
        창업자는 본인 쇼핑몰만, 플랫폼 관리자는 전체를 봅니다. 권한은 Supabase
        <code className="mx-1">profiles.role</code>로 관리됩니다.
      </p>
    </div>
  );
}
