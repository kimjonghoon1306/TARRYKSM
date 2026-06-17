-- 결제 수단 노출 선택 (무통장입금 / 카드결제 / 가상계좌)
-- 손님 주문서에 어떤 결제 안내를 보여줄지 사장님이 켜고 끔.
-- Supabase SQL Editor 에 붙여넣고 RUN.

alter table public.stores add column if not exists pay_bank_on  boolean not null default true;  -- 무통장입금(계좌) 노출
alter table public.stores add column if not exists pay_card_on  boolean not null default false; -- 카드결제(PG) 안내 노출
alter table public.stores add column if not exists pay_vbank_on boolean not null default false; -- 가상계좌 안내 노출
