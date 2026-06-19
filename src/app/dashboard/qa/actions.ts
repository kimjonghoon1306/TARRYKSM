"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// 문의 답변 저장/수정 (RLS: 몰 소유자/관리자만)
export async function answerQuestion(questionId: string, answer: string) {
  const supabase = await createClient();
  const text = (answer || "").trim().slice(0, 1000);
  const { error } = await supabase
    .from("product_questions")
    .update({ answer: text || null, answered_at: text ? new Date().toISOString() : null })
    .eq("id", questionId);
  if (error) return { ok: false, error: "답변 저장에 실패했어요." };
  revalidatePath("/dashboard/qa");
  return { ok: true };
}

// 문의 삭제 (RLS: 몰 소유자/관리자만)
export async function deleteQuestion(questionId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("product_questions").delete().eq("id", questionId);
  if (error) return { ok: false, error: "삭제에 실패했어요." };
  revalidatePath("/dashboard/qa");
  return { ok: true };
}
