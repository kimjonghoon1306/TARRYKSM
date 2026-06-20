"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function authMsg(m: string) {
  if (/Invalid login/i.test(m)) return "이메일 또는 비밀번호가 올바르지 않아요";
  if (/already registered/i.test(m)) return "이미 가입된 이메일이에요";
  if (/at least 6/i.test(m)) return "비밀번호는 6자 이상이어야 해요";
  if (/Email not confirmed/i.test(m)) return "메일 인증을 먼저 완료해주세요";
  return m || "오류가 발생했어요";
}

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const adminOnly = String(formData.get("admin") || "") === "1"; // 관리자 전용 입구
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const dest = adminOnly ? "/login?admin=1&error=" : "/login?error=";
    redirect(dest + encodeURIComponent(authMsg(error.message)));
  }

  // 관리자 전용 입구: 로그인은 됐어도 admin 역할이 아니면 거부(로그아웃)
  if (adminOnly) {
    const uid = data.user?.id;
    let isAdmin = false;
    if (uid) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", uid)
        .maybeSingle();
      isAdmin = prof?.role === "admin";
    }
    if (!isAdmin) {
      await supabase.auth.signOut();
      redirect("/login?admin=1&error=" + encodeURIComponent("잘못 입력되었습니다."));
    }
  }

  // 캐시 무효화: 이전 계정의 대시보드 화면이 남아 보이는 것 방지 (멀티테넌트 격리)
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  // 약관·개인정보 동의 필수 (UI required + 서버 2차 검증)
  if (String(formData.get("agree") || "") !== "1") {
    redirect("/signup?error=" + encodeURIComponent("이용약관·개인정보 수집에 동의해 주세요."));
  }
  const supabase = await createClient();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const name = String(formData.get("name") || "");
  // 전화번호는 숫자만 저장 (이메일 찾기 매칭용)
  const phone = String(formData.get("phone") || "").replace(/[^0-9]/g, "");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: name || email.split("@")[0], phone } },
  });
  if (error) redirect("/signup?error=" + encodeURIComponent(authMsg(error.message)));
  if (!data.session)
    redirect("/login?msg=" + encodeURIComponent("확인 메일을 보냈어요. 인증 후 로그인하세요."));
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// 전화번호로 가입 이메일 찾기 (마스킹된 이메일 반환). SECURITY DEFINER RPC 사용.
export async function findEmailByPhone(formData: FormData) {
  const phone = String(formData.get("phone") || "").replace(/[^0-9]/g, "");
  if (!phone) redirect("/find-email?error=" + encodeURIComponent("전화번호를 입력하세요"));
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("find_email_by_phone", { p: phone });
  if (error) redirect("/find-email?error=" + encodeURIComponent("조회 중 오류가 발생했어요"));
  if (!data) redirect("/find-email?notfound=1");
  redirect("/find-email?found=" + encodeURIComponent(String(data)));
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") || "").trim();
  if (!email)
    redirect("/reset-password?error=" + encodeURIComponent("이메일을 입력하세요"));
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
  const proto = root.includes("localhost") ? "http" : "https";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${proto}://${root}/dashboard/settings`,
  });
  if (error) redirect("/reset-password?error=" + encodeURIComponent(error.message));
  redirect(
    "/reset-password?msg=" +
      encodeURIComponent("재설정 메일을 보냈어요. 메일의 링크를 눌러 비밀번호를 바꾸세요.")
  );
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
