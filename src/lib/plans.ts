// 구독 요금제 정의 — 창업자(founder) 플랜
export type Plan = "free" | "basic" | "pro";

export type PlanInfo = {
  id: Plan;
  name: string;
  price: number; // 월 요금(원)
  maxStores: number; // 만들 수 있는 쇼핑몰 수 (Infinity 가능)
  features: string[];
  highlight?: boolean;
};

export const PLANS: Record<Plan, PlanInfo> = {
  free: {
    id: "free",
    name: "무료",
    price: 0,
    maxStores: 1,
    features: ["쇼핑몰 1개", "상품 무제한", "기본 스킨 전체", "무통장 주문 관리"],
  },
  basic: {
    id: "basic",
    name: "베이직",
    price: 19000,
    maxStores: 5,
    features: ["쇼핑몰 5개", "상품 무제한", "커스텀 도메인 연결", "주문·고객·매출 분석", "옵션·재고·송장 관리"],
    highlight: true,
  },
  pro: {
    id: "pro",
    name: "프로",
    price: 49000,
    maxStores: Infinity,
    features: ["쇼핑몰 무제한", "모든 베이직 기능", "우선 지원", "향후 카드결제(PG) 우선 적용"],
  },
};

export const PLAN_ORDER: Plan[] = ["free", "basic", "pro"];

export function planOf(role?: string | null, plan?: string | null): PlanInfo {
  // 관리자는 제한 없음(pro 취급)
  if (role === "admin") return PLANS.pro;
  if (plan === "basic" || plan === "pro") return PLANS[plan];
  return PLANS.free;
}
