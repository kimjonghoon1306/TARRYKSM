"use server";

import crypto from "crypto";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

// 소비자(쇼핑몰 손님) 회원 인증. 쇼핑몰별 독립.
// 비번은 PBKDF2로 해시(salt:hash). 세션 토큰은 httpOnly 쿠키(cust_session).

const COOKIE = "cust_session";

function hashPw(password: string, salt?: string): string {
  const s = salt || crypto.randomBytes(16).toString("hex");
  const h = crypto.pbkdf2Sync(password, s, 100000, 32, "sha256").toString("hex");
  return `${s}:${h}`;
}
function verifyPw(password: string, stored: string): boolean {
  const [salt] = stored.split(":");
  if (!salt) return false;
  return hashPw(password, salt) === stored;
}

type Res = { ok: boolean; error?: string };

// 회원가입
export async function customerSignup(
  storeId: string,
  input: { email: string; password: string; name: string; phone: string }
): Promise<Res> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  if (!email || !input.password || !name) return { ok: false, error: "이메일·비밀번호·이름을 모두 입력해 주세요." };
  if (input.password.length < 6) return { ok: false, error: "비밀번호는 6자 이상이어야 해요." };

  const supabase = await createClient();
  const { error } = await supabase.from("customers").insert({
    store_id: storeId,
    email,
    name,
    phone: input.phone.trim() || null,
    password_hash: hashPw(input.password),
  });
  if (error) {
    if (error.code === "23505") return { ok: false, error: "이미 가입된 이메일이에요." };
    return { ok: false, error: "가입에 실패했어요. 잠시 후 다시 시도해 주세요." };
  }
  // 가입 후 자동 로그인
  const res = await customerLogin(storeId, { email, password: input.password });
  // 가입축하 쿠폰 자동 발급 (설정된 몰만, RPC/SQL 없으면 무시)
  if (res.ok) {
    try {
      const token = (await cookies()).get(COOKIE)?.value;
      if (token) await supabase.rpc("auto_issue_coupon", { p_token: token, p_reason: "welcome" });
    } catch { /* 자동쿠폰 미설정/미실행 환경 무시 */ }
  }
  return res;
}

// 로그인 — 해시 검증은 클라가 보낸 비번을 서버에서 해시해 RPC로 대조
export async function customerLogin(
  storeId: string,
  input: { email: string; password: string }
): Promise<Res> {
  const email = input.email.trim().toLowerCase();
  const supabase = await createClient();
  // 저장된 해시를 받아 서버에서 같은 salt로 재해시해 비교 (비번 평문은 DB에 안 감)
  const { data, error } = await supabase.rpc("customer_get_hash", { p_store: storeId, p_email: email });
  if (error || !data || !data.length) return { ok: false, error: "이메일 또는 비밀번호가 올바르지 않아요." };
  const row = data[0] as { id: string; password_hash: string };
  if (!verifyPw(input.password, row.password_hash)) {
    return { ok: false, error: "이메일 또는 비밀번호가 올바르지 않아요." };
  }
  const { data: token } = await supabase.rpc("customer_new_session", { p_id: row.id });
  if (!token) return { ok: false, error: "로그인에 실패했어요." };
  (await cookies()).set(COOKIE, token as string, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return { ok: true };
}

export async function customerLogout(): Promise<void> {
  const jar = await cookies();
  const t = jar.get(COOKIE)?.value;
  if (t) {
    const supabase = await createClient();
    await supabase.rpc("customer_logout", { p_token: t });
  }
  jar.delete(COOKIE);
}

// 현재 로그인 손님 정보 (없으면 null)
export async function getCustomer() {
  const t = (await cookies()).get(COOKIE)?.value;
  if (!t) return null;
  const supabase = await createClient();
  const { data } = await supabase.rpc("customer_me", { p_token: t });
  return data && data.length ? (data[0] as { id: string; store_id: string; email: string; name: string; phone: string | null; points: number }) : null;
}

// ── 찜(위시리스트) — cust_session 토큰으로 RPC 처리 ──

// 찜 토글. 반환: { ok, faved } — 비로그인이면 ok:false
export async function toggleWishlist(productId: string): Promise<{ ok: boolean; faved: boolean }> {
  const t = (await cookies()).get(COOKIE)?.value;
  if (!t) return { ok: false, faved: false };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("wishlist_toggle", { p_token: t, p_product: productId });
  if (error) return { ok: false, faved: false };
  return { ok: true, faved: !!data };
}

// 현재 손님이 찜한 product_id 집합 (스토어프런트 ♥ 표시용)
export async function getWishlistIds(): Promise<string[]> {
  const t = (await cookies()).get(COOKIE)?.value;
  if (!t) return [];
  const supabase = await createClient();
  const { data } = await supabase.rpc("wishlist_ids", { p_token: t });
  return (data as { product_id: string }[] | null)?.map((r) => r.product_id) ?? [];
}

// 찜한 상품 전체정보 (마이페이지)
export type WishItem = { id: string; name: string; price: number; image_url: string | null; emoji: string | null; category: string | null };
export async function getWishlistProducts(): Promise<WishItem[]> {
  const t = (await cookies()).get(COOKIE)?.value;
  if (!t) return [];
  const supabase = await createClient();
  const { data } = await supabase.rpc("wishlist_products", { p_token: t });
  return (data as WishItem[] | null) ?? [];
}

// 아이디(이메일) 찾기
export async function customerFindEmail(storeId: string, name: string, phone: string): Promise<{ ok: boolean; email?: string; error?: string }> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("customer_find_email", { p_store: storeId, p_name: name.trim(), p_phone: phone.trim() });
  if (!data) return { ok: false, error: "일치하는 회원을 찾지 못했어요." };
  // 이메일 마스킹: ab***@gmail.com
  const [id, dom] = String(data).split("@");
  const masked = id.slice(0, 2) + "***@" + dom;
  return { ok: true, email: masked };
}

// ── 내 정보 수정 (로그인 손님) ──

// 이름·연락처 수정
export async function customerUpdateProfile(input: { name: string; phone: string }): Promise<Res> {
  const t = (await cookies()).get(COOKIE)?.value;
  if (!t) return { ok: false, error: "로그인이 필요해요." };
  const name = input.name.trim();
  if (!name) return { ok: false, error: "이름을 입력해 주세요." };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("customer_update_profile", {
    p_token: t,
    p_name: name,
    p_phone: input.phone.trim(),
  });
  if (error || !data) return { ok: false, error: "수정에 실패했어요. 잠시 후 다시 시도해 주세요." };
  return { ok: true };
}

// 비밀번호 변경 (현재 비번 확인 후 새 비번으로)
export async function customerChangePassword(input: { current: string; next: string }): Promise<Res> {
  const t = (await cookies()).get(COOKIE)?.value;
  if (!t) return { ok: false, error: "로그인이 필요해요." };
  if (input.next.length < 6) return { ok: false, error: "새 비밀번호는 6자 이상이어야 해요." };
  const cust = await getCustomer();
  if (!cust) return { ok: false, error: "로그인이 필요해요." };
  const supabase = await createClient();
  // 현재 비번 검증 (저장 해시를 받아 같은 salt로 재해시 비교)
  const { data: hd } = await supabase.rpc("customer_get_hash", { p_store: cust.store_id, p_email: cust.email });
  const row = hd && hd.length ? (hd[0] as { password_hash: string }) : null;
  if (!row || !verifyPw(input.current, row.password_hash)) {
    return { ok: false, error: "현재 비밀번호가 올바르지 않아요." };
  }
  const { data, error } = await supabase.rpc("customer_change_password", {
    p_token: t,
    p_newhash: hashPw(input.next),
  });
  if (error || !data) return { ok: false, error: "변경에 실패했어요. 잠시 후 다시 시도해 주세요." };
  return { ok: true };
}

// ── 쿠폰함 (로그인 손님) ──
export type MyCoupon = {
  id: string;
  code: string;
  kind: string;
  value: number;
  min_order: number;
  expires_at: string | null;
  active: boolean;
  used: boolean;
  used_at: string | null;
};
export async function getMyCoupons(): Promise<MyCoupon[]> {
  const t = (await cookies()).get(COOKIE)?.value;
  if (!t) return [];
  const supabase = await createClient();
  const { data } = await supabase.rpc("my_coupons", { p_token: t });
  return (data as MyCoupon[] | null) ?? [];
}

// 비밀번호 재설정 (이메일+이름+전화 일치 시)
export async function customerResetPw(
  storeId: string,
  input: { email: string; name: string; phone: string; newPassword: string }
): Promise<Res> {
  if (input.newPassword.length < 6) return { ok: false, error: "새 비밀번호는 6자 이상이어야 해요." };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("customer_reset_pw", {
    p_store: storeId,
    p_email: input.email.trim().toLowerCase(),
    p_name: input.name.trim(),
    p_phone: input.phone.trim(),
    p_newhash: hashPw(input.newPassword),
  });
  if (error || !data) return { ok: false, error: "정보가 일치하지 않아요. 이메일·이름·전화를 확인해 주세요." };
  return { ok: true };
}
