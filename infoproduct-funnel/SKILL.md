---
name: infoproduct-funnel
description: >
  Designs and implements complete infoproduct funnels with low-ticket front-end,
  stacked upsells/downsells, value ladder pricing, post-checkout flow, share cards,
  email nurture, and tracking (GA4 + Meta Pixel). Applies LOW2HIGH methodology:
  low-ticket builds trust → high-ticket converts. Stack: Next.js 14+ App Router +
  Stripe Checkout one-time + Resend transactional + html-to-image share + GA4/Pixel.
  Usar cuando: "infoproducto", "funnel de ventas", "upsell apilado", "value ladder",
  "low ticket", "high ticket", "downsell", "post-checkout", "tarot funnel",
  "AstroLectura", "share card", "tarjeta compartible", "GA4 ecommerce",
  "Meta Pixel Purchase", "Stripe Checkout one-time", "carrito embudo", "thank-you page
  con upsell", "pre-launch pricing", "LOW2HIGH". Triggers in English: "info-product
  funnel", "stacked upsells", "tripwire", "front-end offer", "back-end offer",
  "value ladder", "OTO one-time offer", "post-purchase upsell", "infoproduct launch".
  Do NOT use for: SaaS subscriptions (use saas-boilerplate), pure transactional
  streaming UI (use llm-streaming-app), email-only campaigns without commerce
  (use brevo-marketing or market-emails). Output language: match the user's input.
---

# Infoproduct Funnel

End-to-end funnel for digital infoproducts where low-ticket front-end pays for ads and high-ticket back-end produces profit. Pattern proven in AstroLectura tarot app (4 upsells stacked $199/$127/$99/$79) and aligned with the LOW2HIGH methodology archived in `Ventas de Impacto/LOW2HIGH/REPORTE_LOW2HIGH.md`.

## Stack

- **Frontend:** Next.js 14+ App Router + Tailwind + shadcn/ui
- **Payments:** Stripe Checkout, one-time prices (no subscriptions)
- **Email:** Resend (transactional, post-purchase)
- **Share card:** `html-to-image` for downloadable JPG/PNG
- **Streaming content (when relevant):** Vercel AI SDK / SSE
- **Tracking:** GA4 + Meta Pixel + (optional) Plausible

## Funnel Topology

```
Cold traffic (ad)
   ↓
Landing → email gate (optional)
   ↓
Front-end product ($7 – $47)  ← "amigable" / tripwire
   ↓ (purchase)
Thank-you / processing
   ↓
Upsell 1 ($97 – $197)         ← profit eslabón 1
   ↓ accept / decline
Downsell 1 ($47 – $97)        ← rescue
   ↓
Upsell 2 ($197 – $497)        ← profit eslabón 2
   ↓ accept / decline
(optional) Downsell 2
   ↓
Final thank-you + share card + nurture email
   ↓ (over days/weeks)
High-ticket invite ($997 – $4997)
```

Every step has its own URL → analytics per step → drop-off optimization.

## Pricing — Value Ladder (LOW2HIGH-aligned)

| Tier | Price band | Purpose |
|---|---|---|
| Bait (free) | $0 | Lead capture (optional) |
| Front-End | $7 – $97 | Tripwire; goal = breakeven on ads |
| Middle-End | $197 – $497 | Profit eslabón |
| Back-End | $997 – $2.497 | Profit eslabón mayor |
| High-Ticket | $4.997 + | Done-with-you / mentoría |
| Continuity | $$$/mo, $$$$/mo | Recurring (separate skill: saas-boilerplate) |

**Pre-launch pricing pattern** (LOW2HIGH):
- Preventa $9.95 (agotado / cupos limitados)
- General $27 (hasta agotar)
- VIP $39 (deadline absoluto)
+ countdown visible + CTA "Quiero mi lugar"

## Stripe Checkout — One-Time Configuration

```ts
// app/api/checkout/route.ts
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const { priceId, offerId, email } = await req.json()

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',                           // one-time, NOT 'subscription'
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: email,
    success_url: `${process.env.NEXT_PUBLIC_URL}/upsell-1?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/checkout?canceled=1`,
    metadata: { offerId, funnelStep: 'front-end' },
    payment_intent_data: {
      setup_future_usage: 'off_session',       // KEY: allow charging again w/o new card
    },
  })

  return Response.json({ url: session.url })
}
```

`setup_future_usage: 'off_session'` is the magic that enables one-click upsells without re-entering the card.

## Post-Purchase Upsell — One-Click

```ts
// app/api/upsell/charge/route.ts
const intent = await stripe.paymentIntents.create({
  amount: 19900,                             // $199 in cents
  currency: 'usd',
  customer: customerId,                      // pulled from session
  payment_method: paymentMethodId,           // from previous session
  off_session: true,
  confirm: true,
  metadata: { offerId: 'upsell-1', funnelStep: 'middle-end' },
})
```

Show result immediately, then route to upsell 2 or thank-you.

## Page Architecture (App Router)

```
app/
├── (funnel)/
│   ├── page.tsx                    # landing
│   ├── checkout/page.tsx           # front-end form
│   ├── upsell-1/page.tsx           # post-purchase 1
│   ├── upsell-2/page.tsx           # post-purchase 2
│   ├── downsell-1/page.tsx
│   ├── thank-you/page.tsx          # final, share card here
│   └── (high-ticket)/
│       └── application/page.tsx    # mini-launch entry
├── api/
│   ├── checkout/route.ts
│   ├── upsell/charge/route.ts
│   ├── share-card/route.ts         # html-to-image generation
│   └── webhook/stripe/route.ts     # verify + persist + email
└── lib/
    ├── stripe.ts
    ├── tracking.ts                 # GA4 + Pixel helpers
    └── offers.ts                   # offer catalog
```

## Share Card Pattern (AstroLectura)

```tsx
// app/thank-you/ShareCard.tsx — rendered to image
'use client'
import { useRef } from 'react'
import * as htmlToImage from 'html-to-image'

export function ShareCard({ result }: { result: string }) {
  const ref = useRef<HTMLDivElement>(null)

  async function download() {
    if (!ref.current) return
    const dataUrl = await htmlToImage.toJpeg(ref.current, { quality: 0.95, pixelRatio: 2 })
    const link = document.createElement('a')
    link.download = 'mi-resultado.jpg'
    link.href = dataUrl
    link.click()
  }

  return (
    <>
      <div ref={ref} className="w-[1080px] h-[1920px] bg-gradient-to-b ...">
        {/* the visual card */}
      </div>
      <button onClick={download}>Descargar imagen</button>
    </>
  )
}
```

Why: shareable on stories → free social traffic → top-of-funnel for the next launch.

## Email Sequence (Post-Purchase)

Mandatory:
1. **Receipt + access** (instant, transactional via Resend) — *not* a marketing email.
2. **Onboarding** (T+1h) — first action / first quick win.
3. **Soft re-pitch upsell** (T+24h) — for buyers who skipped post-checkout upsell.
4. **Use the product** (T+3d) — nudge if not opened.
5. **High-ticket invitation** (T+10d) — applies if buyer cohort ≥100 (LOW2HIGH rule).

Use `brevo-marketing` skill for the sequence builder; this skill orchestrates the trigger from the funnel.

## Tracking — GA4 + Meta Pixel

```ts
// lib/tracking.ts
export function trackPurchase(p: { value: number; currency: string; transactionId: string; items: any[] }) {
  // GA4
  window.gtag?.('event', 'purchase', {
    transaction_id: p.transactionId,
    value: p.value,
    currency: p.currency,
    items: p.items,
  })
  // Meta Pixel
  window.fbq?.('track', 'Purchase', {
    value: p.value,
    currency: p.currency,
    content_ids: p.items.map(i => i.id),
    content_type: 'product',
  })
}
```

Fire on each funnel step with distinct `event_id` so deduplication works between client (Pixel) and server (CAPI). Front-end vs upsell-1 vs upsell-2 must be separate purchase events.

**Critical:** server-side Pixel CAPI for upsells where the client may have already left the page.

## Offer Catalog — Source of Truth

```ts
// lib/offers.ts
export const OFFERS = {
  'front-end': { priceId: 'price_xxx', amount: 2700, name: 'Lectura Tarot Premium' },
  'upsell-1':  { priceId: 'price_yyy', amount: 19900, name: 'Pack 12 lecturas' },
  'downsell-1':{ priceId: 'price_zzz', amount: 9900,  name: 'Pack 6 lecturas' },
  'upsell-2':  { priceId: 'price_www', amount: 12700, name: 'Diario místico anual' },
  'downsell-2':{ priceId: 'price_vvv', amount: 7900,  name: 'Mini diario 3 meses' },
} as const
```

Drives copy on every funnel page so prices/IDs never drift.

## Friction Reducers (from AstroLectura test)

- **Pre-fill email** from the front-end checkout into all upsell screens.
- **No password / no account** at first purchase. Magic-link if needed for re-access.
- **Mobile-first layout** — >70% of LATAM traffic is mobile.
- **Latency feedback** during one-click upsell (skeleton → "Procesando…" → result).
- **Single CTA per upsell page.** Never two products on the same upsell view.

## High-Ticket Mini-Launch (Phase 5 of LOW2HIGH)

Triggered when ≥100 front-end buyers exist:

1. **Atención (not capture)**: email to buyer base announcing window.
2. **Oferta irresistible**: VSL (Hook + fascinations + offer, 80% intro / 20% outro structure).
3. **Cierre**: application form + sales call OR direct Stripe high-ticket.

Don't run paid ads for this. Pull from existing low-ticket buyers.

## Gotchas

- **One-time prices, not recurring.** Different Stripe object. Re-create your prices if you copied from a subscription template.
- **Refund cascades.** A refund of the front-end shouldn't auto-refund upsells unless policy says so. Webhook handler must respect this.
- **Email deliverability.** Resend "from" must be DKIM/SPF verified; otherwise post-purchase email lands in spam and customer "didn't get access".
- **Tax (Stripe Tax).** Most LATAM operators ignore. If selling to USA/EU at scale, enable Stripe Tax — adjustments come out of margin.
- **Refund window vs upsell timing.** If T+30 refund window and upsells were charged automatically, expect chargebacks. Mitigate with clear messaging on upsell pages.
- **Share card text language.** Match the user's language; LATAM users export to WhatsApp, EN users to IG.

## Workflow Checklist

```
New infoproduct funnel:
- [ ] Offer catalog defined in lib/offers.ts with all priceIds
- [ ] Stripe Checkout configured with setup_future_usage
- [ ] Front-end → success_url with session_id passes context
- [ ] Each upsell page has ONE CTA, mobile-first
- [ ] One-click charge endpoint uses off_session=true, confirm=true
- [ ] Webhook validates signature + idempotency key
- [ ] Resend transactional email sends receipt/access immediately
- [ ] GA4 + Meta Pixel + CAPI fire distinct events per step
- [ ] Share card on thank-you page (html-to-image)
- [ ] Brevo / market-emails sequence triggered with buyer + tier
- [ ] Refund/dispute handler considers cascade rules
- [ ] If high-ticket: gate behind ≥100 buyers, no ads
```

## Related Skills

- `llm-streaming-app` — when the front-end product is LLM-generated content (tarot reading, astro report)
- `landing-page-builder` — the landing that feeds the funnel
- `market-landing` — CRO analysis if conversion is low
- `market-emails` / `brevo-marketing` — post-purchase nurture
- `webhook-integration` — Stripe webhook signature + idempotency
- `saas-boilerplate` — if you add continuity/subscription later
