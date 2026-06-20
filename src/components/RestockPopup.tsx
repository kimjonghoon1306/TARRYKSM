"use client";

import { useEffect, useState } from "react";

// 재입고 알림 팝업 — 로그인 손님이 신청한 상품이 입고(notified)되면 쇼핑몰 진입 시 1회 표시.
// "오늘 그만보기" 없이, 상품ID 조합을 localStorage에 저장해 같은 입고건은 다시 안 띄움.
export default function RestockPopup({ storeId, slug, items }: { storeId: string; slug?: string; items: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!items.length) return;
    const key = `restock_seen_${storeId}`;
    const sig = items.map((i) => i.id).sort().join(",");
    try {
      if (localStorage.getItem(key) === sig) return; // 같은 입고건 이미 봄
    } catch {}
    const t = setTimeout(() => setOpen(true), 700);
    return () => clearTimeout(t);
  }, [items, storeId]);

  function close() {
    try { localStorage.setItem(`restock_seen_${storeId}`, items.map((i) => i.id).sort().join(",")); } catch {}
    setOpen(false);
  }

  if (!items.length || !open) return null;

  return (
    <div onClick={close} style={{ position: "fixed", inset: 0, zIndex: 2100, background: "rgba(0,0,0,.55)", display: "grid", placeItems: "center", padding: 20, animation: "promo-fade .25s ease" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(360px,92vw)", background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 30px 70px rgba(0,0,0,.4)", animation: "promo-pop .3s cubic-bezier(.34,1.56,.64,1)" }}>
        <div style={{ padding: "26px 22px 20px", textAlign: "center", color: "#1a1a1a" }}>
          <div style={{ fontSize: 40 }}>🎉</div>
          <div style={{ fontSize: 19, fontWeight: 900, marginTop: 8 }}>기다리던 상품이 입고됐어요!</div>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {items.slice(0, 5).map((it) => (
              <div key={it.id} style={{ fontSize: 14.5, fontWeight: 700, padding: "10px 14px", borderRadius: 12, background: "#f3f0ff", color: "#5b21b6" }}>
                ✅ {it.name}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", borderTop: "1px solid rgba(0,0,0,.07)" }}>
          {slug && (
            <a href={`/${slug}`} onClick={close} style={{ flex: 1, padding: "13px", textAlign: "center", background: "linear-gradient(135deg,#7c5cff,#ff6ec7)", color: "#fff", fontWeight: 800, fontSize: 14.5, textDecoration: "none" }}>
              지금 보러가기
            </a>
          )}
          <button onClick={close} style={{ flex: slug ? "0 0 90px" : 1, padding: "13px", background: "transparent", border: "none", color: "#555", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            닫기
          </button>
        </div>
      </div>
      <style jsx global>{`
        @keyframes promo-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes promo-pop { from { opacity: 0; transform: translateY(12px) scale(.96); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}
