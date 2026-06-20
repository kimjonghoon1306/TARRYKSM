-- ════════════════════════════════════════
-- 공지 팝업: 운영자가 전체 창업자에게 모달 팝업으로 띄우기
-- (announcements 테이블에 popup 플래그 1개 추가 — 하위호환)
-- Supabase SQL Editor에 붙여넣고 RUN
-- ════════════════════════════════════════

alter table public.announcements add column if not exists popup boolean not null default false;

-- 확인: select title, active, popup from public.announcements order by created_at desc;
