-- 쇼핑몰 푸터(하단 회사정보·안내문) 커스터마이즈
-- 비우면 기본값("© {상호} · 온종일로 만든 쇼핑몰") 표시, 회원이 자유롭게 수정/삭제 가능.
-- Supabase SQL Editor 에 붙여넣고 RUN.

alter table public.stores add column if not exists footer_text text;
