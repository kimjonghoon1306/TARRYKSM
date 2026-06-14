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

// 이미지 파일을 Storage(product-images)에 올리고 공개 URL 반환. 파일 없으면 null.
type SB = Awaited<ReturnType<typeof createClient>>;
async function uploadImage(
  supabase: SB,
  storeId: string,
  file: FormDataEntryValue | null
): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${user.id}/${storeId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });
  if (error) return null;
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function addProduct(formData: FormData) {
  const storeId = String(formData.get("store_id") || "");
  const { supabase, ok } = await assertOwner(storeId);
  if (!ok) return;

  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  const price = parseInt(String(formData.get("price") || "0"), 10) || 0;
  const imageUrl = await uploadImage(supabase, storeId, formData.get("image"));

  await supabase.from("products").insert({
    store_id: storeId,
    name,
    price,
    emoji: String(formData.get("emoji") || "📦").trim() || "📦",
    image_url: imageUrl,
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
  const imageUrl = await uploadImage(supabase, storeId, formData.get("image"));

  const patch: Record<string, unknown> = {
    name,
    price,
    emoji: String(formData.get("emoji") || "📦").trim() || "📦",
    brand: String(formData.get("brand") || "").trim() || null,
    category: String(formData.get("category") || "전체").trim() || "전체",
    tag: String(formData.get("tag") || "").trim() || null,
    description: String(formData.get("description") || "").trim() || null,
  };
  // 새 이미지를 올렸을 때만 교체. "이미지 제거" 체크 시 null.
  if (imageUrl) patch.image_url = imageUrl;
  else if (String(formData.get("remove_image") || "") === "1") patch.image_url = null;

  await supabase.from("products").update(patch).eq("id", id).eq("store_id", storeId);
  revalidatePath(`/dashboard/${storeId}/products`);
  revalidatePath(`/s`);
}

export async function deleteProduct(formData: FormData) {
  const storeId = String(formData.get("store_id") || "");
  const id = String(formData.get("id") || "");
  const { supabase, ok } = await assertOwner(storeId);
  if (!ok || !id) return;
  await supabase.from("products").delete().eq("id", id).eq("store_id", storeId);
  revalidatePath(`/dashboard/${storeId}/products`);
}
