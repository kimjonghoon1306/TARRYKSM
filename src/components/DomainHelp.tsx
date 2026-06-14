"use client";

import { useState } from "react";

export default function DomainHelp() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-full border border-violet-400/40 bg-violet-500/10 px-2.5 py-1 text-xs font-bold text-violet-600 transition hover:bg-violet-500/20 dark:text-violet-300"
      >
        ❓ 사용방법
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-10 max-h-[85vh] w-full max-w-lg overflow-auto rounded-2xl border border-black/10 bg-white p-6 shadow-2xl dark:border-white/15 dark:bg-[#191a30]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">🌐 내 도메인 연결하는 법</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-black/5 text-sm dark:bg-white/10"
              >
                ✕
              </button>
            </div>

            <p className="mb-4 text-sm text-neutral-500">
              내가 가진 도메인(예: <b>mybrand.com</b>)을 이 쇼핑몰 주소로 쓰는 방법이에요.
              순서대로 3단계만 따라 하시면 됩니다.
            </p>

            <div className="space-y-4 text-sm">
              <Step n="1" title="도메인을 산 사이트에 로그인">
                도메인을 구입한 곳(예: <b>가비아</b>, <b>후이즈</b>, <b>카페24</b>,{" "}
                <b>Cloudflare</b>)에 로그인하세요. 거기서 “DNS 설정” 또는 “DNS 관리” 메뉴를 찾습니다.
              </Step>

              <Step n="2" title="DNS 레코드 1줄 추가">
                <p className="mb-2">아래 표대로 한 줄을 추가하고 저장하세요.</p>

                <div className="mb-3 rounded-lg border border-black/10 bg-black/[0.03] p-3 dark:border-white/10 dark:bg-white/[0.05]">
                  <div className="mb-1 font-bold">📌 예시 ①: shop.mybrand.com 처럼 앞에 글자가 붙는 경우</div>
                  <table className="w-full text-xs">
                    <tbody>
                      <tr><td className="py-0.5 text-neutral-400">타입(Type)</td><td className="font-mono font-bold">CNAME</td></tr>
                      <tr><td className="py-0.5 text-neutral-400">이름(Name/호스트)</td><td className="font-mono font-bold">shop</td></tr>
                      <tr><td className="py-0.5 text-neutral-400">값(Value/내용)</td><td className="font-mono font-bold">cname.vercel-dns.com</td></tr>
                    </tbody>
                  </table>
                </div>

                <div className="rounded-lg border border-black/10 bg-black/[0.03] p-3 dark:border-white/10 dark:bg-white/[0.05]">
                  <div className="mb-1 font-bold">📌 예시 ②: mybrand.com 처럼 그냥 도메인인 경우</div>
                  <table className="w-full text-xs">
                    <tbody>
                      <tr><td className="py-0.5 text-neutral-400">타입(Type)</td><td className="font-mono font-bold">A</td></tr>
                      <tr><td className="py-0.5 text-neutral-400">이름(Name/호스트)</td><td className="font-mono font-bold">@</td></tr>
                      <tr><td className="py-0.5 text-neutral-400">값(Value/내용)</td><td className="font-mono font-bold">76.76.21.21</td></tr>
                    </tbody>
                  </table>
                </div>
              </Step>

              <Step n="3" title="왼쪽 칸에 내 도메인 적고 저장">
                이 화면 왼쪽 “도메인” 칸에 <b>shop.mybrand.com</b> 처럼 적고 <b>저장</b>을 누르세요.
                나머지(서버 등록·자물쇠 https)는 <b>자동으로 처리</b>됩니다.
              </Step>
            </div>

            <div className="mt-5 rounded-xl bg-amber-400/10 p-3 text-xs text-amber-700 dark:text-amber-300">
              ⏰ DNS는 추가한 뒤 <b>몇 분~몇 시간</b> 걸려 연결돼요. 바로 안 열려도 조금 기다렸다가
              다시 확인하세요.
            </div>

            <div className="mt-3 rounded-xl bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300">
              💡 어려우면 그냥 기본 주소(<b>on.온종일.com/내주소</b>)를 쓰셔도 똑같이 잘 됩니다.
              도메인 연결은 “내 회사 주소를 쓰고 싶을 때만” 하는 선택이에요.
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 py-3 text-sm font-semibold text-white"
            >
              알겠어요
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-xs font-bold text-white">
        {n}
      </span>
      <div className="flex-1">
        <div className="mb-1 font-bold">{title}</div>
        <div className="text-neutral-600 dark:text-neutral-300">{children}</div>
      </div>
    </div>
  );
}
