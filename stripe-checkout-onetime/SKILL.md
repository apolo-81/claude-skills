---
name: stripe-checkout-onetime
description: >
  Stripe Checkout para pagos one-time (infoproductos, lecturas, propuestas) y
  upsells post-checkout sin suscripciones: hosted Checkout Session, payment_intent,
  webhook handler con verificación HMAC, idempotencia con event.id, upsells
  one-click con saved payment method, refunds parciales, MXN + USD multi-currency,
  metadata para attribution. Para SaaS con subs usar saas-boilerplate.
  Usar cuando: "Stripe Checkout", "pago one-time", "Stripe one-time", "checkout session",
  "payment intent", "webhook Stripe", "upsell con Stripe", "OTO Stripe", "one-click upsell",
  "stripe-node", "PaymentMethod reuse", "Stripe MXN", "Stripe refund", "metadata Stripe",
  "checkout.session.completed", "tarjeta guardada Stripe", "stacked upsells".
  Triggers in English: "Stripe one-time payment", "stacked upsells Stripe",
  "post-purchase upsell", "saved card upsell", "Stripe webhook handler",
  "Checkout Session", "off-session payment", "Stripe Connect", "Stripe MXN currency".
  Do NOT use for: SaaS con suscripciones recurrentes (usar saas-boilerplate),
  marketplace multi-seller con split (usar Stripe Connect directo), facturación
  CFDI/SAT (no cubierto — usar Facturapi/Solucione Inteligencia).
---

# Stripe Checkout One-Time

Stack confirmado: AstroLectura ($199 front + upsells $127/$99/$79), infoproduct-funnel LOW2HIGH, propuestas cliente.

## Cuándo usar este vs alternativas

| Caso | Solución |
|---|---|
| Lectura/curso/ebook one-time | **Checkout Session hosted (este skill)** |
| Stack de upsells después del primer pago | **Este + PaymentIntent off-session** |
| Subscripción mensual/anual | `saas-boilerplate` |
| Marketplace con split a vendor | Stripe Connect (no aquí) |
| Pago en MXN con OXXO/SPEI | Checkout con `payment_method_types: ['card', 'oxxo']` |

## Setup base — Checkout Session

```ts
// app/api/checkout/route.ts
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { email, productId } = await req.json();

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',                     // ← one-time, no subscription
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'mxn',
        product_data: { name: 'Lectura Astro Personalizada' },
        unit_amount: 19900,              // ← centavos: 199.00 MXN
      },
      quantity: 1,
    }],
    customer_email: email,
    success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout?canceled=1`,
    metadata: {
      productId,
      utm_source: req.headers.get('referer') ?? '',
      lead_id: leadId,                   // ← para attribution
    },
    payment_intent_data: {
      setup_future_usage: 'off_session', // ← guarda card para upsells
    },
  });

  return Response.json({ url: session.url });
}
```

**Gotcha**: `setup_future_usage: 'off_session'` es lo que habilita upsells one-click. Sin esto, Stripe no guarda PaymentMethod reutilizable.

## Thank-you + verificación

```ts
// app/thank-you/page.tsx
const session = await stripe.checkout.sessions.retrieve(searchParams.session_id, {
  expand: ['payment_intent', 'customer'],
});

if (session.payment_status !== 'paid') redirect('/');
// session.amount_total, session.metadata.productId, etc.
```

**Nunca** confíes solo en thank-you para mark-paid en DB → puede no cargar (red, navegación). Verdad = webhook.

## Webhook handler

```ts
// app/api/webhooks/stripe/route.ts
export const config = { api: { bodyParser: false } };  // raw body para HMAC

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')!;
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return new Response(`Webhook signature failed: ${err.message}`, { status: 400 });
  }

  // Idempotencia: event.id único, guarda en DB para skip duplicados
  if (await db.processedEvents.exists(event.id)) return new Response('ok');

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await db.orders.create({
        sessionId: session.id,
        email: session.customer_email!,
        amount: session.amount_total,
        productId: session.metadata!.productId,
        customerId: session.customer as string,
        paymentMethodId: (session.payment_intent as Stripe.PaymentIntent).payment_method as string,
      });
      // Trigger Resend + analytics server-side aquí
      break;
    }
    case 'payment_intent.payment_failed': /* ... */ break;
    case 'charge.refunded': /* ... */ break;
  }

  await db.processedEvents.insert(event.id);
  return new Response('ok');
}
```

Stripe reintenta hasta 3 días si no responde 2xx en 30s. Idempotencia con `event.id` es **crítica**.

## Upsells one-click post-checkout

Patrón AstroLectura: tras pagar front $199, mostrar 4 upsells en orden. Cada `Aceptar` cobra con la **misma card** sin nuevo checkout.

```ts
// app/api/upsell/route.ts
const { customerId, paymentMethodId, amount, productId } = await req.json();

const pi = await stripe.paymentIntents.create({
  amount,
  currency: 'mxn',
  customer: customerId,
  payment_method: paymentMethodId,
  off_session: true,            // ← clave: no requiere interacción
  confirm: true,
  metadata: { productId, upsell_step: '1' },
});

if (pi.status === 'succeeded') {
  // Mark sold + siguiente upsell o thank-you final
}
```

**Gotcha 3DSecure**: si banco pide autenticación, `confirm: true` falla con `requires_action`. Manejo:

```ts
if (pi.status === 'requires_action') {
  return Response.json({ requiresAction: true, clientSecret: pi.client_secret });
  // Cliente usa stripe.confirmCardPayment(clientSecret) en el browser
}
```

México: 3DSecure obligatorio para cards CDMX en muchos bancos. Esperar ~10% de upsells caigan en `requires_action`.

## Refunds

```ts
// Full refund
await stripe.refunds.create({ payment_intent: pi.id });

// Parcial
await stripe.refunds.create({ payment_intent: pi.id, amount: 5000 });  // $50 MXN
```

## Multi-currency

```ts
line_items: [{
  price_data: {
    currency: countryCode === 'MX' ? 'mxn' : 'usd',
    unit_amount: countryCode === 'MX' ? 19900 : 1499,
    /* ... */
  }
}],
```

Stripe convierte automáticamente al settle. Cobrar en moneda local **aumenta** conversión ~15-20%.

## Metadata + attribution

Usa `metadata` para todo lo que necesites recuperar después: `lead_id`, `utm_*`, `affiliate_code`, `upsell_step`, `funnel_id`. Max 50 keys, 500 chars cada uno.

```ts
metadata: {
  lead_id: 'lead_abc',
  utm_source: 'meta',
  utm_campaign: 'fundadores',
  funnel: 'tarot-low2high-v3',
}
```

En webhook: `event.data.object.metadata.utm_source` → push a CAPI / GA4 server-side.

## Eventos a trackear en webhook → analytics

| Stripe event | GA4 / Meta event |
|---|---|
| `checkout.session.completed` | `purchase` (front-end) |
| `payment_intent.succeeded` (upsell) | `purchase` (upsell, mismo `transaction_id` no — usa pi.id) |
| `charge.refunded` | `refund` (GA4 ecommerce) |
| `payment_intent.payment_failed` | custom event `payment_failed` |

Ver `tracking-analytics` para integración CAPI / Measurement Protocol con `event_id = pi.id`.

## Variables de entorno

```bash
STRIPE_SECRET_KEY=sk_live_...            # ⚠️ server-only
STRIPE_WEBHOOK_SECRET=whsec_...          # ⚠️ server-only
NEXT_PUBLIC_STRIPE_PUBLISHABLE=pk_live_...  # OK público
```

## Anti-patrones

- ❌ Marcar orden como pagada desde thank-you (sin webhook). Si falla la red al volver, perdiste el cobro registrado.
- ❌ Olvidar `setup_future_usage: 'off_session'` y querer upsells después → tendrás que mandar al usuario a otro checkout.
- ❌ Webhook sin verificación HMAC (`stripe.webhooks.constructEvent`).
- ❌ Webhook sin idempotencia → cada reintento crea orden duplicada.
- ❌ No manejar `requires_action` en upsells → México perderás ~10% de conversiones.
- ❌ Usar `amount` en pesos enteros — Stripe espera **centavos**. $199 MXN = `19900`.

## Verificación local

```bash
# CLI: forward webhooks a localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Devuelve whsec_... → usa como STRIPE_WEBHOOK_SECRET en dev

# Disparar evento de prueba
stripe trigger checkout.session.completed
```

## Referencias

- Checkout sessions: https://docs.stripe.com/api/checkout/sessions
- One-click upsells (off-session PI): https://docs.stripe.com/payments/save-during-payment
- Webhooks + HMAC: https://docs.stripe.com/webhooks/signatures
- México (OXXO, SPEI): https://docs.stripe.com/payments/oxxo

## Related Skills

- `infoproduct-funnel` — value ladders donde apilar upsells.
- `tracking-analytics` — disparar Purchase a GA4/Meta desde webhook con `event_id`.
- `llm-streaming-app` — combina con SSE para checkout dinámico.
- `webhook-integration` — patrones generales de HMAC + idempotencia (Stripe es caso particular).
- `email-templates-builder` — confirmación post-pago via Resend.
