"use client";

import { useEffect, useState } from "react";

// active가 true가 되면 글자를 한 자씩 타이핑. false면 비움(루프 재생용).
export default function Typed({
  text,
  active,
  speed = 55,
  className,
  showCaret = true,
}: {
  text: string;
  active: boolean;
  speed?: number;
  className?: string;
  showCaret?: boolean;
}) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!active) {
      setN(0);
      return;
    }
    setN(0);
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) clearInterval(t);
    }, speed);
    return () => clearInterval(t);
  }, [active, text, speed]);

  const done = n >= text.length;
  return (
    <span className={className}>
      {text.slice(0, n)}
      {showCaret && active && !done && <i className="tw-caret" />}
    </span>
  );
}
