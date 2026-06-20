import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMe } from "@/lib/role";
import { PRIMARY_DOMAIN } from "@/lib/domains";
import { planOf } from "@/lib/plans";
import { fetchPlanDates } from "@/lib/subscription";
import SubscriptionControls from "@/components/SubscriptionControls";

const won = (n: number) => "₩" + n.toLocaleString("ko-KR");
function fmt(d: string) {
  const t = new Date(d);
  return `${t.getFullYear()}.${String(t.getMonth() + 1).padStart(2, "0")}.${String(t.getDate()).padStart(2, "0")}`;
}

type Store = { id: string; name: string; slug: string; published: boolean | null; created_at: string };

export default async function MemberDetail({ params }: { params: Promise<{ uid: string }> }) {
  const me = await getMe();
  if (me.role !== "admin") redirect("/dashboard");
  const { uid } = await params;

  const supabase = await createClient();
  const [{ data: profile }, { data: storesData }] = await Promise.all([
    supabase.from("profiles").select("id,role,email,plan").eq("id", uid).maybeSingle(),
    supabase
      .from("stores")
      .select("id,name,slug,published,created_at")
      .eq("owner", uid)
      .order("created_at", { ascending: false }),
  ]);
  const stores = (storesData ?? []) as Store[];
  const storeIds = stores.map((s) => s.id);

  // 이 회원 몰들의 주문 (admin RLS로 조회 가능)
  let orders: { store_id: string; total: number; status: string }[] = [];
  if (storeIds.length) {
    const { data } = await supabase.from("orders").select("store_id,total,status").in("store_id", storeIds);
    orders = (data ?? []) as typeof orders;
  }
  const paid = orders.filter((o) => o.status !== "취소");
  const gmv = paid.reduce((s, o) => s + (o.total || 0), 0);
  const ordersByStore = new Map<string, number>();
  orders.forEach((o) => ordersByStore.set(o.store_id, (ordersByStore.get(o.store_id) || 0) + 1));

  const role = profile?.role === "admin" ? "admin" : "founder";
  const plan = planOf(role, profile?.plan || "free");
  const planDates = await fetchPlanDates(supabase, uid);

  const card =
    "rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]";

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/dashboard/platform" className="text-sm text-neutral-500 hover:text-violet-500">
        ← 전체 관리
      </Link>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold sm:text-3xl">
          {profile?.email || `${uid.slice(0, 8)}…`}
        </h1>
        <span
          className={
            "rounded-full px-2.5 py-0.5 text-xs font-bold " +
            (role === "admin"
              ? "bg-violet-500/15 text-violet-600 dark:text-violet-300"
              : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300")
          }
        >
          {role === "admin" ? "👑 플랫폼 관리자" : "🏪 창업자"}
        </span>
        <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-xs font-semibold dark:bg-white/10">
          {plan.name} 요금제
        </span>
      </div>

      {!profile && (
        <div className="mt-4 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          프로필 정보를 읽지 못했어요. <code>supabase/admin-control.sql</code> 실행 여부와 관리자 권한을 확인하세요.
        </div>
      )}

      {/* 통계 */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className={card}>
          <div className="text-xs text-neutral-500">쇼핑몰</div>
          <div className="mt-1 text-2xl font-bold">{stores.length}</div>
        </div>
        <div className={card}>
          <div className="text-xs text-neutral-500">총 주문</div>
          <div className="mt-1 text-2xl font-bold">{orders.length}</div>
        </div>
        <div className={card}>
          <div className="text-xs text-neutral-500">💰 거래액(취소 제외)</div>
          <div className="mt-1 text-2xl font-bold text-violet-500">{won(gmv)}</div>
        </div>
      </div>

      {/* 구독 사용 기간 — 창업자만(관리자는 무제한) */}
      {role === "founder" && (
        <div className="mt-6">
          <SubscriptionControls userId={uid} until={planDates.plan_until} />
        </div>
      )}

      {/* 몰 목록 */}
      <h2 className="mb-3 mt-8 text-lg font-semibold">쇼핑몰 ({stores.length})</h2>
      {stores.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/10 py-10 text-center text-sm text-neutral-400 dark:border-white/10">
          이 회원이 만든 쇼핑몰이 없어요.
        </div>
      ) : (
        <div className={card + " overflow-hidden !p-0"}>
          <ul className="divide-y divide-black/5 dark:divide-white/10">
            {stores.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{s.name}</span>
                    <span
                      className={
                        "rounded-full px-2 py-0.5 text-[11px] font-semibold " +
                        (s.published
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                          : "bg-black/5 text-neutral-400 dark:bg-white/10")
                      }
                    >
                      {s.published ? "공개" : "비공개"}
                    </span>
                  </div>
                  <div className="truncate text-xs text-neutral-400">
                    {PRIMARY_DOMAIN}/{s.slug} · 주문 {ordersByStore.get(s.id) || 0} · {fmt(s.created_at)}
                  </div>
                </div>
                <Link
                  href={`/dashboard/${s.id}`}
                  className="flex-none rounded-lg bg-gradient-to-r from-violet-500 to-pink-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-105"
                >
                  관리 대시보드 ↗
                </Link>
                <Link
                  href={`/${s.slug}`}
                  target="_blank"
                  className="flex-none rounded-lg border border-black/10 px-3 py-1.5 text-xs transition hover:border-violet-500 dark:border-white/15"
                >
                  쇼핑몰 보기 ↗
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
