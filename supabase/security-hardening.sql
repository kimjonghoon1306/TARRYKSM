-- Security hardening for customer auth RPCs.
-- Run after customers.sql/profile-coupons.sql/checkout-atomic.sql.

alter table public.customer_sessions
  add column if not exists expires_at timestamptz;

update public.customer_sessions
  set expires_at = coalesce(expires_at, created_at + interval '14 days')
  where expires_at is null;

create index if not exists customer_sessions_expires on public.customer_sessions (expires_at);

-- Hash lookup, raw session issuance, and direct reset must not be callable from public clients.
-- The app now performs these operations through the server-only service_role client.
revoke execute on function public.customer_get_hash(uuid, text) from public, anon, authenticated;
revoke execute on function public.customer_new_session(uuid) from public, anon, authenticated;
revoke execute on function public.customer_reset_pw(uuid, text, text, text, text) from public, anon, authenticated;

-- Legacy mutation helpers are now internal-only. Public checkout must go through checkout_place_order_atomic().
revoke execute on function public.decrement_stock(uuid, integer) from public, anon, authenticated;
revoke execute on function public.decrement_variant_stock(uuid, text, integer) from public, anon, authenticated;
revoke execute on function public.redeem_coupon(uuid, text) from public, anon, authenticated;

-- Direct public table inserts can bypass price/stock/coupon validation. Use checkout_place_order_atomic() instead.
drop policy if exists "orders insert public" on public.orders;
drop policy if exists "order_items insert public" on public.order_items;

create or replace function public.customer_me(p_token text)
returns table(id uuid, store_id uuid, email text, name text, phone text, points int)
language sql
security definer
set search_path = public
as $$
  select c.id, c.store_id, c.email, c.name, c.phone, c.points
  from customer_sessions s
  join customers c on c.id = s.customer_id
  where s.token = p_token
    and coalesce(s.expires_at, s.created_at + interval '14 days') > now();
$$;

create or replace function public.customer_logout(p_token text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from customer_sessions where token = p_token;
$$;

-- Keep token-scoped identity helpers public. customer_me rejects expired sessions.
grant execute on function public.customer_me(text) to anon, authenticated;
grant execute on function public.customer_logout(text) to anon, authenticated;
