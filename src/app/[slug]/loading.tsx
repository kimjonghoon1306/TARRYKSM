// 쇼핑몰 진입 시 즉시 뜨는 로딩 표시 (DB 조회 동안 빈 화면 방지)
export default function StoreLoading() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, background: "#faf9f6" }}>
      <div style={{ width: 40, height: 40, borderRadius: 999, border: "3px solid #8b5cf6", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
      <div style={{ fontSize: 14, fontWeight: 600, color: "#9a9a9a" }}>쇼핑몰을 불러오는 중…</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
