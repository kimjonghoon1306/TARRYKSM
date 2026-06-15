import { createClient } from "@/lib/supabase/server";
import ReviewItem, { type DashReview } from "@/components/ReviewItem";

export default async function ReviewsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let reviews: DashReview[] = [];
  let tableMissing = false;
  if (user) {
    // RLS가 내 몰(소유/관리)의 리뷰만 돌려줌
    const { data, error } = await supabase
      .from("reviews")
      .select("id,buyer_name,rating,comment,reply,created_at,products(name),stores(name)")
      .order("created_at", { ascending: false });
    if (error) tableMissing = true;
    else reviews = (data ?? []) as unknown as DashReview[];
  }

  const card =
    "rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]";
  const avg = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0;
  const replied = reviews.filter((r) => r.reply).length;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold sm:text-3xl">⭐ 리뷰</h1>
      <p className="mt-1 text-sm text-neutral-500">손님이 남긴 후기를 확인하고 답글을 달아보세요.</p>

      {!user ? (
        <div className={card + " mt-6 text-center text-sm text-neutral-500"}>
          로그인하면 내 쇼핑몰의 리뷰를 볼 수 있어요.
        </div>
      ) : tableMissing ? (
        <div className={card + " mt-6 text-center text-sm text-neutral-500"}>
          리뷰 기능을 켜려면 <code className="font-mono">supabase/reviews.sql</code>을 한 번 실행해 주세요.
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className={card}>
              <div className="text-xs text-neutral-500">전체 리뷰</div>
              <div className="mt-1 text-2xl font-bold">{reviews.length}</div>
            </div>
            <div className={card}>
              <div className="text-xs text-neutral-500">평균 별점</div>
              <div className="mt-1 text-2xl font-bold text-amber-500">{avg ? `★ ${avg}` : "-"}</div>
            </div>
            <div className={card}>
              <div className="text-xs text-neutral-500">답글 단 리뷰</div>
              <div className="mt-1 text-2xl font-bold text-violet-500">{replied}</div>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className={card + " mt-4 py-16 text-center"}>
              <div className="text-4xl">⭐</div>
              <div className="mt-3 font-semibold">아직 리뷰가 없어요</div>
              <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500">
                손님이 상품 상세에서 후기를 남기면 여기에 쌓여요.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {reviews.map((r) => (
                <ReviewItem key={r.id} r={r} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
