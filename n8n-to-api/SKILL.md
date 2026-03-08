---
name: n8n-to-api
description: >
  Use when exposing n8n workflows as APIs, calling n8n from a web app, using n8n
  as backend logic, or building event-driven integrations between Next.js and n8n.
  Trigger for: "llamar a n8n desde mi app", "n8n como backend", "n8n API", "webhook
  de n8n", "trigger n8n workflow", "n8n HTTP trigger", "automatizar desde mi web",
  "n8n como lógica de negocio", "n8n response webhook", "wait for n8n result",
  "n8n + Next.js", "ejecutar automatización desde botón", "n8n workflow como función".
---

# n8n como Backend de Lógica de Negocio

## 1. Overview

n8n actua como capa de automatizacion entre la web app y servicios externos. Los workflows se modifican sin deploy, tienen 400+ integraciones nativas y gestionan estado de procesos complejos.

**Usar n8n para:**
- Emails transaccionales y campanas
- Notificaciones Slack / Discord
- Sincronizacion con CRM (HubSpot, Salesforce)
- Procesamiento asincrono largo (PDFs, imagenes)
- Orquestacion de multiples servicios

**No usar n8n para:**
- Logica critica <100ms (latencia de red)
- Autenticacion de usuarios (usar NextAuth / Supabase Auth)
- Operaciones directas a DB (usar Supabase directamente)
- Validacion de formularios (mantener en el cliente)

**Decision matrix:**

| Tarea | Herramienta |
|-------|-------------|
| Email bienvenida | n8n |
| Validar email unico | Supabase Edge Function |
| Sincronizar con HubSpot | n8n |
| Autenticar JWT | Next.js Middleware |
| Generar PDF > 30s | n8n + Supabase Realtime |
| Consulta SQL simple | Supabase client |

---

## 2. Los 4 Patrones de Comunicacion

### Pattern A — Fire-and-Forget (mas comun)

App envia webhook a n8n y no espera respuesta. Ideal para efectos secundarios.

```typescript
// app/api/contact/route.ts
import { n8n } from '@/lib/n8n-client'

export async function POST(req: Request) {
  const body = await req.json()

  // No await — no bloqueamos la respuesta al usuario
  n8n.trigger('send-contact-email', {
    name: body.name,
    email: body.email,
    message: body.message,
  }).catch(err => console.error('[n8n] trigger failed:', err))

  return Response.json({ ok: true })
}
```

Usar para: emails, notificaciones Slack, actualizar CRM, logging de eventos.

### Pattern B — Request-Response (sincrono)

App llama a n8n y espera la respuesta. n8n debe tener un nodo "Respond to Webhook".

```typescript
// app/api/validate-vat/route.ts
import { n8n } from '@/lib/n8n-client'

export async function POST(req: Request) {
  const { vatNumber } = await req.json()

  const result = await n8n.call<{ valid: boolean; company: string }>(
    'validate-vat',
    { vatNumber }
  )

  return Response.json(result)
}
```

Usar para: validar datos en servicios externos, procesar y transformar datos, generar contenido.
**Limitacion:** Vercel tiene timeout de 30s en planes gratuitos (60s en Pro).

### Pattern C — Async con Supabase (tareas largas)

Para tareas que superan el timeout de Vercel. App dispara n8n, n8n guarda resultado en Supabase, app escucha con Realtime.

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
    eventId: event.id,
    userId,
    reportType,
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

Usar para: generacion de PDFs, procesamiento de imagenes, scraping, tareas >30s.

### Pattern D — n8n llama a Next.js

n8n hace HTTP Request a una API route de Next.js. Util para actualizar estado o ejecutar logica de negocio.

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

Usar para: callbacks de procesos async, notificaciones push al usuario, sincronizacion de estado.

---

## 3. Autenticacion de Webhooks n8n

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

  return null // OK
}
```

En n8n: HTTP Request node > Authentication > Header Auth > Name: `x-n8n-api-key`, Value: el mismo secreto.

---

## 4. N8nClient — Clase Reutilizable

Ver `/references/n8n-client.md` para implementacion completa con retry, timeouts y hooks.

Uso rapido:

```typescript
import { n8n } from '@/lib/n8n-client'

// Fire-and-forget
await n8n.trigger('send-welcome-email', { userId, email })

// Sincrono con respuesta tipada
const result = await n8n.call<{ pdfUrl: string }>('generate-report', { userId })
```

---

## 5. Error Handling y Resiliencia

- **Timeout:** AbortController con 10s (trigger) y 30s (call)
- **Retry:** 3 intentos con backoff exponencial (1s, 2s, 4s)
- **Dead letter:** si n8n no responde tras retries, guardar en tabla `n8n_events` con `status: 'failed'`
- **Alertas:** webhook a Slack si error rate supera umbral
- **Logging:** todos los eventos enviados a n8n se loguean en `n8n_events`

Schema minimo `n8n_events`:

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

---

## 6. Testing Local

```bash
# n8n en Docker
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=admin \
  n8nio/n8n

# Exponer localhost para que n8n (en Docker) llame a Next.js
ngrok http 3000
# Usar la URL de ngrok en los HTTP Request nodes de n8n

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

---

## 7. Variables de Entorno

```bash
# .env.local
N8N_BASE_URL=https://your-n8n-instance.com
N8N_API_KEY=your-n8n-api-key
N8N_CALLBACK_SECRET=random-secret-for-incoming-webhooks

# Webhooks de produccion (Test URL vs Production URL en n8n)
N8N_WEBHOOK_WELCOME_EMAIL=https://your-n8n.com/webhook/send-welcome-email
N8N_WEBHOOK_CONTACT_FORM=https://your-n8n.com/webhook/contact-form
N8N_WEBHOOK_PAYMENT=https://your-n8n.com/webhook/process-payment
N8N_WEBHOOK_REPORT=https://your-n8n.com/webhook/generate-report
N8N_WEBHOOK_VALIDATE_VAT=https://your-n8n.com/webhook/validate-vat
N8N_WEBHOOK_UPGRADE_PLAN=https://your-n8n.com/webhook/upgrade-plan
```

---

## 8. Casos de Uso Comunes

**1. Boton "Generar reporte" (Pattern C)**
```
Usuario click → POST /api/reports/generate
  → Crear n8n_events registro (pending)
  → n8n.trigger('generate-report', { eventId })
  → Respuesta inmediata con eventId
  → useReportGeneration(eventId) escucha Realtime
  → n8n procesa: genera PDF → sube a Storage → llama callback
  → Callback actualiza n8n_events (completed + pdfUrl)
  → Realtime notifica hook → UI muestra link de descarga
```

**2. Form de contacto (Pattern A)**
```
Submit form → POST /api/contact
  → n8n.trigger('contact-form', { name, email, message })
  → Respuesta 200 inmediata
  → n8n: guarda en Notion + envia email con template + notifica Slack
```

**3. Usuario upgrade de plan (Pattern A)**
```
Pago completado (Stripe webhook) → POST /api/webhooks/stripe
  → Verificar firma Stripe
  → Actualizar plan en Supabase
  → n8n.trigger('user-upgraded', { userId, plan, email })
  → n8n: actualiza Mailchimp + envia email bienvenida Pro + notifica Slack #ventas + crea tarea en Notion
```

**4. Cron n8n → Dashboard (Pattern D)**
```
n8n Cron (cada hora)
  → Scraping de datos / llamada a API externa
  → Transforma y limpia datos
  → HTTP Request → POST /api/n8n/sync-metrics
  → Next.js guarda en Supabase
  → Dashboard con ISR o Realtime muestra datos frescos
```

---

## Referencias

- `references/n8n-client.md` — Implementacion TypeScript completa + React hook
- `references/workflow-patterns.md` — Configuracion de workflows en n8n paso a paso
