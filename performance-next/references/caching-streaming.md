# Caching & Streaming Patterns

## `unstable_cache` for Supabase

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
  ['published-posts'],
  { revalidate: 60, tags: ['posts'] }
)
```

## Tag Invalidation

```typescript
'use server'
import { revalidateTag } from 'next/cache'

export async function createPost(formData: FormData) {
  // ... create post
  revalidateTag('posts')
}
export async function updatePost(id: string, formData: FormData) {
  revalidateTag('posts')
  revalidateTag(`post-${id}`)
}
```

## Streaming with Suspense

Each `<Suspense>` boundary is an independent stream. Multiple boundaries in parallel = better perceived TTFB.

```typescript
export default function DashboardPage() {
  return (
    <div className="grid gap-6">
      <PageHeader title="Dashboard" />
      <Suspense fallback={<MetricsSkeleton />}>
        <MetricsSection />
      </Suspense>
      <Suspense fallback={<ChartSkeleton />}>
        <RevenueChart />
      </Suspense>
    </div>
  )
}
```

## Vercel Speed Insights Setup

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
