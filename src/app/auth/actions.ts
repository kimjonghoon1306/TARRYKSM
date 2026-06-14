"use server";

import { redirect } from "next/navigation";
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
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/login?error=" + encodeURIComponent(authMsg(error.message)));
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const name = String(formData.get("name") || "");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: name || email.split("@")[0] } },
  });
  if (error) redirect("/signup?error=" + encodeURIComponent(authMsg(error.message)));
  if (!data.session)
    redirect("/login?msg=" + encodeURIComponent("확인 메일을 보냈어요. 인증 후 로그인하세요."));
  redirect("/dashboard");
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
