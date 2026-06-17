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

      {/* 라이브러리 모달 */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl dark:bg-[#15161f]"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-black/10 px-5 py-4 dark:border-white/10">
              <b className="text-base">🖼 무료 이미지 라이브러리</b>
              <span className="text-xs text-neutral-400">클릭하면 상품 사진으로 적용돼요</span>
              <button type="button" onClick={() => setOpen(false)} className="ml-auto text-neutral-400 hover:text-neutral-700 dark:hover:text-white">✕</button>
            </div>
            <div className="flex gap-2 px-5 pt-3">
              {STOCK_GROUPS.map((g) => (
                <button key={g} type="button" onClick={() => setGroup(g)}
                  className={"rounded-full px-3 py-1.5 text-xs font-semibold transition " +
                    (group === g ? "bg-violet-500 text-white" : "bg-black/[0.05] text-neutral-500 hover:bg-black/10 dark:bg-white/10 dark:text-neutral-300")}>
                  {g}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 overflow-y-auto p-5 sm:grid-cols-4 md:grid-cols-5">
              {list.map((img) => (
                <button key={img.src} type="button" onClick={() => pick(img.src)}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-black/10 transition hover:border-violet-500 hover:ring-2 hover:ring-violet-500/30 dark:border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt={img.cat} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
                  <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1 text-[10px] font-semibold text-white">{img.cat}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
