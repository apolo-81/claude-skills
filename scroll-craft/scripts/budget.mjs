#!/usr/bin/env node
/**
 * Performance budget for a scroll page. The visual harness (shoot.mjs) says the page WORKS; this says
 * whether it is FAST to open and not heavier than it needs to be.
 *
 *   node scripts/budget.mjs --url http://localhost:4500 [--phone] [--net slow4g|fast4g|none] [--json out.json]
 *
 * Measures, in a real Chromium-family browser with CDP network accounting (encoded bytes, not decoded):
 *   - bytes at load, and total bytes after scrolling the whole page, split by type (video / image / font / script / css)
 *   - the largest single media file
 *   - third-party origins, and which of them BLOCK RENDER (a <link rel=stylesheet> or sync <script> in <head>)
 *   - LCP, CLS, long tasks, and time until the engine reports html.sc-ready
 *
 * --net applies Lighthouse-style throttling, so the numbers mean something off localhost. --phone uses a
 * 390x844 touch viewport plus 4x CPU slowdown. The thresholds are the ones this skill holds a page to; edit
 * the table below if a brief justifies more.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { findBrowser, h264Supported } from "./lib/browser.mjs";

let chromium;
try { ({ chromium } = createRequire(path.join(process.cwd(), "package.json"))("playwright-core")); }
catch { console.error("playwright-core not found. Run `npm i playwright-core` in the build project first."); process.exit(1); }

const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf(n); return i > -1 && argv[i + 1] ? argv[i + 1] : d; };
const has = (n) => argv.includes(n);
const URL_ = arg("--url", "http://localhost:4500");
const PHONE = has("--phone");
const NET = arg("--net", "slow4g");
const NETS = { slow4g: [1.6 * 1024 * 1024 / 8, 750 * 1024 / 8, 150], fast4g: [9 * 1024 * 1024 / 8, 9 * 1024 * 1024 / 8, 40], none: null };
if (!(NET in NETS)) { console.error("--net must be one of: " + Object.keys(NETS).join(", ")); process.exit(1); }

// Budgets (bytes / ms). `load` = what the visitor pays before they scroll; `total` = after the whole page.
const B = {
  loadBytes:  PHONE ? 1.2e6 : 2.0e6,
  totalBytes: PHONE ? 8e6   : 14e6,
  clipBytes:  PHONE ? 2.5e6 : 4.5e6,
  lcp:        PHONE ? 3500  : 2500,
  ready:      PHONE ? 4000  : 2500,
  longTask:   200,
};

const browser = await chromium.launch({ executablePath: findBrowser(), headless: true });
const ctx = await browser.newContext(PHONE
  ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
  : { viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send("Network.enable");
if (NETS[NET]) {
  const [down, up, rtt] = NETS[NET];
  await cdp.send("Network.emulateNetworkConditions", { offline: false, downloadThroughput: down, uploadThroughput: up, latency: rtt });
}
if (PHONE) await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

const reqs = new Map();
cdp.on("Network.requestWillBeSent", (e) => reqs.set(e.requestId, { url: e.request.url, type: e.type, bytes: 0, t: Date.now() }));
cdp.on("Network.responseReceived", (e) => { const r = reqs.get(e.requestId); if (r) { r.mime = e.response.mimeType; r.status = e.response.status; } });
cdp.on("Network.loadingFinished", (e) => { const r = reqs.get(e.requestId); if (r) r.bytes = e.encodedDataLength; });

await page.addInitScript(() => {
  window.__m = { lcp: 0, cls: 0, long: [] };
  new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__m.lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__m.cls += e.value; }).observe({ type: "layout-shift", buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__m.long.push(e.duration); }).observe({ type: "longtask", buffered: true });
});

const t0 = Date.now();
await page.goto(URL_, { waitUntil: "load", timeout: 120000 });
const tLoad = Date.now() - t0;
await page.waitForSelector("html.sc-ready", { timeout: 120000 }).catch(() => {});
const tReady = Date.now() - t0;
await page.waitForTimeout(800);
const snap = (pred = () => true) => [...reqs.values()].filter(pred);
const sum = (a) => a.reduce((n, r) => n + (r.bytes || 0), 0);
const atLoad = sum(snap());

// third-party and render-blocking
const origin = new URL(URL_).origin;
const blocking = await page.evaluate(() => [...document.head.querySelectorAll("link[rel=stylesheet], script[src]")]
  .filter((el) => el.tagName === "LINK" || (!el.async && !el.defer && el.type !== "module"))
  .map((el) => el.href || el.src).filter((u) => u && new URL(u, location.href).origin !== location.origin));
const thirdParty = [...new Set(snap().map((r) => { try { return new URL(r.url).origin; } catch { return ""; } }).filter((o) => o && o !== origin && !o.startsWith("data:")))];

// scroll the whole page so every lazy clip is requested
const total = await page.evaluate(() => document.documentElement.scrollHeight);
const vh = await page.evaluate(() => innerHeight);
for (let y = 0; y < total; y += vh * 0.6) {
  await page.evaluate((yy) => scrollTo(0, yy), y);
  await page.waitForTimeout(NETS[NET] ? 500 : 250);
}
await page.waitForTimeout(1500);
const m = await page.evaluate(() => window.__m);
const h264 = await h264Supported(browser);
const all = snap();
const byKind = (k) => sum(all.filter((r) => k(r)));
const isVideo = (r) => /video|mp4|webm/.test(r.mime || "") || /\.(mp4|webm|mov)(\?|$)/.test(r.url);
const kinds = {
  video: byKind(isVideo),
  image: byKind((r) => !isVideo(r) && (r.type === "Image" || /^image\//.test(r.mime || ""))),
  font:  byKind((r) => r.type === "Font"),
  script: byKind((r) => r.type === "Script"),
  css:   byKind((r) => r.type === "Stylesheet"),
};
const biggest = all.filter(isVideo).sort((a, b) => b.bytes - a.bytes)[0];
// the browser asks for /favicon.ico on its own; a 404 there is noise, not a page defect
const bad = all.filter((r) => r.status >= 400 && !/\/favicon\.ico(\?|$)/.test(r.url));

const mb = (n) => (n / 1e6).toFixed(2) + " MB";
const rows = [];
const check = (name, ok, detail, hard = true) => rows.push({ name, ok, detail, hard });
check("failed or 4xx requests", bad.length === 0, bad.length ? bad.map((r) => r.status + " " + r.url).slice(0, 3).join(", ") : "none");
check("bytes before scrolling", atLoad <= B.loadBytes, `${mb(atLoad)} (budget ${mb(B.loadBytes)})`);
check("bytes after scrolling the whole page", sum(all) <= B.totalBytes, `${mb(sum(all))} (budget ${mb(B.totalBytes)})`);
check("largest single clip", !biggest || biggest.bytes <= B.clipBytes, biggest ? `${mb(biggest.bytes)} ${biggest.url.split("/").pop()} (budget ${mb(B.clipBytes)})` : "no video");
check("render-blocking third-party in <head>", blocking.length === 0, blocking.length ? blocking.join(", ") : "none. Self-host with scripts/fonts.mjs");
check("third-party origins", thirdParty.length === 0, thirdParty.join(", ") || "none", false);
check("LCP", m.lcp <= B.lcp, `${Math.round(m.lcp)} ms (budget ${B.lcp})`);
check("engine ready (html.sc-ready)", tReady <= B.ready, `${tReady} ms (budget ${B.ready})`);
check("CLS", m.cls <= 0.1, m.cls.toFixed(3));
check("no main-thread task over " + B.longTask + " ms", Math.max(0, ...m.long) <= B.longTask, `worst ${Math.round(Math.max(0, ...m.long))} ms, ${m.long.length} long task(s)`, false);
check("browser decodes h264", h264, h264 ? "yes" : "NO: clips never paint here, results are poster-only");

console.log(`\nbudget: ${URL_}  ${PHONE ? "phone, 4x CPU" : "desktop"}  net=${NET}\n`);
for (const r of rows) console.log(`  ${r.ok ? "PASS" : r.hard ? "FAIL" : "WARN"}  ${r.name}  (${r.detail})`);
console.log(`\n  by type: video ${mb(kinds.video)}, image ${mb(kinds.image)}, font ${mb(kinds.font)}, script ${mb(kinds.script)}, css ${mb(kinds.css)}`);
console.log(`  load event ${tLoad} ms`);
const fails = rows.filter((r) => !r.ok && r.hard);
console.log(fails.length ? `\n${fails.length} hard failure(s).` : "\nWithin budget.");
if (arg("--json")) fs.writeFileSync(arg("--json"), JSON.stringify({ rows, kinds, m, atLoad, total: sum(all) }, null, 2));
await browser.close();
process.exit(fails.length ? 1 : 0);
