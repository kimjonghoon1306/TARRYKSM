-- ════════════════════════════════════════
-- 손님 내정보 수정 + 쿠폰함 (창업자가 회원에게 쿠폰 발급 → 마이페이지 보관함)
--  · customers.sql, coupons.sql 먼저 실행돼 있어야 함
--  · 한 줄 = 한 명령, 주석 없음, 함수별 고유 구분자 → 복사 안전. 작은 조각으로 분할 실행 권장.
-- ════════════════════════════════════════

-- [내정보 수정] 이름/연락처 변경 (세션 토큰 확인)
create or replace function customer_update_profile(p_token text, p_name text, p_phone text) returns boolean language plpgsql security definer set search_path = public as $upd$ declare v_cust uuid; begin select c.id into v_cust from customer_sessions s join customers c on c.id = s.customer_id where s.token = p_token; if v_cust is null then return false; end if; update customers set name = coalesce(nullif(trim(p_name), ''), name), phone = nullif(trim(p_phone), '') where id = v_cust; return true; end; $upd$;
grant execute on function customer_update_profile(text, text, text) to anon, authenticated;

-- [내정보 수정] 비밀번호 변경 (세션 토큰 확인, 새 해시는 서버에서 PBKDF2로 만들어 전달)
create or replace function customer_change_password(p_token text, p_newhash text) returns boolean language plpgsql security definer set search_path = public as $pw$ declare v_cust uuid; begin select c.id into v_cust from customer_sessions s join customers c on c.id = s.customer_id where s.token = p_token; if v_cust is null then return false; end if; update customers set password_hash = p_newhash where id = v_cust; return true; end; $pw$;
grant execute on function customer_change_password(text, text) to anon, authenticated;

-- [쿠폰함] 회원이 보유한 쿠폰
create table if not exists public.customer_coupons (id uuid primary key default gen_random_uuid(), customer_id uuid not null references public.customers(id) on delete cascade, store_id uuid not null references public.stores(id) on delete cascade, coupon_id uuid not null references public.coupons(id) on delete cascade, used boolean not null default false, used_at timestamptz, issued_at timestamptz not null default now());
create unique index if not exists cc_customer_coupon on public.customer_coupons(customer_id, coupon_id);
create index if not exists cc_customer on public.customer_coupons(customer_id);
alter table public.customer_coupons enable row level security;

-- [쿠폰함] 창업자가 회원에게 쿠폰 발급 (소유 확인, 같은 몰의 쿠폰만, 중복무시)
create or replace function issue_coupon_to_customer(p_customer uuid, p_coupon uuid) returns boolean language plpgsql security definer set search_path = public as $iss$ declare v_store uuid; v_ok boolean; begin select store_id into v_store from customers where id = p_customer; if v_store is null then return false; end if; select exists (select 1 from stores s where s.id = v_store and (s.owner = auth.uid() or public.is_admin())) into v_ok; if not v_ok then raise exception 'not owner'; end if; if not exists (select 1 from coupons where id = p_coupon and store_id = v_store) then raise exception 'coupon not in store'; end if; insert into customer_coupons(customer_id, store_id, coupon_id) values (p_customer, v_store, p_coupon) on conflict (customer_id, coupon_id) do nothing; return true; end; $iss$;
grant execute on function issue_coupon_to_customer(uuid, uuid) to authenticated;

-- [쿠폰함] 회원 본인 쿠폰 목록 (세션 토큰 확인, 쿠폰 상세 조인)
create or replace function my_coupons(p_token text) returns table(id uuid, code text, kind text, value int, min_order int, expires_at timestamptz, active boolean, used boolean, used_at timestamptz) language sql security definer set search_path = public as $my$ select cc.id, co.code, co.kind, co.value, co.min_order, co.expires_at, co.active, cc.used, cc.used_at from customer_coupons cc join coupons co on co.id = cc.coupon_id join customer_sessions s on s.customer_id = cc.customer_id where s.token = p_token order by cc.used asc, cc.issued_at desc; $my$;
grant execute on function my_coupons(text) to anon, authenticated;

-- [쿠폰함] 결제 시 해당 코드의 보유쿠폰을 사용처리 (세션 토큰 확인)
create or replace function mark_my_coupon_used(p_token text, p_code text) returns boolean language plpgsql security definer set search_path = public as $mk$ declare v_cust uuid; begin select c.id into v_cust from customer_sessions s join customers c on c.id = s.customer_id where s.token = p_token; if v_cust is null then return false; end if; update customer_coupons cc set used = true, used_at = now() from coupons co where cc.coupon_id = co.id and cc.customer_id = v_cust and cc.used = false and upper(co.code) = upper(trim(p_code)); return true; end; $mk$;
grant execute on function mark_my_coupon_used(text, text) to anon, authenticated;
