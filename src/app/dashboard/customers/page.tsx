import { createClient } from "@/lib/supabase/server";
import { getActor } from "@/lib/actor";
import { listMyCustomers } from "./actions";
import MemberPoints from "@/components/MemberPoints";

type Row = {
  buyer_name: string;
  buyer_phone: string;
  buyer_email: string | null;
  total: number;
  status: string;
  created_at: string;
};
type Customer = {
  name: string;
  phone: string;
  email: string | null;
  orders: number;
  spent: number;
  last: string;
};

const won = (n: number) => "₩" + n.toLocaleString("ko-KR");
function fmt(d: string) {
  const t = new Date(d);
  return `${t.getFullYear()}.${String(t.getMonth() + 1).padStart(2, "0")}.${String(t.getDate()).padStart(2, "0")}`;
}

export default async function CustomersPage() {
  const supabase = await createClient();
  const actor = await getActor();
  const user = actor.userId ? { id: actor.userId } : null;

  let customers: Customer[] = [];
  let tableMissing = false;
  if (user) {
    // ⚠️ 내 소유 몰(store_id)로 한정. 관리자는 orders RLS가 전체를 주므로 본인 고객목록엔 내 몰 손님만.
    const { data: myStores } = await supabase.from("stores").select("id").eq("owner", user.id);
    const storeIds = (myStores ?? []).map((s) => s.id);
    const { data, error } = storeIds.length
      ? await supabase
          .from("orders")
          .select("buyer_name,buyer_phone,buyer_email,total,status,created_at")
          .in("store_id", storeIds)
          .order("created_at", { ascending: false })
      : { data: [], error: null };
    if (error) tableMissing = true;
    else {
      // 연락처 기준으로 고객 묶기
      const map = new Map<string, Customer>();
      for (const r of (data ?? []) as Row[]) {
        const key = r.buyer_phone || r.buyer_email || r.buyer_name;
        const ex = map.get(key);
        const spent = r.status === "취소" ? 0 : r.total;
        if (ex) {
          ex.orders += 1;
          ex.spent += spent;
          if (r.created_at > ex.last) ex.last = r.created_at;
        } else {
          map.set(key, {
            name: r.buyer_name,
            phone: r.buyer_phone,
            email: r.buyer_email,
            orders: 1,
            spent,
            last: r.created_at,
          });
        }
      }
      customers = Array.from(map.values()).sort((a, b) => b.spent - a.spent);
    }
  }

  // 회원(가입한 손님) 적립금 — 주문 집계와 별개로 customers 테이블 기준
  const members = user ? await listMyCustomers() : [];

  const card =
    "rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]";

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold sm:text-3xl">👤 고객</h1>
      <p className="mt-1 text-sm text-neutral-500">주문한 고객을 한눈에 보고, 단골을 찾아보세요.</p>

      {!user ? (
        <div className={card + " mt-6 text-center text-sm text-neutral-500"}>
          로그인하면 내 쇼핑몰의 고객을 볼 수 있어요.
        </div>
      ) : tableMissing ? (
        <div className={card + " mt-6 text-center text-sm text-neutral-500"}>
          주문 기능을 준비하려면 <code className="font-mono">supabase/orders.sql</code>을 한 번 실행해 주세요.
        </div>
      ) : customers.length === 0 ? (
        <div className={card + " mt-6 py-16 text-center"}>
          <div className="text-4xl">👤</div>
          <div className="mt-3 font-semibold">아직 고객이 없어요</div>
          <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500">
            손님이 주문하면 여기에 고객 정보가 모여요.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className={card}>
              <div className="text-xs text-neutral-500">전체 고객</div>
              <div className="mt-1 text-2xl font-bold">{customers.length}</div>
            </div>
            <div className={card}>
              <div className="text-xs text-neutral-500">재구매 고객</div>
              <div className="mt-1 text-2xl font-bold text-violet-500">
                {customers.filter((c) => c.orders >= 2).length}
              </div>
            </div>
            <div className={card + " col-span-2 sm:col-span-1"}>
              <div className="text-xs text-neutral-500">누적 구매액</div>
              <div className="mt-1 text-2xl font-bold">
                {won(customers.reduce((s, c) => s + c.spent, 0))}
              </div>
            </div>
          </div>

          <div className={card + " mt-4 overflow-x-auto p-0"}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/5 text-left text-xs text-neutral-500 dark:border-white/10">
                  <th className="px-4 py-3 font-semibold">고객</th>
                  <th className="px-4 py-3 font-semibold">연락처</th>
                  <th className="px-4 py-3 text-right font-semibold">주문</th>
                  <th className="px-4 py-3 text-right font-semibold">구매액</th>
                  <th className="px-4 py-3 text-right font-semibold">최근</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c, i) => (
                  <tr key={i} className="border-b border-black/[0.03] last:border-0 dark:border-white/[0.05]">
                    <td className="px-4 py-3">
                      <span className="font-semibold">{c.name}</span>
                      {c.orders >= 2 && (
                        <span className="ml-2 rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-bold text-violet-500">
                          단골
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-500">
                      <div>{c.phone}</div>
                      {c.email && <div className="text-xs text-neutral-400">{c.email}</div>}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{c.orders}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-violet-500">
                      {won(c.spent)}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-neutral-400">{fmt(c.last)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 회원 적립금 — 가입 회원별 잔액 + 지급/차감 + 내역 */}
      {user && (
        <>
          <h2 className="mb-1 mt-10 text-lg font-bold">💰 회원 적립금</h2>
          <p className="mb-4 text-sm text-neutral-500">
            회원을 눌러 적립금을 직접 지급·차감하고, 적립·사용 내역을 확인하세요.
          </p>
          <MemberPoints members={members} />
        </>
      )}
    </div>
  );
}
