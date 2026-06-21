"use client";

import { useEffect } from "react";
import { DICT } from "@/lib/dict";

/* ════════════════════════════════════════════════
   DashTranslator — 대시보드 런타임 번역 레이어
   영어 모드(lang=en)일 때만 동작. 화면의 한글 텍스트를
   DICT(한글→영어)로 치환한다. 사전에 없으면 한글 그대로(안 깨짐).
   · 텍스트 노드 + placeholder 속성 처리(사용자 입력 value는 건드리지 않음)
   · MutationObserver로 React 리렌더/탭 전환에도 재적용
════════════════════════════════════════════════ */
const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "CODE", "PRE"]);

export default function DashTranslator({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;

    const translateTextNodes = (root: Node) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(n) {
          const p = (n as Text).parentElement;
          if (!p || SKIP.has(p.tagName)) return NodeFilter.FILTER_REJECT;
          const t = (n.nodeValue || "").trim();
          if (!t || !DICT[t]) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      });
      const nodes: Text[] = [];
      let cur: Node | null;
      while ((cur = walker.nextNode())) nodes.push(cur as Text);
      for (const n of nodes) {
        const raw = n.nodeValue || "";
        const t = raw.trim();
        const en = DICT[t];
        if (en) n.nodeValue = raw.replace(t, en); // 앞뒤 공백 유지
      }
    };

    const translatePlaceholders = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>("[placeholder]").forEach((el) => {
        const t = (el.getAttribute("placeholder") || "").trim();
        if (DICT[t]) el.setAttribute("placeholder", DICT[t]);
      });
    };

    const run = () => {
      translateTextNodes(document.body);
      translatePlaceholders(document.body);
    };

    run();

    // 동적 변경(탭 전환·모달·서버액션 후 리렌더) 재번역 — rAF로 디바운스
    let scheduled = 0;
    const obs = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = requestAnimationFrame(() => {
        scheduled = 0;
        run();
      });
    });
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });

    return () => {
      obs.disconnect();
      if (scheduled) cancelAnimationFrame(scheduled);
    };
  }, [enabled]);

  return null;
}
