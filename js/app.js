/* ═══════════════════════════════════════════════════════
   INFINITE MALL ADMIN — INTERACTIONS
   admin-portal/js/app.js
═══════════════════════════════════════════════════════ */

'use strict';

/* ── Sidebar collapse ── */
const sidebar   = document.getElementById('sidebar');
const mainWrap  = document.getElementById('mainWrap');
const collapseBtn = document.getElementById('collapseBtn');

if (collapseBtn) {
  collapseBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    mainWrap.classList.toggle('collapsed');
    collapseBtn.textContent = sidebar.classList.contains('collapsed') ? '▶' : '◀';
  });
}

/* ── Nav item activation (desktop sidebar) ── */
document.querySelectorAll('.nav-item[data-section]').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    const title = item.querySelector('.nav-label');
    const topTitle = document.getElementById('topbarTitle');
    if (title && topTitle) topTitle.textContent = title.textContent.trim();
  });
});

/* ── Bottom nav activation (mobile) ── */
document.querySelectorAll('.bn-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.bn-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
  });
});

/* ── Feature card click (placeholder) ── */
document.querySelectorAll('.feat-card').forEach(card => {
  card.addEventListener('click', () => {
    const title = card.querySelector('.feat-title');
    if (title) {
      showToast(`${title.textContent} — 기능 준비 중입니다`);
    }
  });
});

/* ── FAB click ── */
const fab = document.getElementById('fab');
if (fab) {
  fab.addEventListener('click', () => showToast('빠른 등록 패널 — 준비 중'));
}

/* ── Toast notification ── */
function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.cssText = `
    position:fixed; bottom:calc(var(--bottom-nav-h, 0px) + 24px); left:50%;
    transform:translateX(-50%) translateY(10px);
    background:rgba(8,8,26,0.95);
    border:1px solid rgba(0,229,255,0.25);
    color:#F0F0FF; font-family:'DM Sans',sans-serif;
    font-size:13px; font-weight:500;
    padding:10px 20px; border-radius:99px;
    white-space:nowrap; z-index:9999;
    backdrop-filter:blur(12px);
    box-shadow:0 0 24px rgba(0,229,255,0.15);
    animation:toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards;
  `;
  toast.textContent = msg;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes toastIn {
      from { opacity:0; transform:translateX(-50%) translateY(16px); }
      to   { opacity:1; transform:translateX(-50%) translateY(0); }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
}

/* ── Live clock in topbar ── */
function updateClock() {
  const el = document.getElementById('liveClock');
  if (!el) return;
  const now = new Date();
  const h = String(now.getHours()).padStart(2,'0');
  const m = String(now.getMinutes()).padStart(2,'0');
  const s = String(now.getSeconds()).padStart(2,'0');
  el.textContent = `${h}:${m}:${s}`;
}
updateClock();
setInterval(updateClock, 1000);

/* ── Animate numbers (count-up) ── */
function countUp(el, target, duration = 1200) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) { start = target; clearInterval(timer); }
    const isFloat = !Number.isInteger(target);
    el.textContent = isFloat
      ? start.toFixed(1)
      : Math.floor(start).toLocaleString('ko-KR');
  }, 16);
}

document.querySelectorAll('[data-count]').forEach(el => {
  const target = parseFloat(el.dataset.count);
  setTimeout(() => countUp(el, target), 300);
});

/* ── Row items ── */
document.querySelectorAll('.row-item').forEach(item => {
  item.addEventListener('click', () => showToast('상세 보기 — 준비 중'));
});
