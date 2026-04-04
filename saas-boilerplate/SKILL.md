---
name: saas-boilerplate
description: >
  Arquitectura SaaS: billing, multi-tenant, onboarding y admin panel.
  Stack: Next.js 15 + Supabase + Stripe.
  Usar cuando: "SaaS", "subscripción", "Stripe", "planes de precios", "free trial",
  "multi-tenant", "monetizar app", "customer portal", "upgrade/downgrade", "app de pago".
---

# SaaS Boilerplate — Next.js 15 + Supabase + Stripe

## 1. SaaS Layers

| Layer | Question | Implementation |
|-------|----------|----------------|
| **Auth** | Who is the user? | Supabase Auth |
| **Billing** | What plan? Up to date? | Stripe Subscriptions |
| **Tenancy** | Which organization? | `organizations` table + RLS |
| **Features** | What can they do per plan? | Feature gates + plan limits |
| **Onboarding** | How to reach value fast? | Guided post-signup flow |

**Stack:** Next.js 15 App Router + TypeScript strict + Tailwind + Supabase v2 + Stripe + Resend

Cross-reference `supabase-stack` for client setup, RLS basics, and auth middleware.

---

## 2. Auth + Tenancy

**Data model:** `auth.users -> profiles -> organization_members -> organizations`

Users can belong to multiple orgs with different roles. Active `org_id` stored in session/context.

**Roles:** `owner` (delete org, change plan, billing) | `admin` (invite, settings) | `member` (read-only settings)

Ver `references/middleware-admin.md` para auth + plan middleware code and onboarding redirect.

---

## 3. Stripe Billing

### Pricing Models

| Model | When | Example |
|-------|------|---------|
| Flat rate | Clear value, single user | $29/mo for everything |
| Per-seat | Teams, value scales with users | $10/user/mo |
| Metered | Value = usage (API calls, AI tokens) | $0.001/call |
| Freemium | Viral product, low CAC | Free up to 3 projects |

### Environment Variables

```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PRO_MONTHLY=price_...
STRIPE_PRICE_ID_PRO_ANNUAL=price_...
STRIPE_PRICE_ID_ENTERPRISE=price_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Checkout & Portal

Ver `references/middleware-admin.md` para checkout flow and customer portal code.

Customer Portal handles: plan changes, cancellation, card updates, invoice history. Do not build this yourself.

### Webhook Events

Ver `references/stripe-integration.md` para complete handler. Critical events:

| Event | DB Action |
|-------|-----------|
| `customer.subscription.created` | Insert `subscriptions`, set plan |
| `customer.subscription.updated` | Update `status`, `plan`, `current_period_end` |
| `customer.subscription.deleted` | `status = 'canceled'` |
| `invoice.payment_failed` | `status = 'past_due'`, send failure email |
| `checkout.session.completed` | Link `stripe_customer_id` to org |

---

## 4. Database Schema

Ver `references/database-schema.md` para complete SQL with RLS, triggers, functions.

Essential tables: `organizations`, `organization_members` (users <-> orgs with role), `subscriptions` (linked to Stripe), `invitations`, `onboarding_progress`

**Critical RLS pattern:** every table with org data must filter by org_id the user has in `organization_members`:

```sql
CREATE POLICY "org_projects" ON projects
  FOR ALL USING (
    org_id IN (SELECT org_id FROM organization_members WHERE user_id = auth.uid())
  );
```

---

## 5. Feature Gating

Ver `references/feature-gating.md` para complete implementation.

### Plan Limits

```typescript
export const PLAN_LIMITS = {
  free:       { projects: 3,  members: 1,  apiAccess: false, customDomain: false },
  pro:        { projects: 50, members: 10, apiAccess: true,  customDomain: false },
  enterprise: { projects: -1, members: -1, apiAccess: true,  customDomain: true  },
} as const  // -1 = unlimited
```

### Usage

```tsx
<FeatureGate feature="apiAccess" orgId={orgId}>
  <ApiKeysPanel />
</FeatureGate>
// If plan doesn't allow -> shows UpgradePrompt automatically
```

Server-side gate:
```typescript
const access = await checkFeatureAccess('apiAccess', orgId)
if (!access.allowed) return { error: 'PLAN_LIMIT_REACHED', upgrade_url: '/dashboard/upgrade' }
```

---

## 6. Onboarding Flow

User must see real value before hitting a paywall. 4-5 steps max:

```
1. Signup + email verify       (Supabase Auth)
2. Create organization         (name, industry, size)
3. Invite team                 (optional, always skippable)
4. First guided action         (the "aha moment")
5. Dashboard with visible value
```

Ver `references/onboarding-flow.md` para components, `useOnboarding()` hook, and empty states.

---

## 7. Admin Panel (Internal)

For managing your own SaaS. Not the user dashboard.

Access via email allowlist. Ver `references/middleware-admin.md` para code.

Features: list all orgs + plan + MRR, manually change plans (enterprise sales), extend trials, view metrics (MRR, churn, trial conversion), impersonate users (service_role).

---

## 8. Transactional Emails

With Resend + `email-templates-builder` skill. Send via n8n: Stripe webhook -> n8n -> Resend (keeps email logic out of app code).

| Email | When | Priority |
|-------|------|----------|
| Welcome | After signup | High |
| Trial ending soon | 3 days before | High |
| Trial expired | Day 0 | High |
| Payment failed | Invoice failed | Critical |
| Subscription cancelled | Cancellation | Medium |
| Invite to org | On invite | High |
| Upgrade confirmation | Post-upgrade | Medium |

---

## 9. SaaS Metrics

Ver `references/middleware-admin.md` para MRR and churn rate query code.

Use `data-viz-dashboard` skill for visualization.

---

## 10. Deployment Checklist

- [ ] Env vars configured in Vercel (especially `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`)
- [ ] Webhook endpoint registered in Stripe Dashboard (production URL)
- [ ] RLS enabled and tested on **all** tables with user data
- [ ] `stripe listen` replaced by real webhook in production
- [ ] Rate limiting on `/api/stripe/checkout` and `/api/webhooks/stripe` (Upstash Ratelimit)
- [ ] Sentry configured for webhook errors
- [ ] Transactional emails tested with real accounts
- [ ] Trial flow tested end-to-end: signup -> trial -> upgrade -> portal -> cancel

---

## References

| File | Content |
|------|---------|
| `references/database-schema.md` | SQL: tables, RLS, triggers, functions |
| `references/stripe-integration.md` | Checkout, portal, webhook handler, TS helpers |
| `references/onboarding-flow.md` | Step components, useOnboarding, empty states |
| `references/feature-gating.md` | useFeatureAccess, FeatureGate component, middleware |
| `references/middleware-admin.md` | Auth middleware, checkout, portal, admin, metrics, onboarding redirect |
