# Animation Patterns Reference

Concrete, production-ready patterns organized by use case. Each pattern includes the recommended technology and the reasoning behind the choice.

---

## Micro-Interactions

Small, focused animations that confirm user actions and make the UI feel responsive. They must be fast (150-200ms) and never block interaction.

### Hover Scale + Shadow (CSS — preferred for static cards)

```css
.card {
  transition: transform 200ms ease-out, box-shadow 200ms ease-out;
}
.card:hover {
  transform: scale(1.02) translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}
.card:active {
  transform: scale(0.98);
  transition-duration: 100ms;
}
```

**Why CSS**: No bundle cost, runs on compositor thread, browser handles hover/active state natively.

### Button Press Feedback (Framer Motion — for interactive elements with JS state)

```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
>
  Submit
</motion.button>
```

**Why Framer Motion**: Spring physics feel more natural than CSS transitions for interactive elements. whileTap handles touch and mouse consistently.

### Like / Favorite Button

```tsx
function LikeButton({ isLiked, onToggle }: Props) {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.8 }}
      transition={{ type: "spring", stiffness: 600, damping: 20 }}
      aria-pressed={isLiked}
    >
      <motion.span
        animate={isLiked ? { scale: [1, 1.4, 1], rotate: [0, -15, 0] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {isLiked ? "♥" : "♡"}
      </motion.span>
    </motion.button>
  );
}
```

### Toggle Switch

```tsx
function Toggle({ isOn, onToggle }: { isOn: boolean; onToggle: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={isOn}
      onClick={onToggle}
      className={cn(
        "w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200",
        isOn ? "bg-primary" : "bg-muted"
      )}
    >
      <motion.span
        className="w-6 h-6 bg-white rounded-full shadow-sm"
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
      />
    </button>
  );
}
```

### Input Focus Ring (CSS)

```css
.input {
  outline: none;
  border: 1px solid hsl(var(--border));
  box-shadow: 0 0 0 0 hsl(var(--primary) / 0);
  transition: border-color 150ms ease-out, box-shadow 150ms ease-out;
}
.input:focus {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.15);
}
```

---

## Entrance Animations

Elements revealing themselves when they first appear. Keep under 400ms.

### Fade + Slide Up (Framer Motion)

The standard entrance. Works for cards, modals, any content block.

```tsx
const fadeSlideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
};

<motion.div {...fadeSlideUp}>
  <Card />
</motion.div>
```

### Staggered List

Use for any ordered list of items. The stagger creates a "cascade" effect that implies order and relationship.

```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

<motion.ul variants={container} initial="hidden" animate="show">
  {items.map((i) => (
    <motion.li key={i.id} variants={item}>
      {i.name}
    </motion.li>
  ))}
</motion.ul>
```

### Staggered Grid

For dashboards, card grids, image galleries:

```tsx
const gridContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const gridItem = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

<motion.div className="grid grid-cols-3 gap-4" variants={gridContainer} initial="hidden" animate="show">
  {cards.map((card) => (
    <motion.div key={card.id} variants={gridItem}>
      <Card {...card} />
    </motion.div>
  ))}
</motion.div>
```

### CSS Entrance (no React, pure CSS)

```css
/* Apply on mount via class */
.fade-in {
  animation: fade-in 400ms ease-out both;
}

.slide-up {
  animation: slide-up 400ms ease-out both;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## Exit Animations

Always pair with `AnimatePresence` in React. Exit animations communicate what happened to the dismissed element (it left, it closed, it was removed).

### Modal / Dialog Exit

```tsx
<AnimatePresence mode="wait">
  {isOpen && (
    <>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        className="fixed inset-0 bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />
      {/* Modal */}
      <motion.div
        key="modal"
        className="fixed inset-0 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <Dialog />
      </motion.div>
    </>
  )}
</AnimatePresence>
```

### Notification Toast

```tsx
<AnimatePresence>
  {toasts.map((toast) => (
    <motion.div
      key={toast.id}
      initial={{ opacity: 0, x: 100, height: 0 }}
      animate={{ opacity: 1, x: 0, height: "auto" }}
      exit={{ opacity: 0, x: 100, height: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="overflow-hidden"
    >
      <Toast {...toast} />
    </motion.div>
  ))}
</AnimatePresence>
```

### List Item Removal

The `layout` prop is critical here — it makes the remaining items smoothly fill the gap left by the removed item:

```tsx
<AnimatePresence>
  {items.map((item) => (
    <motion.li
      key={item.id}
      layout
      exit={{ opacity: 0, x: -100, transition: { duration: 0.25 } }}
      transition={{ layout: { type: "spring", stiffness: 500, damping: 35 } }}
    >
      {item.name}
    </motion.li>
  ))}
</AnimatePresence>
```

### Dropdown Menu

```tsx
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="absolute top-full mt-1 rounded-lg border bg-popover shadow-lg"
    >
      <Menu />
    </motion.div>
  )}
</AnimatePresence>
```

---

## Page Transitions

### View Transitions API (Recommended for Next.js 14+ in 2026)

```tsx
// app/layout.tsx
import { ViewTransitions } from "next/view-transitions";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <ViewTransitions>{children}</ViewTransitions>
      </body>
    </html>
  );
}
```

```css
/* Crossfade between pages */
::view-transition-old(root) { animation: vt-fade-out 300ms ease-in forwards; }
::view-transition-new(root) { animation: vt-fade-in 300ms ease-out forwards; }

@keyframes vt-fade-out { to { opacity: 0; } }
@keyframes vt-fade-in { from { opacity: 0; } }
```

**Why View Transitions over Framer Motion for pages**: Native browser API, works with any link/navigation, handles scroll position correctly, supports shared element transitions (hero images morph between pages).

### Shared Element (Hero Image) Transition

```tsx
// On list page
<img src={product.image} style={{ viewTransitionName: `product-${product.id}` }} />

// On detail page
<img src={product.image} style={{ viewTransitionName: `product-${product.id}` }} />
```

The browser automatically creates a smooth morphing animation between the two matching elements.

### Framer Motion Page Wrapper (Fallback)

Use when View Transitions API is not available or when more control is needed:

```tsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

---

## Scroll-Driven Patterns

### Reveal on Scroll

**CSS (preferred — no JS cost):**

```css
.reveal {
  opacity: 0;
  transform: translateY(30px);
  animation: reveal-up 0.6s ease-out forwards;
  animation-timeline: view();
  animation-range: entry 0% entry 40%;
}

@keyframes reveal-up {
  to { opacity: 1; transform: translateY(0); }
}
```

**Framer Motion (fallback for older browsers or React-only context):**

```tsx
function RevealOnScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}
```

### Scroll Progress Bar (CSS)

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
  animation-timeline: scroll(root);
}

@keyframes grow-progress {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
```

### Parallax Hero (CSS)

```css
.hero-image {
  animation: parallax-shift linear forwards;
  animation-timeline: scroll();
  animation-range: cover 0% cover 100%;
}

@keyframes parallax-shift {
  from { transform: translateY(-15%); }
  to { transform: translateY(15%); }
}
```

### Sticky Header Background (scroll-driven)

```css
header {
  animation: header-blur linear forwards;
  animation-timeline: scroll(root);
  animation-range: 0px 80px;
}

@keyframes header-blur {
  from { background: transparent; backdrop-filter: none; }
  to { background: hsl(var(--background) / 0.85); backdrop-filter: blur(12px); }
}
```

---

## Loading States

### Skeleton Screen (CSS — preferred)

```css
.skeleton {
  background: linear-gradient(
    90deg,
    hsl(var(--muted)) 25%,
    hsl(var(--muted-foreground) / 0.08) 50%,
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
```

Usage as React component:

```tsx
function SkeletonCard() {
  return (
    <div className="p-4 rounded-lg border space-y-3">
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-4 w-1/2" />
      <div className="skeleton h-20 w-full" />
    </div>
  );
}
```

### Spinner

```css
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
```

### Animated Counter

```tsx
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

function AnimatedCounter({ target, duration = 1.5 }: { target: number; duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    const controls = animate(count, target, {
      duration,
      ease: [0.25, 0.46, 0.45, 0.94],
    });
    return controls.stop;
  }, [target, count, duration]);

  return <motion.span>{rounded}</motion.span>;
}
```

### Progress Ring (SVG + Framer Motion)

```tsx
function ProgressRing({ progress, size = 100, strokeWidth = 6 }: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="hsl(var(--primary))" strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference * (1 - progress / 100) }}
        transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}
```

---

## Gesture-Driven Patterns

### Draggable Card with Constraints

```tsx
<motion.div
  drag
  dragConstraints={{ left: -200, right: 200, top: -100, bottom: 100 }}
  dragElastic={0.1}
  dragMomentum={true}
  whileDrag={{ scale: 1.05, cursor: "grabbing", boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}
  style={{ cursor: "grab" }}
>
  <Card />
</motion.div>
```

### Swipe to Dismiss (mobile-friendly)

```tsx
function SwipeToDismiss({ children, onDismiss }: Props) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0]);

  return (
    <motion.div
      style={{ x, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 100) {
          onDismiss();
        }
      }}
    >
      {children}
    </motion.div>
  );
}
```

### Pull to Refresh Indicator

```tsx
function PullToRefresh({ onRefresh, children }: Props) {
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 80], [0, 1]);

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0, bottom: 0.3 }}
      onDragEnd={(_, info) => {
        if (info.offset.y > 80) onRefresh();
      }}
    >
      <motion.div style={{ opacity }} className="refresh-indicator">
        Refreshing...
      </motion.div>
      {children}
    </motion.div>
  );
}
```

---

## Text Animations

### Word-by-Word Reveal

```tsx
function AnimatedText({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <motion.p
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-1"
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.p>
  );
}
```

### Typewriter (CSS)

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

@keyframes typing { to { width: 100%; } }
@keyframes blink { 50% { border-color: transparent; } }
```

### Gradient Text Animation

```css
.gradient-text {
  background: linear-gradient(90deg, #6366f1, #a855f7, #ec4899, #6366f1);
  background-size: 300% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient-shift 4s linear infinite;
}

@keyframes gradient-shift {
  0% { background-position: 0% 0; }
  100% { background-position: 300% 0; }
}
```

---

## Layout Transitions

### Animated Tab Indicator (Framer Motion layout)

```tsx
function TabBar({ tabs, activeTab, onTabChange }: Props) {
  return (
    <div className="flex relative border-b">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className="relative px-4 py-2 text-sm font-medium"
        >
          {tab.label}
          {activeTab === tab.id && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
```

### Accordion

```tsx
function Accordion({ title, content }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div layout className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-4 text-left"
      >
        <span>{title}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          ↓
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0">{content}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
```

### Sidebar Expand/Collapse

```tsx
function Sidebar({ isExpanded }: { isExpanded: boolean }) {
  return (
    <motion.aside
      animate={{ width: isExpanded ? 240 : 64 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="overflow-hidden"
    >
      <nav>
        {navItems.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-3">
            <item.Icon className="shrink-0 w-5 h-5" />
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>
    </motion.aside>
  );
}
```

---

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| Animating `width`/`height` | Triggers layout recalc every frame | Use `transform: scale()`, `clip-path`, or Framer Motion `layout` |
| Animating `left`/`top` | Forces layout, janky on mobile | Use `transform: translate()` |
| `will-change` on everything | Wastes GPU memory | Only on elements about to animate; remove after |
| Duration > 700ms for UI | Feels sluggish | Max 500ms for UI, 300ms for micro-interactions |
| `linear` easing on UI elements | Robotic, unnatural | Use `ease-out` for entrances, springs for interactive |
| Missing `AnimatePresence` | Element disappears instantly | Always wrap conditional `motion.*` renders |
| JS `onScroll` for animations | Blocks main thread, 30fps max | Use CSS `animation-timeline` or `IntersectionObserver` |
| Same enter/exit animation | Confusing spatial model | Exit should reverse or fade opposite direction |
| No `prefers-reduced-motion` | Accessibility violation | Check and provide static fallback |
| Too many simultaneous animations | Visual chaos | Stagger with 50-100ms delay |

---

## Performance Checklist

Before shipping any animation:

- [ ] Only animating `transform` and `opacity` (verify with DevTools Paint Flashing)
- [ ] No layout thrashing (check Performance panel for forced reflows)
- [ ] `prefers-reduced-motion` respected — all animations have a static fallback
- [ ] Tested at 4x CPU throttle — stays above 30fps
- [ ] No stray `will-change` on static elements
- [ ] `AnimatePresence` wraps all conditional Framer Motion components
- [ ] Scroll animations use CSS `animation-timeline` or `useInView` (not raw `onScroll`)
- [ ] Springs have appropriate `damping` — no infinite oscillation
- [ ] Animations do not block user interaction (no long transitions on inputs/buttons)
- [ ] Tested on mobile — touch targets remain accessible during animation
