import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProduct } from "../actions";

type Product = {
  id: string;
  emoji: string | null;
  name: string;
  brand: string | null;
  category: string | null;
  price: number;
  tag: string | null;
  description: string | null;
};

const CATS = ["전체", "패션", "리빙", "뷰티", "액세서리", "테크"];

export default async function EditProduct({
  params,
}: {
  params: Promise<{ id: string; pid: string }>;
}) {
  const { id, pid } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("products")
    .select("id,emoji,name,brand,category,price,tag,description")
    .eq("id", pid)
    .eq("store_id", id)
    .maybeSingle();
  if (!data) notFound();
  const p = data as Product;

  // 저장 후 목록으로 복귀하는 래퍼
  async function save(formData: FormData) {
    "use server";
    await updateProduct(formData);
    redirect(`/dashboard/${id}/products`);
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="flex items-center gap-3 px-6 py-4 border-b border-neutral-800">
        <Link href={`/dashboard/${id}/products`} className="text-neutral-400 hover:text-neutral-100 text-sm">← 상품 목록</Link>
        <b className="text-lg">상품 수정</b>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <form action={save} className="grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="store_id" value={id} />
          <input type="hidden" name="id" value={p.id} />
          <Field label="이모지">
            <input name="emoji" defaultValue={p.emoji || "📦"} maxLength={4}
              className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm outline-none focus:border-violet-500" />
          </Field>
          <Field label="상품명 *">
            <input name="name" required defaultValue={p.name}
              className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm outline-none focus:border-violet-500" />
          </Field>
          <Field label="가격(원) *">
            <input name="price" type="number" min={0} required defaultValue={p.price}
              className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm outline-none focus:border-violet-500" />
          </Field>
          <Field label="브랜드">
            <input name="brand" defaultValue={p.brand || ""}
              className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm outline-none focus:border-violet-500" />
          </Field>
          <Field label="카테고리">
            <select name="category" defaultValue={p.category || "전체"}
              className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm outline-none focus:border-violet-500">
              {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="태그">
            <input name="tag" defaultValue={p.tag || ""}
              className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm outline-none focus:border-violet-500" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="설명">
              <textarea name="description" rows={3} defaultValue={p.description || ""}
                className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm outline-none focus:border-violet-500" />
            </Field>
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <button className="rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 px-5 py-2.5 font-semibold text-sm">저장</button>
            <Link href={`/dashboard/${id}/products`}
              className="rounded-xl border border-neutral-700 px-5 py-2.5 text-sm">취소</Link>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs text-neutral-400 mb-1.5">{label}</span>
      {children}
    </label>
  );
}
