import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { currentUser } from "@/lib/auth";
import { getMe } from "@/lib/role";
import { canUse, requiredPlanName } from "@/lib/plans";
import { setStoreSeo } from "../../actions";
import { SaveButton, SavedToast } from "@/components/SaveBar";
import SeoTutorial from "@/components/SeoTutorial";
import LockedFeature from "@/components/LockedFeature";

export const dynamic = "force-dynamic";

export default async function SeoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ seomsg?: string; seoerr?: string }>;
}) {
  const { id } = await params;
  const { seomsg, seoerr } = await searchParams;
  const supabase = await createClient();

  const { data: store } = await supabase.from("stores").select("id,name,slug,owner").eq("id", id).maybeSingle();
  if (!store) notFound();
  const s = store as { id: string; name: string; slug: string; owner: string | null };
  // 멀티테넌트 격리
  const guard = await currentUser();
  if (!guard || s.owner !== guard.id) notFound();

  const me = await getMe();
  const canSeo = canUse("analytics", me.plan, me.role);

  // SEO 필드 안전 조회 (seo.sql 미실행이면 컬럼 없음)
  let seo: { seo_title?: string | null; seo_desc?: string | null; seo_keywords?: string | null; seo_noindex?: boolean | null } = {};
  try {
    const { data } = await supabase.from("stores").select("seo_title,seo_desc,seo_keywords,seo_noindex").eq("id", id).maybeSingle();
    seo = (data ?? {}) as typeof seo;
  } catch { /* 컬럼 없으면 무시 */ }

  const card = "rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]";
  const inp = "w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 dark:border-white/10 dark:bg-white/[0.04]";

  return (
    <div className="mx-auto max-w-3xl">
      <SavedToast message={seomsg} />
      <Link href={`/dashboard/${id}`} className="text-sm text-neutral-500 hover:text-violet-500">← {s.name} 관리</Link>
      <h1 className="mt-2 text-2xl font-bold sm:text-3xl">🔎 검색 노출 (SEO)</h1>
      <p className="mt-1 text-sm text-neutral-500">
        구글·네이버 검색에 잘 뜨도록 설정하고, 검색엔진에 등록하세요. 발행한 몰은 사이트맵에 자동 등록돼요.
      </p>

      {!canSeo ? (
        <div className="mt-6">
          <LockedFeature planName={requiredPlanName("analytics")} desc="검색 제목·설명·키워드를 정해 구글·네이버 노출을 높일 수 있어요." />
        </div>
      ) : (
        <div className="mt-6">
          {/* 사용 설명 (영상형 튜토리얼 + 서치콘솔 등록 버튼) */}
          <SeoTutorial slug={s.slug} />

          {/* 설정 폼 */}
          <section className={card}>
            <h2 className="mb-4 font-semibold">✏️ 검색 정보 입력</h2>
            {seoerr && <p className="mb-3 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">{seoerr}</p>}
            <form action={setStoreSeo} className="space-y-3">
              <input type="hidden" name="id" value={s.id} />
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-neutral-500">검색 제목</label>
                <input name="seo_title" defaultValue={seo.seo_title || ""} placeholder={`예: ${s.name} — 신선식품 전문몰`} maxLength={60} className={inp} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-neutral-500">검색 설명 (한 줄 소개)</label>
                <textarea name="seo_desc" defaultValue={seo.seo_desc || ""} placeholder="예: 산지직송 제철 과일·채소를 합리적인 가격에 만나보세요." rows={2} maxLength={160} className={inp} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-neutral-500">키워드 (쉼표로 구분)</label>
                <input name="seo_keywords" defaultValue={seo.seo_keywords || ""} placeholder="예: 제철과일, 산지직송, 유기농 채소" maxLength={200} className={inp} />
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" name="seo_noindex" value="1" defaultChecked={seo.seo_noindex === true} />
                검색 노출 끄기 <span className="text-xs text-neutral-400">(체크하면 검색엔진에 안 보여요)</span>
              </label>
              <SaveButton label="검색 설정 저장" />
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
