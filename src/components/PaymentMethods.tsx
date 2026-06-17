"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// 결제 수단 노출 선택 + 자세한 안내 팝업.
// hidden input(pay_bank_on / pay_card_on / pay_vbank_on)으로 setStorePayment에 제출.
type Method = {
  key: "bank" | "card" | "vbank";
  field: string;
  icon: string;
  title: string;
  short: string;
  detail: string;
};

const METHODS: Method[] = [
  {
    key: "bank",
    field: "pay_bank_on",
    icon: "🏦",
    title: "무통장입금 (계좌이체)",
    short: "손님이 위 계좌로 직접 입금. 가장 간단하고 수수료 없음.",
    detail:
      "손님이 주문할 때 입력한 계좌번호를 보고 직접 이체합니다.\n\n• 별도 가입·심사 없이 바로 사용\n• 결제 수수료 0원\n• 입금 확인은 사장님이 통장에서 직접 확인 후 발송\n• 입금자명을 주문자명과 같게 안내하면 확인이 편해요\n\n👉 소규모·시작 단계에 가장 추천돼요.",
  },
  {
    key: "card",
    field: "pay_card_on",
    icon: "💳",
    title: "카드결제 (PG 연동)",
    short: "신용·체크카드 즉시 결제. PG사 가입·심사 필요.",
    detail:
      "토스페이먼츠·나이스페이 등 PG(전자결제대행)사에 가입하면 손님이 카드로 바로 결제할 수 있어요.\n\n• 손님 편의 최고 (즉시 결제·자동 확인)\n• PG사 가입 + 사업자등록 + 심사 필요 (보통 2~5일)\n• 결제 수수료 약 2.5~3.4% 발생\n• 정산은 PG사가 영업일 기준 며칠 뒤 입금\n\n⚠️ 지금은 '안내 노출'만 켜둘 수 있고, 실제 카드결제 연동(본인 PG 계정 연결)은 곧 제공돼요. 그 전까지는 무통장입금과 함께 쓰는 걸 권장해요.",
  },
  {
    key: "vbank",
    field: "pay_vbank_on",
    icon: "🧾",
    title: "가상계좌",
    short: "주문마다 1회용 입금 계좌 자동 발급. PG 연동 필요.",
    detail:
      "주문할 때마다 손님 전용 1회용 입금 계좌가 자동으로 발급됩니다.\n\n• 입금 확인이 자동 (누가 얼마 넣었는지 자동 매칭)\n• 무통장입금의 '입금자명 확인' 번거로움이 없음\n• PG사 가입·심사 필요 (카드결제와 동일)\n• 발급·입금 건당 소액 수수료\n\n⚠️ 가상계좌도 PG 연동이 있어야 자동 발급돼요. 지금은 '안내 노출'만 켤 수 있고 실제 발급 연동은 곧 제공됩니다.\n\n❓ 카드·가상계좌를 발급받아도 무통장 계좌번호를 함께 노출할지는 위 '무통장입금'을 같이 켜두면 됩니다.",
  },
];

export default function PaymentMethods({
  bankOn,
  cardOn,
  vbankOn,
}: {
  bankOn: boolean;
  cardOn: boolean;
  vbankOn: boolean;
}) {
  const [on, setOn] = useState<Record<string, boolean>>({
    bank: bankOn,
    card: cardOn,
    vbank: vbankOn,
  });
  const [info, setInfo] = useState<Method | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="space-y-2">
      {METHODS.map((m) => (
        <div
          key={m.key}
          className="flex items-start gap-3 rounded-xl border border-black/10 p-3 dark:border-white/10"
        >
          {/* hidden 제출값 */}
          <input type="hidden" name={m.field} value={on[m.key] ? "1" : ""} />
          <span className="text-2xl leading-none">{m.icon}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold">{m.title}</span>
              <button
                type="button"
                onClick={() => setInfo(m)}
                className="grid h-4 w-4 place-items-center rounded-full bg-neutral-300 text-[10px] font-bold text-white hover:bg-violet-500 dark:bg-neutral-600"
                title="자세히"
              >
                i
              </button>
            </div>
            <p className="mt-0.5 text-xs text-neutral-500">{m.short}</p>
          </div>
          {/* 토글 */}
          <button
            type="button"
            onClick={() => setOn((o) => ({ ...o, [m.key]: !o[m.key] }))}
            className={
              "relative h-6 w-11 flex-none rounded-full transition " +
              (on[m.key] ? "bg-violet-500" : "bg-neutral-300 dark:bg-neutral-600")
            }
            aria-pressed={on[m.key]}
          >
            <span
              className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
              style={{ left: on[m.key] ? 22 : 2 }}
            />
          </button>
        </div>
      ))}

      {/* 안내 팝업 */}
      {info && mounted && createPortal(
        <div
          onClick={() => setInfo(null)}
          style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.6)" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#15161f]"
            style={{ width: "100%", maxWidth: 460, maxHeight: "82vh", overflowY: "auto", borderRadius: 18, padding: 24, boxShadow: "0 25px 60px rgba(0,0,0,.4)" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 28 }}>{info.icon}</span>
              <b style={{ fontSize: 17 }}>{info.title}</b>
              <button type="button" onClick={() => setInfo(null)} className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white" style={{ marginLeft: "auto", fontSize: 22, lineHeight: 1, cursor: "pointer" }}>✕</button>
            </div>
            <p style={{ whiteSpace: "pre-line", fontSize: 13.5, lineHeight: 1.75, color: "var(--tw-prose, inherit)" }} className="text-neutral-600 dark:text-neutral-300">
              {info.detail}
            </p>
            <button
              type="button"
              onClick={() => setInfo(null)}
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 py-2.5 text-sm font-bold text-white"
            >
              이해했어요
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
