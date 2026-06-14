-- ════════════════════════════════════════
-- 상품 이미지 업로드 — products.image_url 컬럼 + Storage 버킷 + RLS
-- Supabase SQL Editor에 통째로 붙여넣고 RUN
-- ════════════════════════════════════════

-- 1) products에 이미지 URL 컬럼
alter table public.products
  add column if not exists image_url text;

-- 2) 공개 버킷 생성 (이미 있으면 무시)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- 3) Storage RLS 정책
-- 읽기: 누구나 (공개 스토어프런트에서 이미지 표시)
drop policy if exists "product-images public read" on storage.objects;
create policy "product-images public read"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- 업로드: 로그인 사용자, 본인 폴더(첫 경로 = uid)만
drop policy if exists "product-images owner insert" on storage.objects;
create policy "product-images owner insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 교체/삭제: 본인 폴더만
drop policy if exists "product-images owner update" on storage.objects;
create policy "product-images owner update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "product-images owner delete" on storage.objects;
create policy "product-images owner delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
