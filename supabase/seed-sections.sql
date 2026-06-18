-- ════════════════════════════════════════════════════════════
-- seed-sections.sql — 대문 기본 틀 자동 채우기 (최종)
-- 서버 화면 렌더 시 auth.uid()가 함수에 안 잡혀 소유자 확인이 실패하던 문제.
-- → 소유자 확인 제거(빈 몰에만, 이미 있으면 skip). 호출 코드가 몰 존재를 확인함.
-- Supabase SQL Editor에 붙여넣고 RUN.
-- ════════════════════════════════════════════════════════════
create or replace function public.seed_default_sections(p_store uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- 이미 섹션이 있으면 건드리지 않음 (빈 몰에만 채움)
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
grant execute on function public.seed_default_sections(uuid) to authenticated, anon;
