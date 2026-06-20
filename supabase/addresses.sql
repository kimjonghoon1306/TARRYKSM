-- 배송지 주소록 (무한분양) — 손님이 여러 배송지를 저장하고 주문 시 골라 씀.
-- 위에서부터 순서대로 실행. (세션 토큰 기반 RPC, RLS는 서버 차단)

-- [1] 테이블
create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  label text,                -- 별칭 (집/회사 등)
  recipient text not null,   -- 받는 사람
  phone text not null,
  address text not null,
  memo text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists cust_addr_customer on public.customer_addresses (customer_id);
alter table public.customer_addresses enable row level security;
-- (정책 없음 = anon 직접 접근 불가, 아래 RPC로만)

-- [2] 내 주소 목록 (세션 토큰)
create or replace function public.my_addresses(p_token text)
returns table(id uuid, label text, recipient text, phone text, address text, memo text, is_default boolean)
language sql security definer set search_path = public as $$
  select a.id, a.label, a.recipient, a.phone, a.address, a.memo, a.is_default
  from customer_addresses a
  join customer_sessions s on s.customer_id = a.customer_id
  where s.token = p_token
  order by a.is_default desc, a.created_at desc;
$$;
grant execute on function public.my_addresses(text) to anon, authenticated;

-- [3] 주소 추가/저장 (세션 토큰). is_default=true면 기존 기본 해제.
create or replace function public.add_address(p_token text, p_label text, p_recipient text, p_phone text, p_address text, p_memo text, p_default boolean default false)
returns boolean
language plpgsql security definer set search_path = public as $$
declare v_cust uuid;
begin
  select customer_id into v_cust from customer_sessions where token = p_token;
  if v_cust is null then return false; end if;
  if btrim(coalesce(p_recipient,'')) = '' or btrim(coalesce(p_address,'')) = '' then return false; end if;
  if p_default then update customer_addresses set is_default = false where customer_id = v_cust; end if;
  insert into customer_addresses(customer_id, label, recipient, phone, address, memo, is_default)
  values (v_cust, nullif(btrim(p_label),''), btrim(p_recipient), btrim(coalesce(p_phone,'')), btrim(p_address), nullif(btrim(p_memo),''), coalesce(p_default,false));
  return true;
end; $$;
grant execute on function public.add_address(text,text,text,text,text,text,boolean) to anon, authenticated;

-- [4] 주소 삭제 (세션 토큰, 본인 것만)
create or replace function public.delete_address(p_token text, p_id uuid)
returns boolean
language plpgsql security definer set search_path = public as $$
declare v_cust uuid;
begin
  select customer_id into v_cust from customer_sessions where token = p_token;
  if v_cust is null then return false; end if;
  delete from customer_addresses where id = p_id and customer_id = v_cust;
  return true;
end; $$;
grant execute on function public.delete_address(text,uuid) to anon, authenticated;
