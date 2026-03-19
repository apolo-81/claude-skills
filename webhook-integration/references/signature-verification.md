# Webhook Signature Verification

Verificar la firma es la primera línea de defensa: garantiza que el payload viene del servicio legítimo y no fue alterado en tránsito. Sin esta verificación, cualquier atacante que conozca tu URL puede enviar eventos falsos (ej: simular un pago completado).

**Regla de oro:** Lee el body como texto crudo (`request.text()`) ANTES de cualquier parseo. El cuerpo usado para calcular la firma es el stream de bytes tal como llegó.

---

## Patrón HMAC Genérico (reutilizable)

La mayoría de servicios usan HMAC-SHA256. Este helper cubre cualquier servicio que siga el patrón estándar.

```typescript
// lib/webhooks/verify-hmac.ts
import { createHmac, timingSafeEqual } from 'crypto'

interface HmacVerifyOptions {
  rawBody: string
  signature: string           // El valor del header de firma
  secret: string              // Tu webhook secret
  algorithm?: string          // default: 'sha256'
  prefix?: string             // ej: 'sha256=' que algunos servicios anteponen
}

export function verifyHmacSignature({
  rawBody,
  signature,
  secret,
  algorithm = 'sha256',
  prefix = '',
}: HmacVerifyOptions): boolean {
  const expected = createHmac(algorithm, secret)
    .update(rawBody, 'utf8')
    .digest('hex')

  const signatureWithoutPrefix = signature.startsWith(prefix)
    ? signature.slice(prefix.length)
    : signature

  try {
    // timingSafeEqual previene timing attacks — SIEMPRE usar esto, nunca ===
    return timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(signatureWithoutPrefix, 'hex')
    )
  } catch {
    // Longitudes diferentes lanzan excepción en timingSafeEqual
    return false
  }
}
```

---

## Stripe

Stripe usa su propio SDK que maneja timestamp anti-replay además de HMAC.

```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    // constructEvent verifica HMAC-SHA256 Y que el timestamp no tenga más de 5 minutos
    // Esto previene replay attacks donde alguien reutiliza un payload válido capturado
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[webhook/stripe] Verification failed:', message)
    return NextResponse.json({ error: `Webhook verification failed: ${message}` }, { status: 400 })
  }

  // El evento está verificado — procesar
  console.log(`[webhook/stripe] Received: ${event.type} (id: ${event.id})`)

  return NextResponse.json({ received: true })
}

// Variables requeridas:
// STRIPE_SECRET_KEY=sk_live_...
// STRIPE_WEBHOOK_SECRET=whsec_...  (de Stripe Dashboard > Webhooks > tu endpoint)
```

**Obtener el secret:** Stripe Dashboard → Developers → Webhooks → selecciona tu endpoint → "Signing secret".
En local con Stripe CLI: `stripe listen` imprime el secret temporal en la consola.

---

## GitHub

GitHub firma con HMAC-SHA256 y antepone `sha256=` al valor del header.

```typescript
// app/api/webhooks/github/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyHmacSignature } from '@/lib/webhooks/verify-hmac'

const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-hub-signature-256')
  const eventType = request.headers.get('x-github-event')
  const deliveryId = request.headers.get('x-github-delivery')

  if (!signature) {
    return NextResponse.json({ error: 'Missing x-hub-signature-256' }, { status: 400 })
  }

  const isValid = verifyHmacSignature({
    rawBody,
    signature,
    secret: GITHUB_WEBHOOK_SECRET,
    prefix: 'sha256=',
  })

  if (!isValid) {
    console.warn(`[webhook/github] Invalid signature for delivery ${deliveryId}`)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const payload = JSON.parse(rawBody)
  console.log(`[webhook/github] Event: ${eventType}, delivery: ${deliveryId}`)

  switch (eventType) {
    case 'push':
      // payload.ref, payload.commits, payload.repository.full_name
      break
    case 'pull_request':
      // payload.action (opened, closed, merged), payload.pull_request
      break
    case 'issues':
      // payload.action, payload.issue
      break
  }

  return NextResponse.json({ received: true })
}

// Variables requeridas:
// GITHUB_WEBHOOK_SECRET=tu-secreto-configurado-en-github
```

**Configurar en GitHub:** Repository → Settings → Webhooks → Add webhook → Payload URL + Secret + eventos a escuchar.

---

## Clerk (svix)

Clerk usa la librería svix para firmar webhooks con un sistema de timestamps anti-replay.

```bash
npm install svix
```

```typescript
// app/api/webhooks/clerk/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { WebhookEvent } from '@clerk/nextjs/server'

const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  // svix requiere estos tres headers para verificar
  const svixId = request.headers.get('svix-id')
  const svixTimestamp = request.headers.get('svix-timestamp')
  const svixSignature = request.headers.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  let event: WebhookEvent
  try {
    const wh = new Webhook(CLERK_WEBHOOK_SECRET)
    event = wh.verify(rawBody, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent
  } catch (err) {
    console.error('[webhook/clerk] Verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'user.created':
      // event.data: { id, email_addresses, first_name, last_name, ... }
      await handleUserCreated(event.data)
      break
    case 'user.updated':
      await handleUserUpdated(event.data)
      break
    case 'user.deleted':
      await handleUserDeleted(event.data)
      break
  }

  return NextResponse.json({ received: true })
}

async function handleUserCreated(data: WebhookEvent['data']) {
  // Sincronizar con tu base de datos
}
async function handleUserUpdated(data: WebhookEvent['data']) {}
async function handleUserDeleted(data: WebhookEvent['data']) {}

// Variables requeridas:
// CLERK_WEBHOOK_SECRET=whsec_...  (de Clerk Dashboard > Webhooks > tu endpoint)
```

---

## Shopify

Shopify usa HMAC-SHA256 con el body y el shared secret, codificado en Base64.

```typescript
// app/api/webhooks/shopify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'

const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET!

function verifyShopifySignature(rawBody: string, signature: string): boolean {
  const expected = createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
    .update(rawBody, 'utf8')
    .digest('base64') // Shopify usa base64, no hex

  try {
    return timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature)
    )
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-shopify-hmac-sha256')
  const topic = request.headers.get('x-shopify-topic')
  const shop = request.headers.get('x-shopify-shop-domain')

  if (!signature) {
    return NextResponse.json({ error: 'Missing HMAC header' }, { status: 400 })
  }

  if (!verifyShopifySignature(rawBody, signature)) {
    console.warn(`[webhook/shopify] Invalid signature from ${shop}`)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const payload = JSON.parse(rawBody)
  console.log(`[webhook/shopify] Topic: ${topic}, shop: ${shop}`)

  // topics comunes: orders/create, orders/paid, customers/create, products/update
  return NextResponse.json({ received: true })
}
```

---

## Twilio

Twilio firma usando su AuthToken y la URL completa del request (no solo el body).

```bash
npm install twilio
```

```typescript
// app/api/webhooks/twilio/route.ts
import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!

export async function POST(request: NextRequest) {
  // Twilio envía form-urlencoded, no JSON
  const rawBody = await request.text()
  const twilioSignature = request.headers.get('x-twilio-signature')

  if (!twilioSignature) {
    return NextResponse.json({ error: 'Missing Twilio signature' }, { status: 400 })
  }

  // La URL debe ser exactamente la que Twilio tiene configurada (incluyendo https://)
  const url = `https://${request.headers.get('host')}${request.nextUrl.pathname}`

  // Parsear el form body para pasarlo al validador
  const params = Object.fromEntries(new URLSearchParams(rawBody))

  const isValid = twilio.validateRequest(TWILIO_AUTH_TOKEN, twilioSignature, url, params)

  if (!isValid) {
    console.warn('[webhook/twilio] Invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // params.From, params.To, params.Body (para SMS)
  // params.CallSid, params.CallStatus (para llamadas)
  console.log(`[webhook/twilio] SMS from ${params.From}: ${params.Body}`)

  // Twilio espera TwiML como respuesta para SMS/llamadas
  return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
    headers: { 'Content-Type': 'text/xml' },
  })
}

// Variables requeridas:
// TWILIO_AUTH_TOKEN=tu-auth-token (de Twilio Console)
```

---

## Checklist de Seguridad para Verificación

- Siempre usar `timingSafeEqual` — nunca `===` para comparar firmas (previene timing attacks)
- Leer body con `request.text()` antes de cualquier parseo
- Rechazar inmediatamente si falta el header de firma (status 400)
- Loguear intentos fallidos con IP/timestamp para detectar ataques
- Rotar el webhook secret si sospechas que fue comprometido (los servicios permiten rotar sin downtime)
- Verificar timestamps cuando el servicio los incluya (Stripe, svix) para prevenir replay attacks
