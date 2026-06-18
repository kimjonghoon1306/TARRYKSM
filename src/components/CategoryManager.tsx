"use client";

import { useState, useEffect, useTransition } from "react";
import {
  addStoreCategory,
  renameStoreCategory,
  deleteStoreCategory,
  moveStoreCategory,
  seedStoreCategories,
  type StoreCat,
} from "@/app/dashboard/[id]/categories/actions";

export default function CategoryManager({
  storeId,
  initial,
  productCats = [],
}: {
  storeId: string;
  initial: StoreCat[];
  productCats?: string[];
}) {
  // 관리 목록이 비어있고 기존 상품 카테고리가 있으면 즉시 그걸 보여주고(낙관적) 백그라운드로 시딩
  const needSeed = initial.length === 0 && productCats.length > 0;
  const [cats, setCats] = useState<StoreCat[]>(
    initial.length ? initial : productCats.map((n, i) => ({ id: "tmp-" + i, name: n, position: i }))
  );
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");
  const [err, setErr] = useState("");
  const [seeding, setSeeding] = useState(needSeed);
  const [pending, start] = useTransition();

  // 비어있으면 기존 상품 카테고리를 관리 목록(실제 id 부여)으로 등록
  useEffect(() => {
    if (needSeed) {
      seedStoreCategories(storeId, productCats).then((list) => {
        if (list.length) setCats(list);
        setSeeding(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 서버액션 후 목록을 새로 받아오기 위해 페이지가 revalidate되지만,
  // 즉시 반영 위해 낙관적으로 로컬도 갱신한다.
  function reload(next: StoreCat[]) { setCats(next); }

  function add() {
    setErr("");
    const n = name.trim();
    if (!n) return;
    start(async () => {
      const res = await addStoreCategory(storeId, n);
      if (!res.ok) { setErr(res.error || "실패"); return; }
      reload([...cats, { id: "tmp-" + Date.now(), name: n, position: cats.length }]);
      setName("");
    });
  }
  function saveRename(id: string) {
    const n = editVal.trim();
    if (!n) { setEditing(null); return; }
    start(async () => {
      const res = await renameStoreCategory(storeId, id, n);
      if (!res.ok) { setErr(res.error || "실패"); return; }
      reload(cats.map((c) => (c.id === id ? { ...c, name: n } : c)));
      setEditing(null);
    });
  }
  function del(id: string) {
    start(async () => {
      await deleteStoreCategory(storeId, id);
      reload(cats.filter((c) => c.id !== id));
    });
  }
  function move(id: string, dir: -1 | 1) {
    const idx = cats.findIndex((c) => c.id === id);
    const j = idx + dir;
    if (j < 0 || j >= cats.length) return;
    const next = [...cats];
    [next[idx], next[j]] = [next[j], next[idx]];
    reload(next);
    start(async () => { await moveStoreCategory(storeId, id, dir); });
  }

  const pill = "rounded-lg border border-black/10 px-2.5 py-1.5 text-sm transition hover:border-violet-400 disabled:opacity-40 dark:border-white/15";

  return (
    <div>
      {/* 추가 */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="새 카테고리 (예: 신상, 베스트, 패션)"
          className="min-w-[180px] flex-1 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 dark:border-white/10 dark:bg-white/[0.04]"
        />
        <button onClick={add} disabled={seeding || pending} className="press-glow rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-105 disabled:opacity-50">＋ 추가</button>
      </div>
      {err && <p className="mt-2 text-xs font-semibold text-rose-500">{err}</p>}

      {seeding && (
        <p className="mt-3 text-xs font-semibold text-violet-500">기존 상품 카테고리를 불러오는 중…</p>
      )}

      {/* 목록 */}
      {cats.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-black/10 py-8 text-center text-sm text-neutral-400 dark:border-white/10">
          아직 카테고리가 없어요. 위에서 추가하면 상품 등록 시 선택할 수 있어요.
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {cats.map((c, i) => (
            <li key={c.id} className="flex items-center gap-2 rounded-xl border border-black/5 bg-black/[0.02] px-3 py-2 dark:border-white/10 dark:bg-white/[0.03]">
              <span className="text-xs text-neutral-400 w-5 text-center">{i + 1}</span>
              {editing === c.id ? (
                <input
                  autoFocus
                  value={editVal}
                  onChange={(e) => setEditVal(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveRename(c.id); if (e.key === "Escape") setEditing(null); }}
                  onBlur={() => saveRename(c.id)}
                  className="flex-1 rounded-lg border border-violet-400 bg-white px-2.5 py-1.5 text-sm outline-none dark:bg-white/[0.06]"
                />
              ) : (
                <span className="flex-1 text-sm font-semibold">{c.name}</span>
              )}
              <button onClick={() => move(c.id, -1)} disabled={seeding || pending || i === 0} className={pill} aria-label="위로">↑</button>
              <button onClick={() => move(c.id, 1)} disabled={seeding || pending || i === cats.length - 1} className={pill} aria-label="아래로">↓</button>
              <button onClick={() => { setEditing(c.id); setEditVal(c.name); }} disabled={seeding || pending} className={pill}>이름</button>
              <button onClick={() => del(c.id)} disabled={seeding || pending} className={pill + " hover:border-rose-400 hover:text-rose-500"}>삭제</button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs text-neutral-400">
        여기 카테고리가 상품 등록·수정 화면의 선택 목록이 돼요. 손님 쇼핑몰 상단 카테고리로도 보입니다.
      </p>
    </div>
  );
}
