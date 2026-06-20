import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CouponManager, { type Coupon } from "@/components/CouponManager";
import AutoCouponSettings from "@/components/AutoCouponSettings";
import LockedFeature from "@/components/LockedFeature";
import { getActor } from "@/lib/actor";
import { canUse, requiredPlanName } from "@/lib/plans";

export default async function CouponsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: store } = await supabase.from("stores").select("id,name").eq("id", id).maybeSingle();
  if (!store) notFound();

  const me = await getActor();
  const allowed = canUse("coupon", me.plan, me.role);

  let coupons: Coupon[] = [];
  let tableMissing = false;
  const { data, error } = await supabase
    .from("coupons")
    .select("id,code,kind,value,min_order,max_uses,used_count,active,expires_at")
    .eq("store_id", id)
    .order("created_at", { ascending: false });
  if (error) tableMissing = true;
  else coupons = (data ?? []) as Coupon[];

  // 자동쿠폰 설정 안전 조회 (auto-coupon.sql 미실행이면 컬럼 없음 → null)
  const { data: ac } = await supabase.from("stores").select("welcome_coupon,repurchase_coupon").eq("id", id).maybeSingle();
  const auto = (ac ?? {}) as { welcome_coupon?: string | null; repurchase_coupon?: string | null };

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={`/dashboard/${id}`} className="text-sm text-neutral-500 hover:text-violet-500">
        ← {store.name} 관리
      </Link>
      <h1 className="mt-2 text-2xl font-bold sm:text-3xl">🎟️ 쿠폰</h1>
      <p className="mt-1 text-sm text-neutral-500">할인 코드를 발급하면 손님이 주문할 때 입력해 할인받아요.</p>

      {!allowed ? (
        <div className="mt-6">
          <LockedFeature planName={requiredPlanName("coupon")} desc="할인 코드를 발급해 손님에게 할인 혜택을 줄 수 있어요." />
        </div>
      ) : tableMissing ? (
        <div className="mt-6 rounded-2xl border border-black/5 bg-white p-5 text-center text-sm text-neutral-500 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
          쿠폰 기능을 켜려면 <code className="font-mono">supabase/coupons.sql</code>을 한 번 실행해 주세요.
        </div>
      ) : (
        <>
          <div className="mt-6">
            <CouponManager storeId={id} coupons={coupons} />
          </div>
          {/* 자동 쿠폰 발급 */}
          <section className="mt-6 rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
            <h2 className="mb-1 font-semibold">✨ 자동 쿠폰 발급</h2>
            <p className="mb-4 text-xs text-neutral-500">
              위에서 만든 쿠폰을 <b>가입축하·재구매</b> 시 손님에게 자동으로 발급해요. 단골을 만드는 데 좋아요.
            </p>
            <AutoCouponSettings
              storeId={id}
              coupons={coupons.map((c) => ({ id: c.id, code: c.code, kind: c.kind, value: c.value }))}
              welcome={auto.welcome_coupon ?? null}
              repurchase={auto.repurchase_coupon ?? null}
            />
          </section>
        </>
      )}
    </div>
  );
}
