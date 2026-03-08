---
name: webhook-integration
description: >
  Use when integrating webhooks in web apps or n8n workflows: receiving webhooks
  from external services, sending webhooks to n8n or other systems, verifying webhook
  signatures, handling retry logic, or setting up event-driven integrations. Trigger
  for: "webhook", "Stripe webhook", "GitHub webhook", "n8n webhook trigger", "recibir
  eventos de", "integrar con", "notificación de pago", "payment webhook", "webhook
  signature verification", "HMAC", "event-driven", "trigger de automatización",
  "conectar mi app con n8n", "cuando ocurra X disparar Y", queue patterns, idempotency.
---

# Webhook Integration

## Overview y Casos de Uso

Un webhook es una llamada HTTP que un servicio externo hace a tu app cuando ocurre un evento. Elige el mecanismo correcto:

| Mecanismo | Cuándo usarlo |
|-----------|---------------|
| **Webhook** | El servicio externo inicia la comunicación (Stripe, GitHub, Clerk) |
| **Polling** | El servicio no soporta webhooks; toleras latencia de segundos/minutos |
| **WebSocket** | Necesitas comunicación bidireccional en tiempo real (chat, juegos) |

Los 3 flujos principales en este stack:

1. **Recibir** — Stripe/GitHub/Clerk llaman a `POST /api/webhooks/[service]` en Next.js
2. **Enviar** — Tu app dispara la URL Webhook Trigger de n8n cuando ocurre un evento
3. **Exponer** — Next.js publica endpoints que n8n consume via HTTP Request node

---

## 1. Recibir Webhooks en Next.js

### Estructura de ruta

```
app/api/webhooks/[service]/route.ts
```

Usar una ruta dinámica permite centralizar lógica común (logging, rate limiting) y agregar nuevos servicios sin crear archivos nuevos.

### Por qué `request.text()` antes de parsear

La verificación HMAC requiere el body **exactamente como llegó** (bytes originales). Si llamas `request.json()` primero, pierdes el string original y la firma no coincide nunca.

```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  // 1. Leer body como texto crudo — SIEMPRE antes de parsear
  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  // 2. Verificar firma — rechaza si falla
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('[webhook/stripe] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // 3. Verificar idempotencia antes de procesar
  const alreadyProcessed = await checkWebhookProcessed(event.id)
  if (alreadyProcessed) {
    return NextResponse.json({ received: true }) // 200 sin reprocesar
  }

  // 4. Responder 200 inmediatamente, procesar en background
  processWebhookAsync(event).catch(console.error)

  return NextResponse.json({ received: true })
}
```

### Idempotencia — webhooks llegan duplicados

Los servicios reenvían si no reciben 200 a tiempo (timeouts de red, reinicios de servidor). Sin idempotencia, un pago puede procesarse dos veces.

```typescript
// lib/webhooks/idempotency.ts
import { createClient } from '@/lib/supabase/server'

export async function checkWebhookProcessed(webhookId: string): Promise<boolean> {
  const supabase = createClient()
  const { data } = await supabase
    .from('processed_webhooks')
    .select('id')
    .eq('webhook_id', webhookId)
    .single()
  return !!data
}

export async function markWebhookProcessed(webhookId: string, service: string) {
  const supabase = createClient()
  await supabase.from('processed_webhooks').insert({
    webhook_id: webhookId,
    service,
    processed_at: new Date().toISOString(),
  })
}
```

```sql
-- Supabase migration
create table processed_webhooks (
  id uuid primary key default gen_random_uuid(),
  webhook_id text unique not null,
  service text not null,
  processed_at timestamptz not null default now()
);
create index on processed_webhooks (webhook_id);
-- Limpiar registros de más de 30 días (opcional, via pg_cron)
```

### Responder rápido, procesar async

Stripe cancela y reintenta si no recibe 200 en 30 segundos. GitHub en 10 segundos.

```typescript
async function processWebhookAsync(event: Stripe.Event) {
  const supabase = createClient()

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      await supabase.from('orders').update({ status: 'paid' })
        .eq('stripe_payment_intent_id', paymentIntent.id)
      // Notificar a n8n para enviar email de confirmación
      await sendToN8n('payment.completed', {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        customerId: paymentIntent.customer,
      })
      break
    }
    default:
      console.log(`[webhook/stripe] Unhandled event type: ${event.type}`)
  }

  await markWebhookProcessed(event.id, 'stripe')
}
```

---

## 2. Enviar Webhooks a n8n

### Configurar el Webhook Trigger en n8n

1. Agrega nodo **Webhook** al workflow
2. Método: `POST`, Path: elige un nombre descriptivo (ej: `payment-completed`)
3. Autenticación: **Header Auth** — Header Name: `x-api-key`, Header Value: un secreto fuerte
4. Copia la **Production URL** (la Test URL solo funciona cuando el workflow está en modo test)
5. Activa el workflow antes de probar en producción

### Helper reutilizable con retry

```typescript
// lib/webhooks/send-to-n8n.ts
const N8N_WEBHOOK_BASE = process.env.N8N_WEBHOOK_BASE_URL! // ej: https://n8n.tudominio.com/webhook
const N8N_API_KEY = process.env.N8N_API_KEY!

interface WebhookPayload {
  event: string
  data: Record<string, unknown>
  timestamp: string
  id: string
}

export async function sendToN8n(
  event: string,
  data: Record<string, unknown>,
  path?: string
): Promise<void> {
  const webhookPath = path ?? event.replace('.', '-') // payment.completed → payment-completed
  const url = `${N8N_WEBHOOK_BASE}/${webhookPath}`

  const payload: WebhookPayload = {
    event,
    data,
    timestamp: new Date().toISOString(),
    id: crypto.randomUUID(),
  }

  const maxAttempts = 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': N8N_API_KEY,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10_000), // 10 segundos
      })

      if (!response.ok) {
        throw new Error(`n8n responded ${response.status}: ${await response.text()}`)
      }

      console.log(`[n8n] Sent event "${event}" (attempt ${attempt})`)
      return
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      console.warn(`[n8n] Attempt ${attempt}/${maxAttempts} failed for "${event}":`, lastError.message)

      if (attempt < maxAttempts) {
        // Exponential backoff: 1s, 2s, 4s
        await new Promise(r => setTimeout(r, 1000 * 2 ** (attempt - 1)))
      }
    }
  }

  // Loguear fallo definitivo — decide si quieres lanzar o solo registrar
  console.error(`[n8n] Failed to send event "${event}" after ${maxAttempts} attempts:`, lastError)
  // No lanzar excepción por defecto para no bloquear el flujo principal
  // throw lastError
}
```

Variables de entorno requeridas:

```bash
N8N_WEBHOOK_BASE_URL=https://n8n.tudominio.com/webhook
N8N_API_KEY=un-secreto-largo-y-aleatorio
```

---

## 3. n8n llama a tu app (HTTP Request node)

Crea endpoints en Next.js que n8n puede invocar para ejecutar acciones en tu app.

```typescript
// app/api/actions/[action]/route.ts
import { NextRequest, NextResponse } from 'next/server'

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY!

function verifyApiKey(request: NextRequest): boolean {
  return request.headers.get('x-api-key') === INTERNAL_API_KEY
}

export async function POST(
  request: NextRequest,
  { params }: { params: { action: string } }
) {
  if (!verifyApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  switch (params.action) {
    case 'send-welcome-email': {
      // n8n procesó el CRM y notifica que el email fue enviado
      await markUserWelcomeEmailSent(body.userId)
      return NextResponse.json({ success: true })
    }
    case 'update-subscription': {
      await updateUserSubscription(body.userId, body.plan)
      return NextResponse.json({ success: true })
    }
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }
}
```

En n8n: HTTP Request node → Method: POST → URL: `https://tuapp.com/api/actions/send-welcome-email` → Headers: `x-api-key: {{ $env.INTERNAL_API_KEY }}`

---

## 4. Queue Pattern para Webhooks Críticos

Usa cola cuando el procesamiento puede tardar más de 10-30 segundos o necesitas garantías de entrega.

```typescript
// lib/webhooks/queue.ts — MVP con Supabase
import { createClient } from '@/lib/supabase/server'

type JobStatus = 'pending' | 'processing' | 'done' | 'failed'

export async function enqueueWebhook(
  service: string,
  eventType: string,
  payload: unknown
): Promise<string> {
  const supabase = createClient()
  const { data } = await supabase
    .from('webhook_jobs')
    .insert({ service, event_type: eventType, payload, status: 'pending' })
    .select('id')
    .single()
  return data!.id
}
```

```sql
create table webhook_jobs (
  id uuid primary key default gen_random_uuid(),
  service text not null,
  event_type text not null,
  payload jsonb not null,
  status text not null default 'pending',
  attempts int not null default 0,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);
```

Para producción con alta carga, usa [Trigger.dev](https://trigger.dev) o Upstash QStash en lugar de polling de Supabase.

---

## 5. Testing y Debugging

### Stripe CLI (desarrollo local)

```bash
# Instalar
brew install stripe/stripe-cli/stripe

# Autenticar
stripe login

# Reenviar eventos a localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Disparar evento de prueba
stripe trigger payment_intent.succeeded
```

### ngrok para exponer localhost a n8n

```bash
ngrok http 3000
# Copia la URL https://xxxx.ngrok.io y úsala como webhook URL en n8n durante desarrollo
```

### Simular webhooks con curl

```bash
curl -X POST http://localhost:3000/api/webhooks/generic \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: tu-secreto" \
  -d '{"event": "user.created", "data": {"id": "123", "email": "test@example.com"}}'
```

### Logging útil

Loguea siempre: `event_id`, `event_type`, `service`, `timestamp`. Nunca loguees: tokens, passwords, números de tarjeta, datos personales completos.

---

## 6. Flujo Completo: Stripe + Next.js + n8n

```
Stripe ──POST──> /api/webhooks/stripe ──verifica firma──> procesa pago
                                                        └──sendToN8n──> n8n workflow
                                                                        ├── Envía email confirmación
                                                                        └── Actualiza CRM
```

**Flujo formulario → n8n:**

```typescript
// app/api/contact/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json()
  // Validar con zod
  await sendToN8n('form.submitted', {
    name: body.name,
    email: body.email,
    message: body.message,
    source: 'contact-form',
  }, 'contact-form-submitted')
  return NextResponse.json({ success: true })
}
```

---

## 7. Security Checklist

- Verifica la firma de cada webhook — sin esto cualquiera puede enviar eventos falsos
- Usa HTTPS siempre en producción — HTTP expone el payload y la firma
- Guarda todos los secretos en variables de entorno, nunca en código
- No loguees el payload completo — puede contener datos de tarjetas o PII
- Agrega rate limiting al endpoint webhook (ej: 100 req/min por IP con `@upstash/ratelimit`)
- Responde 200 solo si la firma es válida — responder 200 a todo crea falsa seguridad
- Implementa idempotencia antes de ir a producción
- Revisa los rangos de IP permitidos del servicio (Stripe publica los suyos) y configura allowlist en tu firewall/CDN si es posible

---

## Referencias

- `references/signature-verification.md` — Verificación HMAC para Stripe, GitHub, Clerk, Shopify, Twilio y genérico
- `references/n8n-patterns.md` — Configuración de nodos n8n, estructuras de payload, manejo de errores
