import { createClient } from "@/lib/supabase/server";
import { getMe } from "@/lib/role";
import { planOf } from "@/lib/plans";
import PlansGrid from "@/components/PlansGrid";

export default async function PlanPage() {
  const me = await getMe();
  const supabase = await createClient();
  let storeCount = 0;
  if (me.userId) {
    const { count } = await supabase
      .from("stores")
      .select("id", { count: "exact", head: true })
      .eq("owner", me.userId);
    storeCount = count ?? 0;
  }
  const current = planOf(me.role, me.plan);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold sm:text-3xl">요금제</h1>
      <p className="mt-1 text-sm text-neutral-500">
        현재 플랜: <b className="text-violet-500">{current.name}</b> · 쇼핑몰 {storeCount}
        {current.maxStores === Infinity ? "" : ` / ${current.maxStores}`}개 사용 중
      </p>

      <div className="mt-6">
        <PlansGrid currentId={current.id} currentPrice={current.price} />
      </div>
    </div>
  );
}
