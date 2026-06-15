"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { SECTION_META, type Section, type SectionConfig, type SectionType } from "@/lib/sections";
import {
  addSection,
  updateSectionConfig,
  toggleSection,
  deleteSection,
  reorderSections,
} from "@/app/dashboard/[id]/sections/actions";

type Prod = { id: string; name: string; emoji: string | null; image_url: string | null; category: string | null };

const input =
  "w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 dark:border-white/10 dark:bg-white/[0.04]";
const label = "mb-1.5 block text-xs font-semibold text-neutral-500";
const card =
  "rounded-2xl border border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]";

export default function SectionEditor({
  storeId,
  slug,
  initialSections,
  products,
  categories,
}: {
  storeId: string;
  slug: string;
  initialSections: Section[];
  products: Prod[];
  categories: string[];
}) {
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState<string | null>(initialSections[0]?.id ?? null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [drag, setDrag] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function patchLocal(id: string, patch: Partial<SectionConfig>) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, config: { ...s.config, ...patch } } : s))
    );
    setDirty((d) => ({ ...d, [id]: true }));
  }

  function add(type: SectionType) {
    setMenuOpen(false);
    start(async () => {
      const created = await addSection(storeId, type);
      if (created) {
        setSections((prev) => [...prev, created]);
        setOpen(created.id);
      }
    });
  }

  function save(id: string) {
    const sec = sections.find((s) => s.id === id);
    if (!sec) return;
    start(async () => {
      const ok = await updateSectionConfig(storeId, id, sec.config);
      if (ok) setDirty((d) => ({ ...d, [id]: false }));
    });
  }

  function toggle(id: string) {
    const sec = sections.find((s) => s.id === id);
    if (!sec) return;
    const next = !sec.visible;
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, visible: next } : s)));
    start(() => toggleSection(storeId, id, next).then(() => {}));
  }

  function remove(id: string) {
    if (!confirm("이 블록을 삭제할까요?")) return;
    setSections((prev) => prev.filter((s) => s.id !== id));
    start(() => deleteSection(storeId, id).then(() => {}));
  }

  function onDrop(targetId: string) {
    setOver(null);
    if (!drag || drag === targetId) return setDrag(null);
    const ids = sections.map((s) => s.id);
    const from = ids.indexOf(drag);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return setDrag(null);
    const next = [...sections];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setSections(next);
    setDrag(null);
    start(() => reorderSections(storeId, next.map((s) => s.id)).then(() => {}));
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link href={`/dashboard/${storeId}`} className="text-sm text-neutral-500 hover:text-violet-500">
        ← 몰 관리
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold sm:text-3xl">🧩 대문 구성</h1>
        <Link
          href={`/${slug}`}
          target="_blank"
          className="ml-auto rounded-lg border border-black/10 px-3 py-1.5 text-sm transition hover:border-violet-500 dark:border-white/15"
        >
          쇼핑몰 보기 ↗
        </Link>
      </div>
      <p className="mt-1 text-sm text-neutral-500">
        배너·상품 선반·텍스트·그리드 블록을 쌓아 대문을 직접 구성하세요. 드래그로 순서를 바꿀 수 있어요.
        {sections.length === 0 && " 블록이 하나도 없으면 기본 진열(신상·베스트·전체)이 자동으로 보입니다."}
      </p>

      {/* 블록 추가 */}
      <div className="relative mt-5">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="press-glow rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-105 active:scale-[.98]"
        >
          ＋ 블록 추가
        </button>
        {menuOpen && (
          <div className={card + " absolute z-20 mt-2 w-72 overflow-hidden p-1"}>
            {(Object.keys(SECTION_META) as SectionType[]).map((t) => {
              const m = SECTION_META[t];
              return (
                <button
                  key={t}
                  onClick={() => add(t)}
                  className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-violet-500/10"
                >
                  <span className="text-xl">{m.icon}</span>
                  <span>
                    <span className="block text-sm font-semibold">{m.label}</span>
                    <span className="block text-xs text-neutral-500">{m.desc}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 섹션 목록 */}
      <div className="mt-5 space-y-3">
        {sections.length === 0 && (
          <div className={card + " border-dashed py-12 text-center text-sm text-neutral-400"}>
            아직 블록이 없어요. <span className="font-semibold text-violet-500">＋ 블록 추가</span>로 시작하세요.
          </div>
        )}
        {sections.map((s) => {
          const m = SECTION_META[s.type];
          const isOpen = open === s.id;
          return (
            <div
              key={s.id}
              draggable
              onDragStart={() => setDrag(s.id)}
              onDragEnd={() => {
                setDrag(null);
                setOver(null);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (over !== s.id) setOver(s.id);
              }}
              onDrop={() => onDrop(s.id)}
              className={
                card +
                " transition " +
                (drag === s.id ? "opacity-40 " : "") +
                (over === s.id && drag !== s.id ? "ring-2 ring-violet-500 " : "") +
                (s.visible ? "" : "opacity-60")
              }
            >
              {/* 헤더 줄 */}
              <div className="flex items-center gap-2 px-4 py-3">
                <span className="cursor-grab select-none text-neutral-300 active:cursor-grabbing" title="드래그로 이동">
                  ⠿
                </span>
                <span className="text-lg">{m.icon}</span>
                <button onClick={() => setOpen(isOpen ? null : s.id)} className="flex-1 text-left">
                  <span className="text-sm font-semibold">{m.label}</span>
                  <span className="ml-2 text-xs text-neutral-400">{summary(s)}</span>
                </button>
                <button
                  onClick={() => toggle(s.id)}
                  title={s.visible ? "숨기기" : "보이기"}
                  className="rounded-lg px-2 py-1 text-xs transition hover:bg-black/5 dark:hover:bg-white/10"
                >
                  {s.visible ? "👁 표시" : "🚫 숨김"}
                </button>
                <button
                  onClick={() => remove(s.id)}
                  title="삭제"
                  className="rounded-lg px-2 py-1 text-xs text-neutral-400 transition hover:bg-rose-500/10 hover:text-rose-500"
                >
                  🗑
                </button>
                <button onClick={() => setOpen(isOpen ? null : s.id)} className="px-1 text-neutral-400">
                  {isOpen ? "▲" : "▼"}
                </button>
              </div>

              {/* 설정 폼 */}
              {isOpen && (
                <div className="border-t border-black/5 px-4 py-4 dark:border-white/10">
                  <Fields
                    section={s}
                    products={products}
                    categories={categories}
                    storeId={storeId}
                    onPatch={(p) => patchLocal(s.id, p)}
                  />
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => save(s.id)}
                      disabled={!dirty[s.id] || pending}
                      className="rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-105 active:scale-[.98] disabled:opacity-40"
                    >
                      {dirty[s.id] ? "변경사항 저장" : "저장됨"}
                    </button>
                    {dirty[s.id] && <span className="text-xs text-amber-500">저장하지 않은 변경사항이 있어요</span>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 블록 한 줄 요약(헤더 표시)
function summary(s: Section): string {
  const c = s.config || {};
  if (s.type === "banner") return c.title || "기획전 배너";
  if (s.type === "text") return c.title || "텍스트";
  if (s.type === "shelf") {
    const src = { new: "신상품", best: "베스트", category: c.category || "카테고리", manual: "직접 선택" }[
      (c.source as "new" | "best" | "category" | "manual") || "new"
    ];
    return `${c.title || "상품 선반"} · ${src}`;
  }
  if (s.type === "grid") return c.source === "category" ? `그리드 · ${c.category || "카테고리"}` : "전체 상품 그리드";
  return "";
}

// 타입별 설정 필드
function Fields({
  section,
  products,
  categories,
  storeId,
  onPatch,
}: {
  section: Section;
  products: Prod[];
  categories: string[];
  storeId: string;
  onPatch: (p: Partial<SectionConfig>) => void;
}) {
  const c = section.config || {};

  if (section.type === "banner") {
    return (
      <div className="grid gap-4">
        <BannerImage storeId={storeId} url={c.image_url || ""} onChange={(u) => onPatch({ image_url: u })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>윗줄 라벨 (eyebrow)</label>
            <input className={input} value={c.eyebrow || ""} onChange={(e) => onPatch({ eyebrow: e.target.value })} placeholder="SPECIAL" />
          </div>
          <div>
            <label className={label}>버튼 문구</label>
            <input className={input} value={c.cta_label || ""} onChange={(e) => onPatch({ cta_label: e.target.value })} placeholder="보러가기" />
          </div>
        </div>
        <div>
          <label className={label}>제목</label>
          <input className={input} value={c.title || ""} onChange={(e) => onPatch({ title: e.target.value })} placeholder="기획전 제목" />
        </div>
        <div>
          <label className={label}>부제</label>
          <input className={input} value={c.subtitle || ""} onChange={(e) => onPatch({ subtitle: e.target.value })} placeholder="부제를 입력하세요" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>클릭 시 이동할 상품</label>
            <select className={input} value={c.link_product_id || ""} onChange={(e) => onPatch({ link_product_id: e.target.value || null })}>
              <option value="">(없음)</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>또는 외부 링크 URL</label>
            <input className={input} value={c.link_url || ""} onChange={(e) => onPatch({ link_url: e.target.value || null })} placeholder="https://..." />
          </div>
        </div>
      </div>
    );
  }

  if (section.type === "text") {
    return (
      <div className="grid gap-4">
        <div>
          <label className={label}>윗줄 라벨</label>
          <input className={input} value={c.eyebrow || ""} onChange={(e) => onPatch({ eyebrow: e.target.value })} placeholder="ABOUT" />
        </div>
        <div>
          <label className={label}>제목</label>
          <input className={input} value={c.title || ""} onChange={(e) => onPatch({ title: e.target.value })} />
        </div>
        <div>
          <label className={label}>본문</label>
          <textarea className={input + " min-h-[100px] resize-y"} value={c.body || ""} onChange={(e) => onPatch({ body: e.target.value })} />
        </div>
        <div>
          <label className={label}>정렬</label>
          <select className={input} value={c.align || "center"} onChange={(e) => onPatch({ align: e.target.value as "left" | "center" })}>
            <option value="center">가운데</option>
            <option value="left">왼쪽</option>
          </select>
        </div>
      </div>
    );
  }

  if (section.type === "shelf") {
    const src = (c.source as "new" | "best" | "category" | "manual") || "new";
    return (
      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>제목</label>
            <input className={input} value={c.title || ""} onChange={(e) => onPatch({ title: e.target.value })} placeholder="상품 선반" />
          </div>
          <div>
            <label className={label}>부제</label>
            <input className={input} value={c.subtitle || ""} onChange={(e) => onPatch({ subtitle: e.target.value })} placeholder="(선택)" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>진열 기준</label>
            <select className={input} value={src} onChange={(e) => onPatch({ source: e.target.value as SectionConfig["source"] })}>
              <option value="new">🆕 신상품 (최신순)</option>
              <option value="best">🔥 베스트 (인기 태그)</option>
              <option value="category">📁 특정 카테고리</option>
              <option value="manual">✋ 직접 선택</option>
            </select>
          </div>
          <div>
            <label className={label}>최대 상품 수</label>
            <input
              type="number"
              min={1}
              max={20}
              className={input}
              value={c.limit ?? 8}
              onChange={(e) => onPatch({ limit: parseInt(e.target.value, 10) || 8 })}
            />
          </div>
        </div>
        {src === "category" && (
          <CategorySelect categories={categories} value={c.category || ""} onChange={(v) => onPatch({ category: v })} />
        )}
        {src === "manual" && (
          <ManualPicker products={products} selected={c.product_ids || []} onChange={(ids) => onPatch({ product_ids: ids })} />
        )}
      </div>
    );
  }

  // grid
  return (
    <div className="grid gap-4">
      <div>
        <label className={label}>제목</label>
        <input className={input} value={c.title || ""} onChange={(e) => onPatch({ title: e.target.value })} placeholder="전체 상품" />
      </div>
      <div>
        <label className={label}>표시 범위</label>
        <select className={input} value={c.source === "category" ? "category" : "all"} onChange={(e) => onPatch({ source: e.target.value as SectionConfig["source"] })}>
          <option value="all">전체 상품</option>
          <option value="category">특정 카테고리만</option>
        </select>
      </div>
      {c.source === "category" && (
        <CategorySelect categories={categories} value={c.category || ""} onChange={(v) => onPatch({ category: v })} />
      )}
    </div>
  );
}

function CategorySelect({ categories, value, onChange }: { categories: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className={label}>카테고리</label>
      <select className={input} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">(선택하세요)</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      {categories.length === 0 && (
        <p className="mt-1 text-xs text-neutral-400">상품에 카테고리가 없어요. 상품 관리에서 카테고리를 지정하세요.</p>
      )}
    </div>
  );
}

function ManualPicker({ products, selected, onChange }: { products: Prod[]; selected: string[]; onChange: (ids: string[]) => void }) {
  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  }
  return (
    <div>
      <label className={label}>상품 선택 ({selected.length}개)</label>
      {products.length === 0 ? (
        <p className="text-xs text-neutral-400">먼저 상품을 등록하세요.</p>
      ) : (
        <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto rounded-xl border border-black/5 p-2 dark:border-white/10 sm:grid-cols-3">
          {products.map((p) => {
            const on = selected.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggle(p.id)}
                className={
                  "flex items-center gap-2 rounded-lg border p-2 text-left text-xs transition " +
                  (on
                    ? "border-violet-500 bg-violet-500/10"
                    : "border-black/5 hover:border-violet-300 dark:border-white/10")
                }
              >
                <span className="grid h-9 w-9 flex-none place-items-center overflow-hidden rounded-md bg-black/[0.04] text-lg dark:bg-white/[0.06]">
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    p.emoji || "📦"
                  )}
                </span>
                <span className="flex-1 truncate">{p.name}</span>
                {on && <span className="text-violet-500">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// 배너 이미지 — 브라우저에서 Storage 직접 업로드(서버 4.5MB 한도 우회)
function BannerImage({ storeId, url, onChange }: { storeId: string; url: string; onChange: (u: string | null) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function upload(file: File) {
    setErr("");
    setBusy(true);
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
      const path = `${user.id}/${storeId}/banner/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });
      if (error) {
        setErr("업로드 실패: " + error.message);
        return;
      }
      onChange(supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label className={label}>배너 이미지 (없으면 브랜드 색 배경)</label>
      <div className="flex items-center gap-3">
        <div className="grid h-14 w-24 flex-none place-items-center overflow-hidden rounded-lg bg-black/[0.04] text-lg dark:bg-white/[0.06]">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            "🖼️"
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          disabled={busy}
          onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-xs text-neutral-600 file:mr-2 file:rounded file:border-0 file:bg-violet-500 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-white dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-300"
        />
      </div>
      {busy && <div className="mt-1 text-xs text-violet-500">업로드 중…</div>}
      {err && <div className="mt-1 text-xs text-rose-500">{err}</div>}
      {url && !busy && (
        <button type="button" onClick={() => onChange(null)} className="mt-1 text-xs text-neutral-400 hover:text-rose-500">
          이미지 제거
        </button>
      )}
    </div>
  );
}
