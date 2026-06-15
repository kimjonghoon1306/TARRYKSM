-- ════════════════════════════════════════
-- 섹션 빌더(A): 창업자가 대문 구성을 직접 편집
-- store_sections — 몰마다 블록(배너/선반/텍스트/그리드)을 순서대로 쌓음
-- Supabase SQL Editor에 붙여넣고 RUN
-- ════════════════════════════════════════

create table if not exists public.store_sections (
  id         uuid primary key default gen_random_uuid(),
  store_id   uuid not null references public.stores(id) on delete cascade,
  type       text not null,                       -- 'banner' | 'shelf' | 'text' | 'grid'
  position   integer not null default 0,          -- 정렬 순서(작을수록 위)
  config     jsonb not null default '{}'::jsonb,  -- 블록별 설정
  visible    boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists store_sections_store_pos
  on public.store_sections (store_id, position);

alter table public.store_sections enable row level security;

-- 읽기: 발행된 몰의 섹션은 누구나(공개 스토어프런트) / 소유자·관리자는 항상
drop policy if exists "sections public read" on public.store_sections;
create policy "sections public read" on public.store_sections
  for select
  using (
    exists (
      select 1 from public.stores s
      where s.id = store_sections.store_id
        and (s.published = true or s.owner = auth.uid() or public.is_admin())
    )
  );

-- 쓰기(추가/수정/삭제): 그 몰의 소유자 또는 관리자만
drop policy if exists "sections owner write" on public.store_sections;
create policy "sections owner write" on public.store_sections
  for all to authenticated
  using (
    exists (
      select 1 from public.stores s
      where s.id = store_sections.store_id
        and (s.owner = auth.uid() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.stores s
      where s.id = store_sections.store_id
        and (s.owner = auth.uid() or public.is_admin())
    )
  );

-- 확인: select store_id, type, position, visible from public.store_sections order by position;
