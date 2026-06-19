-- 주인 없는(owner null) 쇼핑몰을 현재 로그인 사용자가 가져오기 (무한분양)
-- 몰 생성 초기 버그로 owner가 비어버린 몰을 창업자가 자기 계정으로 연결하는 용도.
-- 이미 주인이 있는 몰은 가져올 수 없음(도용 방지).
create or replace function public.claim_store(p_store uuid)
returns boolean
language plpgsql security definer set search_path = public as $$
begin
  update stores set owner = auth.uid()
  where id = p_store and owner is null and auth.uid() is not null;
  return found;
end; $$;
grant execute on function public.claim_store(uuid) to authenticated;
