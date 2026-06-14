"use client";

import { useMemo, useState } from "react";
import "./storefront.css";

export type Product = {
  id: string;
  emoji: string | null;
  name: string;
  brand: string | null;
  price: number;
  category: string | null;
  description: string | null;
};
type Store = { name: string; skin: string };

const won = (n: number) => "₩" + n.toLocaleString("ko-KR");

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
  const [toast, setToast] = useState("");

  const cats = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.category && set.add(p.category));
    return ["전체", ...Array.from(set)];
  }, [products]);

  const shown = useMemo(
    () => (activeCat === "전체" ? products : products.filter((p) => p.category === activeCat)),
    [products, activeCat]
  );

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartLines = products
    .filter((p) => cart[p.id])
    .map((p) => ({ ...p, qty: cart[p.id] }));
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

  return (
    <div className="sf" data-skin={store.skin}>
      {/* 헤더 */}
      <header className="sf-bar">
        <span className="sf-logo">{store.name}</span>
        <button className="sf-cart-btn" onClick={() => setCartOpen(true)}>
          🛒 장바구니
          {cartCount > 0 && <span className="sf-cart-badge">{cartCount}</span>}
        </button>
      </header>

      {/* 히어로 */}
      <section className="sf-hero">
        <div className="sf-eyebrow">NEW ARRIVALS</div>
        <h1>{store.name}</h1>
        <p>엄선한 상품을 한 곳에. 지금 둘러보세요.</p>
      </section>

      <div className="sf-wrap">
        {/* 카테고리 */}
        {products.length > 0 && cats.length > 1 && (
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
        )}

        {/* 그리드 */}
        {products.length === 0 ? (
          <div className="sf-empty">아직 등록된 상품이 없어요.</div>
        ) : (
          <div className="sf-grid">
            {shown.map((p) => (
              <div key={p.id} className="sf-card" onClick={() => openDetail(p)}>
                <div className="sf-thumb">{p.emoji || "📦"}</div>
                <div className="sf-meta">
                  {p.brand && <div className="sf-brand">{p.brand}</div>}
                  <div className="sf-name">{p.name}</div>
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
            ))}
          </div>
        )}

        <div className="sf-foot">
          Powered by <b>ONJONGIL</b> · 무한분양
        </div>
      </div>

      {/* 상세 시트 */}
      <div
        className={"sf-scrim" + (detail ? " on" : "")}
        onClick={() => setDetail(null)}
      />
      {detail && (
        <div className="sf-sheet on" role="dialog">
          <button className="sf-x" onClick={() => setDetail(null)}>
            ✕
          </button>
          <div className="sf-sheet-img">{detail.emoji || "📦"}</div>
          <div className="sf-sheet-body">
            {detail.brand && <div className="sf-brand">{detail.brand}</div>}
            <h2>{detail.name}</h2>
            <div className="sf-sheet-desc">
              {detail.description || "정성껏 준비한 상품입니다."}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 14,
                flexWrap: "wrap",
              }}
            >
              <div className="sf-qty">
                <button onClick={() => setDetailQty((q) => Math.max(1, q - 1))}>−</button>
                <span>{detailQty}</span>
                <button onClick={() => setDetailQty((q) => q + 1)}>+</button>
              </div>
              <div className="sf-price" style={{ fontSize: 20 }}>
                {won(detail.price * detailQty)}
              </div>
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
      <div
        className={"sf-scrim" + (cartOpen ? " on" : "")}
        onClick={() => setCartOpen(false)}
      />
      <aside className={"sf-drawer" + (cartOpen ? " on" : "")}>
        <div className="sf-drawer-head">
          <b>장바구니</b>
          <button className="sf-x" style={{ position: "static" }} onClick={() => setCartOpen(false)}>
            ✕
          </button>
        </div>
        <div className="sf-drawer-body">
          {cartLines.length === 0 ? (
            <div className="sf-cart-empty">장바구니가 비어 있어요.</div>
          ) : (
            cartLines.map((l) => (
              <div key={l.id} className="sf-citem">
                <div className="ci-img">{l.emoji || "📦"}</div>
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
