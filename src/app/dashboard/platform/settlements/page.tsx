import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMe } from "@/lib/role";
import { PRIMARY_DOMAIN } from "@/lib/domains";

// 플랫폼은 결제 대금을 대신 받지 않음(각 창업자 PG로 직접 입금) → 수수료/정산 개념 없음.
// 이 탭은 쇼핑몰별 실시간 매출 현황을 보여준다.
// 확정 매출 = 결제 확인(처리중) 이상만 집계. 신규(미확정)·취소/환불은 실시간 제외.
const CONFIRMED = new Set(["처리중", "배송중", "완료"]);
const won = (n: number) => "₩" + Math.round(n).toLocaleString("ko-KR");

type Store = { id: string; name: string; slug: string; owner: string | null };
type Profile = { id: string; email: string | null };

export default async function StoreRevenuePage() {
  const me = await getMe();
  if (me.role !== "admin") redirect("/dashboard");

  const supabase = await createClient();
  const [{ data: storesData }, { data: profilesData }, { data: ordersData }] = await Promise.all([
    supabase.from("stores").select("id,name,slug,owner"),
    supabase.from("profiles").select("id,email"),
    supabase.from("orders").select("store_id,total,status"),
  ]);
  const stores = (storesData ?? []) as Store[];
  const profiles = (profilesData ?? []) as Profile[];
  const orders = (ordersData ?? []) as { store_id: string; total: number; status: string }[];

  const emailOf = new Map(profiles.map((p) => [p.id, p.email]));

  // 쇼핑몰별 집계 — 매출(취소 제외)·주문수·신규주문
  type Row = {
    id: string;
    name: string;
    slug: string;
    owner: string | null;
    ownerEmail: string | null;
    orders: number;
    newOrders: number;
    gmv: number;
  };
  const byStore = new Map<string, Row>();
  for (const s of stores) {
    byStore.set(s.id, {
      id: s.id,
      name: s.name,
      slug: s.slug,
      owner: s.owner,
      ownerEmail: s.owner ? emailOf.get(s.owner) ?? null : null,
      orders: 0,
      newOrders: 0,
      gmv: 0,
    });
  }
  for (const o of orders) {
    const row = byStore.get(o.store_id);
    if (!row) continue;
    row.orders += 1;
    if (o.status === "신규") row.newOrders += 1; // 미확정(결제 대기)
    if (CONFIRMED.has(o.status)) row.gmv += o.total || 0; // 확정 매출만
  }

  const rows = Array.from(byStore.values()).sort((a, b) => b.gmv - a.gmv);
  const totalGmv = rows.reduce((s, r) => s + r.gmv, 0);
  const totalOrders = rows.reduce((s, r) => s + r.orders, 0);

  const card =
    "rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]";

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/dashboard/platform" className="text-sm text-neutral-500 hover:text-violet-500">
        ← 전체 관리
      </Link>
      <div className="mt-2 flex items-center gap-2">
        <h1 className="text-2xl font-bold sm:text-3xl">📊 쇼핑몰 매출</h1>
        <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-xs font-bold text-violet-600 dark:text-violet-300">
          👑 플랫폼
        </span>
      </div>
      <p className="mt-1 text-sm text-neutral-500">
        쇼핑몰별 실시간 확정 매출입니다. 결제 확인(처리중) 이상만 집계하고, 신규(미확정)·취소/환불은 제외합니다.
      </p>

      {/* 합계 */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className={card}>
          <div className="text-xs text-neutral-500">총 확정 매출</div>
          <div className="mt-1 text-xl font-bold text-violet-500 sm:text-2xl">{won(totalGmv)}</div>
        </div>
        <div className={card}>
          <div className="text-xs text-neutral-500">총 주문</div>
          <div className="mt-1 text-xl font-bold sm:text-2xl">{totalOrders}</div>
        </div>
        <div className={card}>
          <div className="text-xs text-neutral-500">쇼핑몰 수</div>
          <div className="mt-1 text-xl font-bold sm:text-2xl">{rows.length}</div>
        </div>
      </div>

      {/* 쇼핑몰별 매출 */}
      <h2 className="mb-3 mt-8 text-lg font-semibold">쇼핑몰별 매출 ({rows.length})</h2>
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/10 py-12 text-center text-sm text-neutral-400 dark:border-white/10">
          집계할 쇼핑몰·매출이 없어요. (주문 테이블·관리자 권한 확인)
        </div>
      ) : (
        <div className={card + " overflow-x-auto !p-0"}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/5 text-left text-xs text-neutral-500 dark:border-white/10">
                <th className="px-4 py-3 font-semibold">쇼핑몰</th>
                <th className="px-4 py-3 font-semibold">창업자</th>
                <th className="px-4 py-3 text-right font-semibold">주문</th>
                <th className="px-4 py-3 text-right font-semibold">대기</th>
                <th className="px-4 py-3 text-right font-semibold">확정 매출</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-black/[0.03] last:border-0 dark:border-white/[0.05]">
                  <td className="px-4 py-3">
                    <Link
                      href={`/${r.slug}`}
                      target="_blank"
                      className="font-medium text-violet-600 hover:underline dark:text-violet-300"
                    >
                      {r.name}
                    </Link>
                    <div className="text-[11px] text-neutral-400">
                      {PRIMARY_DOMAIN}/{r.slug}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {r.owner ? (
                      <Link
                        href={`/dashboard/platform/${r.owner}`}
                        className="text-neutral-500 hover:text-violet-500 hover:underline"
                      >
                        {r.ownerEmail || `${r.owner.slice(0, 8)}…`}
                      </Link>
                    ) : (
                      <span className="text-neutral-400">미지정</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-500">{r.orders}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-violet-500">{r.newOrders || ""}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">{won(r.gmv)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 text-xs text-neutral-400">
        결제 대금은 각 창업자의 PG로 직접 입금돼요. 플랫폼이 대신 정산·송금하지 않으므로 수수료 차감이 없습니다.
      </p>
    </div>
  );
}
