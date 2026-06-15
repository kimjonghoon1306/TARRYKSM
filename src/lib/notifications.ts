// 알림 조회 헬퍼 — 테이블 없거나 에러면 빈 결과(하위호환)
import type { SupabaseClient } from "@supabase/supabase-js";

export type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
};

// 로그인 사용자의 알림 목록 (RLS가 본인 것만). limit개.
export async function fetchNotifications(
  supabase: SupabaseClient,
  limit = 30
): Promise<{ items: Notification[]; unread: number; missing: boolean }> {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("id,type,title,body,link,read,created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) return { items: [], unread: 0, missing: true };
    const items = (data ?? []) as Notification[];
    return { items, unread: items.filter((n) => !n.read).length, missing: false };
  } catch {
    return { items: [], unread: 0, missing: true };
  }
}
