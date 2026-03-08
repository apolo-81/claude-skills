---
name: web-animations
description: Use when implementing animations, transitions, or any motion effect in a web app. Trigger on: "animaciones web", "transitions", "micro-interactions", "hover effects", "page transitions", "scroll animations", "loading animations", "CSS animations", "Framer Motion", "motion design", "animated UI", "entrance animations", "skeleton loading", "exit animations", "fade in", "slide up", "parallax", "staggered list", "spinner", "animated counter", "drag", "swipe", "gesture", "layout animation", "reorderable", "accordion animation", "sidebar animation", "tab indicator", "view transitions", "scroll-driven", "prefers-reduced-motion", "60fps", "performance animation", "GSAP", "WAAPI". Activate even without an explicit slash command — if a UI element needs motion, use this skill.
---

# Web Animations

## FIRST PRINCIPLE: prefers-reduced-motion

Before implementing any animation, always provide a fallback for users with vestibular disorders or motion sensitivity. This is non-negotiable and must be applied to every animation.

**Framer Motion (automatic):**
```tsx
// Framer Motion respects prefers-reduced-motion by default.
// Customize the reduced version with useReducedMotion:
import { useReducedMotion } from "framer-motion";

function Component() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.4 }}
    />
  );
}
```

**CSS (manual):**
```css
/* Per-element — preferred */
@media (prefers-reduced-motion: no-preference) {
  .reveal { animation: slide-up 0.4s ease-out both; }
}

/* Global nuclear option */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Decision Tree

Use this tree to pick the right technology before writing any code.

```
What are you animating?
│
├── Hover / focus / active state?
│   └── CSS transition  ← zero JS, GPU-composited, simplest
│
├── Looping effect (spinner, pulse, shimmer)?
│   └── CSS @keyframes  ← declarative, no runtime cost
│
├── Page or route transition?
│   └── View Transitions API  ← native browser, shared elements, Next.js support
│       └── Fallback: Framer Motion AnimatePresence + PageWrapper
│
├── Tied to scroll position?
│   └── CSS scroll-driven animations (animation-timeline)  ← compositor thread, 60fps
│       └── Fallback: Framer Motion useInView (once: true)
│
├── React component mount / unmount?
│   └── Framer Motion + AnimatePresence  ← only reliable unmount animation in React
│
├── Layout shift (reorder, resize, expand)?
│   └── Framer Motion layout prop (FLIP)  ← automatic, no position math needed
│
├── Gesture (drag, swipe, pinch)?
│   └── Framer Motion drag gestures  ← physics-based, touch-optimized
│
├── Complex orchestrated sequence?
│   └── Framer Motion variants + staggerChildren  ← declarative orchestration
│       └── Alternative: GSAP timeline (for very complex multi-step sequences)
│
└── Imperative / programmatic animation?
    └── Web Animations API (WAAPI) or Framer Motion useAnimation
```

---

## Quick Reference Table

| Scenario | Technology | File |
|----------|-----------|------|
| Hover scale, shadow | CSS `transition` | [css-animations.md](references/css-animations.md) |
| Spinner, shimmer, pulse | CSS `@keyframes` | [css-animations.md](references/css-animations.md) |
| Fade-in, slide-up on mount | Framer Motion `motion.div` | [framer-motion.md](references/framer-motion.md) |
| Exit / dismiss animation | Framer Motion `AnimatePresence` | [framer-motion.md](references/framer-motion.md) |
| Layout shift (reorder, resize) | Framer Motion `layout` prop | [framer-motion.md](references/framer-motion.md) |
| Page/route transition | View Transitions API | [css-animations.md](references/css-animations.md) |
| Shared element hero transition | View Transitions API | [css-animations.md](references/css-animations.md) |
| Scroll reveal | CSS `animation-timeline: view()` | [css-animations.md](references/css-animations.md) |
| Scroll progress bar | CSS `animation-timeline: scroll()` | [css-animations.md](references/css-animations.md) |
| Drag, swipe to dismiss | Framer Motion `drag` | [framer-motion.md](references/framer-motion.md) |
| Staggered list / grid | Framer Motion `staggerChildren` | [framer-motion.md](references/framer-motion.md) |
| Animated counter | Framer Motion `useMotionValue` | [framer-motion.md](references/framer-motion.md) |
| Tab indicator, toggle | Framer Motion `layoutId` | [animation-patterns.md](references/animation-patterns.md) |
| Parallax section | CSS scroll-driven or `useScroll` | [animation-patterns.md](references/animation-patterns.md) |
| Text word-by-word reveal | Framer Motion variants | [animation-patterns.md](references/animation-patterns.md) |

---

## Core Principles

### 60fps Target

Achieve 60fps by only animating GPU-composited properties:

- **Animate**: `transform` (translate, scale, rotate, skew) and `opacity`
- **Never animate**: `width`, `height`, `top`, `left`, `margin`, `padding`, `font-size`
- **Avoid if possible**: `background-color`, `box-shadow`, `border-color` (trigger paint, not layout — acceptable for short durations)

To verify: open Chrome DevTools > Rendering > Paint Flashing. Green overlays = repainting. Animated elements should show minimal or no green.

### Why Framer Motion vs CSS

**Use Framer Motion when:**
- React component mounts or unmounts (CSS cannot animate unmount — the element is removed before the animation ends)
- Multiple elements need coordinated/staggered animations (variants system)
- Physics-based spring animations are needed (natural feel for interactive elements)
- Layout changes need automatic FLIP calculation
- Gesture tracking (drag, swipe) is required

**Use CSS when:**
- Hover, focus, or active state changes (purely declarative, no JS needed)
- Looping animations (spinners, skeletons) — no React lifecycle involved
- Scroll-driven animations (compositor thread, no JS at all)
- Page transitions via View Transitions API
- Maximum performance is critical (no JS overhead)

**Use Web Animations API (WAAPI) when:**
- You need imperative control without a library (no Framer Motion installed)
- Animating from JS values not tied to React state
- Building a low-level animation utility or hook

```js
// WAAPI example — imperative, no library
element.animate(
  [{ transform: "translateY(20px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }],
  { duration: 400, easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)", fill: "forwards" }
);
```

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

**Never exceed 700ms for UI animations.** Users perceive it as sluggish. For loading states, loops are acceptable.

---

## Easing Tokens

Define once, use everywhere:

```css
:root {
  --ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94);   /* entrances */
  --ease-in: cubic-bezier(0.55, 0.085, 0.68, 0.53);    /* exits */
  --ease-in-out: cubic-bezier(0.645, 0.045, 0.355, 1); /* page transitions */
  --ease-snappy: cubic-bezier(0.2, 0, 0, 1);           /* UI interactions */
}
```

---

## Install

```bash
# Framer Motion (React / Next.js)
npm install framer-motion

# GSAP (optional — only for complex multi-step timelines)
npm install gsap
```

CSS animations, View Transitions API, and scroll-driven animations require no installation.

---

## Reference Files

Read the appropriate file for implementation details and code examples:

- **[references/framer-motion.md](references/framer-motion.md)** — variants, AnimatePresence, layout prop, gestures, useMotionValue, useAnimation, SVG animations, text animations, spring configs, common mistakes
- **[references/css-animations.md](references/css-animations.md)** — transitions, @keyframes, scroll-driven animations (animation-timeline), View Transitions API, will-change rules, browser support table
- **[references/animation-patterns.md](references/animation-patterns.md)** — complete production-ready patterns: micro-interactions, entrance/exit animations, page transitions, scroll patterns, loading states, gesture patterns, layout transitions, anti-patterns checklist

### When to read which file

- **"I need a hover effect / spinner / skeleton"** → css-animations.md
- **"I need a page transition"** → css-animations.md (View Transitions) or framer-motion.md (fallback)
- **"I need to animate a React list / modal / dropdown"** → framer-motion.md (AnimatePresence)
- **"I need scroll reveal without JS"** → css-animations.md (scroll-driven)
- **"I need drag, swipe, or gesture"** → framer-motion.md (drag section)
- **"I need a complete copy-paste pattern"** → animation-patterns.md
- **"I need a tab indicator / accordion / sidebar"** → animation-patterns.md (Layout Transitions section)
