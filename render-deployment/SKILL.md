---
name: render-deployment
description: >
  Deploys Node.js / Express / Next.js apps to Render.com. Covers Web Services,
  Background Workers, render.yaml IaC, environment groups, persistent disks,
  managed Postgres/Redis, custom domains, build/start commands, health checks,
  free tier sleep behavior, and gotchas vs Railway/Vercel. Stack: Render Web Services
  + render.yaml + Docker (optional). Usar cuando: "Render", "render.com", "render.yaml",
  "deploy a Render", "free tier Render", "Render Postgres", "Render Redis",
  "lms-uclogos-backend.onrender.com", "Render env vars", "Render custom domain",
  "Render health check", "Render disk", "Render worker", "Render background job",
  "spin down inactivity", "Render build failing". Triggers in English: "Render deploy",
  "Render web service", "Render IaC", "render.yaml", "Render sleep", "Render free tier",
  "Render managed Postgres", "background worker Render", "Render preview environment".
  Do NOT use for: Railway deploy (use deployment), Vercel deploy (use deployment),
  bare-metal VPS or Docker Swarm setups.
---

# Render Deployment

Render.com hosts the `lms-uclogos-backend.onrender.com` service plus other Node backends. This skill covers the Render-specific gotchas that `deployment` (Railway+Vercel) does not.

## When Render Over Railway / Vercel

| Need | Best fit |
|---|---|
| Long-running Node API + need persistent disk + managed Postgres in same provider | Render |
| Need free tier that doesn't bill credits | Render free web service (sleeps) |
| Want git-based IaC config (`render.yaml`) | Render |
| Background workers + cron in same dashboard | Render |
| Next.js SSR with edge / preview deploys | Vercel |
| Variable CPU/RAM + WebSockets stable + cheap | Railway |

## Stack

- **Service types:** Web Service · Background Worker · Cron Job · Static Site · Private Service
- **Plans:** Free (sleeps after 15 min idle, 750h/month) · Starter ($7) · Standard ($25)
- **Managed:** Postgres · Redis · Disks (persistent volumes)
- **IaC:** `render.yaml` at repo root
- **Build:** Native runtimes (Node, Python, Ruby, Go, Rust) OR Dockerfile

## render.yaml — Single Source of Truth

Define everything in code instead of clicking through the dashboard:

```yaml
services:
  - type: web
    name: lms-uclogos-backend
    env: node
    plan: starter
    region: oregon
    branch: main
    rootDir: backend
    buildCommand: npm ci && npm run build
    startCommand: npm run start
    healthCheckPath: /health
    autoDeploy: true
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: DATABASE_URL
        fromDatabase:
          name: lms-uclogos-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: BREVO_API_KEY
        sync: false                  # set in dashboard, not committed

databases:
  - name: lms-uclogos-db
    plan: starter
    region: oregon
    databaseName: lms_prod
    user: lms_app
    postgresMajorVersion: 16
```

Commit this. PRs that change infra are reviewable.

## Build & Start Commands

### Node (no Docker)
```yaml
buildCommand: npm ci && npm run build
startCommand: node dist/server.js
```

Render exposes the port via `process.env.PORT` (default 10000). **Bind to `0.0.0.0`, not `127.0.0.1`** — otherwise Render's load balancer can't reach you.

```ts
const port = Number(process.env.PORT ?? 10000)
app.listen(port, '0.0.0.0')
```

### Next.js
```yaml
buildCommand: npm ci && npm run build
startCommand: npm run start
```
Standard. Prefer Vercel for Next.js unless you need disks/workers next to it.

### Dockerfile
Set `env: docker` and place `Dockerfile` at `rootDir`. Render builds it. No `image:` field for self-built — use `image: { url: ... }` only for pulling from a registry.

## Health Checks

```yaml
healthCheckPath: /health
```
Render expects 200 within 5 seconds. Implement a cheap endpoint that pings DB:
```ts
app.get('/health', async (_req, res) => {
  try {
    await pool.execute('SELECT 1')
    res.status(200).json({ ok: true })
  } catch (err) {
    res.status(503).json({ ok: false })
  }
})
```
Failed health check = zero-downtime deploy aborts.

## Environment Variables

### Three ways
1. **`render.yaml` `value:`** → committed (use for non-secrets)
2. **`render.yaml` `sync: false`** → declared but value set in dashboard (secrets)
3. **`generateValue: true`** → Render generates and stores (JWT secrets etc.)

### Env Groups (shared across services)
Dashboard → Env Groups → create `shared-secrets` → reference in `render.yaml`:
```yaml
envVars:
  - fromGroup: shared-secrets
```

## Free Tier Sleep — The Most Common Gotcha

Free Web Services sleep after **15 minutes** of inactivity. Next request takes ~30-60s to wake.

**Mitigations:**
1. **Upgrade to Starter ($7)** — no sleep.
2. **External ping** (UptimeRobot every 10 min) — keeps it warm but uses your 750h/month free quota.
3. **Background Workers also sleep on free.** Switching to a worker is not an escape from the sleep policy.
4. **Accept the cold start** for low-traffic apps; show a "warming up..." UI.

For paying apps: starter plan minimum, period.

## Persistent Disks

Web/worker services can mount a disk:
```yaml
disk:
  name: data
  mountPath: /var/data
  sizeGB: 10
```
**Caveat:** disks anchor the service to a single instance. **No horizontal scaling** while a disk is attached. Use only for: SQLite, file uploads (Bunny is better), session files.

## Managed Postgres / Redis

```yaml
databases:
  - name: my-db
    plan: starter
    region: oregon
    postgresMajorVersion: 16

services:
  - type: redis
    name: my-cache
    plan: free
    maxmemoryPolicy: allkeys-lru
```

Connection strings are auto-injected via `fromDatabase` / `fromService`. **Free Postgres has an expiration window** (historically 90 days unless upgraded; verify current policy at https://render.com/docs/free) — set a calendar reminder when provisioning.

## Cron Jobs

```yaml
- type: cron
  name: daily-cleanup
  env: node
  schedule: "0 3 * * *"             # UTC
  buildCommand: npm ci && npm run build
  startCommand: node dist/jobs/cleanup.js
```

Render runs the container to completion. Useful for the kind of work you'd otherwise stick in a `n8n-to-api` webhook.

## Custom Domain + TLS

1. Dashboard → Settings → Custom Domains → add `aula.uclogos.mx`.
2. Render gives you a CNAME target like `lms-uclogos-backend.onrender.com`.
3. Add CNAME at registrar. Wait. TLS auto-provisioned via Let's Encrypt.
4. For **apex** domains (uclogos.mx), Render needs ALIAS/ANAME (Cloudflare/Route53). Subdomains work everywhere.

## Logs and Debugging

- Dashboard → Service → Logs (live tail). 7-day retention on starter.
- For longer retention: stream to Logtail/Datadog via syslog drain.
- Build logs separate from runtime logs.
- `console.log` works; for structured: pino + JSON.

## Render vs Railway — Quick Compare

| | Render | Railway |
|---|---|---|
| Sleep on free | Yes (15min) | Yes (after credits) |
| IaC | `render.yaml` git | Project config UI + `railway.json` |
| Build time on starter | Slower | Faster |
| Postgres free | 90 days then deleted | Free w/ credits |
| Disk | Yes, blocks scaling | Yes |
| Region | US/EU/Singapore | US/EU |

## Gotchas

- **`PORT` env is dynamic** — always read from `process.env.PORT`.
- **Bind to `0.0.0.0`** not `localhost` / `127.0.0.1`.
- **Free Postgres expires.** Migrate or upgrade before day 90.
- **Build cache is aggressive.** `Clear build cache & deploy` in dashboard when `node_modules` get stale.
- **Static assets in Next.js standalone:** Render needs `npm run build` + the standalone output copied. Easier to deploy Next.js on Vercel.
- **CORS:** if the frontend is on Vercel and backend on Render, configure CORS allowlist explicitly.
- **WebSockets:** supported but free tier sleep kills connections.
- **Free tier 750h/month** is across all services. Run more than one and you'll hit it.

## Workflow Checklist

```
New Render service:
- [ ] Commit render.yaml at repo root
- [ ] healthCheckPath returns 200 quickly
- [ ] Server binds to 0.0.0.0 and reads process.env.PORT
- [ ] Secrets declared with sync: false (set in dashboard)
- [ ] DB/Redis referenced via fromDatabase / fromService
- [ ] Custom domain CNAME pointed
- [ ] Plan: starter if production, free only for experiments
- [ ] If free: external pinger or accept cold starts
- [ ] If disk attached: confirm single-instance is OK
```

## Related Skills

- `deployment` — Railway + Vercel patterns (sibling)
- `express-api` — Express apps that ship to Render
- `mysql-better-sqlite` — Postgres via mysql2 is wrong; use `pg` for Render Managed Postgres
- `error-monitoring` — Sentry from Render with `RENDER_GIT_COMMIT` as release ID
