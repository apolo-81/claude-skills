#!/usr/bin/env node
/**
 * Self-host Google Fonts. Never ship a render-blocking <link> to fonts.googleapis.com.
 *
 *   node scripts/fonts.mjs --out assets/fonts \
 *        --family "Space Grotesk:500,700" --family "IBM Plex Sans:400,500" --family "IBM Plex Mono:500,600" \
 *        [--subset latin] [--css fonts.css]
 *
 * Writes the woff2 files and a fonts.css with local @font-face rules, and prints the <link> tags to paste.
 *
 * Why this exists. The apolo-tek pilot opened in 7.8 s on a machine whose route to Google over IPv6 hung:
 * the stylesheet <link> blocks first paint, and the engine waits on document.fonts.ready before it splits
 * headlines, so everything waited. Self-hosted, the same page loaded in 0.2 s. It also removes a third-party
 * request (privacy, one less point of failure). This script forces IPv4 for the download for the same reason.
 *
 * `latin` covers Spanish (accents, n with tilde, inverted marks). Use `--subset latin,latin-ext` for Polish,
 * Czech and friends. Variable fonts come back as one file for several weights; the script dedupes by URL.
 */
import fs from "node:fs";
import path from "node:path";
import https from "node:https";

const argv = process.argv.slice(2);
const all = (n) => argv.flatMap((a, i) => (a === n && argv[i + 1] ? [argv[i + 1]] : []));
const one = (n, d) => all(n)[0] ?? d;
const OUT = path.resolve(one("--out", "assets/fonts"));
const SUBSETS = new Set(one("--subset", "latin").split(",").map((s) => s.trim()));
const CSSNAME = one("--css", "fonts.css");
const families = all("--family");
if (!families.length) {
  console.error('Usage: fonts.mjs --out assets/fonts --family "Space Grotesk:500,700" [--family ...]');
  process.exit(1);
}

const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const get = (url, binary = false) => new Promise((resolve, reject) => {
  https.get(url, { family: 4, headers: { "User-Agent": UA }, timeout: 30000 }, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) return resolve(get(res.headers.location, binary));
    if (res.statusCode !== 200) return reject(new Error(`${res.statusCode} ${url}`));
    const chunks = [];
    res.on("data", (c) => chunks.push(c));
    res.on("end", () => resolve(binary ? Buffer.concat(chunks) : Buffer.concat(chunks).toString("utf8")));
  }).on("error", reject).on("timeout", function () { this.destroy(new Error("timeout " + url)); });
});

const q = families.map((f) => {
  const [name, weights = "400"] = f.split(":");
  return `family=${name.trim().replace(/ /g, "+")}:wght@${weights.split(",").map((w) => w.trim()).sort().join(";")}`;
}).join("&");
const cssUrl = `https://fonts.googleapis.com/css2?${q}&display=swap`;

fs.mkdirSync(OUT, { recursive: true });
const css = await get(cssUrl);
const blocks = [...css.matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*(@font-face\s*\{[^}]*\})/g)];
if (!blocks.length) { console.error("Google returned no @font-face blocks. Check the family names."); process.exit(1); }

const byUrl = new Map();   // url -> filename
const rules = [];
for (const [, subset, body] of blocks) {
  if (!SUBSETS.has(subset)) continue;
  const fam = body.match(/font-family:\s*'([^']+)'/)[1];
  const weight = body.match(/font-weight:\s*([^;]+);/)[1].trim();
  const style = (body.match(/font-style:\s*([^;]+);/) || [, "normal"])[1].trim();
  const url = body.match(/url\((https[^)]+)\)/)[1];
  const range = (body.match(/unicode-range:\s*([^;]+);/) || [, ""])[1];
  if (!byUrl.has(url)) {
    const fn = `${fam.replace(/ /g, "")}-${subset}-${weight.replace(/ /g, "-")}.woff2`;
    fs.writeFileSync(path.join(OUT, fn), await get(url, true));
    byUrl.set(url, fn);
  }
  rules.push(`@font-face { font-family: '${fam}'; font-style: ${style}; font-weight: ${weight}; font-display: swap; src: url('${byUrl.get(url)}') format('woff2');${range ? ` unicode-range: ${range};` : ""} }`);
}
fs.writeFileSync(path.join(OUT, CSSNAME), rules.join("\n") + "\n");

let total = 0;
for (const fn of byUrl.values()) total += fs.statSync(path.join(OUT, fn)).size;
console.log(`${rules.length} @font-face rule(s), ${byUrl.size} file(s), ${(total / 1024).toFixed(0)} KB -> ${OUT}`);
const rel = path.relative(process.cwd(), OUT).split(path.sep).join("/");
const first = [...byUrl.values()][0];
console.log(`\nPaste in <head> (preload only the face used above the fold):\n` +
  `<link rel="preload" href="${rel}/${first}" as="font" type="font/woff2" crossorigin>\n` +
  `<link rel="stylesheet" href="${rel}/${CSSNAME}">`);
