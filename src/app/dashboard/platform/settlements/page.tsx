import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMe } from "@/lib/role";

// 플랫폼 수수료율 (정산 = 매출 - 수수료)
const FEE_RATE = 0.03;
const won = (n: number) => "₩" + Math.round(n).toLocaleString("ko-KR");

type Store = { id: string; name: string; owner: string | null };
type Profile = { id: string; email: string | null };

export default async function SettlementsPage() {
  const me = await getMe();
  if (me.role !== "admin") redirect("/dashboard");

  const supabase = await createClient();
  const [{ data: storesData }, { data: profilesData }, { data: ordersData }] = await Promise.all([
    supabase.from("stores").select("id,name,owner"),
    supabase.from("profiles").select("id,email"),
    supabase.from("orders").select("store_id,total,status"),
  ]);
  const stores = (storesData ?? []) as Store[];
  const profiles = (profilesData ?? []) as Profile[];
  const orders = (ordersData ?? []) as { store_id: string; total: number; status: string }[];

  const emailOf = new Map(profiles.map((p) => [p.id, p.email]));
  const storeMeta = new Map(stores.map((s) => [s.id, s]));

  // 창업자(owner)별 집계 — 취소 제외 매출·주문수
  type Row = { owner: string; email: string | null; storeCount: number; orders: number; gmv: number };
  const byOwner = new Map<string, Row>();
  for (const s of stores) {
    if (!s.owner) continue;
    if (!byOwner.has(s.owner))
      byOwner.set(s.owner, { owner: s.owner, email: emailOf.get(s.owner) ?? null, storeCount: 0, orders: 0, gmv: 0 });
    byOwner.get(s.owner)!.storeCount += 1;
  }
  for (const o of orders) {
    const s = storeMeta.get(o.store_id);
    if (!s?.owner) continue;
    const row = byOwner.get(s.owner);
    if (!row) continue;
    row.orders += 1;
    if (o.status !== "취소") row.gmv += o.total || 0;
  }

  const rows = Array.from(byOwner.values()).sort((a, b) => b.gmv - a.gmv);
  const totalGmv = rows.reduce((s, r) => s + r.gmv, 0);
  const totalFee = totalGmv * FEE_RATE;
  const totalPayout = totalGmv - totalFee;

  const card =
    "rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]";

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/dashboard/platform" className="text-sm text-neutral-500 hover:text-violet-500">
        ← 전체 관리
      </Link>
      <div className="mt-2 flex items-center gap-2">
        <h1 className="text-2xl font-bold sm:text-3xl">💰 정산</h1>
        <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-xs font-bold text-violet-600 dark:text-violet-300">
          👑 플랫폼
        </span>
      </div>
      <p className="mt-1 text-sm text-neutral-500">
        창업자별 매출에서 플랫폼 수수료({(FEE_RATE * 100).toFixed(0)}%)를 뺀 정산액입니다. (취소 주문 제외)
      </p>

      {/* 합계 */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className={card}>
          <div className="text-xs text-neutral-500">총 거래액</div>
          <div className="mt-1 text-xl font-bold sm:text-2xl">{won(totalGmv)}</div>
        </div>
        <div className={card}>
          <div className="text-xs text-neutral-500">플랫폼 수수료 ({(FEE_RATE * 100).toFixed(0)}%)</div>
          <div className="mt-1 text-xl font-bold text-violet-500 sm:text-2xl">{won(totalFee)}</div>
        </div>
        <div className={card}>
          <div className="text-xs text-neutral-500">정산 지급액</div>
          <div className="mt-1 text-xl font-bold text-emerald-500 sm:text-2xl">{won(totalPayout)}</div>
        </div>
      </div>

      {/* 창업자별 */}
      <h2 className="mb-3 mt-8 text-lg font-semibold">창업자별 정산 ({rows.length})</h2>
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/10 py-12 text-center text-sm text-neutral-400 dark:border-white/10">
          집계할 매출이 없어요. (주문 테이블·관리자 권한 확인)
        </div>
      ) : (
        <div className={card + " overflow-x-auto !p-0"}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/5 text-left text-xs text-neutral-500 dark:border-white/10">
                <th className="px-4 py-3 font-semibold">창업자</th>
                <th className="px-4 py-3 text-right font-semibold">몰</th>
                <th className="px-4 py-3 text-right font-semibold">주문</th>
                <th className="px-4 py-3 text-right font-semibold">매출</th>
                <th className="px-4 py-3 text-right font-semibold">수수료</th>
                <th className="px-4 py-3 text-right font-semibold">정산액</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const fee = r.gmv * FEE_RATE;
                return (
                  <tr key={r.owner} className="border-b border-black/[0.03] last:border-0 dark:border-white/[0.05]">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/platform/${r.owner}`}
                        className="font-medium text-violet-600 hover:underline dark:text-violet-300"
                      >
                        {r.email || `${r.owner.slice(0, 8)}…`}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-neutral-500">{r.storeCount}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-neutral-500">{r.orders}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{won(r.gmv)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-violet-500">{won(fee)}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-emerald-500">
                      {won(r.gmv - fee)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 text-xs text-neutral-400">
        실제 송금은 수동으로 진행돼요. 정산 기준일·자동 송금은 추후 도입 예정입니다.
      </p>
    </div>
  );
}
