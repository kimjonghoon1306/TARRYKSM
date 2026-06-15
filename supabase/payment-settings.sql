-- ════════════════════════════════════════
-- 결제 설정 기초 — 창업자가 본인 결제수단을 연결
--  · 무통장입금(계좌이체): 지금 바로 사용 가능
--  · 카드결제(PG): 나중에 창업자가 본인 PG 연결 (자리만 마련)
-- Supabase SQL Editor에 통째로 붙여넣고 RUN
-- ════════════════════════════════════════

alter table public.stores add column if not exists pay_bank   text;          -- 입금 계좌(은행·번호·예금주)
alter table public.stores add column if not exists pay_note   text;          -- 입금 안내 문구
alter table public.stores add column if not exists pg_provider text not null default 'none'; -- none|toss|kakao|nice ...
alter table public.stores add column if not exists pg_config  jsonb not null default '{}'::jsonb; -- PG 키 등(나중)

-- (RLS는 기존 stores 정책 사용: 소유자/관리자만 수정, 발행몰은 공개 읽기)
-- 확인: select id, name, pay_bank, pg_provider from public.stores;
