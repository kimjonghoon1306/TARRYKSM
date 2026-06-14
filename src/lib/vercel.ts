// Vercel Domains API — 커스텀 도메인을 프로젝트에 자동 등록.
// 토큰은 서버 전용 env(VERCEL_API_TOKEN). 프로젝트 ID는 비밀 아님 → 코드 상수.
const PROJECT_ID = "prj_LNeuxO2ApSCiAKZDSeByHiuZuxlP"; // tarryksm

export type DomainResult =
  | { ok: true; verified: boolean }
  | { ok: false; error: string };

// 프로젝트에 도메인 추가 (이미 있으면 성공 처리)
export async function addDomainToVercel(domain: string): Promise<DomainResult> {
  const token = process.env.VERCEL_API_TOKEN;
  if (!token) return { ok: false, error: "no-token" }; // 토큰 없으면 수동 등록 폴백

  try {
    const res = await fetch(
      `https://api.vercel.com/v10/projects/${PROJECT_ID}/domains`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: domain }),
      }
    );
    const data = await res.json();

    if (res.ok) {
      return { ok: true, verified: !!data.verified };
    }
    // 이미 등록된 도메인 → 성공으로 간주
    const code = data?.error?.code;
    if (code === "domain_already_in_use" || code === "domain_already_exists") {
      return { ok: true, verified: true };
    }
    return { ok: false, error: data?.error?.message || "vercel-error" };
  } catch {
    return { ok: false, error: "network" };
  }
}

// 프로젝트에서 도메인 제거 (도메인 연결 해제 시)
export async function removeDomainFromVercel(domain: string): Promise<void> {
  const token = process.env.VERCEL_API_TOKEN;
  if (!token) return;
  try {
    await fetch(
      `https://api.vercel.com/v9/projects/${PROJECT_ID}/domains/${encodeURIComponent(domain)}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
    );
  } catch {
    /* 무시 */
  }
}
