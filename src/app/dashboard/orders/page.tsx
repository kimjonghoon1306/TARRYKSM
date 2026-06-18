import { createClient } from "@/lib/supabase/server";
import { currentUser } from "@/lib/auth";
import OrderStatusSelect from "@/components/OrderStatusSelect";
import ShippingForm from "@/components/ShippingForm";

type OrderItem = { id: string; name: string; price: number; qty: number };
type Order = {
  id: string;
  store_id: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_email: string | null;
  address: string | null;
  memo: string | null;
  total: number;
  status: string;
  created_at: string;
  courier: string | null;
  tracking_no: string | null;
  stores: { name: string; slug: string } | null;
  order_items: OrderItem[];
};

const won = (n: number) => "₩" + n.toLocaleString("ko-KR");
function fmt(d: string) {
  const t = new Date(d);
  return `${t.getFullYear()}.${String(t.getMonth() + 1).padStart(2, "0")}.${String(t.getDate()).padStart(2, "0")} ${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
}

export default async function OrdersPage() {
  const supabase = await createClient();
  const user = await currentUser();

  let orders: Order[] = [];
  let tableMissing = false;
  if (user) {
    // RLS가 내 몰의 주문만 돌려줌
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id,store_id,buyer_name,buyer_phone,buyer_email,address,memo,total,status,created_at,courier,tracking_no,stores(name,slug),order_items(id,name,price,qty)"
      )
      .order("created_at", { ascending: false });
    if (error) tableMissing = true;
    else orders = (data ?? []) as unknown as Order[];
  }

  const card =
    "rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]";
  const newCount = orders.filter((o) => o.status === "신규").length;
  const revenue = orders.filter((o) => o.status !== "취소").reduce((s, o) => s + o.total, 0);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold sm:text-3xl">🧾 주문</h1>
      <p className="mt-1 text-sm text-neutral-500">고객 주문을 한 곳에서 확인하고 상태를 관리하세요.</p>

      {!user ? (
        <div className={card + " mt-6 text-center text-sm text-neutral-500"}>
          로그인하면 내 쇼핑몰의 주문을 볼 수 있어요.
        </div>
      ) : tableMissing ? (
        <div className={card + " mt-6 text-center text-sm text-neutral-500"}>
          주문 기능을 준비하려면 <code className="font-mono">supabase/orders.sql</code>을 한 번 실행해 주세요.
        </div>
      ) : (
        <>
          {/* 요약 */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className={card}>
              <div className="text-xs text-neutral-500">전체 주문</div>
              <div className="mt-1 text-2xl font-bold">{orders.length}</div>
            </div>
            <div className={card}>
              <div className="text-xs text-neutral-500">새 주문</div>
              <div className="mt-1 text-2xl font-bold text-violet-500">{newCount}</div>
            </div>
            <div className={card + " min-w-0"}>
              <div className="text-xs text-neutral-500">주문 금액(취소 제외)</div>
              <div className="mt-1 break-all text-xl font-bold leading-tight sm:text-2xl">{won(revenue)}</div>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className={card + " mt-4 py-16 text-center"}>
              <div className="text-4xl">🧾</div>
              <div className="mt-3 font-semibold">아직 주문이 없어요</div>
              <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500">
                쇼핑몰을 발행하고 손님이 주문하면 여기에 실시간으로 쌓여요.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {orders.map((o) => (
                <div key={o.id} className={card}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold">{o.buyer_name}</span>
                    <span className="text-sm text-neutral-500">{o.buyer_phone}</span>
                    {o.stores && (
                      <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs text-neutral-500 dark:bg-white/10">
                        {o.stores.name}
                      </span>
                    )}
                    <span className="ml-auto text-xs text-neutral-400">{fmt(o.created_at)}</span>
                    <OrderStatusSelect orderId={o.id} status={o.status} />
                  </div>

                  <div className="mt-3 space-y-1 border-t border-black/5 pt-3 text-sm dark:border-white/10">
                    {o.order_items.map((it) => (
                      <div key={it.id} className="flex justify-between gap-2 text-neutral-600 dark:text-neutral-300">
                        <span>
                          {it.name} <span className="text-neutral-400">× {it.qty}</span>
                        </span>
                        <span className="tabular-nums">{won(it.price * it.qty)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between gap-2 pt-1 font-bold">
                      <span>합계</span>
                      <span className="tabular-nums text-violet-500">{won(o.total)}</span>
                    </div>
                  </div>

                  {(o.address || o.memo || o.buyer_email) && (
                    <div className="mt-3 space-y-0.5 rounded-xl bg-black/[0.02] p-3 text-xs text-neutral-500 dark:bg-white/[0.03]">
                      {o.address && <div>📍 {o.address}</div>}
                      {o.buyer_email && <div>✉️ {o.buyer_email}</div>}
                      {o.memo && <div>📝 {o.memo}</div>}
                    </div>
                  )}

                  <ShippingForm orderId={o.id} courier={o.courier} trackingNo={o.tracking_no} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
