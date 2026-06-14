import { createClient } from "@/lib/supabase/server";

export type Role = "admin" | "founder";

export type Me = {
  userId: string | null;
  email: string | null;
  role: Role;
};

// 현재 로그인 사용자의 역할을 profiles에서 조회. 비로그인/미생성 시 founder 기본.
export async function getMe(): Promise<Me> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { userId: null, email: null, role: "founder" };

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role: Role = data?.role === "admin" ? "admin" : "founder";
  return { userId: user.id, email: user.email ?? null, role };
}
