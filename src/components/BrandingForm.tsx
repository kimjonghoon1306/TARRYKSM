"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { setStoreBranding } from "@/app/dashboard/actions";
import { SKIN_BY_ID } from "@/lib/skins";

// hex + alpha → rgba
function hexA(hex: string, a: number) {
  const h = (hex || "#888").replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export default function BrandingForm({
  storeId,
  storeName,
  skin,
  logoUrl,
  heroUrl,
  heroTitle,
  heroSubtitle,
  footerText,
}: {
  storeId: string;
  storeName: string;
  skin?: string;
  logoUrl: string | null;
  heroUrl: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  footerText: string | null;
}) {
  const [logo, setLogo] = useState(logoUrl || "");
  const [hero, setHero] = useState(heroUrl || "");
  const [title, setTitle] = useState(heroTitle || "");
  const [subtitle, setSubtitle] = useState(heroSubtitle || "");
  const [busy, setBusy] = useState<"" | "logo" | "hero">("");
  const [err, setErr] = useState("");
  const sk = SKIN_BY_ID[skin || "mono"] || SKIN_BY_ID["mono"];

  // 브라우저 → Supabase Storage 직접 업로드 (서버 4.5MB 한도 우회)
  async function upload(file: File, folder: "logo" | "hero", set: (u: string) => void) {
    setErr("");
    setBusy(folder);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setErr("로그인이 필요해요");
        return;
      }
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
      const path = `${user.id}/${storeId}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });
      if (error) {
        setErr("업로드 실패: " + error.message);
        return;
      }
      set(supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl);
    } finally {
      setBusy("");
    }
  }

  const fileBtn =
    "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-xs text-neutral-600 outline-none file:mr-2 file:rounded file:border-0 file:bg-violet-500 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-white dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-300";
  const input =
    "w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 dark:border-white/10 dark:bg-white/[0.04]";

  return (
    <form action={setStoreBranding} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="id" value={storeId} />
      <input type="hidden" name="logo_url" value={logo} />
      <input type="hidden" name="hero_url" value={hero} />

      {err && (
        <p className="sm:col-span-2 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">{err}</p>
      )}

      {/* 로고 */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-neutral-500">로고 (없으면 상호명 표시)</label>
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 flex-none place-items-center overflow-hidden rounded-lg bg-black/[0.04] text-lg dark:bg-white/[0.06]">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="" className="h-full w-full object-contain" />
            ) : "🏷️"}
          </div>
          <input
            type="file"
            accept="image/*"
            disabled={busy === "logo"}
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "logo", setLogo)}
            className={fileBtn}
          />
        </div>
        {busy === "logo" && <div className="mt-1 text-xs text-violet-500">업로드 중…</div>}
        {logo && busy !== "logo" && (
          <button type="button" onClick={() => setLogo("")} className="mt-1 text-xs text-neutral-400 hover:text-rose-500">
            로고 제거
          </button>
        )}
      </div>

      {/* 대문 배너 */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-neutral-500">대문 배너 이미지</label>
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-20 flex-none place-items-center overflow-hidden rounded-lg bg-black/[0.04] text-lg dark:bg-white/[0.06]">
            {hero ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={hero} alt="" className="h-full w-full object-cover" />
            ) : "🖼️"}
          </div>
          <input
            type="file"
            accept="image/*"
            disabled={busy === "hero"}
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "hero", setHero)}
            className={fileBtn}
          />
        </div>
        {busy === "hero" && <div className="mt-1 text-xs text-violet-500">업로드 중…</div>}
        {hero && busy !== "hero" && (
          <button type="button" onClick={() => setHero("")} className="mt-1 text-xs text-neutral-400 hover:text-rose-500">
            배너 제거
          </button>
        )}
      </div>

      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-xs font-semibold text-neutral-500">대문 제목</label>
        <input name="hero_title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={storeName} className={input} />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-xs font-semibold text-neutral-500">대문 문구</label>
        <input name="hero_subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="엄선한 상품을 한 곳에. 지금 둘러보세요." className={input} />
      </div>

      {/* 실시간 대문 미리보기 */}
      <div className="sm:col-span-2">
        <div className="mb-1.5 text-[11px] font-semibold text-neutral-400">🔍 미리보기 · 실시간</div>
        <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(0,0,0,.08)", background: sk.bg, boxShadow: "0 8px 22px -14px rgba(0,0,0,.4)" }}>
          {/* 상단바: 로고 or 상호 */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", color: sk.color, borderBottom: `1px solid ${hexA(sk.color, 0.12)}` }}>
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="" style={{ height: 24, maxWidth: 120, objectFit: "contain" }} />
            ) : (
              <b style={{ fontWeight: 800, fontSize: 15, letterSpacing: 0.3 }}>{storeName}</b>
            )}
            <span style={{ fontSize: 13 }}>🔍 🛒</span>
          </div>
          {/* 히어로: 배너 + 제목/문구 */}
          <div style={{ position: "relative", minHeight: 150, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 18, overflow: "hidden", background: hexA(sk.color, 0.12) }}>
            {hero && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={hero} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            )}
            <div style={{ position: "absolute", inset: 0, background: hero ? "linear-gradient(to top, rgba(0,0,0,.55), rgba(0,0,0,.05))" : "transparent" }} />
            <div style={{ position: "relative", color: hero ? "#fff" : sk.color }}>
              <div style={{ fontWeight: 800, fontSize: 22, lineHeight: 1.2 }}>{title || storeName}</div>
              <div style={{ fontSize: 13, marginTop: 6, opacity: 0.92 }}>{subtitle || "엄선한 상품을 한 곳에. 지금 둘러보세요."}</div>
              <span style={{ marginTop: 12, display: "inline-block", padding: "8px 18px", borderRadius: 8, background: sk.color, color: sk.bg, fontSize: 13, fontWeight: 800 }}>둘러보기</span>
            </div>
          </div>
        </div>
      </div>

      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-xs font-semibold text-neutral-500">
          하단 푸터 문구
        </label>
        <textarea
          name="footer_text"
          defaultValue={footerText || ""}
          rows={2}
          placeholder={`© ${storeName} · 온종일로 만든 쇼핑몰`}
          className={input}
        />
        <p className="mt-1 text-xs text-neutral-400">
          비워두면 <b>“© {storeName} · 온종일로 만든 쇼핑몰”</b>이 기본으로 표시돼요. (사업자 정보는 아래 전용 칸에서 입력)
        </p>
      </div>

      <div className="sm:col-span-2">
        <button
          disabled={busy !== ""}
          className="press-glow rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-105 active:scale-[.98] disabled:opacity-50"
        >
          상단·하단 꾸미기 저장
        </button>
      </div>
    </form>
  );
}
