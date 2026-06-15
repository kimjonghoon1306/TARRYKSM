-- ════════════════════════════════════════
-- 알림(벨) — 새 주문/새 리뷰가 들어오면 몰 소유자에게 자동 알림
-- notifications 테이블 + 트리거(주문/리뷰 insert 시 자동 생성, SECURITY DEFINER)
-- ⚠️ orders.sql, reviews.sql 먼저 실행한 뒤 이 파일 실행
-- ════════════════════════════════════════

create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  store_id    uuid references public.stores(id) on delete cascade,
  type        text not null default 'order',   -- order | review
  title       text not null,
  body        text,
  link        text,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists notifications_user on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

-- 조회/읽음표시/삭제: 본인 것만. 생성은 트리거(definer)만.
drop policy if exists "notif owner read"   on public.notifications;
create policy "notif owner read"   on public.notifications for select to authenticated using (user_id = auth.uid());
drop policy if exists "notif owner update" on public.notifications;
create policy "notif owner update" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "notif owner delete" on public.notifications;
create policy "notif owner delete" on public.notifications for delete to authenticated using (user_id = auth.uid());

-- 새 주문 → 몰 소유자에게 알림
create or replace function public.notify_new_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare v_owner uuid; v_name text; v_slug text;
begin
  select owner, name, slug into v_owner, v_name, v_slug from public.stores where id = new.store_id;
  if v_owner is not null then
    insert into public.notifications(user_id, store_id, type, title, body, link)
    values (v_owner, new.store_id, 'order',
            format('🧾 새 주문 (%s)', coalesce(v_name,'쇼핑몰')),
            format('%s님이 %s원 주문했어요.', new.buyer_name, to_char(new.total, 'FM999,999,999')),
            '/dashboard/orders');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_notify_new_order on public.orders;
create trigger trg_notify_new_order after insert on public.orders
  for each row execute function public.notify_new_order();

-- 새 리뷰 → 몰 소유자에게 알림
create or replace function public.notify_new_review()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare v_owner uuid; v_name text;
begin
  select owner, name into v_owner, v_name from public.stores where id = new.store_id;
  if v_owner is not null then
    insert into public.notifications(user_id, store_id, type, title, body, link)
    values (v_owner, new.store_id, 'review',
            format('⭐ 새 리뷰 (%s)', coalesce(v_name,'쇼핑몰')),
            format('%s님 · 별점 %s점%s', new.buyer_name, new.rating,
                   case when new.comment is not null and new.comment <> '' then ' · '||left(new.comment,30) else '' end),
            '/dashboard/reviews');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_notify_new_review on public.reviews;
create trigger trg_notify_new_review after insert on public.reviews
  for each row execute function public.notify_new_review();

-- 확인: select type, title, read from public.notifications order by created_at desc;
