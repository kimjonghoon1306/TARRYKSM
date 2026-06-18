-- ════════════════════════════════════════
-- 쇼핑몰 카테고리 관리 — 창업자가 몰마다 카테고리 직접 추가/수정/삭제/순서
--  · 기존: 상품 폼에 고정 드롭다운(하드코딩). 이제 몰별 관리 목록에서 가져옴.
--  · 한 줄=한 명령, 주석 없음 형태. (복사 안전)
-- ════════════════════════════════════════
create table if not exists public.store_categories (id uuid primary key default gen_random_uuid(), store_id uuid not null references public.stores(id) on delete cascade, name text not null, position integer not null default 0, created_at timestamptz not null default now());
create unique index if not exists sc_store_name on public.store_categories(store_id, name);
create index if not exists sc_store on public.store_categories(store_id, position);
alter table public.store_categories enable row level security;
drop policy if exists "store_categories owner all" on public.store_categories;
create policy "store_categories owner all" on public.store_categories for all to authenticated using (exists (select 1 from public.stores s where s.id = store_categories.store_id and (s.owner = auth.uid() or public.is_admin()))) with check (exists (select 1 from public.stores s where s.id = store_categories.store_id and (s.owner = auth.uid() or public.is_admin())));
