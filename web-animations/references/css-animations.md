# CSS Animations Reference

Complete reference for CSS animations, transitions, and modern browser animation APIs. Prefer CSS over JavaScript whenever possible — CSS animations run on the compositor thread, avoiding main thread jank.

---

## Transitions

Use `transition` for state changes triggered by pseudo-classes (`:hover`, `:focus`, `:active`) or class toggling. Always specify which property to transition — avoid `transition: all`.

```css
/* Correct — specify properties */
.card {
  transition: transform 200ms ease-out, box-shadow 200ms ease-out;
}

/* Avoid — "all" causes unnecessary recalculations */
.card {
  transition: all 200ms ease-out; /* don't do this */
}
```

### Transition Properties Reference

```css
.element {
  transition-property: transform, opacity;
  transition-duration: 200ms;
  transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transition-delay: 0ms;
}

/* Shorthand */
.element {
  transition: transform 200ms ease-out, opacity 200ms ease-out;
}
```

### Hover Patterns

```css
/* Card lift with shadow */
.card {
  transition: transform 200ms ease-out, box-shadow 200ms ease-out;
}
.card:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}
.card:active {
  transform: translateY(0) scale(0.99);
  transition-duration: 100ms;
}

/* Button ripple-free press */
.btn {
  transition: background-color 150ms ease-out, transform 100ms ease-out;
}
.btn:hover { background-color: var(--color-primary-hover); }
.btn:active { transform: scale(0.97); }

/* Link underline grow */
.link {
  text-decoration: none;
  background-image: linear-gradient(currentColor, currentColor);
  background-size: 0% 1px;
  background-repeat: no-repeat;
  background-position: 0 100%;
  transition: background-size 200ms ease-out;
}
.link:hover { background-size: 100% 1px; }
```

---

## @keyframes Animations

Use `@keyframes` for looping animations, multi-step sequences, or effects that run on mount without state changes.

```css
/* Always animate transform and opacity only */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slide-down {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

/* Applying */
.element {
  animation: slide-up 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}
```

### Animation Shorthand

```css
.element {
  animation:
    name           /* @keyframes name */
    duration       /* 300ms */
    timing-function /* ease-out */
    delay          /* 0ms */
    iteration-count /* 1 or infinite */
    direction      /* normal, reverse, alternate */
    fill-mode      /* forwards, backwards, both */
    play-state;    /* running, paused */
}

/* Example */
.spinner {
  animation: spin 0.6s linear infinite;
}
```

### Loading States

```css
/* Spinner */
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid hsl(var(--muted));
  border-top-color: hsl(var(--primary));
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Skeleton shimmer */
.skeleton {
  background: linear-gradient(
    90deg,
    hsl(var(--muted)) 25%,
    hsl(var(--muted-foreground) / 0.1) 50%,
    hsl(var(--muted)) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
  border-radius: 0.375rem;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Pulse (simpler skeleton) */
.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### Typewriter

```css
.typewriter {
  overflow: hidden;
  border-right: 2px solid currentColor;
  white-space: nowrap;
  width: 0;
  animation:
    typing 2s steps(30) 0.5s forwards,
    blink 0.7s step-end infinite;
}

@keyframes typing {
  to { width: 100%; }
}

@keyframes blink {
  50% { border-color: transparent; }
}
```

---

## Easing Curves

Store these as CSS custom properties and reference them everywhere:

```css
:root {
  /* Smooth deceleration — use for entrances */
  --ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94);

  /* Smooth acceleration — use for exits */
  --ease-in: cubic-bezier(0.55, 0.085, 0.68, 0.53);

  /* Smooth in-out — use for page transitions */
  --ease-in-out: cubic-bezier(0.645, 0.045, 0.355, 1);

  /* Snappy — use for UI interactions */
  --ease-snappy: cubic-bezier(0.2, 0, 0, 1);

  /* Emphasis / bounce — use sparingly for attention */
  --ease-emphasis: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

---

## Scroll-Driven Animations (CSS)

Scroll-driven animations (Chrome 115+, Safari 18+, Firefox 129+) replace JavaScript-based scroll listeners entirely. They run on the compositor thread with zero main thread cost.

### Scroll Progress Bar

```css
.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: var(--color-primary);
  transform-origin: left;
  animation: grow-progress linear forwards;
  animation-timeline: scroll(root);   /* tied to page scroll */
}

@keyframes grow-progress {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
```

### Reveal on Scroll (View Timeline)

```css
/* Triggers when element enters the viewport */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  animation: reveal-up 0.6s var(--ease-out) forwards;
  animation-timeline: view();
  animation-range: entry 0% entry 40%;  /* start when 0% visible, end at 40% */
}

@keyframes reveal-up {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Parallax Section

```css
.parallax-bg {
  animation: parallax-shift linear forwards;
  animation-timeline: scroll();
  animation-range: cover;
}

@keyframes parallax-shift {
  from { transform: translateY(-20%); }
  to { transform: translateY(20%); }
}
```

### Animation Range Values

```css
/* entry: as element enters the scroller */
animation-range: entry 0% entry 100%;

/* exit: as element leaves the scroller */
animation-range: exit 0% exit 100%;

/* cover: entire time element covers the viewport */
animation-range: cover 0% cover 100%;

/* contain: while element is fully visible */
animation-range: contain 0% contain 100%;
```

### Sticky Header Fade (scroll-driven)

```css
header {
  animation: header-fade linear forwards;
  animation-timeline: scroll(root);
  animation-range: 0px 100px;  /* pixel range */
}

@keyframes header-fade {
  from { background: transparent; box-shadow: none; }
  to { background: hsl(var(--background) / 0.9); box-shadow: 0 1px 8px rgba(0,0,0,0.1); }
}
```

---

## View Transitions API

The View Transitions API (broadly supported in 2026: Chrome 111+, Safari 18+, Firefox 130+) enables smooth same-document transitions without JavaScript animation libraries.

### Same-Page Transitions

```javascript
// Trigger a view transition when updating state
document.startViewTransition(() => {
  // DOM update happens here
  updateDOM();
});
```

```css
/* Default crossfade — works automatically */
::view-transition-old(root) {
  animation: fade-out 300ms var(--ease-in) forwards;
}
::view-transition-new(root) {
  animation: fade-in 300ms var(--ease-out) forwards;
}

@keyframes fade-out { to { opacity: 0; } }
@keyframes fade-in { from { opacity: 0; } }
```

### Next.js App Router Integration

```tsx
// app/layout.tsx
import { ViewTransitions } from "next/view-transitions";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <ViewTransitions>
          {children}
        </ViewTransitions>
      </body>
    </html>
  );
}
```

### Shared Element Transitions

Tag matching elements on both pages with the same `view-transition-name`:

```tsx
// List page
<Link href={`/product/${id}`}>
  <img
    src={product.image}
    style={{ viewTransitionName: `product-${id}` }}
  />
</Link>

// Detail page — same name creates a "hero" transition
<img
  src={product.image}
  style={{ viewTransitionName: `product-${id}` }}
/>
```

```css
/* Customize the shared element animation */
::view-transition-group(product-*) {
  animation-duration: 400ms;
  animation-timing-function: var(--ease-in-out);
}
```

### Slide Left/Right Page Transition

```css
/* For a forward navigation */
::view-transition-old(root) {
  animation: slide-out-left 300ms var(--ease-in) forwards;
}
::view-transition-new(root) {
  animation: slide-in-right 300ms var(--ease-out) forwards;
}

@keyframes slide-out-left {
  to { transform: translateX(-30px); opacity: 0; }
}
@keyframes slide-in-right {
  from { transform: translateX(30px); opacity: 0; }
}
```

---

## will-change

`will-change` hints the browser to promote an element to its own compositor layer before animation begins, eliminating the promotion cost on the first frame.

```css
/* Correct — apply before animation, remove after */
.will-animate {
  will-change: transform, opacity;
}

/* Correct — apply on hover (browser has time to prepare) */
.card:hover {
  will-change: transform;
}

/* Remove after animation ends */
.animation-done {
  will-change: auto;
}
```

**Rules for `will-change`:**
- Only use on elements that WILL animate imminently
- Remove it after the animation completes (via JS or removing the class)
- Never apply it to a large portion of elements — each promoted layer consumes GPU memory
- Do not use it as a fix for janky animations — fix the animation property first

---

## prefers-reduced-motion

This is non-negotiable. Apply it to every CSS animation.

```css
/* Global reset — the nuclear option */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Per-element — preferred for fine control */
.reveal {
  animation: reveal-up 0.6s ease-out forwards;
  animation-timeline: view();
  animation-range: entry 0% entry 40%;
}

@media (prefers-reduced-motion: reduce) {
  .reveal {
    animation: none;
    opacity: 1;
    transform: none;
  }
}

/* Using prefers-reduced-motion: no-preference (opt-in pattern) */
@media (prefers-reduced-motion: no-preference) {
  .hero {
    animation: slide-up 0.8s ease-out both;
  }
}
```

---

## CSS Custom Properties for Animation

Use CSS variables to create a design system for animation tokens. This enables theme-level animation control (e.g., disabling all animations globally).

```css
:root {
  --duration-fast: 150ms;
  --duration-base: 250ms;
  --duration-slow: 400ms;
  --duration-page: 500ms;

  --ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-in: cubic-bezier(0.55, 0.085, 0.68, 0.53);
  --ease-in-out: cubic-bezier(0.645, 0.045, 0.355, 1);

  --transition-default: var(--duration-base) var(--ease-out);
  --transition-fast: var(--duration-fast) var(--ease-out);
}

/* Usage */
.button {
  transition: background-color var(--transition-fast),
              transform var(--transition-fast);
}

/* Disable all animations globally */
.reduce-motion {
  --duration-fast: 0ms;
  --duration-base: 0ms;
  --duration-slow: 0ms;
}
```

---

## Performance Rules

1. **Only animate `transform` and `opacity`** — these are GPU-composited, everything else triggers layout/paint recalculations on every frame.

2. **Properties that trigger layout (never animate)**: `width`, `height`, `top`, `left`, `right`, `bottom`, `margin`, `padding`, `font-size`, `line-height`

3. **Properties that trigger paint (avoid animating)**: `background-color`, `color`, `box-shadow`, `border-color` — use `opacity` tricks instead where possible

4. **Use CSS scroll-driven animations instead of JS scroll handlers** — JS `onScroll` blocks the main thread and caps at ~30fps; CSS `animation-timeline` runs at 60fps on the compositor

5. **Check Paint Flashing**: Chrome DevTools > Rendering > Paint Flashing — green overlays show what's being repainted each frame

6. **Check Compositor Layers**: Chrome DevTools > Layers panel — too many layers = GPU memory pressure

---

## Browser Support Summary (2026)

| Feature | Chrome | Firefox | Safari | Notes |
|---------|--------|---------|--------|-------|
| CSS Transitions | All | All | All | Universally supported |
| @keyframes | All | All | All | Universally supported |
| Scroll-driven animations | 115+ | 129+ | 18+ | Use IntersectionObserver as fallback |
| View Transitions (same-doc) | 111+ | 130+ | 18+ | Broadly available, safe to use |
| View Transitions (cross-doc) | 126+ | Partial | 18+ | Needs `@view-transition` rule |
| animation-timeline: scroll() | 115+ | 129+ | 18+ | Same as scroll-driven |
| animation-timeline: view() | 115+ | 129+ | 18+ | Same as scroll-driven |

---

## GSAP (Complex Multi-Step Timelines)

Use GSAP only when Framer Motion is insufficient — very complex multi-step sequences, precise timing control, or SVG morphing.

```bash
npm install gsap
```

### Core Timeline Pattern

```js
import { gsap } from "gsap";

// Create a timeline — animations run in sequence by default
const tl = gsap.timeline({ defaults: { ease: "power2.out", duration: 0.4 } });

tl.from(".hero-title", { opacity: 0, y: 40 })
  .from(".hero-subtitle", { opacity: 0, y: 20 }, "-=0.2")   // overlap 0.2s
  .from(".hero-cta", { opacity: 0, scale: 0.9 }, "-=0.1")
  .from(".hero-image", { opacity: 0, x: 60 }, "<");          // same time as previous
```

### fromTo (explicit start → end state)

```js
gsap.fromTo(
  ".card",
  { opacity: 0, scale: 0.8, rotateY: -15 },
  { opacity: 1, scale: 1, rotateY: 0, duration: 0.5, ease: "back.out(1.7)" }
);
```

### Stagger (multiple elements)

```js
gsap.from(".list-item", {
  opacity: 0,
  y: 30,
  stagger: 0.08,         // 80ms between each item
  duration: 0.4,
  ease: "power2.out",
  clearProps: "all",     // clean up inline styles after animation
});
```

### ScrollTrigger (scroll-linked, GSAP plugin)

```js
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

gsap.from(".section", {
  opacity: 0,
  y: 60,
  scrollTrigger: {
    trigger: ".section",
    start: "top 80%",   // when top of element is 80% from top of viewport
    end: "top 30%",
    scrub: true,         // ties animation to scroll position
  },
});
```

### prefers-reduced-motion with GSAP

```js
// Check once and disable all GSAP animations
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (prefersReducedMotion) {
  gsap.globalTimeline.timeScale(0); // pause all
}

// Or per-animation
if (!prefersReducedMotion) {
  gsap.from(".hero", { opacity: 0, y: 40, duration: 0.6 });
}
```

### When to use GSAP vs Framer Motion

| Need | Use |
|------|-----|
| Multi-step narrative sequences (5+ elements, precise timing) | GSAP timeline |
| SVG path morphing, DrawSVG, MotionPath | GSAP plugins |
| Scroll-linked scrubbing with fine control | GSAP ScrollTrigger |
| React component mount/unmount | Framer Motion (GSAP can't animate unmount) |
| Physics/spring animations | Framer Motion |
| Simple entrance/exit | Framer Motion or CSS |

---

## Advanced Performance Patterns

### CSS `contain` Property

Use `contain` to limit browser reflow scope:

```css
/* Isolate animated sections from the rest of the layout */
.animated-card {
  contain: layout paint;  /* changes inside don't affect outside */
}

/* For absolutely positioned animated overlays */
.toast-container {
  contain: layout;
}
```

### LCP / CLS Impact of Animations

- **LCP risk**: Animating the largest contentful element (hero image, H1) delays LCP. Avoid `opacity: 0` initial state on LCP elements — use `visibility: hidden` briefly or delay animation until after LCP fires.
- **CLS risk**: Avoid animating elements in the document flow via `height`, `margin`, `padding`. Use `transform` only. Absolutely-positioned or fixed elements never cause CLS.

```tsx
// ❌ WRONG — hero image starts invisible, delays LCP
<motion.img src="/hero.jpg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />

// ✅ CORRECT — load image visible, then animate a decorative overlay
<img src="/hero.jpg" />  {/* LCP fires immediately */}
<motion.div className="hero-overlay" initial={{ opacity: 1 }} animate={{ opacity: 0 }} />
```

### Memory Leak Prevention

```tsx
// Cancel animations on unmount to prevent memory leaks
function useAnimationCleanup(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const el = ref.current;
    return () => {
      // Cancel all WAAPI animations on the element
      el?.getAnimations().forEach((a) => a.cancel());
    };
  }, [ref]);
}
```

---

## Container Queries + Animation (2025+)

Animate based on **container size** rather than viewport — essential for reusable components that live in multiple layout contexts.

```css
/* 1. Define a containment context */
.card-wrapper {
  container-type: inline-size;
  container-name: card;
}

/* 2. Animate differently based on container width */
@container card (min-width: 400px) {
  .card-icon {
    transition: transform 0.3s ease-out;
  }
  .card-icon:hover {
    transform: scale(1.2) rotate(5deg);
  }
}

@container card (max-width: 399px) {
  /* Compact: simpler animation to avoid visual noise */
  .card-icon {
    transition: opacity 0.2s ease;
  }
  .card-icon:hover { opacity: 0.7; }
}
```

### Container Query + @keyframes Skeleton Shimmer

```css
@container (min-width: 600px) {
  @keyframes shimmer-wide {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  .skeleton { animation: shimmer-wide 1.5s infinite linear; }
}
@container (max-width: 599px) {
  @keyframes shimmer-narrow {
    0%   { background-position: -300px 0; }
    100% { background-position:  300px 0; }
  }
  .skeleton { animation: shimmer-narrow 1.2s infinite linear; }
}
```

**Key rules:**
- `container-type: inline-size` enables `@container` width queries (most common)
- `container-type: size` only if you need height queries (rare)
- Always pair with `prefers-reduced-motion`:

```css
@container card (min-width: 400px) {
  @media (prefers-reduced-motion: no-preference) {
    .card-icon { transition: transform 0.3s ease-out; }
    .card-icon:hover { transform: scale(1.2); }
  }
}
```

**When to use**: Component-driven responsive motion, sidebar/panel widgets, design-system card variants. Container queries decouple animation from global breakpoints.
