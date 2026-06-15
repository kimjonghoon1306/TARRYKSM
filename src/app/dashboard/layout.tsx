import AdminShell from "@/components/AdminShell";
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
    <AdminShell email={me.email} role={me.role} unread={unread}>
      {children}
    </AdminShell>
  );
}
