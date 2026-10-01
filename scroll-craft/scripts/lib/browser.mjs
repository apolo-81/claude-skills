/**
 * One place that knows how to find a browser the verification tools can drive.
 *
 * Resolution order: SCROLLCRAFT_CHROME, then Chrome, Brave, Edge, Chromium in the usual
 * Windows / macOS / Linux locations, then `which`. The first existing path wins.
 *
 * Why Brave is in the list: on a Linux box with only Brave installed the tools used to
 * stop with "No installed Chrome found". Brave ships the proprietary codecs (h264), so it
 * paints the scrub clips; Playwright's bundled Chromium does NOT, and a run against it
 * "passes" while only ever showing posters. `h264Supported()` is how to tell.
 */
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const CANDIDATES = [
  // Windows
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  // macOS
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  // Linux
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/brave-browser",
  "/usr/bin/brave-browser-stable",
  "/opt/brave.com/brave/brave",
  "/usr/bin/microsoft-edge",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/snap/bin/chromium",
];

const WHICH = ["google-chrome", "google-chrome-stable", "brave-browser", "brave", "chromium", "chromium-browser", "microsoft-edge"];

export function findBrowser() {
  const env = process.env.SCROLLCRAFT_CHROME;
  if (env && fs.existsSync(env)) return env;
  const hit = CANDIDATES.find((p) => fs.existsSync(p));
  if (hit) return hit;
  for (const n of WHICH) {
    try {
      const p = execFileSync(process.platform === "win32" ? "where" : "which", [n], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).split(/\r?\n/)[0].trim();
      if (p && fs.existsSync(p)) return p;
    } catch { /* next */ }
  }
  return null;
}

/** Ask the real browser whether it can decode h264. Pass a launched Playwright browser. */
export async function h264Supported(browser) {
  const page = await browser.newPage();
  try {
    return await page.evaluate(() => {
      const v = document.createElement("video");
      return v.canPlayType('video/mp4; codecs="avc1.640028"') !== "";
    });
  } finally { await page.close(); }
}

export function requireBrowser() {
  const p = findBrowser();
  if (!p) {
    console.error("No Chromium-family browser found (Chrome, Brave, Edge or Chromium). Set SCROLLCRAFT_CHROME to its path.");
    process.exit(1);
  }
  return p;
}
