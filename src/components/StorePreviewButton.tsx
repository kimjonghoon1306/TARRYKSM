"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// 내 쇼핑몰 전체 미리보기 — 발행 전에도 실제 스토어프런트를 iframe으로 기기별로 본다.
export default function StorePreviewButton({ storeId }: { storeId: string }) {
  const [open, setOpen] = useState(false);
  const [device, setDevice] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const W = { mobile: 390, tablet: 768, desktop: 1280 } as const;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="press-glow inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-105 active:scale-[.98]"
      >
        🔍 전체 미리보기
      </button>

      {open && mounted && createPortal(
        <div
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "16px 12px", background: "rgba(0,0,0,0.78)" }}
        >
          {/* 기기 선택 + 닫기 */}
          <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <div style={{ display: "flex", gap: 6, background: "rgba(255,255,255,0.15)", padding: 5, borderRadius: 999 }}>
              {([["mobile", "📱 모바일"], ["tablet", "📲 태블릿"], ["desktop", "🖥 데스크탑"]] as const).map(([d, label]) => (
                <button key={d} type="button" onClick={() => setDevice(d)}
                  style={{ borderRadius: 999, padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none",
                    background: device === d ? "#fff" : "transparent", color: device === d ? "#111" : "#fff" }}>
                  {label}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setOpen(false)}
              style={{ color: "#fff", fontSize: 13, fontWeight: 700, padding: "8px 16px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.45)", background: "transparent", cursor: "pointer" }}>
              ✕ 닫기
            </button>
          </div>

          {/* 실제 스토어프런트 iframe (선택 기기 너비) */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: `min(${W[device]}px, 96vw)`, flex: 1, minHeight: 0, borderRadius: 14, overflow: "hidden", background: "#fff", boxShadow: "0 25px 60px rgba(0,0,0,.5)", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            <iframe
              src={`/preview/${storeId}`}
              title="쇼핑몰 미리보기"
              style={{ width: "100%", height: "100%", border: "none", display: "block" }}
            />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
