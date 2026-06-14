-- ════════════════════════════════════════
-- 역할 분리: 플랫폼 관리자(admin) vs 창업자(founder)
-- Supabase SQL Editor에 붙여넣고 RUN
-- ════════════════════════════════════════

-- 0) (이미 있으면 무시) profiles 본인 행 읽기 허용 — getMe()가 내 role 조회
drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles
  for select to authenticated
  using (id = auth.uid());

-- 1) 관리자 판별 함수 (SECURITY DEFINER로 RLS 재귀 방지)
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- 2) 관리자는 전체 조회 가능 (기존 소유자 정책에 OR로 더해짐)
drop policy if exists "stores admin read all" on public.stores;
create policy "stores admin read all" on public.stores
  for select to authenticated using (public.is_admin());

drop policy if exists "products admin read all" on public.products;
create policy "products admin read all" on public.products
  for select to authenticated using (public.is_admin());

drop policy if exists "profiles admin read all" on public.profiles;
create policy "profiles admin read all" on public.profiles
  for select to authenticated using (public.is_admin());

-- 3) ⭐ 내 계정을 플랫폼 관리자로 지정 — 아래 이메일을 본인 관리자 이메일로 바꿔서 실행
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = '여기에_관리자_이메일');

-- 확인: select id, role from public.profiles;
