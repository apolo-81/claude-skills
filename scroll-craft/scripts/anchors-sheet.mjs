#!/usr/bin/env node
/**
 * Verify anchor keyframes against the REAL frames, before you believe them.
 *
 *   node scripts/anchors-sheet.mjs --video master.mp4 --anchors anchors.json \
 *        --times 6,6.5,7,7.5,8.2,9,9.8,10.5,11.2 --out lab/anchors.png [--cols 3] [--w 640]
 *
 * anchors.json is the `parts` object you pass to ScrollCraftAnchors.mount:
 *   { "fan": { "kf": [[6.0, .66, .57], [7.5, .60, .55]] }, "keyboard": { "kf": [[6.0,.49,.41]] } }
 *
 * For each time it grabs the frame, interpolates every part exactly the way the page does, draws a coloured
 * marker, and tiles the result into one sheet. LOOK AT IT. In the apolo-tek pilot the first set of guessed
 * keyframes put the keyboard marker on the motherboard between t=6 and t=7 (the scale changes there), and
 * nothing but this sheet showed it. Add times where the camera does something fast: a pull-back, a cut, a zoom.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf(n); return i > -1 && argv[i + 1] ? argv[i + 1] : d; };
const VIDEO = arg("--video"), ANCH = arg("--anchors"), OUT = path.resolve(arg("--out", "anchors.png"));
const TIMES = (arg("--times", "") || "").split(",").map(Number).filter((n) => !isNaN(n) && n >= 0);
const COLS = parseInt(arg("--cols", "3"), 10), W = parseInt(arg("--w", "640"), 10);
if (!VIDEO || !ANCH || !TIMES.length) { console.error("Usage: anchors-sheet.mjs --video v.mp4 --anchors a.json --times 6,7,8 --out sheet.png"); process.exit(1); }

const FF = process.env.SCROLLCRAFT_FFMPEG || "ffmpeg";
const parts = JSON.parse(fs.readFileSync(ANCH, "utf8"));
const probe = execFileSync(FF.replace(/ffmpeg(\.exe)?$/, "ffprobe$1"), ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", VIDEO], { encoding: "utf8" }).trim().split(",").map(Number);
const H = Math.round((W * probe[1]) / probe[0]);
const COLORS = ["red", "lime", "cyan", "yellow", "magenta", "orange", "white", "blue"];
const interp = (kf, t) => {
  if (t <= kf[0][0]) return [kf[0][1], kf[0][2]];
  for (let i = 1; i < kf.length; i++) if (t <= kf[i][0]) { const a = kf[i - 1], b = kf[i], u = (t - a[0]) / (b[0] - a[0]); return [a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u]; }
  const l = kf[kf.length - 1]; return [l[1], l[2]];
};
let font = "";
try { font = execFileSync("fc-match", ["-f", "%{file}", "sans"], { encoding: "utf8" }); } catch { /* no label, fine */ }

const tmp = fs.mkdtempSync(path.join(path.dirname(OUT), ".anchors-"));
const files = TIMES.map((t, i) => {
  let vf = `scale=${W}:${H}`;
  Object.entries(parts).forEach(([id, p], k) => {
    // a part is only drawn inside its visible window when `on` is given
    if (p.on && (t < p.on[0] || t > p.on[3])) return;
    const [x, y] = interp(p.kf, t);
    vf += `,drawbox=x=${Math.round(x * W) - 5}:y=${Math.round(y * H) - 5}:w=10:h=10:color=${COLORS[k % COLORS.length]}:t=fill`;
  });
  if (font) vf += `,drawtext=fontfile=${font}:text='t=${t}':x=6:y=6:fontsize=20:fontcolor=white:box=1:boxcolor=black@0.6`;
  const f = path.join(tmp, `a${i}.png`);
  execFileSync(FF, ["-y", "-hide_banner", "-loglevel", "error", "-ss", String(t), "-i", VIDEO, "-frames:v", "1", "-vf", vf, f]);
  return f;
});
const rows = Math.ceil(files.length / COLS);
const layout = files.map((_, i) => `${(i % COLS) * W}_${Math.floor(i / COLS) * H}`).join("|");
if (files.length === 1) fs.copyFileSync(files[0], OUT);
else execFileSync(FF, ["-y", "-hide_banner", "-loglevel", "error", ...files.flatMap((f) => ["-i", f]), "-filter_complex", `xstack=inputs=${files.length}:layout=${layout}`, OUT]);
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`${OUT}  (${files.length} frames, ${Object.keys(parts).length} parts: ${Object.keys(parts).map((k, i) => k + "=" + COLORS[i % COLORS.length]).join(" ")})`);
