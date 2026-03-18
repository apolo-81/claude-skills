# Async Pattern, Auth, Schema & Testing

## Pattern C — API Route + React Hook

```typescript
// 1. API route: trigger y crear registro pendiente
// app/api/reports/generate/route.ts
export async function POST(req: Request) {
  const { userId, reportType } = await req.json()

  const { data: event } = await supabase
    .from('n8n_events')
    .insert({ user_id: userId, type: 'generate-report', status: 'pending' })
    .select('id')
    .single()

  await n8n.trigger('generate-report', {
    eventId: event.id, userId, reportType,
  })

  return Response.json({ eventId: event.id })
}

// 2. Hook React: escuchar resultado via Realtime
// hooks/useReportGeneration.ts
export function useReportGeneration(eventId: string | null) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<ReportResult | null>(null)

  useEffect(() => {
    if (!eventId) return
    setStatus('pending')

    const channel = supabase
      .channel(`event-${eventId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'n8n_events',
        filter: `id=eq.${eventId}`,
      }, (payload) => {
        const row = payload.new as N8nEvent
        if (row.status === 'completed') {
          setResult(row.result)
          setStatus('done')
        } else if (row.status === 'failed') {
          setStatus('error')
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [eventId])

  return { status, result }
}
```

## Pattern D — Callback Endpoint

```typescript
// app/api/n8n/callback/route.ts
import { verifyN8nRequest } from '@/lib/n8n-auth'

export async function POST(req: Request) {
  const authError = verifyN8nRequest(req)
  if (authError) return authError

  const { eventId, status, result } = await req.json()

  await supabase
    .from('n8n_events')
    .update({ status, result, updated_at: new Date().toISOString() })
    .eq('id', eventId)

  return Response.json({ received: true })
}
```

## Webhook Authentication

```typescript
// lib/n8n-auth.ts
import { timingSafeEqual } from 'crypto'

export function verifyN8nRequest(req: Request): Response | null {
  const apiKey = req.headers.get('x-n8n-api-key')
  const expected = process.env.N8N_CALLBACK_SECRET!

  if (!apiKey || !expected) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const a = Buffer.from(apiKey)
  const b = Buffer.from(expected)

  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return null
}
```

## n8n_events Schema

```sql
create table n8n_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  type text not null,
  payload jsonb,
  status text default 'pending', -- pending | completed | failed
  result jsonb,
  error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## Testing Local

```bash
# n8n en Docker
docker run -d --name n8n -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=admin \
  n8nio/n8n

# Exponer localhost para n8n Docker → Next.js
ngrok http 3000

# Test fire-and-forget
curl -X POST http://localhost:5678/webhook/send-welcome-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test"}'

# Test sincrono
curl -X POST http://localhost:5678/webhook/validate-vat \
  -H "Content-Type: application/json" \
  -d '{"vatNumber":"ESB12345678"}'

# Test callback n8n -> Next.js
curl -X POST http://localhost:3000/api/n8n/callback \
  -H "x-n8n-api-key: dev-secret" \
  -H "Content-Type: application/json" \
  -d '{"eventId":"abc-123","status":"completed","result":{"pdfUrl":"https://..."}}'
```
