---
name: web-animations
description: >
  Implementa animaciones, transiciones y efectos de movimiento en apps web (React/Next.js).
  Usar cuando: "animación", "transición", "Framer Motion", "micro-interacción",
  "skeleton loading", "scroll animation", "page transition", "drag", "swipe",
  "spinner", "fade in", "GSAP", "prefers-reduced-motion", "motion design".
---

# Web Animations

## FIRST PRINCIPLE: prefers-reduced-motion

Non-negotiable. Every animation must have a reduced-motion fallback.

**Framer Motion:** `useReducedMotion()` — set `duration: 0` or remove movement.
**CSS:** `@media (prefers-reduced-motion: reduce)` — disable or instant.

```tsx
const reduce = useReducedMotion();
<motion.div
  initial={{ opacity: reduce ? 1 : 0, y: reduce ? 0 : 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: reduce ? 0 : 0.4 }}
/>
```

### Reduced-Motion Fallback Map

| Pattern | Reduced Fallback |
|---------|-----------------|
| Hover scale/shadow | Keep color change, remove transform |
| Spinner/pulse | Static "Loading..." text or `aria-busy` |
| Skeleton shimmer | Static gray placeholder |
| Entrance fade/slide | Show immediately (`opacity: 1; transform: none`) |
| Exit animation | Remove instantly |
| Page transition | Instant swap (`duration: 0`) |
| Scroll reveal | Content visible by default |
| Drag/swipe | Keep functional, disable visual effects |
| Layout animation | Instant reflow |
| Animated counter | Show final number immediately |
| Parallax | Static positioning |

---

## Accessibility

- `aria-live="polite"` on containers with dynamic animated content (toasts, counters)
- `aria-busy={isLoading}` on skeleton/spinner containers
- Keyboard fallbacks on all draggable/interactive animated elements
- `aria-expanded` on accordion triggers

Ver `references/accessibility-code.md` para complete ARIA patterns, TypeScript types, error boundary, and ESLint config.

---

## Decision Tree

```
What are you animating?
|
+-- Hover / focus / active?         -> CSS transition
+-- Looping (spinner, pulse)?       -> CSS @keyframes
+-- Page/route transition?          -> View Transitions API (fallback: AnimatePresence)
+-- Tied to scroll?                 -> CSS animation-timeline: scroll()/view()
+-- React mount/unmount?            -> Framer Motion AnimatePresence
+-- Layout shift (reorder, resize)? -> Framer Motion layout prop (FLIP)
+-- Gesture (drag, swipe)?          -> Framer Motion drag
+-- Orchestrated sequence (5+)?     -> GSAP timeline
+-- Imperative/programmatic?        -> WAAPI or useAnimation
```

### Quick-Resolution Table

| Situation | Solution |
|-----------|----------|
| CSS `:hover`, `:focus`, `:active` | CSS transition |
| `@keyframes` loop (spinner, shimmer) | CSS @keyframes |
| React `useState` toggle mount/unmount | AnimatePresence |
| `<ul>` items enter one by one | variants + staggerChildren |
| SPA route change | View Transitions API |
| `window.scrollY` percentage tied | `animation-timeline: scroll()` |
| Element enters viewport once | `animation-timeline: view()` |
| User drags a card | `motion.div drag="x"` |
| Reorder list / accordion expand | `layout` prop + AnimatePresence |
| Same element on two routes | `layoutId` shared element |
| Complex 5-step narrative intro | GSAP `timeline()` |
| No library, imperative | `element.animate()` (WAAPI) |

---

## Anti-Patterns

| Anti-pattern | Fix | Impact |
|-------------|-----|--------|
| Animate `width`, `height`, `top`, `left` | Use `transform: translate/scale` | Layout reflow every frame |
| `will-change: transform` on all elements | Apply only before animation, remove after | GPU memory exhaustion |
| Exit without `AnimatePresence` | Wrap in `<AnimatePresence>` | Exit never plays |
| `transition: all` | List specific properties | Unintended animations |
| JS `onScroll` + `style.X` | `animation-timeline: scroll()` | Main thread blocked |
| `animation-duration > 700ms` for UI | Keep 150-400ms | Feels sluggish |
| `linear` easing for UI | `ease-out` entrance, `ease-in` exit | Feels mechanical |
| No `prefers-reduced-motion` fallback | Always provide | Accessibility violation |
| `background-color` keyframe animation | Animate `opacity` of overlay | Paint every frame |
| WAAPI `fill: "forwards"` no cleanup | `anim.cancel()` on finish/unmount | Memory leak |
| Animating LCP element from `opacity: 0` | `visibility: hidden` or delay | Delays LCP metric |
| Missing `aria-live` on animated content | Add `aria-live="polite"` | Screen readers miss updates |

> See `references/animation-patterns.md` for extended anti-patterns with code examples.

---

## Core Principles — 60fps

**Animate only:** `transform` (translate, scale, rotate, skew) and `opacity`
**Never animate:** `width`, `height`, `top`, `left`, `margin`, `padding`, `font-size`
**Verify:** Chrome DevTools > Rendering > Paint Flashing. Green = repainting.

### Framer Motion vs CSS vs WAAPI

| Use Framer Motion | Use CSS | Use WAAPI |
|---|---|---|
| React mount/unmount | Hover, focus, active states | Imperative without library |
| Coordinated/staggered animations | Looping (spinners, skeletons) | JS values not tied to React state |
| Spring physics animations | Scroll-driven animations | Low-level animation utility |
| Layout FLIP calculation | View Transitions API | |
| Gesture tracking (drag, swipe) | Max performance (no JS) | |

---

## Motion Design Timing

| Context | Duration | Easing |
|---------|----------|--------|
| Micro-interaction (hover, toggle) | 150-200ms | `ease-out` |
| Entrance animation | 300-400ms | `ease-out` or `[0.25, 0.46, 0.45, 0.94]` |
| Exit animation | 200-300ms | `ease-in` |
| Page transition | 300-500ms | `ease-in-out` |
| Scroll-linked | Tied to scroll | `linear` |
| Spring (snappy) | Auto | `{ type: "spring", stiffness: 700, damping: 30 }` |
| Spring (smooth) | Auto | `{ type: "spring", stiffness: 200, damping: 30 }` |

Never exceed 700ms for UI animations.

## Easing Tokens

```css
:root {
  --ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-in: cubic-bezier(0.55, 0.085, 0.68, 0.53);
  --ease-in-out: cubic-bezier(0.645, 0.045, 0.355, 1);
  --ease-snappy: cubic-bezier(0.2, 0, 0, 1);
}
```

---

## Quick-Start Cheatsheet

**CSS hover:** `.card { transition: transform 150ms ease-out; } .card:hover { transform: scale(1.03); }`

**Fade-in on mount:**
```tsx
<motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }} />
```

**AnimatePresence exit:**
```tsx
<AnimatePresence>
  {visible && <motion.div exit={{ opacity: 0, y: -8 }}>...</motion.div>}
</AnimatePresence>
```

**CSS spinner:**
```css
@keyframes spin { to { transform: rotate(360deg); } }
.spinner { width: 24px; height: 24px; border: 3px solid currentColor;
  border-top-color: transparent; border-radius: 50%;
  animation: spin 0.7s linear infinite; }
```

**Scroll progress:** `animation: grow linear both; animation-timeline: scroll(root);`

**staggerChildren:**
```tsx
const list = { visible: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };
<motion.ul variants={list} initial="hidden" animate="visible">
  {items.map(i => <motion.li key={i} variants={item} />)}
</motion.ul>
```

**layoutId tab indicator:**
```tsx
{tabs.map(t => (
  <button key={t} onClick={() => setActive(t)}>
    {t}
    {active === t && <motion.div layoutId="tab-indicator" className="indicator" />}
  </button>
))}
```

---

## Install

```bash
npm install framer-motion    # React/Next.js
npm install gsap             # Optional: complex multi-step timelines only
```

CSS animations, View Transitions API, and scroll-driven animations require no installation.

---

## Reference Files

| Need | File |
|------|------|
| Hover/spinner/skeleton | [css-animations.md](references/css-animations.md) |
| Page transition | [css-animations.md](references/css-animations.md) (View Transitions) or [framer-motion.md](references/framer-motion.md) |
| React list/modal/dropdown animation | [framer-motion.md](references/framer-motion.md) (AnimatePresence) |
| Scroll reveal without JS | [css-animations.md](references/css-animations.md) (scroll-driven) |
| Drag, swipe, gesture | [framer-motion.md](references/framer-motion.md) |
| Complete copy-paste pattern | [animation-patterns.md](references/animation-patterns.md) |
| Tab indicator/accordion/sidebar | [animation-patterns.md](references/animation-patterns.md) |
| ARIA, types, error boundary, ESLint | [accessibility-code.md](references/accessibility-code.md) |
| Decision tree (standalone) | [decision-tree.md](references/decision-tree.md) |
| Production examples | [examples.md](references/examples.md) |
