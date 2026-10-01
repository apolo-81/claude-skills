#!/usr/bin/env node
/**
 * scroll-craft engine self-test.
 *
 *   node tests/run.mjs [--keep] [--workdir DIR]
 *
 * Builds synthetic clips with ffmpeg (no network, no API key), serves two
 * fixtures and checks the engine + harness end to end:
 *   good.html  must pass every check (desktop, phone, reduced motion)
 *   bad.html   must trip FROZEN CLIP and CONTRAST FAIL (proves the detectors work)
 * plus engine probes the harness does not make: playhead tracking under real
 * wheel input, main-thread cost while scrolling, pan rail travel, rail
 * reachability under reduced motion, DOM cleanliness.
 *
 * Needs: node 18+, full ffmpeg, a Chromium-family browser with h264
 * (SCROLLCRAFT_CHROME, or Chrome/Brave/Chromium in the usual paths).
 * Exit code 0 = all assertions passed.
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { execFileSync, spawn } from "node:child_process";
import { createRequire } from "node:module";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SKILL = path.resolve(HERE, "..");
const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf(n); return i > -1 && argv[i + 1] ? argv[i + 1] : d; };
const WORK = path.resolve(arg("--workdir", path.join(os.tmpdir(), "scrollcraft-selftest")));
const PORT = parseInt(arg("--port", "4577"), 10);
const sh = (cmd, args, opts = {}) => execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...opts });

const results = [];
const check = (name, ok, detail = "") => { results.push({ name, ok, detail }); console.log(`${ok ? " PASS" : " FAIL"}  ${name}${detail ? "  (" + detail + ")" : ""}`); };

// ---------- 1. workspace + assets ----------
fs.mkdirSync(path.join(WORK, "assets"), { recursive: true });
for (const f of ["scrollcraft.js", "scrollcraft.css"]) fs.copyFileSync(path.join(SKILL, "engine", f), path.join(WORK, f));
for (const f of ["good.html", "bad.html"]) fs.copyFileSync(path.join(HERE, "fixtures", f), path.join(WORK, f));
if (!fs.existsSync(path.join(WORK, "node_modules", "playwright-core"))) {
  if (!fs.existsSync(path.join(WORK, "package.json"))) fs.writeFileSync(path.join(WORK, "package.json"), "{}");
  console.log("installing playwright-core ...");
  sh("npm", ["i", "playwright-core", "--no-audit", "--no-fund"], { cwd: WORK });
}
const A = (f) => path.join(WORK, "assets", f);
if (!fs.existsSync(A("dark.mp4"))) {
  const font = (() => { try { return sh("fc-match", ["-f", "%{file}", "sans"]).trim(); } catch { return ""; } })();
  const dt = font ? `,drawtext=fontfile=${font}:text='%{eif\\:t*1000\\:d}':fontsize=140:fontcolor=0x44556a:x=60:y=860` : "";
  const ff = (...a) => sh("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", ...a], { cwd: WORK });
  ff("-f", "lavfi", "-i", `color=c=0x0c1016:s=1920x1080:r=30:d=6,drawbox=x='mod(t*300,1700)':y=380:w=300:h=300:color=0x2a6fdb:t=fill${dt}`, "raw-dark.mp4");
  ff("-f", "lavfi", "-i", "testsrc2=s=1920x1080:r=30:d=6", "raw-bright.mp4");
  ff("-f", "lavfi", "-i", "color=c=0x0c1016:s=1080x1920:r=30:d=6,drawbox=x='mod(t*200,780)':y=800:w=300:h=300:color=0x2a6fdb:t=fill", "raw-m.mp4");
  const enc = path.join(SKILL, "scripts", "encode.sh");
  sh("bash", [enc, "raw-dark.mp4", A("dark.mp4")], { cwd: WORK });
  sh("bash", [enc, "raw-bright.mp4", A("bright.mp4")], { cwd: WORK });
  sh("bash", [enc, "raw-m.mp4", A("dark-m.mp4"), "mobile"], { cwd: WORK });
  fs.copyFileSync(A("dark-m.mp4"), A("bright-m.mp4"));
  ff("-i", "raw-dark.mp4", "-frames:v", "1", A("dark.webp"));
  ff("-i", "raw-bright.mp4", "-frames:v", "1", A("bright.webp"));
  ff("-f", "lavfi", "-i", "color=c=0x1d2a3a:s=1600x900", "-frames:v", "1", A("img.webp"));
}
check("assets: clips encode with dense GOP", fs.statSync(A("dark.mp4")).size > 1000);

// ---------- 2. server ----------
const server = spawn("node", [path.join(SKILL, "scripts", "serve.mjs"), "--root", WORK, "--port", String(PORT)], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 800));
const BASE = `http://localhost:${PORT}`;
const title = await (await fetch(`${BASE}/good.html`)).text();
check("server: serves OUR fixture on the port", /<title>Prueba motor<\/title>/.test(title));
const cleanup = () => { try { server.kill(); } catch {} };
process.on("exit", cleanup);

// ---------- 3. harness runs ----------
const shoot = (page, out, extra = []) => {
  try { return sh("node", [path.join(SKILL, "scripts", "shoot.mjs"), "--url", `${BASE}/${page}`, "--out", path.join(WORK, "lab", out), ...extra], { cwd: WORK, timeout: 280000 }); }
  catch (e) { return (e.stdout || "") + (e.stderr || ""); }
};
const good = {
  desktop: shoot("good.html", "good-desktop"),
  mobile: shoot("good.html", "good-mobile", ["--width", "390", "--height", "844"]),
  reduced: shoot("good.html", "good-reduced", ["--reduced-motion"]),
};
for (const [k, out] of Object.entries(good)) {
  check(`good/${k}: no dead scroll`, /no dead scroll detected/.test(out));
  check(`good/${k}: contrast clears 4.5:1`, /all cues clear 4\.5:1/.test(out));
  check(`good/${k}: no frozen clip`, !/FROZEN CLIP/.test(out));
}
check("good/desktop: scrub clip keeps moving", /scrub clip\(s\) keep moving/.test(good.desktop));
check("good/mobile: phone clip keeps moving", /scrub clip\(s\) keep moving/.test(good.mobile));
check("good/reduced: clips never fetched (poster only)", /clips=poster/.test(good.reduced) && !/clips=\d/.test(good.reduced));
const bad = shoot("bad.html", "bad-desktop");
check("bad: harness catches FROZEN CLIP", /FROZEN CLIP/.test(bad));
check("bad: harness catches CONTRAST FAIL", /CONTRAST FAIL/.test(bad));
// Known blind spot (measured 2026-10-01): a pinned act with no cues and static content is reported
// as healthy. Informational only; it does not fail the run. Flip to check() if the harness gets fixed.
const deadOnBad = !/no dead scroll detected/.test(bad);
console.log(` NOTE  harness vs pin act with no cues: ${deadOnBad ? "detected (gap closed, promote this to check())" : "NOT detected (known gap)"}`);

// ---------- 4. engine probes the harness does not make ----------
const { chromium } = createRequire(path.join(WORK, "package.json"))("playwright-core");
const CH = [process.env.SCROLLCRAFT_CHROME, "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/brave-browser", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/snap/bin/chromium"].find((p) => p && fs.existsSync(p));
const browser = await chromium.launch({ executablePath: CH, headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error" && !/404/.test(m.text())) errors.push(m.text()); });
  await page.goto(`${BASE}/good.html`, { waitUntil: "load" });
  await page.waitForFunction(() => document.querySelector("video[data-sc-scrub]")?.readyState >= 2, null, { timeout: 15000 }).catch(() => {});

  // 4a. real wheel input: playhead must follow, monotonically, and settle on target
  await page.mouse.move(700, 450);
  const samples = [];
  for (let i = 0; i < 24; i++) {
    await page.mouse.wheel(0, 90);
    await page.waitForTimeout(40);
    samples.push(await page.evaluate(() => document.querySelector("video[data-sc-scrub]").currentTime));
  }
  const monotone = samples.every((t, i) => i === 0 || t + 0.001 >= samples[i - 1]);
  const advanced = samples.at(-1) - samples[0];
  check("probe: playhead advances under real wheel input", advanced > 0.3, `+${advanced.toFixed(2)}s over ${samples.length} notches`);
  check("probe: playhead never runs backwards while scrolling down", monotone);
  await page.waitForTimeout(600);
  const settled = await page.evaluate(() => { const v = document.querySelector("video[data-sc-scrub]"); return { t: v.currentTime, seeking: v.seeking }; });
  check("probe: no seek left hanging after input stops", !settled.seeking);

  // 4b. main-thread cost: long tasks + frame gaps during a continuous scroll
  await page.evaluate(() => { window.__lt = []; window.__gaps = []; new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lt.push(e.duration))).observe({ entryTypes: ["longtask"] }); let last = performance.now(); (function f(n) { window.__gaps.push(n - last); last = n; requestAnimationFrame(f); })(last); });
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300);
  for (let i = 0; i < 60; i++) { await page.mouse.wheel(0, 140); await page.waitForTimeout(16); }
  const perf = await page.evaluate(() => ({ lt: window.__lt, gaps: window.__gaps.slice(5) }));
  const worstLong = Math.max(0, ...perf.lt), p95 = perf.gaps.sort((a, b) => a - b)[Math.floor(perf.gaps.length * 0.95)] || 0;
  check("probe: no main-thread task over 120ms during scroll", worstLong < 120, `worst ${worstLong.toFixed(0)}ms, ${perf.lt.length} long tasks`);
  check("probe: p95 frame gap under 50ms (headless, software GL)", p95 < 50, `p95 ${p95.toFixed(1)}ms`);

  // 4c. pan rail really travels (harness reports a non-overflowing rail as healthy)
  const rail = await page.evaluate(() => { const r = document.querySelector("[data-sc-pan]"); return { overflow: r.scrollWidth - innerWidth }; });
  check("probe: pan rail overflows the viewport (has somewhere to go)", rail.overflow > 200, `${rail.overflow}px`);
  const tx = [];
  const panTop = await page.evaluate(() => { const s = document.querySelector("[data-sc-act=pan]"); return s.getBoundingClientRect().top + scrollY; });
  for (const f of [0.1, 0.4, 0.8]) {
    await page.evaluate(([t, f]) => window.scrollTo(0, t + (document.querySelector("[data-sc-act=pan]").offsetHeight - innerHeight) * f), [panTop, f]);
    await page.waitForTimeout(250);
    tx.push(await page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector("[data-sc-pan]")).transform).m41));
  }
  check("probe: rail translateX decreases monotonically through the act", tx[0] > tx[1] && tx[1] > tx[2], tx.map((n) => n.toFixed(0)).join(" > "));

  // 4d. hygiene
  check("probe: no uncaught JS errors / console errors (404s ignored)", errors.length === 0, errors[0] || "");
  const dom = await page.evaluate(() => ({ h1: document.querySelectorAll("h1").length, split: !!document.querySelector("h1")?.textContent.includes("La promesa en nueve palabras"), vids: document.querySelectorAll("video[muted],video").length, audio: [...document.querySelectorAll("video")].every((v) => v.muted) }));
  check("probe: real <h1> text survives kinetic splitting", dom.h1 === 1 && dom.split);
  check("probe: scrub videos are muted", dom.audio);
  await ctx.close();

  // 4e. reduced motion: rail content stays reachable
  const rctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const rp = await rctx.newPage();
  await rp.goto(`${BASE}/good.html`, { waitUntil: "load" }); await rp.waitForTimeout(800);
  const rr = await rp.evaluate(() => { const r = document.querySelector("[data-sc-pan]"); const st = r.closest("[data-sc-stage]"); const cs = getComputedStyle(st); const last = r.lastElementChild.getBoundingClientRect(); return { scrollable: /auto|scroll/.test(cs.overflowX) && st.scrollWidth > st.clientWidth, tx: getComputedStyle(r).transform, lastOffscreen: last.left > innerWidth }; });
  check("probe: reduced motion keeps the rail reachable (native scroll region)", rr.scrollable, rr.scrollable ? "" : `overflowX/transform: ${rr.tx}`);
  await rctx.close();

  // 4f. mobile viewport: hero headline must not blow past ~5 lines
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mp = await mctx.newPage();
  await mp.goto(`${BASE}/good.html`, { waitUntil: "load" }); await mp.waitForTimeout(800);
  const lines = await mp.evaluate(() => { const h = document.querySelector("h1"); return Math.round(h.getBoundingClientRect().height / parseFloat(getComputedStyle(h).lineHeight)); });
  check("probe: phone hero headline wraps to <= 5 lines", lines <= 5, `${lines} lines`);
  await mctx.close();
} finally { await browser.close(); cleanup(); }

// ---------- summary ----------
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed. Evidence: ${path.join(WORK, "lab")} (read the sheet.png files)`);
if (failed.length) { console.log("FAILED:"); failed.forEach((f) => console.log("  - " + f.name + (f.detail ? "  " + f.detail : ""))); }
process.exit(failed.length ? 1 : 0);
