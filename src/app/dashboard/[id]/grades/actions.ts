"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type StoreGrade = { id: string; name: string; min_spent: number; discount_pct: number; position: number };

function rv(storeId: string) {
  revalidatePath(`/dashboard/${storeId}`);
}

// 등급 목록 (누적기준 오름차순). grades.sql 미실행이면 빈 배열.
export async function listStoreGrades(storeId: string): Promise<StoreGrade[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("store_grades")
    .select("id,name,min_spent,discount_pct,position")
    .eq("store_id", storeId)
    .order("min_spent", { ascending: true });
  return (data as StoreGrade[] | null) ?? [];
}

// 등급 사용 ON/OFF
export async function setGradesOn(storeId: string, on: boolean): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("stores").update({ grades_on: on }).eq("id", storeId);
  if (error) return { ok: false, error: error.message };
  rv(storeId);
  return { ok: true };
}

export async function addGrade(storeId: string, name: string, minSpent: number, discountPct: number): Promise<{ ok: boolean; error?: string }> {
  const n = (name || "").trim();
  if (!n) return { ok: false, error: "등급 이름을 입력해 주세요." };
  const ms = Math.max(0, Math.trunc(minSpent || 0));
  const dp = Math.max(0, Math.min(100, Math.trunc(discountPct || 0)));
  const supabase = await createClient();
  const { error } = await supabase.from("store_grades").insert({ store_id: storeId, name: n.slice(0, 20), min_spent: ms, discount_pct: dp, position: ms });
  if (error) return { ok: false, error: `추가 실패 [${error.code || "?"}] ${error.message}` };
  rv(storeId);
  return { ok: true };
}

export async function updateGrade(storeId: string, id: string, name: string, minSpent: number, discountPct: number): Promise<{ ok: boolean; error?: string }> {
  const n = (name || "").trim();
  if (!n) return { ok: false, error: "등급 이름을 입력해 주세요." };
  const ms = Math.max(0, Math.trunc(minSpent || 0));
  const dp = Math.max(0, Math.min(100, Math.trunc(discountPct || 0)));
  const supabase = await createClient();
  const { error } = await supabase.from("store_grades").update({ name: n.slice(0, 20), min_spent: ms, discount_pct: dp, position: ms }).eq("id", id).eq("store_id", storeId);
  if (error) return { ok: false, error: "수정 실패: " + error.message };
  rv(storeId);
  return { ok: true };
}

export async function deleteGrade(storeId: string, id: string): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  await supabase.from("store_grades").delete().eq("id", id).eq("store_id", storeId);
  rv(storeId);
  return { ok: true };
}

// 기본 등급 4단계 채우기 (이미 있으면 건너뜀)
export async function seedDefaultGrades(storeId: string): Promise<{ ok: boolean; list?: StoreGrade[]; error?: string }> {
  const supabase = await createClient();
  const existing = await listStoreGrades(storeId);
  if (existing.length > 0) return { ok: true, list: existing };
  const defaults = [
    { name: "일반", min_spent: 0, discount_pct: 0 },
    { name: "실버", min_spent: 50000, discount_pct: 3 },
    { name: "골드", min_spent: 200000, discount_pct: 5 },
    { name: "VIP", min_spent: 500000, discount_pct: 10 },
  ];
  const { error } = await supabase.from("store_grades").insert(defaults.map((d) => ({ store_id: storeId, ...d, position: d.min_spent })));
  if (error) return { ok: false, error: `기본 등급 채우기 실패 [${error.code || "?"}] ${error.message}` };
  rv(storeId);
  return { ok: true, list: await listStoreGrades(storeId) };
}
