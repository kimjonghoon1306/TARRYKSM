import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProduct } from "../actions";

type Product = {
  id: string;
  emoji: string | null;
  image_url: string | null;
  name: string;
  brand: string | null;
  category: string | null;
  price: number;
  tag: string | null;
  description: string | null;
};

const CATS = ["전체", "패션", "리빙", "뷰티", "액세서리", "테크"];
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
    .select("id,emoji,image_url,name,brand,category,price,tag,description")
    .eq("id", pid)
    .eq("store_id", id)
    .maybeSingle();
  if (!data) notFound();
  const p = data as Product;

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
            <div className="flex items-center gap-3">
              <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-black/[0.04] text-2xl dark:bg-white/[0.06]">
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  p.emoji || "📦"
                )}
              </div>
              <div className="flex-1">
                <input name="image" type="file" accept="image/*"
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-neutral-600 outline-none file:mr-3 file:rounded-md file:border-0 file:bg-violet-500 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-300" />
                {p.image_url && (
                  <label className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
                    <input type="checkbox" name="remove_image" value="1" /> 현재 사진 제거(이모지로 대체)
                  </label>
                )}
              </div>
            </div>
          </Field>
        </div>

        <Field label="이모지(사진 없을 때 대체)">
          <input name="emoji" defaultValue={p.emoji || "📦"} maxLength={4} className={INPUT} />
        </Field>
        <Field label="상품명 *">
          <input name="name" required defaultValue={p.name} className={INPUT} />
        </Field>
        <Field label="가격(원) *">
          <input name="price" type="number" min={0} required defaultValue={p.price} className={INPUT} />
        </Field>
        <Field label="브랜드">
          <input name="brand" defaultValue={p.brand || ""} className={INPUT} />
        </Field>
        <Field label="카테고리">
          <select name="category" defaultValue={p.category || "전체"} className={INPUT}>
            {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="태그">
          <input name="tag" defaultValue={p.tag || ""} className={INPUT} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="설명">
            <textarea name="description" rows={3} defaultValue={p.description || ""} className={INPUT} />
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
