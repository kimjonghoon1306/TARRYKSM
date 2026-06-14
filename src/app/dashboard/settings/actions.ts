"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function changePassword(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const pw = String(formData.get("password") || "");
  const pw2 = String(formData.get("password2") || "");
  if (pw.length < 6)
    redirect("/dashboard/settings?error=" + encodeURIComponent("비밀번호는 6자 이상이어야 해요"));
  if (pw !== pw2)
    redirect("/dashboard/settings?error=" + encodeURIComponent("비밀번호가 일치하지 않아요"));

  const { error } = await supabase.auth.updateUser({ password: pw });
  if (error)
    redirect("/dashboard/settings?error=" + encodeURIComponent(error.message));
  redirect("/dashboard/settings?msg=" + encodeURIComponent("비밀번호가 변경됐어요"));
}
