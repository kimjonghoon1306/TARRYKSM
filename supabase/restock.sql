-- 재입고 알림 (무한분양) — 품절 상품에 손님이 알림 신청, 사장님이 신청자 확인.
-- 위에서부터 순서대로 실행.

-- [1] 테이블 (같은 손님이 같은 상품 중복신청 방지)
create table if not exists public.restock_requests (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  contact text not null,           -- 연락처(이메일 또는 전화)
  customer_id uuid references public.customers(id) on delete set null,
  notified boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index if not exists restock_uniq on public.restock_requests (product_id, contact);
create index if not exists restock_store on public.restock_requests (store_id);
alter table public.restock_requests enable row level security;

-- [2] 창업자/관리자: 자기 몰 신청 목록 조회·관리
drop policy if exists "restock owner all" on public.restock_requests;
create policy "restock owner all" on public.restock_requests
  for all to authenticated
  using (exists (select 1 from public.stores s where s.id = restock_requests.store_id and (s.owner = auth.uid() or public.is_admin())))
  with check (exists (select 1 from public.stores s where s.id = restock_requests.store_id and (s.owner = auth.uid() or public.is_admin())));

-- [3] 손님 신청 RPC (발행몰 + 품절 상품일 때만). 비로그인도 연락처로 신청 가능.
create or replace function public.request_restock(p_store uuid, p_product uuid, p_contact text, p_token text default null)
returns boolean
language plpgsql security definer set search_path = public as $$
declare v_cid uuid; v_contact text; v_ok boolean;
begin
  v_contact := btrim(coalesce(p_contact, ''));
  if v_contact = '' then return false; end if;
  select exists(select 1 from stores s where s.id = p_store and s.published = true)
     and exists(select 1 from products pr where pr.id = p_product and pr.store_id = p_store)
  into v_ok;
  if not v_ok then return false; end if;
  if p_token is not null then
    select customer_id into v_cid from customer_sessions where token = p_token;
  end if;
  insert into restock_requests(store_id, product_id, contact, customer_id)
  values (p_store, p_product, left(v_contact, 120), v_cid)
  on conflict (product_id, contact) do nothing;
  return true;
end; $$;
grant execute on function public.request_restock(uuid, uuid, text, text) to anon, authenticated;
