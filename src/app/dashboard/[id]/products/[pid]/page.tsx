import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProduct } from "../actions";
import { listStoreCategories } from "../../categories/actions";
import OptionsEditor from "@/components/OptionsEditor";
import ProductImagePicker from "@/components/ProductImagePicker";
import PriceInput from "@/components/PriceInput";
import { getMe } from "@/lib/role";
import { canUse, requiredPlanName } from "@/lib/plans";

type Product = {
  id: string;
  emoji: string | null;
  image_url: string | null;
  name: string;
  brand: string | null;
  category: string | null;
  price: number;
  compare_at: number | null;
  tag: string | null;
  description: string | null;
  stock: number | null;
  options: { name: string; choices: { label: string; add: number }[] }[] | null;
  variants: { key: string; stock: number }[] | null;
};

const DEFAULT_CATS = ["전체", "식품", "농산물", "수산물", "축산물", "베이커리", "가공·반찬", "패션", "리빙", "뷰티", "액세서리", "테크"];
const INPUT =
  "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 dark:border-white/10 dark:bg-white/[0.04]";

export default async function EditProduct({
  params,
}: {
  params: Promise<{ id: string; pid: string }>;
}) {
  const { id, pid } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("products")
    .select("id,emoji,image_url,name,brand,category,price,compare_at,tag,description,stock,options,variants")
    .eq("id", pid)
    .eq("store_id", id)
    .maybeSingle();
  if (!data) notFound();
  const p = data as Product;
  const me = await getMe();
  const canCompareAt = canUse("compare_at", me.plan, me.role);

  // 몰에서 만든 카테고리(있으면) + 현재 상품 카테고리 보존
  const managed = (await listStoreCategories(id)).map((c) => c.name);
  const base = managed.length ? managed : DEFAULT_CATS;
  const CATS = p.category && !base.includes(p.category) ? [p.category, ...base] : base;

  async function save(formData: FormData) {
    "use server";
    await updateProduct(formData);
    redirect(`/dashboard/${id}/products`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={`/dashboard/${id}/products`} className="text-sm text-neutral-500 hover:text-violet-500">
        ← 상품 목록
      </Link>
      <h1 className="mt-2 text-2xl font-bold sm:text-3xl">상품 수정</h1>

      <form action={save} className="mt-6 grid gap-3 sm:grid-cols-2">
        <input type="hidden" name="store_id" value={id} />
        <input type="hidden" name="id" value={p.id} />

        <div className="sm:col-span-2">
          <Field label="상품 사진">
            <ProductImagePicker initialUrl={p.image_url} />
          </Field>
        </div>

        <Field label="이모지(사진 없을 때 대체)">
          <input name="emoji" defaultValue={p.emoji || "📦"} maxLength={4} className={INPUT} />
        </Field>
        <Field label="상품명 *">
          <input name="name" required defaultValue={p.name} className={INPUT} />
        </Field>
        <Field label="가격(원) *">
          <PriceInput required defaultValue={p.price} className={INPUT} />
        </Field>
        <Field label="정가 (할인 전 가격·선택)">
          {canCompareAt ? (
            <PriceInput name="compare_at" defaultValue={p.compare_at} className={INPUT} />
          ) : (
            <div className="rounded-lg border border-dashed border-amber-400/50 bg-amber-50/60 px-3 py-2 text-xs text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/[0.06] dark:text-amber-300">
              🔒 {requiredPlanName("compare_at")} 요금제부터 — 정가 취소선·할인율 표시
            </div>
          )}
        </Field>
        <Field label="브랜드">
          <input name="brand" defaultValue={p.brand || ""} className={INPUT} />
        </Field>
        <Field label="카테고리">
          <select name="category" defaultValue={p.category || CATS[0]} className={INPUT}>
            {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="태그">
          <input name="tag" defaultValue={p.tag || ""} className={INPUT} />
        </Field>
        <Field label="재고 수량(비우면 무제한)">
          <input name="stock" type="number" min={0} defaultValue={p.stock ?? ""} placeholder="무제한" className={INPUT} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="설명">
            <textarea name="description" rows={3} defaultValue={p.description || ""} className={INPUT} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="옵션 (색상·사이즈 등)">
            <OptionsEditor initial={p.options || []} initialVariants={p.variants || []} />
          </Field>
        </div>
        <div className="flex gap-2 sm:col-span-2">
          <button className="rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-105">
            저장
          </button>
          <Link
            href={`/dashboard/${id}/products`}
            className="rounded-xl border border-black/10 px-5 py-2.5 text-sm transition hover:border-violet-500 dark:border-white/15"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-neutral-500">{label}</span>
      {children}
    </label>
  );
}
