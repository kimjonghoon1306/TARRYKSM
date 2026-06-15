-- ════════════════════════════════════════
-- 재고 관리 — products.stock
--  · null = 무제한(재고 관리 안 함)
--  · 0 = 품절,  1 이상 = 남은 수량
-- Supabase SQL Editor에 붙여넣고 RUN
-- ════════════════════════════════════════

alter table public.products add column if not exists stock integer;     -- null=무제한

-- 주문 시 재고를 안전하게 차감하는 함수 (음수 방지, null이면 무제한이라 차감 안 함)
create or replace function public.decrement_stock(pid uuid, qty integer)
returns void
language sql
security definer
set search_path = public
as $$
  update public.products
  set stock = greatest(0, stock - qty)
  where id = pid and stock is not null;
$$;

grant execute on function public.decrement_stock(uuid, integer) to anon, authenticated;

-- 확인: select id, name, stock from public.products;
