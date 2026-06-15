"use client";

import { useMemo, useState } from "react";
import "./storefront.css";

export type Product = {
  id: string;
  emoji: string | null;
  image_url: string | null;
  name: string;
  brand: string | null;
  price: number;
  category: string | null;
  description: string | null;
  tag: string | null;
};
type Store = {
  name: string;
  skin: string;
  logo_url?: string | null;
  hero_image_url?: string | null;
  hero_title?: string | null;
  hero_subtitle?: string | null;
};

const won = (n: number) => "₩" + n.toLocaleString("ko-KR");

const SORTS = [
  { id: "recommend", label: "추천" },
  { id: "low", label: "낮은가격" },
  { id: "high", label: "높은가격" },
  { id: "name", label: "이름순" },
];

export default function Storefront({
  store,
  products,
}: {
  store: Store;
  products: Product[];
}) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [detail, setDetail] = useState<Product | null>(null);
  const [detailQty, setDetailQty] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCat, setActiveCat] = useState("전체");
  const [sort, setSort] = useState("recommend");
  const [q, setQ] = useState("");
  const [searchOn, setSearchOn] = useState(false);
  const [toast, setToast] = useState("");

  const cats = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.category && set.add(p.category));
    return ["전체", ...Array.from(set)];
  }, [products]);

  const shown = useMemo(() => {
    let list = activeCat === "전체" ? products : products.filter((p) => p.category === activeCat);
    if (q.trim()) {
      const k = q.trim().toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(k) || (p.brand || "").toLowerCase().includes(k)
      );
    }
    const arr = [...list];
    if (sort === "low") arr.sort((a, b) => a.price - b.price);
    else if (sort === "high") arr.sort((a, b) => b.price - a.price);
    else if (sort === "name") arr.sort((a, b) => a.name.localeCompare(b.name, "ko"));
    return arr;
  }, [products, activeCat, q, sort]);

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartLines = products.filter((p) => cart[p.id]).map((p) => ({ ...p, qty: cart[p.id] }));
  const total = cartLines.reduce((sum, l) => sum + l.price * l.qty, 0);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  }
  function add(p: Product, qty = 1) {
    setCart((c) => ({ ...c, [p.id]: (c[p.id] || 0) + qty }));
    flash(`🛒 ${p.name} 담음`);
  }
  function setQty(id: string, qty: number) {
    setCart((c) => {
      const next = { ...c };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  }
  function openDetail(p: Product) {
    setDetail(p);
    setDetailQty(1);
  }

  const heroTitle = store.hero_title || store.name;
  const heroSub = store.hero_subtitle || "엄선한 상품을 한 곳에. 지금 둘러보세요.";

  return (
    <div className="sf" data-skin={store.skin}>
      {/* 헤더 */}
      <header className="sf-bar">
        {store.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={store.logo_url} alt={store.name} className="sf-logo-img" />
        ) : (
          <span className="sf-logo">{store.name}</span>
        )}
        <div className="sf-bar-tools">
          <button className="sf-icon-btn" aria-label="검색" onClick={() => setSearchOn((v) => !v)}>
            🔍
          </button>
          <button className="sf-cart-btn" onClick={() => setCartOpen(true)}>
            🛒 장바구니
            {cartCount > 0 && <span className="sf-cart-badge">{cartCount}</span>}
          </button>
        </div>
      </header>

      {/* 검색바 */}
      {searchOn && (
        <div className="sf-searchbar">
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="상품 검색…"
          />
          {q && <button onClick={() => setQ("")}>✕</button>}
        </div>
      )}

      {/* 히어로 (배너 이미지 or 그라데이션) */}
      <section
        className={"sf-hero" + (store.hero_image_url ? " has-img" : "")}
        style={store.hero_image_url ? { backgroundImage: `url(${store.hero_image_url})` } : undefined}
      >
        <div className="sf-hero-inner">
          <div className="sf-eyebrow">NEW ARRIVALS</div>
          <h1>{heroTitle}</h1>
          <p>{heroSub}</p>
        </div>
      </section>

      <div className="sf-wrap">
        {/* 카테고리 + 정렬 */}
        {products.length > 0 && (
          <div className="sf-toolbar">
            <div className="sf-cats">
              {cats.map((c) => (
                <button
                  key={c}
                  className={"sf-chip" + (c === activeCat ? " on" : "")}
                  onClick={() => setActiveCat(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="sf-sorts">
              {SORTS.map((s) => (
                <button
                  key={s.id}
                  className={"sf-sort" + (s.id === sort ? " on" : "")}
                  onClick={() => setSort(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 그리드 */}
        {products.length === 0 ? (
          <div className="sf-empty">
            <div className="sf-empty-ico">🛍️</div>
            <b>곧 만나요</b>
            <span>상품을 준비 중이에요.</span>
          </div>
        ) : shown.length === 0 ? (
          <div className="sf-empty">
            <div className="sf-empty-ico">🔍</div>
            <b>검색 결과가 없어요</b>
            <span>다른 키워드로 찾아보세요.</span>
          </div>
        ) : (
          <>
            <div className="sf-section">
              <h2>{activeCat === "전체" ? "전체 상품" : activeCat}</h2>
              <span className="sf-count">{shown.length}개</span>
            </div>
            <div className="sf-grid">
            {shown.map((p) => (
              <div key={p.id} className="sf-card" onClick={() => openDetail(p)}>
                <div className="sf-thumb">
                  {p.tag && <span className="sf-tag">{p.tag}</span>}
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image_url} alt={p.name} className="sf-thumb-img" />
                  ) : (
                    p.emoji || "📦"
                  )}
                </div>
                <div className="sf-meta">
                  {p.brand && <div className="sf-brand">{p.brand}</div>}
                  <div className="sf-name">{p.name}</div>
                  <div className="sf-bottom">
                    <div className="sf-price">{won(p.price)}</div>
                    <button
                      className="sf-add"
                      onClick={(e) => {
                        e.stopPropagation();
                        add(p);
                      }}
                    >
                      담기
                    </button>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </>
        )}

        <div className="sf-foot">
          Powered by <b>ONJONGIL</b>
        </div>
      </div>

      {/* 상세 시트 */}
      <div className={"sf-scrim" + (detail ? " on" : "")} onClick={() => setDetail(null)} />
      {detail && (
        <div className="sf-sheet on" role="dialog">
          <button className="sf-x" onClick={() => setDetail(null)}>✕</button>
          <div className="sf-sheet-img">
            {detail.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={detail.image_url} alt={detail.name} className="sf-thumb-img" />
            ) : (
              detail.emoji || "📦"
            )}
          </div>
          <div className="sf-sheet-body">
            {detail.brand && <div className="sf-brand">{detail.brand}</div>}
            <h2>{detail.name}</h2>
            <div className="sf-sheet-desc">{detail.description || "정성껏 준비한 상품입니다."}</div>
            <div className="sf-sheet-buy">
              <div className="sf-qty">
                <button onClick={() => setDetailQty((q) => Math.max(1, q - 1))}>−</button>
                <span>{detailQty}</span>
                <button onClick={() => setDetailQty((q) => q + 1)}>+</button>
              </div>
              <div className="sf-price" style={{ fontSize: 20 }}>{won(detail.price * detailQty)}</div>
            </div>
            <button
              className="sf-add"
              style={{ marginTop: 16, padding: 13, fontSize: 15 }}
              onClick={() => {
                add(detail, detailQty);
                setDetail(null);
              }}
            >
              장바구니에 담기
            </button>
          </div>
        </div>
      )}

      {/* 카트 드로어 */}
      <div className={"sf-scrim" + (cartOpen ? " on" : "")} onClick={() => setCartOpen(false)} />
      <aside className={"sf-drawer" + (cartOpen ? " on" : "")}>
        <div className="sf-drawer-head">
          <b>장바구니</b>
          <button className="sf-x" style={{ position: "static" }} onClick={() => setCartOpen(false)}>✕</button>
        </div>
        <div className="sf-drawer-body">
          {cartLines.length === 0 ? (
            <div className="sf-cart-empty">장바구니가 비어 있어요.</div>
          ) : (
            cartLines.map((l) => (
              <div key={l.id} className="sf-citem">
                <div className="ci-img">
                  {l.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.image_url} alt={l.name} className="sf-thumb-img" />
                  ) : (
                    l.emoji || "📦"
                  )}
                </div>
                <div className="ci-info">
                  <b>{l.name}</b>
                  <i>{won(l.price)}</i>
                </div>
                <div className="sf-qty">
                  <button onClick={() => setQty(l.id, l.qty - 1)}>−</button>
                  <span>{l.qty}</span>
                  <button onClick={() => setQty(l.id, l.qty + 1)}>+</button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="sf-drawer-foot">
          <div className="sf-total">
            <span>합계</span>
            <b>{won(total)}</b>
          </div>
          <button
            className="sf-checkout"
            disabled={cartLines.length === 0}
            style={{ opacity: cartLines.length === 0 ? 0.5 : 1 }}
            onClick={() => flash("💳 결제 연동은 곧 추가됩니다 (데모)")}
          >
            결제하기
          </button>
        </div>
      </aside>

      <div className={"sf-toast" + (toast ? " on" : "")}>{toast}</div>
    </div>
  );
}
