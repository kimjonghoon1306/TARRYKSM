"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type Member = {
  id: string;
  store_id: string;
  store_name: string;
  name: string;
  email: string;
  phone: string | null;
  points: number;
  created_at: string;
};

// 내 쇼핑몰 회원 + 적립금 잔액 (points2.sql 미실행이면 빈 배열)
export async function listMyCustomers(): Promise<Member[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("list_my_customers");
  return (data as Member[] | null) ?? [];
}

export type PointLog = {
  amount: number;
  balance_after: number;
  kind: string;
  memo: string | null;
  created_at: string;
};

// 한 회원의 적립금 내역
export async function getCustomerPointsLog(customerId: string): Promise<PointLog[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("customer_points_log", { p_customer: customerId });
  return (data as PointLog[] | null) ?? [];
}

// 창업자가 회원에게 적립금 지급(+)/차감(-)
export async function adjustCustomerPoints(
  customerId: string,
  amount: number,
  memo: string
): Promise<{ ok: boolean; points?: number; error?: string }> {
  const a = Math.trunc(Number(amount));
  if (!Number.isFinite(a) || a === 0) return { ok: false, error: "0이 아닌 금액을 입력해 주세요." };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_adjust_points", {
    p_customer: customerId,
    p_amount: a,
    p_memo: (memo || "").trim(),
  });
  if (error) return { ok: false, error: "처리에 실패했어요. (적립금 SQL 실행/권한을 확인해 주세요)" };
  revalidatePath("/dashboard/customers");
  return { ok: true, points: data as number };
}
