// 이름 → URL 슬러그 (영문/숫자/하이픈, 한글은 제거되므로 빈 경우 호출측에서 폴백)
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
