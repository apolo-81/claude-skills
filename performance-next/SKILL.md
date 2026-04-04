---
name: performance-next
description: >
  Optimiza performance en Next.js: Core Web Vitals, bundle size, lazy loading, imágenes,
  fonts, code splitting, Suspense, streaming, ISR y estrategia de caché.
  Usar cuando: "LCP", "CLS", "INP", "página lenta", "bundle grande", "optimizar Next.js",
  "lazy loading", "React.memo", "useMemo", "caché", "ISR", "PPR".
---

# performance-next

Next.js 15 App Router + React + Tailwind CSS + Supabase + Vercel + TypeScript.

---

## 1. Partial Prerendering (PPR) — Next.js 15

Static shell from CDN + dynamic content via streaming in one request.

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  experimental: { ppr: 'incremental' },
}
```

```typescript
// app/dashboard/page.tsx
export const experimental_ppr = true

export default function DashboardPage() {
  return (
    <>
      <StaticHero />
      <Suspense fallback={<FeedSkeleton />}>
        <DynamicFeed />
      </Suspense>
    </>
  )
}
```

**Activate PPR when:** static hero/header + dynamic content. **Skip if:** page is 100% static or 100% user-specific without cache.

### Diagnostic Tools

| Tool | Measures | When |
|---|---|---|
| Lighthouse (DevTools) | All metrics + opportunities | Initial local diagnosis |
| Chrome DevTools Performance | JS main thread, long tasks | Investigate INP/jank |
| Vercel Speed Insights | Real-user CWV in production | Continuous monitoring |
| `@next/bundle-analyzer` | JS bundle sizes | Before/after optimizing |
| `web-vitals` npm | CWV from user browser | Send to own analytics |

---

## 2. Core Web Vitals — Quick Diagnosis

| Metric | Target | Common Cause | Key Fix |
|---|---|---|---|
| LCP | <2.5s | Hero image without `priority` | Add `priority` + `sizes="100vw"` to `next/image` |
| INP | <200ms | Long Tasks on main thread | `useTransition` for non-urgent work |
| CLS | <0.1 | Images without dimensions | Always `width`+`height` or `fill` with relative container |

**LCP fix:** `<Image src="/hero.jpg" alt="Hero" width={1200} height={600} priority sizes="100vw" quality={85} />`

**INP fix — useTransition:**
```typescript
const [isPending, startTransition] = useTransition()
function handleChange(e) {
  setQuery(e.target.value)                // urgent: immediate input
  startTransition(() => { /* filter */ }) // non-urgent: can wait
}
```

**CLS fix — skeleton:** `loading.tsx` with `animate-pulse` placeholders matching final layout dimensions.

Ver `references/react-performance.md` para CWV measurement with `useReportWebVitals`.

---

## 3. Image & Font Optimization

Ver `references/font-image-config.md` para all patterns and config.

Key rules:
- Hero images: `priority` + `sizes` + `quality={85}`
- Always specify `width`+`height` or use `fill` with sized container
- Use `next/font/google` with `display: 'swap'` and `variable` for Tailwind
- Variable fonts (no `weight` specified) = single file, all weights
- AVIF ~20% smaller than WebP: `formats: ['image/avif', 'image/webp']`

---

## 4. Bundle Size

Ver `references/bundle-optimization.md` para full analysis.

**Dynamic imports:**
```typescript
import dynamic from 'next/dynamic'
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,
})
```

**Dynamic import in Server Actions/Route Handlers:**
```typescript
export async function POST(request: Request) {
  const { default: PDFDocument } = await import('pdfkit')
}
```

---

## 5. Caching Strategy — Next.js 15

| Pattern | When | Code |
|---|---|---|
| `force-cache` | Static data (SSG) | `fetch(url, { cache: 'force-cache' })` |
| `revalidate: N` | ISR — semi-static | `fetch(url, { next: { revalidate: 60, tags: ['posts'] } })` |
| `no-store` | User data, always fresh | `fetch(url, { cache: 'no-store' })` |
| Route segment | Page-level control | `export const revalidate = 3600` |

Ver `references/caching-streaming.md` para `unstable_cache` with Supabase, tag invalidation, and streaming patterns.

---

## 6. React Performance

Ver `references/react-performance.md` para complete patterns.

**Rule:** measure before optimizing. `React.memo`/`useMemo`/`useCallback` without Profiler justification = premature optimization.

**Diagnosis flow:**
1. Chrome DevTools > Performance > record slow interaction
2. Find "Long Tasks" (red bars)
3. React DevTools Profiler > identify unnecessary renders
4. Only then apply `memo`/`useMemo`/`useCallback`

---

## 7. Database Queries — Supabase

Avoid N+1 — use joins:
```typescript
const { data: posts } = await supabase
  .from('posts')
  .select('id, title, published_at, author:users(name, avatar_url)')
  .eq('status', 'published')
  .order('published_at', { ascending: false })
  .limit(20)
```

Key indexes on columns used in `.eq()`, `.order()`, `.filter()`:
```sql
CREATE INDEX idx_posts_status_published ON posts(status, published_at DESC) WHERE status = 'published';
```

- **Connection pooling:** in Vercel serverless, use Transaction pooler URL (port 6543), not Direct (5432)
- **Pagination:** cursor-based (`.lt('published_at', cursor)`) over OFFSET for large tables

---

## 8. Vercel-specific

### Edge vs Node.js Runtime

| Use Edge | Use Node.js (default) |
|---|---|
| Auth middleware (verify JWT without DB) | Server Actions with Supabase |
| Geo-based redirects/rewrites | Libraries needing `fs`, `crypto`, `stream` |
| Simple fetch without Node.js APIs | Image processing (sharp) |

### Speed Insights

- **p75**: Google uses for ranking. Prioritize improving this.
- **p95**: worst 5% cases. Investigate if specific routes degrade the metric.

Ver `references/caching-streaming.md` para Speed Insights setup code.

### Pre-deploy Checklist

```
[ ] next/image with priority on hero
[ ] next/font configured (no @import in CSS)
[ ] No console.log in production
[ ] Server Components for everything non-interactive
[ ] Suspense boundaries on all async data sections
[ ] fetch with appropriate revalidate (not all 'no-store')
[ ] Bundle analyzer: no module >500KB without justification
[ ] Lighthouse >90 Performance on local production build
```
