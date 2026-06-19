"use client";

import { useState, useEffect, useRef } from "react";

/* 온봇 — AI 키 없이 클릭으로 답하는 디자이너 도우미.
   프로그램 사용법·전체 기능·도메인 연결을 카테고리별 Q&A로 안내. */

type QA = { q: string; a: React.ReactNode };
type Cat = { id: string; label: string; icon: string; items: QA[] };

const CATS: Cat[] = [
  {
    id: "start",
    label: "시작하기",
    icon: "🚀",
    items: [
      {
        q: "쇼핑몰은 어떻게 만들어요?",
        a: (
          <>
            대문 <b>스튜디오</b>에서 마음에 드는 <b>스킨</b>을 고른 뒤 <b>“이 스킨으로 제작하기”</b>를
            누르세요. 주소(영문)를 정하고 이름만 적으면 바로 내 쇼핑몰이 생겨요.
          </>
        ),
      },
      {
        q: "상품은 어떻게 올려요?",
        a: (
          <>
            <b>대시보드 → 내 쇼핑몰 → (몰 선택) → 📦 상품</b>에서 <b>추가</b>를 누르고 사진·이름·가격·설명을
            넣으면 됩니다. 사진은 바로 업로드돼요.
          </>
        ),
      },
      {
        q: "손님이 보게 하려면요?",
        a: (
          <>
            몰 관리 화면 위쪽의 <b>🟢 발행하기</b>를 누르세요. <b>발행</b> 상태여야 주소로 접속했을 때
            손님에게 보입니다. (비공개면 나만 보여요)
          </>
        ),
      },
    ],
  },
  {
    id: "design",
    label: "디자인·꾸미기",
    icon: "🎨",
    items: [
      {
        q: "디자인(스킨) 바꾸기",
        a: (
          <>
            몰 관리 → <b>디자인</b> 탭에서 스킨을 고르고 <b>저장</b>하면 색·서체·무드가 통째로 바뀝니다.
            언제든 다시 바꿀 수 있어요.
          </>
        ),
      },
      {
        q: "상단 로고·배너 꾸미기",
        a: (
          <>
            몰 관리의 <b>🎨 상단 꾸미기</b>에서 로고·배너 이미지와 제목·문구를 바꿀 수 있어요. 그 안에
            <b> “🎬 따라 만드는 미리보기”</b>가 있어서, 로고→배너→제목→문구가 채워지는 모습을 보며 똑같이
            따라 하면 돼요.
          </>
        ),
      },
      {
        q: "대문 구성(섹션)으로 나만의 대문 만들기",
        a: (
          <>
            몰 관리 → <b>🧩 대문 구성</b>에서 블록을 쌓아 대문을 직접 만들어요. 블록 4가지:
            <div className="mt-1.5 space-y-1 text-[12.5px]">
              <div>🖼️ <b>기획전 배너</b> — 큰 사진·제목·버튼 (높이 작게/보통/크게 선택)</div>
              <div>🛒 <b>상품 선반</b> — 신상/베스트/카테고리/직접고른 상품 진열</div>
              <div>✍️ <b>텍스트 블록</b> — 브랜드 이야기·안내 문구</div>
              <div>🔲 <b>전체 상품 그리드</b> — 상품을 한눈에</div>
            </div>
            순서는 <b>드래그</b>하거나 <b>▲▼</b> 단추로 바꾸고, <b>👁 표시/🚫 숨김·🗑 삭제</b>도 돼요.
          </>
        ),
      },
      {
        q: "대문은 어떻게 만드는지 보여줘요",
        a: (
          <>
            <b>🧩 대문 구성</b> 페이지 맨 위의 <b>“🎬 대문은 이렇게 만들어요”</b>를 누르세요. 빈 대문에
            배너→상품 선반→텍스트→전체 그리드가 <b>하나씩 쌓여 완성되는 모습</b>을 영상처럼 보여주고,
            왼쪽에 <b>🙋 쉽게 따라하기</b> 단계별 설명이 있어요.
          </>
        ),
      },
      {
        q: "🔍 블록마다 실시간 미리보기",
        a: (
          <>
            대문 구성에서 블록을 열면 <b>그 블록이 실제로 어떻게 보일지</b> 바로 위에 미리보기로 나와요.
            제목·문구·이미지를 바꾸면 <b>즉시</b> 반영돼서, 보면서 꾸미면 돼요.
          </>
        ),
      },
    ],
  },
  {
    id: "domain",
    label: "도메인 연결",
    icon: "🌐",
    items: [
      {
        q: "기본 주소가 뭐예요?",
        a: (
          <>
            발행하면 <b>on.온종일.com/내주소</b> 로 바로 열립니다. 주소(영문)는 몰 관리에서 언제든 바꿀
            수 있어요. 따로 도메인을 안 사도 돼요.
          </>
        ),
      },
      {
        q: "내 도메인(mybrand.com) 연결",
        a: (
          <>
            ① 도메인 산 곳(가비아·후이즈·Cloudflare 등)의 <b>DNS 설정</b>에서 한 줄 추가:
            <div className="mt-1.5 rounded-lg border border-black/10 bg-black/[0.03] p-2 font-mono text-[11px] dark:border-white/10 dark:bg-white/[0.05]">
              shop.mybrand.com → 타입 <b>CNAME</b>, 값 <b>cname.vercel-dns.com</b>
              <br />
              mybrand.com → 타입 <b>A</b>, 값 <b>76.76.21.21</b>
            </div>
            ② 몰 관리 <b>도메인</b> 칸에 내 도메인을 적고 저장. ③ 서버 등록·🔒https는 <b>자동</b>이에요.
            연결까지 몇 분~몇 시간 걸릴 수 있어요.
          </>
        ),
      },
    ],
  },
  {
    id: "features",
    label: "전체 기능",
    icon: "🛠",
    items: [
      {
        q: "대시보드에서 뭘 할 수 있어요?",
        a: (
          <>
            <b>대시보드</b>(요약) · <b>쇼핑몰</b>(생성/관리) · <b>상품</b>(전체 상품) · <b>주문/고객</b> ·{" "}
            <b>분석</b>(몰·상품·가치 통계) · <b>설정</b>(비밀번호 등)을 한 곳에서 관리해요.
          </>
        ),
      },
      {
        q: "상품 정렬·태그(베스트/신상)",
        a: (
          <>
            상품에 <b>태그</b>(예: 베스트·인기·NEW)를 달면 스토어프런트가 <b>🔥베스트·🆕신상품 선반</b>으로
            자동 분리해 보여줘요.
          </>
        ),
      },
      {
        q: "손님이 카테고리별로 상품 보기",
        a: (
          <>
            상품에 <b>카테고리</b>(예: 과일·정육·채소)를 정해두면, 쇼핑몰 위에 <b>카테고리 단추(칩)</b>가
            자동으로 생겨요. 손님이 누르면 그 카테고리 상품만 모아 보여줘요. <b>상품은 항상 보이게</b>
            되어 있어 손님이 헤매지 않아요. 카테고리는 <b>식품·농산물·수산물·축산물·베이커리</b> 등 식품도 갖춰져 있어요.
          </>
        ),
      },
      {
        q: "가격 입력 — 콤마 자동",
        a: (
          <>
            상품 가격을 적을 때 <b>28,000</b>처럼 <b>천 단위 콤마가 자동</b>으로 들어가서 오타 없이 편해요.
            상품 등록 화면엔 <b>🔍 미리보기</b>가 있어 손님에게 어떻게 보일지 바로 확인돼요.
          </>
        ),
      },
    ],
  },
  {
    id: "account",
    label: "계정·관리자",
    icon: "🔑",
    items: [
      {
        q: "비밀번호를 잊었어요",
        a: (
          <>
            로그인 화면의 <b>비밀번호 찾기</b>로 메일을 받아 새로 정하세요. 아이디는 <b>가입한 이메일</b>이에요.
          </>
        ),
      },
      {
        q: "관리자(컨트롤타워) 입장",
        a: (
          <>
            스튜디오 <b>좌측 상단 로고</b>를 <b>5번 빠르게 클릭</b>하면 관리자(컨트롤타워)로 들어가요. (숨은
            입구라 평소엔 안 보여요)
          </>
        ),
      },
    ],
  },
  {
    id: "whatsnew",
    label: "✨ 새 기능 & 꿀팁",
    icon: "✨",
    items: [
      {
        q: "🚚 배송비 설정 (무료배송 기준·도서산간)",
        a: (
          <>
            몰 관리 <b>🚚 배송비</b>에서 <b>배송비 받기</b>를 켜고 <b>기본 배송비</b>를 정하세요.
            <b> 무료배송 기준액</b>을 넣으면 상품 합계가 그 금액을 넘을 때 <b>자동으로 무료배송</b>이 돼요.
            <b> 도서산간 추가비</b>도 넣을 수 있고, 손님 결제창에서 <b>“○○원 더 담으면 무료배송!”</b>까지
            자동으로 안내돼요. (끄면 배송비 없이 받아요)
          </>
        ),
      },
      {
        q: "🏷️ 할인가/정가 (정가 취소선·할인율%)",
        a: (
          <>
            상품 추가·수정에서 <b>정가(할인 전 가격)</b> 칸에 원래 가격을 넣으면, 손님 화면에
            <b> ~~정가~~ · 빨간 할인율% · 판매가</b>가 함께 표시돼 <b>세일 느낌</b>을 줄 수 있어요.
            정가를 비우거나 판매가보다 작으면 그냥 판매가만 보여요.
          </>
        ),
      },
      {
        q: "💬 상품 문의(Q&A) — 손님 질문 받고 답하기",
        a: (
          <>
            손님이 상품 상세에서 <b>“상품 문의”</b>에 질문을 남기면(🔒비밀글도 가능),
            <b> 대시보드 → 💬 문의</b>에 쌓여요. 각 문의 아래 <b>“답변 달기”</b>로 답하면 손님 화면에
            <b> “판매자 답변”</b>으로 붙어요. 비밀글은 <b>작성한 손님과 사장님</b>만 볼 수 있어요.
            <div className="mt-1.5 text-[12.5px] text-neutral-500 dark:text-neutral-400">
              ※ 별점 <b>후기</b>는 <b>⭐리뷰</b> 메뉴, 질문 <b>문의</b>는 <b>💬문의</b> 메뉴로 나뉘어요.
            </div>
          </>
        ),
      },
      {
        q: "🔍 전체 미리보기 — 발행 전에 손님 화면 그대로 보기",
        a: (
          <>
            몰 관리 위쪽 <b>🔍 전체 미리보기</b> 버튼을 누르면, <b>발행 안 해도</b> 실제 손님이 볼 쇼핑몰을
            그대로 볼 수 있어요. <b>📱모바일 · 📲태블릿 · 🖥데스크탑</b>으로 기기를 바꿔가며 확인하세요.
          </>
        ),
      },
      {
        q: "🖼 무료 이미지 라이브러리 (상품사진 없어도 OK)",
        a: (
          <>
            상품 추가·수정의 <b>상품 사진</b>에서 <b>“🖼 무료 이미지에서 고르기”</b>를 누르면, 식품·라이프스타일
            <b> 66종</b> 사진을 바로 골라 쓸 수 있어요. 직접 업로드도 되고, 고르면 <b>✓ 적용됐어요</b>로 확인돼요.
          </>
        ),
      },
      {
        q: "💳 결제 수단 선택 (무통장·카드·가상계좌)",
        a: (
          <>
            몰 관리 <b>💳 결제 설정</b>에서 손님에게 보여줄 결제 수단을 <b>켜고 끌</b> 수 있어요. 각 수단 옆
            <b> ⓘ</b>를 누르면 발급 방법·수수료까지 자세히 설명해줘요. 무통장입금은 <b>계좌번호</b>를 넣으면
            손님 주문서에 자동으로 떠요.
          </>
        ),
      },
      {
        q: "🏢 쇼핑몰 하단 사업자 정보 표시",
        a: (
          <>
            몰 관리 <b>🏢 사업자 정보</b>에 상호·대표·사업자등록번호·통신판매업번호·주소·연락처를 넣으면
            쇼핑몰 <b>맨 아래에 자동으로</b> 깔끔하게 표시돼요. (전자상거래법상 표시 의무 항목) 입력한 항목만 나와요.
          </>
        ),
      },
      {
        q: "🧾 푸터(하단 문구) 직접 바꾸기",
        a: (
          <>
            몰 관리 <b>상단·하단 꾸미기</b>에서 <b>하단 푸터 문구</b>를 직접 적을 수 있어요. 비우면
            <b> “© 내가게 · 온종일로 만든 쇼핑몰”</b>이 기본으로 나와요.
          </>
        ),
      },
      {
        q: "📱 모바일 하단 ‘바로 주문’ 바",
        a: (
          <>
            손님이 폰에서 상품을 담으면 <b>화면 맨 아래에 장바구니·바로 주문 바</b>가 항상 따라다녀요.
            스크롤을 내려도 바로 주문할 수 있어 <b>모바일 구매가 훨씬 쉬워져요</b>.
          </>
        ),
      },
      {
        q: "🛒 손님 주문 받기 — 어떻게 들어와요?",
        a: (
          <>
            손님이 상품을 담고 <b>주문서</b>에 이름·연락처를 넣고 <b>주문 접수</b>하면, 무통장입금 계좌가
            안내되고 <b>“주문이 접수됐어요 ✅”</b>가 떠요. 들어온 주문은 <b>대시보드 → 주문</b>에서
            확인하고 <b>상태(처리중·배송중·완료)</b>를 바꿀 수 있어요.
          </>
        ),
      },
      {
        q: "✨ 버튼이 반짝이고 움직여요 (자동)",
        a: (
          <>
            모든 쇼핑몰의 <b>담기·주문 버튼</b>에 <b>유광(광택)·살짝 떠오름</b> 효과가 자동으로 들어가 있어요.
            스킨을 바꿔도 그 스킨 색에 맞춰 자동 적용돼서, 따로 설정할 게 없어요.
          </>
        ),
      },
      {
        q: "💾 저장하면 ‘저장됐어요’로 확인돼요",
        a: (
          <>
            스킨·꾸미기·결제·사업자 정보 등을 저장하면 <b>“⏳ 저장 중…”</b> 후 <b>“✓ 저장됐어요”</b> 알림이
            떠요. 바뀐 내용은 <b>실제 쇼핑몰에 바로</b> 반영됩니다.
          </>
        ),
      },
    ],
  },
];

function DesignerAvatar({ size = 40, talking = false }: { size?: number; talking?: boolean }) {
  // 디자이너 캐릭터: 베레모 + 둥근 안경 + 미소 (눈 깜빡임·말하기 애니메이션)
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className={talking ? "onbot-av talking" : "onbot-av"}>
      <defs>
        <linearGradient id="onbot-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7c6dff" />
          <stop offset="1" stopColor="#ff6ec7" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="24" fill="url(#onbot-g)" />
      {/* 얼굴 */}
      <circle cx="24" cy="26" r="12" fill="#ffe0c7" />
      {/* 머리/베레모 */}
      <path d="M12 18c1-7 8-10 12-10s11 3 12 10c0 1-2 1-4 1-2-3-5-4-8-4s-6 1-8 4c-2 0-4 0-4-1z" fill="#2a2350" />
      <circle cx="36" cy="15" r="2.4" fill="#ff6ec7" />
      {/* 안경 */}
      <g fill="none" stroke="#2a2350" strokeWidth="1.6">
        <circle cx="19.5" cy="25" r="3.2" />
        <circle cx="28.5" cy="25" r="3.2" />
        <path d="M22.7 25h2.6" />
      </g>
      {/* 눈동자 (깜빡임) */}
      <g className="onbot-eyes" fill="#2a2350">
        <circle cx="19.5" cy="25" r="1.1" />
        <circle cx="28.5" cy="25" r="1.1" />
      </g>
      {/* 볼터치 */}
      <g fill="#ff9bd0" opacity="0.55">
        <circle cx="15.5" cy="29" r="1.8" />
        <circle cx="32.5" cy="29" r="1.8" />
      </g>
      {/* 입 (말할 땐 오므렸다 폈다) */}
      <path className="onbot-mouth" d="M20 30.5c1.6 1.8 6.4 1.8 8 0" fill="none" stroke="#c0694a" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const GREETINGS = [
  "안녕하세요! 무엇이 궁금하세요? 👇 눌러보세요.",
  "반가워요 🎨 오늘은 뭘 도와드릴까요?",
  "어서오세요! 쇼핑몰 만들기, 제가 도와드릴게요 ✨",
  "또 오셨네요! 😊 궁금한 걸 눌러보세요.",
];
const FOOTERS = [
  "온봇은 도움말을 안내해요 · AI 응답 아님",
  "💡 팁: 매주 새 기능이 추가돼요!",
  "🍀 막히면 언제든 저를 불러주세요",
  "🎁 ‘✨ 새 기능 & 꿀팁’도 구경해보세요",
];
const BUBBLES = ["도와드릴까요? 🎨", "새 기능 보러올래요? ✨", "궁금한 거 있어요? 😊"];
// 반짝이 튀는 방향 (고정값 — 하이드레이션 안전)
const SPARK = [
  { e: "✨", dx: -22, dy: -18 }, { e: "⭐", dx: 20, dy: -20 }, { e: "💫", dx: -26, dy: 8 },
  { e: "✨", dx: 24, dy: 6 }, { e: "🌟", dx: -8, dy: -28 }, { e: "💖", dx: 10, dy: -26 },
];

function Sparkles() {
  return (
    <span className="onbot-sparks" aria-hidden>
      {SPARK.map((s, i) => (
        <span key={i} style={{ ["--dx" as string]: `${s.dx}px`, ["--dy" as string]: `${s.dy}px`, animationDelay: `${i * 30}ms` }}>
          {s.e}
        </span>
      ))}
    </span>
  );
}

export default function OnBot() {
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState<Cat | null>(null);
  const [qa, setQa] = useState<QA | null>(null);
  const [typing, setTyping] = useState(false);
  const [talking, setTalking] = useState(false);
  const [burst, setBurst] = useState(0); // 반짝이 재생용 key
  const [round, setRound] = useState(0); // 인사말·푸터 회전
  const [bubble, setBubble] = useState(false); // FAB 말풍선 힌트
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // 처음 입장 후 잠깐 뒤 말풍선으로 "도와드릴까요?" 띄우기 (한 번)
  useEffect(() => {
    const t = setTimeout(() => setBubble(true), 3500);
    const t2 = setTimeout(() => setBubble(false), 11000);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);

  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  function talk(ms = 1500) {
    setTalking(true);
    setBurst((b) => b + 1);
    const t = setTimeout(() => setTalking(false), ms);
    timers.current.push(t);
  }
  function openPanel() {
    setOpen((v) => !v);
    setBubble(false);
    setRound((r) => r + 1);
    if (!open) talk(1600);
  }
  function pickCat(c: Cat) {
    setCat(c);
    setQa(null);
    talk(1200);
  }
  function pickQa(it: QA) {
    setQa(it);
    setTyping(true);
    talk(1800);
    const t = setTimeout(() => setTyping(false), 600);
    timers.current.push(t);
  }
  function reset() {
    setCat(null);
    setQa(null);
  }

  return (
    <>
      {/* 플로팅 버튼 + 말풍선 힌트 */}
      <div className="onbot-fab fixed bottom-5 right-5 z-[120] flex flex-col items-end gap-2">
        {bubble && !open && (
          <button
            type="button"
            onClick={openPanel}
            className="onbot-bubble max-w-[200px] rounded-2xl rounded-br-md bg-white px-3.5 py-2 text-[13px] font-semibold text-neutral-700 shadow-xl ring-1 ring-black/5 dark:bg-[#22233e] dark:text-neutral-100 dark:ring-white/10"
          >
            {BUBBLES[round % BUBBLES.length]}
          </button>
        )}
        <button
          type="button"
          aria-label="온봇 도우미 열기"
          onClick={openPanel}
          className="onbot-fab-btn flex items-center gap-2 rounded-full bg-white/90 py-1.5 pl-1.5 pr-4 shadow-xl shadow-violet-500/20 ring-1 ring-black/5 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-2xl active:scale-95 dark:bg-[#191a30]/90 dark:ring-white/10"
        >
          <span className="relative inline-grid place-items-center">
            <span className={open ? "" : "onbot-idle"}>
              <DesignerAvatar size={38} talking={talking} />
            </span>
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400 dark:border-[#191a30]" />
          </span>
          <span className="text-sm font-bold">온봇</span>
        </button>
      </div>

      {/* 패널 */}
      {open && (
        <div className="onbot-panel fixed bottom-24 right-5 z-[120] flex max-h-[72vh] w-[min(360px,92vw)] flex-col overflow-hidden rounded-3xl border border-black/10 bg-white shadow-2xl dark:border-white/12 dark:bg-[#16172b]">
          {/* 헤더 */}
          <div className="relative flex items-center gap-3 overflow-hidden bg-gradient-to-r from-violet-500 to-pink-500 p-4 text-white">
            <span className="relative inline-grid place-items-center">
              <DesignerAvatar size={40} talking={talking} />
              {/* 답할 때 반짝이 튐 */}
              <span key={burst} className="pointer-events-none absolute inset-0">
                {talking && <Sparkles />}
              </span>
            </span>
            <div className="flex-1">
              <div className="text-[15px] font-extrabold leading-tight">온봇</div>
              <div className="text-[11px] text-white/80">{talking ? "온봇이 신나서 말하는 중… 🎵" : "무한분양 디자이너 도우미"}</div>
            </div>
            <button
              type="button"
              aria-label="닫기"
              onClick={() => setOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm transition hover:bg-white/30 active:scale-90"
            >
              ✕
            </button>
          </div>

          {/* 본문 */}
          <div className="flex-1 overflow-auto p-4 text-sm">
            {!cat ? (
              <div className="onbot-pop">
                <p className="mb-3 text-neutral-500 dark:text-neutral-300">{GREETINGS[round % GREETINGS.length]}</p>
                <div className="grid grid-cols-2 gap-2">
                  {CATS.map((c, i) => (
                    <button
                      key={c.id}
                      onClick={() => pickCat(c)}
                      style={{ animationDelay: `${i * 45}ms` }}
                      className="onbot-card onbot-rise flex flex-col items-start gap-1 rounded-2xl border border-black/8 bg-black/[0.02] p-3 text-left transition hover:-translate-y-0.5 hover:border-violet-400/50 hover:shadow-md hover:shadow-violet-500/10 active:scale-95 dark:border-white/10 dark:bg-white/[0.03]"
                    >
                      <span className="onbot-cardicon text-xl">{c.icon}</span>
                      <span className="text-[13px] font-bold">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : qa ? (
              <div className="onbot-pop">
                <button onClick={() => setQa(null)} className="mb-3 text-xs font-semibold text-violet-500 transition active:scale-95">
                  ← {cat.label}
                </button>
                <div className="mb-2 font-bold">{qa.q}</div>
                {typing ? (
                  <div className="onbot-typing flex items-center gap-1.5 py-2 text-neutral-400">
                    <span /><span /><span />
                  </div>
                ) : (
                  <div className="onbot-answer leading-relaxed text-neutral-600 dark:text-neutral-300">{qa.a}</div>
                )}
              </div>
            ) : (
              <div className="onbot-pop">
                <button onClick={reset} className="mb-3 text-xs font-semibold text-violet-500 transition active:scale-95">
                  ← 처음으로
                </button>
                <div className="mb-2 flex items-center gap-2 font-bold">
                  <span>{cat.icon}</span>
                  {cat.label}
                </div>
                <div className="space-y-2">
                  {cat.items.map((it, i) => (
                    <button
                      key={it.q}
                      onClick={() => pickQa(it)}
                      style={{ animationDelay: `${i * 40}ms` }}
                      className="onbot-q onbot-rise group flex w-full items-center justify-between gap-2 rounded-xl border border-black/8 bg-black/[0.02] px-3 py-2.5 text-left text-[13px] font-medium transition hover:border-violet-400/50 hover:bg-violet-500/5 active:scale-[.97] dark:border-white/10 dark:bg-white/[0.03]"
                    >
                      <span>{it.q}</span>
                      <span className="text-neutral-400 transition-transform group-hover:translate-x-1 group-hover:text-violet-500">›</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-black/5 px-4 py-2.5 text-center text-[11px] text-neutral-400 dark:border-white/10">
            {FOOTERS[round % FOOTERS.length]}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes onbot-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        @keyframes onbot-bob { 0%,100% { transform: translateY(0) rotate(0); } 25% { transform: translateY(-2px) rotate(-4deg); } 75% { transform: translateY(-2px) rotate(4deg); } }
        @keyframes onbot-blink { 0%,93%,100% { transform: scaleY(1); } 96% { transform: scaleY(0.1); } }
        @keyframes onbot-talkmouth { 0%,100% { d: path("M20 30.5c1.6 1.8 6.4 1.8 8 0"); } 50% { d: path("M20 31c1.6 0.6 6.4 0.6 8 0"); } }
        @keyframes onbot-pop { 0% { opacity: 0; transform: translateY(6px) scale(.98); } 100% { opacity: 1; transform: none; } }
        @keyframes onbot-rise { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: none; } }
        @keyframes onbot-dot { 0%,80%,100% { transform: translateY(0); opacity: .35; } 40% { transform: translateY(-5px); opacity: 1; } }
        @keyframes onbot-spark { 0% { transform: translate(0,0) scale(0); opacity: 0; } 25% { opacity: 1; } 100% { transform: translate(var(--dx), var(--dy)) scale(1.1); opacity: 0; } }
        @keyframes onbot-bubble-in { 0% { opacity: 0; transform: translateY(8px) scale(.9); } 60% { transform: translateY(-2px) scale(1.03); } 100% { opacity: 1; transform: none; } }
        @keyframes onbot-wiggle { 0%,88%,100% { transform: rotate(0); } 91% { transform: rotate(-9deg); } 94% { transform: rotate(9deg); } 97% { transform: rotate(-5deg); } }

        .onbot-idle { display: inline-block; animation: onbot-float 3.2s ease-in-out infinite; }
        .onbot-fab-btn:hover .onbot-idle { animation: onbot-wiggle 0.6s ease-in-out; }
        .onbot-av .onbot-eyes { transform-box: fill-box; transform-origin: center; animation: onbot-blink 4.2s infinite; }
        .onbot-av.talking { animation: onbot-bob 0.5s ease-in-out infinite; transform-origin: 24px 38px; }
        .onbot-av.talking .onbot-mouth { animation: onbot-talkmouth 0.32s ease-in-out infinite; }
        .onbot-pop { animation: onbot-pop .28s ease-out; }
        .onbot-rise { animation: onbot-rise .35s ease-out both; }
        .onbot-answer { animation: onbot-pop .3s ease-out; }
        .onbot-bubble { animation: onbot-bubble-in .35s cubic-bezier(.34,1.56,.64,1) both; cursor: pointer; }
        .onbot-card:hover .onbot-cardicon { transform: scale(1.25) rotate(-8deg); transition: transform .2s cubic-bezier(.34,1.56,.64,1); display: inline-block; }
        .onbot-cardicon { transition: transform .2s; display: inline-block; }

        .onbot-typing span { width: 7px; height: 7px; border-radius: 999px; background: currentColor; display: inline-block; animation: onbot-dot 1.1s infinite; }
        .onbot-typing span:nth-child(2) { animation-delay: .15s; }
        .onbot-typing span:nth-child(3) { animation-delay: .3s; }

        .onbot-sparks { position: absolute; inset: 0; display: grid; place-items: center; }
        .onbot-sparks span { position: absolute; font-size: 13px; animation: onbot-spark .9s ease-out forwards; }

        @media (prefers-reduced-motion: reduce) {
          .onbot-idle, .onbot-av, .onbot-av.talking, .onbot-av .onbot-eyes, .onbot-pop, .onbot-rise, .onbot-answer, .onbot-bubble, .onbot-sparks span, .onbot-typing span, .onbot-av.talking .onbot-mouth { animation: none !important; }
        }
      `}</style>
    </>
  );
}
