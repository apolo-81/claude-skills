---
name: deployment-vercel
description: >
  Use when deploying to Vercel, configuring CI/CD pipelines, managing environment
  variables, setting up preview deployments, or troubleshooting Vercel deployments.
  Trigger for: "deploy", "Vercel", "deployment", "CI/CD", "preview deployment",
  "environment variables", "variables de entorno", "deploy a producción", "desplegar",
  "publicar mi app", "subir a producción", "Edge Middleware", "Vercel Edge",
  "serverless functions", "Vercel Functions", "build error", "deploy failed",
  "CORS en Vercel", "custom domain", "dominio personalizado", "monorepo Vercel",
  "Vercel CLI", "vercel.json", "rewrite", "redirect", "headers", "ISR en Vercel",
  "on-demand revalidation", "Vercel KV", "Vercel Postgres", "Vercel Blob",
  "GitHub Actions Vercel", "deploy webhook", "rollback".
---

# Deployment — Vercel para Next.js 15

Stack de referencia: Next.js 15 App Router + TypeScript + Supabase + n8n

## 1. Overview — Por qué Vercel para Next.js

Vercel es la plataforma creada por el mismo equipo de Next.js. Eso significa soporte nativo y sin configuración extra para:

- **App Router**: Server Components, Streaming, Suspense boundaries
- **ISR / PPR**: Incremental Static Regeneration y Partial Pre-Rendering sin plugins
- **Edge Middleware**: corre en la red Edge antes del routing, latencia <10ms global
- **Image Optimization**: `next/image` funciona sin servidor propio
- **Server Actions**: sin configuración adicional de servidor

### Niveles de plan

| Plan | Function timeout | Bandwidth | Teams | Precio |
|------|-----------------|-----------|-------|--------|
| Hobby | 10s | 100 GB | No | Gratis |
| Pro | 60s | 1 TB | Si | $20/mes por miembro |
| Enterprise | Custom | Custom | Si | Contrato |

### Límites críticos a conocer

- **Bundle size máximo por función**: 250 MB (comprimido)
- **Regiones Edge**: 40+ PoPs globales
- **Concurrent builds**: 1 (Hobby), ilimitado (Pro+)
- **Dominios custom**: ilimitados en todos los planes

---

## 2. Setup Inicial

### Instalación y vinculación

```bash
npm install -g vercel
vercel login          # Abre navegador para autenticar
vercel link           # Conecta a proyecto existente o crea uno nuevo
```

### Comandos de deploy

```bash
vercel                # Deploy de preview (branch actual)
vercel --prod         # Deploy a producción (rama main)
vercel --env NODE_ENV=test  # Con variables de entorno temporales
```

### Alternativa: GitHub auto-deploy

1. Ir a vercel.com → New Project → Import Git Repository
2. Seleccionar repo → Configurar build settings
3. Cada push a `main` despliega a producción automáticamente
4. Cada push a otras ramas / cada PR genera una preview URL

### Build settings para Next.js 15

```
Framework Preset: Next.js
Build Command: next build  (o npm run build)
Output Directory: .next    (autodetectado)
Install Command: npm install
Node.js Version: 20.x
```

---

## 3. Variables de Entorno

### Via CLI

```bash
# Agregar variable por ambiente
vercel env add SUPABASE_URL production
vercel env add SUPABASE_URL preview
vercel env add SUPABASE_URL development

# Agregar variable a todos los ambientes a la vez
vercel env add MY_SECRET

# Listar variables del proyecto
vercel env ls

# Eliminar una variable
vercel env rm VARIABLE_NAME production

# Pull a .env.local para desarrollo local
vercel env pull .env.local
```

### Tres ambientes de Vercel

| Ambiente | Cuándo aplica |
|----------|--------------|
| `production` | Deploy desde rama `main` (o rama de producción configurada) |
| `preview` | Cualquier otra rama o Pull Request |
| `development` | Local con `vercel dev` o `vercel env pull` |

### Variables del cliente vs servidor

```bash
# CORRECTO: Variable solo en servidor (API keys, DB passwords)
SUPABASE_SERVICE_ROLE_KEY=xxx

# CORRECTO: Variable pública visible en el browser
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# NUNCA: Keys secretas con prefijo NEXT_PUBLIC_
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=xxx  # MAL — expuesto al cliente
```

### Por qué NO hardcodear .env en el repo

Las keys se rotan cuando hay una brecha de seguridad. Si están en el repo, el historial de git las preserva permanentemente. Siempre usar Vercel env o un secrets manager.

### Variables de runtime disponibles en Vercel

```typescript
process.env.VERCEL          // "1" si corre en Vercel
process.env.VERCEL_ENV      // "production" | "preview" | "development"
process.env.VERCEL_URL      // URL del deployment actual (sin https://)
process.env.VERCEL_GIT_COMMIT_SHA  // SHA del commit desplegado
process.env.VERCEL_GIT_COMMIT_REF  // Rama del commit
```

---

## 4. Configuración de Dominio

### Agregar dominio custom

```bash
vercel domains add mi-dominio.com
vercel domains inspect mi-dominio.com  # Ver estado DNS
vercel domains ls                       # Listar dominios del proyecto
```

### Configuración DNS

Para dominio raíz (`mi-dominio.com`):
- Tipo: **A record**
- Valor: `76.76.21.21`

Para subdominio www:
- Tipo: **CNAME**
- Valor: `cname.vercel-dns.com`

Para subdominio personalizado (`app.mi-dominio.com`):
- Tipo: **CNAME**
- Valor: `cname.vercel-dns.com`

**Certificado SSL**: Automático con Let's Encrypt. Se provisiona en minutos, sin configuración adicional.

### Redirigir www a raíz (o viceversa)

En el dashboard de Vercel → Settings → Domains → configurar redirect.

---

## 5. vercel.json — Configuración Clave

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "https://tu-dominio.com" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" }
      ]
    }
  ],
  "rewrites": [
    { "source": "/blog/:path*", "destination": "https://mi-cms.com/:path*" }
  ],
  "redirects": [
    { "source": "/old-page", "destination": "/new-page", "permanent": true }
  ]
}
```

Ver `references/vercel-config.md` para configuración completa: functions timeout por ruta, monorepo, Edge Functions, Vercel KV, Cron Jobs y más.

---

## 6. Edge Middleware

```typescript
// middleware.ts — corre en el Edge ANTES del routing
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Auth check sin llamar a Supabase — usar JWT directamente
  const token = request.cookies.get('sb-access-token')?.value
  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Geo-routing
  const country = request.geo?.country ?? 'US'
  if (pathname === '/' && country === 'ES') {
    return NextResponse.redirect(new URL('/es', request.url))
  }

  // 3. A/B testing con cookies persistentes
  const variant = request.cookies.get('ab-variant')?.value ??
    (Math.random() > 0.5 ? 'A' : 'B')
  const response = NextResponse.next()
  response.cookies.set('ab-variant', variant, {
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
    sameSite: 'lax',
  })

  // 4. Headers de seguridad
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')

  return response
}

export const config = {
  // Excluir rutas estáticas y de Next.js para mejor performance
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Por qué Edge Middleware en lugar de route handlers para auth

- Corre cerca del usuario (<10ms de overhead)
- Evalúa antes de que Next.js renderice cualquier cosa
- Sin cold starts — siempre está "caliente"
- Ideal para: auth redirect, i18n, A/B testing, rate limiting básico, headers de seguridad

### Limitaciones del Edge Runtime

- Sin Node.js APIs (`fs`, `crypto` nativo, `path`)
- Sin client SDK de Supabase (`@supabase/supabase-js` no funciona)
- Solución para Supabase: usar `@supabase/ssr` con el helper de middleware

```typescript
// middleware.ts con Supabase SSR (patrón correcto)
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}
```

---

## 7. Preview Deployments

- Cada PR y cada push a ramas no-main genera una URL única: `project-git-feature-xyz-org.vercel.app`
- Las preview URLs son inmutables — cada deploy tiene su propia URL permanente
- Variables del ambiente `preview` se usan en previews (configurar con DB de staging, nunca producción)
- Preview URLs aparecen automáticamente como comentarios en GitHub PRs si el repo está conectado

### Password protect para previews (Pro+)

Útil para mostrar trabajo a clientes sin exponer la URL pública:

```
Dashboard → Project → Settings → Deployment Protection → Password Protection
```

### Variables de entorno diferenciadas por ambiente

```bash
# DB de staging solo para previews
vercel env add DATABASE_URL preview
# Ingresar: postgresql://user:pass@staging.supabase.co/db

# DB de producción solo para producción
vercel env add DATABASE_URL production
# Ingresar: postgresql://user:pass@prod.supabase.co/db
```

---

## 8. Troubleshooting Común

| Error | Causa probable | Solución |
|-------|---------------|---------|
| `Function timeout` | Procesamiento >10s (Hobby) | Usar n8n para tareas largas, o patrón async con webhook |
| `Module not found: 'X'` | Case sensitivity en rutas | Verificar que el import coincide exactamente con el nombre del archivo (Linux es case-sensitive) |
| `'VARIABLE' is not defined` | Variable de entorno faltante en Vercel | `vercel env ls` y verificar; luego `vercel env pull` |
| `Build failed: out of memory` | Bundle demasiado grande | Revisar `next build` local, eliminar dependencias innecesarias |
| `CORS error` | Headers no configurados | Agregar en `vercel.json` o en el route handler con `headers()` |
| `Large Page Data warning` | RSC fetch sin caché | Agregar `export const revalidate = 3600` o `cache: 'force-cache'` |
| `Middleware exceeds size limit` | Edge bundle >1MB | Eliminar imports pesados del middleware |
| `Supabase connection refused` | IP allowlist en Supabase | Vercel usa IPs dinámicas; usar Supabase connection pooler (port 6543) |

### Pattern para tareas largas con n8n (evitar timeout)

```typescript
// app/api/process/route.ts — dispara y olvida
export async function POST(request: Request) {
  const body = await request.json()

  // Llamar a n8n webhook de forma asíncrona (sin await)
  fetch(process.env.N8N_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(console.error) // No bloquear la respuesta

  // Responder inmediatamente
  return Response.json({ status: 'processing', message: 'Job queued' })
}
```

---

## 9. Rollback

```bash
# Listar deployments recientes
vercel ls

# Rollback al deployment anterior inmediatamente
vercel rollback

# Rollback a un deployment específico
vercel rollback [deployment-url-o-id]
```

Via dashboard:
1. Project → Deployments
2. Encontrar el deployment destino
3. Click en `•••` → "Promote to Production"

El rollback en Vercel es instantáneo — solo cambia el alias de producción. El código anterior sigue desplegado en su URL inmutable.

---

## 10. Monorepo

Ver `references/vercel-config.md` → sección "Monorepo Setup" para:
- Configurar `rootDirectory` por proyecto
- `ignoreCommand` para evitar rebuilds innecesarios
- Turborepo + Vercel Remote Cache
- Un repo, múltiples proyectos Vercel

---

## 11. CI/CD con GitHub Actions

Ver `references/ci-cd-patterns.md` para:
- Workflow completo: lint → type-check → unit tests → deploy preview → E2E → deploy prod
- `vercel/action` oficial vs CLI manual
- Secrets requeridos: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- Comentar preview URL en PRs automáticamente
- Cache de `node_modules` y `.next/cache` entre runs
- Notificaciones en Slack cuando el deploy falla
