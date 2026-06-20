// 택배사별 배송 조회 URL 생성 (무한분양)
// 송장의 택배사명 + 운송장번호로 조회 페이지 링크를 만든다.

const TRACK: Record<string, (no: string) => string> = {
  "CJ대한통운": (no) => `https://trace.cjlogistics.com/next/tracking.html?wblNo=${no}`,
  "우체국택배": (no) => `https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm?sid1=${no}`,
  "한진택배": (no) => `https://www.hanjin.com/kor/CMS/DeliveryMgr/WaybillResult.do?mCode=MN038&schLang=KR&wblnumText2=${no}`,
  "롯데택배": (no) => `https://www.lotteglogis.com/home/reservation/tracking/linkView?InvNo=${no}`,
  "로젠택배": (no) => `https://www.ilogen.com/web/personal/trace/${no}`,
};

// 통합 조회(택배사 모를 때/기타) — 스마트택배 등 범용 검색 폴백
const UNIVERSAL = (no: string) => `https://search.naver.com/search.naver?query=${encodeURIComponent("택배조회 " + no)}`;

// 조회 가능 여부 (택배사+번호 둘 다 있고 '직접배송' 아님)
export function canTrack(courier?: string | null, no?: string | null): boolean {
  return !!(courier && no && courier.trim() && no.trim() && courier !== "직접배송");
}

// 조회 URL — 알려진 택배사면 전용, 아니면 네이버 통합검색 폴백
export function trackingUrl(courier?: string | null, no?: string | null): string | null {
  if (!canTrack(courier, no)) return null;
  const c = (courier as string).trim();
  const n = (no as string).trim().replace(/[^0-9a-zA-Z]/g, "");
  const fn = TRACK[c];
  return fn ? fn(n) : UNIVERSAL(n);
}
