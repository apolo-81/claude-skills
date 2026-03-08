---
name: saas-boilerplate
description: >
  Use when building a SaaS application, adding subscription billing, implementing
  multi-tenant architecture, or setting up user onboarding flows. Trigger for:
  "SaaS", "subscription", "Stripe billing", "pricing plans", "free trial",
  "freemium", "multi-tenant", "tenant isolation", "user onboarding", "admin panel",
  "quiero monetizar mi app", "agregar pagos a mi app", "planes de suscripción",
  "trial gratuito", "upgrade/downgrade plan", "customer portal", "metered billing",
  "seat-based pricing", "construir SaaS", "app de pago".
---

# SaaS Boilerplate — Next.js 15 + Supabase + Stripe

## 1. Anatomía de un SaaS Moderno

Un SaaS tiene capas bien definidas. Confundirlas es la fuente de la mayoría de los bugs de producción:

| Capa | Pregunta | Implementación |
|------|----------|----------------|
| **Auth** | ¿Quién es el usuario? | Supabase Auth |
| **Billing** | ¿Qué plan tiene? ¿Está al día? | Stripe Subscriptions |
| **Tenancy** | ¿A qué organización pertenece? | tabla `organizations` + RLS |
| **Features** | ¿Qué puede hacer según su plan? | Feature gates + plan limits |
| **Onboarding** | ¿Cómo llega al valor rápido? | Flujo guiado post-signup |

**Stack:** Next.js 15 App Router + TypeScript strict + Tailwind + Supabase v2 + Stripe + Resend

**Referencia al skill `supabase-stack`** para setup de clientes, RLS básico, y auth middleware base.

---

## 2. Auth + Tenancy

### Modelo de datos (relación clave)

```
auth.users → profiles → organization_members → organizations
```

Un usuario puede pertenecer a múltiples organizaciones con diferentes roles. El `org_id` activo se almacena en la sesión o se pasa por contexto.

### Roles por organización

```typescript
type OrgRole = 'owner' | 'admin' | 'member'
// owner: puede eliminar la org, cambiar plan, gestionar billing
// admin: puede invitar miembros, gestionar settings
// member: acceso de solo lectura a settings
```

### Middleware — auth + plan activo

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
    // Verificar suscripción activa para rutas que la requieren
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

---

## 3. Stripe Billing

### Modelos de pricing — elegir el correcto

| Modelo | Cuándo usarlo | Ejemplo |
|--------|---------------|---------|
| **Flat rate** | Valor claro, usuario único | $29/mes para todo |
| **Per-seat** | Equipos, valor escala con usuarios | $10/usuario/mes |
| **Metered** | Valor = uso (API calls, AI tokens) | $0.001 por llamada |
| **Freemium** | Producto viral, bajo CAC | Gratis hasta 3 proyectos |

### Variables de entorno

```bash
STRIPE_SECRET_KEY=sk_live_...            # nunca expongas client-side
STRIPE_WEBHOOK_SECRET=whsec_...          # del dashboard de Stripe
STRIPE_PRICE_ID_PRO_MONTHLY=price_...
STRIPE_PRICE_ID_PRO_ANNUAL=price_...
STRIPE_PRICE_ID_ENTERPRISE=price_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Checkout Flow

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

### Customer Portal (ahorra meses de trabajo)

Deja que Stripe maneje: cambio de plan, cancelación, actualización de tarjeta, historial de facturas. No construyas esto tú mismo.

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

### Webhooks — eventos que importan

Ver `references/stripe-integration.md` para el handler completo. Eventos críticos:

| Evento | Acción en DB |
|--------|-------------|
| `customer.subscription.created` | Insertar en `subscriptions`, plan = nuevo plan |
| `customer.subscription.updated` | Actualizar `status`, `plan`, `current_period_end` |
| `customer.subscription.deleted` | `status = 'canceled'` |
| `invoice.payment_failed` | `status = 'past_due'`, enviar email de fallo |
| `checkout.session.completed` | Vincular `stripe_customer_id` a la org |

---

## 4. Schema de Base de Datos

Ver `references/database-schema.md` para el SQL completo con RLS, triggers y funciones.

Tablas esenciales:

```
organizations      — el tenant (nombre, plan, settings)
organization_members — users ↔ orgs con rol
subscriptions      — plan activo, vinculada a Stripe
invitations        — invitaciones pendientes por email
onboarding_progress — qué pasos completó el usuario
```

**Patrón RLS multi-tenant crítico:** Toda tabla con datos de la org debe filtrar por org_id que el usuario tenga en `organization_members`.

```sql
-- Ejemplo: users solo ven proyectos de su org
CREATE POLICY "org_projects" ON projects
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM organization_members WHERE user_id = auth.uid()
    )
  );
```

---

## 5. Feature Gating

Ver `references/feature-gating.md` para implementación completa. Pattern:

### Constantes de plan

```typescript
// lib/plans.ts
export const PLAN_LIMITS = {
  free:       { projects: 3,  members: 1,  apiAccess: false, customDomain: false },
  pro:        { projects: 50, members: 10, apiAccess: true,  customDomain: false },
  enterprise: { projects: -1, members: -1, apiAccess: true,  customDomain: true  },
} as const
// -1 = ilimitado
```

### Uso en componentes

```tsx
// Componente <FeatureGate> — ver references/feature-gating.md
<FeatureGate feature="apiAccess" orgId={orgId}>
  <ApiKeysPanel />
</FeatureGate>
// Si el plan no lo permite → muestra UpgradePrompt automáticamente
```

### Gate en Server Actions / API routes

```typescript
const access = await checkFeatureAccess('apiAccess', orgId)
if (!access.allowed) {
  return { error: 'PLAN_LIMIT_REACHED', upgrade_url: '/dashboard/upgrade' }
}
```

---

## 6. Onboarding Flow

El onboarding define el time-to-value. Cada paso de más = más churn.

**Regla:** El usuario debe ver valor real antes de llegar a un paywall.

### Pasos estándar (4-5 máximo)

```
1. Signup + email verify       (Supabase Auth)
2. Crear organización          (nombre, industry, size)
3. Invitar equipo              (opcional — siempre skip-able)
4. Primera acción guiada       (el "aha moment" del producto)
5. Dashboard con valor visible
```

### Redirect automático si onboarding incompleto

```typescript
// En middleware — después de verificar auth
const { data: progress } = await supabase
  .from('onboarding_progress').select('completed_at').eq('user_id', user.id).single()

if (!progress?.completed_at && !path.startsWith('/onboarding') && !path.startsWith('/api')) {
  return NextResponse.redirect(new URL('/onboarding', request.url))
}
```

Ver `references/onboarding-flow.md` para componentes completos y hook `useOnboarding()`.

---

## 7. Admin Panel (Interno)

Para gestionar tu propio SaaS. **No confundir con el dashboard del usuario.**

### Acceso — allowlist por email

```typescript
// lib/admin.ts
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') ?? []

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email!)) {
    throw new Error('Forbidden')
  }
  return user
}
```

### Funcionalidades del admin

- Listar todas las orgs + plan + MRR aportado
- Cambiar plan manualmente (útil para ventas enterprise)
- Extender trial (sin ir a Stripe dashboard)
- Ver métricas: MRR, churn, trial conversion
- Impersonar usuario para debug (con Supabase service_role)

---

## 8. Emails Transaccionales

Con Resend + el skill `email-templates-builder`. Emails críticos en un SaaS:

| Email | Cuándo | Prioridad |
|-------|--------|-----------|
| Welcome | Tras signup | Alta |
| Trial ending soon | 3 días antes | Alta |
| Trial expired | Día 0 | Alta |
| Payment failed | Invoice fallida | Crítica |
| Subscription cancelled | Cancelación | Media |
| Invite to org | Al invitar miembro | Alta |
| Upgrade confirmation | Post-upgrade | Media |

Enviar emails con n8n: el webhook de Stripe → n8n → Resend. Así el código de tu app no mezcla lógica de emails.

---

## 9. Métricas SaaS

Con queries directas a Supabase:

```typescript
// lib/metrics.ts — para el admin panel
export async function getMRR(supabase: SupabaseClient) {
  const { data } = await supabase
    .from('subscriptions')
    .select('monthly_amount')
    .eq('status', 'active')
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

Para visualización: usar el skill `data-viz-dashboard`.

---

## 10. Deployment Checklist

Antes de ir a producción:

- [ ] Variables de entorno configuradas en Vercel (especialmente `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET`)
- [ ] Webhook endpoint registrado en Stripe Dashboard → Developers → Webhooks (URL de producción)
- [ ] RLS habilitado y testeado en **todas** las tablas con datos de usuarios
- [ ] `stripe listen` reemplazado por webhook real en producción
- [ ] Rate limiting en `/api/stripe/checkout` y `/api/webhooks/stripe` (Upstash Ratelimit)
- [ ] Sentry o equivalente configurado para capturar errores de webhooks
- [ ] Emails transaccionales testeados con cuentas reales (Resend test mode)
- [ ] Trial period verificado end-to-end: signup → trial → upgrade → portal → cancel

---

## Referencias

| Archivo | Contenido |
|---------|-----------|
| `references/database-schema.md` | SQL completo: tablas, RLS policies, triggers, funciones |
| `references/stripe-integration.md` | Checkout, portal, webhook handler completo, helpers TS |
| `references/onboarding-flow.md` | Componentes de steps, hook useOnboarding, empty states |
| `references/feature-gating.md` | Hook useFeatureAccess, FeatureGate component, middleware |
