"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { SECTION_META, type Section, type SectionConfig, type SectionType } from "@/lib/sections";

// 소유 확인 (RLS가 최종 방어, UX용 선검사)
async function assertOwner(storeId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("stores").select("id").eq("id", storeId).maybeSingle();
  return { supabase, ok: !!data };
}

// 변경 후 스토어프런트/에디터 갱신
function bump(storeId: string) {
  revalidatePath(`/dashboard/${storeId}/sections`);
  revalidatePath("/s", "layout");
}

// 블록 추가 → 생성된 섹션 반환(클라이언트 상태에 바로 추가)
export async function addSection(storeId: string, type: SectionType): Promise<Section | null> {
  const { supabase, ok } = await assertOwner(storeId);
  if (!ok) return null;

  // 맨 아래에 붙임 (현재 최대 position + 1)
  const { data: last } = await supabase
    .from("store_sections")
    .select("position")
    .eq("store_id", storeId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const position = (((last?.position as number) ?? -1) + 1) | 0;
  const config = SECTION_META[type]?.default ?? {};

  const { data, error } = await supabase
    .from("store_sections")
    .insert({ store_id: storeId, type, position, visible: true, config })
    .select("id,type,position,visible,config")
    .maybeSingle();
  if (error || !data) return null;
  bump(storeId);
  return data as Section;
}

export async function updateSectionConfig(
  storeId: string,
  id: string,
  config: SectionConfig
): Promise<boolean> {
  const { supabase, ok } = await assertOwner(storeId);
  if (!ok) return false;
  const { error } = await supabase
    .from("store_sections")
    .update({ config })
    .eq("id", id)
    .eq("store_id", storeId);
  if (!error) bump(storeId);
  return !error;
}

export async function toggleSection(storeId: string, id: string, visible: boolean): Promise<boolean> {
  const { supabase, ok } = await assertOwner(storeId);
  if (!ok) return false;
  const { error } = await supabase
    .from("store_sections")
    .update({ visible })
    .eq("id", id)
    .eq("store_id", storeId);
  if (!error) bump(storeId);
  return !error;
}

export async function deleteSection(storeId: string, id: string): Promise<boolean> {
  const { supabase, ok } = await assertOwner(storeId);
  if (!ok) return false;
  const { error } = await supabase
    .from("store_sections")
    .delete()
    .eq("id", id)
    .eq("store_id", storeId);
  if (!error) bump(storeId);
  return !error;
}

// 드래그 재배치 → 새 순서대로 position 일괄 갱신
export async function reorderSections(storeId: string, ids: string[]): Promise<boolean> {
  const { supabase, ok } = await assertOwner(storeId);
  if (!ok) return false;
  const results = await Promise.all(
    ids.map((id, i) =>
      supabase.from("store_sections").update({ position: i }).eq("id", id).eq("store_id", storeId)
    )
  );
  const failed = results.some((r) => r.error);
  if (!failed) bump(storeId);
  return !failed;
}
