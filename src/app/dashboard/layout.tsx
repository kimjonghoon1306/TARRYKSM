import AdminShell from "@/components/AdminShell";
import { getMe } from "@/lib/role";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = await getMe();
  return (
    <AdminShell email={me.email} role={me.role}>
      {children}
    </AdminShell>
  );
}
