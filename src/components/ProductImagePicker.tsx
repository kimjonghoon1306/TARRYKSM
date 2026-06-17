"use client";

import { useMemo, useState } from "react";
import { STOCK_IMAGES, STOCK_GROUPS } from "@/lib/stockImages";

// 상품 사진 입력: ① 직접 업로드  ② 무료 이미지 라이브러리에서 고르기  ③ 제거
// 서버 폼(action)으로 제출되는 값:
//   - image (file)            : 직접 업로드한 파일
//   - stock_image_url (hidden): 라이브러리에서 고른 이미지 경로
//   - remove_image (hidden)   : "1"이면 사진 제거
export default function ProductImagePicker({
  initialUrl,
  onChange,
}: {
  initialUrl?: string | null;
  onChange?: (url: string) => void;
}) {
  const [picked, setPicked] = useState<string>("");   // 라이브러리 선택 경로
  const [uploadPreview, setUploadPreview] = useState<string>(""); // 업로드 미리보기
  const [removed, setRemoved] = useState(false);
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState<(typeof STOCK_GROUPS)[number]>("전체");

  const preview = uploadPreview || picked || (removed ? "" : initialUrl || "");

  const list = useMemo(
    () => (group === "전체" ? STOCK_IMAGES : STOCK_IMAGES.filter((i) => i.group === group)),
    [group]
  );

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) { const u = URL.createObjectURL(f); setUploadPreview(u); setPicked(""); setRemoved(false); onChange?.(u); }
  }
  function pick(src: string) {
    setPicked(src); setUploadPreview(""); setRemoved(false); setOpen(false); onChange?.(src);
    // 파일 입력 비우기 (업로드와 라이브러리 동시선택 방지)
    const fi = document.getElementById("product-image-file") as HTMLInputElement | null;
    if (fi) fi.value = "";
  }
  function clearImg() { setPicked(""); setUploadPreview(""); setRemoved(true); onChange?.("");
    const fi = document.getElementById("product-image-file") as HTMLInputElement | null;
    if (fi) fi.value = "";
  }

  return (
    <div>
      {/* 폼 제출용 hidden 값 */}
      <input type="hidden" name="stock_image_url" value={picked} />
      <input type="hidden" name="remove_image" value={removed ? "1" : ""} />

      <div className="flex items-center gap-3">
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-black/[0.04] text-2xl dark:bg-white/[0.06]">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : "📦"}
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
          <p className="text-xs text-neutral-400">상품 사진이 없어도 무료 이미지 라이브러리(66종)에서 골라 바로 쓸 수 있어요.</p>
        </div>
      </div>

      {/* 라이브러리 모달 — 레이아웃은 인라인 스타일로 강제(빌드/Tailwind 영향 차단) */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.6)" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#15161f]"
            style={{ position: "relative", display: "flex", flexDirection: "column", width: "100%", maxWidth: 760, maxHeight: "85vh", overflow: "hidden", borderRadius: 16, boxShadow: "0 25px 60px rgba(0,0,0,0.35)" }}
          >
            <div className="border-b border-black/10 dark:border-white/10" style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", flex: "0 0 auto" }}>
              <b style={{ fontSize: 16 }}>🖼 무료 이미지 라이브러리</b>
              <span className="text-neutral-400" style={{ fontSize: 12 }}>클릭하면 상품 사진으로 적용돼요</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="닫기"
                className="text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
                style={{ marginLeft: "auto", fontSize: 22, lineHeight: 1, cursor: "pointer", padding: "2px 8px" }}>✕</button>
            </div>
            <div style={{ display: "flex", gap: 8, padding: "12px 20px 0", flex: "0 0 auto" }}>
              {STOCK_GROUPS.map((g) => (
                <button key={g} type="button" onClick={() => setGroup(g)}
                  className={group === g ? "text-white" : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-300"}
                  style={{
                    borderRadius: 999, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer",
                    background: group === g ? "#8b5cf6" : "rgba(0,0,0,0.06)",
                  }}>
                  {g}
                </button>
              ))}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 12,
                overflowY: "auto",
                padding: 20,
                flex: 1,
                minHeight: 0,
              }}
            >
              {list.map((img) => (
                <button
                  key={img.src}
                  type="button"
                  onClick={() => pick(img.src)}
                  title={img.cat}
                  style={{
                    position: "relative",
                    aspectRatio: "1 / 1",
                    width: "100%",
                    overflow: "hidden",
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.1)",
                    background: "#f1f1f4",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={img.cat}
                    loading="lazy"
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      padding: "4px 8px",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#fff",
                      textAlign: "left",
                      background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                      pointerEvents: "none",
                    }}
                  >
                    {img.cat}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
