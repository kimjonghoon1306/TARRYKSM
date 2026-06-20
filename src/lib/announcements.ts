// 공지 조회 헬퍼 — 테이블 없거나 에러면 빈 결과(하위호환)
import type { SupabaseClient } from "@supabase/supabase-js";

export type Announcement = {
  id: string;
  title: string;
  body: string | null;
  pinned: boolean;
  active: boolean;
  popup?: boolean; // 운영자가 전체 창업자에게 모달 팝업으로 띄움
  created_at: string;
};

// 창업자 대시보드 배너용 — 활성 공지만, 고정(pinned) 우선·최신순.
export async function fetchActiveAnnouncements(
  supabase: SupabaseClient,
  limit = 5
): Promise<Announcement[]> {
  try {
    const { data, error } = await supabase
      .from("announcements")
      .select("id,title,body,pinned,active,created_at")
      .eq("active", true)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data as Announcement[];
  } catch {
    return [];
  }
}

// 관리자 관리용 — 전체(비활성 포함). popup 컬럼 없을 수 있어 2단 폴백(하위호환).
export async function fetchAllAnnouncements(
  supabase: SupabaseClient
): Promise<{ items: Announcement[]; missing: boolean }> {
  try {
    const { data, error } = await supabase
      .from("announcements")
      .select("id,title,body,pinned,active,popup,created_at")
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });
    if (!error) return { items: (data ?? []) as Announcement[], missing: false };
    // popup 컬럼 미생성(announcement-popup.sql 미실행) → popup 빼고 재시도
    const r = await supabase
      .from("announcements")
      .select("id,title,body,pinned,active,created_at")
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });
    if (r.error) return { items: [], missing: true };
    return { items: ((r.data ?? []) as Announcement[]).map((a) => ({ ...a, popup: false })), missing: false };
  } catch {
    return { items: [], missing: true };
  }
}

// 창업자 전체 팝업용 — 활성 + popup. popup 컬럼/테이블 없으면 빈 배열(하위호환).
export async function fetchPopupAnnouncements(
  supabase: SupabaseClient,
  limit = 3
): Promise<Announcement[]> {
  try {
    const { data, error } = await supabase
      .from("announcements")
      .select("id,title,body,pinned,active,popup,created_at")
      .eq("active", true)
      .eq("popup", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data as Announcement[];
  } catch {
    return [];
  }
}
