import Link from "next/link";
import { notFound } from "next/navigation";
import { domainToUnicode } from "node:url";
import { createClient } from "@/lib/supabase/server";
import { setStoreDomain, togglePublish, setStoreSlug, setStorePayment, setStorePoints, setStoreBusiness } from "../actions";
import { PRIMARY_DOMAIN } from "@/lib/domains";
import DomainHelp from "@/components/DomainHelp";
import BrandingForm from "@/components/BrandingForm";
import StorePreviewButton from "@/components/StorePreviewButton";
import { SaveButton, SavedToast } from "@/components/SaveBar";
import PaymentMethods from "@/components/PaymentMethods";
import PointsSettings from "@/components/PointsSettings";
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
  pay_bank: string | null;
  pay_note: string | null;
  pay_bank_on: boolean | null;
  pay_card_on: boolean | null;
  pay_vbank_on: boolean | null;
  points_on: boolean | null;
  points_rate: number | null;
  footer_text: string | null;
  biz_company: string | null;
  biz_owner: string | null;
  biz_number: string | null;
  biz_mailorder: string | null;
  biz_address: string | null;
  biz_phone: string | null;
  biz_email: string | null;
};

export default async function StoreAdmin({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ dmsg?: string; derr?: string; smsg?: string; serr?: string; brmsg?: string; pmsg?: string; ptmsg?: string }>;
}) {
  const { id } = await params;
  const { dmsg, derr, smsg, serr, brmsg, pmsg, ptmsg } = await searchParams;
  const supabase = await createClient();
  const { data: store } = await supabase
    .from("stores")
    .select("id,name,skin,slug,published,custom_domain,logo_url,hero_image_url,hero_title,hero_subtitle,pay_bank,pay_note,pay_bank_on,pay_card_on,pay_vbank_on,points_on,points_rate,footer_text,biz_company,biz_owner,biz_number,biz_mailorder,biz_address,biz_phone,biz_email")
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
      <SavedToast message={brmsg || pmsg || ptmsg || dmsg || smsg} />
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
        <div className="flex flex-wrap items-center gap-2">
          <StorePreviewButton storeId={s.id} />
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
        </div>
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
          skin={s.skin}
          logoUrl={s.logo_url}
          heroUrl={s.hero_image_url}
          heroTitle={s.hero_title}
          heroSubtitle={s.hero_subtitle}
          footerText={s.footer_text}
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
          <SaveButton label="저장" />
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

      {/* 결제 설정 */}
      <section className={card + " mt-4"}>
        <h2 className="mb-1 font-semibold">💳 결제 설정</h2>
        <p className="mb-4 text-xs text-neutral-500">
          손님이 주문할 때 안내할 입금 계좌를 넣으세요. 카드결제(PG)는 아래에서 곧 연결할 수 있어요.
        </p>
        {pmsg && (
          <p className="mb-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">{pmsg}</p>
        )}
        <form action={setStorePayment} className="space-y-3">
          <input type="hidden" name="id" value={s.id} />

          {/* 결제 수단 선택 + 안내 */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-neutral-500">손님에게 보여줄 결제 수단 (켜고 끄기)</label>
            <PaymentMethods bankOn={s.pay_bank_on !== false} cardOn={!!s.pay_card_on} vbankOn={!!s.pay_vbank_on} />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-neutral-500">입금 계좌 (무통장입금)</label>
            <input
              name="pay_bank"
              defaultValue={s.pay_bank || ""}
              placeholder="예: 농협 123-4567-8901 (홍길동)"
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 dark:border-white/10 dark:bg-white/[0.04]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-neutral-500">입금 안내 문구 (선택)</label>
            <input
              name="pay_note"
              defaultValue={s.pay_note || ""}
              placeholder="예: 주문 후 24시간 내 입금해 주세요. 입금자명을 주문자와 같게 해주세요."
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 dark:border-white/10 dark:bg-white/[0.04]"
            />
          </div>
          <SaveButton label="결제 설정 저장" />
        </form>

        {/* 카드결제(PG) — 준비중 안내 */}
        <div className="mt-5 rounded-xl border border-dashed border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex items-center gap-2 text-sm font-semibold">💳 카드결제 연결 (PG) <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-300">준비 중</span></div>
          <p className="mt-1.5 text-xs text-neutral-500">
            토스페이먼츠·카카오페이 등 카드결제는 사장님이 본인 PG 계정을 직접 연결하는 방식으로 곧 제공됩니다.
            (아임웹·식스샵과 동일한 방식) 지금은 무통장입금으로 주문을 받을 수 있어요.
          </p>
        </div>
      </section>

      {/* 적립금 설정 */}
      <section className={card + " mt-4"}>
        <h2 className="mb-1 font-semibold">💰 적립금</h2>
        <p className="mb-4 text-xs text-neutral-500">
          주문이 완료되면 손님에게 적립금을 자동으로 쌓아줄 수 있어요. 단골을 만드는 데 좋아요.
        </p>
        {ptmsg && (
          <p className="mb-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">{ptmsg}</p>
        )}
        <form action={setStorePoints} className="space-y-3">
          <input type="hidden" name="id" value={s.id} />
          <PointsSettings on={s.points_on === true} rate={s.points_rate ?? 1} />
          <SaveButton label="적립금 설정 저장" />
        </form>
      </section>

      {/* 사업자 정보 (쇼핑몰 하단 표시) */}
      <section className={card + " mt-4"}>
        <h2 className="mb-1 font-semibold">🏢 사업자 정보 <span className="text-xs font-normal text-neutral-400">(쇼핑몰 맨 아래에 표시)</span></h2>
        <p className="mb-4 text-xs text-neutral-500">
          전자상거래법상 쇼핑몰 하단에 표시해야 하는 정보예요. 입력하면 손님 화면 맨 아래에 자동으로 깔끔하게 표시됩니다. (비우면 표시 안 함)
        </p>
        <form action={setStoreBusiness} className="grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="id" value={s.id} />
          {[
            { k: "biz_company", l: "상호 (상점·법인명)", v: s.biz_company, ph: "예: 온종일팜" },
            { k: "biz_owner", l: "대표자명", v: s.biz_owner, ph: "예: 홍길동" },
            { k: "biz_number", l: "사업자등록번호", v: s.biz_number, ph: "예: 123-45-67890" },
            { k: "biz_mailorder", l: "통신판매업 신고번호", v: s.biz_mailorder, ph: "예: 2026-서울강남-01234" },
            { k: "biz_phone", l: "고객센터 전화", v: s.biz_phone, ph: "예: 1588-0000" },
            { k: "biz_email", l: "이메일", v: s.biz_email, ph: "예: help@shop.com" },
          ].map((f) => (
            <div key={f.k}>
              <label className="mb-1.5 block text-xs font-semibold text-neutral-500">{f.l}</label>
              <input
                name={f.k}
                defaultValue={f.v || ""}
                placeholder={f.ph}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 dark:border-white/10 dark:bg-white/[0.04]"
              />
            </div>
          ))}
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-neutral-500">사업장 주소</label>
            <input
              name="biz_address"
              defaultValue={s.biz_address || ""}
              placeholder="예: 서울특별시 강남구 테헤란로 123, 4층"
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 dark:border-white/10 dark:bg-white/[0.04]"
            />
          </div>
          <div className="sm:col-span-2">
            <SaveButton label="사업자 정보 저장" />
          </div>
        </form>
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
        <Link href={`/dashboard/${s.id}/coupons`} className={card + " lift block transition hover:border-violet-400"}>
          <div className="font-semibold">🎟️ 쿠폰</div>
          <div className="text-sm text-neutral-500">할인 코드 발급·관리</div>
          <div className="mt-3 text-xs font-semibold text-violet-500">쿠폰 관리 →</div>
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

