import { createClient } from "@/lib/supabase/server";
import QuestionItem, { type DashQuestion } from "@/components/QuestionItem";
import { currentUser } from "@/lib/auth";

export default async function QAPage() {
  const supabase = await createClient();
  const user = await currentUser();

  let questions: DashQuestion[] = [];
  let tableMissing = false;
  if (user) {
    // RLS가 내 몰(소유/관리)의 문의만 돌려줌
    const { data, error } = await supabase
      .from("product_questions")
      .select("id,buyer_name,question,answer,secret,created_at,products(name),stores(name)")
      .order("created_at", { ascending: false });
    if (error) tableMissing = true;
    else questions = (data ?? []) as unknown as DashQuestion[];
  }

  const card =
    "rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]";
  const waiting = questions.filter((q) => !q.answer).length;
  const answered = questions.length - waiting;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold sm:text-3xl">💬 상품 문의</h1>
      <p className="mt-1 text-sm text-neutral-500">손님이 상품에 남긴 질문을 확인하고 답변을 달아보세요.</p>

      {!user ? (
        <div className={card + " mt-6 text-center text-sm text-neutral-500"}>
          로그인하면 내 쇼핑몰의 문의를 볼 수 있어요.
        </div>
      ) : tableMissing ? (
        <div className={card + " mt-6 text-center text-sm text-neutral-500"}>
          문의 기능을 켜려면 <code className="font-mono">supabase/product-qa.sql</code>을 한 번 실행해 주세요.
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className={card}>
              <div className="text-xs text-neutral-500">전체 문의</div>
              <div className="mt-1 text-2xl font-bold">{questions.length}</div>
            </div>
            <div className={card}>
              <div className="text-xs text-neutral-500">답변 대기</div>
              <div className="mt-1 text-2xl font-bold text-amber-500">{waiting}</div>
            </div>
            <div className={card}>
              <div className="text-xs text-neutral-500">답변 완료</div>
              <div className="mt-1 text-2xl font-bold text-violet-500">{answered}</div>
            </div>
          </div>

          {questions.length === 0 ? (
            <div className={card + " mt-4 py-16 text-center"}>
              <div className="text-4xl">💬</div>
              <div className="mt-3 font-semibold">아직 문의가 없어요</div>
              <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500">
                손님이 상품 상세에서 문의를 남기면 여기에 쌓여요.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {questions.map((q) => (
                <QuestionItem key={q.id} q={q} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
