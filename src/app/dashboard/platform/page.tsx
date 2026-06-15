import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMe } from "@/lib/role";
import { PRIMARY_DOMAIN } from "@/lib/domains";
import { RoleToggle, StoreAdminControls } from "@/components/PlatformControls";

type Store = {
  id: string;
  name: string;
  slug: string;
  skin: string;
  owner: string | null;
  published: boolean | null;
  created_at: string;
};
type Profile = { id: string; role: string | null; email: string | null };

const won = (n: number) => "₩" + n.toLocaleString("ko-KR");
function fmt(d: string) {
  const t = new Date(d);
  return `${t.getFullYear()}.${String(t.getMonth() + 1).padStart(2, "0")}.${String(t.getDate()).padStart(2, "0")}`;
}

export default async function PlatformPage() {
  const me = await getMe();
  if (me.role !== "admin") redirect("/dashboard");

  const supabase = await createClient();
  const [{ data: storesData }, { data: profilesData }, { data: ordersData }] = await Promise.all([
    supabase
      .from("stores")
      .select("id,name,slug,skin,owner,published,created_at")
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("id,role,email"),
    supabase.from("orders").select("store_id,total,status"),
  ]);
  const stores = (storesData ?? []) as Store[];
  const profiles = (profilesData ?? []) as Profile[];
  const orders = (ordersData ?? []) as { store_id: string; total: number; status: string }[];

  const admins = profiles.filter((p) => p.role === "admin").length;
  const founders = profiles.length - admins;

  // 플랫폼 전체 매출/주문 (취소 제외)
  const paid = orders.filter((o) => o.status !== "취소");
  const gmv = paid.reduce((s, o) => s + (o.total || 0), 0);
  const newOrders = orders.filter((o) => o.status === "신규").length;

  // 몰별 주문 수
  const ordersByStore = new Map<string, number>();
  orders.forEach((o) => ordersByStore.set(o.store_id, (ordersByStore.get(o.store_id) || 0) + 1));
  // 회원별 몰 수
  const storesByOwner = new Map<string, number>();
  stores.forEach((s) => s.owner && storesByOwner.set(s.owner, (storesByOwner.get(s.owner) || 0) + 1));

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
      <p className="mt-1 text-sm text-neutral-500">모든 회원과 쇼핑몰·매출을 총괄하고 직접 제어합니다</p>

      {/* 지표 */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <div className={card}>
          <div className="text-xl font-bold sm:text-2xl">{profiles.length}</div>
          <div className="mt-1 text-xs text-neutral-500">전체 회원</div>
        </div>
        <div className={card}>
          <div className="text-xl font-bold sm:text-2xl">{founders}</div>
          <div className="mt-1 text-xs text-neutral-500">창업자</div>
        </div>
        <div className={card}>
          <div className="text-xl font-bold sm:text-2xl">{stores.length}</div>
          <div className="mt-1 text-xs text-neutral-500">전체 쇼핑몰</div>
        </div>
        <div className={card}>
          <div className="text-xl font-bold text-violet-500 sm:text-2xl">{won(gmv)}</div>
          <div className="mt-1 text-xs text-neutral-500">💰 전체 거래액</div>
        </div>
        <div className={card + " col-span-2 lg:col-span-1"}>
          <div className="text-xl font-bold sm:text-2xl">{newOrders}</div>
          <div className="mt-1 text-xs text-neutral-500">🧾 새 주문</div>
        </div>
      </div>

      {/* 회원 관리 */}
      <h2 className="mb-3 mt-8 text-lg font-semibold">회원 관리 ({profiles.length})</h2>
      {profiles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/10 py-10 text-center text-sm text-neutral-400 dark:border-white/10">
          회원이 없거나, 관리자 권한 RLS가 아직 적용되지 않았어요 (<code>supabase/admin-control.sql</code> 실행 필요).
        </div>
      ) : (
        <div className={card + " overflow-x-auto !p-0"}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/5 text-left text-xs text-neutral-500 dark:border-white/10">
                <th className="px-4 py-3 font-semibold">이메일</th>
                <th className="px-4 py-3 text-right font-semibold">쇼핑몰</th>
                <th className="px-4 py-3 text-right font-semibold">역할</th>
              </tr>
            </thead>
            <tbody>
              {profiles
                .sort((a, b) => (a.role === "admin" ? -1 : 1) - (b.role === "admin" ? -1 : 1))
                .map((p) => (
                  <tr key={p.id} className="border-b border-black/[0.03] last:border-0 dark:border-white/[0.05]">
                    <td className="px-4 py-3">{p.email || <span className="text-neutral-400">{p.id.slice(0, 8)}…</span>}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-neutral-500">{storesByOwner.get(p.id) || 0}</td>
                    <td className="px-4 py-3 text-right">
                      <RoleToggle
                        userId={p.id}
                        role={p.role === "admin" ? "admin" : "founder"}
                        isSelf={p.id === me.userId}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 전체 쇼핑몰 */}
      <h2 className="mb-3 mt-8 text-lg font-semibold">전체 쇼핑몰 ({stores.length})</h2>
      {stores.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/10 py-12 text-center text-sm text-neutral-400 dark:border-white/10">
          아직 등록된 쇼핑몰이 없어요.
        </div>
      ) : (
        <div className={card + " overflow-hidden !p-0"}>
          <ul className="divide-y divide-black/5 dark:divide-white/10">
            {stores.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <span className="grid h-9 w-9 flex-none place-items-center rounded-lg bg-black/[0.03] text-xs font-bold dark:bg-white/[0.05]">
                  {s.skin.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{s.name}</div>
                  <div className="truncate text-xs text-neutral-400">
                    {PRIMARY_DOMAIN}/{s.slug} · 주문 {ordersByStore.get(s.id) || 0} · {fmt(s.created_at)}
                  </div>
                </div>
                <Link
                  href={`/${s.slug}`}
                  target="_blank"
                  className="flex-none rounded-lg border border-black/10 px-3 py-1.5 text-xs transition hover:border-violet-500 dark:border-white/15"
                >
                  보기 ↗
                </Link>
                <StoreAdminControls storeId={s.id} published={!!s.published} name={s.name} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-6 text-xs text-neutral-400">
        컨트롤(역할 변경·강제 비공개·삭제)을 쓰려면 <code className="mx-1">supabase/admin-control.sql</code>을 한 번 실행하세요.
        권한은 <code className="mx-1">profiles.role</code> + RLS로 보호됩니다.
      </p>
    </div>
  );
}
