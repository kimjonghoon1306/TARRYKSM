import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "ONJONGIL — 퍼스널 쇼핑몰 빌더";

// 링크 공유(카톡·트위터·페북) 미리보기 이미지
export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #14152b 0%, #2a1846 50%, #3a1530 100%)",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: 28,
              background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 70,
              fontWeight: 800,
            }}
          >
            O
          </div>
          <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: -2 }}>ONJONGIL</div>
        </div>
        <div style={{ fontSize: 40, fontWeight: 700, opacity: 0.96 }}>
          나만의 퍼스널 쇼핑몰
        </div>
        <div style={{ fontSize: 26, opacity: 0.6, marginTop: 14 }}>
          클릭 한 번으로 만드는 나만의 쇼핑몰
        </div>
      </div>
    ),
    { ...size }
  );
}
