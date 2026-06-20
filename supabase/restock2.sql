-- 재입고 알림 - 손님 본인 신청목록 조회 RPC (무한분양). restock.sql 다음에 실행.
-- 마이페이지에서 "내가 신청한 재입고 상품"을 보여주기 위함. (로그인 손님 세션 토큰 기반)
create or replace function public.my_restock_requests(p_token text)
returns table(id uuid, product_id uuid, product_name text, notified boolean, created_at timestamptz)
language sql security definer set search_path = public as $$
  select r.id, r.product_id, p.name, r.notified, r.created_at
  from restock_requests r
  join customer_sessions s on s.customer_id = r.customer_id
  left join products p on p.id = r.product_id
  where s.token = p_token
  order by r.created_at desc;
$$;
grant execute on function public.my_restock_requests(text) to anon, authenticated;
