-- ════════════════════════════════════════════════════════════
-- wishlist.sql — 손님 찜(위시리스트)
-- customers(쇼핑몰 손님)에 종속. cust_session 토큰으로만 접근(RPC security definer).
-- 손님 인증은 Supabase auth가 아니라 자체 세션이라, RLS(auth.uid) 대신
-- customer_me 와 같은 방식으로 토큰을 검증하는 RPC로만 읽고/쓴다.
-- 실행 순서: customers.sql(고객·세션 테이블) 먼저.
-- ════════════════════════════════════════════════════════════

create table if not exists public.wishlist (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  store_id    uuid not null references public.stores(id)    on delete cascade,
  product_id  uuid not null references public.products(id)  on delete cascade,
  created_at  timestamptz not null default now(),
  unique (customer_id, product_id)            -- 같은 상품 중복 찜 방지
);
create index if not exists wishlist_customer on public.wishlist (customer_id);

alter table public.wishlist enable row level security;
-- 직접 R/W 정책 없음 = anon/authenticated 가 테이블에 직접 접근 불가.
-- 아래 RPC(security definer)로만 토큰 검증 후 처리.

-- 1) 찜 토글 — 토큰으로 손님 확인 → 이미 찜이면 해제(false), 아니면 추가(true). 반환=현재 찜 상태
create or replace function public.wishlist_toggle(p_token text, p_product uuid)
returns boolean language plpgsql security definer set search_path = public as $w1$
declare cid uuid; sid uuid; ex uuid;
begin
  select c.id, c.store_id into cid, sid
  from customer_sessions s join customers c on c.id = s.customer_id
  where s.token = p_token;
  if cid is null then return false; end if;          -- 비로그인/만료 토큰
  select id into ex from wishlist where customer_id = cid and product_id = p_product;
  if ex is not null then
    delete from wishlist where id = ex;
    return false;                                     -- 해제됨
  end if;
  insert into wishlist(customer_id, store_id, product_id) values (cid, sid, p_product);
  return true;                                        -- 찜됨
end;
$w1$;
grant execute on function public.wishlist_toggle(text, uuid) to anon, authenticated;

-- 2) 찜한 product_id 목록 — 스토어프런트 ♥ 표시용
create or replace function public.wishlist_ids(p_token text)
returns table(product_id uuid)
language sql security definer set search_path = public as $w2$
  select w.product_id from wishlist w
  join customer_sessions s on s.customer_id = w.customer_id
  where s.token = p_token;
$w2$;
grant execute on function public.wishlist_ids(text) to anon, authenticated;

-- 3) 찜한 상품 전체정보 — 마이페이지 찜 목록용 (최근 찜 먼저)
create or replace function public.wishlist_products(p_token text)
returns table(id uuid, name text, price integer, image_url text, emoji text, category text)
language sql security definer set search_path = public as $w3$
  select p.id, p.name, p.price, p.image_url, p.emoji, p.category
  from wishlist w
  join customer_sessions s on s.customer_id = w.customer_id
  join products p on p.id = w.product_id
  where s.token = p_token
  order by w.created_at desc;
$w3$;
grant execute on function public.wishlist_products(text) to anon, authenticated;
