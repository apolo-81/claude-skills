# Middleware & Admin Code

## Auth + Plan Middleware

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(),
      setAll: (list) => { list.forEach(({ name, value, options }) =>
        response.cookies.set(name, value, options)) } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  if (!user && path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && path.startsWith('/dashboard')) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status, plan')
      .eq('org_id', request.cookies.get('active_org_id')?.value ?? '')
      .single()

    const isPaid = sub?.status === 'active' || sub?.status === 'trialing'
    if (!isPaid && path.startsWith('/dashboard/pro')) {
      return NextResponse.redirect(new URL('/dashboard/upgrade', request.url))
    }
  }

  return response
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] }
```

## Checkout Flow

```typescript
// app/api/stripe/checkout/route.ts
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { priceId, orgId } = await request.json()
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { userId: user.id, orgId },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    allow_promotion_codes: true,
    subscription_data: { trial_period_days: 14 },
  })
  return Response.json({ url: session.url })
}
```

## Customer Portal

```typescript
// app/api/stripe/portal/route.ts
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { orgId } = await request.json()

  const { data: sub } = await supabase
    .from('subscriptions').select('stripe_customer_id').eq('org_id', orgId).single()

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: sub!.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing`,
  })
  return Response.json({ url: portalSession.url })
}
```

## Admin Access

```typescript
// lib/admin.ts
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') ?? []

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email!)) throw new Error('Forbidden')
  return user
}
```

## SaaS Metrics

```typescript
// lib/metrics.ts
export async function getMRR(supabase: SupabaseClient) {
  const { data } = await supabase
    .from('subscriptions').select('monthly_amount').eq('status', 'active')
  return data?.reduce((sum, s) => sum + s.monthly_amount, 0) ?? 0
}

export async function getChurnRate(supabase: SupabaseClient, periodDays = 30) {
  const since = new Date(Date.now() - periodDays * 86400000).toISOString()
  const [{ count: churned }, { count: total }] = await Promise.all([
    supabase.from('subscriptions').select('*', { count: 'exact', head: true })
      .eq('status', 'canceled').gte('canceled_at', since),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true })
      .eq('status', 'active').lt('created_at', since),
  ])
  return total ? (churned ?? 0) / total : 0
}
```

## Onboarding Redirect (in middleware, after auth check)

```typescript
const { data: progress } = await supabase
  .from('onboarding_progress').select('completed_at').eq('user_id', user.id).single()

if (!progress?.completed_at && !path.startsWith('/onboarding') && !path.startsWith('/api')) {
  return NextResponse.redirect(new URL('/onboarding', request.url))
}
```
