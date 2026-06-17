"use client";

import { useMemo, useState } from "react";
import type { Section } from "@/lib/sections";
import { placeOrder, submitReview, checkCoupon } from "./actions";
import "./storefront.css";

export type Review = {
  id: string;
  product_id?: string;
  buyer_name: string;
  rating: number;
  comment: string | null;
  reply?: string | null;
  created_at: string;
};

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
  stock?: number | null;
  options?: OptGroup[] | null;
  created_at?: string | null;
};

type OptGroup = { name: string; choices: { label: string; add: number }[] };
type CartLine = {
  key: string;
  product: Product;
  qty: number;
  opts: Record<string, string>;
  unit: number; // 옵션 추가금 포함 단가
  label: string; // 옵션 표시 텍스트
};

const BEST_RE = /best|베스트|인기|추천|hot|스테디/i;
type Store = {
  id: string;
  name: string;
  skin: string;
  logo_url?: string | null;
  hero_image_url?: string | null;
  hero_title?: string | null;
  hero_subtitle?: string | null;
  pay_bank?: string | null;
  pay_note?: string | null;
  footer_text?: string | null;
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
  reviewsByProduct,
}: {
  store: Store;
  products: Product[];
  sections?: Section[];
  reviewsByProduct?: Record<string, Review[]>;
}) {
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [detail, setDetail] = useState<Product | null>(null);
  const [detailQty, setDetailQty] = useState(1);
  const [detailOpts, setDetailOpts] = useState<Record<string, string>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCat, setActiveCat] = useState("전체");
  const [sort, setSort] = useState("recommend");
  const [q, setQ] = useState("");
  const [searchOn, setSearchOn] = useState(false);
  const [toast, setToast] = useState("");
  // 체크아웃(주문서)
  const [checkout, setCheckout] = useState(false);
  const [buyer, setBuyer] = useState({ name: "", phone: "", email: "", address: "", memo: "" });
  const [placing, setPlacing] = useState(false);
  const [orderErr, setOrderErr] = useState("");
  const [orderDone, setOrderDone] = useState(false);
  const [paidTotal, setPaidTotal] = useState(0);
  // 쿠폰
  const [couponInput, setCouponInput] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [couponErr, setCouponErr] = useState(false);
  const [couponBusy, setCouponBusy] = useState(false);
  // 리뷰 (상세 시트). 서버에서 받은 것 + 이번 세션에 작성한 것(낙관적)
  const [addedReviews, setAddedReviews] = useState<Record<string, Review[]>>({});
  const [revName, setRevName] = useState("");
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState("");
  const [revBusy, setRevBusy] = useState(false);
  const [revErr, setRevErr] = useState("");

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

  const cartLines = Object.values(cart);
  const cartCount = cartLines.reduce((a, l) => a + l.qty, 0);
  const total = cartLines.reduce((sum, l) => sum + l.unit * l.qty, 0);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  }
  // 옵션 포함 담기. opts 없으면 기본.
  function add(
    p: Product,
    qty = 1,
    opts: Record<string, string> = {},
    unit = p.price,
    label = ""
  ) {
    if (p.stock === 0) {
      flash("품절된 상품이에요");
      return;
    }
    const key = p.id + "|" + JSON.stringify(opts);
    setCart((c) => {
      const prev = c[key]?.qty || 0;
      const next = prev + qty;
      const capped = typeof p.stock === "number" ? Math.min(next, p.stock) : next;
      return { ...c, [key]: { key, product: p, qty: capped, opts, unit, label } };
    });
    flash(`🛒 ${p.name} 담음`);
  }
  function setQty(key: string, qty: number) {
    setCart((c) => {
      const next = { ...c };
      if (qty <= 0) delete next[key];
      else if (next[key]) next[key] = { ...next[key], qty };
      return next;
    });
  }
  function openDetail(p: Product) {
    setDetail(p);
    setDetailQty(1);
    setDetailOpts({});
    setRevName("");
    setRevRating(5);
    setRevComment("");
    setRevErr("");
  }

  // 상세 시트 옵션 계산
  const dOpts: OptGroup[] = detail?.options || [];
  const dAddPrice = dOpts.reduce((s, g) => {
    const ch = g.choices.find((c) => c.label === detailOpts[g.name]);
    return s + (ch?.add || 0);
  }, 0);
  const dAllSelected = dOpts.every((g) => detailOpts[g.name]);
  const dUnit = detail ? detail.price + dAddPrice : 0;
  const dOptLabel = dOpts.map((g) => `${g.name}: ${detailOpts[g.name]}`).join(" / ");

  // 상세 시트 리뷰 (서버 + 이번에 작성한 것)
  const dReviews: Review[] = detail
    ? [...(addedReviews[detail.id] || []), ...((reviewsByProduct || {})[detail.id] || [])]
    : [];
  const dAvg = dReviews.length
    ? Math.round((dReviews.reduce((s, r) => s + r.rating, 0) / dReviews.length) * 10) / 10
    : 0;
  const stars = (n: number) => "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);

  async function postReview() {
    if (!detail) return;
    setRevErr("");
    if (!revName.trim()) return setRevErr("이름을 입력해 주세요.");
    setRevBusy(true);
    const res = await submitReview({
      storeId: store.id,
      productId: detail.id,
      name: revName,
      rating: revRating,
      comment: revComment,
    });
    setRevBusy(false);
    if (!res.ok || !res.review) return setRevErr(res.error || "등록에 실패했어요.");
    const pid = detail.id;
    setAddedReviews((m) => ({ ...m, [pid]: [{ ...res.review!, product_id: pid }, ...(m[pid] || [])] }));
    setRevName("");
    setRevComment("");
    setRevRating(5);
    flash("리뷰가 등록됐어요 🙌");
  }

  // 쿠폰 적용/해제. 표시 할인은 현재 장바구니 총액으로 클램프, 최종은 서버 재검증.
  const effectDiscount = Math.min(couponDiscount, total);
  const payable = total - effectDiscount;

  async function applyCoupon() {
    setCouponErr(false);
    setCouponMsg("");
    if (!couponInput.trim()) {
      setCouponErr(true);
      setCouponMsg("쿠폰 코드를 입력해 주세요.");
      return;
    }
    setCouponBusy(true);
    const res = await checkCoupon(store.id, couponInput, total);
    setCouponBusy(false);
    if (!res.ok) {
      setCouponErr(true);
      setCouponMsg(res.error || "사용할 수 없는 쿠폰이에요.");
      setCouponDiscount(0);
      setCouponCode("");
      return;
    }
    setCouponCode(res.code || couponInput.trim());
    setCouponDiscount(res.discount || 0);
    setCouponMsg(`쿠폰 적용! -${won(res.discount || 0)}`);
  }
  function clearCoupon() {
    setCouponCode("");
    setCouponDiscount(0);
    setCouponMsg("");
    setCouponErr(false);
    setCouponInput("");
  }

  async function submitOrder() {
    setOrderErr("");
    if (!buyer.name.trim() || !buyer.phone.trim()) {
      setOrderErr("이름과 연락처를 입력해 주세요.");
      return;
    }
    setPlacing(true);
    try {
      const items = cartLines.map((l) => ({ product_id: l.product.id, qty: l.qty, opts: l.opts }));
      const res = await placeOrder(store.id, buyer, items, couponCode || undefined);
      if (!res.ok) {
        setOrderErr(res.error || "주문에 실패했어요.");
        return;
      }
      setPaidTotal(payable);
      setCart({});
      clearCoupon();
      setOrderDone(true);
    } finally {
      setPlacing(false);
    }
  }

  function renderCard(p: Product) {
    const soldOut = p.stock === 0;
    return (
      <div key={p.id} className={"sf-card" + (soldOut ? " sf-soldout" : "")} onClick={() => openDetail(p)}>
        <div className="sf-thumb">
          {p.tag && !soldOut && <span className="sf-tag">{p.tag}</span>}
          {soldOut && <span className="sf-tag sf-tag-soldout">품절</span>}
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
          {typeof p.stock === "number" && p.stock > 0 && p.stock <= 5 && (
            <div className="sf-stock-low">{p.stock}개 남음</div>
          )}
          <div className="sf-bottom">
            <div className="sf-price">{won(p.price)}</div>
            <button
              className="sf-add"
              disabled={soldOut}
              onClick={(e) => {
                e.stopPropagation();
                if (soldOut) return;
                // 옵션 있으면 상세에서 선택하도록
                if (p.options && p.options.length) openDetail(p);
                else add(p);
              }}
            >
              {soldOut ? "품절" : "담기"}
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

        <div className="sf-foot" style={{ whiteSpace: "pre-line" }}>
          {store.footer_text && store.footer_text.trim()
            ? store.footer_text
            : `© ${store.name} · 온종일로 만든 쇼핑몰`}
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

            {/* 옵션 선택 */}
            {dOpts.map((g) => (
              <div key={g.name} className="sf-opt">
                <div className="sf-opt-name">{g.name}</div>
                <div className="sf-opt-choices">
                  {g.choices.map((c) => (
                    <button
                      key={c.label}
                      className={"sf-opt-chip" + (detailOpts[g.name] === c.label ? " on" : "")}
                      onClick={() => setDetailOpts((o) => ({ ...o, [g.name]: c.label }))}
                    >
                      {c.label}
                      {c.add > 0 && <span className="sf-opt-add"> +{won(c.add)}</span>}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="sf-sheet-buy">
              <div className="sf-qty">
                <button onClick={() => setDetailQty((q) => Math.max(1, q - 1))}>−</button>
                <span>{detailQty}</span>
                <button onClick={() => setDetailQty((q) => q + 1)}>+</button>
              </div>
              <div className="sf-price" style={{ fontSize: 20 }}>{won(dUnit * detailQty)}</div>
            </div>
            <button
              className="sf-add"
              style={{ marginTop: 16, padding: 13, fontSize: 15 }}
              onClick={() => {
                if (!dAllSelected) {
                  flash("옵션을 선택해 주세요");
                  return;
                }
                add(detail, detailQty, detailOpts, dUnit, dOptLabel);
                setDetail(null);
              }}
            >
              장바구니에 담기
            </button>

            {/* 리뷰 */}
            <div className="sf-reviews">
              <div className="sf-rev-head">
                <h3>구매 후기</h3>
                {dReviews.length > 0 && (
                  <span className="sf-rev-avg">
                    <b>★ {dAvg}</b> <span>({dReviews.length})</span>
                  </span>
                )}
              </div>

              {dReviews.length === 0 ? (
                <div className="sf-rev-empty">아직 후기가 없어요. 첫 후기를 남겨보세요!</div>
              ) : (
                <ul className="sf-rev-list">
                  {dReviews.map((r) => (
                    <li key={r.id} className="sf-rev-item">
                      <div className="sf-rev-top">
                        <b>{r.buyer_name}</b>
                        <span className="sf-rev-stars">{stars(r.rating)}</span>
                      </div>
                      {r.comment && <p className="sf-rev-body">{r.comment}</p>}
                      {r.reply && (
                        <div className="sf-rev-reply">
                          <b>판매자</b> {r.reply}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {/* 작성 폼 */}
              <div className="sf-rev-form">
                <div className="sf-rev-stars-pick">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={"sf-star-btn" + (n <= revRating ? " on" : "")}
                      onClick={() => setRevRating(n)}
                      aria-label={`${n}점`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <input
                  className="sf-rev-input"
                  placeholder="이름"
                  value={revName}
                  onChange={(e) => setRevName(e.target.value)}
                  maxLength={20}
                />
                <textarea
                  className="sf-rev-input sf-rev-area"
                  placeholder="후기를 남겨주세요 (선택)"
                  value={revComment}
                  onChange={(e) => setRevComment(e.target.value)}
                  maxLength={1000}
                />
                {revErr && <div className="sf-rev-err">{revErr}</div>}
                <button className="sf-rev-submit" onClick={postReview} disabled={revBusy}>
                  {revBusy ? "등록 중…" : "후기 등록"}
                </button>
              </div>
            </div>
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
              <div key={l.key} className="sf-citem">
                <div className="ci-img">
                  {l.product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.product.image_url} alt={l.product.name} className="sf-thumb-img" />
                  ) : (
                    l.product.emoji || "📦"
                  )}
                </div>
                <div className="ci-info">
                  <b>{l.product.name}</b>
                  {l.label && <small className="ci-opt">{l.label}</small>}
                  <i>{won(l.unit)}</i>
                </div>
                <div className="sf-qty">
                  <button onClick={() => setQty(l.key, l.qty - 1)}>−</button>
                  <span>{l.qty}</span>
                  <button onClick={() => setQty(l.key, l.qty + 1)}>+</button>
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
            onClick={() => {
              if (cartLines.length === 0) return;
              setOrderErr("");
              setOrderDone(false);
              setCartOpen(false);
              setCheckout(true);
            }}
          >
            주문하기
          </button>
        </div>
      </aside>

      {/* 주문서(체크아웃) */}
      <div className={"sf-scrim" + (checkout ? " on" : "")} onClick={() => !placing && setCheckout(false)} />
      {checkout && (
        <div className="sf-sheet on" role="dialog">
          {!placing && (
            <button className="sf-x" onClick={() => setCheckout(false)}>✕</button>
          )}
          <div className="sf-sheet-body sf-checkout-body">
            {orderDone ? (
              <div className="sf-order-done">
                <div className="sf-done-ico">✅</div>
                <h2>주문이 접수됐어요!</h2>
                <p>
                  사장님이 확인 후 연락드릴 거예요.
                  <br />
                  주문해 주셔서 감사합니다.
                </p>
                {store.pay_bank && (
                  <div className="sf-pay-box">
                    <div className="sf-pay-label">💳 입금 계좌</div>
                    <div className="sf-pay-bank">{store.pay_bank}</div>
                    <div className="sf-pay-amt">입금액 {won(paidTotal)}</div>
                    {store.pay_note && <div className="sf-pay-note">{store.pay_note}</div>}
                  </div>
                )}
                <button
                  className="sf-checkout"
                  onClick={() => {
                    setCheckout(false);
                    setBuyer({ name: "", phone: "", email: "", address: "", memo: "" });
                  }}
                >
                  쇼핑 계속하기
                </button>
              </div>
            ) : (
              <>
                <h2 className="sf-checkout-title">주문서 작성</h2>

                {/* 주문 요약 */}
                <div className="sf-checkout-summary">
                  {cartLines.map((l) => (
                    <div key={l.key} className="sf-co-line">
                      <span>{l.product.name}{l.label ? ` (${l.label})` : ""} × {l.qty}</span>
                      <b>{won(l.unit * l.qty)}</b>
                    </div>
                  ))}
                  {effectDiscount > 0 && (
                    <>
                      <div className="sf-co-line">
                        <span>상품 합계</span>
                        <b>{won(total)}</b>
                      </div>
                      <div className="sf-co-line sf-co-discount">
                        <span>쿠폰 할인{couponCode ? ` (${couponCode})` : ""}</span>
                        <b>-{won(effectDiscount)}</b>
                      </div>
                    </>
                  )}
                  <div className="sf-co-total">
                    <span>{effectDiscount > 0 ? "결제 예정" : "합계"}</span>
                    <b>{won(payable)}</b>
                  </div>
                </div>

                {/* 쿠폰 */}
                <div className="sf-coupon">
                  <div className="sf-coupon-row">
                    <input
                      className="sf-co-input sf-coupon-input"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="쿠폰 코드"
                      disabled={!!couponCode}
                    />
                    {couponCode ? (
                      <button type="button" className="sf-coupon-btn sf-coupon-clear" onClick={clearCoupon}>
                        해제
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="sf-coupon-btn"
                        onClick={applyCoupon}
                        disabled={couponBusy}
                      >
                        {couponBusy ? "확인 중…" : "적용"}
                      </button>
                    )}
                  </div>
                  {couponMsg && (
                    <div className={"sf-coupon-msg" + (couponErr ? " err" : " ok")}>{couponMsg}</div>
                  )}
                </div>

                {/* 받는 사람 정보 */}
                <label className="sf-co-label">받는 분 이름 *</label>
                <input
                  className="sf-co-input"
                  value={buyer.name}
                  onChange={(e) => setBuyer({ ...buyer, name: e.target.value })}
                  placeholder="홍길동"
                />
                <label className="sf-co-label">연락처 *</label>
                <input
                  className="sf-co-input"
                  value={buyer.phone}
                  onChange={(e) => setBuyer({ ...buyer, phone: e.target.value })}
                  placeholder="010-1234-5678"
                  inputMode="tel"
                />
                <label className="sf-co-label">이메일 (선택)</label>
                <input
                  className="sf-co-input"
                  value={buyer.email}
                  onChange={(e) => setBuyer({ ...buyer, email: e.target.value })}
                  placeholder="hong@example.com"
                  inputMode="email"
                />
                <label className="sf-co-label">배송 주소 (선택)</label>
                <input
                  className="sf-co-input"
                  value={buyer.address}
                  onChange={(e) => setBuyer({ ...buyer, address: e.target.value })}
                  placeholder="주소를 입력하세요"
                />
                <label className="sf-co-label">요청사항 (선택)</label>
                <textarea
                  className="sf-co-input"
                  value={buyer.memo}
                  onChange={(e) => setBuyer({ ...buyer, memo: e.target.value })}
                  placeholder="예: 부재 시 문 앞에 놓아주세요"
                  rows={2}
                />

                {orderErr && <div className="sf-co-err">{orderErr}</div>}

                <button className="sf-checkout" disabled={placing} onClick={submitOrder}>
                  {placing ? "접수 중…" : `${won(payable)} 주문 접수하기`}
                </button>
                <p className="sf-co-note">
                  💳 결제는 사장님과 별도로 진행돼요. (지금은 주문 접수까지)
                </p>
              </>
            )}
          </div>
        </div>
      )}

      <div className={"sf-toast" + (toast ? " on" : "")}>{toast}</div>
    </div>
  );
}
