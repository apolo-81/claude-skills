# Webhook Handlers — Stripe, Idempotency, Queue

## Stripe Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('[webhook/stripe] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const alreadyProcessed = await checkWebhookProcessed(event.id)
  if (alreadyProcessed) {
    return NextResponse.json({ received: true })
  }

  processWebhookAsync(event).catch(console.error)
  return NextResponse.json({ received: true })
}
```

## Idempotency

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
    webhook_id: webhookId, service, processed_at: new Date().toISOString(),
  })
}
```

```sql
create table processed_webhooks (
  id uuid primary key default gen_random_uuid(),
  webhook_id text unique not null,
  service text not null,
  processed_at timestamptz not null default now()
);
create index on processed_webhooks (webhook_id);
```

## Async Processing

```typescript
async function processWebhookAsync(event: Stripe.Event) {
  const supabase = createClient()

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      await supabase.from('orders').update({ status: 'paid' })
        .eq('stripe_payment_intent_id', paymentIntent.id)
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

## Queue Pattern (MVP con Supabase)

```typescript
// lib/webhooks/queue.ts
import { createClient } from '@/lib/supabase/server'

type JobStatus = 'pending' | 'processing' | 'done' | 'failed'

export async function enqueueWebhook(
  service: string, eventType: string, payload: unknown
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
