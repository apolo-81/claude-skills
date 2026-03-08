---
name: performance-next
description: >
  Use when optimizing performance of a Next.js app, improving Core Web Vitals,
  reducing bundle size, fixing slow pages, or implementing React performance patterns.
  Trigger for: "performance", "rendimiento", "lento", "slow", "bundle size", "lighthouse",
  "core web vitals", "LCP", "CLS", "INP", "FCP", "TTFB", "bundle analyzer",
  "code splitting", "lazy loading", "React.memo", "useMemo", "useCallback",
  "image optimization", "font optimization", "mi app está lenta", "mejorar velocidad",
  "optimizar next.js", "reducir javascript", "eliminar unused code", "tree shaking",
  "Suspense", "streaming", "partial prerendering", "PPR", "ISR", "cache strategy",
  "next/image", "next/font", "prefetch", "preload".
---

# performance-next

Guía de rendimiento para Next.js 15 App Router + React + Tailwind CSS + Supabase + Vercel + TypeScript.

---

## 1. Overview — El impacto del rendimiento

### Por qué importa

- Cada **100ms de latencia** adicional reduce la tasa de conversión entre un 1% y un 7% (fuente: Google/Deloitte).
- Google usa Core Web Vitals como señal de ranking desde 2021.
- Vercel mide p75 y p95: el percentil 75 es el umbral que Google evalúa para ranking.

### Next.js 15 — Novedades de rendimiento clave

**Partial Prerendering (PPR):**
- Combina static shell + dynamic streaming en una sola request.
- El shell HTML se sirve desde CDN (ultra rápido), el contenido dinámico llega via streaming.
- Activar en `next.config.ts`:

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    ppr: 'incremental', // 'incremental' para activar por ruta
  },
}

export default nextConfig
```

- En cada layout/page que quieras PPR:

```typescript
// app/dashboard/page.tsx
export const experimental_ppr = true

import { Suspense } from 'react'
import { StaticHero } from '@/components/StaticHero'
import { DynamicFeed } from '@/components/DynamicFeed'

export default function DashboardPage() {
  return (
    <>
      <StaticHero /> {/* Se renderiza en build time */}
      <Suspense fallback={<FeedSkeleton />}>
        <DynamicFeed /> {/* Se hace streaming */}
      </Suspense>
    </>
  )
}
```

**Cuándo activar PPR:**
- Páginas con hero/header estático + contenido dinámico (feeds, dashboards).
- No activar si toda la página es 100% estática (usa static rendering directo).
- No activar si toda la página requiere datos del usuario sin cache posible.

### Herramientas de diagnóstico

| Herramienta | Qué mide | Cuándo usar |
|---|---|---|
| Lighthouse (DevTools) | Todas las métricas + oportunidades | Diagnóstico inicial en local |
| Chrome DevTools Performance | JS main thread, long tasks | Investigar INP / jank |
| Vercel Speed Insights | Core Web Vitals en producción real | Monitoreo continuo |
| `@next/bundle-analyzer` | Tamaño de bundles JS | Antes/después de optimizar |
| `web-vitals` npm | CWV desde el navegador del usuario | Enviar a analytics propio |

---

## 2. Core Web Vitals — Diagnóstico rápido

| Métrica | Objetivo | Causa frecuente | Fix clave |
|---|---|---|---|
| LCP | <2.5s | Hero image sin `priority` | Añadir `priority` + `sizes="100vw"` a `next/image` |
| INP | <200ms | Long Tasks en main thread | `useTransition` para trabajo no urgente |
| CLS | <0.1 | Imágenes sin dimensiones | Siempre `width`+`height` o `fill` con contenedor relativo |

**Fix crítico LCP — hero image:**

```typescript
// BIEN: priority genera <link rel="preload"> en el <head>
<Image src="/hero.jpg" alt="Hero" width={1200} height={600} priority sizes="100vw" quality={85} />
```

**Fix crítico INP — useTransition para updates no urgentes:**

```typescript
'use client'
import { useTransition, useState } from 'react'

export function SearchFilter() {
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value)             // urgente: input inmediato
    startTransition(() => { /* filtrar */ }) // no urgente: puede esperar
  }
  return <input value={query} onChange={handleChange} />
}
```

**Fix crítico CLS — skeleton + dimensiones:**

```typescript
// app/dashboard/loading.tsx
export default function Loading() {
  return <div className="animate-pulse space-y-4">
    <div className="h-8 bg-gray-200 rounded w-3/4" />
    <div className="h-64 bg-gray-200 rounded" />
  </div>
}
```

Ver `references/react-performance.md` para medir CWV en producción con `useReportWebVitals` y patrones de diagnóstico avanzados.

---

## 3. Image Optimization

### Patrones críticos de `next/image`

```typescript
// Hero (above the fold) — priority + sizes
<Image src="/hero.jpg" alt="Hero" width={1200} height={600}
  priority sizes="(max-width: 768px) 100vw, 50vw" quality={85} />

// Blur placeholder (genera blurDataURL con plaiceholder + sharp en el server)
<Image src={src} alt={alt} width={800} height={600}
  placeholder="blur" blurDataURL={blurDataURL} />

// fill — cuando el contenedor define el tamaño
<div className="relative w-full h-64">
  <Image src={src} alt={alt} fill className="object-cover" />
</div>

// Avatares/iconos — dimensiones fijas
<Image src={avatar} alt={name} width={40} height={40} className="rounded-full" />
```

### Configuración en `next.config.ts`

```typescript
const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'], // AVIF ~20% más pequeño que WebP
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co', pathname: '/storage/v1/object/public/**' },
      { protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/images/**' },
    ],
  },
}
```

---

## 4. Font Optimization

### Google Fonts con `next/font`

```typescript
// app/fonts.ts
import { Inter, Playfair_Display } from 'next/font/google'

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',        // Muestra fuente fallback mientras carga
  variable: '--font-inter', // Para usar con Tailwind
  preload: true,          // Por defecto true
})

export const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  weight: ['400', '700'], // Solo los pesos que usas
})

// app/layout.tsx
import { inter, playfair } from '@/app/fonts'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
```

### Variable fonts (un archivo, todos los pesos)

```typescript
// Un solo archivo de fuente para todos los pesos → mejor rendimiento
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  // No especifiques weight → carga variable font automáticamente
})
```

### Self-hosted con `next/font/local`

```typescript
import localFont from 'next/font/local'

export const myFont = localFont({
  src: [
    { path: '../public/fonts/MyFont-Regular.woff2', weight: '400' },
    { path: '../public/fonts/MyFont-Bold.woff2', weight: '700' },
  ],
  display: 'swap',
  variable: '--font-custom',
})
```

**Integración con Tailwind CSS:**

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        display: ['var(--font-playfair)'],
      },
    },
  },
}
```

---

## 5. Bundle Size

Ver `references/bundle-optimization.md` para el análisis completo.

**Patrón rápido — dynamic imports:**

```typescript
// Por qué: componentes pesados cargados solo cuando se necesitan
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false, // Solo si el componente usa window/document/localStorage
})

// Uso normal — Next.js carga el chunk solo cuando el componente se renderiza
export default function DashboardPage() {
  return (
    <section>
      <HeavyChart data={data} />
    </section>
  )
}
```

**Dynamic import de librerías pesadas en Server Actions o Route Handlers:**

```typescript
// app/api/export/route.ts
export async function POST(request: Request) {
  // Importar solo cuando se necesita, no en el módulo raíz
  const { default: PDFDocument } = await import('pdfkit')
  // ...
}
```

---

## 6. Caching Strategy — Next.js 15

### Tabla resumen

| Patrón | Cuándo usar | Código |
|---|---|---|
| `force-cache` | Datos estáticos (≡ SSG) | `fetch(url, { cache: 'force-cache' })` |
| `revalidate: N` | ISR — datos semi-estáticos | `fetch(url, { next: { revalidate: 60, tags: ['posts'] } })` |
| `no-store` | Datos del usuario, siempre frescos | `fetch(url, { cache: 'no-store' })` |
| Route segment | Control a nivel de página | `export const revalidate = 3600` |

### `unstable_cache` para Supabase

```typescript
// lib/queries.ts
import { unstable_cache } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export const getPublishedPosts = unstable_cache(
  async () => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, slug, published_at, author:users(name, avatar_url)')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (error) throw error
    return data
  },
  ['published-posts'],          // Cache key
  {
    revalidate: 60,             // Segundos
    tags: ['posts'],            // Para invalidación selectiva
  }
)
```

### Invalidación selectiva con tags

```typescript
'use server'
import { revalidateTag } from 'next/cache'

export async function createPost(formData: FormData) {
  // ... crear post en Supabase
  revalidateTag('posts')
}
export async function updatePost(id: string, formData: FormData) {
  revalidateTag('posts')
  revalidateTag(`post-${id}`) // Tag específico para este post
}
```

### Streaming con Suspense

Cada `<Suspense>` boundary es un stream independiente. Múltiples boundaries en paralelo = mejor TTFB percibido.

```typescript
export default function DashboardPage() {
  return (
    <div className="grid gap-6">
      <PageHeader title="Dashboard" /> {/* estático: renderiza inmediatamente */}
      <Suspense fallback={<MetricsSkeleton />}>
        <MetricsSection />   {/* async Server Component — streaming */}
      </Suspense>
      <Suspense fallback={<ChartSkeleton />}>
        <RevenueChart />
      </Suspense>
    </div>
  )
}
```

---

## 7. React Performance

Ver `references/react-performance.md` para los patrones completos.

**Regla de oro: medir antes de optimizar.**

`React.memo`, `useMemo` y `useCallback` sin un Profiler que justifique su uso son optimización prematura. Estas herramientas tienen un costo propio (comparaciones de dependencias, memoria) que puede superar el beneficio en componentes simples.

**Flujo de diagnóstico:**
1. Abre Chrome DevTools → pestaña Performance.
2. Graba una interacción lenta.
3. Busca "Long Tasks" (barras rojas) y llama a la causa raíz.
4. Usa React DevTools Profiler para identificar renders innecesarios.
5. Solo entonces aplica `memo`/`useMemo`/`useCallback`.

---

## 8. Database Queries — Supabase

**N+1:** evitar loops con queries individuales. Usar joins en Supabase:

```typescript
// BIEN: 1 query con join (evita N+1)
const { data: posts } = await supabase
  .from('posts')
  .select('id, title, published_at, author:users(name, avatar_url)')
  .eq('status', 'published')
  .order('published_at', { ascending: false })
  .limit(20)
```

**Índices clave:** crear en columnas usadas en `.eq()`, `.order()`, `.filter()`:

```sql
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
-- Índice parcial para la query más común:
CREATE INDEX idx_posts_status_published ON posts(status, published_at DESC) WHERE status = 'published';
```

**Connection pooling:** en Vercel (serverless), usar la URL del Transaction pooler (puerto 6543), no la Direct URL (5432).

**Paginación:** cursor-based (`.lt('published_at', cursor)`) en lugar de OFFSET (`.range()`) para tablas grandes.

---

## 9. Vercel-specific

### Edge Runtime vs Node.js Runtime

```typescript
// Edge Runtime: más rápido para latencia global, pero APIs limitadas
// Usa: middleware, páginas simples con poca lógica, geo-routing
export const runtime = 'edge'

// Node.js Runtime: APIs completas, más tiempo de arranque
// Usa: Server Actions complejas, acceso a filesystem, crypto nativo
// (Por defecto — no necesitas declararlo)
```

**Cuándo usar Edge:**
- Middleware de autenticación (verificar JWT sin base de datos).
- Redirects/rewrites basados en geolocalización.
- Páginas con fetch simple sin Node.js APIs.

**No usar Edge cuando:**
- Necesitas conectar a Supabase con el client normal (usa Node.js).
- Usas librerías que dependen de Node.js APIs (`fs`, `crypto`, `stream`).
- Necesitas sharp para procesamiento de imágenes.

### Vercel Speed Insights

```bash
npm install @vercel/speed-insights
```

```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
```

**Interpretar p75/p95:**
- **p75**: el 75% de los usuarios tiene este valor o mejor. Google usa p75 para ranking.
- **p95**: los 5% peores casos. Identifica problemas para usuarios en condiciones adversas (conexiones lentas, hardware antiguo).
- Prioriza mejorar p75. Si p95 es muy alto, investiga si hay rutas específicas que degradan la métrica.

### Checklist de performance antes de deploy

```
[ ] next/image con priority en el hero
[ ] next/font configurado (no @import de Google Fonts en CSS)
[ ] No hay console.log en producción (usa proceso de lint)
[ ] Server Components para todo lo que no necesite interactividad
[ ] Suspense boundaries en todas las secciones con datos async
[ ] fetch con revalidate apropiado (no todo 'no-store')
[ ] Bundle analyzer corrido: ningún módulo >500KB sin justificación
[ ] Lighthouse score >90 en Performance en una build de producción local
```
