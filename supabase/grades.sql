-- 회원 등급(VIP) (무한분양) — 구매액 누적 → 등급 자동 → 등급별 할인.
-- 기존 적립금 로직(sync_order_points)은 건드리지 않고 별도 추가. 위에서부터 순서대로 실행.

-- [1] 누적 구매액 / 멱등 플래그 / 등급 사용 토글 / 주문 등급할인 기록
alter table public.customers add column if not exists total_spent integer not null default 0;
alter table public.orders    add column if not exists spent_counted boolean not null default false;
alter table public.orders    add column if not exists grade_discount integer not null default 0;
alter table public.stores    add column if not exists grades_on boolean default false;

-- [2] 등급 정책 테이블 (몰별 등급 단계)
create table if not exists public.store_grades (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  min_spent integer not null default 0,   -- 이 누적구매액 이상이면 이 등급
  discount_pct integer not null default 0, -- 등급 할인 %
  position integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists store_grades_store on public.store_grades (store_id);
alter table public.store_grades enable row level security;

-- [3] 손님: 발행몰 등급 읽기 / 창업자: 자기 몰 등급 관리
drop policy if exists "grades public read" on public.store_grades;
create policy "grades public read" on public.store_grades
  for select to anon, authenticated
  using (exists (select 1 from public.stores s where s.id = store_grades.store_id and s.published = true));
drop policy if exists "grades owner all" on public.store_grades;
create policy "grades owner all" on public.store_grades
  for all to authenticated
  using (exists (select 1 from public.stores s where s.id = store_grades.store_id and (s.owner = auth.uid() or public.is_admin())))
  with check (exists (select 1 from public.stores s where s.id = store_grades.store_id and (s.owner = auth.uid() or public.is_admin())));

-- [4] 주문 완료 시 누적구매액 반영 (멱등). 완료→누적+, 완료취소→누적- .
create or replace function public.sync_order_grade(p_order uuid)
returns void language plpgsql security definer set search_path = public as $$
declare o record;
begin
  select id, customer_id, total, status, spent_counted into o from orders where id = p_order;
  if not found or o.customer_id is null then return; end if;
  if o.status = '완료' and not o.spent_counted then
    update customers set total_spent = total_spent + coalesce(o.total, 0) where id = o.customer_id;
    update orders set spent_counted = true where id = o.id;
  elsif o.status <> '완료' and o.spent_counted then
    update customers set total_spent = greatest(0, total_spent - coalesce(o.total, 0)) where id = o.customer_id;
    update orders set spent_counted = false where id = o.id;
  end if;
end; $$;
grant execute on function public.sync_order_grade(uuid) to anon, authenticated;

-- [5] 누적구매액으로 현재 등급(할인%) 계산 — 체크아웃/마이페이지 공용
create or replace function public.grade_for_spent(p_store uuid, p_spent integer)
returns table(name text, discount_pct integer, min_spent integer)
language sql security definer set search_path = public as $$
  select g.name, g.discount_pct, g.min_spent
  from store_grades g
  where g.store_id = p_store and g.min_spent <= coalesce(p_spent, 0)
  order by g.min_spent desc
  limit 1;
$$;
grant execute on function public.grade_for_spent(uuid, integer) to anon, authenticated;
