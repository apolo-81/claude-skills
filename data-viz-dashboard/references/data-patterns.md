# Data Patterns — Supabase + n8n

## Patron A — n8n escribe en Supabase, dashboard lee

```typescript
// lib/data/n8n-metrics.ts
import { createClient } from '@/lib/supabase/server'

export async function getWorkflowMetrics(days = 30) {
  const supabase = createClient()
  const since = new Date(Date.now() - days * 86400000).toISOString()

  const { data } = await supabase
    .from('workflow_runs')
    .select('workflow_name, status, executed_at, duration_ms')
    .gte('executed_at', since)
    .order('executed_at', { ascending: true })

  return data ?? []
}

export async function getWorkflowStats() {
  const supabase = createClient()
  const { data } = await supabase.rpc('get_workflow_stats')
  return data
}
```

## Patron B — Dashboard polling a webhook n8n

```typescript
'use client'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useN8nMetrics() {
  const { data, error, isLoading } = useSWR(
    '/api/n8n-metrics',
    fetcher,
    { refreshInterval: 30_000 }
  )
  return { metrics: data, error, isLoading }
}

// app/api/n8n-metrics/route.ts
export async function GET() {
  const res = await fetch(process.env.N8N_WEBHOOK_URL!, {
    headers: { 'x-api-key': process.env.N8N_API_KEY! },
    next: { revalidate: 0 },
  })
  const data = await res.json()
  return Response.json(data)
}
```
