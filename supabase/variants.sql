-- 옵션 조합별 재고(SKU) (무한분양). 한 줄씩/블록으로 실행. 하위호환(IF NOT EXISTS).
-- variants 구조: [{"key":"빨강|S","stock":5}, {"key":"빨강|M","stock":0}, ...]
--  · key = 옵션 그룹 정의 순서대로 선택 라벨을 "|"로 이어붙임
--  · 옵션 안 쓰는 상품은 variants 빈 배열 → 기존 products.stock 그대로 사용

-- [1] 컬럼
alter table public.products add column if not exists variants jsonb not null default '[]'::jsonb;

-- [2] 조합 재고 차감 RPC (해당 key의 stock을 qty만큼 안전 차감, 음수 방지)
create or replace function public.decrement_variant_stock(pid uuid, p_key text, qty integer)
returns void
language sql
security definer
set search_path = public
as $$
  update public.products
  set variants = (
    select jsonb_agg(
      case when (v->>'key') = p_key
        then jsonb_set(v, '{stock}', to_jsonb(greatest(0, coalesce((v->>'stock')::int, 0) - qty)))
        else v end
    )
    from jsonb_array_elements(variants) v
  )
  where id = pid and jsonb_typeof(variants) = 'array' and jsonb_array_length(variants) > 0;
$$;
grant execute on function public.decrement_variant_stock(uuid, text, integer) to anon, authenticated;
