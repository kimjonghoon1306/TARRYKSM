-- ════════════════════════════════════════════════════════════
-- admin-delete-user.sql — 플랫폼 관리자의 회원 삭제
-- 관리자만(is_admin), 자기 자신은 삭제 불가.
-- 회원의 쇼핑몰(→상품/주문/섹션 cascade)·프로필·계정을 모두 삭제.
-- ════════════════════════════════════════════════════════════
create or replace function public.admin_delete_user(p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception '권한이 없습니다';
  end if;
  if p_user = auth.uid() then
    raise exception '자기 자신은 삭제할 수 없습니다';
  end if;
  delete from public.stores   where owner = p_user;  -- 쇼핑몰(하위 상품/주문/섹션 cascade)
  delete from public.profiles where id = p_user;     -- 프로필
  delete from auth.users      where id = p_user;     -- 로그인 계정
end;
$$;
grant execute on function public.admin_delete_user(uuid) to authenticated;
