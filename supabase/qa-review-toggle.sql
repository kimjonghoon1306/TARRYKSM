-- 상품문의(Q&A) · 리뷰 켜기/끄기 토글 (무한분양). 한 줄씩 실행해도 됨. 기본 ON.
alter table public.stores add column if not exists qa_on boolean default true;
alter table public.stores add column if not exists reviews_on boolean default true;
