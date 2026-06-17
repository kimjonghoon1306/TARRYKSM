-- 쇼핑몰 하단 사업자 정보 (한국 전자상거래 법적 표시 의무 항목)
-- 입력하면 쇼핑몰 맨 아래에 격식있게 자동 표시. 비우면 표시 안 함.
-- Supabase SQL Editor 에 붙여넣고 RUN.

alter table public.stores add column if not exists biz_company   text; -- 상호(법인/상점명)
alter table public.stores add column if not exists biz_owner     text; -- 대표자명
alter table public.stores add column if not exists biz_number    text; -- 사업자등록번호
alter table public.stores add column if not exists biz_mailorder text; -- 통신판매업 신고번호
alter table public.stores add column if not exists biz_address   text; -- 사업장 주소
alter table public.stores add column if not exists biz_phone     text; -- 고객센터 전화
alter table public.stores add column if not exists biz_email     text; -- 이메일
