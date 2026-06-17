"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { STOCK_IMAGES, STOCK_GROUPS } from "@/lib/stockImages";

// 상품 사진 입력: ① 직접 업로드  ② 무료 이미지 라이브러리에서 고르기  ③ 제거
// 서버 폼(action) 제출값: image(file) · stock_image_url(hidden) · remove_image(hidden)
export default function ProductImagePicker({
  initialUrl,
  onChange,
}: {
  initialUrl?: string | null;
  onChange?: (url: string) => void;
}) {
  const [picked, setPicked] = useState<string>("");
  const [pickedCat, setPickedCat] = useState<string>("");
  const [uploadPreview, setUploadPreview] = useState<string>("");
  const [removed, setRemoved] = useState(false);
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState<(typeof STOCK_GROUPS)[number]>("전체");
  const [pressed, setPressed] = useState<string>("");
  const [fromLibrary, setFromLibrary] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const preview = uploadPreview || picked || (removed ? "" : initialUrl || "");

  const list = useMemo(
    () => (group === "전체" ? STOCK_IMAGES : STOCK_IMAGES.filter((i) => i.group === group)),
    [group]
  );

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) { const u = URL.createObjectURL(f); setUploadPreview(u); setPicked(""); setRemoved(false); setFromLibrary(false); onChange?.(u); }
  }
  function pick(src: string, cat: string) {
    setPicked(src); setPickedCat(cat); setUploadPreview(""); setRemoved(false); setFromLibrary(true); onChange?.(src);
    const fi = document.getElementById("product-image-file") as HTMLInputElement | null;
    if (fi) fi.value = "";
    // 선택을 0.45초 보여준 뒤 닫기 (사용자가 체크표시를 확인하도록)
    setTimeout(() => setOpen(false), 450);
  }
  function clearImg() {
    setPicked(""); setPickedCat(""); setUploadPreview(""); setRemoved(true); setFromLibrary(false); onChange?.("");
    const fi = document.getElementById("product-image-file") as HTMLInputElement | null;
    if (fi) fi.value = "";
  }

  return (
    <div>
      <input type="hidden" name="stock_image_url" value={picked} />
      <input type="hidden" name="remove_image" value={removed ? "1" : ""} />

      <div className="flex items-start gap-3">
        {/* 미리보기 + 적용 확인 배지 */}
        <div style={{ position: "relative", width: 84, height: 84, flex: "0 0 auto" }}>
          <div className="bg-black/[0.04] dark:bg-white/[0.06]"
            style={{ width: "100%", height: "100%", borderRadius: 12, overflow: "hidden", display: "grid", placeItems: "center", fontSize: 30 }}>
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : "📦"}
          </div>
          {preview && (
            <span style={{
              position: "absolute", top: -6, right: -6, background: "#16a34a", color: "#fff",
              borderRadius: 999, fontSize: 11, fontWeight: 800, padding: "2px 7px", boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
            }}>✓</span>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setOpen(true)}
              className="rounded-lg bg-gradient-to-r from-violet-500 to-pink-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-105">
              🖼 무료 이미지에서 고르기
            </button>
            <label className="cursor-pointer rounded-lg border border-black/10 px-3 py-2 text-sm font-medium text-neutral-600 transition hover:border-violet-500 dark:border-white/15 dark:text-neutral-300">
              📁 직접 업로드
              <input id="product-image-file" name="image" type="file" accept="image/*" onChange={onUpload} className="hidden" />
            </label>
            {preview && (
              <button type="button" onClick={clearImg}
                className="rounded-lg border border-black/10 px-3 py-2 text-sm text-neutral-500 transition hover:border-rose-400 hover:text-rose-500 dark:border-white/15">
                제거
              </button>
            )}
          </div>
          {/* 적용 확인 문구 */}
          {fromLibrary && picked ? (
            <p style={{ fontSize: 13, fontWeight: 700, color: "#16a34a" }}>✓ ‘{pickedCat}’ 이미지가 적용됐어요</p>
          ) : uploadPreview ? (
            <p style={{ fontSize: 13, fontWeight: 700, color: "#16a34a" }}>✓ 업로드한 사진이 적용됐어요</p>
          ) : (
            <p className="text-xs text-neutral-400">상품 사진이 없어도 무료 이미지 라이브러리(66종)에서 골라 바로 쓸 수 있어요.</p>
          )}
        </div>
      </div>

      {/* 라이브러리 모달 — Portal로 body 최상위에 렌더(부모 stacking context/transform 갇힘 방지) */}
      {open && mounted && createPortal(
        <div
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 12, background: "rgba(0,0,0,0.6)" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#15161f]"
            style={{ position: "relative", display: "flex", flexDirection: "column", width: "100%", maxWidth: 720, maxHeight: "88vh", overflow: "hidden", borderRadius: 16, boxShadow: "0 25px 60px rgba(0,0,0,0.35)" }}
          >
            <div className="border-b border-black/10 dark:border-white/10" style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", flex: "0 0 auto" }}>
              <b style={{ fontSize: 15 }}>🖼 무료 이미지 라이브러리</b>
              <span className="text-neutral-400" style={{ fontSize: 12 }}>탭하면 바로 적용돼요</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="닫기"
                className="text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
                style={{ marginLeft: "auto", fontSize: 24, lineHeight: 1, cursor: "pointer", padding: "2px 8px" }}>✕</button>
            </div>
            <div style={{ display: "flex", gap: 8, padding: "12px 16px 0", flex: "0 0 auto" }}>
              {STOCK_GROUPS.map((g) => (
                <button key={g} type="button" onClick={() => setGroup(g)}
                  className={group === g ? "text-white" : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-300"}
                  style={{ borderRadius: 999, padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", background: group === g ? "#8b5cf6" : "rgba(0,0,0,0.06)" }}>
                  {g}
                </button>
              ))}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",  // 모바일·데스크탑 자동 칸수
                gap: 10,
                overflowY: "auto",
                padding: 16,
                flex: 1,
                minHeight: 0,
                WebkitOverflowScrolling: "touch",
              }}
            >
              {list.map((img) => {
                const isPicked = picked === img.src;
                const isPressed = pressed === img.src;
                return (
                  <button
                    key={img.src}
                    type="button"
                    onClick={() => pick(img.src, img.cat)}
                    onPointerDown={() => setPressed(img.src)}
                    onPointerUp={() => setPressed("")}
                    onPointerLeave={() => setPressed("")}
                    title={img.cat}
                    style={{
                      position: "relative",
                      width: "100%",
                      height: 0,
                      paddingBottom: "100%",
                      overflow: "hidden",
                      borderRadius: 12,
                      border: isPicked ? "3px solid #8b5cf6" : "1px solid rgba(0,0,0,0.1)",
                      background: "#f1f1f4",
                      cursor: "pointer",
                      display: "block",
                      transform: isPressed ? "scale(0.92)" : isPicked ? "scale(1.0)" : "scale(1)",
                      transition: "transform .12s ease, border-color .12s ease, box-shadow .12s ease",
                      boxShadow: isPicked ? "0 0 0 4px rgba(139,92,246,0.25)" : "none",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.src}
                      alt={img.cat}
                      loading="lazy"
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    {/* 카테고리 라벨 */}
                    <span style={{
                      position: "absolute", left: 0, right: 0, bottom: 0, padding: "3px 7px", fontSize: 11, fontWeight: 700,
                      color: "#fff", textAlign: "left", background: "linear-gradient(to top, rgba(0,0,0,0.72), transparent)", pointerEvents: "none",
                    }}>{img.cat}</span>
                    {/* 선택 체크 오버레이 */}
                    {isPicked && (
                      <span style={{
                        position: "absolute", inset: 0, display: "grid", placeItems: "center",
                        background: "rgba(139,92,246,0.32)", pointerEvents: "none",
                      }}>
                        <span style={{
                          width: 34, height: 34, borderRadius: 999, background: "#8b5cf6", color: "#fff",
                          display: "grid", placeItems: "center", fontSize: 19, fontWeight: 900, boxShadow: "0 3px 8px rgba(0,0,0,0.3)",
                        }}>✓</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
