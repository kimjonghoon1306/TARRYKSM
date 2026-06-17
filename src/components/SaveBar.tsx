"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { createPortal } from "react-dom";

// 폼 submit 버튼 — 누르는 즉시 "⏳ 저장 중…" + 비활성 + 눌림 애니메이션.
// (useFormStatus는 <form> 자식에서만 동작하므로 별도 컴포넌트로 분리)
export function SaveButton({
  label = "저장",
  className,
  disabled,
}: {
  label?: string;
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={
        className ??
        "press-glow rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-105 active:scale-[.93] disabled:opacity-60"
      }
    >
      {pending ? "⏳ 저장 중…" : label}
    </button>
  );
}

// 저장 성공 토스트 — 페이지가 ?msg(brmsg/pmsg/dmsg/smsg 등)로 돌아오면 화면 상단에 떴다 사라짐.
export function SavedToast({ message }: { message?: string }) {
  const [show, setShow] = useState("");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (message) {
      setShow(message);
      const t = setTimeout(() => setShow(""), 2800);
      return () => clearTimeout(t);
    }
  }, [message]);

  if (!show || !mounted) return null;
  return createPortal(
    <div
      style={{
        position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", zIndex: 10000,
        display: "flex", alignItems: "center", gap: 8, padding: "13px 24px", borderRadius: 999,
        background: "#16a34a", color: "#fff", fontSize: 14.5, fontWeight: 800,
        boxShadow: "0 12px 34px rgba(0,0,0,.32)",
      }}
    >
      ✓ {show}
    </div>,
    document.body
  );
}
