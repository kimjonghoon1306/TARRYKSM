import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CouponManager, { type Coupon } from "@/components/CouponManager";

export default async function CouponsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: store } = await supabase.from("stores").select("id,name").eq("id", id).maybeSingle();
  if (!store) notFound();

  let coupons: Coupon[] = [];
  let tableMissing = false;
  const { data, error } = await supabase
    .from("coupons")
    .select("id,code,kind,value,min_order,max_uses,used_count,active,expires_at")
    .eq("store_id", id)
    .order("created_at", { ascending: false });
  if (error) tableMissing = true;
  else coupons = (data ?? []) as Coupon[];

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={`/dashboard/${id}`} className="text-sm text-neutral-500 hover:text-violet-500">
        ← {store.name} 관리
      </Link>
      <h1 className="mt-2 text-2xl font-bold sm:text-3xl">🎟️ 쿠폰</h1>
      <p className="mt-1 text-sm text-neutral-500">할인 코드를 발급하면 손님이 주문할 때 입력해 할인받아요.</p>

      {tableMissing ? (
        <div className="mt-6 rounded-2xl border border-black/5 bg-white p-5 text-center text-sm text-neutral-500 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
          쿠폰 기능을 켜려면 <code className="font-mono">supabase/coupons.sql</code>을 한 번 실행해 주세요.
        </div>
      ) : (
        <div className="mt-6">
          <CouponManager storeId={id} coupons={coupons} />
        </div>
      )}
    </div>
  );
}
