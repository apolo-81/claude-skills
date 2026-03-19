# Framer Motion Reference

Complete reference for Framer Motion in React/Next.js. Use this file when implementing React component animations.

## Installation

```bash
npm install framer-motion
```

---

## Core Concepts

### motion.* Components

Every HTML/SVG element has a `motion` equivalent. Use them as drop-in replacements:

```tsx
import { motion } from "framer-motion";

// HTML elements
<motion.div />
<motion.button />
<motion.span />
<motion.ul />
<motion.li />

// SVG elements
<motion.svg />
<motion.circle />
<motion.path />
```

### Basic Animation Props

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}   // starting state
  animate={{ opacity: 1, y: 0 }}    // target state
  exit={{ opacity: 0, y: -20 }}     // unmount state (requires AnimatePresence)
  transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
/>
```

### Gesture Props

```tsx
<motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  whileFocus={{ ring: 2 }}
  whileDrag={{ opacity: 0.8 }}
  whileInView={{ opacity: 1 }}      // triggers when element enters viewport
/>
```

---

## Variants System

Variants allow declarative, coordinated animations across parent and children.

### Basic Variants

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

// Usage — children inherit parent variant names automatically
<motion.ul variants={containerVariants} initial="hidden" animate="visible">
  {items.map((item) => (
    <motion.li key={item.id} variants={itemVariants}>
      {item.name}
    </motion.li>
  ))}
</motion.ul>
```

### Staggered Grid

```tsx
const gridContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
};

const gridItem = {
  hidden: { opacity: 0, scale: 0.8 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

<motion.div
  className="grid grid-cols-3 gap-4"
  variants={gridContainer}
  initial="hidden"
  animate="show"
>
  {cards.map((card) => (
    <motion.div key={card.id} variants={gridItem}>
      <Card {...card} />
    </motion.div>
  ))}
</motion.div>
```

### Variant Orchestration Options

```tsx
transition: {
  staggerChildren: 0.08,       // delay between each child animation
  delayChildren: 0.2,          // initial delay before first child
  staggerDirection: -1,        // -1 reverses stagger order
  when: "beforeChildren",      // parent animates first, then children
  when: "afterChildren",       // children animate first, then parent
}
```

---

## AnimatePresence (Exit Animations)

`AnimatePresence` is the only reliable way to animate unmounting in React. Without it, exit animations are skipped.

### Basic Usage

```tsx
import { AnimatePresence, motion } from "framer-motion";

<AnimatePresence>
  {isVisible && (
    <motion.div
      key="modal"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Modal />
    </motion.div>
  )}
</AnimatePresence>
```

### AnimatePresence Modes

```tsx
// wait: new component only enters after old one exits
<AnimatePresence mode="wait">
  <motion.div key={route}>{page}</motion.div>
</AnimatePresence>

// sync (default): enter and exit happen simultaneously
<AnimatePresence mode="sync">

// popLayout: exiting elements are removed from layout immediately
<AnimatePresence mode="popLayout">
```

### Notification Toast Stack

```tsx
<AnimatePresence>
  {toasts.map((toast) => (
    <motion.div
      key={toast.id}
      initial={{ opacity: 0, x: 100, height: 0 }}
      animate={{ opacity: 1, x: 0, height: "auto" }}
      exit={{ opacity: 0, x: 100, height: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      <Toast {...toast} />
    </motion.div>
  ))}
</AnimatePresence>
```

### List Item Removal

```tsx
// Always use AnimatePresence with a map — exits only work with stable keys
<AnimatePresence>
  {items.map((item) => (
    <motion.div
      key={item.id}
      layout                          // enables FLIP for layout shifts
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.25 }}
    >
      {item.name}
    </motion.div>
  ))}
</AnimatePresence>
```

---

## Layout Animations (FLIP)

The `layout` prop enables automatic FLIP animations when an element's position or size changes. This is the best way to animate layout shifts without calculating positions manually.

```tsx
// Anything that changes CSS layout will animate smoothly
<motion.div layout>...</motion.div>

// Animate only position (not size)
<motion.div layout="position">...</motion.div>

// Animate only size (not position)
<motion.div layout="size">...</motion.div>

// Preserve layout of children independently
<motion.div layout="preserve-aspect">...</motion.div>
```

### Reorderable List

```tsx
<motion.ul>
  {sortedItems.map((item) => (
    <motion.li
      key={item.id}
      layout
      transition={{ type: "spring", stiffness: 500, damping: 35 }}
    >
      {item.name}
    </motion.li>
  ))}
</motion.ul>
```

### Expandable Card

```tsx
function ExpandableCard({ title, content }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      layout
      onClick={() => setIsOpen(!isOpen)}
      className="overflow-hidden rounded-lg border p-4 cursor-pointer"
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      <motion.h3 layout="position">{title}</motion.h3>
      <AnimatePresence>
        {isOpen && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {content}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
```

### Toggle Switch (layout = thumb slides automatically)

```tsx
function Toggle({ isOn, onToggle }: { isOn: boolean; onToggle: () => void }) {
  return (
    <div
      className={cn(
        "w-14 h-8 flex items-center rounded-full p-1 cursor-pointer",
        isOn ? "justify-end bg-green-500" : "justify-start bg-gray-300"
      )}
      onClick={onToggle}
    >
      <motion.div
        className="w-6 h-6 bg-white rounded-full shadow-md"
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
      />
    </div>
  );
}
```

### LayoutGroup (sync layout animations across components)

```tsx
import { LayoutGroup } from "framer-motion";

// Wrap components that need to coordinate layout animations
<LayoutGroup>
  <ComponentA />
  <ComponentB />
</LayoutGroup>
```

---

## Gesture Animations

### Hover and Tap

```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
>
  Click me
</motion.button>
```

### Drag

```tsx
// Constrained drag
<motion.div
  drag
  dragConstraints={{ left: 0, right: 300, top: 0, bottom: 300 }}
  dragElastic={0.1}                // bounciness at constraint boundary (0-1)
  dragMomentum={true}              // physics-based momentum after release
  whileDrag={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
>
  <Card />
</motion.div>

// Axis-constrained
<motion.div drag="x" />
<motion.div drag="y" />

// Drag to reorder — combine with layout
<motion.div drag="y" layout>
```

### Swipe to Dismiss

```tsx
function SwipeToDismiss({ children, onDismiss }: Props) {
  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 100) onDismiss();
      }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}
```

---

## Scroll-Linked Animations

### useInView (Scroll Trigger)

```tsx
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

function RevealOnScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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

### useScroll + useTransform (Parallax/Progress)

```tsx
import { motion, useScroll, useTransform } from "framer-motion";

function ParallaxSection() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <motion.div style={{ y }}>
      <img src="/hero.jpg" />
    </motion.div>
  );
}

// Scoped to a specific element
function StickyHeader() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return <motion.div ref={ref} style={{ opacity }}>...</motion.div>;
}
```

---

## Motion Values and Hooks

### useMotionValue + useTransform

```tsx
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

// Animated counter
function AnimatedCounter({ target }: { target: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(count, target, {
      duration: 1.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    });
    return controls.stop;
  }, [target, count]);

  return <motion.span>{rounded}</motion.span>;
}

// Mouse-tracked tilt card
function TiltCard() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  function onMouseMove(e: React.MouseEvent) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }

  return (
    <motion.div
      onMouseMove={onMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
    >
      <Card />
    </motion.div>
  );
}
```

### useAnimation (Imperative Control)

```tsx
import { motion, useAnimation } from "framer-motion";

function ShakeOnError() {
  const controls = useAnimation();

  async function handleError() {
    await controls.start({
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.4, ease: "easeInOut" },
    });
  }

  return (
    <motion.div animate={controls}>
      <Input onError={handleError} />
    </motion.div>
  );
}
```

### useReducedMotion

```tsx
import { useReducedMotion } from "framer-motion";

function Component() {
  const shouldReduceMotion = useReducedMotion();

  // Option 1: skip motion entirely
  if (shouldReduceMotion) {
    return <div>{children}</div>;
  }

  // Option 2: use reduced variant
  return (
    <motion.div
      animate={{ x: shouldReduceMotion ? 0 : 100 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
    />
  );
}
```

---

## SVG Animations

### Animated Progress Ring

```tsx
function ProgressRing({ progress }: { progress: number }) {
  const circumference = 2 * Math.PI * 45; // r=45

  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
      <motion.circle
        cx="50" cy="50" r="45"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference * (1 - progress / 100) }}
        transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
        transform="rotate(-90 50 50)"
      />
    </svg>
  );
}
```

### Animated Path (draw-on effect)

```tsx
<motion.path
  d="M 0 0 L 100 100"
  initial={{ pathLength: 0, opacity: 0 }}
  animate={{ pathLength: 1, opacity: 1 }}
  transition={{ duration: 1.5, ease: "easeInOut" }}
/>
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
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.05 } },
      }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-1"
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.p>
  );
}
```

### Character-by-Character (Hero text)

```tsx
function SplitText({ text }: { text: string }) {
  const chars = text.split("");
  return (
    <motion.h1
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
    >
      {chars.map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          variants={{
            hidden: { opacity: 0, y: "100%", skewY: 5 },
            visible: { opacity: 1, y: 0, skewY: 0 },
          }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.h1>
  );
}
```

---

## Page Transitions (Framer Motion)

### Page Wrapper Component

```tsx
// components/page-transition.tsx
"use client";
import { motion } from "framer-motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}
```

### With AnimatePresence in App Router

```tsx
// app/layout.tsx
"use client";
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait">
      <PageTransition key={pathname}>
        {children}
      </PageTransition>
    </AnimatePresence>
  );
}
```

---

## Spring Configuration Reference

```tsx
// Snappy UI feedback
{ type: "spring", stiffness: 700, damping: 30 }

// Button press / interactive
{ type: "spring", stiffness: 400, damping: 17 }

// Smooth entrance
{ type: "spring", stiffness: 200, damping: 30 }

// Bouncy / playful
{ type: "spring", stiffness: 300, damping: 15, mass: 0.8 }

// Slow settle
{ type: "spring", stiffness: 100, damping: 20 }
```

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Exit animation not running | Wrap component in `<AnimatePresence>` |
| `key` prop missing in mapped lists | Add stable `key` to each `motion.*` element inside `AnimatePresence` |
| Layout animation jumps | Wrap in `<LayoutGroup>` if multiple components shift together |
| `whileHover` on non-interactive element | Add `cursor-pointer` and make it keyboard-accessible |
| Animating `width`/`height` directly | Use `layout` prop instead for size changes |
| Spring oscillates forever | Increase `damping` value |
