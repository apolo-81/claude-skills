# Performance

The harness ([verify.md](verify.md)) answers "does it work". This answers "is it fast to open, and no heavier than it needs to
be". A scroll site is judged by its first paint and by what a phone pays for the first scroll.

```bash
node <skill>/scripts/budget.mjs --url http://localhost:4500 --net none                  # desktop, local numbers
node <skill>/scripts/budget.mjs --url http://localhost:4500 --phone --net slow4g        # phone: 390x844, 4x CPU, 1.6 Mbps / 150 ms
```
It exits 1 on a hard failure. Run the phone profile before you call a build done.

## The budgets (edit the table in `budget.mjs` when a brief justifies more)

| Check | Desktop | Phone | Why |
|---|---|---|---|
| Bytes before the first scroll | 2.0 MB | 1.2 MB | The hero poster, the first clip, fonts, engine |
| Bytes after scrolling everything | 14 MB | 8 MB | Clips load lazily, about 3 viewports ahead |
| Largest single clip | 4.5 MB | 2.5 MB | One clip is the unit a visitor waits for |
| LCP | 2.5 s | 3.5 s | Under throttled network |
| Engine ready (`html.sc-ready`) | 2.5 s | 4.0 s | Nothing is visible before this (see the cloak) |
| CLS | 0.1 | 0.1 | |
| Render-blocking third party in `<head>` | none | none | Hard fail |
| Failed or 4xx requests | none | none | A 404 on a clip silently degrades to a poster |

The apolo-tek pilot, measured: desktop 1.21 MB before scrolling, 3.64 MB after; phone 0.40 MB before, 2.24 MB after;
LCP 0.2 s desktop, 1.0 s phone on slow 4G; CLS 0.000. A six-act page with a real clip is a small page when the clip is
cut and encoded correctly.

## Three things that have already bitten

1. **A Google Fonts `<link>` blocks first paint.** The pilot opened in **7.8 s** on a machine whose IPv6 route to Google hung,
   and the engine waits on `document.fonts.ready` before splitting headlines, so everything waited. Self-hosted: **0.2 s**.
   `node scripts/fonts.mjs --out assets/fonts --family "Space Grotesk:500,700"` downloads the Latin subset (accents and the
   inverted marks included) over IPv4 and writes a local `fonts.css`. Preload only the face used above the fold.
2. **The page jumped when the engine mounted.** Pinned acts have natural heights until the engine sets `span x 100vh`; the
   self-test fixture scored CLS **0.47**. The stylesheet now hides the body (`visibility`, not `opacity`) until `html.sc-ready`,
   with a 1.5 s escape hatch if the script never runs. Put the engine `<script>` at the end of `<body>`; do not `defer` it away
   from the cloak's assumptions.
3. **Upscaling.** A 720p master encoded to 1080p cost more than twice the bytes for no detail. `encode.sh` and
   `prep-footage.sh` cap at the source height. Do not set a larger size by hand.

## Video, all-intra, or image sequence

Measured on one 7.4 s, 1280x720 clip (the pilot's peak act):

| Encoding | Size | Scrub feel |
|---|---|---|
| H.264, GOP 16 | 2.0 MB | acceptable on desktop, soft on a flick |
| **H.264, GOP 8 (default)** | **2.3 MB** | good; the engine's lerp, deadband and seek coalescing cover the rest |
| H.264, GOP 4 | 2.8 MB | the phone default (`-m` clips) |
| H.264, all-intra (GOP 1) | 5.8 MB | smoothest seeking; 2.5x the bytes |
| WebP sequence, 12 fps, 1280 wide, q75 | 2.8 MB (89 files) | deterministic, no decoder, no iOS priming; 89 requests |
| WebP sequence, 8 fps, 960 wide, q70 | 1.3 MB (59 files) | lightest; each frame covers ~0.12 s, so slow scrubs look stepped |

How to choose:
- **Default to video at GOP 8.** Seeking walks from the previous keyframe, so a sparse GOP plays well and scrubs like mud;
  GOP 8 is the knee of the curve.
- **All-intra** (`SCROLLCRAFT_GOP=1` or `prep-footage.sh --allintra`) when a single hero clip must feel perfect and its length is
  short. Not for several clips.
- **Image sequence** ([recipes.md §5](recipes.md#5-image-sequence-instead-of-a-video)) when a clip is short and iOS video priming
  or Low Power Mode is the risk (on this clip a 12 fps sequence costs about the same bytes as the video, in 89 requests), or when the same frames serve as the reduced-motion story. Published comparisons agree: for
  scrubbing, pre-computed frames beat `currentTime` seeking and client-side frame extraction whenever their download is not much
  larger than the video, at the cost of more bandwidth. WebCodecs is the fastest path but Chromium-only, so it is not a baseline.
- Cap canvas pixel density at 1.5 to 2: three times the pixels on a 3x phone is invisible on moving footage.

Sources: [Ghosh, "Playing with video scrubbing animations on the web"](https://www.ghosh.dev/posts/playing-with-video-scrubbing-animations-on-the-web/),
[diffusionstudio/webcodecs-scroll-sync](https://github.com/diffusionstudio/webcodecs-scroll-sync).

## What the lab numbers do not say

`budget.mjs` throttles the network and CPU but runs in headless desktop Chromium. It cannot reproduce an iPhone's decoder, Low
Power Mode, thermal throttling, or a real carrier. Treat a pass as "no known problem", and still open the page on a phone.
