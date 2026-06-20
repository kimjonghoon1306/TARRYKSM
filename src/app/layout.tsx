import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://on.xn--zk5biyyw.com"),
  title: "ONJONGIL — 퍼스널 쇼핑몰",
  description: "클릭 한 번으로 만드는 나만의 퍼스널 쇼핑몰. ONJONGIL 쇼핑몰 빌더.",
  openGraph: {
    title: "ONJONGIL — 퍼스널 쇼핑몰",
    description: "클릭 한 번으로 만드는 나만의 퍼스널 쇼핑몰.",
    siteName: "ONJONGIL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ONJONGIL — 퍼스널 쇼핑몰",
    description: "클릭 한 번으로 만드는 나만의 퍼스널 쇼핑몰.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* 페인트 전에 테마 적용 → 다크/라이트 깜빡임(FOUC) 방지. 기본 다크. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
