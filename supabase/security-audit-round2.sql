-- Security audit round 2.
-- Run after security-hardening.sql.

-- Order sync RPCs mutate customer points / total_spent. They are only needed from
-- authenticated dashboard flows, and must verify the caller owns the order's store
-- or is a platform admin.

create or replace function public.sync_order_points(p_order uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  o record;
  v_on boolean;
  v_rate integer;
  v_amount integer;
  v_balance integer;
begin
  select o.id, o.store_id, o.customer_id, o.total, o.status, o.points_awarded, s.owner
    into o
    from public.orders o
    join public.stores s on s.id = o.store_id
    where o.id = p_order;
  if not found then return 0; end if;
  if auth.uid() is null or (o.owner <> auth.uid() and not public.is_admin()) then
    raise exception 'not owner';
  end if;
  if o.customer_id is null then return 0; end if;

  if o.status <> '완료' then
    if o.points_awarded > 0 then
      update public.customers
        set points = greatest(0, points - o.points_awarded)
        where id = o.customer_id
        returning points into v_balance;
      if to_regclass('public.point_transactions') is not null then
        insert into public.point_transactions(customer_id, store_id, amount, balance_after, kind, memo, order_id)
        values (o.customer_id, o.store_id, -o.points_awarded, v_balance, 'revoke', '주문 완료 취소로 적립 회수', o.id);
      end if;
      update public.orders set points_awarded = 0 where id = o.id;
      return -o.points_awarded;
    end if;
    return 0;
  end if;

  if o.points_awarded > 0 then return 0; end if;
  select points_on, points_rate into v_on, v_rate from public.stores where id = o.store_id;
  if not coalesce(v_on, false) then return 0; end if;
  v_rate := greatest(0, least(50, coalesce(v_rate, 0)));
  v_amount := floor(coalesce(o.total, 0) * v_rate / 100.0);
  if v_amount <= 0 then return 0; end if;

  update public.customers
    set points = points + v_amount
    where id = o.customer_id
    returning points into v_balance;
  if to_regclass('public.point_transactions') is not null then
    insert into public.point_transactions(customer_id, store_id, amount, balance_after, kind, memo, order_id)
    values (o.customer_id, o.store_id, v_amount, v_balance, 'earn', '주문 완료 적립', o.id);
  end if;
  update public.orders set points_awarded = v_amount where id = o.id;
  return v_amount;
end;
$$;

revoke execute on function public.sync_order_points(uuid) from public, anon;
grant execute on function public.sync_order_points(uuid) to authenticated;

create or replace function public.sync_order_grade(p_order uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  o record;
begin
  select o.id, o.customer_id, o.total, o.status, o.spent_counted, s.owner
    into o
    from public.orders o
    join public.stores s on s.id = o.store_id
    where o.id = p_order;
  if not found or o.customer_id is null then return; end if;
  if auth.uid() is null or (o.owner <> auth.uid() and not public.is_admin()) then
    raise exception 'not owner';
  end if;

  if o.status = '완료' and not o.spent_counted then
    update public.customers set total_spent = total_spent + coalesce(o.total, 0) where id = o.customer_id;
    update public.orders set spent_counted = true where id = o.id;
  elsif o.status <> '완료' and o.spent_counted then
    update public.customers set total_spent = greatest(0, total_spent - coalesce(o.total, 0)) where id = o.customer_id;
    update public.orders set spent_counted = false where id = o.id;
  end if;
end;
$$;

revoke execute on function public.sync_order_grade(uuid) from public, anon;
grant execute on function public.sync_order_grade(uuid) to authenticated;

create or replace function public.seed_default_sections(p_store uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not exists (
    select 1
    from public.stores s
    where s.id = p_store
      and (s.owner = auth.uid() or public.is_admin())
  ) then
    raise exception 'not owner';
  end if;
  if exists (select 1 from public.store_sections where store_id = p_store) then
    return;
  end if;
  insert into public.store_sections (store_id, type, position, visible, config) values
    (p_store, 'shelf',  0, true, '{"title":"🆕 신상품","subtitle":"방금 들어온 따끈한 신상","source":"new","limit":8}'::jsonb),
    (p_store, 'banner', 1, true, '{"eyebrow":"SPECIAL PICK","title":"이번 주 추천","subtitle":"놓치면 아쉬운 상품을 모았어요","cta_label":"지금 보기","height":"md"}'::jsonb),
    (p_store, 'shelf',  2, true, '{"title":"🔥 베스트","subtitle":"가장 사랑받는 상품","source":"best","limit":8}'::jsonb),
    (p_store, 'grid',   3, true, '{"title":"전체 상품","source":"all"}'::jsonb);
end;
$$;

revoke execute on function public.seed_default_sections(uuid) from public, anon;
grant execute on function public.seed_default_sections(uuid) to authenticated;

-- Token-scoped customer RPCs must reject expired sessions consistently.

create or replace function public.wishlist_toggle(p_token text, p_product uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare cid uuid; sid uuid; ex uuid;
begin
  select c.id, c.store_id into cid, sid
  from public.customer_sessions s
  join public.customers c on c.id = s.customer_id
  where s.token = p_token
    and coalesce(s.expires_at, s.created_at + interval '14 days') > now();
  if cid is null then return false; end if;
  select id into ex from public.wishlist where customer_id = cid and product_id = p_product;
  if ex is not null then
    delete from public.wishlist where id = ex;
    return false;
  end if;
  insert into public.wishlist(customer_id, store_id, product_id) values (cid, sid, p_product);
  return true;
end;
$$;

create or replace function public.wishlist_ids(p_token text)
returns table(product_id uuid)
language sql
security definer
set search_path = public
as $$
  select w.product_id
  from public.wishlist w
  join public.customer_sessions s on s.customer_id = w.customer_id
  where s.token = p_token
    and coalesce(s.expires_at, s.created_at + interval '14 days') > now();
$$;

create or replace function public.wishlist_products(p_token text)
returns table(id uuid, name text, price integer, image_url text, emoji text, category text)
language sql
security definer
set search_path = public
as $$
  select p.id, p.name, p.price, p.image_url, p.emoji, p.category
  from public.wishlist w
  join public.customer_sessions s on s.customer_id = w.customer_id
  join public.products p on p.id = w.product_id
  where s.token = p_token
    and coalesce(s.expires_at, s.created_at + interval '14 days') > now()
  order by w.created_at desc;
$$;

create or replace function public.my_addresses(p_token text)
returns table(id uuid, label text, recipient text, phone text, address text, memo text, is_default boolean)
language sql
security definer
set search_path = public
as $$
  select a.id, a.label, a.recipient, a.phone, a.address, a.memo, a.is_default
  from public.customer_addresses a
  join public.customer_sessions s on s.customer_id = a.customer_id
  where s.token = p_token
    and coalesce(s.expires_at, s.created_at + interval '14 days') > now()
  order by a.is_default desc, a.created_at desc;
$$;

create or replace function public.add_address(
  p_token text, p_label text, p_recipient text, p_phone text, p_address text,
  p_memo text, p_default boolean default false
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare v_cust uuid;
begin
  select customer_id into v_cust
  from public.customer_sessions
  where token = p_token
    and coalesce(expires_at, created_at + interval '14 days') > now();
  if v_cust is null then return false; end if;
  if btrim(coalesce(p_recipient,'')) = '' or btrim(coalesce(p_address,'')) = '' then return false; end if;
  if p_default then update public.customer_addresses set is_default = false where customer_id = v_cust; end if;
  insert into public.customer_addresses(customer_id, label, recipient, phone, address, memo, is_default)
  values (v_cust, nullif(btrim(p_label),''), btrim(p_recipient), btrim(coalesce(p_phone,'')), btrim(p_address), nullif(btrim(p_memo),''), coalesce(p_default,false));
  return true;
end;
$$;

create or replace function public.delete_address(p_token text, p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare v_cust uuid;
begin
  select customer_id into v_cust
  from public.customer_sessions
  where token = p_token
    and coalesce(expires_at, created_at + interval '14 days') > now();
  if v_cust is null then return false; end if;
  delete from public.customer_addresses where id = p_id and customer_id = v_cust;
  return true;
end;
$$;

create or replace function public.my_restock_requests(p_token text)
returns table(id uuid, product_id uuid, product_name text, notified boolean, created_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select r.id, r.product_id, p.name, r.notified, r.created_at
  from public.restock_requests r
  join public.customer_sessions s on s.customer_id = r.customer_id
  left join public.products p on p.id = r.product_id
  where s.token = p_token
    and coalesce(s.expires_at, s.created_at + interval '14 days') > now()
  order by r.created_at desc;
$$;

create or replace function public.customer_update_profile(p_token text, p_name text, p_phone text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare v_cust uuid;
begin
  select c.id into v_cust
  from public.customer_sessions s
  join public.customers c on c.id = s.customer_id
  where s.token = p_token
    and coalesce(s.expires_at, s.created_at + interval '14 days') > now();
  if v_cust is null then return false; end if;
  update public.customers
    set name = coalesce(nullif(trim(p_name), ''), name),
        phone = nullif(trim(p_phone), '')
    where id = v_cust;
  return true;
end;
$$;

create or replace function public.customer_change_password(p_token text, p_newhash text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare v_cust uuid;
begin
  select c.id into v_cust
  from public.customer_sessions s
  join public.customers c on c.id = s.customer_id
  where s.token = p_token
    and coalesce(s.expires_at, s.created_at + interval '14 days') > now();
  if v_cust is null then return false; end if;
  update public.customers set password_hash = p_newhash where id = v_cust;
  return true;
end;
$$;

create or replace function public.my_coupons(p_token text)
returns table(id uuid, code text, kind text, value int, min_order int, expires_at timestamptz, active boolean, used boolean, used_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select cc.id, co.code, co.kind, co.value, co.min_order, co.expires_at, co.active, cc.used, cc.used_at
  from public.customer_coupons cc
  join public.coupons co on co.id = cc.coupon_id
  join public.customer_sessions s on s.customer_id = cc.customer_id
  where s.token = p_token
    and coalesce(s.expires_at, s.created_at + interval '14 days') > now()
  order by cc.used asc, cc.issued_at desc;
$$;

create or replace function public.mark_my_coupon_used(p_token text, p_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare v_cust uuid;
begin
  select c.id into v_cust
  from public.customer_sessions s
  join public.customers c on c.id = s.customer_id
  where s.token = p_token
    and coalesce(s.expires_at, s.created_at + interval '14 days') > now();
  if v_cust is null then return false; end if;
  update public.customer_coupons cc
    set used = true, used_at = now()
    from public.coupons co
    where cc.coupon_id = co.id
      and cc.customer_id = v_cust
      and cc.used = false
      and upper(co.code) = upper(trim(p_code));
  return true;
end;
$$;

create or replace function public.auto_issue_coupon(p_token text, p_reason text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_customer uuid; v_store uuid; v_coupon uuid;
begin
  select customer_id into v_customer
  from public.customer_sessions
  where token = p_token
    and coalesce(expires_at, created_at + interval '14 days') > now();
  if v_customer is null then return; end if;
  select store_id into v_store from public.customers where id = v_customer;
  if v_store is null then return; end if;
  if p_reason = 'welcome' then
    select welcome_coupon into v_coupon from public.stores where id = v_store;
  elsif p_reason = 'repurchase' then
    select repurchase_coupon into v_coupon from public.stores where id = v_store;
  else
    return;
  end if;
  if v_coupon is null then return; end if;
  if not exists (select 1 from public.coupons where id = v_coupon and store_id = v_store and active) then return; end if;
  insert into public.customer_coupons(customer_id, store_id, coupon_id)
  values (v_customer, v_store, v_coupon)
  on conflict (customer_id, coupon_id) do nothing;
end;
$$;

create or replace function public.customer_use_points(p_token text, p_amount int, p_order uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare v_cust uuid; v_store uuid; v_pts int; v_balance int;
begin
  if p_amount <= 0 then return 0; end if;
  select c.id, c.store_id, c.points into v_cust, v_store, v_pts
  from public.customer_sessions s
  join public.customers c on c.id = s.customer_id
  where s.token = p_token
    and coalesce(s.expires_at, s.created_at + interval '14 days') > now();
  if v_cust is null then return 0; end if;
  if v_pts < p_amount then return 0; end if;
  update public.customers
    set points = greatest(0, points - p_amount)
    where id = v_cust
    returning points into v_balance;
  if to_regclass('public.point_transactions') is not null then
    insert into public.point_transactions(customer_id, store_id, amount, balance_after, kind, memo, order_id)
    values (v_cust, v_store, -p_amount, v_balance, 'use', '주문 결제 사용', p_order);
  end if;
  return p_amount;
end;
$$;

create or replace function public.ask_product_question(
  p_store uuid, p_product uuid, p_name text, p_question text,
  p_secret boolean default false, p_token text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare v_cid uuid; v_ok boolean; v_name text; v_q text;
begin
  v_name := btrim(coalesce(p_name, ''));
  v_q := btrim(coalesce(p_question, ''));
  if v_name = '' or v_q = '' then return false; end if;
  select exists(select 1 from public.stores s where s.id = p_store and s.published = true)
     and exists(select 1 from public.products p where p.id = p_product and p.store_id = p_store)
  into v_ok;
  if not v_ok then return false; end if;
  if p_token is not null then
    select customer_id into v_cid
    from public.customer_sessions
    where token = p_token
      and coalesce(expires_at, created_at + interval '14 days') > now();
  end if;
  insert into public.product_questions(store_id, product_id, customer_id, buyer_name, question, secret)
  values (p_store, p_product, v_cid, v_name, left(v_q, 1000), coalesce(p_secret, false));
  return true;
end;
$$;

create or replace function public.list_product_questions(p_product uuid, p_token text default null)
returns table(id uuid, buyer_name text, question text, answer text, secret boolean, answered boolean, is_mine boolean, created_at timestamptz)
language sql
security definer
set search_path = public
as $$
  with me as (
    select customer_id as cid
    from public.customer_sessions
    where token = p_token
      and coalesce(expires_at, created_at + interval '14 days') > now()
    limit 1
  )
  select q.id,
    q.buyer_name,
    case when q.secret and ((select cid from me) is distinct from q.customer_id) then null else q.question end,
    case when q.secret and ((select cid from me) is distinct from q.customer_id) then null else q.answer end,
    q.secret,
    (q.answer is not null) as answered,
    ((select cid from me) is not null and (select cid from me) = q.customer_id) as is_mine,
    q.created_at
  from public.product_questions q
  where q.product_id = p_product
  order by q.created_at desc;
$$;

-- Keep public customer-token functions callable by the storefront, but remove the
-- implicit PUBLIC grant so only anon/authenticated roles are explicit.
revoke execute on function public.wishlist_toggle(text, uuid) from public;
revoke execute on function public.wishlist_ids(text) from public;
revoke execute on function public.wishlist_products(text) from public;
revoke execute on function public.my_addresses(text) from public;
revoke execute on function public.add_address(text,text,text,text,text,text,boolean) from public;
revoke execute on function public.delete_address(text,uuid) from public;
revoke execute on function public.my_restock_requests(text) from public;
revoke execute on function public.customer_update_profile(text, text, text) from public;
revoke execute on function public.customer_change_password(text, text) from public;
revoke execute on function public.my_coupons(text) from public;
revoke execute on function public.mark_my_coupon_used(text, text) from public;
revoke execute on function public.auto_issue_coupon(text, text) from public;
revoke execute on function public.customer_use_points(text, int, uuid) from public;
revoke execute on function public.ask_product_question(uuid, uuid, text, text, boolean, text) from public;
revoke execute on function public.list_product_questions(uuid, text) from public;

grant execute on function public.wishlist_toggle(text, uuid) to anon, authenticated;
grant execute on function public.wishlist_ids(text) to anon, authenticated;
grant execute on function public.wishlist_products(text) to anon, authenticated;
grant execute on function public.my_addresses(text) to anon, authenticated;
grant execute on function public.add_address(text,text,text,text,text,text,boolean) to anon, authenticated;
grant execute on function public.delete_address(text,uuid) to anon, authenticated;
grant execute on function public.my_restock_requests(text) to anon, authenticated;
grant execute on function public.customer_update_profile(text, text, text) to anon, authenticated;
grant execute on function public.customer_change_password(text, text) to anon, authenticated;
grant execute on function public.my_coupons(text) to anon, authenticated;
grant execute on function public.mark_my_coupon_used(text, text) to anon, authenticated;
grant execute on function public.auto_issue_coupon(text, text) to anon, authenticated;
grant execute on function public.customer_use_points(text, int, uuid) to anon, authenticated;
grant execute on function public.ask_product_question(uuid, uuid, text, text, boolean, text) to anon, authenticated;
grant execute on function public.list_product_questions(uuid, text) to anon, authenticated;
