-- 자동 쿠폰 발급 (무한분양) — 가입축하 / 재구매. 창업자가 만든 쿠폰 중 골라 자동 발급.
-- customer_coupons unique(customer,coupon)가 중복발급을 막아줌(같은 쿠폰 1회만). 위에서부터 실행.

-- [1] 어떤 쿠폰을 자동 발급할지 stores에 지정 (null = 자동발급 안 함). 쿠폰 삭제 시 자동 해제(set null)
alter table public.stores add column if not exists welcome_coupon uuid references public.coupons(id) on delete set null;
alter table public.stores add column if not exists repurchase_coupon uuid references public.coupons(id) on delete set null;

-- [2] 자동 발급 RPC — 손님 세션 토큰으로 호출(가입 직후·주문 후). 소유자 확인 없이 규칙으로만 동작(security definer).
create or replace function public.auto_issue_coupon(p_token text, p_reason text)
returns void
language plpgsql security definer set search_path = public as $$
declare v_customer uuid; v_store uuid; v_coupon uuid;
begin
  select customer_id into v_customer from customer_sessions where token = p_token;
  if v_customer is null then return; end if;
  select store_id into v_store from customers where id = v_customer;
  if v_store is null then return; end if;
  if p_reason = 'welcome' then
    select welcome_coupon into v_coupon from stores where id = v_store;
  elsif p_reason = 'repurchase' then
    select repurchase_coupon into v_coupon from stores where id = v_store;
  else
    return;
  end if;
  if v_coupon is null then return; end if;
  -- 활성 쿠폰 + 이 몰 소속일 때만
  if not exists (select 1 from coupons where id = v_coupon and store_id = v_store and active) then return; end if;
  insert into customer_coupons(customer_id, store_id, coupon_id)
  values (v_customer, v_store, v_coupon)
  on conflict (customer_id, coupon_id) do nothing;  -- 같은 쿠폰 중복 발급 방지
end; $$;
grant execute on function public.auto_issue_coupon(text, text) to anon, authenticated;
