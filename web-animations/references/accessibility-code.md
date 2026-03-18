# Animation Accessibility Code

## aria-live for Dynamic Content

```tsx
// Toast container
<div aria-live="polite" aria-relevant="additions removals">
  <AnimatePresence>
    {toasts.map((t) => <Toast key={t.id} {...t} />)}
  </AnimatePresence>
</div>

// Animated counter
<span aria-live="polite" aria-atomic="true">
  <AnimatedCounter target={revenue} />
</span>
```

## aria-busy for Loading States

```tsx
<div aria-busy={isLoading} aria-live="polite">
  {isLoading ? <SkeletonCard /> : <RealCard data={data} />}
</div>

<div role="status" aria-label="Loading">
  <span className="spinner" />
  <span className="sr-only">Loading...</span>
</div>
```

## Keyboard Accessible Draggable

```tsx
<motion.div
  drag="x"
  tabIndex={0}
  role="button"
  aria-roledescription="draggable item"
  onKeyDown={(e) => {
    if (e.key === "ArrowRight") moveItem(1);
    if (e.key === "ArrowLeft") moveItem(-1);
    if (e.key === "Escape") resetPosition();
  }}
>
  {children}
</motion.div>
```

## Keyboard Accessible Accordion

```tsx
<button
  aria-expanded={isOpen}
  aria-controls={`panel-${id}`}
  onClick={() => setIsOpen(!isOpen)}
>
  {title}
</button>
<AnimatePresence>
  {isOpen && (
    <motion.div id={`panel-${id}`} role="region" aria-labelledby={`btn-${id}`}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
    >
      {content}
    </motion.div>
  )}
</AnimatePresence>
```

## sr-only CSS (Tailwind includes this by default)

```css
.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0;
  margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0);
  white-space: nowrap; border-width: 0;
}
```

## TypeScript Types for Animation Props

```tsx
import type { Transition, Variants, MotionStyle } from "framer-motion";

export interface AnimationConfig {
  duration: number;
  ease: number[] | string;
  delay?: number;
}

export interface FadeSlideProps {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  className?: string;
}

export interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  delayChildren?: number;
  className?: string;
}

export interface SwipeToDismissProps {
  children: React.ReactNode;
  onDismiss: () => void;
  threshold?: number;
  direction?: "x" | "y";
}

export interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  fillColor?: string;
}

export interface AnimatedCounterProps {
  target: number;
  duration?: number;
  formatFn?: (value: number) => string;
}
```

## Animation Error Boundary

```tsx
"use client";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; }

export class AnimationErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(): State { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[AnimationError]", error.message, info.componentStack);
  }
  render(): ReactNode {
    if (this.state.hasError) return this.props.fallback ?? <div>{this.props.children}</div>;
    return this.props.children;
  }
}
```

## ESLint Config for Framer Motion Props

```jsonc
{
  "rules": {
    "react/no-unknown-property": ["error", { "ignore": ["layoutId", "whileHover", "whileTap", "whileDrag", "whileInView"] }],
    "no-restricted-properties": ["warn", { "object": "style", "property": "width", "message": "Animate transform instead of width for 60fps" }]
  }
}
```
