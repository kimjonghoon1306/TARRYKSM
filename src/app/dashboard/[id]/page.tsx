import Link from "next/link";
import { notFound } from "next/navigation";
import { domainToUnicode } from "node:url";
import { createClient } from "@/lib/supabase/server";
import { setStoreDomain, togglePublish, setStoreSlug } from "../actions";
import { PRIMARY_DOMAIN } from "@/lib/domains";
import DomainHelp from "@/components/DomainHelp";
import BrandingForm from "@/components/BrandingForm";
import BrandingTutorial from "@/components/BrandingTutorial";

type Store = {
  id: string;
  name: string;
  skin: string;
  slug: string;
  published: boolean;
  custom_domain: string | null;
  logo_url: string | null;
  hero_image_url: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
};

export default async function StoreAdmin({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ dmsg?: string; derr?: string; smsg?: string; serr?: string; brmsg?: string }>;
}) {
  const { id } = await params;
  const { dmsg, derr, smsg, serr, brmsg } = await searchParams;
  const supabase = await createClient();
  const { data: store } = await supabase
    .from("stores")
    .select("id,name,skin,slug,published,custom_domain,logo_url,hero_image_url,hero_title,hero_subtitle")
    .eq("id", id)
    .maybeSingle();
  if (!store) notFound();
  const s = store as Store;

  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("store_id", id);

  // 이 몰의 주문 수 (orders 테이블 없으면 null)
  const { count: orderCount } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("store_id", id);

  // 미리보기용 상품 썸네일 몇 개
  const { data: preview } = await supabase
    .from("products")
    .select("id,emoji,image_url,name")
    .eq("store_id", id)
    .order("created_at", { ascending: false })
    .limit(5);
  const previewItems = (preview ?? []) as {
    id: string;
    emoji: string | null;
    image_url: string | null;
    name: string;
  }[];

  const card =
    "rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]";

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/dashboard/stores" className="text-sm text-neutral-500 hover:text-violet-500">
        ← 쇼핑몰
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold sm:text-3xl">{s.name}</h1>
        <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-xs text-violet-500 dark:text-violet-300">
          {s.skin}
        </span>
        <Link
          href={`/${s.slug}`}
          target="_blank"
          className="ml-auto rounded-lg border border-black/10 px-3 py-1.5 text-sm transition hover:border-violet-500 dark:border-white/15"
        >
          쇼핑몰 보기 ↗
        </Link>
      </div>

      {/* 발행 상태 */}
      <section className={card + " mt-6 flex flex-wrap items-center justify-between gap-3"}>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">
              {s.published ? "🟢 발행됨" : "⚪ 비공개"}
            </span>
            <span className="text-xs text-neutral-400">
              {s.published ? "고객이 접속할 수 있어요" : "발행해야 고객에게 보입니다"}
            </span>
          </div>
        </div>
        <form action={togglePublish}>
          <input type="hidden" name="id" value={s.id} />
          <input type="hidden" name="publish" value={s.published ? "0" : "1"} />
          <button
            className={
              "rounded-xl px-4 py-2 text-sm font-semibold transition " +
              (s.published
                ? "border border-black/10 hover:border-rose-400 hover:text-rose-500 dark:border-white/15"
                : "bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg shadow-violet-500/25 hover:brightness-105")
            }
          >
            {s.published ? "비공개로 전환" : "🚀 발행하기"}
          </button>
        </form>
      </section>

      {/* 상단 꾸미기 — 로고·대문배너·제목 */}
      <section className={card + " mt-4"}>
        <h2 className="mb-1 font-semibold">🎨 상단 꾸미기</h2>
        <p className="mb-4 text-xs text-neutral-500">
          내 로고와 대문 배너 이미지, 문구를 넣어 쇼핑몰 첫인상을 꾸미세요.
        </p>
        {brmsg && (
          <p className="mb-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">{brmsg}</p>
        )}
        <BrandingTutorial />
        <BrandingForm
          storeId={s.id}
          storeName={s.name}
          logoUrl={s.logo_url}
          heroUrl={s.hero_image_url}
          heroTitle={s.hero_title}
          heroSubtitle={s.hero_subtitle}
        />
      </section>

      <section className={card + " mt-4"}>
        <div className="mb-2 text-xs font-semibold text-neutral-500">기본 주소 (언제든 변경 가능)</div>
        {smsg && (
          <p className="mb-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">{smsg}</p>
        )}
        {serr && (
          <p className="mb-2 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">{serr}</p>
        )}
        <form action={setStoreSlug} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="id" value={s.id} />
          <div className="min-w-[220px] flex-1">
            <div className="flex items-stretch overflow-hidden rounded-xl border border-black/10 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/25 dark:border-white/10">
              <span className="flex items-center whitespace-nowrap bg-black/[0.04] px-3 text-xs text-neutral-500 dark:bg-white/[0.06]">
                {PRIMARY_DOMAIN}/
              </span>
              <input
                name="slug"
                defaultValue={s.slug}
                pattern="[a-z0-9][a-z0-9\-]{1,29}"
                className="flex-1 bg-white px-3 py-2.5 font-mono text-sm outline-none dark:bg-white/[0.04]"
              />
            </div>
          </div>
          <button className="rounded-xl border border-black/10 px-4 py-2.5 text-sm font-semibold transition hover:border-violet-500 dark:border-white/15">
            주소 변경
          </button>
        </form>
        <p className="mt-1.5 text-xs text-neutral-400">
          영문 소문자·숫자·하이픈. ⚠️ 변경하면 이전 주소로는 접속되지 않아요.
        </p>
      </section>

      {/* 커스텀 도메인 */}
      <section className={card + " mt-4"}>
        <div className="mb-1 flex items-center gap-2">
          <h2 className="font-semibold">🌐 내 도메인 연결</h2>
          <DomainHelp />
        </div>
        <p className="mb-4 text-xs text-neutral-500">
          보유한 도메인을 이 쇼핑몰에 연결하세요. (예: shop.mybrand.com 또는 mybrand.com)
        </p>

        {dmsg && (
          <p className="mb-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">{dmsg}</p>
        )}
        {derr && (
          <p className="mb-3 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">{derr}</p>
        )}

        <form action={setStoreDomain} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="id" value={s.id} />
          <div className="min-w-[220px] flex-1">
            <label className="mb-1.5 block text-xs font-semibold text-neutral-500">도메인</label>
            <input
              name="custom_domain"
              defaultValue={s.custom_domain || ""}
              placeholder="shop.mybrand.com"
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 dark:border-white/10 dark:bg-white/[0.04]"
            />
          </div>
          <button className="rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-105">
            저장
          </button>
        </form>

        {s.custom_domain && (
          <div className="mt-5 rounded-xl border border-black/5 bg-black/[0.02] p-4 text-sm dark:border-white/10 dark:bg-white/[0.03]">
            <div className="mb-2 font-semibold">
              연결됨:{" "}
              <span className="font-mono text-violet-500">{domainToUnicode(s.custom_domain)}</span>
              {domainToUnicode(s.custom_domain) !== s.custom_domain && (
                <span className="ml-2 font-mono text-xs text-neutral-400">({s.custom_domain})</span>
              )}
            </div>
            <p className="mb-3 text-xs text-neutral-500">
              아래 DNS 레코드를 도메인 등록업체(가비아·후이즈·Cloudflare 등)에 추가하면 연결됩니다.
              SSL(https)은 자동 발급돼요.
            </p>
            <div className="space-y-2 font-mono text-xs">
              <div className="rounded-lg bg-black/[0.04] p-3 dark:bg-white/[0.05]">
                <div className="text-neutral-400">서브도메인(shop.mybrand.com)인 경우 — CNAME</div>
                <div>유형 CNAME · 이름 {hostLabel(s.custom_domain)} · 값 cname.vercel-dns.com</div>
              </div>
              <div className="rounded-lg bg-black/[0.04] p-3 dark:bg-white/[0.05]">
                <div className="text-neutral-400">최상위 도메인(mybrand.com)인 경우 — A</div>
                <div>유형 A · 이름 @ · 값 76.76.21.21</div>
              </div>
            </div>
            <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400">
              ✓ 이 도메인은 자동으로 등록됐어요. 위 DNS 레코드만 추가하면 SSL(https)까지 자동 발급됩니다.
            </p>
          </div>
        )}
      </section>

      {/* 상품 관리 — 핵심 (썸네일 미리보기 + 빠른 추가) */}
      <section className={card + " mt-4"}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold">📦 상품</h2>
            <p className="text-xs text-neutral-500">{count ?? 0}개 등록됨</p>
          </div>
          <Link
            href={`/dashboard/${s.id}/products`}
            className="press-glow rounded-lg bg-gradient-to-r from-violet-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-105"
          >
            ＋ 상품 추가·관리
          </Link>
        </div>
        {previewItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-black/10 py-8 text-center text-sm text-neutral-400 dark:border-white/10">
            아직 상품이 없어요. 상품을 추가하면 쇼핑몰에 바로 보여요.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {previewItems.map((p) => (
              <Link
                key={p.id}
                href={`/dashboard/${s.id}/products/${p.id}`}
                className="grid h-14 w-14 place-items-center overflow-hidden rounded-xl border border-black/5 bg-black/[0.03] text-2xl transition hover:border-violet-400 dark:border-white/10 dark:bg-white/[0.05]"
                title={p.name}
              >
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  p.emoji || "📦"
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 대문 구성(섹션 빌더) */}
      <Link
        href={`/dashboard/${s.id}/sections`}
        className={card + " lift mt-4 block transition hover:border-violet-400"}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">🧩 대문 구성</div>
            <div className="text-sm text-neutral-500">배너·상품 선반·텍스트 블록을 쌓아 대문을 직접 만들기</div>
          </div>
          <span className="text-xs font-semibold text-violet-500">구성하기 →</span>
        </div>
      </Link>

      {/* 기타 관리 */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Link href={`/dashboard/${s.id}/design`} className={card + " lift block transition hover:border-violet-400"}>
          <div className="font-semibold">🎨 디자인</div>
          <div className="text-sm text-neutral-500">스킨 변경 (현재: {s.skin})</div>
          <div className="mt-3 text-xs font-semibold text-violet-500">스킨 바꾸기 →</div>
        </Link>
        <Link href="/dashboard/orders" className={card + " lift block transition hover:border-violet-400"}>
          <div className="font-semibold">🧾 주문</div>
          <div className="text-sm text-neutral-500">
            {orderCount ? `${orderCount}건의 주문` : "고객 주문 관리"}
          </div>
          <div className="mt-3 text-xs font-semibold text-violet-500">주문 보기 →</div>
        </Link>
      </div>
    </div>
  );
}

// CNAME 이름 칸에 넣을 라벨 (도메인의 첫 마디). 최상위 도메인이면 '@'.
function hostLabel(domain: string) {
  const parts = domain.split(".");
  return parts.length > 2 ? parts[0] : "@";
}

