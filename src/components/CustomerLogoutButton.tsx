"use client";

import { customerLogout } from "@/app/[slug]/customer-actions";

export default function CustomerLogoutButton({ slug }: { slug: string }) {
  return (
    <button
      type="button"
      onClick={async () => {
        await customerLogout();
        window.location.href = `/${slug}`;
      }}
      style={{ fontSize: 13, fontWeight: 600, color: "#888", background: "none", border: "1px solid #ddd", borderRadius: 999, padding: "6px 14px", cursor: "pointer" }}
    >
      로그아웃
    </button>
  );
}
