"use client";

import { useState, useEffect, useRef } from "react";

export type StoreFaqItem = { id: string; question: string; answer: string };
export type BotStyle = "designer" | "robot" | "bear";

// 3가지 챗봇 모양 — 색 테마 + 캐릭터. 스킨 분위기에 맞춰 사장님이 고름.
export const BOT_THEMES: Record<BotStyle, { name: string; emoji: string; from: string; to: string; ink: string }> = {
  designer: { name: "디자이너", emoji: "🎨", from: "#7c6dff", to: "#ff6ec7", ink: "#fff" },
  robot: { name: "로봇", emoji: "🤖", from: "#22d3ee", to: "#3b82f6", ink: "#fff" },
  bear: { name: "곰돌이", emoji: "🐻", from: "#f7b955", to: "#fb7185", ink: "#3a2a12" },
};

export function BotAvatar({ style, size = 40, talking = false }: { style: BotStyle; size?: number; talking?: boolean }) {
  const t = BOT_THEMES[style] || BOT_THEMES.designer;
  const gid = `sbg-${style}`;
  const cls = talking ? "sb-av talking" : "sb-av";
  if (style === "robot") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className={cls}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={t.from} /><stop offset="1" stopColor={t.to} /></linearGradient>
          <linearGradient id={`${gid}-f`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#dbeafe" /></linearGradient>
        </defs>
        <circle cx="24" cy="24" r="24" fill={`url(#${gid})`} />
        {/* 안테나 */}
        <line x1="24" y1="6.5" x2="24" y2="11" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <circle cx="24" cy="6" r="2.6" fill="#fff" /><circle cx="24" cy="6" r="1.2" fill={t.to} />
        {/* 귀(헤드폰) */}
        <rect x="9.5" y="20" width="4" height="9" rx="2" fill="#fff" opacity="0.9" />
        <rect x="34.5" y="20" width="4" height="9" rx="2" fill="#fff" opacity="0.9" />
        {/* 머리 */}
        <rect x="12.5" y="12.5" width="23" height="22" rx="9" fill={`url(#${gid}-f)`} stroke="#bcd4f5" strokeWidth="0.8" />
        {/* 눈 (큰 글로시) */}
        <g className="sb-eyes">
          <circle cx="19" cy="23" r="3.4" fill="#1e3a8a" /><circle cx="29" cy="23" r="3.4" fill="#1e3a8a" />
          <circle cx="20.1" cy="21.8" r="1.1" fill="#fff" /><circle cx="30.1" cy="21.8" r="1.1" fill="#fff" />
        </g>
        {/* 볼 라이트 */}
        <circle cx="15.5" cy="28" r="1.6" fill="#7dd3fc" opacity="0.8" />
        <circle cx="32.5" cy="28" r="1.6" fill="#7dd3fc" opacity="0.8" />
        {/* 입 (미소) */}
        <path className="sb-mouth" d="M20.5 29.5c1.5 1.7 5.5 1.7 7 0" fill="none" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (style === "bear") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className={cls}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={t.from} /><stop offset="1" stopColor={t.to} /></linearGradient>
          <radialGradient id={`${gid}-f`} cx="0.5" cy="0.42" r="0.65"><stop offset="0" stopColor="#f0c89a" /><stop offset="1" stopColor="#d9a566" /></radialGradient>
        </defs>
        <circle cx="24" cy="24" r="24" fill={`url(#${gid})`} />
        {/* 귀 */}
        <circle cx="14.5" cy="14.5" r="5.5" fill="#c98a52" /><circle cx="14.5" cy="14.5" r="2.6" fill="#f7d9b8" />
        <circle cx="33.5" cy="14.5" r="5.5" fill="#c98a52" /><circle cx="33.5" cy="14.5" r="2.6" fill="#f7d9b8" />
        {/* 얼굴 */}
        <circle cx="24" cy="25" r="13.5" fill={`url(#${gid}-f)`} stroke="#cf9a5f" strokeWidth="0.6" />
        {/* 주둥이 */}
        <ellipse cx="24" cy="29" rx="7" ry="5.5" fill="#f7e3c8" />
        {/* 눈 (큰 반짝) */}
        <g className="sb-eyes">
          <circle cx="19" cy="23" r="2.4" fill="#3a2a12" /><circle cx="29" cy="23" r="2.4" fill="#3a2a12" />
          <circle cx="19.8" cy="22.1" r="0.8" fill="#fff" /><circle cx="29.8" cy="22.1" r="0.8" fill="#fff" />
        </g>
        {/* 볼터치 */}
        <circle cx="15" cy="28.5" r="2" fill="#ff9a8b" opacity="0.5" />
        <circle cx="33" cy="28.5" r="2" fill="#ff9a8b" opacity="0.5" />
        {/* 코 + 입 */}
        <ellipse cx="24" cy="27" rx="2.1" ry="1.5" fill="#5a3d22" />
        <path className="sb-mouth" d="M24 28.5v1.6m0 0c-1.2 1.3-3 1-3.6-.2m3.6.2c1.2 1.3 3 1 3.6-.2" fill="none" stroke="#5a3d22" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }
  // designer (기본)
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className={cls}>
      <defs><linearGradient id={gid} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={t.from} /><stop offset="1" stopColor={t.to} /></linearGradient></defs>
      <circle cx="24" cy="24" r="24" fill={`url(#${gid})`} />
      <circle cx="24" cy="26" r="12" fill="#ffe0c7" />
      <path d="M12 18c1-7 8-10 12-10s11 3 12 10c0 1-2 1-4 1-2-3-5-4-8-4s-6 1-8 4c-2 0-4 0-4-1z" fill="#2a2350" />
      <circle cx="36" cy="15" r="2.4" fill="#ff6ec7" />
      <g fill="none" stroke="#2a2350" strokeWidth="1.6"><circle cx="19.5" cy="25" r="3.2" /><circle cx="28.5" cy="25" r="3.2" /><path d="M22.7 25h2.6" /></g>
      <g className="sb-eyes" fill="#2a2350"><circle cx="19.5" cy="25" r="1.1" /><circle cx="28.5" cy="25" r="1.1" /></g>
      <g fill="#ff9bd0" opacity="0.55"><circle cx="15.5" cy="29" r="1.8" /><circle cx="32.5" cy="29" r="1.8" /></g>
      <path className="sb-mouth" d="M20 30.5c1.6 1.8 6.4 1.8 8 0" fill="none" stroke="#c0694a" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const SPARK = [
  { e: "✨", dx: -20, dy: -16 }, { e: "⭐", dx: 18, dy: -18 }, { e: "💫", dx: -22, dy: 8 },
  { e: "✨", dx: 22, dy: 6 }, { e: "🌟", dx: -6, dy: -24 }, { e: "💖", dx: 8, dy: -22 },
];
function Sparks() {
  return (
    <span className="sb-sparks" aria-hidden>
      {SPARK.map((s, i) => (
        <span key={i} style={{ ["--dx" as string]: `${s.dx}px`, ["--dy" as string]: `${s.dy}px`, animationDelay: `${i * 30}ms` }}>{s.e}</span>
      ))}
    </span>
  );
}

export default function StoreBot({
  faqs,
  storeName,
  style = "designer",
  greeting,
  title,
}: {
  faqs: StoreFaqItem[];
  storeName: string;
  style?: BotStyle;
  greeting?: string | null;
  title?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [qa, setQa] = useState<StoreFaqItem | null>(null);
  const [typing, setTyping] = useState(false);
  const [talking, setTalking] = useState(false);
  const [burst, setBurst] = useState(0);
  const [bubble, setBubble] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const theme = BOT_THEMES[style] || BOT_THEMES.designer;

  useEffect(() => {
    const t = setTimeout(() => setBubble(true), 4000);
    const t2 = setTimeout(() => setBubble(false), 12000);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);
  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  if (!faqs || faqs.length === 0) return null;

  function talk(ms = 1600) {
    setTalking(true);
    setBurst((b) => b + 1);
    const t = setTimeout(() => setTalking(false), ms);
    timers.current.push(t);
  }
  function toggle() {
    setOpen((v) => !v);
    setBubble(false);
    if (!open) talk(1500);
  }
  function pick(it: StoreFaqItem) {
    setQa(it);
    setTyping(true);
    talk(1800);
    const t = setTimeout(() => setTyping(false), 600);
    timers.current.push(t);
  }

  const grad = `linear-gradient(135deg, ${theme.from}, ${theme.to})`;

  return (
    <>
      <div className="sb-fab" style={{ position: "fixed", bottom: 18, right: 18, zIndex: 130, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
        {bubble && !open && (
          <button type="button" onClick={toggle} className="sb-bubble"
            style={{ maxWidth: 210, borderRadius: 16, borderBottomRightRadius: 6, background: "#fff", color: "#333", padding: "8px 13px", fontSize: 13, fontWeight: 700, boxShadow: "0 10px 30px rgba(0,0,0,.18)", border: "none", cursor: "pointer" }}>
            {greeting?.trim() || `${storeName}에 궁금한 점 있으세요? ${theme.emoji}`}
          </button>
        )}
        <button type="button" aria-label="문의 챗봇 열기" onClick={toggle} className="sb-fab-btn"
          style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 999, background: grad, color: theme.ink, padding: "6px 16px 6px 6px", boxShadow: "0 12px 32px rgba(0,0,0,.22)", border: "none", cursor: "pointer" }}>
          <span style={{ position: "relative", display: "inline-grid", placeItems: "center" }}>
            <span className={open ? "" : "sb-idle"}><BotAvatar style={style} size={36} talking={talking} /></span>
          </span>
          <b style={{ fontSize: 13 }}>문의하기</b>
        </button>
      </div>

      {open && (
        <div className="sb-panel" style={{ position: "fixed", bottom: 86, right: 18, zIndex: 130, width: "min(350px, 92vw)", maxHeight: "70vh", display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: 22, background: "#fff", boxShadow: "0 24px 60px rgba(0,0,0,.28)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 14, background: grad, color: theme.ink }}>
            <span style={{ position: "relative", display: "inline-grid", placeItems: "center" }}>
              <BotAvatar style={style} size={40} talking={talking} />
              <span key={burst} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>{talking && <Sparks />}</span>
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.1 }}>{title?.trim() || `${storeName} 챗봇`}</div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>{talking ? "답을 찾는 중… 🎵" : "무엇이든 물어보세요"}</div>
            </div>
            <button type="button" aria-label="닫기" onClick={() => setOpen(false)}
              style={{ display: "grid", placeItems: "center", width: 30, height: 30, borderRadius: 999, background: "rgba(255,255,255,.25)", color: theme.ink, border: "none", cursor: "pointer", fontSize: 14 }}>✕</button>
          </div>

          <div style={{ flex: 1, overflow: "auto", padding: 14, fontSize: 14, color: "#333" }}>
            {!qa ? (
              <div className="sb-pop">
                <p style={{ margin: "0 0 10px", color: "#777" }}>{greeting?.trim() || "안녕하세요! 궁금한 점을 눌러보세요 👇"}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {faqs.map((it, i) => (
                    <button key={it.id} onClick={() => pick(it)} className="sb-q" style={{ animationDelay: `${i * 40}ms`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, width: "100%", textAlign: "left", borderRadius: 12, border: "1px solid rgba(0,0,0,.08)", background: "rgba(0,0,0,.02)", padding: "10px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#333" }}>
                      <span>💬 {it.question}</span>
                      <span className="sb-arrow" style={{ color: theme.from }}>›</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="sb-pop">
                <button onClick={() => setQa(null)} style={{ marginBottom: 12, fontSize: 12, fontWeight: 700, color: theme.from, background: "none", border: "none", cursor: "pointer" }}>← 목록</button>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>💬 {qa.question}</div>
                {typing ? (
                  <div className="sb-typing" style={{ display: "flex", gap: 6, padding: "6px 0", color: "#bbb" }}><span /><span /><span /></div>
                ) : (
                  <div className="sb-answer" style={{ lineHeight: 1.6, color: "#555", whiteSpace: "pre-wrap" }}>{qa.answer}</div>
                )}
              </div>
            )}
          </div>

          <div style={{ borderTop: "1px solid rgba(0,0,0,.06)", padding: "9px 14px", textAlign: "center", fontSize: 11, color: "#aaa" }}>
            {title?.trim() || `${storeName} 챗봇`} · 도움이 필요하면 눌러주세요
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes sb-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        @keyframes sb-bob { 0%,100% { transform: translateY(0) rotate(0); } 25% { transform: translateY(-2px) rotate(-4deg); } 75% { transform: translateY(-2px) rotate(4deg); } }
        @keyframes sb-blink { 0%,93%,100% { transform: scaleY(1); } 96% { transform: scaleY(.1); } }
        @keyframes sb-pop { 0% { opacity: 0; transform: translateY(6px) scale(.98); } 100% { opacity: 1; transform: none; } }
        @keyframes sb-rise { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: none; } }
        @keyframes sb-dot { 0%,80%,100% { transform: translateY(0); opacity: .35; } 40% { transform: translateY(-5px); opacity: 1; } }
        @keyframes sb-spark { 0% { transform: translate(0,0) scale(0); opacity: 0; } 25% { opacity: 1; } 100% { transform: translate(var(--dx), var(--dy)) scale(1.1); opacity: 0; } }
        @keyframes sb-bubble-in { 0% { opacity: 0; transform: translateY(8px) scale(.9); } 60% { transform: translateY(-2px) scale(1.03); } 100% { opacity: 1; transform: none; } }
        @keyframes sb-wiggle { 0%,88%,100% { transform: rotate(0); } 91% { transform: rotate(-9deg); } 94% { transform: rotate(9deg); } 97% { transform: rotate(-5deg); } }
        .sb-idle { display: inline-block; animation: sb-float 3.2s ease-in-out infinite; }
        .sb-fab-btn:hover .sb-idle { animation: sb-wiggle .6s ease-in-out; }
        .sb-fab-btn { transition: transform .15s; }
        .sb-fab-btn:hover { transform: translateY(-2px); }
        .sb-fab-btn:active { transform: scale(.95); }
        .sb-av .sb-eyes { transform-box: fill-box; transform-origin: center; animation: sb-blink 4.2s infinite; }
        .sb-av.talking { animation: sb-bob .5s ease-in-out infinite; transform-origin: 24px 40px; }
        .sb-bubble { animation: sb-bubble-in .35s cubic-bezier(.34,1.56,.64,1) both; }
        .sb-pop { animation: sb-pop .28s ease-out; }
        .sb-answer { animation: sb-pop .3s ease-out; }
        .sb-q { animation: sb-rise .35s ease-out both; transition: border-color .15s, transform .12s, background .15s; }
        .sb-q:hover { border-color: rgba(124,109,255,.5) !important; background: rgba(124,109,255,.06) !important; }
        .sb-q:active { transform: scale(.97); }
        .sb-q .sb-arrow { transition: transform .15s; }
        .sb-q:hover .sb-arrow { transform: translateX(3px); }
        .sb-typing span { width: 7px; height: 7px; border-radius: 999px; background: currentColor; display: inline-block; animation: sb-dot 1.1s infinite; }
        .sb-typing span:nth-child(2) { animation-delay: .15s; }
        .sb-typing span:nth-child(3) { animation-delay: .3s; }
        .sb-sparks { position: absolute; inset: 0; display: grid; place-items: center; }
        .sb-sparks span { position: absolute; font-size: 13px; animation: sb-spark .9s ease-out forwards; }
        @media (prefers-reduced-motion: reduce) {
          .sb-idle, .sb-av, .sb-av.talking, .sb-av .sb-eyes, .sb-pop, .sb-rise, .sb-q, .sb-answer, .sb-bubble, .sb-sparks span, .sb-typing span { animation: none !important; }
        }
      `}</style>
    </>
  );
}
