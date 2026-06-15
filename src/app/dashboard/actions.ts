"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { domainToASCII } from "node:url";
import { createClient } from "@/lib/supabase/server";
import { addDomainToVercel, removeDomainFromVercel } from "@/lib/vercel";
import { slugify } from "@/lib/slug";
import { SKIN_IDS } from "@/lib/skins";
import { getMe } from "@/lib/role";
import { planOf } from "@/lib/plans";

export async function createStore(formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("name") || "").trim();
  let skin = String(formData.get("skin") || "mono");
  if (!name) return;
  if (!SKIN_IDS.includes(skin)) skin = "mono";

  // 슬러그 생성 + 유니크 보장
  const base = slugify(name) || "store";
  let slug = base;
  for (let i = 0; i < 6; i++) {
    const { data } = await supabase
      .from("stores")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) break;
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }

  await supabase.from("stores").insert({ name, skin, slug }); // owner = auth.uid() (DB default)
  revalidatePath("/dashboard", "layout");
}

// 스튜디오에서 고른 스킨 + 이름으로 생성 후 그 몰 관리로 이동
export async function createStoreOpen(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") || "").trim();
  let skin = String(formData.get("skin") || "mono");
  if (!SKIN_IDS.includes(skin)) skin = "mono";

  // 창업자가 직접 정한 영문 주소(슬러그). 없으면 이름에서 생성 시도.
  const slugRaw = String(formData.get("slug") || "").trim().toLowerCase();
  const slug = slugify(slugRaw) || slugify(name);

  const back = (msg: string) =>
    redirect(
      `/dashboard/stores/new?skin=${skin}&name=${encodeURIComponent(name)}` +
        `&slug=${encodeURIComponent(slugRaw)}&err=${encodeURIComponent(msg)}`
    );

  if (!name) back("쇼핑몰 이름을 입력하세요");
  // 주소 형식: 영문 소문자/숫자/하이픈, 2~30자
  if (!slug || !/^[a-z0-9][a-z0-9-]{1,29}$/.test(slug)) {
    back("주소는 영문 소문자·숫자·하이픈 2~30자로 입력하세요 (예: myshop)");
  }
  // 예약어 차단 (앱 라우트와 충돌 방지)
  const reserved = ["dashboard", "login", "signup", "s", "find-email", "reset-password", "landing", "api", "auth", "_next"];
  if (reserved.includes(slug)) back("사용할 수 없는 주소예요");

  // 중복 확인
  const { data: dup } = await supabase.from("stores").select("id").eq("slug", slug).maybeSingle();
  if (dup) back("이미 사용 중인 주소예요. 다른 주소를 입력하세요");

  // 요금제별 쇼핑몰 개수 제한
  const me = await getMe();
  const limit = planOf(me.role, me.plan).maxStores;
  const { count } = await supabase
    .from("stores")
    .select("id", { count: "exact", head: true })
    .eq("owner", user.id);
  if ((count ?? 0) >= limit) {
    back(`현재 요금제로는 쇼핑몰 ${limit}개까지 만들 수 있어요. 요금제를 올리면 더 만들 수 있어요.`);
  }

  const { data: created, error } = await supabase
    .from("stores")
    .insert({ name, skin, slug })
    .select("id")
    .single();
  if (error) back(/duplicate|unique/i.test(error.message) ? "이미 사용 중인 주소예요" : "생성 실패");
  revalidatePath("/dashboard", "layout");
  redirect(created?.id ? `/dashboard/${created.id}` : "/dashboard/stores");
}

export async function deleteStore(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") || "");
  if (!id) return;
  await supabase.from("stores").delete().eq("id", id);
  revalidatePath("/dashboard", "layout");
}

// 쇼핑몰 주소(슬러그) 변경 — 언제든지. 형식·예약어·중복 검증.
export async function setStoreSlug(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") || "");
  if (!id) return;
  const slug = slugify(String(formData.get("slug") || "").trim().toLowerCase());
  // 어디서 호출됐는지(대시보드 or 몰관리)에 따라 결과를 그 화면으로 되돌림
  const ret = String(formData.get("return") || "") === "dashboard" ? "/dashboard" : `/dashboard/${id}`;

  const back = (msg: string) =>
    redirect(`${ret}?serr=` + encodeURIComponent(msg));

  if (!slug || !/^[a-z0-9][a-z0-9-]{1,29}$/.test(slug)) {
    back("주소는 영문 소문자·숫자·하이픈 2~30자로 입력하세요 (예: myshop)");
  }
  const reserved = ["dashboard", "login", "signup", "s", "find-email", "reset-password", "landing", "api", "auth", "_next"];
  if (reserved.includes(slug)) back("사용할 수 없는 주소예요");

  // 다른 몰이 이미 쓰는지 (자기 자신 제외)
  const { data: dup } = await supabase
    .from("stores")
    .select("id")
    .eq("slug", slug)
    .neq("id", id)
    .maybeSingle();
  if (dup) back("이미 사용 중인 주소예요. 다른 주소를 입력하세요");

  const { error } = await supabase.from("stores").update({ slug }).eq("id", id);
  if (error) back(/duplicate|unique/i.test(error.message) ? "이미 사용 중인 주소예요" : "변경 실패");
  revalidatePath("/dashboard", "layout");
  redirect(`${ret}?smsg=` + encodeURIComponent("주소를 변경했어요"));
}

// 상단 꾸미기 — 이미지는 브라우저에서 Supabase로 직접 업로드되고, 여기선 URL만 저장
// (Vercel 서버함수 4.5MB 요청한도 우회)
export async function setStoreBranding(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") || "");
  if (!id) return;

  const logoUrl = String(formData.get("logo_url") || "").trim() || null;
  const heroUrl = String(formData.get("hero_url") || "").trim() || null;
  const heroTitle = String(formData.get("hero_title") || "").trim() || null;
  const heroSubtitle = String(formData.get("hero_subtitle") || "").trim() || null;

  await supabase
    .from("stores")
    .update({
      logo_url: logoUrl,
      hero_image_url: heroUrl,
      hero_title: heroTitle,
      hero_subtitle: heroSubtitle,
    })
    .eq("id", id);
  revalidatePath(`/dashboard/${id}`);
  redirect(`/dashboard/${id}?brmsg=` + encodeURIComponent("상단 꾸미기를 저장했어요"));
}

// 이미 만든 몰의 스킨 변경
export async function setStoreSkin(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") || "");
  let skin = String(formData.get("skin") || "");
  if (!id || !SKIN_IDS.includes(skin)) return;
  await supabase.from("stores").update({ skin }).eq("id", id);
  revalidatePath(`/dashboard/${id}`);
  revalidatePath(`/dashboard/${id}/design`);
  redirect(`/dashboard/${id}/design?msg=` + encodeURIComponent("스킨을 변경했어요"));
}

// 발행/비공개 토글 — 발행해야 스토어프런트(서브도메인·커스텀도메인)에 노출됨.
export async function togglePublish(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") || "");
  const next = String(formData.get("publish") || "") === "1";
  if (!id) return;
  await supabase.from("stores").update({ published: next }).eq("id", id);
  revalidatePath(`/dashboard/${id}`);
}

// 결제 설정 — 무통장입금 계좌 + 안내문구 (PG는 추후)
export async function setStorePayment(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") || "");
  if (!id) return;

  const payBank = String(formData.get("pay_bank") || "").trim() || null;
  const payNote = String(formData.get("pay_note") || "").trim() || null;

  await supabase.from("stores").update({ pay_bank: payBank, pay_note: payNote }).eq("id", id);
  revalidatePath(`/dashboard/${id}`);
  redirect(`/dashboard/${id}?pmsg=` + encodeURIComponent("결제 설정을 저장했어요"));
}

// 커스텀 도메인 연결/해제. 입력 정규화(프로토콜·경로·www 제거).
export async function setStoreDomain(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") || "");
  if (!id) return;

  const raw = String(formData.get("custom_domain") || "")
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./, "");

  // 한글 도메인(IDN) → punycode(ASCII). host 헤더가 punycode로 오므로 ASCII로 저장.
  let value: string | null | undefined;
  if (raw === "") {
    value = null; // 비우면 연결 해제
  } else {
    const ascii = domainToASCII(raw).toLowerCase();
    value = ascii && /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(ascii) ? ascii : undefined;
  }
  if (value === undefined) {
    redirect(`/dashboard/${id}?derr=` + encodeURIComponent("도메인 형식이 올바르지 않아요 (예: shop.mybrand.com)"));
  }

  // 기존 도메인 (변경/해제 시 Vercel에서 제거용)
  const { data: prev } = await supabase
    .from("stores")
    .select("custom_domain")
    .eq("id", id)
    .maybeSingle();
  const oldDomain = (prev?.custom_domain as string | null) || null;

  const { error } = await supabase
    .from("stores")
    .update({ custom_domain: value })
    .eq("id", id);
  if (error) {
    const msg = /duplicate|unique/i.test(error.message)
      ? "이미 다른 쇼핑몰에 연결된 도메인이에요"
      : error.message;
    redirect(`/dashboard/${id}?derr=` + encodeURIComponent(msg));
  }

  // ── Vercel 자동 등록/해제 ──
  let note = value ? "도메인을 저장했어요" : "도메인 연결을 해제했어요";
  if (oldDomain && oldDomain !== value) {
    await removeDomainFromVercel(oldDomain);
  }
  if (value) {
    const r = await addDomainToVercel(value);
    if (r.ok) {
      note = r.verified
        ? "도메인 연결 완료! (Vercel 등록됨)"
        : "도메인 저장됨. 안내된 DNS 레코드를 추가하면 자동 연결돼요";
    } else if (r.error === "no-token") {
      note = "도메인 저장됨 (Vercel 자동등록 미설정 — 수동 등록 필요)";
    } else {
      note = "도메인 저장됨. Vercel 등록 실패: " + r.error;
    }
  }

  revalidatePath(`/dashboard/${id}`);
  redirect(`/dashboard/${id}?dmsg=` + encodeURIComponent(note));
}
