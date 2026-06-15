"use client";

import { useMemo, useState } from "react";
import type { Section } from "@/lib/sections";
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
  created_at?: string | null;
};

const BEST_RE = /best|베스트|인기|추천|hot|스테디/i;
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
  sections,
}: {
  store: Store;
  products: Product[];
  sections?: Section[];
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

  // 창업자가 섹션 빌더로 구성을 짰으면 그걸 우선 렌더(없으면 기본 진열)
  const hasSections = !!(sections && sections.length);
  // 구성 중에 상품을 보여주는 블록(선반/그리드)이 하나라도 있는지 → 없으면 전체 그리드 자동 추가
  const sectionsHaveProducts = !!sections?.some((s) => s.type === "shelf" || s.type === "grid");
  // 홈(기본) 뷰 = 전체 + 추천정렬 + 검색없음 → 리치 진열(신상·기획전·베스트)
  const isHome = activeCat === "전체" && !q.trim() && sort === "recommend";

  const bestItems = useMemo(
    () => products.filter((p) => p.tag && BEST_RE.test(p.tag)).slice(0, 8),
    [products]
  );
  const newItems = useMemo(() => {
    const arr = [...products];
    arr.sort((a, b) => {
      const ta = a.created_at ? Date.parse(a.created_at) : 0;
      const tb = b.created_at ? Date.parse(b.created_at) : 0;
      return tb - ta;
    });
    return arr.slice(0, 8);
  }, [products]);
  // 기획전 배너에 띄울 대표 상품 (베스트 우선, 없으면 첫 상품)
  const feature = bestItems[0] || products[0] || null;

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

  function renderCard(p: Product) {
    return (
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
    );
  }

  // 섹션 빌더 블록 렌더 (창업자가 구성한 대문)
  function renderSection(s: Section) {
    const c = s.config || {};
    if (s.type === "banner") {
      const link = c.link_product_id ? products.find((p) => p.id === c.link_product_id) : null;
      return (
        <button
          key={s.id}
          className={"sf-promo sf-promo--" + (c.height || "md") + (c.image_url ? " has-img" : "")}
          style={c.image_url ? { backgroundImage: `url(${c.image_url})` } : undefined}
          onClick={() => {
            if (link) openDetail(link);
            else if (c.link_url) window.open(c.link_url, "_blank");
          }}
        >
          <div className="sf-promo-inner">
            {c.eyebrow && <span className="sf-promo-eyebrow">{c.eyebrow}</span>}
            {c.title && <h3>{c.title}</h3>}
            {c.subtitle && <p>{c.subtitle}</p>}
            {c.cta_label && <span className="sf-promo-cta">{c.cta_label} →</span>}
          </div>
        </button>
      );
    }
    if (s.type === "text") {
      return (
        <section key={s.id} className={"sf-textblock" + (c.align === "left" ? " left" : "")}>
          {c.eyebrow && <span className="sf-tb-eyebrow">{c.eyebrow}</span>}
          {c.title && <h2>{c.title}</h2>}
          {c.body && <p>{c.body}</p>}
        </section>
      );
    }
    if (s.type === "shelf") {
      let items: Product[] = [];
      if (c.source === "best") items = bestItems;
      else if (c.source === "category") items = products.filter((p) => p.category === c.category);
      else if (c.source === "manual")
        items = (c.product_ids || [])
          .map((id) => products.find((p) => p.id === id))
          .filter((p): p is Product => !!p);
      else items = newItems; // 'new' 기본
      items = items.slice(0, c.limit || 8);
      if (!items.length) return null;
      return (
        <section key={s.id} className="sf-shelf">
          <div className="sf-shelf-head">
            <h2>{c.title || "상품"}</h2>
            {c.subtitle && <span className="sf-shelf-sub">{c.subtitle}</span>}
          </div>
          <div className="sf-grid">{items.map(renderCard)}</div>
        </section>
      );
    }
    if (s.type === "grid") {
      const items = c.source === "category" ? products.filter((p) => p.category === c.category) : products;
      if (!items.length) return null;
      return (
        <section key={s.id} className="sf-shelf">
          <div className="sf-section">
            <h2>{c.title || "전체 상품"}</h2>
            <span className="sf-count">{items.length}개</span>
          </div>
          <div className="sf-grid">{items.map(renderCard)}</div>
        </section>
      );
    }
    return null;
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
        {hasSections ? (
          <>
            {/* 카테고리 칩 — 손님이 눌러 카테고리별로 둘러보기 */}
            {products.length > 0 && cats.length > 1 && (
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
              </div>
            )}

            {/* '전체'(+검색없음)이면 창업자가 구성한 블록, 아니면 해당 카테고리 그리드 */}
            {activeCat === "전체" && !q.trim() ? (
              <>
                {sections!.map(renderSection)}
                {/* 상품은 항상 보이게 — 구성에 상품 블록이 없으면 전체 그리드 자동 표시 */}
                {!sectionsHaveProducts && products.length > 0 && (
                  <section className="sf-shelf">
                    <div className="sf-section">
                      <h2>전체 상품</h2>
                      <span className="sf-count">{products.length}개</span>
                    </div>
                    <div className="sf-grid">{products.map(renderCard)}</div>
                  </section>
                )}
              </>
            ) : shown.length === 0 ? (
              <div className="sf-empty">
                <div className="sf-empty-ico">🔍</div>
                <b>{q.trim() ? "검색 결과가 없어요" : "이 카테고리에 상품이 없어요"}</b>
                <span>다른 분류를 둘러보세요.</span>
              </div>
            ) : (
              <>
                <div className="sf-section">
                  <h2>{activeCat === "전체" ? "검색 결과" : activeCat}</h2>
                  <span className="sf-count">{shown.length}개</span>
                </div>
                <div className="sf-grid">{shown.map(renderCard)}</div>
              </>
            )}
          </>
        ) : (
        <>
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

        {/* 진열 */}
        {products.length === 0 ? (
          <div className="sf-empty">
            <div className="sf-empty-ico">🛍️</div>
            <b>곧 만나요</b>
            <span>상품을 준비 중이에요.</span>
          </div>
        ) : isHome ? (
          /* ── 홈: 신상 선반 · 기획전 배너 · 베스트 선반 · 전체 그리드 ── */
          <>
            {newItems.length >= 2 && (
              <section className="sf-shelf">
                <div className="sf-shelf-head">
                  <h2>🆕 신상품</h2>
                  <span className="sf-shelf-sub">방금 들어온 따끈한 신상</span>
                </div>
                <div className="sf-grid">{newItems.map(renderCard)}</div>
              </section>
            )}

            {feature && (
              <button
                className={"sf-promo" + (feature.image_url ? " has-img" : "")}
                style={feature.image_url ? { backgroundImage: `url(${feature.image_url})` } : undefined}
                onClick={() => openDetail(feature)}
              >
                <div className="sf-promo-inner">
                  <span className="sf-promo-eyebrow">SPECIAL PICK</span>
                  <h3>{bestItems.length ? "이번 주 베스트" : "오늘의 추천"}</h3>
                  <p>{feature.name} · {won(feature.price)}</p>
                  <span className="sf-promo-cta">지금 보기 →</span>
                </div>
              </button>
            )}

            {bestItems.length >= 2 && (
              <section className="sf-shelf">
                <div className="sf-shelf-head">
                  <h2>🔥 베스트</h2>
                  <span className="sf-shelf-sub">가장 사랑받는 상품</span>
                </div>
                <div className="sf-grid">{bestItems.map(renderCard)}</div>
              </section>
            )}

            <section className="sf-shelf">
              <div className="sf-section">
                <h2>전체 상품</h2>
                <span className="sf-count">{products.length}개</span>
              </div>
              <div className="sf-grid">{products.map(renderCard)}</div>
            </section>
          </>
        ) : shown.length === 0 ? (
          <div className="sf-empty">
            <div className="sf-empty-ico">🔍</div>
            <b>검색 결과가 없어요</b>
            <span>다른 키워드로 찾아보세요.</span>
          </div>
        ) : (
          /* ── 필터/검색/정렬 뷰: 단순 그리드 ── */
          <>
            <div className="sf-section">
              <h2>{activeCat === "전체" ? "전체 상품" : activeCat}</h2>
              <span className="sf-count">{shown.length}개</span>
            </div>
            <div className="sf-grid">{shown.map(renderCard)}</div>
          </>
        )}
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
