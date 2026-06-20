"use client";

type Row = {
  created_at: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_email: string | null;
  address: string | null;
  memo: string | null;
  total: number;
  shipping: number | null;
  status: string;
  courier: string | null;
  tracking_no: string | null;
  stores: { name: string } | null;
  order_items: { name: string; qty: number; price: number }[];
};

// CSV 셀 이스케이프 (쉼표·따옴표·줄바꿈 대응)
function cell(v: unknown): string {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function fmt(d: string) {
  const t = new Date(d);
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")} ${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
}

// 주문 내역을 엑셀(CSV)로 내보내기 — 정산·택배 일괄처리용
export default function OrderCsvButton({ orders }: { orders: Row[] }) {
  function download() {
    const header = ["주문일", "쇼핑몰", "주문자", "연락처", "이메일", "배송지", "요청사항", "상품", "상품금액합", "배송비", "결제금액", "상태", "택배사", "운송장번호"];
    const lines = orders.map((o) => {
      const itemsText = (o.order_items || []).map((i) => `${i.name} x${i.qty}`).join(" / ");
      const itemsSum = (o.order_items || []).reduce((s, i) => s + i.price * i.qty, 0);
      return [
        fmt(o.created_at), o.stores?.name || "", o.buyer_name, o.buyer_phone, o.buyer_email || "",
        o.address || "", o.memo || "", itemsText, itemsSum, o.shipping || 0, o.total, o.status,
        o.courier || "", o.tracking_no || "",
      ].map(cell).join(",");
    });
    // 엑셀 한글 깨짐 방지 BOM
    const csv = "﻿" + [header.map(cell).join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `주문내역_${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!orders.length) return null;
  return (
    <button
      onClick={download}
      className="rounded-lg border border-black/10 px-4 py-2 text-sm font-semibold transition hover:border-violet-500 dark:border-white/15"
    >
      ⬇ 엑셀(CSV) 내보내기
    </button>
  );
}
