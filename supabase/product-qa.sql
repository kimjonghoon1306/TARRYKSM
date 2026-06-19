-- 상품 문의(Q&A) (무한분양) — 손님 질문 + 창업자 답변, 비밀글 옵션.
-- 아이패드 복사 깨짐 대비: 아래 블록을 위에서부터 순서대로 실행하세요.

-- [1] 테이블
create table if not exists public.product_questions (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  buyer_name text not null,
  question text not null,
  answer text,
  secret boolean not null default false,
  created_at timestamptz not null default now(),
  answered_at timestamptz
);

-- [2] 인덱스 + RLS 켜기
create index if not exists product_questions_product on public.product_questions (product_id);
create index if not exists product_questions_store on public.product_questions (store_id);
alter table public.product_questions enable row level security;

-- [3] 소유자(창업자/관리자)는 자기 몰 문의 전체 관리(읽기·답변·삭제)
drop policy if exists "pq owner all" on public.product_questions;
create policy "pq owner all" on public.product_questions
  for all to authenticated
  using (exists (select 1 from public.stores s where s.id = product_questions.store_id and (s.owner = auth.uid() or public.is_admin())))
  with check (exists (select 1 from public.stores s where s.id = product_questions.store_id and (s.owner = auth.uid() or public.is_admin())));

-- [4] 손님 문의 등록 RPC (발행몰 + 그 몰 상품일 때만). 로그인 손님이면 토큰으로 작성자 기록.
create or replace function public.ask_product_question(
  p_store uuid, p_product uuid, p_name text, p_question text,
  p_secret boolean default false, p_token text default null
) returns boolean
language plpgsql security definer set search_path = public as $$
declare v_cid uuid; v_ok boolean; v_name text; v_q text;
begin
  v_name := btrim(coalesce(p_name, ''));
  v_q := btrim(coalesce(p_question, ''));
  if v_name = '' or v_q = '' then return false; end if;
  select exists(select 1 from stores s where s.id = p_store and s.published = true)
     and exists(select 1 from products p where p.id = p_product and p.store_id = p_store)
  into v_ok;
  if not v_ok then return false; end if;
  if p_token is not null then
    select customer_id into v_cid from customer_sessions where token = p_token;
  end if;
  insert into product_questions(store_id, product_id, customer_id, buyer_name, question, secret)
  values (p_store, p_product, v_cid, v_name, left(v_q, 1000), coalesce(p_secret, false));
  return true;
end; $$;
grant execute on function public.ask_product_question(uuid,uuid,text,text,boolean,text) to anon, authenticated;

-- [5] 상품 문의 목록 RPC (손님 화면용). 비밀글은 작성 본인 외에는 내용 마스킹.
create or replace function public.list_product_questions(p_product uuid, p_token text default null)
returns table(id uuid, buyer_name text, question text, answer text, secret boolean, answered boolean, is_mine boolean, created_at timestamptz)
language sql security definer set search_path = public as $$
  with me as (select customer_id as cid from customer_sessions where token = p_token limit 1)
  select q.id,
    q.buyer_name,
    case when q.secret and ((select cid from me) is distinct from q.customer_id) then null else q.question end,
    case when q.secret and ((select cid from me) is distinct from q.customer_id) then null else q.answer end,
    q.secret,
    (q.answer is not null) as answered,
    ((select cid from me) is not null and (select cid from me) = q.customer_id) as is_mine,
    q.created_at
  from product_questions q
  where q.product_id = p_product
  order by q.created_at desc;
$$;
grant execute on function public.list_product_questions(uuid,text) to anon, authenticated;
