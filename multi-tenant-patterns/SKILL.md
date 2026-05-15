---
name: multi-tenant-patterns
description: >
  Implements multi-tenant architecture for SaaS / LMS / CRM apps: tenant resolution by
  subdomain or path, tenant isolation, scoped queries, RLS (PostgreSQL) or app-level
  filters (MySQL/SQLite), middleware patterns, per-tenant config, and migration paths
  from single-tenant. Stack-agnostic patterns with examples for Next.js App Router,
  Express, Prisma, Supabase. Usar cuando: "multi-tenant", "multitenancy", "tenants",
  "subdominio por cliente", "aula.uclogos", "tenants/<id>/", "location_id", "sub-account",
  "aislar datos por cliente", "schema por tenant", "RLS multi-tenant", "tenant resolver",
  "tenant middleware", "lms-core", "GHL multi-location". Triggers in English:
  "multi-tenant", "tenant isolation", "tenant resolver", "subdomain routing",
  "tenant context", "RLS for tenants", "scoped queries", "tenants per schema",
  "shared database multiple tenants". Do NOT use for: single-tenant apps with one
  customer (use saas-boilerplate or supabase-stack directly), generic auth without
  tenant scoping (use auth-patterns).
---

# Multi-Tenant Patterns

Implementation patterns for SaaS, LMS and CRM apps that serve multiple isolated customers from one codebase. Drawn from `lms-core` (UC Logos aula.uclogos.mx), GHL WA Broadcaster (`location_id` per sub-account) and saas-boilerplate experiments.

## Stack-Agnostic Concepts

| Concept | What it means |
|---|---|
| **Tenant** | A customer / org / school / sub-account whose data is logically isolated |
| **Tenant ID** | Stable identifier (UUID, slug, subdomain) used to scope every read/write |
| **Tenant Resolver** | Middleware that maps incoming request → tenant ID (subdomain, header, path, JWT claim) |
| **Tenant Context** | Server-side singleton (per-request) that holds the resolved tenant ID downstream code reads |
| **Tenant Isolation** | Guarantee that tenant A cannot read/write tenant B's data even on a bug |

## Three Isolation Strategies

| Strategy | DB | When to use | Trade-off |
|---|---|---|---|
| **Shared DB + tenant_id column** | 1 DB, 1 schema | <100 tenants, app-level scoping OK | Single query mistake leaks data |
| **Shared DB + schema-per-tenant** | 1 DB, N schemas | 10-500 tenants, regulatory-ish | More migrations to run |
| **DB-per-tenant** | N DBs | High compliance, very few tenants | Operational overhead |

**Default for LATAM SaaS / LMS:** shared DB + `tenant_id` column + RLS (Postgres) or required scope helper (MySQL/SQLite).

## Tenant Resolution Patterns

### Pattern A — Subdomain (B2B, white-label feel)
```
aula.uclogos.mx     → tenant = uclogos
aula.colegio-x.mx   → tenant = colegio-x
```
Next.js middleware:
```ts
// middleware.ts
export function middleware(req: NextRequest) {
  const host = req.headers.get('host') ?? ''
  const subdomain = host.split('.')[0]
  const res = NextResponse.next()
  res.headers.set('x-tenant', subdomain)
  return res
}
```

### Pattern B — Path prefix (`/tenants/<id>/...`)
Used in `lms-core` for early multi-tenant before subdomains exist. Easy to refactor later.

### Pattern C — JWT claim (B2B SaaS with single login)
Token carries `tenant_id`. Resolver reads from `Authorization` header server-side. **Never** trust a client-sent `x-tenant` header without verification.

### Pattern D — Header from upstream proxy (GHL pattern)
GHL OAuth provides `location_id` in the webhook payload or in the access token. Verify with HMAC before scoping.

## Server-Side Tenant Context

Avoid passing `tenantId` through every function. Use AsyncLocalStorage (Node.js):

```ts
// lib/tenant-context.ts
import { AsyncLocalStorage } from 'node:async_hooks'

const storage = new AsyncLocalStorage<{ tenantId: string }>()

export function runWithTenant<T>(tenantId: string, fn: () => T): T {
  return storage.run({ tenantId }, fn)
}

export function getTenantId(): string {
  const ctx = storage.getStore()
  if (!ctx) throw new Error('No tenant context — did you forget the middleware?')
  return ctx.tenantId
}
```

Wrap every route handler:
```ts
export async function POST(req: Request) {
  const tenantId = req.headers.get('x-tenant')!
  return runWithTenant(tenantId, async () => {
    // queries here automatically pick up tenant from context
  })
}
```

## Database Scoping

### PostgreSQL — Row Level Security (RLS)

```sql
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON courses
  USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

Set the GUC per connection:
```ts
await prisma.$executeRaw`SELECT set_config('app.current_tenant', ${tenantId}, true)`
```

Supabase: use `auth.jwt() ->> 'tenant_id'` directly in policies.

### MySQL / SQLite — App-level scoping (no RLS)

Single source of truth: a `scopedDb()` helper.
```ts
function scopedDb() {
  const tenantId = getTenantId()
  return {
    courses: () => db('courses').where({ tenant_id: tenantId }),
    users:   () => db('users').where({ tenant_id: tenantId }),
  }
}
```
Linter rule (eslint custom): **forbid** raw `db('courses')` outside `scopedDb()`.

### Prisma — Middleware approach

```ts
prisma.$use(async (params, next) => {
  const tenantId = getTenantId()
  if (params.action === 'create' || params.action === 'createMany') {
    params.args.data.tenant_id = tenantId
  }
  if (['findFirst', 'findMany', 'update', 'delete'].includes(params.action)) {
    params.args.where = { ...params.args.where, tenant_id: tenantId }
  }
  return next(params)
})
```

## Per-Tenant Configuration

Avoid env vars per tenant — explodes fast. Use a `tenants` table:

```sql
CREATE TABLE tenants (
  id          UUID PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,    -- subdomain
  name        TEXT NOT NULL,
  config      JSONB NOT NULL DEFAULT '{}',  -- branding, feature flags, limits
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```
Cache `tenants` in-process (LRU) or in Redis; invalidate on update.

## Migration: Single → Multi-Tenant

Order of operations (battle-tested in `lms-core` Fase 1):

1. **Add `tenant_id` column** to every business table (NULLABLE first).
2. **Backfill** with the single-tenant default ID.
3. **Set NOT NULL + index** on `(tenant_id, ...natural-key)`.
4. **Add tenant resolver middleware** that injects context.
5. **Add scope helper / RLS policies**.
6. **Refactor queries** to use scope helper (one feature at a time).
7. **Add second tenant** to validate isolation in staging.
8. **Cut over** with feature flag.

## Gotchas

- **Cross-tenant joins are leaks.** Even `LEFT JOIN users ON ...` without `tenant_id` filter silently mixes data.
- **Background jobs** lose request context. Pass `tenantId` explicitly into the job payload and call `runWithTenant()` inside the worker.
- **Caching by ID alone** (e.g. `course:${id}`) leaks across tenants. Always namespace: `course:${tenantId}:${id}`.
- **Public assets** (logos, blog posts) marked "public" still need `tenant_id` to render correctly per subdomain.
- **GHL specifically:** every sub-account install carries its own `location_id` and `access_token`. Store them per tenant. The `businesses` deuda técnica documented in memoria fue exactamente esto sin migrar.
- **CSP en multi-tenant:** un solo header CSP debe cubrir todos los subdominios o usar reporting + `script-src 'self' https://*.tudominio.mx`.

## Workflow Checklist

```
Multi-tenant rollout:
- [ ] Choose resolution pattern (subdomain / path / JWT / header)
- [ ] Decide isolation strategy (shared+column / schema / DB)
- [ ] Add tenant_id to every table that holds tenant data
- [ ] Implement tenant resolver middleware
- [ ] Implement AsyncLocalStorage context
- [ ] Add scope helper or RLS policies
- [ ] Add lint rule / code review checklist forbidding raw DB access
- [ ] Test isolation with 2 staging tenants (try to read across)
- [ ] Background jobs receive tenantId explicitly
- [ ] Cache keys namespaced
- [ ] Document tenant onboarding flow
```

## Related Skills

- `auth-patterns` — login/session; tenant scoping rides on top
- `prisma-orm` — Prisma middleware to enforce tenant scoping
- `supabase-stack` — RLS with `auth.jwt()` claims
- `saas-boilerplate` — full SaaS billing + multi-tenant
- `ghl-integration` — `location_id` as tenant ID for GHL Marketplace apps
