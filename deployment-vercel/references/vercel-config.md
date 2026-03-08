# Vercel Config Reference — vercel.json y Configuración Avanzada

Stack: Next.js 15 App Router + TypeScript + Supabase + n8n

---

## vercel.json Completo

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "version": 2,

  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": ".next",
  "framework": "nextjs",

  "regions": ["iad1"],

  "functions": {
    "app/api/webhooks/**.ts": {
      "maxDuration": 60,
      "memory": 1024
    },
    "app/api/ai/**.ts": {
      "maxDuration": 60,
      "memory": 3008
    },
    "app/api/**.ts": {
      "maxDuration": 10
    }
  },

  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Credentials", "value": "true" },
        { "key": "Access-Control-Allow-Origin", "value": "https://tu-dominio.com" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
        { "key": "Access-Control-Allow-Headers", "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    },
    {
      "source": "/_next/static/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ],

  "rewrites": [
    { "source": "/blog/:path*", "destination": "https://mi-cms.com/:path*" },
    { "source": "/api/n8n/:path*", "destination": "https://n8n.mi-dominio.com/webhook/:path*" }
  ],

  "redirects": [
    { "source": "/old-page", "destination": "/new-page", "permanent": true },
    { "source": "/dashboard", "destination": "/app/dashboard", "permanent": false },
    {
      "source": "/:path((?!api|_next|favicon).*)",
      "has": [{ "type": "host", "value": "www.mi-dominio.com" }],
      "destination": "https://mi-dominio.com/:path",
      "permanent": true
    }
  ],

  "crons": [
    {
      "path": "/api/cron/daily-report",
      "schedule": "0 8 * * *"
    },
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 2 * * 0"
    }
  ]
}
```

### Notas sobre `regions`

| Código | Región |
|--------|--------|
| `iad1` | US East (Virginia) — default |
| `sfo1` | US West (San Francisco) |
| `cdg1` | Europe (Paris) |
| `sin1` | Asia Pacific (Singapore) |
| `gru1` | South America (Sao Paulo) |

Usar la misma región que tu base de datos de Supabase para minimizar latencia.

---

## Monorepo Setup

### Estructura de ejemplo

```
my-monorepo/
├── apps/
│   ├── web/          # Next.js frontend
│   └── admin/        # Next.js admin panel
├── packages/
│   ├── ui/           # Componentes compartidos
│   └── lib/          # Utilidades compartidas
├── package.json      # Root package.json (workspaces)
└── turbo.json
```

### Configurar proyectos en Vercel

Para cada app en el monorepo, crear un proyecto separado en Vercel con:

```
Root Directory: apps/web
Build Command: cd ../.. && npx turbo build --filter=web
```

O usando el dashboard de Vercel:
- Settings → General → Root Directory → `apps/web`

### Ignorar builds sin cambios relevantes (Turborepo)

```json
{
  "ignoreCommand": "npx turbo-ignore"
}
```

`turbo-ignore` detecta si la app cambió comparado con el último deploy. Si no hay cambios, cancela el build y ahorra minutos de build.

### turbo.json para Remote Cache con Vercel

```json
{
  "$schema": "https://turbo.build/schema.json",
  "remoteCache": {
    "enabled": true
  },
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "type-check": {
      "dependsOn": ["^build"]
    }
  }
}
```

Activar Remote Cache en Vercel Dashboard → Settings → Turborepo Remote Cache.

---

## Edge Functions

Las Edge Functions corren en el Edge Runtime (V8 isolates), no en Node.js.

### Route Handler como Edge Function

```typescript
// app/api/edge/hello/route.ts
export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name') ?? 'World'

  return new Response(JSON.stringify({ message: `Hello, ${name}!` }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  })
}
```

### Server Component con fetch en Edge

```typescript
// app/edge-page/page.tsx
export const runtime = 'edge'
export const revalidate = 60

export default async function EdgePage() {
  const data = await fetch('https://api.ejemplo.com/data', {
    next: { revalidate: 60 },
  }).then(r => r.json())

  return <div>{JSON.stringify(data)}</div>
}
```

### Qué está disponible en Edge Runtime

- `fetch`, `Request`, `Response`, `Headers`, `URL`
- `crypto` (Web Crypto API)
- `TextEncoder`, `TextDecoder`
- `ReadableStream`, `WritableStream`
- `setTimeout`, `setInterval` (limitado)

Lo que NO está disponible:
- `fs`, `path`, `os`, `child_process`
- `Buffer` (usar `Uint8Array`)
- Cualquier módulo nativo de Node.js

---

## Vercel KV (Redis)

### Setup

```bash
# Instalar SDK
npm install @vercel/kv

# Crear store en dashboard → Storage → KV → Create
# Las variables se agregan automáticamente al proyecto:
# KV_URL, KV_REST_API_URL, KV_REST_API_TOKEN, KV_REST_API_READ_ONLY_TOKEN
```

### Patrones de uso

```typescript
import { kv } from '@vercel/kv'

// Rate limiting en route handler
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
  const key = `rate_limit:${ip}`

  const requests = await kv.incr(key)
  if (requests === 1) {
    await kv.expire(key, 60) // Reset cada minuto
  }
  if (requests > 10) {
    return new Response('Too Many Requests', { status: 429 })
  }

  // ... resto del handler
}

// Session store
await kv.set(`session:${sessionId}`, userData, { ex: 3600 }) // Expira en 1h
const session = await kv.get<UserData>(`session:${sessionId}`)
await kv.del(`session:${sessionId}`) // Logout

// Caché de respuestas costosas
const cacheKey = `dashboard:${userId}`
const cached = await kv.get(cacheKey)
if (cached) return Response.json(cached)

const data = await expensiveQuery()
await kv.set(cacheKey, data, { ex: 300 }) // Cache 5 minutos
return Response.json(data)

// Pipeline para múltiples operaciones
const pipeline = kv.pipeline()
pipeline.incr('page_views')
pipeline.lpush('recent_users', userId)
pipeline.ltrim('recent_users', 0, 99) // Mantener solo los últimos 100
await pipeline.exec()
```

---

## Vercel Blob

Almacenamiento de archivos sin necesidad de S3 o Supabase Storage.

### Setup

```bash
npm install @vercel/blob
# Variables automáticas: BLOB_READ_WRITE_TOKEN
```

### Upload desde Server Action

```typescript
// app/actions/upload.ts
'use server'

import { put, del, list } from '@vercel/blob'

export async function uploadFile(formData: FormData) {
  const file = formData.get('file') as File
  if (!file) throw new Error('No file provided')

  // Validar tipo y tamaño
  if (!file.type.startsWith('image/')) {
    throw new Error('Only images allowed')
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File too large (max 5MB)')
  }

  const blob = await put(`uploads/${Date.now()}-${file.name}`, file, {
    access: 'public',
    contentType: file.type,
  })

  return { url: blob.url, pathname: blob.pathname }
}

export async function deleteFile(url: string) {
  await del(url)
}

export async function listFiles(prefix: string) {
  const { blobs } = await list({ prefix, limit: 100 })
  return blobs
}
```

### Upload directo desde cliente (Client Upload)

Para archivos grandes, usar Client Upload para evitar pasar el archivo por el servidor:

```typescript
// app/components/uploader.tsx
'use client'

import { upload } from '@vercel/blob/client'
import { useState } from 'react'

export function Uploader() {
  const [url, setUrl] = useState<string>()

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const blob = await upload(file.name, file, {
      access: 'public',
      handleUploadUrl: '/api/upload', // Route que genera el token
    })

    setUrl(blob.url)
  }

  return (
    <div>
      <input type="file" onChange={handleUpload} />
      {url && <img src={url} alt="Uploaded" />}
    </div>
  )
}
```

```typescript
// app/api/upload/route.ts
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => ({
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maximumSizeInBytes: 10 * 1024 * 1024, // 10MB
      }),
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Guardar URL en Supabase después del upload
        console.log('Upload completed:', blob.url)
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
```

---

## Cron Jobs en Vercel

Alternativa a n8n para tareas programadas simples (Pro requerido para schedules más frecuentes).

### vercel.json

```json
{
  "crons": [
    { "path": "/api/cron/send-digest", "schedule": "0 9 * * 1" },
    { "path": "/api/cron/sync-data",   "schedule": "*/15 * * * *" }
  ]
}
```

Sintaxis cron estándar: `minuto hora día-mes mes día-semana`

### Route handler para cron

```typescript
// app/api/cron/send-digest/route.ts
export const maxDuration = 60 // segundos (requiere Pro)

export async function GET(request: Request) {
  // Verificar que la request viene de Vercel Cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    // Tu lógica aquí
    const result = await sendWeeklyDigest()
    return Response.json({ success: true, sent: result.count })
  } catch (error) {
    console.error('Cron job failed:', error)
    return Response.json({ success: false }, { status: 500 })
  }
}
```

Agregar `CRON_SECRET` en Vercel env (Vercel lo envía automáticamente en el header `authorization`).

---

## Vercel Analytics y Speed Insights

### Setup

```bash
npm install @vercel/analytics @vercel/speed-insights
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

### Custom events para Analytics

```typescript
import { track } from '@vercel/analytics'

// En cualquier componente cliente
track('Purchase', {
  amount: 99.99,
  currency: 'USD',
  plan: 'pro',
})

track('Button Clicked', { label: 'hero-cta' })
```

---

## Build Cache y .vercelignore

### .vercelignore

```
# Ignorar archivos de desarrollo
.env.local
.env.development
*.log
node_modules/.cache

# Ignorar archivos de test
**/*.test.ts
**/*.spec.ts
__tests__/
coverage/

# Ignorar documentación
docs/
*.md
!README.md
```

### Invalidar caché de build manualmente

```bash
# En CLI: forzar rebuild sin caché
vercel --force

# En dashboard: Settings → Build & Development → Clear Build Cache
```

### Optimizar el caché de Next.js en Vercel

Vercel preserva automáticamente `.next/cache` entre deploys del mismo proyecto. Para maximizar el hit rate:

```json
// package.json
{
  "scripts": {
    "build": "next build",
    "build:clean": "rm -rf .next && next build"
  }
}
```

No borrar `.next/cache` a menos que haya problemas, ya que ralentiza el build significativamente.
