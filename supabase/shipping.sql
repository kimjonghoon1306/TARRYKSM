-- ════════════════════════════════════════
-- 배송/송장 관리 — orders에 택배사·운송장번호
-- Supabase SQL Editor에 붙여넣고 RUN
-- ════════════════════════════════════════

alter table public.orders add column if not exists courier     text;  -- 택배사
alter table public.orders add column if not exists tracking_no text;  -- 운송장번호

-- (RLS는 기존 orders 정책 사용: 소유자/관리자만 update)
-- 확인: select id, status, courier, tracking_no from public.orders;
