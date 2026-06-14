-- ════════════════════════════════════════
-- 전화번호로 가입 이메일 찾기 (마스킹 반환)
-- Supabase SQL Editor에 붙여넣고 RUN
-- 가입 시 전화번호는 auth user metadata(phone)에 숫자만 저장됨.
-- ════════════════════════════════════════

create or replace function public.find_email_by_phone(p text)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  e text;
  digits text := regexp_replace(coalesce(p, ''), '[^0-9]', '', 'g');
begin
  if digits = '' then
    return null;
  end if;

  select u.email into e
  from auth.users u
  where regexp_replace(coalesce(u.raw_user_meta_data->>'phone', ''), '[^0-9]', '', 'g') = digits
  limit 1;

  if e is null then
    return null;
  end if;

  -- 마스킹: 앞 2글자 + *** + @도메인  (예: ki***@gmail.com)
  return left(split_part(e, '@', 1), 2) || '***@' || split_part(e, '@', 2);
end;
$$;

-- 비로그인 사용자도 호출 가능 (이메일 찾기 페이지)
grant execute on function public.find_email_by_phone(text) to anon, authenticated;
