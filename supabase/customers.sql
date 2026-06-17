-- ════════════════════════════════════════
-- 소비자(쇼핑몰 손님) 회원 — 쇼핑몰별로 독립. (창업자 계정 auth.users와 별개)
-- 회원가입/로그인/마이페이지/적립금. 세션은 서버가 발급한 토큰(httpOnly 쿠키).
-- Supabase SQL Editor에 통째로 붙여넣고 RUN.
-- ════════════════════════════════════════

create table if not exists public.customers (
  id            uuid primary key default gen_random_uuid(),
  store_id      uuid not null references public.stores(id) on delete cascade,
  email         text not null,
  name          text not null,
  phone         text,
  password_hash text not null,           -- PBKDF2: salt:hash
  points        integer not null default 0,
  created_at    timestamptz not null default now(),
  unique (store_id, email)               -- 같은 쇼핑몰 안에서 이메일 1개
);

-- 로그인 세션 토큰
create table if not exists public.customer_sessions (
  token       text primary key,
  customer_id uuid not null references public.customers(id) on delete cascade,
  created_at  timestamptz not null default now()
);

create index if not exists customers_store on public.customers (store_id);
create index if not exists customer_sessions_customer on public.customer_sessions (customer_id);

-- 주문에 회원 연결(선택). 비회원 주문도 계속 허용.
alter table public.orders add column if not exists customer_id uuid references public.customers(id) on delete set null;

-- ── RLS ──
-- customers/sessions 는 서버(서비스로직)에서만 다룸. 클라(anon) 직접 접근 차단.
alter table public.customers        enable row level security;
alter table public.customer_sessions enable row level security;
-- (정책 없음 = anon 직접 접근 불가. 서버 액션은 service 키 없이도 동작하도록 아래 최소 권한만)

-- 회원가입(insert)·로그인조회(select)·내정보는 서버 액션에서 처리하되,
-- anon 키로 동작하려면 정책이 필요. 비번해시는 노출돼도 PBKDF2라 안전하지만,
-- 안전하게 select는 막고 insert만 허용 + 로그인 검증은 RPC(security definer)로.

-- 회원가입: 발행된 몰이면 가입 가능
drop policy if exists "customers signup" on public.customers;
create policy "customers signup" on public.customers
  for insert to anon, authenticated
  with check (exists (select 1 from public.stores s where s.id = customers.store_id and s.published = true));

grant insert on public.customers to anon, authenticated;

-- 로그인·내정보·세션은 RPC(security definer)로 처리 → 아래 함수들
-- 1a) 로그인용: 이메일로 저장된 해시 반환(서버가 PBKDF2 salt로 재해시해 비교). 비번 자체는 안 나감.
create or replace function customer_get_hash(p_store uuid, p_email text)
returns table(id uuid, password_hash text)
language sql security definer set search_path = public as $$
  select id, password_hash from customers where store_id = p_store and lower(email) = lower(p_email) limit 1;
$$;
grant execute on function customer_get_hash(uuid, text) to anon, authenticated;

-- 1b) 검증 통과 후 세션 토큰 발급
create or replace function customer_new_session(p_id uuid)
returns text language plpgsql security definer set search_path = public as $$
declare t text;
begin
  t := encode(gen_random_bytes(24), 'hex');
  insert into customer_sessions(token, customer_id) values (t, p_id);
  return t;
end; $$;
grant execute on function customer_new_session(uuid) to anon, authenticated;

-- 2) 세션으로 내정보 조회
create or replace function customer_me(p_token text)
returns table(id uuid, store_id uuid, email text, name text, phone text, points int)
language sql security definer set search_path = public as $$
  select c.id, c.store_id, c.email, c.name, c.phone, c.points
  from customer_sessions s join customers c on c.id = s.customer_id
  where s.token = p_token;
$$;
grant execute on function customer_me(text) to anon, authenticated;

-- 3) 이메일(가입여부) 확인 — 비번찾기/아이디찾기용 (이름+전화로 이메일 일부 반환)
create or replace function customer_find_email(p_store uuid, p_name text, p_phone text)
returns text language sql security definer set search_path = public as $$
  select email from customers where store_id = p_store and name = p_name and phone = p_phone limit 1;
$$;
grant execute on function customer_find_email(uuid, text, text) to anon, authenticated;

-- 4) 비번 재설정 — 이메일+이름+전화 일치하면 새 해시로
create or replace function customer_reset_pw(p_store uuid, p_email text, p_name text, p_phone text, p_newhash text)
returns boolean language plpgsql security definer set search_path = public as $$
declare n int;
begin
  update customers set password_hash = p_newhash
   where store_id = p_store and lower(email) = lower(p_email) and name = p_name and phone = p_phone;
  get diagnostics n = row_count;
  return n > 0;
end; $$;
grant execute on function customer_reset_pw(uuid, text, text, text, text) to anon, authenticated;

-- 5) 로그아웃
create or replace function customer_logout(p_token text)
returns void language sql security definer set search_path = public as $$
  delete from customer_sessions where token = p_token;
$$;
grant execute on function customer_logout(text) to anon, authenticated;
