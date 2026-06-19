"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type StoreFaq = { id: string; question: string; answer: string; position: number };

function rv(storeId: string) {
  revalidatePath(`/dashboard/${storeId}`);
}

// 몰 챗봇 FAQ 목록 (순서대로). store-faq.sql 미실행이면 빈 배열.
export async function listStoreFaqs(storeId: string): Promise<StoreFaq[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("store_faqs")
    .select("id,question,answer,position")
    .eq("store_id", storeId)
    .order("position", { ascending: true });
  return (data as StoreFaq[] | null) ?? [];
}

export async function addFaq(storeId: string, question: string, answer: string): Promise<{ ok: boolean; error?: string }> {
  const q = (question || "").trim();
  const a = (answer || "").trim();
  if (!q) return { ok: false, error: "질문을 입력해 주세요." };
  if (!a) return { ok: false, error: "답변을 입력해 주세요." };
  if (q.length > 100) return { ok: false, error: "질문이 너무 길어요(100자 이내)." };
  const supabase = await createClient();
  const { data: maxRow } = await supabase
    .from("store_faqs").select("position").eq("store_id", storeId)
    .order("position", { ascending: false }).limit(1).maybeSingle();
  const pos = (maxRow?.position ?? -1) + 1;
  const { error } = await supabase.from("store_faqs").insert({ store_id: storeId, question: q, answer: a.slice(0, 2000), position: pos });
  if (error) return { ok: false, error: `추가 실패 [${error.code || "?"}] ${error.message}` };
  rv(storeId);
  return { ok: true };
}

export async function updateFaq(storeId: string, id: string, question: string, answer: string): Promise<{ ok: boolean; error?: string }> {
  const q = (question || "").trim();
  const a = (answer || "").trim();
  if (!q) return { ok: false, error: "질문을 입력해 주세요." };
  if (!a) return { ok: false, error: "답변을 입력해 주세요." };
  const supabase = await createClient();
  const { error } = await supabase.from("store_faqs").update({ question: q, answer: a.slice(0, 2000) }).eq("id", id).eq("store_id", storeId);
  if (error) return { ok: false, error: "수정에 실패했어요." };
  rv(storeId);
  return { ok: true };
}

export async function deleteFaq(storeId: string, id: string): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  await supabase.from("store_faqs").delete().eq("id", id).eq("store_id", storeId);
  rv(storeId);
  return { ok: true };
}

// 순서 이동 (이웃과 position 교환)
export async function moveFaq(storeId: string, id: string, dir: -1 | 1): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const list = await listStoreFaqs(storeId);
  const idx = list.findIndex((c) => c.id === id);
  const j = idx + dir;
  if (idx < 0 || j < 0 || j >= list.length) return { ok: false };
  const a = list[idx], b = list[j];
  await Promise.all([
    supabase.from("store_faqs").update({ position: b.position }).eq("id", a.id),
    supabase.from("store_faqs").update({ position: a.position }).eq("id", b.id),
  ]);
  rv(storeId);
  return { ok: true };
}
