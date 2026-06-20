"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getMe } from "@/lib/role";
import { ACTING_COOKIE } from "@/lib/actor";

// 운영자가 특정 창업자로 "시크릿 입장"(임퍼서네이션) — 그 사람 대시보드를 그대로 본다.
// 권한/RLS는 진짜 운영자 계정 기준이라 데이터 접근은 유지되고, 화면만 창업자 시점.
export async function enterAsFounder(founderId: string, gotoPath?: string) {
  const me = await getMe();
  if (me.role !== "admin") return; // 운영자만
  if (!founderId || founderId === me.userId) return;
  (await cookies()).set(ACTING_COOKIE, founderId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 6, // 6시간
  });
  revalidatePath("/dashboard", "layout");
  redirect(gotoPath || "/dashboard");
}

// 시크릿 입장 종료 — 운영자 본인으로 복귀.
export async function exitImpersonation() {
  (await cookies()).delete(ACTING_COOKIE);
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/platform");
}
