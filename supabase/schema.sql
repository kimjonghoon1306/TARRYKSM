-- ════════════════════════════════════════════════════════════
-- 무한분양 (ONJONGIL) — 정적 + Supabase MVP 스키마
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 RUN 하세요.
-- (이미 테이블을 만드셨다면 이 파일과 컬럼명을 맞춰주세요)
-- ════════════════════════════════════════════════════════════

-- 1) 프로필 — auth.users 확장 (역할 구분)
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role         text not null default 'founder',   -- founder(창업자) | admin(플랫폼관리자)
  created_at   timestamptz not null default now()
);

-- 2) 스토어(쇼핑몰) — 기존 정적 데모의 malls[] 를 대체
create table if not exists public.stores (
  id         uuid primary key default gen_random_uuid(),
  owner      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name       text not null,
  skin       text not null default 'mono',
  slug       text unique,
  published  boolean not null default true,
  created_at timestamptz not null default now()
);

-- 3) 상품 — 스토어별 상품 (정적 PRODUCTS 를 대체)
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  store_id    uuid not null references public.stores(id) on delete cascade,
  emoji       text default '📦',
  name        text not null,
  brand       text,
  category    text default '전체',
  price       integer not null default 0,
  tag         text,
  description text,
  rating      numeric(2,1) default 5.0,
  position    int default 0,
  created_at  timestamptz not null default now()
);

create index if not exists stores_owner_idx   on public.stores(owner);
create index if not exists products_store_idx on public.products(store_id);

-- 4) RLS — 몰별 데이터 격리
alter table public.profiles enable row level security;
alter table public.stores   enable row level security;
alter table public.products enable row level security;

-- profiles: 본인 것만
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- stores: 공개몰은 누구나 읽기(소비자 스토어프런트) + 소유자만 쓰기
drop policy if exists "stores read"  on public.stores;
drop policy if exists "stores write" on public.stores;
create policy "stores read"  on public.stores
  for select using (published = true or auth.uid() = owner);
create policy "stores write" on public.stores
  for all using (auth.uid() = owner) with check (auth.uid() = owner);

-- products: 공개몰 상품은 누구나 읽기 + 소유자만 쓰기
drop policy if exists "products read"  on public.products;
drop policy if exists "products write" on public.products;
create policy "products read" on public.products
  for select using (
    exists (select 1 from public.stores s
            where s.id = store_id and (s.published or s.owner = auth.uid()))
  );
create policy "products write" on public.products
  for all using (
    exists (select 1 from public.stores s where s.id = store_id and s.owner = auth.uid())
  ) with check (
    exists (select 1 from public.stores s where s.id = store_id and s.owner = auth.uid())
  );

-- 5) 회원가입 시 프로필 자동 생성
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
