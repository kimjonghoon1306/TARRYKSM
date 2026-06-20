"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ownsRow } from "@/lib/auth";

// 리뷰 답글 저장/수정 (RLS + owner 2차 검증)
export async function replyReview(reviewId: string, reply: string) {
  if (!(await ownsRow("reviews", reviewId))) return { ok: false, error: "권한이 없어요." };
  const supabase = await createClient();
  const text = (reply || "").trim().slice(0, 1000);
  const { error } = await supabase
    .from("reviews")
    .update({ reply: text || null, replied_at: text ? new Date().toISOString() : null })
    .eq("id", reviewId);
  if (error) return { ok: false, error: "답글 저장에 실패했어요." };
  revalidatePath("/dashboard/reviews");
  return { ok: true };
}

// 리뷰 삭제 (RLS: 몰 소유자/관리자만)
export async function deleteReview(reviewId: string) {
  if (!(await ownsRow("reviews", reviewId))) return { ok: false, error: "권한이 없어요." };
  const supabase = await createClient();
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
  if (error) return { ok: false, error: "삭제에 실패했어요." };
  revalidatePath("/dashboard/reviews");
  return { ok: true };
}
