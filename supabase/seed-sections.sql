-- ════════════════════════════════════════════════════════════
-- seed-sections.sql — 대문 기본 틀 자동 채우기 (RLS 우회, 소유자만)
-- 대문 꾸미기 들어가면 신상·배너·베스트·전체 4블록이 자동으로 떠야 하는데
-- store_sections insert가 RLS에서 막히는 문제를 SECURITY DEFINER 함수로 해결.
-- Supabase SQL Editor에 붙여넣고 RUN.
-- ════════════════════════════════════════════════════════════
create or replace function public.seed_default_sections(p_store uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- 소유자(또는 관리자)가 아니면 아무것도 안 함
  if not exists (
    select 1 from public.stores
    where id = p_store and (owner = auth.uid() or public.is_admin())
  ) then
    return;
  end if;
  -- 이미 섹션이 있으면 건드리지 않음
  if exists (select 1 from public.store_sections where store_id = p_store) then
    return;
  end if;
  -- 기본 대문 틀 4블록 (미리보기 그대로)
  insert into public.store_sections (store_id, type, position, visible, config) values
    (p_store, 'shelf',  0, true, '{"title":"🆕 신상품","subtitle":"방금 들어온 따끈한 신상","source":"new","limit":8}'::jsonb),
    (p_store, 'banner', 1, true, '{"eyebrow":"SPECIAL PICK","title":"이번 주 추천","subtitle":"놓치면 아쉬운 상품을 모았어요","cta_label":"지금 보기","height":"md"}'::jsonb),
    (p_store, 'shelf',  2, true, '{"title":"🔥 베스트","subtitle":"가장 사랑받는 상품","source":"best","limit":8}'::jsonb),
    (p_store, 'grid',   3, true, '{"title":"전체 상품","source":"all"}'::jsonb);
end;
$$;
grant execute on function public.seed_default_sections(uuid) to authenticated;
