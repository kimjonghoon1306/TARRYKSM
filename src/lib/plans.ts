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
    features: ["쇼핑몰 1개", "상품·스킨·대문 꾸미기", "주문·송장 관리", "🤖 챗봇", "🚚 배송비", "💬 상품문의", "⭐ 리뷰"],
  },
  basic: {
    id: "basic",
    name: "베이직",
    price: 19000,
    maxStores: 5,
    features: ["쇼핑몰 5개", "무료 기능 전체", "🏷️ 할인가/정가", "🎟️ 쿠폰", "💰 적립금", "🌐 커스텀 도메인", "📈 매출·분석"],
    highlight: true,
  },
  pro: {
    id: "pro",
    name: "프로",
    price: 49000,
    maxStores: Infinity,
    features: ["쇼핑몰 무제한", "모든 베이직 기능", "💎 회원 등급(VIP)", "우선 지원", "향후 카드결제(PG) 우선 적용"],
  },
};

export const PLAN_ORDER: Plan[] = ["free", "basic", "pro"];

export function planOf(role?: string | null, plan?: string | null): PlanInfo {
  // 관리자는 제한 없음(pro 취급)
  if (role === "admin") return PLANS.pro;
  if (plan === "basic" || plan === "pro") return PLANS[plan];
  return PLANS.free;
}

// ── 기능별 최소 요금제(게이팅) ──
// 여기에 없는 기능은 전부 무료(free) — 챗봇·배송비·상품문의·리뷰·상품·주문·스킨 등.
export type Feature =
  | "compare_at"   // 할인가/정가
  | "coupon"       // 쿠폰
  | "points"       // 적립금
  | "domain"       // 커스텀 도메인
  | "analytics"    // 매출·분석
  | "grades";      // 회원 등급(VIP)

export const FEATURE_MIN: Record<Feature, Plan> = {
  compare_at: "basic",
  coupon: "basic",
  points: "basic",
  domain: "basic",
  analytics: "basic",
  grades: "pro",
};

// 현재 plan으로 이 기능을 쓸 수 있는지 (admin은 항상 가능)
export function canUse(feature: Feature, plan?: string | null, role?: string | null): boolean {
  if (role === "admin") return true;
  const cur = plan === "basic" || plan === "pro" ? plan : "free";
  return PLAN_ORDER.indexOf(cur) >= PLAN_ORDER.indexOf(FEATURE_MIN[feature]);
}

// 이 기능에 필요한 요금제 이름 (안내 문구용)
export function requiredPlanName(feature: Feature): string {
  return PLANS[FEATURE_MIN[feature]].name;
}
