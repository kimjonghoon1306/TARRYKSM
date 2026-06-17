"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { addProduct } from "@/app/dashboard/[id]/products/actions";
import { SKIN_BY_ID } from "@/lib/skins";
import OptionsEditor from "@/components/OptionsEditor";
import ProductImagePicker from "@/components/ProductImagePicker";
import PriceInput from "@/components/PriceInput";

const CATS = ["전체", "식품", "농산물", "수산물", "축산물", "베이커리", "가공·반찬", "패션", "리빙", "뷰티", "액세서리", "테크"];
const INPUT =
  "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 dark:border-white/10 dark:bg-white/[0.04]";
const won = (n: number) => "₩" + (n || 0).toLocaleString("ko-KR");

export default function ProductForm({ storeId, skin }: { storeId: string; skin: string }) {
  const sk = SKIN_BY_ID[skin] || SKIN_BY_ID["mono"];
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [emoji, setEmoji] = useState("📦");
  const [tag, setTag] = useState("");
  const [desc, setDesc] = useState("");
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [big, setBig] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // 소비자에게 보이는 상품 카드 (미리보기) — 사이드패널·전체화면 공용
  const Preview = ({ full }: { full?: boolean }) => (
    <div
      className="overflow-hidden rounded-2xl border shadow-lg"
      style={{ background: sk.bg, borderColor: "rgba(0,0,0,.08)", width: full ? "min(420px, 92vw)" : undefined }}
    >
      <div className="flex aspect-square items-center justify-center" style={{ background: hexA(sk.color, 0.12) }}>
        {imgUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imgUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span style={{ fontSize: full ? 120 : 72 }}>{emoji || "📦"}</span>
        )}
      </div>
      <div className={full ? "p-6" : "p-4"} style={{ color: sk.color }}>
        {tag && (
          <span className="mb-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: sk.color, color: sk.bg }}>
            {tag}
          </span>
        )}
        {brand && (
          <div className="text-[10px] font-bold uppercase tracking-wide" style={{ opacity: 0.6 }}>{brand}</div>
        )}
        <div className={(full ? "text-2xl" : "text-base") + " font-semibold leading-tight"}>
          {name || "상품명이 여기에 표시돼요"}
        </div>
        {desc && (
          <div className={(full ? "mt-2 text-sm" : "mt-1.5 text-xs") + " leading-relaxed"} style={{ opacity: 0.7 }}>{desc}</div>
        )}
        <div className="mt-3 flex items-center justify-between">
          <div className={(full ? "text-2xl" : "text-lg") + " font-bold"}>{won(Number(price))}</div>
          <span className={(full ? "px-6 py-3 text-base" : "px-4 py-2 text-sm") + " rounded-lg font-bold"} style={{ background: sk.color, color: sk.bg }}>
            담기
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      {/* 입력 폼 */}
      <form action={addProduct} className="grid gap-3 sm:grid-cols-2">
        <input type="hidden" name="store_id" value={storeId} />
        <div className="sm:col-span-2">
          <L label="상품 사진 (선택 — 없으면 이모지 사용)">
            <ProductImagePicker onChange={(u) => setImgUrl(u || null)} />
          </L>
        </div>
        <L label="이모지(사진 없을 때 대체)">
          <input name="emoji" value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={4} className={INPUT} />
        </L>
        <L label="상품명 *">
          <input name="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 소이 캔들" className={INPUT} />
        </L>
        <L label="가격(원) *">
          <PriceInput required onValue={setPrice} className={INPUT} />
        </L>
        <L label="브랜드">
          <input name="brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="예: AROMA" className={INPUT} />
        </L>
        <L label="카테고리">
          <select name="category" defaultValue="전체" className={INPUT}>
            {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </L>
        <L label="태그(NEW·BEST 등)">
          <input name="tag" value={tag} onChange={(e) => setTag(e.target.value)} placeholder="NEW" className={INPUT} />
        </L>
        <L label="재고 수량(비우면 무제한)">
          <input name="stock" type="number" min={0} placeholder="무제한" className={INPUT} />
        </L>
        <div className="sm:col-span-2">
          <L label="설명">
            <textarea name="description" rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="상품 설명" className={INPUT} />
          </L>
        </div>
        <div className="sm:col-span-2">
          <L label="옵션 (색상·사이즈 등)">
            <OptionsEditor />
          </L>
        </div>
        <div className="sm:col-span-2 mt-1">
          <button className="press-glow w-full rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 px-5 py-3.5 text-base font-bold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-105 active:scale-[.99]">
            💾 상품 저장하기
          </button>
        </div>
      </form>

      {/* 소비자 미리보기 */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">🔍 미리보기 · 실시간</span>
          <button type="button" onClick={() => setBig(true)}
            className="rounded-lg border border-black/10 px-2.5 py-1 text-xs font-semibold text-neutral-600 transition hover:border-violet-500 hover:text-violet-600 dark:border-white/15 dark:text-neutral-300">
            🔍 전체화면
          </button>
        </div>
        <Preview />
        <p className="mt-2 text-center text-xs text-neutral-400">
          스킨: {sk.name} · 실제 쇼핑몰과 동일한 색
        </p>
      </div>

      {/* 전체화면 미리보기 모달 — Portal */}
      {big && mounted && createPortal(
        <div onClick={() => setBig(false)}
          style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 16, background: "rgba(0,0,0,0.7)" }}>
          <div onClick={(e) => e.stopPropagation()}>
            <Preview full />
          </div>
          <button type="button" onClick={() => setBig(false)}
            style={{ color: "#fff", fontSize: 14, fontWeight: 700, padding: "8px 18px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.4)", cursor: "pointer", background: "transparent" }}>
            ✕ 닫기
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-neutral-500">{label}</span>
      {children}
    </label>
  );
}

// hex + alpha → rgba
function hexA(hex: string, a: number) {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}
