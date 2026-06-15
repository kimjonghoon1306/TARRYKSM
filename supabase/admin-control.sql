-- ════════════════════════════════════════
-- 플랫폼 관리자 "컨트롤" 권한 — 회원/쇼핑몰을 직접 제어
-- (admin-role.sql 먼저 실행돼 있어야 함: is_admin() 함수 필요)
-- Supabase SQL Editor에 통째로 붙여넣고 RUN
-- ════════════════════════════════════════

-- 1) profiles에 email 보관 (관리자가 회원 목록에서 이메일 식별)
alter table public.profiles add column if not exists email text;

-- 기존 회원 이메일 백필 (auth.users에서 가져옴)
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and (p.email is null or p.email <> u.email);

-- 신규 가입 시 profiles에 email도 들어가도록 트리거 함수 갱신
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'founder')
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2) 관리자는 회원 역할 변경 가능 (profiles update)
drop policy if exists "profiles admin update" on public.profiles;
create policy "profiles admin update" on public.profiles
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 3) 관리자는 모든 쇼핑몰 수정(강제 비공개 등) 가능
drop policy if exists "stores admin update all" on public.stores;
create policy "stores admin update all" on public.stores
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 4) 관리자는 모든 쇼핑몰 삭제(회수) 가능
drop policy if exists "stores admin delete all" on public.stores;
create policy "stores admin delete all" on public.stores
  for delete to authenticated
  using (public.is_admin());

-- 확인: select id, email, role from public.profiles order by role;
