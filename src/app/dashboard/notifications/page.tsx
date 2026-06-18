import { createClient } from "@/lib/supabase/server";
import { fetchNotifications } from "@/lib/notifications";
import NotificationList from "@/components/NotificationList";
import { currentUser } from "@/lib/auth";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const user = await currentUser();

  const card =
    "rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]";

  if (!user)
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold sm:text-3xl">🔔 알림</h1>
        <div className={card + " mt-6 text-center text-sm text-neutral-500"}>
          로그인하면 내 쇼핑몰의 알림을 볼 수 있어요.
        </div>
      </div>
    );

  const { items, missing } = await fetchNotifications(supabase, 50);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold sm:text-3xl">🔔 알림</h1>
      <p className="mt-1 text-sm text-neutral-500">새 주문·리뷰가 들어오면 여기에서 바로 확인하세요.</p>
      {missing ? (
        <div className={card + " mt-6 text-center text-sm text-neutral-500"}>
          알림 기능을 켜려면 <code className="font-mono">supabase/notifications.sql</code>을 한 번 실행해 주세요.
        </div>
      ) : (
        <NotificationList items={items} />
      )}
    </div>
  );
}
