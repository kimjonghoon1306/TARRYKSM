-- ════════════════════════════════════════
-- 상품 옵션 — 색상·사이즈 등 (옵션그룹 + 선택지 + 추가금액)
-- options 예:
-- [ { "name": "사이즈", "choices": [ {"label":"S","add":0}, {"label":"L","add":2000} ] },
--   { "name": "색상",   "choices": [ {"label":"블랙","add":0}, {"label":"화이트","add":0} ] } ]
-- Supabase SQL Editor에 붙여넣고 RUN
-- ════════════════════════════════════════

alter table public.products add column if not exists options jsonb not null default '[]'::jsonb;

-- 확인: select id, name, options from public.products;
