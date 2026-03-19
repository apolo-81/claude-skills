---
# Copy-Paste Examples — Web Animations

Production-ready, zero-setup code snippets. All examples include prefers-reduced-motion.

## CSS Examples

### Hover Scale Card
```css
.card {
  transition: transform 150ms ease-out, box-shadow 150ms ease-out;
}
.card:hover {
  transform: scale(1.03) translateY(-2px);
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.12);
}
@media (prefers-reduced-motion: reduce) {
  .card { transition: none; }
}
```

### Spinner
```css
@keyframes spin { to { transform: rotate(360deg); } }

.spinner {
  width: 24px; height: 24px;
  border: 3px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@media (prefers-reduced-motion: reduce) {
  .spinner { animation: none; opacity: 0.5; }
}
```

### Skeleton Shimmer
```css
@keyframes shimmer {
  from { background-position: -200% 0; }
  to   { background-position:  200% 0; }
}
.skeleton {
  background: linear-gradient(90deg,
    hsl(var(--muted)) 25%,
    hsl(var(--muted-foreground) / 0.08) 50%,
    hsl(var(--muted)) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
  border-radius: 0.375rem;
}
@media (prefers-reduced-motion: reduce) {
  .skeleton { animation: none; }
}
```

### Scroll Progress Bar
```css
.progress-bar {
  position: fixed; top: 0; left: 0; right: 0; height: 3px;
  background: hsl(var(--primary));
  transform-origin: left;
  animation: grow linear both;
  animation-timeline: scroll(root);
}
@keyframes grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
```

### Scroll Reveal
```css
.reveal {
  animation: reveal-up linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 30%;
}
@keyframes reveal-up {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .reveal { animation: none; }
}
```

## Framer Motion Examples

### Fade-in on Mount
```tsx
import { motion } from "framer-motion";

export function FadeIn({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}
```

### AnimatePresence Modal
```tsx
import { AnimatePresence, motion } from "framer-motion";

export function Modal({ open, onClose, children }: {
  open: boolean; onClose: () => void; children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-lg p-6"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2 }}
            role="dialog" aria-modal="true"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

### Staggered List
```tsx
import { motion } from "framer-motion";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export function StaggeredList({ items }: { items: string[] }) {
  return (
    <motion.ul variants={container} initial="hidden" animate="visible">
      {items.map((i) => (
        <motion.li key={i} variants={item}>{i}</motion.li>
      ))}
    </motion.ul>
  );
}
```

### Tab Indicator with layoutId
```tsx
import { useState } from "react";
import { motion } from "framer-motion";

export function Tabs({ tabs }: { tabs: string[] }) {
  const [active, setActive] = useState(tabs[0]);
  return (
    <div className="flex gap-1 p-1 bg-muted rounded-lg">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActive(tab)}
          className="relative px-4 py-2 text-sm font-medium rounded-md"
        >
          {active === tab && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute inset-0 bg-background shadow rounded-md"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative z-10">{tab}</span>
        </button>
      ))}
    </div>
  );
}
```

### Drag to Dismiss
```tsx
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

export function DraggableCard({ onDismiss }: { onDismiss: () => void }) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0]);

  return (
    <motion.div
      drag="x"
      style={{ x, opacity }}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 100) onDismiss();
        else animate(x, 0, { type: "spring", stiffness: 500 });
      }}
      tabIndex={0}
      role="button"
      aria-roledescription="draggable card"
      onKeyDown={(e) => { if (e.key === "Delete") onDismiss(); }}
      className="cursor-grab active:cursor-grabbing"
    >
      {/* card content */}
    </motion.div>
  );
}
```

### Animated Counter
```tsx
import { useEffect, useRef } from "react";
import { useMotionValue, useTransform, animate, motion } from "framer-motion";

export function AnimatedCounter({ target, duration = 1.5 }: {
  target: number; duration?: number;
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const controls = animate(count, target, { duration, ease: "easeOut" });
    return controls.stop;
  }, [target]);

  return <motion.span aria-live="polite" aria-atomic="true">{rounded}</motion.span>;
}
```
