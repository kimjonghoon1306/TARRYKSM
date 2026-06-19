-- 쇼핑몰 챗봇(FAQ) (무한분양) — 창업자가 직접 질문/답을 넣고, 손님 쇼핑몰에 챗봇으로 표시.
-- 위에서부터 순서대로 실행하세요.

-- [1] 테이블
create table if not exists public.store_faqs (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  question text not null,
  answer text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- [2] 인덱스 + RLS
create index if not exists store_faqs_store on public.store_faqs (store_id);
alter table public.store_faqs enable row level security;

-- [3] 손님: 발행된 몰의 FAQ는 누구나 읽기
drop policy if exists "faq public read" on public.store_faqs;
create policy "faq public read" on public.store_faqs
  for select to anon, authenticated
  using (exists (select 1 from public.stores s where s.id = store_faqs.store_id and s.published = true));

-- [4] 창업자/관리자: 자기 몰 FAQ 전체 관리
drop policy if exists "faq owner all" on public.store_faqs;
create policy "faq owner all" on public.store_faqs
  for all to authenticated
  using (exists (select 1 from public.stores s where s.id = store_faqs.store_id and (s.owner = auth.uid() or public.is_admin())))
  with check (exists (select 1 from public.stores s where s.id = store_faqs.store_id and (s.owner = auth.uid() or public.is_admin())));

-- [5] (선택) 챗봇 인사말·켜기·모양·이름 설정 (style: designer / robot / bear)
alter table public.stores add column if not exists chat_on boolean default true;
alter table public.stores add column if not exists chat_greeting text;
alter table public.stores add column if not exists chat_style text default 'designer';
alter table public.stores add column if not exists chat_name text;
