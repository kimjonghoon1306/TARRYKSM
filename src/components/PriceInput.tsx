"use client";

import { useState } from "react";

// 가격 입력: 화면엔 천단위 콤마(28,000)로 보이고, 폼 제출은 숫자만(name=price).
// onValue로 부모(미리보기)에 원시 숫자 전달.
export default function PriceInput({
  name = "price",
  defaultValue,
  className,
  required,
  onValue,
}: {
  name?: string;
  defaultValue?: number | string | null;
  className?: string;
  required?: boolean;
  onValue?: (raw: string) => void;
}) {
  const [raw, setRaw] = useState<string>(
    defaultValue !== undefined && defaultValue !== null && defaultValue !== "" ? String(defaultValue).replace(/[^0-9]/g, "") : ""
  );
  const display = raw === "" ? "" : Number(raw).toLocaleString("ko-KR");

  return (
    <>
      {/* 폼 제출용: 숫자만 */}
      <input type="hidden" name={name} value={raw} />
      <input
        type="text"
        inputMode="numeric"
        value={display}
        required={required}
        placeholder="28,000"
        onChange={(e) => {
          const v = e.target.value.replace(/[^0-9]/g, "");
          setRaw(v);
          onValue?.(v);
        }}
        className={className}
      />
    </>
  );
}
