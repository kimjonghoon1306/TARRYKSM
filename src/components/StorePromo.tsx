"use client";

import { useEffect, useState } from "react";

export type PromoData = {
  storeId: string;
  bar?: { on: boolean; text?: string | null; link?: string | null; bg?: string | null; fg?: string | null } | null;
  popup?: {
    on: boolean;
    title?: string | null;
    body?: string | null;
    image?: string | null;
    btnText?: string | null;
    btnLink?: string | null;
  } | null;
};

// 링크 정규화: http로 시작하면 외부 URL, 아니면 그대로(내부 경로/앵커)로 처리
function hrefOf(link?: string | null): string | null {
  const v = (link || "").trim();
  if (!v) return null;
  return v;
}

export default function StorePromo({ storeId, bar, popup }: PromoData) {
  const [barClosed, setBarClosed] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);

  const barOn = !!bar?.on && !!(bar?.text || "").trim();
  const popupOn = !!popup?.on && !!((popup?.title || "").trim() || (popup?.body || "").trim() || (popup?.image || "").trim());

  // 진입 팝업 — '오늘 그만보기'면 당일 하루 숨김
  useEffect(() => {
    if (!popupOn) return;
    try {
      const key = `promo_popup_${storeId}`;
      const until = localStorage.getItem(key);
      if (until && Number(until) > Date.now()) return;
    } catch {}
    const t = setTimeout(() => setPopupOpen(true), 600);
    return () => clearTimeout(t);
  }, [popupOn, storeId]);

  function closePopup() {
    setPopupOpen(false);
  }
  function hideToday() {
    try {
      localStorage.setItem(`promo_popup_${storeId}`, String(Date.now() + 24 * 60 * 60 * 1000));
    } catch {}
    setPopupOpen(false);
  }

  const barHref = hrefOf(bar?.link);
  const btnHref = hrefOf(popup?.btnLink);

  return (
    <>
      {/* 상단 띠배너 */}
      {barOn && !barClosed && (
        <div
          style={{
            position: "relative", width: "100%", padding: "9px 40px", textAlign: "center",
            fontSize: 13.5, fontWeight: 700, lineHeight: 1.3,
            background: bar?.bg || "#7c5cff", color: bar?.fg || "#fff",
          }}
        >
          {barHref ? (
            <a href={barHref} style={{ color: "inherit", textDecoration: "none" }}>{bar?.text}</a>
          ) : (
            <span>{bar?.text}</span>
          )}
          <button
            onClick={() => setBarClosed(true)}
            aria-label="띠배너 닫기"
            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: "inherit", fontSize: 16, cursor: "pointer", opacity: 0.8 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 진입 팝업 */}
      {popupOn && popupOpen && (
        <div
          onClick={closePopup}
          style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,.55)", display: "grid", placeItems: "center", padding: 20, animation: "promo-fade .25s ease" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: "min(380px,92vw)", background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 30px 70px rgba(0,0,0,.4)", animation: "promo-pop .3s cubic-bezier(.34,1.56,.64,1)" }}
          >
            {popup?.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={popup.image} alt="" style={{ width: "100%", display: "block", maxHeight: 280, objectFit: "cover" }} />
            )}
            <div style={{ padding: "22px 22px 20px", textAlign: "center", color: "#1a1a1a" }}>
              {popup?.title && <div style={{ fontSize: 19, fontWeight: 900, marginBottom: 8 }}>{popup.title}</div>}
              {popup?.body && <div style={{ fontSize: 14, lineHeight: 1.6, color: "#555", whiteSpace: "pre-wrap" }}>{popup.body}</div>}
              {popup?.btnText && btnHref && (
                <a
                  href={btnHref}
                  style={{ display: "block", marginTop: 18, padding: "12px 16px", borderRadius: 12, background: "linear-gradient(135deg,#7c5cff,#ff6ec7)", color: "#fff", fontWeight: 800, fontSize: 14.5, textDecoration: "none" }}
                >
                  {popup.btnText}
                </a>
              )}
            </div>
            <div style={{ display: "flex", borderTop: "1px solid rgba(0,0,0,.07)" }}>
              <button onClick={hideToday} style={{ flex: 1, padding: "12px", background: "transparent", border: "none", color: "#999", fontSize: 13, cursor: "pointer" }}>
                오늘 그만보기
              </button>
              <button onClick={closePopup} style={{ flex: 1, padding: "12px", background: "transparent", border: "none", borderLeft: "1px solid rgba(0,0,0,.07)", color: "#555", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes promo-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes promo-pop { from { opacity: 0; transform: translateY(12px) scale(.96); } to { opacity: 1; transform: none; } }
      `}</style>
    </>
  );
}
