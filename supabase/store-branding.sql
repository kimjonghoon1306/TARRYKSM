-- ════════════════════════════════════════
-- 쇼핑몰 상단 꾸미기 — 로고·대문배너·제목·문구
-- Supabase SQL Editor에 붙여넣고 RUN
-- ════════════════════════════════════════

alter table public.stores add column if not exists logo_url text;
alter table public.stores add column if not exists hero_image_url text;
alter table public.stores add column if not exists hero_title text;
alter table public.stores add column if not exists hero_subtitle text;

-- 이미지는 기존 product-images 버킷 재사용 (소유자 uid 폴더 RLS 그대로 적용)
