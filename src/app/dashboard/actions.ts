"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { domainToASCII } from "node:url";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";
import { SKIN_IDS } from "@/lib/skins";

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
  revalidatePath("/dashboard");
}

export async function deleteStore(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") || "");
  if (!id) return;
  await supabase.from("stores").delete().eq("id", id);
  revalidatePath("/dashboard");
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
  revalidatePath(`/dashboard/${id}`);
  redirect(`/dashboard/${id}?dmsg=` + encodeURIComponent(value ? "도메인을 저장했어요" : "도메인 연결을 해제했어요"));
}
