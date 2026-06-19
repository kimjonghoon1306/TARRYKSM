"use client";

import { useState } from "react";

const INPUT =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 dark:border-white/10 dark:bg-white/[0.04]";
const LABEL = "mb-1.5 block text-xs font-semibold text-neutral-500";

type Init = {
  bar_on?: boolean; bar_text?: string | null; bar_link?: string | null; bar_bg?: string | null; bar_fg?: string | null;
  popup_on?: boolean; popup_title?: string | null; popup_body?: string | null; popup_image?: string | null; popup_btn_text?: string | null; popup_btn_link?: string | null;
};

// 상단 띠배너 + 진입 팝업 설정. 각각 ON/OFF 토글, 켜야 입력칸 노출. 저장은 부모 form SaveButton.
export default function PromoSettings({ init }: { init: Init }) {
  const [barOn, setBarOn] = useState(init.bar_on === true);
  const [popupOn, setPopupOn] = useState(init.popup_on === true);

  const Toggle = ({ on, set, name, label, desc }: { on: boolean; set: (v: boolean) => void; name: string; label: string; desc: string }) => (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
      <span className="text-sm font-semibold">{label}<span className="ml-2 text-xs font-normal text-neutral-400">{on ? desc : "꺼짐"}</span></span>
      <span className="relative inline-flex shrink-0">
        <input type="checkbox" name={name} value="1" checked={on} onChange={(e) => set(e.target.checked)} className="peer sr-only" />
        <span className="h-6 w-11 rounded-full bg-neutral-300 transition peer-checked:bg-violet-500 dark:bg-white/15" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
      </span>
    </label>
  );

  return (
    <div className="space-y-5">
      {/* 띠배너 */}
      <div className="space-y-3">
        <Toggle on={barOn} set={setBarOn} name="bar_on" label="📢 상단 띠배너" desc="켜짐 — 대문 맨 위 얇은 줄에 표시" />
        {barOn && (
          <div className="space-y-3 rounded-xl border border-black/5 bg-black/[0.02] p-3 dark:border-white/10 dark:bg-white/[0.03]">
            <div>
              <label className={LABEL}>배너 문구</label>
              <input name="bar_text" defaultValue={init.bar_text || ""} placeholder="예: 🎉 첫 주문 10% 할인! 쿠폰코드 WELCOME" className={INPUT} maxLength={120} />
            </div>
            <div>
              <label className={LABEL}>클릭 링크 (선택 · URL)</label>
              <input name="bar_link" defaultValue={init.bar_link || ""} placeholder="예: https://... (비우면 클릭 안 됨)" className={INPUT} maxLength={300} />
            </div>
            <div className="flex gap-3">
              <div>
                <label className={LABEL}>배경색</label>
                <input name="bar_bg" type="color" defaultValue={init.bar_bg || "#7c5cff"} className="h-10 w-16 cursor-pointer rounded-lg border border-black/10 dark:border-white/10" />
              </div>
              <div>
                <label className={LABEL}>글자색</label>
                <input name="bar_fg" type="color" defaultValue={init.bar_fg || "#ffffff"} className="h-10 w-16 cursor-pointer rounded-lg border border-black/10 dark:border-white/10" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 진입 팝업 */}
      <div className="space-y-3">
        <Toggle on={popupOn} set={setPopupOn} name="popup_on" label="🪟 진입 팝업" desc="켜짐 — 손님 접속 시 가운데 모달로 표시" />
        {popupOn && (
          <div className="space-y-3 rounded-xl border border-black/5 bg-black/[0.02] p-3 dark:border-white/10 dark:bg-white/[0.03]">
            <div>
              <label className={LABEL}>제목</label>
              <input name="popup_title" defaultValue={init.popup_title || ""} placeholder="예: 신규 오픈 이벤트 🎉" className={INPUT} maxLength={60} />
            </div>
            <div>
              <label className={LABEL}>내용</label>
              <textarea name="popup_body" defaultValue={init.popup_body || ""} placeholder="예: 지금 가입하면 5,000원 적립금을 드려요!" className={INPUT} rows={3} maxLength={500} />
            </div>
            <div>
              <label className={LABEL}>이미지 URL (선택)</label>
              <input name="popup_image" defaultValue={init.popup_image || ""} placeholder="예: https://...jpg (비우면 텍스트만)" className={INPUT} maxLength={500} />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[140px]">
                <label className={LABEL}>버튼 문구 (선택)</label>
                <input name="popup_btn_text" defaultValue={init.popup_btn_text || ""} placeholder="예: 이벤트 보러가기" className={INPUT} maxLength={30} />
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className={LABEL}>버튼 링크</label>
                <input name="popup_btn_link" defaultValue={init.popup_btn_link || ""} placeholder="예: https://..." className={INPUT} maxLength={300} />
              </div>
            </div>
            <p className="text-xs text-neutral-400">손님은 “오늘 그만보기”를 누르면 그날 하루 다시 안 떠요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
