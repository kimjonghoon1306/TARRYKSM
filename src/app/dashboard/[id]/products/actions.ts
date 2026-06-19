"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMe } from "@/lib/role";
import { canUse } from "@/lib/plans";

// 옵션 JSON 파싱·검증 ([{name, choices:[{label, add}]}])
function parseOptions(raw: FormDataEntryValue | null): unknown[] {
  try {
    const arr = JSON.parse(String(raw || "[]"));
    if (!Array.isArray(arr)) return [];
    return arr
      .map((g) => ({
        name: String(g?.name || "").trim(),
        choices: Array.isArray(g?.choices)
          ? g.choices
              .map((c: { label?: unknown; add?: unknown }) => ({
                label: String(c?.label || "").trim(),
                add: Math.max(0, parseInt(String(c?.add ?? 0), 10) || 0),
              }))
              .filter((c: { label: string }) => c.label)
          : [],
      }))
      .filter((g) => g.name && g.choices.length);
  } catch {
    return [];
  }
}

// 옵션 조합별 재고(variants) 파싱 ([{key, stock}])
function parseVariants(raw: FormDataEntryValue | null): { key: string; stock: number }[] {
  try {
    const arr = JSON.parse(String(raw || "[]"));
    if (!Array.isArray(arr)) return [];
    return arr
      .map((v) => ({ key: String(v?.key || "").trim(), stock: Math.max(0, parseInt(String(v?.stock ?? 0), 10) || 0) }))
      .filter((v) => v.key);
  } catch {
    return [];
  }
}

// 정가(compare_at) 파싱 — 비었거나 판매가 이하면 null(할인 표시 안 함)
function parseCompareAt(raw: FormDataEntryValue | null, price: number): number | null {
  const n = parseInt(String(raw || "").replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) && n > price ? n : null;
}

// 소유 확인: 이 store가 현재 유저 것인지 (RLS가 막지만 UX용 선검사)
async function assertOwner(storeId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stores")
    .select("id")
    .eq("id", storeId)
    .maybeSingle();
  return { supabase, ok: !!data };
}

// 이미지 파일을 Storage(product-images)에 올리고 공개 URL 반환. 파일 없으면 null.
type SB = Awaited<ReturnType<typeof createClient>>;
async function uploadImage(
  supabase: SB,
  storeId: string,
  file: FormDataEntryValue | null
): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${user.id}/${storeId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });
  if (error) return null;
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

// 무료 라이브러리에서 고른 이미지 경로만 허용 (임의 URL 주입 방지)
function stockImageUrl(v: FormDataEntryValue | null): string | null {
  const s = String(v || "").trim();
  if (!s) return null;
  return /^\/landing\/img\/(food|products)\/[a-z0-9_]+\.webp$/i.test(s) ? s : null;
}

export async function addProduct(formData: FormData) {
  const storeId = String(formData.get("store_id") || "");
  const { supabase, ok } = await assertOwner(storeId);
  if (!ok) return;

  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  const price = parseInt(String(formData.get("price") || "0"), 10) || 0;
  const compareAt = parseCompareAt(formData.get("compare_at"), price);
  const stockRaw = String(formData.get("stock") || "").trim();
  const stock = stockRaw === "" ? null : Math.max(0, parseInt(stockRaw, 10) || 0);
  // 업로드 파일 우선, 없으면 무료 라이브러리에서 고른 이미지 경로 사용
  const stockUrl = stockImageUrl(formData.get("stock_image_url"));
  const imageUrl = (await uploadImage(supabase, storeId, formData.get("image"))) || stockUrl;

  await supabase.from("products").insert({
    store_id: storeId,
    name,
    price,
    compare_at: compareAt,
    stock,
    options: parseOptions(formData.get("options")),
    variants: parseVariants(formData.get("variants")),
    emoji: String(formData.get("emoji") || "📦").trim() || "📦",
    image_url: imageUrl,
    brand: String(formData.get("brand") || "").trim() || null,
    category: String(formData.get("category") || "전체").trim() || "전체",
    tag: String(formData.get("tag") || "").trim() || null,
    description: String(formData.get("description") || "").trim() || null,
  });
  revalidatePath(`/dashboard/${storeId}/products`);
  revalidatePath(`/s`); // 스토어프런트 갱신
}

export async function updateProduct(formData: FormData) {
  const storeId = String(formData.get("store_id") || "");
  const id = String(formData.get("id") || "");
  const { supabase, ok } = await assertOwner(storeId);
  if (!ok || !id) return;

  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  const price = parseInt(String(formData.get("price") || "0"), 10) || 0;
  const compareAt = parseCompareAt(formData.get("compare_at"), price);
  const stockRaw = String(formData.get("stock") || "").trim();
  const stock = stockRaw === "" ? null : Math.max(0, parseInt(stockRaw, 10) || 0);
  const stockUrl = stockImageUrl(formData.get("stock_image_url"));
  const imageUrl = (await uploadImage(supabase, storeId, formData.get("image"))) || stockUrl;

  const patch: Record<string, unknown> = {
    name,
    price,
    compare_at: compareAt,
    stock,
    options: parseOptions(formData.get("options")),
    variants: parseVariants(formData.get("variants")),
    emoji: String(formData.get("emoji") || "📦").trim() || "📦",
    brand: String(formData.get("brand") || "").trim() || null,
    category: String(formData.get("category") || "전체").trim() || "전체",
    tag: String(formData.get("tag") || "").trim() || null,
    description: String(formData.get("description") || "").trim() || null,
  };
  // 새 이미지(업로드 또는 라이브러리 선택) 있으면 교체. "이미지 제거" 시 null.
  if (imageUrl) patch.image_url = imageUrl;
  else if (String(formData.get("remove_image") || "") === "1") patch.image_url = null;

  await supabase.from("products").update(patch).eq("id", id).eq("store_id", storeId);
  revalidatePath(`/dashboard/${storeId}/products`);
  revalidatePath(`/s`);
}

export async function deleteProduct(formData: FormData) {
  const storeId = String(formData.get("store_id") || "");
  const id = String(formData.get("id") || "");
  const { supabase, ok } = await assertOwner(storeId);
  if (!ok || !id) return;
  await supabase.from("products").delete().eq("id", id).eq("store_id", storeId);
  revalidatePath(`/dashboard/${storeId}/products`);
}

// CSV 한 줄 파싱 (쉼표 구분, 따옴표 감싼 값 안의 쉼표 허용)
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') q = false;
      else cur += ch;
    } else {
      if (ch === '"') q = true;
      else if (ch === ",") { out.push(cur); cur = ""; }
      else cur += ch;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

// 상품 대량 등록 — CSV(상품명,가격,카테고리,설명,재고,이모지) 텍스트를 받아 일괄 insert.
// 헤더 줄은 자동 감지(첫 칸이 '상품명'/'name'이면 건너뜀). 가격 없는 줄은 무시.
export async function bulkAddProducts(
  storeId: string,
  csv: string
): Promise<{ ok: boolean; added?: number; error?: string }> {
  const { supabase, ok } = await assertOwner(storeId);
  if (!ok) return { ok: false, error: "권한이 없어요." };
  // 대량등록은 프로 요금제부터 (UI 우회 방지 서버 검증)
  const me = await getMe();
  if (!canUse("bulk", me.plan, me.role)) return { ok: false, error: "대량 등록은 프로 요금제부터 사용할 수 있어요." };
  const lines = (csv || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { ok: false, error: "붙여넣은 내용이 없어요." };

  const rows: Record<string, unknown>[] = [];
  for (let i = 0; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    const first = (cells[0] || "").toLowerCase();
    if (i === 0 && (first === "상품명" || first === "name" || first.includes("상품"))) continue; // 헤더 스킵
    const name = (cells[0] || "").trim();
    const price = parseInt((cells[1] || "").replace(/[^0-9]/g, ""), 10) || 0;
    if (!name || price <= 0) continue; // 이름·가격 없으면 무시
    const category = (cells[2] || "").trim() || "전체";
    const description = (cells[3] || "").trim() || null;
    const stockRaw = (cells[4] || "").trim();
    const stock = stockRaw === "" ? null : Math.max(0, parseInt(stockRaw.replace(/[^0-9]/g, ""), 10) || 0);
    const emoji = (cells[5] || "").trim() || "📦";
    rows.push({ store_id: storeId, name, price, category, description, stock, emoji });
    if (rows.length >= 500) break; // 한 번에 최대 500개
  }
  if (!rows.length) return { ok: false, error: "등록할 상품이 없어요. 형식을 확인해 주세요. (상품명,가격 필수)" };

  const { error } = await supabase.from("products").insert(rows);
  if (error) return { ok: false, error: "등록 실패: " + error.message };
  revalidatePath(`/dashboard/${storeId}/products`);
  revalidatePath(`/${storeId}`);
  return { ok: true, added: rows.length };
}
