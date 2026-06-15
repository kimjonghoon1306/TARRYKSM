-- ════════════════════════════════════════
-- 구독 요금제 — profiles.plan (free | basic | pro)
-- (실결제는 추후. 지금은 플랫폼 관리자가 수동으로 플랜 부여)
-- Supabase SQL Editor에 붙여넣고 RUN
-- ════════════════════════════════════════

alter table public.profiles add column if not exists plan text not null default 'free';

-- 확인: select id, email, role, plan from public.profiles;
