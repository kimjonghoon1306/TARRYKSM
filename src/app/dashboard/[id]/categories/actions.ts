"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ownsStore } from "@/lib/auth";

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
  if (!(await ownsStore(storeId))) return { ok: false, error: "권한이 없어요." };
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
  if (!(await ownsStore(storeId))) return { ok: false, error: "권한이 없어요." };
  const n = (name || "").trim();
  if (!n) return { ok: false, error: "이름을 입력해 주세요." };
  const supabase = await createClient();
  // 기존 이름 조회 → 상품들도 같이 바꿔주기 위함
  const { data: row } = await supabase.from("store_categories").select("name").eq("id", id).eq("store_id", storeId).maybeSingle();
  const oldName = (row as { name?: string } | null)?.name;
  const { error } = await supabase.from("store_categories").update({ name: n }).eq("id", id).eq("store_id", storeId);
  if (error) return { ok: false, error: error.code === "23505" ? "이미 있는 카테고리예요." : "수정에 실패했어요." };
  // 이 카테고리를 쓰던 상품들의 분류명도 함께 변경 (연동)
  if (oldName && oldName !== n) {
    await supabase.from("products").update({ category: n }).eq("store_id", storeId).eq("category", oldName);
  }
  rv(storeId);
  return { ok: true };
}

export async function deleteStoreCategory(storeId: string, id: string): Promise<{ ok: boolean }> {
  if (!(await ownsStore(storeId))) return { ok: false };
  const supabase = await createClient();
  const { data: row } = await supabase.from("store_categories").select("name").eq("id", id).eq("store_id", storeId).maybeSingle();
  const name = (row as { name?: string } | null)?.name;
  await supabase.from("store_categories").delete().eq("id", id).eq("store_id", storeId);
  // 삭제된 카테고리를 쓰던 상품은 '전체'로 정리 (손님 화면에 빈 카테고리 안 남게)
  if (name) {
    await supabase.from("products").update({ category: "전체" }).eq("store_id", storeId).eq("category", name);
  }
  rv(storeId);
  return { ok: true };
}

// 주어진 이름들을 관리 목록에 추가 (없던 것만). 서버 페이지가 뽑은 기존 상품 카테고리를 받아 시딩.
export async function seedStoreCategories(storeId: string, names: string[]): Promise<StoreCat[]> {
  if (!(await ownsStore(storeId))) return [];
  const clean = [...new Set((names || []).map((n) => (n || "").trim()).filter((n) => n && n !== "전체" && n !== "ALL"))];
  if (!clean.length) return listStoreCategories(storeId);
  const supabase = await createClient();
  const { data: existing } = await supabase.from("store_categories").select("name,position").eq("store_id", storeId);
  const have = new Set((existing as { name: string }[] | null ?? []).map((e) => e.name));
  const toAdd = clean.filter((n) => !have.has(n));
  if (toAdd.length) {
    let pos = ((existing as { position: number }[] | null ?? []).reduce((m, e) => Math.max(m, e.position), -1)) + 1;
    await supabase.from("store_categories").insert(toAdd.map((name) => ({ store_id: storeId, name, position: pos++ })));
    rv(storeId);
  }
  return listStoreCategories(storeId);
}

// 기존 상품들이 이미 쓰던 카테고리를 관리 목록으로 자동 동기화 (없던 것만 추가)
export async function seedCategoriesFromProducts(storeId: string): Promise<StoreCat[]> {
  if (!(await ownsStore(storeId))) return [];
  const supabase = await createClient();
  const { data: prods } = await supabase.from("products").select("category").eq("store_id", storeId);
  const used = [
    ...new Set(
      (prods as { category: string | null }[] | null ?? [])
        .map((p) => (p.category || "").trim())
        .filter((c) => c && c !== "전체" && c !== "ALL")
    ),
  ];
  if (!used.length) return listStoreCategories(storeId);
  const { data: existing } = await supabase.from("store_categories").select("name,position").eq("store_id", storeId);
  const have = new Set((existing as { name: string }[] | null ?? []).map((e) => e.name));
  const toAdd = used.filter((n) => !have.has(n));
  if (toAdd.length) {
    let pos = ((existing as { position: number }[] | null ?? []).reduce((m, e) => Math.max(m, e.position), -1)) + 1;
    await supabase.from("store_categories").insert(toAdd.map((name) => ({ store_id: storeId, name, position: pos++ })));
    rv(storeId);
  }
  return listStoreCategories(storeId);
}

// 순서 이동 (이웃과 position 교환)
export async function moveStoreCategory(storeId: string, id: string, dir: -1 | 1): Promise<{ ok: boolean }> {
  if (!(await ownsStore(storeId))) return { ok: false };
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
