import AdminShell from "@/components/AdminShell";
import OnBot from "@/components/OnBot";
import { getMe } from "@/lib/role";
import { createClient } from "@/lib/supabase/server";
import { fetchNotifications } from "@/lib/notifications";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = await getMe();
  let unread = 0;
  if (me.userId) {
    const supabase = await createClient();
    ({ unread } = await fetchNotifications(supabase, 30));
  }
  return (
    <>
      <AdminShell email={me.email} role={me.role} unread={unread}>
        {children}
      </AdminShell>
      {/* 창업자 전용 도우미 — 손님 쇼핑몰(/[slug])엔 뜨지 않도록 대시보드에만 둠 */}
      <OnBot />
    </>
  );
}
