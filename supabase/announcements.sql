-- ════════════════════════════════════════
-- 공지(플랫폼 → 창업자) — 플랫폼 관리자가 작성, 로그인한 창업자 대시보드에 표시
-- Supabase SQL Editor에 통째로 붙여넣고 RUN
-- ════════════════════════════════════════

create table if not exists public.announcements (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  body        text,
  pinned      boolean not null default false,   -- 상단 고정
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists announcements_created on public.announcements (created_at desc);

alter table public.announcements enable row level security;

-- 조회: 로그인한 사용자(창업자/관리자) 모두. (비활성 공지는 화면에서 필터)
drop policy if exists "ann read auth" on public.announcements;
create policy "ann read auth" on public.announcements
  for select to authenticated using (true);

-- 작성/수정/삭제: 플랫폼 관리자만
drop policy if exists "ann admin all" on public.announcements;
create policy "ann admin all" on public.announcements
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 확인: select title, pinned, active, created_at from public.announcements order by created_at desc;
