-- ════════════════════════════════════════
-- 리뷰(상품 후기·별점) — 손님이 작성, 창업자가 답글/삭제
-- Supabase SQL Editor에 통째로 붙여넣고 RUN
-- ════════════════════════════════════════

create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  store_id    uuid not null references public.stores(id)   on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  buyer_name  text not null,
  rating      integer not null default 5 check (rating between 1 and 5),
  comment     text,
  reply       text,                 -- 창업자 답글
  replied_at  timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists reviews_store_created   on public.reviews (store_id, created_at desc);
create index if not exists reviews_product_created on public.reviews (product_id, created_at desc);

alter table public.reviews enable row level security;

-- 조회: 발행된 몰의 리뷰는 누구나 본다(스토어프런트 표시) + 몰 소유자/관리자
drop policy if exists "reviews read public" on public.reviews;
create policy "reviews read public" on public.reviews
  for select to anon, authenticated
  using (
    exists (select 1 from public.stores s
            where s.id = reviews.store_id
              and (s.published = true or s.owner = auth.uid() or public.is_admin()))
  );

-- 작성: 발행된 몰이면 손님(비로그인 포함) 작성 가능
drop policy if exists "reviews insert public" on public.reviews;
create policy "reviews insert public" on public.reviews
  for insert to anon, authenticated
  with check (
    exists (select 1 from public.stores s where s.id = reviews.store_id and s.published = true)
  );

-- 수정(답글): 몰 소유자 또는 관리자만
drop policy if exists "reviews owner update" on public.reviews;
create policy "reviews owner update" on public.reviews
  for update to authenticated
  using (exists (select 1 from public.stores s where s.id = reviews.store_id and (s.owner = auth.uid() or public.is_admin())))
  with check (exists (select 1 from public.stores s where s.id = reviews.store_id and (s.owner = auth.uid() or public.is_admin())));

-- 삭제(부적절 리뷰 정리): 몰 소유자 또는 관리자만
drop policy if exists "reviews owner delete" on public.reviews;
create policy "reviews owner delete" on public.reviews
  for delete to authenticated
  using (exists (select 1 from public.stores s where s.id = reviews.store_id and (s.owner = auth.uid() or public.is_admin())));

-- 확인: select id, buyer_name, rating, comment from public.reviews order by created_at desc;
