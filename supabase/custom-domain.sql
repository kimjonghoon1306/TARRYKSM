-- ════════════════════════════════════════
-- 커스텀 도메인 — stores.custom_domain
-- Supabase SQL Editor에 붙여넣고 RUN
-- ════════════════════════════════════════

-- 쇼핑몰에 연결할 본인 도메인 (예: myshop.com)
alter table public.stores
  add column if not exists custom_domain text;

-- 같은 도메인 중복 방지 (값이 있을 때만)
create unique index if not exists stores_custom_domain_key
  on public.stores (custom_domain)
  where custom_domain is not null;

-- (소유자 update 정책이 이미 있으면 custom_domain도 자동 포함됨)
