-- ════════════════════════════════════════
-- 적립금(포인트) — 쇼핑몰별 설정 + 주문 완료 시 자동 적립
--  · 창업자가 쇼핑몰마다 "적립금 사용" 켜고/끄기 + 적립률(%) 설정
--  · 주문 상태가 '완료'(구매확정) 되면 로그인 손님에게 자동 적립
--  · 완료에서 다른 상태(취소 등)로 바뀌면 적립분 회수 (이중지급/오적립 방지)
-- Supabase SQL Editor에 통째로 붙여넣고 RUN. (이미 있으면 건너뜀 — 재실행 안전)
-- ════════════════════════════════════════

-- 1) 쇼핑몰 설정 컬럼
alter table public.stores add column if not exists points_on   boolean not null default false;  -- 적립금 사용 여부
alter table public.stores add column if not exists points_rate integer not null default 1;      -- 적립률(%)

-- 2) 주문에 적립된 포인트 기록 (멱등성·회수용). 0 = 아직 적립 안 됨
alter table public.orders add column if not exists points_awarded integer not null default 0;

-- 3) 주문 1건의 적립금 상태를 현재 상태에 맞게 동기화 (security definer = customers RLS 우회)
--    · status='완료' + 적립ON + 로그인손님 + 아직 미적립  → floor(total * rate/100) 적립
--    · status≠'완료' + 이미 적립됨                          → 적립분 회수
--    같은 주문에 여러 번 호출돼도 안전(멱등). 반환 = 이번 호출로 바뀐 적립액(+적립/-회수/0)
create or replace function sync_order_points(p_order uuid)
returns integer
language plpgsql security definer set search_path = public as $$
declare
  o            record;
  v_on         boolean;
  v_rate       integer;
  v_amount     integer;
begin
  select id, store_id, customer_id, total, status, points_awarded
    into o from orders where id = p_order;
  if not found then return 0; end if;
  if o.customer_id is null then return 0; end if;  -- 비회원 주문은 적립 대상 아님

  -- 완료가 아닌데 이미 적립돼 있으면 회수
  if o.status <> '완료' then
    if o.points_awarded > 0 then
      update customers set points = greatest(0, points - o.points_awarded) where id = o.customer_id;
      update orders set points_awarded = 0 where id = o.id;
      return -o.points_awarded;
    end if;
    return 0;
  end if;

  -- 여기는 status='완료'
  if o.points_awarded > 0 then return 0; end if;   -- 이미 적립됨(중복방지)

  select points_on, points_rate into v_on, v_rate from stores where id = o.store_id;
  if not coalesce(v_on, false) then return 0; end if;            -- 적립 꺼져있음
  v_rate := greatest(0, least(50, coalesce(v_rate, 0)));         -- 0~50% 안전범위
  v_amount := floor(coalesce(o.total, 0) * v_rate / 100.0);
  if v_amount <= 0 then return 0; end if;

  update customers set points = points + v_amount where id = o.customer_id;
  update orders set points_awarded = v_amount where id = o.id;
  return v_amount;
end; $$;

grant execute on function sync_order_points(uuid) to anon, authenticated;
