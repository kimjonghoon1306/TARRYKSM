-- 배송비 설정 (무한분양) — 한 줄씩 따로 실행해도 됩니다. 전부 하위호환(IF NOT EXISTS).
-- stores: 배송비 받기 ON/OFF
alter table stores add column if not exists ship_on boolean default false;
-- stores: 기본 배송비 (원)
alter table stores add column if not exists ship_fee integer default 3000;
-- stores: 무료배송 기준액 (이 금액 이상이면 무료, 0이면 무료배송 없음)
alter table stores add column if not exists ship_free_over integer default 0;
-- stores: 도서산간 추가 배송비 (원)
alter table stores add column if not exists ship_extra integer default 0;
-- orders: 실제 부과된 배송비 기록
alter table orders add column if not exists shipping integer default 0;
