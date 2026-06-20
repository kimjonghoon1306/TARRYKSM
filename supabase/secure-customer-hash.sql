-- ════════════════════════════════════════
-- 보안: 손님 비밀번호 해시 노출 차단
-- customer_get_hash 가 anon(공개 키)에게 해시를 내주던 것을 회수.
-- ⚠️ 반드시 "service_role 키가 Vercel에 설정되고 새 코드가 배포된 뒤" 실행할 것.
--    (그 전에 실행하면 service 키 없는 동안 손님 로그인이 막힘)
-- Supabase SQL Editor에 붙여넣고 RUN
-- ════════════════════════════════════════

revoke execute on function public.customer_get_hash(uuid, text) from anon;
revoke execute on function public.customer_get_hash(uuid, text) from authenticated;

-- 확인(권한 비어 있어야 정상):
-- select proname, proacl from pg_proc where proname = 'customer_get_hash';
