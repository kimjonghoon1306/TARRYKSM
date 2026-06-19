-- 상품별/쇼핑몰 SEO (무한분양). 한 줄씩 실행. 하위호환(IF NOT EXISTS).
-- 창업자가 검색 노출용 제목/설명/키워드를 직접 정할 수 있게.
alter table public.stores add column if not exists seo_title text;        -- 검색 제목(비우면 몰 이름)
alter table public.stores add column if not exists seo_desc text;         -- 검색 설명(비우면 자동)
alter table public.stores add column if not exists seo_keywords text;     -- 쉼표 구분 키워드
alter table public.stores add column if not exists seo_noindex boolean default false; -- 검색 노출 끄기
