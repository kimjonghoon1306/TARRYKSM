"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// 리뷰 답글 저장/수정 (RLS: 몰 소유자/관리자만)
export async function replyReview(reviewId: string, reply: string) {
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
  const supabase = await createClient();
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
  if (error) return { ok: false, error: "삭제에 실패했어요." };
  revalidatePath("/dashboard/reviews");
  return { ok: true };
}
