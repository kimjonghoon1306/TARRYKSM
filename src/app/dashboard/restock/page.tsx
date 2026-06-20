import { createClient } from "@/lib/supabase/server";
import { currentUser } from "@/lib/auth";
import { getMe } from "@/lib/role";
import { canUse, requiredPlanName } from "@/lib/plans";
import { type DashRestock } from "@/components/RestockItem";
import RestockGroup from "@/components/RestockGroup";
import LockedFeature from "@/components/LockedFeature";

export const dynamic = "force-dynamic";

export default async function RestockPage() {
  const supabase = await createClient();
  const user = await currentUser();
  const me = await getMe();
  const allowed = canUse("restock", me.plan, me.role);

  let rows: DashRestock[] = [];
  let tableMissing = false;
  if (user && allowed) {
    const { data, error } = await supabase
      .from("restock_requests")
      .select("id,product_id,contact,notified,created_at,products(name),stores(name)")
      .order("created_at", { ascending: false });
    if (error) tableMissing = true;
    else rows = (data ?? []) as unknown as DashRestock[];
  }

  const card = "rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]";
  const waiting = rows.filter((r) => !r.notified).length;

  // 상품별 그룹화 (최신순 유지)
  const groups = new Map<string, { name: string; rows: DashRestock[] }>();
  rows.forEach((r) => {
    const g = groups.get(r.product_id) || { name: r.products?.name || "상품", rows: [] };
    g.rows.push(r);
    groups.set(r.product_id, g);
  });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold sm:text-3xl">🔔 재입고 알림 신청</h1>
      <p className="mt-1 text-sm text-neutral-500">품절 상품에 손님이 남긴 신청이에요. 재입고하면 상품별로 <b>‘입고 알림 보내기’</b>를 누르세요. 손님 화면·팝업에 “입고됐어요”로 떠요.</p>

      {!user ? (
        <div className={card + " mt-6 text-center text-sm text-neutral-500"}>로그인하면 신청 목록을 볼 수 있어요.</div>
      ) : !allowed ? (
        <div className="mt-6">
          <LockedFeature planName={requiredPlanName("restock")} desc="품절 상품에 손님의 재입고 알림을 받고, 입고되면 한 번에 알려줄 수 있어요." />
        </div>
      ) : tableMissing ? (
        <div className={card + " mt-6 text-center text-sm text-neutral-500"}>
          재입고 알림 기능을 켜려면 <code className="font-mono">supabase/restock.sql</code>을 한 번 실행해 주세요.
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className={card}>
              <div className="text-xs text-neutral-500">전체 신청</div>
              <div className="mt-1 text-2xl font-bold">{rows.length}</div>
            </div>
            <div className={card}>
              <div className="text-xs text-neutral-500">알림 대기</div>
              <div className="mt-1 text-2xl font-bold text-amber-500">{waiting}</div>
            </div>
          </div>

          {rows.length === 0 ? (
            <div className={card + " mt-4 py-16 text-center"}>
              <div className="text-4xl">🔔</div>
              <div className="mt-3 font-semibold">아직 재입고 신청이 없어요</div>
              <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500">
                손님이 품절 상품에서 “재입고 알림”을 신청하면 여기에 쌓여요.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {[...groups.entries()].map(([pid, g]) => (
                <RestockGroup key={pid} productId={pid} name={g.name} rows={g.rows} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
