import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { currentUser } from "@/lib/auth";
import { getMe } from "@/lib/role";
import { fetchPlanDates, planStatus } from "@/lib/subscription";
import { SKINS } from "@/lib/skins";
import { PRIMARY_DOMAIN } from "@/lib/domains";
import { fetchActiveAnnouncements } from "@/lib/announcements";
import { setStoreSlug } from "./actions";

type Store = { id: string; name: string; skin: string; slug: string };

export default async function Overview({
  searchParams,
}: {
  searchParams: Promise<{ smsg?: string; serr?: string }>;
}) {
  const { smsg, serr } = await searchParams;
  const supabase = await createClient();
  const user = await currentUser();
  // ⚠️ 멀티테넌트 격리: 반드시 내 소유(owner) 몰만 조회 (발행몰 공개 RLS로 타인 몰 새는 것 방지)
  const { data: stores } = user
    ? await supabase.from("stores").select("id,name,skin,slug").eq("owner", user.id).order("created_at", { ascending: false })
    : { data: [] };
  const list = (stores ?? []) as Store[];

  const storeIds = list.map((s) => s.id);
  let productCount = 0;
  if (storeIds.length) {
    const { count } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .in("store_id", storeIds);
    productCount = count ?? 0;
  }

  // 매출·주문 요약 — ⚠️ 반드시 내 소유 몰(store_id)로 한정.
  // (관리자는 orders RLS가 is_admin()으로 전체를 반환하므로, 본인 대시보드엔 내 몰만. 전 회원 집계는 /dashboard/platform)
  let orders: { total: number; status: string }[] = [];
  if (user && storeIds.length) {
    const { data } = await supabase.from("orders").select("total,status").in("store_id", storeIds);
    if (data) orders = data as { total: number; status: string }[];
  }
  const paidOrders = orders.filter((o) => o.status !== "취소");
  const revenue = paidOrders.reduce((s, o) => s + (o.total || 0), 0);
  const newOrders = orders.filter((o) => o.status === "신규").length;
  const won = (n: number) => "₩" + n.toLocaleString("ko-KR");

  // 플랫폼 공지 (활성만)
  const announcements = user ? await fetchActiveAnnouncements(supabase, 3) : [];

  // 구독 사용기간 — 창업자에게 본문 상단에도 크게(모바일에선 사이드바 배너가 안 보여서)
  const me = user ? await getMe() : null;
  const sub =
    me?.role === "founder" && user ? planStatus((await fetchPlanDates(supabase, user.id)).plan_until) : null;

  const card =
    "rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]";

  const stats = [
    { n: list.length, label: "운영 쇼핑몰", href: "/dashboard/stores" },
    { n: productCount, label: "전체 상품", href: "/dashboard/products" },
    { n: SKINS.length, label: "사용 가능 스킨", href: "/?studio=1" },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold sm:text-3xl">대시보드</h1>
      <p className="mt-1 text-sm text-neutral-500">모든 쇼핑몰을 여기서 만들고 · 수정하고 · 관리하세요</p>

      {/* 구독 사용기간 — 가장 잘 보이는 본문 상단 (창업자만, 만료/임박이면 강조) */}
      {sub?.set && (
        <div
          className={
            "mt-4 flex flex-wrap items-center gap-2 rounded-xl border px-4 py-3 text-sm " +
            (sub.expired
              ? "border-rose-400/50 bg-rose-500/10 text-rose-600 dark:text-rose-300"
              : (sub.days ?? 0) <= 7
                ? "border-amber-400/50 bg-amber-400/10 text-amber-700 dark:text-amber-300"
                : "border-emerald-400/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300")
          }
        >
          <span className="text-lg">📅</span>
          {sub.expired ? (
            <span className="font-bold">
              구독 사용 기간이 만료되었습니다 — 쇼핑몰이 잠겨 손님이 볼 수 없어요. 갱신이 필요합니다.
            </span>
          ) : (
            <span className="font-semibold">
              구독 사용 기간: <b>{sub.label}</b>까지 · {sub.days}일 남음
            </span>
          )}
        </div>
      )}

      {/* 플랫폼 공지 배너 */}
      {announcements.length > 0 && (
        <div className="mt-5 space-y-2">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border border-violet-400/40 bg-violet-500/[0.07] px-4 py-3"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-violet-700 dark:text-violet-200">
                <span>{a.pinned ? "📌" : "📢"}</span>
                {a.title}
              </div>
              {a.body && (
                <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-600 dark:text-neutral-300">
                  {a.body}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {!user && (
        <div className="mt-5 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          둘러보기 모드예요. 쇼핑몰을 만들거나 저장하려면{" "}
          <Link href="/login" className="font-bold underline">로그인</Link>이 필요합니다.
        </div>
      )}

      {smsg && (
        <p className="mt-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">{smsg}</p>
      )}
      {serr && (
        <p className="mt-4 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">{serr}</p>
      )}

      {/* 매출·주문 요약 (실주문 기반) */}
      {user && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Link href="/dashboard/orders" className={card + " lift transition hover:border-violet-400"}>
            <div className="text-2xl font-bold sm:text-3xl">{won(revenue)}</div>
            <div className="mt-1 text-xs text-neutral-500">💰 총 매출 (취소 제외)</div>
          </Link>
          <Link href="/dashboard/orders" className={card + " lift transition hover:border-violet-400"}>
            <div className="text-2xl font-bold text-violet-500 sm:text-3xl">{newOrders}</div>
            <div className="mt-1 text-xs text-neutral-500">🧾 새 주문 (신규)</div>
          </Link>
          <Link href="/dashboard/orders" className={card + " lift col-span-2 transition hover:border-violet-400 sm:col-span-1"}>
            <div className="text-2xl font-bold sm:text-3xl">{orders.length}</div>
            <div className="mt-1 text-xs text-neutral-500">📦 전체 주문</div>
          </Link>
        </div>
      )}

      {/* 요약 통계 */}
      <div className="mt-3 grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className={card + " lift transition hover:border-violet-400"}>
            <div className="text-2xl font-bold sm:text-3xl">{s.n}</div>
            <div className="mt-1 text-xs text-neutral-500">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* 빠른 작업 */}
      <h2 className="mb-3 mt-8 text-lg font-semibold">빠른 작업</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/?studio=1" className={card + " lift transition hover:border-violet-400"}>
          <div className="text-2xl">🎨</div>
          <div className="mt-2 text-sm font-semibold">쇼핑몰 만들기</div>
          <div className="text-xs text-neutral-500">스튜디오에서 스킨 고르고 생성</div>
        </Link>
        <Link href="/dashboard/stores" className={card + " lift transition hover:border-violet-400"}>
          <div className="text-2xl">🏬</div>
          <div className="mt-2 text-sm font-semibold">내 쇼핑몰</div>
          <div className="text-xs text-neutral-500">만든 매장 목록·관리</div>
        </Link>
        <Link href="/dashboard/products" className={card + " lift transition hover:border-violet-400"}>
          <div className="text-2xl">📦</div>
          <div className="mt-2 text-sm font-semibold">상품 관리</div>
          <div className="text-xs text-neutral-500">전체 상품 보기</div>
        </Link>
        <Link href="/dashboard/analytics" className={card + " lift transition hover:border-violet-400"}>
          <div className="text-2xl">📈</div>
          <div className="mt-2 text-sm font-semibold">분석</div>
          <div className="text-xs text-neutral-500">현황 통계</div>
        </Link>
      </div>

      {/* 최근 쇼핑몰 */}
      <div className="mb-3 mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold">최근 쇼핑몰</h2>
        <Link href="/dashboard/stores" className="text-sm text-violet-500 hover:text-violet-400">
          전체 보기 →
        </Link>
      </div>
      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/10 py-16 text-center text-sm text-neutral-400 dark:border-white/10">
          아직 만든 쇼핑몰이 없어요.{" "}
          <Link href="/?studio=1" className="font-semibold text-violet-500 underline">
            스튜디오에서 만들기
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.slice(0, 6).map((s) => (
            <div key={s.id} className={card}>
              <div className="mb-3 flex items-center justify-between">
                <b className="text-lg">{s.name}</b>
                <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-xs text-violet-500 dark:text-violet-300">
                  {s.skin}
                </span>
              </div>
              {/* 주소(슬러그) 바로 수정 */}
              <form action={setStoreSlug} className="mb-3">
                <input type="hidden" name="id" value={s.id} />
                <input type="hidden" name="return" value="dashboard" />
                <label className="mb-1 block text-[11px] font-semibold text-neutral-400">주소 (수정 가능)</label>
                <div className="flex items-stretch overflow-hidden rounded-lg border border-black/10 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/25 dark:border-white/10">
                  <span className="flex items-center whitespace-nowrap bg-black/[0.04] px-2 text-[11px] text-neutral-500 dark:bg-white/[0.06]">
                    {PRIMARY_DOMAIN}/
                  </span>
                  <input
                    name="slug"
                    defaultValue={s.slug}
                    pattern="[a-z0-9][a-z0-9\-]{1,29}"
                    className="w-full min-w-0 bg-white px-2 py-1.5 font-mono text-xs outline-none dark:bg-white/[0.04]"
                  />
                  <button className="whitespace-nowrap bg-violet-500 px-2.5 text-[11px] font-bold text-white">
                    저장
                  </button>
                </div>
              </form>
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/${s.id}`}
                  className="flex-1 rounded-lg border border-black/10 px-3 py-2 text-center text-sm transition hover:border-violet-500 dark:border-white/15"
                >
                  관리
                </Link>
                <Link
                  href={`/${s.slug}`}
                  target="_blank"
                  className="flex-1 rounded-lg border border-black/10 px-3 py-2 text-center text-sm transition hover:border-violet-500 dark:border-white/15"
                >
                  보기 ↗
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
