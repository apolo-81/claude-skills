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
for (const f of ["scrollcraft.js", "scrollcraft.css", "scrollcraft-anchors.js"]) fs.copyFileSync(path.join(SKILL, "engine", f), path.join(WORK, f));
for (const f of ["good.html", "bad.html", "anchors.html", "seq.html", "recipes.html"]) fs.copyFileSync(path.join(HERE, "fixtures", f), path.join(WORK, f));
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
  // NB: drawbox's `t` is its thickness, not time, so a drawbox "moving square" never moves. overlay's `t` is time.
  ff("-f", "lavfi", "-i", "color=c=0x0c1016:s=1920x1080:r=30:d=6", "-f", "lavfi", "-i", "color=c=0x2a6fdb:s=300x300:r=30:d=6",
     "-filter_complex", `[0][1]overlay=x='mod(t*300,1700)':y=380${dt}`, "raw-dark.mp4");
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
if (!fs.existsSync(path.join(WORK, "assets", "seq", "f01.webp"))) {
  fs.mkdirSync(path.join(WORK, "assets", "seq"), { recursive: true });
  sh("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", "raw-dark.mp4", "-vf", "fps=4,scale=960:-1", "-f", "image2", "-c:v", "libwebp", "-quality", "75", path.join(WORK, "assets", "seq", "f%02d.webp")], { cwd: WORK });
}
check("assets: clips encode with dense GOP", fs.statSync(A("dark.mp4")).size > 1000);
const dim = sh("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", A("dark.mp4")]).trim();
check("encode.sh never upscales (1920x1080 master stays 1080p)", dim === "1920,1080", dim);

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
// A pinned act with no cues and static markup must be reported (gap closed 2026-10-01: the NEXT act's off-screen stage used to mask it).
check("bad: harness catches an empty pin act (dead scroll)", /DEAD SCROLL/.test(bad));

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
  let settled = { seeking: true };
  for (let k = 0; k < 20 && settled.seeking; k++) { await page.waitForTimeout(200); settled = await page.evaluate(() => { const v = document.querySelector("video[data-sc-scrub]"); return { t: v.currentTime, seeking: v.seeking }; }); }
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
} finally { await browser.close(); }


// ---------- 5. new in 0.4: motion override, anchors, sequence, budget, scripts ----------
const browser2 = await chromium.launch({ executablePath: CH, headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });
try {
  // 5a. in-page motion switch behaves like prefers-reduced-motion
  const mctx = await browser2.newContext({ viewport: { width: 1440, height: 900 } });
  const mp = await mctx.newPage();
  await mp.goto(`${BASE}/good.html?motion=off`, { waitUntil: "load" }); await mp.waitForTimeout(800);
  const mo = await mp.evaluate(() => { const r = document.querySelector("[data-sc-pan]"), st = r.closest("[data-sc-stage]"); return { reduce: ScrollCraft.reduce, forced: ScrollCraft.forcedOff, attr: document.documentElement.getAttribute("data-sc-motion"), ox: getComputedStyle(st).overflowX, clipFetched: ScrollCraft.instances[0].clips.some((c) => c.ready) }; });
  check("motion override: ?motion=off forces reduced mode", mo.reduce && mo.forced && mo.attr === "off");
  check("motion override: CSS mirror turns the rail into a native scroll region", /auto|scroll/.test(mo.ox), mo.ox);
  check("motion override: no clip is fetched", !mo.clipFetched);
  await mp.goto(`${BASE}/good.html`, { waitUntil: "load" }); await mp.evaluate(() => localStorage.clear()); await mp.waitForTimeout(300);
  await Promise.all([mp.waitForNavigation({ waitUntil: "load" }), mp.evaluate(() => ScrollCraft.setMotion(false))]); await mp.waitForTimeout(600);
  const persisted = await mp.evaluate(() => ({ f: ScrollCraft.forcedOff, ls: localStorage.getItem("sc-motion") }));
  await Promise.all([mp.waitForNavigation({ waitUntil: "load" }), mp.evaluate(() => ScrollCraft.setMotion(true))]); await mp.waitForTimeout(600);
  const restored = await mp.evaluate(() => ScrollCraft.forcedOff);
  check("motion override: setMotion(false) persists and setMotion(true) restores", persisted.f && persisted.ls === "off" && restored === false);
  await mctx.close();

  // 5b. anchors: the dot sits where the maths says AND on the blue square in the real frame
  const actx = await browser2.newContext({ viewport: { width: 1440, height: 900 } });
  const ap = await actx.newPage();
  const aerr = []; ap.on("pageerror", (e) => aerr.push(String(e)));
  await ap.goto(`${BASE}/anchors.html`, { waitUntil: "load" }); await ap.waitForTimeout(1200);
  const atop = await ap.evaluate(() => { const a = document.getElementById("act"); return { t: a.getBoundingClientRect().top + scrollY, h: a.offsetHeight, vh: innerHeight }; });
  const hits = [];
  for (const f of [0.35, 0.55, 0.75]) {
    await ap.evaluate(([t, f]) => scrollTo(0, t.t + (t.h - t.vh) * f), [atop, f]);
    for (let k = 0; k < 25; k++) { await ap.waitForTimeout(150); const s = await ap.evaluate(() => { const v = document.getElementById("clip"); return v.seeking; }); if (!s) break; }
    await ap.waitForTimeout(700);
    hits.push(await ap.evaluate(() => {
      const v = document.getElementById("clip"), st = document.getElementById("stage").getBoundingClientRect(), box = v.getBoundingClientRect();
      const c = document.querySelector("#lines circle");
      const t = v.currentTime, kf = [0, 1, 2, 3, 4, 5].map((s) => [s, (s * 300 + 150) / 1920, 530 / 1080]);
      const k = ScrollCraftAnchors.interp(kf, t), exp = ScrollCraftAnchors.toPx(k[0], k[1], box, st.toJSON ? st : st, [1920, 1080], [0.5, 0.5]);
      const cv = document.createElement("canvas"); cv.width = v.videoWidth; cv.height = v.videoHeight; const g = cv.getContext("2d"); g.drawImage(v, 0, 0);
      const px = g.getImageData(Math.round(k[0] * v.videoWidth) - 2, Math.round(k[1] * v.videoHeight) - 2, 5, 5).data;
      return { t, dx: +c.getAttribute("cx") - exp[0], dy: +c.getAttribute("cy") - exp[1], op: +c.style.opacity, r: px[0], g: px[1], b: px[2] };
    }));
  }
  const worst = Math.max(...hits.map((h) => Math.max(Math.abs(h.dx), Math.abs(h.dy))));
  check("anchors: dot matches the cover-fit maths to <2px at 3 scroll positions", worst < 2, `worst ${worst.toFixed(2)}px`);
  check("anchors: the dot is visible while the part is in its window", hits.every((h) => h.op > 0.9), hits.map((h) => h.op.toFixed(2)).join(" "));
  check("anchors: the keyframed point lies on the blue square in the real frame", hits.every((h) => h.b > h.r + 100 && h.b > 150), hits.map((h) => `t=${h.t.toFixed(2)} ${h.r}/${h.g}/${h.b}`).join(" | "));
  check("anchors: no JS errors", aerr.length === 0, aerr[0] || "");
  // reduced motion: static frame, label visible
  await actx.close();
  const rctx2 = await browser2.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const rp2 = await rctx2.newPage(); await rp2.goto(`${BASE}/anchors.html`, { waitUntil: "load" }); await rp2.waitForTimeout(900);
  check("anchors: with reduced motion the label is shown on the static frame", (await rp2.evaluate(() => +getComputedStyle(document.querySelector(".callout")).opacity)) > 0.9);
  await rctx2.close();

  // 5c. image sequence draws different frames at different scroll positions
  const sctx = await browser2.newContext({ viewport: { width: 1200, height: 800 } });
  const sp = await sctx.newPage(); await sp.goto(`${BASE}/seq.html`, { waitUntil: "load" }); await sp.waitForTimeout(1500);
  const stp = await sp.evaluate(() => { const a = document.querySelector("[data-sc-act]"); return { t: a.getBoundingClientRect().top + scrollY, h: a.offsetHeight, vh: innerHeight }; });
  const states = [];
  for (const f of [0.1, 0.5, 0.9]) { await sp.evaluate(([t, f]) => scrollTo(0, t.t + (t.h - t.vh) * f), [stp, f]); await sp.waitForTimeout(700); states.push(await sp.evaluate(() => document.querySelector("canvas").getAttribute("data-sc-verify-state"))); }
  check("sequence: canvas paints a different frame at 10/50/90% and reports it", new Set(states).size === 3 && states.every((x) => /^seq:\d+$/.test(x || "")), states.join(" "));
  const sheetRun = sh("node", [path.join(SKILL, "scripts", "shoot.mjs"), "--url", `${BASE}/seq.html`, "--out", path.join(WORK, "lab", "seq")], { cwd: WORK, timeout: 200000 });
  check("sequence: harness sees it move (no dead scroll)", /no dead scroll detected/.test(sheetRun));
  await sctx.close();

  // 5c2. recipes: SVG line that draws itself, trace rail
  const rctx3 = await browser2.newContext({ viewport: { width: 1440, height: 900 } });
  const rp3 = await rctx3.newPage(); const rerr = []; rp3.on("pageerror", (e) => rerr.push(String(e)));
  await rp3.goto(`${BASE}/recipes.html`, { waitUntil: "load" }); await rp3.waitForTimeout(900);
  const rpos = await rp3.evaluate(() => { const a = document.getElementById("a2"); return { t: a.getBoundingClientRect().top + scrollY, h: a.offsetHeight, vh: innerHeight, len: parseFloat(getComputedStyle(document.getElementById("route")).strokeDasharray) }; });
  const offs = [];
  for (const f of [0.02, 0.5, 0.98]) { await rp3.evaluate(([t, f]) => scrollTo(0, t.t + (t.h - t.vh) * f), [rpos, f]); await rp3.waitForTimeout(350); offs.push(await rp3.evaluate(() => parseFloat(getComputedStyle(document.getElementById("route")).strokeDashoffset))); }
  check("recipe svg-draw: dashoffset runs from ~full length to ~0 with the act", offs[0] > rpos.len * 0.9 && offs[1] > rpos.len * 0.25 && offs[1] < rpos.len * 0.75 && offs[2] < rpos.len * 0.1, `len ${Math.round(rpos.len)}: ${offs.map((o) => Math.round(o)).join(" > ")}`);
  await rp3.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await rp3.waitForTimeout(400);
  const trace = await rp3.evaluate(() => ({ n: document.querySelectorAll("#trace a").length, acts: document.querySelectorAll("[data-sc-act]").length, on: document.querySelectorAll("#trace a.on").length, fill: document.getElementById("fill").style.transform }));
  check("recipe trace-rail: one marker per act, all stamped at the end, fill complete", trace.n === trace.acts && trace.on === trace.n && /scaleX\(1/.test(trace.fill), JSON.stringify(trace));
  check("recipes: no JS errors", rerr.length === 0, rerr[0] || "");
  await rctx3.close();
} finally { await browser2.close(); }

// 5d. budget.mjs: passes a clean page, fails a render-blocking third-party stylesheet
const bud = (u, extra = []) => { try { return { code: 0, out: sh("node", [path.join(SKILL, "scripts", "budget.mjs"), "--url", u, "--net", "none", ...extra], { cwd: WORK, timeout: 200000 }) }; } catch (e) { return { code: e.status, out: (e.stdout || "") + (e.stderr || "") }; } };
const clean = bud(`${BASE}/good.html`);
check("budget.mjs: a clean page is within budget", clean.code === 0 && /Within budget/.test(clean.out), clean.code === 0 ? "" : clean.out.split("\n").filter((l) => /FAIL/.test(l)).join(" | "));
const PORT2 = PORT + 1, other = path.join(WORK, "third"); fs.mkdirSync(other, { recursive: true }); fs.writeFileSync(path.join(other, "thirdparty.css"), "body{}");
const server2 = spawn("node", [path.join(SKILL, "scripts", "serve.mjs"), "--root", other, "--port", String(PORT2)], { stdio: "ignore" }); await new Promise((r) => setTimeout(r, 700));
fs.writeFileSync(path.join(WORK, "blocking.html"), fs.readFileSync(path.join(HERE, "fixtures", "blocking.html"), "utf8").replace("__PORT2__", String(PORT2)));
const blocked = bud(`${BASE}/blocking.html`);
server2.kill();
check("budget.mjs: flags a render-blocking third-party stylesheet and exits 1", blocked.code === 1 && /render-blocking third-party in <head>/.test(blocked.out) && /FAIL  render-blocking/.test(blocked.out));

// 5e. prep-footage.sh cuts a master into acts without upscaling
const prepOut = path.join(WORK, "prep");
const prep = sh("bash", [path.join(SKILL, "scripts", "prep-footage.sh"), path.join(WORK, "raw-dark.mp4"), "--cuts", "0,2.5,6", "--out", prepOut], { cwd: WORK });
const dur = (f) => parseFloat(sh("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).trim());
check("prep-footage.sh: two acts, right durations, posters and phone variants", ["01.mp4", "01-m.mp4", "01-poster.webp", "02.mp4", "02-m.mp4", "02-poster.webp"].every((f) => fs.existsSync(path.join(prepOut, f))) && Math.abs(dur(path.join(prepOut, "01.mp4")) - 2.5) < 0.15 && Math.abs(dur(path.join(prepOut, "02.mp4")) - 3.5) < 0.15);

// 5f. browser resolver and doctor
const { findBrowser: fb } = await import(path.join(SKILL, "scripts", "lib", "browser.mjs"));
check("browser resolver finds a Chromium-family browser", Boolean(fb()), fb() || "");

cleanup();
// ---------- summary ----------
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed. Evidence: ${path.join(WORK, "lab")} (read the sheet.png files)`);
if (failed.length) { console.log("FAILED:"); failed.forEach((f) => console.log("  - " + f.name + (f.detail ? "  " + f.detail : ""))); }
process.exit(failed.length ? 1 : 0);
