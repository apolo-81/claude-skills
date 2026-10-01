# Recipes

Patterns the device kit does not cover, each one **built and exercised in a real page** unless marked otherwise. They are
starting points for a signature move or a supporting detail, not parts to bolt on: a recipe copied unchanged is the
template trap again (see [uniqueness.md §3](uniqueness.md)). The self-test (`node tests/run.mjs`) covers the ones marked **T**.

| Recipe | Use it when | Status |
|---|---|---|
| [1. Anchored callouts](#1-anchored-callouts) | A clip contains identifiable things (parts, places, regions) | **T**, shipped in the apolo-tek pilot |
| [2. Phone band](#2-phone-band-a-169-clip-on-a-portrait-screen) | Any 16:9 clip, on a phone | pilot, verified at 390x844 and 360x640 |
| [3. Footage you already have](#3-footage-you-already-have) | The client has video; no generation budget | **T** (`prep-footage.sh`) |
| [4. In-page motion switch](#4-in-page-motion-switch) | Always, on a premium page | **T** |
| [5. Image sequence](#5-image-sequence-instead-of-a-video) | A clip must scrub with zero seek lag, or on Safari | **T** |
| [6. SVG line that draws itself](#6-svg-line-that-draws-itself) | A route, a circuit, a signature, an outline | **T** |
| [7. Trace rail](#7-trace-rail) | The page is a journey; the record of it is the ending | **T** |
| [8. Native CSS scroll timelines](#8-native-css-scroll-timelines-progressive-enhancement) | Simple reveals that should cost no JS | reference, **not** in the self-test |

---

## 1. Anchored callouts

Labels that stay attached to a part of a scrubbed clip while the camera moves. This was the signature move of the
apolo-tek pilot (a laptop that opens into layers and names its own parts). The module is `engine/scrollcraft-anchors.js`;
it reads `video.currentTime` and never touches the engine.

```html
<div data-sc-stage id="stage">
  <img class="sc-stage__poster" id="poster" src="assets/02-poster.webp" alt="">
  <video id="clip" data-sc-scrub data-sc-src="assets/02.mp4" data-sc-src-mobile="assets/02-m.mp4" muted playsinline></video>
  <div class="callouts" id="layer">
    <svg id="lines" aria-hidden="true"></svg>
    <div class="callout" data-id="fan"><h3>Fan</h3><p>Real, selectable copy.</p></div>
  </div>
</div>
<script src="scrollcraft.js"></script><script src="scrollcraft-anchors.js"></script>
<script>
ScrollCraft.mount(document.body);
ScrollCraftAnchors.mount({
  stage: '#stage', video: '#clip', poster: '#poster', layer: '#layer', svg: '#lines',
  size: [1280, 720],            // the SOURCE frame, not the encode
  clipStart: 4.4,               // master time of this clip's first frame
  staticAt: 8.0, posterStatic: 'assets/02-poster-static.webp',   // reduced motion: one frame where every label is visible
  pos: { small: [0.42, 0.5], large: [0.5, 0.5] },                // object-position per breakpoint
  parts: { fan: { on: [6.5, 6.9, 11.0, 11.5],                    // fade in t0..t1, fade out t2..t3 (master time)
                  kf: [[6.0, .66, .57], [7.5, .60, .55]] } }     // [time, x, y] in 0..1 of the source frame
});
</script>
```

**Do not guess the keyframes.** Positions jump whenever the camera pulls back or the scene changes scale. Generate a
marker sheet from the real frames, look at it, fix, repeat:

```bash
node <skill>/scripts/anchors-sheet.mjs --video master.mp4 --anchors anchors.json \
     --times 6,6.5,7,7.5,8.2,9,9.8,10.5,11.2 --out lab/anchors.png
```

In the pilot the first guesses put the keyboard marker on the motherboard between t=6 and t=7, and two passes with the
sheet fixed it. Add times where the camera does something fast.

Rules that kept it honest:
- **Caption what it is.** A generic render is not a diagnosis; the pilot says "Modelo ilustrativo" on the frame.
- **Labels are real HTML** with an opaque plate (`background: #0b0c0e`), so contrast is deterministic and the harness can grade them.
- **Slots, not positions.** Labels sit in fixed slots (left/right columns on desktop, a 2x2 grid on a phone); only the guide
  line and dot travel. A label that chases its part is unreadable.
- The module publishes `data-sc-verify-state` on the layer, so the harness knows the stage is changing.
- One signature move means one use. A second page with the same laptop and the same labels is the template trap.

## 2. Phone band: a 16:9 clip on a portrait screen

Full-bleed `object-fit: cover` of a 16:9 clip on a 390x844 phone shows about **25%** of its width. The pilot's laptop
was reduced to a corner of its screen and the headline failed contrast (1.44:1) over it. Mount the clip as a feathered
band on the page ground and put the copy below, on plain canvas:

```css
@media (max-width: 860px) {
  [data-sc-stage] > video[data-sc-scrub], [data-sc-stage] > .sc-stage__poster {
    inset: auto !important; left: 0 !important; right: 0 !important; width: 100% !important;
    top: 12svh !important; height: 52svh !important; object-fit: cover;
    -webkit-mask-image: linear-gradient(to bottom, transparent, #000 16%, #000 84%, transparent);
            mask-image: linear-gradient(to bottom, transparent, #000 16%, #000 84%, transparent); }
}
@media (max-width: 860px) and (max-height: 700px) {            /* 360x640 and shorter */
  [data-sc-stage] > video[data-sc-scrub], [data-sc-stage] > .sc-stage__poster { top: 9svh !important; height: 38svh !important; }
}
```
`!important` is needed because the engine positions the stage media with its own rules. Set `object-position` to follow the
subject (the anchors module does it for you). Check **both** 390x844 and 360x640; shorter phones need a smaller band.
Do not stack a class like `.fear { height: 100% }` on a stage: it overrides the engine's `100svh` and the sticky stage becomes
the whole section (found in the pilot: the pinned copy was 1350px below the fold).

## 3. Footage you already have

Often the best asset is already on the client's site. The pilot reused an 11.8 s teardown clip from the site's own hero:
no generation, no key, no spend.

```bash
bash <skill>/scripts/prep-footage.sh master.mp4 --cuts 0,4.4,11.8 --out assets
#  act 01: master 0s -> 4.4s    800K 01.mp4   phone 452K   poster 20K
#  act 02: master 4.4s -> 11.8s 2.4M 02.mp4   phone 1.3M    poster 16K
```
Cut where the camera does something decisive; each interval is one beat of the feeling curve. The script never upscales
(a 720p master stays 720p), strips audio, and makes each poster the interval's own first frame.

## 4. In-page motion switch

`prefers-reduced-motion` only helps people who set it. WCAG 2.3.3 (Animation from Interactions) asks for a way to turn
non-essential motion off **from the page**. The engine honours `?motion=off`, `localStorage['sc-motion']='off'` and
`<html data-sc-motion="off">`, with the same CSS floor as the media query (rails become scroll regions, wipes settle, clips
are never fetched).

```html
<button type="button" id="motion-toggle"></button>
<script>
(function () {
  var b = document.getElementById('motion-toggle'), off = ScrollCraft.forcedOff, os = matchMedia('(prefers-reduced-motion: reduce)').matches;
  b.textContent = os ? 'Movimiento reducido por tu sistema' : off ? 'Activar movimiento' : 'Reducir movimiento';
  b.setAttribute('aria-pressed', String(off || os)); if (os) b.disabled = true;
  b.addEventListener('click', function () { ScrollCraft.setMotion(off); });   // saves the choice and reloads
})();
</script>
```
Put it in the footer or the bar, 44px tall, with a visible focus ring. `?motion=off` is also the quickest way to test the
reduced path without touching OS settings.

## 5. Image sequence instead of a video

The engine's `data-sc-sequence` scrubs frames on a canvas: deterministic, no seek lag, no decoder state, works wherever
`<canvas>` does. It trades bytes for smoothness.

```html
<section data-sc-act="pin" data-sc-span="3"><div data-sc-stage>
  <canvas data-sc-sequence="assets/seq/f{ii}.webp:24:1"></canvas>   <!-- template : count : first index -->
</div></section>
```
```bash
# NB: -f image2 is required. Without it ffmpeg picks the ANIMATED webp muxer from the .webp extension and
# writes one file instead of a numbered set.
ffmpeg -i master.mp4 -vf "fps=12,scale=1280:-2" -f image2 -c:v libwebp -quality 75 assets/seq/f%03d.webp   # use {iii}
```
The engine sizes the canvas to the box at up to 2x DPR, loads frames only when the act is within ~3 viewports, and publishes
the painted frame as `data-sc-verify-state="seq:N"`. Choose video or sequence with [performance.md](performance.md).

## 6. SVG line that draws itself

The act's progress is already a CSS variable (`--sc-p`, 0 to 1, on the act element), so a stroke can draw with no script
beyond measuring the path once. Give `--len` a unit: a unitless number inside `calc()` does not resolve for `stroke-dashoffset`.

```css
.draw path { fill: none; stroke: var(--sc-accent); stroke-width: 3; stroke-linecap: round;
  stroke-dasharray: var(--len); stroke-dashoffset: calc(var(--len) * (1 - var(--sc-p, 0))); }
```
```js
var route = document.getElementById('route');
route.closest('.draw').style.setProperty('--len', Math.ceil(route.getTotalLength()) + 'px');
```
Use it for something that is genuinely a line: a delivery route, a circuit, a skyline outline. Keep the stroke `aria-hidden`
and put the meaning in real text. Under reduced motion it still draws (it is opacity-free and position-free); set the final state
explicitly if the brief wants it static.

## 7. Trace rail

A thin fixed rail at the bottom edge: one marker per act, stamped as the visitor passes it, doubling as navigation. By the
footer it is the complete record of the journey.

```html
<nav class="trace" id="trace" aria-label="Progreso de la página"><div class="trace__fill" id="fill"></div></nav>
```
```css
.trace{position:fixed;left:0;right:0;bottom:0;height:14px;z-index:60;background:#17181c}
.trace__fill{position:absolute;inset:0;transform-origin:left;transform:scaleX(0);background:var(--sc-accent)}
.trace a{position:absolute;top:0;bottom:0;width:14px;margin-left:-7px;opacity:.55}
.trace a::after{content:"";position:absolute;left:6px;top:0;bottom:0;width:2px;background:#f4f2ef}
.trace a.on{opacity:1}
```
```js
var rail = document.getElementById('trace'), fill = document.getElementById('fill');
var acts = [].slice.call(document.querySelectorAll('[data-sc-act]'));
var marks = acts.map(function (a, i) { var m = document.createElement('a'); m.href = '#' + a.id;
  m.setAttribute('aria-label', 'Ir al acto ' + (i + 1)); rail.appendChild(m); return { el: m, act: a }; });
function span() { return Math.max(1, document.documentElement.scrollHeight - innerHeight); }
function place() { var s = span(); marks.forEach(function (m) { m.p = (m.act.getBoundingClientRect().top + scrollY) / s; m.el.style.left = m.p * 100 + '%'; }); }
function tick() { var p = Math.min(1, scrollY / span()); fill.style.transform = 'scaleX(' + p.toFixed(4) + ')';
  marks.forEach(function (m) { m.el.classList.toggle('on', p >= m.p - 0.001); }); requestAnimationFrame(tick); }
place(); addEventListener('resize', place); addEventListener('load', place); requestAnimationFrame(tick);
```
Give every act an `id`. Ensure the rail does not cover a bottom-anchored CTA or footer line (14px plus the safe-area inset on phones).

## 8. Native CSS scroll timelines (progressive enhancement)

For a plain fade or slide-in that needs no choreography, the platform can do it with no JS and off the main thread:

```css
@supports (animation-timeline: view()) {
  @media not (prefers-reduced-motion: reduce) {
    .rise { animation: rise linear both; animation-timeline: view(); animation-range: entry 0% cover 30%; }
    @keyframes rise { from { opacity: 0; translate: 0 2rem; } to { opacity: 1; translate: 0 0; } }
  }
}
```
`animation` must be declared **before** `animation-timeline`. Support as of mid-2026: Chrome/Edge since 115, Safari since 26,
Firefox still behind a flag in stable (about 84% global), so the unsupported failure mode is "no animation", never a broken page; keep
the content visible by default. Do not put a native timeline and an engine `data-sc-in`/cue on the same element. Native timelines
cannot drive a video's `currentTime`, pin a stage, or report to the harness, so they replace only the simplest `flow` reveals.
Not covered by the self-test: verify any use in a browser that supports it and in one that does not.

Sources: [WebKit, a guide to scroll-driven animations](https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/).
