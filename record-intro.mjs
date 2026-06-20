// 대문 인트로(라이트, 7씬 ~40초)를 녹화해 바탕화면에 저장.
// 기존 설치된 Chrome 사용(channel: 'chrome') → chromium 다운로드 불필요.
import { chromium } from "playwright";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const URL = process.env.REC_URL || "https://on.xn--zk5biyyw.com/?v=" + Date.now(); // 캐시 회피
const OUT_DIR = path.join(os.homedir(), "Desktop");
const W = 1920, H = 1080;
const DURATION_MS = 35500; // 7씬 ~33.5초 + 여유

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "introrec-"));

const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: W, height: H },
  deviceScaleFactor: 1,
  recordVideo: { dir: tmp, size: { width: W, height: H } },
  colorScheme: "light",
});
const page = await context.newPage();
console.log("열기:", URL);
await page.goto(URL, { waitUntil: "domcontentloaded" });
// 인트로가 처음부터 재생되도록 잠깐 대기 후 그대로 녹화
await page.waitForTimeout(DURATION_MS);

await context.close(); // 녹화 종료(파일 flush)
await browser.close();

// tmp의 webm을 바탕화면으로 이동
const files = fs.readdirSync(tmp).filter((f) => f.endsWith(".webm"));
if (!files.length) { console.error("녹화 파일 없음"); process.exit(1); }
const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
const dest = path.join(OUT_DIR, `ONJONGIL-인트로-라이트-${stamp}.webm`);
fs.copyFileSync(path.join(tmp, files[0]), dest);
console.log("저장 완료:", dest);
