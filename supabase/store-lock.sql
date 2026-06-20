-- ════════════════════════════════════════
-- 쇼핑몰 잠금 판정: 몰 주인의 구독 사용기간(plan_until)이 만료되면 손님 화면에서 잠금.
-- 손님은 anon이라 profiles를 직접 못 읽으므로 SECURITY DEFINER로 boolean만 반환.
-- (운영자 몰·사용기간 미설정(무료)은 잠그지 않음)
-- Supabase SQL Editor에 붙여넣고 RUN
-- ════════════════════════════════════════

create or replace function public.is_store_locked(p_store uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select case
    when p.role = 'admin'        then false
    when p.plan_until is null     then false
    else p.plan_until < now()
  end
  from public.stores s
  join public.profiles p on p.id = s.owner
  where s.id = p_store;
$$;

grant execute on function public.is_store_locked(uuid) to anon, authenticated;

-- 확인: select public.is_store_locked('쇼핑몰_id');
