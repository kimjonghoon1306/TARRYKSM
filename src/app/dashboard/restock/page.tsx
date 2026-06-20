import { createClient } from "@/lib/supabase/server";
import { currentUser } from "@/lib/auth";
import RestockItem, { type DashRestock } from "@/components/RestockItem";

export const dynamic = "force-dynamic";

export default async function RestockPage() {
  const supabase = await createClient();
  const user = await currentUser();

  let rows: DashRestock[] = [];
  let tableMissing = false;
  if (user) {
    // RLS가 내 몰(소유/관리)의 신청만 돌려줌
    const { data, error } = await supabase
      .from("restock_requests")
      .select("id,contact,notified,created_at,products(name),stores(name)")
      .order("created_at", { ascending: false });
    if (error) tableMissing = true;
    else rows = (data ?? []) as unknown as DashRestock[];
  }

  const card =
    "rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]";
  const waiting = rows.filter((r) => !r.notified).length;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold sm:text-3xl">🔔 재입고 알림 신청</h1>
      <p className="mt-1 text-sm text-neutral-500">품절 상품에 손님이 남긴 재입고 알림 신청이에요. 재입고하면 연락해 주세요.</p>

      {!user ? (
        <div className={card + " mt-6 text-center text-sm text-neutral-500"}>로그인하면 신청 목록을 볼 수 있어요.</div>
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
              <div className="text-xs text-neutral-500">연락 대기</div>
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
            <div className="mt-4 space-y-2">
              {rows.map((r) => (
                <RestockItem key={r.id} r={r} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
