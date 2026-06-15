-- ════════════════════════════════════════
-- 주문(실데이터) — 결제 전이라 '주문 접수'까지. PG 결제는 창업자가 나중에 직접 연동.
-- orders(주문) + order_items(주문 상품 줄)
-- Supabase SQL Editor에 통째로 붙여넣고 RUN
-- ════════════════════════════════════════

create table if not exists public.orders (
  id          uuid primary key default gen_random_uuid(),
  store_id    uuid not null references public.stores(id) on delete cascade,
  buyer_name  text not null,
  buyer_phone text not null,
  buyer_email text,
  address     text,
  memo        text,
  total       integer not null default 0,
  status      text not null default '신규',   -- 신규 | 처리중 | 배송중 | 완료 | 취소
  created_at  timestamptz not null default now()
);

create table if not exists public.order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name       text not null,
  price      integer not null default 0,
  qty        integer not null default 1
);

create index if not exists orders_store_created on public.orders (store_id, created_at desc);
create index if not exists order_items_order on public.order_items (order_id);

alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- ── orders ──
-- 주문 생성: 발행된 몰이면 누구나(비로그인 손님 포함) 주문 접수 가능
drop policy if exists "orders insert public" on public.orders;
create policy "orders insert public" on public.orders
  for insert to anon, authenticated
  with check (
    exists (select 1 from public.stores s where s.id = orders.store_id and s.published = true)
  );

-- 주문 조회: 몰 소유자 또는 관리자만 (손님은 자기 주문도 못 봄 = 개인정보 보호)
drop policy if exists "orders owner read" on public.orders;
create policy "orders owner read" on public.orders
  for select to authenticated
  using (
    exists (select 1 from public.stores s where s.id = orders.store_id and (s.owner = auth.uid() or public.is_admin()))
  );

-- 주문 상태 변경: 몰 소유자 또는 관리자만
drop policy if exists "orders owner update" on public.orders;
create policy "orders owner update" on public.orders
  for update to authenticated
  using (
    exists (select 1 from public.stores s where s.id = orders.store_id and (s.owner = auth.uid() or public.is_admin()))
  )
  with check (
    exists (select 1 from public.stores s where s.id = orders.store_id and (s.owner = auth.uid() or public.is_admin()))
  );

-- ── order_items ──
-- 줄 생성: 부모 주문의 몰이 발행 상태면 누구나(손님 체크아웃)
drop policy if exists "order_items insert public" on public.order_items;
create policy "order_items insert public" on public.order_items
  for insert to anon, authenticated
  with check (
    exists (
      select 1 from public.orders o
      join public.stores s on s.id = o.store_id
      where o.id = order_items.order_id and s.published = true
    )
  );

-- 줄 조회: 몰 소유자 또는 관리자만
drop policy if exists "order_items owner read" on public.order_items;
create policy "order_items owner read" on public.order_items
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      join public.stores s on s.id = o.store_id
      where o.id = order_items.order_id and (s.owner = auth.uid() or public.is_admin())
    )
  );

-- 확인: select id, buyer_name, total, status, created_at from public.orders order by created_at desc;
