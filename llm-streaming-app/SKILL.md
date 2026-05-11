---
name: llm-streaming-app
description: >
  Apps Next.js que combinan streaming LLM (SSE/AI SDK), Resend para email transaccional,
  html-to-image para compartir tarjetas y upsells Stripe one-time. Stack: Next.js 14+
  App Router + Vercel AI SDK / SSE custom + Resend + html-to-image + Stripe Checkout.
  Usar cuando: "SSE streaming", "Server-Sent Events", "streaming LLM Next.js", "AI SDK",
  "useChat", "streamText", "Resend email", "Resend template", "html-to-image",
  "share card", "tarjeta compartible", "upsell Stripe", "Stripe one-time payment",
  "Stripe Checkout".
  Do NOT use for: SaaS con suscripciones (usar saas-boilerplate), chat persistente
  multi-usuario (usar supabase-stack + realtime).
---

# LLM Streaming App

Stack confirmado en AstroLectura: Next.js 14 + SSE Ollama/Claude + Resend + html-to-image + 4 upsells Stripe.

## Cuándo este skill vs otros

| Necesidad | Skill |
|-----------|-------|
| App single-purpose con LLM + email + pago one-time | **este skill** |
| SaaS con suscripciones recurrentes | `saas-boilerplate` |
| Solo Claude API sin streaming | `claude-api` (global) |
| Solo email transaccional | usar Resend directo, ver sección 2 |

## 1. Streaming LLM con SSE

**Opción A — Vercel AI SDK (recomendado para Claude/OpenAI)**

```ts
// app/api/chat/route.ts
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    messages,
  });
  return result.toDataStreamResponse();
}
```

Cliente:
```tsx
'use client';
import { useChat } from 'ai/react';

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  return <>{messages.map(m => <div key={m.id}>{m.content}</div>)}</>;
}
```

**Opción B — SSE custom (para Ollama o providers sin SDK)**

```ts
// app/api/stream/route.ts
export async function POST(req: Request) {
  const { prompt } = await req.json();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const ollamaRes = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        body: JSON.stringify({ model: 'qwen2.5', prompt, stream: true }),
      });
      const reader = ollamaRes.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split('\n').filter(Boolean)) {
          const { response } = JSON.parse(line);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: response })}\n\n`));
        }
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
```

Cliente con EventSource:
```ts
const es = new EventSource('/api/stream', { withCredentials: false });
// Nota: EventSource no soporta POST. Para POST usar fetch + ReadableStream:
const res = await fetch('/api/stream', { method: 'POST', body: JSON.stringify({ prompt }) });
const reader = res.body!.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const text = decoder.decode(value);
  // parse "data: {...}\n\n"
}
```

**Gotchas críticos SSE en Vercel:**
- Edge runtime tiene timeout 30s (Hobby) / 300s (Pro). Si LLM tarda más, usar `export const maxDuration = 300` o mover a job queue.
- `Cache-Control: no-transform` evita que Cloudflare/Vercel re-bufferee.
- En Node runtime, NO usar `res.write()` con flush manual — ReadableStream maneja flush correcto.

## 2. Resend — email transaccional

Instalar: `npm i resend react-email @react-email/components`

Plantilla React Email:
```tsx
// emails/reading-result.tsx
import { Html, Body, Container, Heading, Text, Img } from '@react-email/components';

export default function ReadingResult({ name, reading }: { name: string; reading: string }) {
  return (
    <Html>
      <Body>
        <Container>
          <Heading>Hola {name}, esta es tu lectura</Heading>
          <Text>{reading}</Text>
        </Container>
      </Body>
    </Html>
  );
}
```

Envío:
```ts
import { Resend } from 'resend';
import ReadingResult from '@/emails/reading-result';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'Astro <noreply@astrolectura.com>',
  to: email,
  subject: 'Tu lectura está lista',
  react: ReadingResult({ name, reading }),
});
```

Dominio: añadir DNS records (SPF, DKIM) en Resend > Domains. Sin esto, todo va a spam.

## 3. html-to-image — share card

```ts
'use client';
import { toPng } from 'html-to-image';

async function generateShareCard(ref: HTMLDivElement) {
  const dataUrl = await toPng(ref, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: '#0a0a0a',
  });
  // Compartir o descargar
  const link = document.createElement('a');
  link.download = 'mi-lectura.png';
  link.href = dataUrl;
  link.click();
}
```

**Gotchas:**
- Web fonts custom no siempre se renderizan. Usar `font-display: block` + `await document.fonts.ready` antes de `toPng`.
- Imágenes externas requieren CORS habilitado o vendrán en blanco.
- iOS Safari tiene bugs con `toBlob`. Usar `toPng` + dataUrl.

## 4. Stripe — upsells one-time apilados

Patrón AstroLectura: 4 productos one-time en cascada ($199 → $127 → $99 → $79), no recurrentes.

Crear Checkout Session con price IDs:
```ts
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const session = await stripe.checkout.sessions.create({
  mode: 'payment', // one-time, NO 'subscription'
  line_items: [{ price: process.env.STRIPE_PRICE_MAIN, quantity: 1 }],
  success_url: `${origin}/upsell-1?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${origin}/cancel`,
  customer_email: email,
  metadata: { funnel_step: 'main' },
});

return Response.json({ url: session.url });
```

Webhook para confirmar pago:
```ts
const event = stripe.webhooks.constructEvent(
  await req.text(),
  req.headers.get('stripe-signature')!,
  process.env.STRIPE_WEBHOOK_SECRET!
);

if (event.type === 'checkout.session.completed') {
  const session = event.data.object;
  // Enviar email con Resend + desbloquear contenido
}
```

Ver `webhook-integration` para HMAC + idempotencia.

## 5. Scoring emocional / pregunta inicial

Patrón AstroLectura: pregunta de entrada se mapea a un emocional score (1-5) que orienta el prompt al LLM. Implementación simple:

```ts
const EMOTIONAL_MAP = {
  amor: { tone: 'cálido', focus: 'relaciones' },
  trabajo: { tone: 'estratégico', focus: 'carrera' },
  general: { tone: 'reflexivo', focus: 'vida' },
};

const systemPrompt = `Eres un tarotista. Tono: ${EMOTIONAL_MAP[category].tone}. Enfoque: ${EMOTIONAL_MAP[category].focus}.`;
```

## Environment variables

```bash
ANTHROPIC_API_KEY=...
OLLAMA_BASE_URL=http://localhost:11434  # solo si self-hosted
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@dominio.com
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MAIN=price_...
STRIPE_PRICE_UPSELL_1=price_...
```

## Verificación

```bash
# Stream funciona
curl -N -X POST http://localhost:3000/api/stream -d '{"prompt":"hola"}' -H 'content-type: application/json'

# Resend domain verificado
curl https://api.resend.com/domains -H "Authorization: Bearer $RESEND_API_KEY"

# Stripe webhook signature
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Referencias

- AI SDK: https://ai-sdk.dev/docs
- Resend: https://resend.com/docs
- html-to-image: https://github.com/bubkoo/html-to-image
- AstroLectura: `apps/astro-reader` (scaffold 2026-04-08)
