import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMe } from "@/lib/role";
import { fetchAllAnnouncements } from "@/lib/announcements";
import AnnouncementManager from "@/components/AnnouncementManager";

export default async function AnnouncementsPage() {
  const me = await getMe();
  if (me.role !== "admin") redirect("/dashboard");

  const supabase = await createClient();
  const { items, missing } = await fetchAllAnnouncements(supabase);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/dashboard/platform" className="text-sm text-neutral-500 hover:text-violet-500">
        ← 전체 관리
      </Link>
      <div className="mt-2 flex items-center gap-2">
        <h1 className="text-2xl font-bold sm:text-3xl">📢 공지</h1>
        <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-xs font-bold text-violet-600 dark:text-violet-300">
          👑 플랫폼
        </span>
      </div>
      <p className="mt-1 text-sm text-neutral-500">창업자 대시보드 상단에 공지가 표시됩니다.</p>

      {missing ? (
        <div className="mt-6 rounded-2xl border border-black/5 bg-white p-5 text-center text-sm text-neutral-500 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
          공지 기능을 켜려면 <code className="font-mono">supabase/announcements.sql</code>을 한 번 실행해 주세요.
        </div>
      ) : (
        <div className="mt-6">
          <AnnouncementManager items={items} />
        </div>
      )}
    </div>
  );
}
