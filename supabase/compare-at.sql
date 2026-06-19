-- 할인가/정가 (무한분양) — 정가(할인 전 가격) 컬럼. 하위호환(IF NOT EXISTS).
-- compare_at이 price보다 크면 손님 화면에 정가 취소선 + 할인율(%)이 표시됩니다.
alter table products add column if not exists compare_at integer;
