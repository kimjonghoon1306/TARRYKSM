"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// 소유 확인: 이 store가 현재 유저 것인지 (RLS가 막지만 UX용 선검사)
async function assertOwner(storeId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stores")
    .select("id")
    .eq("id", storeId)
    .maybeSingle();
  return { supabase, ok: !!data };
}

export async function addProduct(formData: FormData) {
  const storeId = String(formData.get("store_id") || "");
  const { supabase, ok } = await assertOwner(storeId);
  if (!ok) return;

  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  const price = parseInt(String(formData.get("price") || "0"), 10) || 0;

  await supabase.from("products").insert({
    store_id: storeId,
    name,
    price,
    emoji: String(formData.get("emoji") || "📦").trim() || "📦",
    brand: String(formData.get("brand") || "").trim() || null,
    category: String(formData.get("category") || "전체").trim() || "전체",
    tag: String(formData.get("tag") || "").trim() || null,
    description: String(formData.get("description") || "").trim() || null,
  });
  revalidatePath(`/dashboard/${storeId}/products`);
  revalidatePath(`/s`); // 스토어프런트 갱신
}

export async function updateProduct(formData: FormData) {
  const storeId = String(formData.get("store_id") || "");
  const id = String(formData.get("id") || "");
  const { supabase, ok } = await assertOwner(storeId);
  if (!ok || !id) return;

  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  const price = parseInt(String(formData.get("price") || "0"), 10) || 0;

  await supabase
    .from("products")
    .update({
      name,
      price,
      emoji: String(formData.get("emoji") || "📦").trim() || "📦",
      brand: String(formData.get("brand") || "").trim() || null,
      category: String(formData.get("category") || "전체").trim() || "전체",
      tag: String(formData.get("tag") || "").trim() || null,
      description: String(formData.get("description") || "").trim() || null,
    })
    .eq("id", id)
    .eq("store_id", storeId);
  revalidatePath(`/dashboard/${storeId}/products`);
}

export async function deleteProduct(formData: FormData) {
  const storeId = String(formData.get("store_id") || "");
  const id = String(formData.get("id") || "");
  const { supabase, ok } = await assertOwner(storeId);
  if (!ok || !id) return;
  await supabase.from("products").delete().eq("id", id).eq("store_id", storeId);
  revalidatePath(`/dashboard/${storeId}/products`);
}
