-- 이벤트 팝업 / 상단 띠배너 (무한분양). 한 줄씩 실행해도 됨. 전부 하위호환(IF NOT EXISTS).

-- 상단 띠배너 (얇은 줄, 대문 맨 위)
alter table public.stores add column if not exists bar_on boolean default false;
alter table public.stores add column if not exists bar_text text;
alter table public.stores add column if not exists bar_link text;        -- 클릭 시 이동(상품ID 또는 URL, 비우면 클릭 없음)
alter table public.stores add column if not exists bar_bg text default '#7c5cff';
alter table public.stores add column if not exists bar_fg text default '#ffffff';

-- 진입 팝업 (접속 시 가운데 모달)
alter table public.stores add column if not exists popup_on boolean default false;
alter table public.stores add column if not exists popup_title text;
alter table public.stores add column if not exists popup_body text;
alter table public.stores add column if not exists popup_image text;     -- 팝업 이미지 URL(선택)
alter table public.stores add column if not exists popup_btn_text text;  -- 버튼 문구(비우면 버튼 없음)
alter table public.stores add column if not exists popup_btn_link text;  -- 버튼 링크(상품ID 또는 URL)
