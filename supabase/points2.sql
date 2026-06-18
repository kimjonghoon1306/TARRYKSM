-- ════════════════════════════════════════
-- 적립금 2단계 — 거래내역 + 결제 시 사용 + 창업자 수동 지급/차감
--  · points.sql 먼저 실행돼 있어야 함 (stores.points_on/points_rate, orders.points_awarded, sync_order_points)
--  · Supabase SQL Editor에 통째로 붙여넣고 RUN. (재실행 안전)
-- ════════════════════════════════════════

-- 1) 주문에 사용한 적립금 기록
alter table public.orders add column if not exists points_used integer not null default 0;

-- 2) 적립금 거래내역 (양수=적립/지급, 음수=사용/차감/회수)
create table if not exists public.point_transactions (
  id            uuid primary key default gen_random_uuid(),
  customer_id   uuid not null references public.customers(id) on delete cascade,
  store_id      uuid not null references public.stores(id) on delete cascade,
  amount        integer not null,
  balance_after integer not null,
  kind          text not null,      -- earn | use | admin_add | admin_sub | revoke
  memo          text,
  order_id      uuid,
  created_at    timestamptz not null default now()
);
create index if not exists pt_customer on public.point_transactions(customer_id, created_at desc);
create index if not exists pt_store    on public.point_transactions(store_id);
alter table public.point_transactions enable row level security;
-- (직접 접근 정책 없음 = 모든 접근은 아래 security definer RPC로만)

-- ── 내부 공용: 적립금 증감 + 내역기록 (잔액 0 미만 방지). 반환 = 변경 후 잔액 ──
create or replace function _apply_points(p_customer uuid, p_amount int, p_kind text, p_memo text, p_order uuid)
returns integer language plpgsql security definer set search_path = public as $$
declare v_store uuid; v_new int;
begin
  select store_id, greatest(0, points + p_amount) into v_store, v_new from customers where id = p_customer;
  if v_store is null then return null; end if;
  update customers set points = v_new where id = p_customer;
  insert into point_transactions(customer_id, store_id, amount, balance_after, kind, memo, order_id)
    values (p_customer, v_store, p_amount, v_new, p_kind, p_memo, p_order);
  return v_new;
end; $$;

-- ── 주문 적립 동기화 (내역 기록 추가). 완료→적립 / 완료이탈→회수 ──
create or replace function sync_order_points(p_order uuid)
returns integer language plpgsql security definer set search_path = public as $$
declare o record; v_on boolean; v_rate int; v_amount int;
begin
  select id, store_id, customer_id, total, status, points_awarded into o from orders where id = p_order;
  if not found then return 0; end if;
  if o.customer_id is null then return 0; end if;

  if o.status <> '완료' then
    if o.points_awarded > 0 then
      perform _apply_points(o.customer_id, -o.points_awarded, 'revoke', '주문 완료 취소로 적립 회수', o.id);
      update orders set points_awarded = 0 where id = o.id;
      return -o.points_awarded;
    end if;
    return 0;
  end if;

  if o.points_awarded > 0 then return 0; end if;          -- 이미 적립됨
  select points_on, points_rate into v_on, v_rate from stores where id = o.store_id;
  if not coalesce(v_on, false) then return 0; end if;
  v_rate := greatest(0, least(50, coalesce(v_rate, 0)));
  v_amount := floor(coalesce(o.total, 0) * v_rate / 100.0);
  if v_amount <= 0 then return 0; end if;
  perform _apply_points(o.customer_id, v_amount, 'earn', '주문 완료 적립', o.id);
  update orders set points_awarded = v_amount where id = o.id;
  return v_amount;
end; $$;
grant execute on function sync_order_points(uuid) to anon, authenticated;

-- ── 창업자: 내 쇼핑몰 회원 목록 + 적립금 잔액 ──
create or replace function list_my_customers()
returns table(id uuid, store_id uuid, store_name text, name text, email text, phone text, points int, created_at timestamptz)
language sql security definer set search_path = public as $$
  select c.id, c.store_id, s.name, c.name, c.email, c.phone, c.points, c.created_at
  from customers c join stores s on s.id = c.store_id
  where s.owner = auth.uid()
  order by c.points desc, c.created_at desc;
$$;
grant execute on function list_my_customers() to authenticated;

-- ── 창업자: 한 회원의 적립금 내역 (소유 확인) ──
create or replace function customer_points_log(p_customer uuid)
returns table(amount int, balance_after int, kind text, memo text, created_at timestamptz)
language sql security definer set search_path = public as $$
  select t.amount, t.balance_after, t.kind, t.memo, t.created_at
  from point_transactions t
  where t.customer_id = p_customer
    and exists (select 1 from customers c join stores s on s.id = c.store_id
                where c.id = t.customer_id and s.owner = auth.uid())
  order by t.created_at desc
  limit 100;
$$;
grant execute on function customer_points_log(uuid) to authenticated;

-- ── 창업자: 회원에게 적립금 수동 지급(+)/차감(-) (소유 확인) ──
create or replace function admin_adjust_points(p_customer uuid, p_amount int, p_memo text)
returns integer language plpgsql security definer set search_path = public as $$
declare v_owner boolean; v_new int;
begin
  select exists (select 1 from customers c join stores s on s.id = c.store_id
                 where c.id = p_customer and s.owner = auth.uid()) into v_owner;
  if not v_owner then raise exception 'not owner'; end if;
  if p_amount = 0 then
    select points into v_new from customers where id = p_customer; return v_new;
  end if;
  v_new := _apply_points(
    p_customer, p_amount,
    case when p_amount > 0 then 'admin_add' else 'admin_sub' end,
    coalesce(nullif(trim(p_memo), ''), case when p_amount > 0 then '관리자 지급' else '관리자 차감' end),
    null);
  return v_new;
end; $$;
grant execute on function admin_adjust_points(uuid, int, text) to authenticated;

-- ── 손님: 결제 시 적립금 사용 (세션 토큰 확인, 잔액 부족이면 0 반환). 반환 = 실제 사용액 ──
create or replace function customer_use_points(p_token text, p_amount int, p_order uuid)
returns integer language plpgsql security definer set search_path = public as $$
declare v_cust uuid; v_pts int;
begin
  if p_amount <= 0 then return 0; end if;
  select c.id, c.points into v_cust, v_pts
    from customer_sessions s join customers c on c.id = s.customer_id
    where s.token = p_token;
  if v_cust is null then return 0; end if;
  if v_pts < p_amount then return 0; end if;     -- 잔액 부족 → 사용 안 함
  perform _apply_points(v_cust, -p_amount, 'use', '주문 결제 사용', p_order);
  return p_amount;
end; $$;
grant execute on function customer_use_points(text, int, uuid) to anon, authenticated;
