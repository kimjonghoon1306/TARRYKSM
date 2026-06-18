"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type StoreCat = { id: string; name: string; position: number };

// 몰 카테고리 목록 (순서대로). store-categories.sql 미실행이면 빈 배열.
export async function listStoreCategories(storeId: string): Promise<StoreCat[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("store_categories")
    .select("id,name,position")
    .eq("store_id", storeId)
    .order("position", { ascending: true });
  return (data as StoreCat[] | null) ?? [];
}

function rv(storeId: string) {
  revalidatePath(`/dashboard/${storeId}`);
  revalidatePath(`/dashboard/${storeId}/products`);
}

export async function addStoreCategory(storeId: string, name: string): Promise<{ ok: boolean; error?: string }> {
  const n = (name || "").trim();
  if (!n) return { ok: false, error: "카테고리 이름을 입력해 주세요." };
  if (n.length > 20) return { ok: false, error: "카테고리 이름이 너무 길어요(20자 이내)." };
  const supabase = await createClient();
  const { data: maxRow } = await supabase
    .from("store_categories").select("position").eq("store_id", storeId)
    .order("position", { ascending: false }).limit(1).maybeSingle();
  const pos = (maxRow?.position ?? -1) + 1;
  const { error } = await supabase.from("store_categories").insert({ store_id: storeId, name: n, position: pos });
  if (error) return { ok: false, error: error.code === "23505" ? "이미 있는 카테고리예요." : "추가에 실패했어요. (카테고리 SQL 실행/권한 확인)" };
  rv(storeId);
  return { ok: true };
}

export async function renameStoreCategory(storeId: string, id: string, name: string): Promise<{ ok: boolean; error?: string }> {
  const n = (name || "").trim();
  if (!n) return { ok: false, error: "이름을 입력해 주세요." };
  const supabase = await createClient();
  const { error } = await supabase.from("store_categories").update({ name: n }).eq("id", id).eq("store_id", storeId);
  if (error) return { ok: false, error: error.code === "23505" ? "이미 있는 카테고리예요." : "수정에 실패했어요." };
  rv(storeId);
  return { ok: true };
}

export async function deleteStoreCategory(storeId: string, id: string): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  await supabase.from("store_categories").delete().eq("id", id).eq("store_id", storeId);
  rv(storeId);
  return { ok: true };
}

// 순서 이동 (이웃과 position 교환)
export async function moveStoreCategory(storeId: string, id: string, dir: -1 | 1): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const list = await listStoreCategories(storeId);
  const idx = list.findIndex((c) => c.id === id);
  const j = idx + dir;
  if (idx < 0 || j < 0 || j >= list.length) return { ok: false };
  const a = list[idx], b = list[j];
  await Promise.all([
    supabase.from("store_categories").update({ position: b.position }).eq("id", a.id),
    supabase.from("store_categories").update({ position: a.position }).eq("id", b.id),
  ]);
  rv(storeId);
  return { ok: true };
}
