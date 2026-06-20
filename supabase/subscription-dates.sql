-- ════════════════════════════════════════
-- 구독 사용 기간: 운영자가 "오늘 결제 완료" 누르면 오늘부터 한 달 자동 계산.
-- profiles에 결제일/만료일 2개 컬럼 추가 (하위호환)
-- Supabase SQL Editor에 붙여넣고 RUN
-- ════════════════════════════════════════

alter table public.profiles add column if not exists plan_paid_at timestamptz;
alter table public.profiles add column if not exists plan_until  timestamptz;

-- 확인: select email, plan, plan_paid_at, plan_until from public.profiles;
