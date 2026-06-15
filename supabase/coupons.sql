-- ════════════════════════════════════════
-- 쿠폰(할인코드) — 창업자가 발급, 손님이 체크아웃에서 코드 입력해 할인
-- coupons 테이블 + orders 할인 컬럼 + 검증/사용 RPC(SECURITY DEFINER)
-- Supabase SQL Editor에 통째로 붙여넣고 RUN
-- ════════════════════════════════════════

create table if not exists public.coupons (
  id          uuid primary key default gen_random_uuid(),
  store_id    uuid not null references public.stores(id) on delete cascade,
  code        text not null,
  kind        text not null default 'percent',   -- percent(%) | amount(원)
  value       integer not null default 0,        -- 10(%) 또는 3000(원)
  min_order   integer not null default 0,        -- 최소 주문금액
  max_uses    integer,                           -- null = 무제한
  used_count  integer not null default 0,
  active      boolean not null default true,
  expires_at  timestamptz,                       -- null = 무기한
  created_at  timestamptz not null default now()
);

create unique index if not exists coupons_store_code on public.coupons (store_id, upper(code));
create index if not exists coupons_store on public.coupons (store_id);

-- 주문에 할인/쿠폰 흔적
alter table public.orders add column if not exists discount    integer not null default 0;
alter table public.orders add column if not exists coupon_code text;

alter table public.coupons enable row level security;

-- 쿠폰 관리(목록/생성/수정/삭제): 몰 소유자 또는 관리자만. (코드 목록은 anon에게 노출 안 함)
drop policy if exists "coupons owner all" on public.coupons;
create policy "coupons owner all" on public.coupons
  for all to authenticated
  using (exists (select 1 from public.stores s where s.id = coupons.store_id and (s.owner = auth.uid() or public.is_admin())))
  with check (exists (select 1 from public.stores s where s.id = coupons.store_id and (s.owner = auth.uid() or public.is_admin())));

-- 손님 체크아웃용 검증: 코드+소계로 적용 가능 여부·할인액 계산 (코드 목록 노출 없이 단건 검증)
create or replace function public.validate_coupon(p_store_id uuid, p_code text, p_subtotal integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.coupons;
  disc integer := 0;
begin
  select * into c from public.coupons
   where store_id = p_store_id and upper(code) = upper(trim(p_code))
   limit 1;
  if not found then return jsonb_build_object('ok', false, 'error', '없는 쿠폰 코드예요.'); end if;
  if not c.active then return jsonb_build_object('ok', false, 'error', '사용할 수 없는 쿠폰이에요.'); end if;
  if c.expires_at is not null and c.expires_at < now() then
    return jsonb_build_object('ok', false, 'error', '기간이 만료된 쿠폰이에요.');
  end if;
  if c.max_uses is not null and c.used_count >= c.max_uses then
    return jsonb_build_object('ok', false, 'error', '사용 한도가 끝난 쿠폰이에요.');
  end if;
  if p_subtotal < c.min_order then
    return jsonb_build_object('ok', false, 'error', format('%s원 이상 주문 시 사용할 수 있어요.', c.min_order));
  end if;
  if c.kind = 'amount' then disc := c.value;
  else disc := floor(p_subtotal * c.value / 100.0); end if;
  if disc > p_subtotal then disc := p_subtotal; end if;
  return jsonb_build_object('ok', true, 'discount', disc, 'code', c.code, 'kind', c.kind, 'value', c.value);
end;
$$;

-- 주문 확정 후 사용횟수 +1 (서버에서 호출)
create or replace function public.redeem_coupon(p_store_id uuid, p_code text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.coupons set used_count = used_count + 1
   where store_id = p_store_id and upper(code) = upper(trim(p_code));
$$;

grant execute on function public.validate_coupon(uuid, text, integer) to anon, authenticated;
grant execute on function public.redeem_coupon(uuid, text) to anon, authenticated;

-- 확인: select code, kind, value, used_count, active from public.coupons;
