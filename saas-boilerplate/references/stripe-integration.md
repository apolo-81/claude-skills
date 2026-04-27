# Stripe Integration — Next.js 15 App Router + Supabase

Stack: Next.js 15, Stripe Node SDK, Supabase SSR, TypeScript

---

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Price IDs from Stripe Dashboard
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_...
```

---

## lib/stripe.ts

```typescript
import Stripe from 'stripe'

// Singleton — avoids multiple instances in dev with hot reload
const globalForStripe = globalThis as unknown as { stripe: Stripe | undefined }

export const stripe =
  globalForStripe.stripe ??
  new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
    typescript: true,
  })

if (process.env.NODE_ENV !== 'production') globalForStripe.stripe = stripe

// ── Helpers ─────────────────────────────────────────────────────────────────

export async function createOrRetrieveCustomer({
  email,
  orgId,
}: {
  email: string
  orgId: string
}): Promise<string> {
  const existing = await stripe.customers.search({
    query: `metadata['org_id']:'${orgId}'`,
    limit: 1,
  })
  if (existing.data.length > 0) return existing.data[0].id

  const customer = await stripe.customers.create({
    email,
    metadata: { org_id: orgId },
  })
  return customer.id
}

export async function cancelSubscription(stripeSubscriptionId: string) {
  return stripe.subscriptions.update(stripeSubscriptionId, {
    cancel_at_period_end: true,
  })
}

export async function reactivateSubscription(stripeSubscriptionId: string) {
  return stripe.subscriptions.update(stripeSubscriptionId, {
    cancel_at_period_end: false,
  })
}

export function getPriceIdForPlan(plan: 'pro' | 'enterprise'): string {
  const map = {
    pro: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
    enterprise: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID!,
  }
  return map[plan]
}
```

---

## app/api/stripe/checkout/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, createOrRetrieveCustomer, getPriceIdForPlan } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { orgId, plan } = await req.json() as { orgId: string; plan: 'pro' | 'enterprise' }

  if (!orgId || !plan) {
    return NextResponse.json({ error: 'Missing orgId or plan' }, { status: 400 })
  }

  // Verify user belongs to org
  const { data: member } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', orgId)
    .eq('user_id', user.id)
    .single()

  if (!member || !['owner', 'admin'].includes(member.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const customerId = await createOrRetrieveCustomer({
    email: user.email!,
    orgId,
  })

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: getPriceIdForPlan(plan), quantity: 1 }],
    subscription_data: {
      trial_period_days: 14,
      metadata: { org_id: orgId },
    },
    metadata: { org_id: orgId },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`,
    allow_promotion_codes: true,
  })

  return NextResponse.json({ url: session.url })
}
```

---

## app/api/stripe/portal/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { orgId } = await req.json() as { orgId: string }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('organization_id', orgId)
    .single()

  if (!subscription?.stripe_customer_id) {
    return NextResponse.json({ error: 'No billing account found' }, { status: 404 })
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
  })

  return NextResponse.json({ url: portalSession.url })
}
```

---

## app/api/webhooks/stripe/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createClient as createServiceClient } from '@supabase/supabase-js'

// Service role bypasses RLS — required for webhook writes
const serviceClient = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const orgId = session.metadata?.org_id
        if (!orgId || !session.subscription) break

        const sub = await stripe.subscriptions.retrieve(session.subscription as string)

        await serviceClient.from('subscriptions').upsert({
          organization_id: orgId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: sub.id,
          status: sub.status as string,
          plan: sub.metadata?.plan ?? 'pro',
          trial_ends_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end,
        }, { onConflict: 'organization_id' })
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const orgId = sub.metadata?.org_id
        if (!orgId) break

        const priceId = sub.items.data[0]?.price.id
        let plan = 'free'
        if (priceId === process.env.STRIPE_PRO_MONTHLY_PRICE_ID) plan = 'pro'
        else if (priceId === process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID) plan = 'enterprise'

        await serviceClient.from('subscriptions').update({
          status: sub.status,
          plan,
          trial_ends_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', sub.id)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await serviceClient.from('subscriptions').update({
          status: 'canceled',
          plan: 'free',
          cancel_at_period_end: false,
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', sub.id)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        if (!invoice.subscription) break

        await serviceClient.from('subscriptions').update({
          status: 'past_due',
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', invoice.subscription as string)

        // TODO: send payment failure email via Resend/Loops
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

// Required: disable body parsing for Stripe signature verification
export const config = { api: { bodyParser: false } }
```

---

## hooks/useSubscription.ts

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Subscription {
  plan: 'free' | 'pro' | 'enterprise'
  status: string
  trial_ends_at: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
}

export function useSubscription(orgId: string) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!orgId) return

    const fetch = async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('plan, status, trial_ends_at, current_period_end, cancel_at_period_end')
        .eq('organization_id', orgId)
        .single()

      setSubscription(data ?? {
        plan: 'free',
        status: 'trialing',
        trial_ends_at: null,
        current_period_end: null,
        cancel_at_period_end: false,
      })
      setLoading(false)
    }

    fetch()

    // Real-time updates
    const channel = supabase
      .channel(`subscription:${orgId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'subscriptions',
        filter: `organization_id=eq.${orgId}`,
      }, (payload) => setSubscription(payload.new as Subscription))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [orgId])

  const startCheckout = async (plan: 'pro' | 'enterprise') => {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId, plan }),
    })
    const { url } = await res.json()
    if (url) router.push(url)
  }

  const openPortal = async () => {
    const res = await fetch('/api/stripe/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId }),
    })
    const { url } = await res.json()
    if (url) router.push(url)
  }

  return { subscription, loading, startCheckout, openPortal }
}
```
