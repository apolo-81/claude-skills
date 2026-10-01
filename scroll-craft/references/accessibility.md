# Accessibility

A scroll-driven page moves a lot of the visual field, which is exactly the kind of motion that makes some visitors ill.
Premium does not excuse that; it raises the bar. The floor, in the order a build should satisfy it.

## 1. Motion

- **`prefers-reduced-motion`**: honoured by the engine. Clips are never fetched (the poster is the picture), translation is
  dropped, wipes settle, rails become native scroll regions, pointer devices go inert. Cues still fade, so the page stays
  comprehensible. Verify with `shoot.mjs --reduced-motion`.
- **An in-page switch** ([recipes.md §4](recipes.md#4-in-page-motion-switch)). WCAG 2.3.3 (Animation from Interactions, AAA)
  asks that interaction-triggered motion can be disabled; the OS setting only reaches people who found it. Test it with `?motion=off`.
- **Large, full-field, differential motion is the risky kind** (parallax planes moving at different rates, a scrubbed clip filling
  the screen). Small motion (a progress bar, a fade) is not. When in doubt, ship the large motion only with the switch present.
- Never start audio. Never autoplay a loop with no way to stop it (WCAG 2.2.2). Scrub clips are muted and have no track.

## 2. The reduced path is a whole page

Reduced motion must keep **meaning and reachability**, not just avoid crashing:
- Every rail item reachable (the engine hands the rail back as a scrollable region; confirm on the sheet).
- Every label and callout visible on a static frame (set `staticAt` for the anchors module).
- No content deleted rather than stilled. A pinned act whose copy appears only through motion needs a static layout.

## 3. Keyboard and focus

- Tab order matches visual order; the focus ring is visible against **every** ground the control crosses (`outline: 2px solid`
  the accent, `outline-offset: 3px`).
- **A focusable control inside a faded cue is a trap.** The engine centres a focused element whose cue is under 0.85, but it
  cannot fix a pinned act (the stage is `sticky`, so the control holds one viewport position). On a pinned act, park the act at
  the progress where the control's cue is open, in page code. Assert it.
- Targets are at least 44px tall. The verify script in the apolo-tek pilot checks this on a phone.
- Skip link or `main` landmark for pages with a fixed bar. Real `<h1>` once; headings in order.

## 4. Contrast

Measured on the composited page by `shoot.mjs` (not on the source video): body 4.5:1, large text 3:1, controls and focus 3:1.
Put a **sibling** scrim under copy, never a `::before` on the copy block (the harness hides the copy and its pseudo-elements and
grades the raw film). Text with an opaque plate of its own is graded against that plate, which is the most reliable way to
guarantee legibility over bright footage.

## 5. Language and content

- `lang` on `<html>` matches the copy (`es-MX` for a Mexican audience). Spanish needs the Latin subset of a font, not only ASCII.
- Text is real markup, never baked into an image, so it is selectable, translatable and readable by assistive tech.
- A decorative SVG, canvas or callout line is `aria-hidden`; the meaning lives in text.
- No invented numbers, quotes or credentials. A generic illustration is captioned as one.

Sources: [W3C, Understanding SC 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html),
[WebKit, scroll-driven animations (reduced-motion guidance)](https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/),
[A List Apart, accessibility for vestibular disorders](https://alistapart.com/article/accessibility-for-vestibular/).
