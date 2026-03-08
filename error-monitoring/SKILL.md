---
name: error-monitoring
description: >
  Use when setting up error tracking, handling errors gracefully, implementing
  error boundaries, or adding logging to a Next.js app. Trigger for: "Sentry",
  "error tracking", "error monitoring", "crash reporting", "error boundary",
  "ErrorBoundary", "logging", "logs", "logger", "structured logging",
  "manejo de errores", "capturar errores", "errores en producción", "bug tracking",
  "exception handling", "try catch", "error en producción", "debug en producción",
  "alertas de errores", "monitoring", "observabilidad", "observability",
  "toast de error", "feedback de error al usuario", "fallback UI",
  "graceful degradation", "error page", "500 page", "not-found page".
---

# Error Monitoring — Next.js 15 App Router

Stack: Next.js 15 App Router + React + TypeScript + Supabase + Vercel

---

## 1. Por qué el error monitoring importa

Sin monitoreo de errores en producción, los fallos son invisibles hasta que un usuario se queja. El equipo reacciona en lugar de prevenir.

**Stack de observabilidad mínimo para este proyecto:**

| Herramienta | Responsabilidad |
|---|---|
| Sentry | Excepciones, crashes, errores de JS y servidor |
| Vercel Analytics | Performance, Web Vitals, errores de red |
| Supabase Dashboard | Logs de queries, errores de DB, RLS violations |

**Cuándo usar cada uno:**
- **Sentry**: excepciones inesperadas, errores de runtime, crashes
- **Logger estructurado**: eventos de negocio (pago procesado, usuario registrado, email enviado)
- **Vercel Logs**: debugging rápido en producción sin salir del dashboard

---

## 2. Sentry — Setup en 10 minutos

Ver `references/sentry-setup.md` para configuración completa con todos los archivos.

**Instalación:**

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

El wizard crea automáticamente `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` e `instrumentation.ts`.

**Variables de entorno requeridas:**

```bash
# .env.local
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
NEXT_PUBLIC_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0

# Solo para CI/CD (source maps en build)
SENTRY_AUTH_TOKEN=sntrys_...
SENTRY_ORG=mi-org
SENTRY_PROJECT=mi-proyecto
```

---

## 3. Error Boundaries en App Router

Next.js 15 usa archivos especiales para capturar errores en distintos niveles del árbol de componentes.

### `app/error.tsx` — Errores en rutas

```typescript
'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Reportar a Sentry automáticamente cuando el boundary captura el error
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4 max-w-md px-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Algo salió mal
        </h2>
        <p className="text-sm text-gray-500">
          Ocurrió un error inesperado. El equipo fue notificado.
        </p>
        {/* digest: ID único del error para correlacionar con logs de servidor */}
        {error.digest && (
          <p className="text-xs text-gray-400 font-mono">
            ID: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    </div>
  )
}
```

### `app/global-error.tsx` — Errores en el root layout

Mismo patrón que `error.tsx` pero **debe incluir `<html>` y `<body>`** porque reemplaza el root layout completo. Llamar `Sentry.captureException(error)` en el `useEffect`.

### `app/not-found.tsx` — Páginas 404

Archivo estático sin lógica de Sentry (los 404 no son excepciones). Mostrar mensaje amigable y enlace a `/`.

### Error boundaries anidados

Poner `error.tsx` a nivel de segmento cuando una sección puede fallar sin afectar el resto:

```
app/
├── error.tsx              # fallback global
├── dashboard/
│   ├── error.tsx          # solo falla el dashboard, no el resto
│   └── analytics/
│       └── error.tsx      # aísla el widget de analytics
└── (marketing)/
    └── page.tsx           # sin error.tsx: usa el global
```

---

## 4. Server-side Error Handling

El `error.tsx` solo captura errores que llegan al render del componente. Los errores en Server Actions y API routes necesitan captura explícita.

### Server Actions

```typescript
// app/actions/checkout.ts
'use server'

import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/logger'

export async function processCheckout(formData: FormData) {
  const userId = formData.get('userId') as string

  try {
    // lógica de checkout
    const result = await stripe.checkout.create({ ... })

    logger.info('Checkout completado', { userId, sessionId: result.id })
    return { success: true, sessionId: result.id }
  } catch (error) {
    // Capturar con contexto para debugging
    Sentry.captureException(error, {
      tags: { action: 'processCheckout' },
      extra: {
        userId,
        formData: Object.fromEntries(formData),
      },
    })

    logger.error('Error en checkout', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    })

    // Nunca exponer detalles internos al cliente
    return { error: 'Error al procesar el pago. El equipo fue notificado.' }
  }
}
```

### Con `Sentry.withServerActionInstrumentation` (tracing automático)

```typescript
'use server'
import * as Sentry from '@sentry/nextjs'

export const myAction = Sentry.withServerActionInstrumentation(
  'myAction',
  { formData: true, recordResponse: true },
  async (formData: FormData) => {
    const data = await fetchSomething()
    return { data }
  }
)
```

### Route Handlers

Mismo patrón `try/catch`: capturar con `Sentry.captureException(error, { tags: { handler: 'nombre' } })` y responder con `NextResponse.json({ error: 'mensaje genérico' }, { status: 400 })`.

---

## 5. Logging Estructurado

```typescript
// lib/logger.ts
type LogLevel = 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  environment: string | undefined
  [key: string]: unknown
}

function log(
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>
): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    environment: process.env.NODE_ENV,
    ...meta,
  }

  if (process.env.NODE_ENV === 'production') {
    // JSON estructurado: parseable por Vercel Logs, Datadog, Logtail
    console[level](JSON.stringify(entry))
  } else {
    // Legible en desarrollo local
    const meta_str = meta ? JSON.stringify(meta, null, 2) : ''
    console[level](`[${level.toUpperCase()}] ${message}`, meta_str)
  }
}

export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => log('info', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log('warn', msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log('error', msg, meta),
}
```

**Uso correcto del logger:**

```typescript
// Evento de negocio — usa logger, no Sentry
logger.info('Suscripción creada', {
  userId,
  plan: 'pro',
  billingCycle: 'annual',
  amount: 99,
})

// Error de negocio esperado — logger + return de error
logger.warn('Intento de pago fallido', {
  userId,
  reason: 'card_declined',
  attempts: 3,
})

// Error inesperado — Sentry + logger
Sentry.captureException(error)
logger.error('Error inesperado en facturación', {
  userId,
  error: error.message,
})
```

---

## 6. User Feedback en Errores

### Reglas

1. Nunca mostrar stack traces, mensajes de DB ni rutas internas al usuario
2. Siempre loguear el error completo en el servidor
3. Mostrar un mensaje amigable + acción clara (reintentar, volver al inicio)
4. Incluir un ID de referencia (`error.digest`) para que el usuario pueda reportarlo

### Toasts de error con Sonner

```typescript
// hooks/use-action.ts
import { toast } from 'sonner'

export function useAction<T>(
  action: (data: FormData) => Promise<{ error?: string; data?: T }>
) {
  const [isPending, startTransition] = useTransition()

  const execute = (formData: FormData) => {
    startTransition(async () => {
      const result = await action(formData)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Operación completada')
    })
  }

  return { execute, isPending }
}
```

### Sentry User Feedback

```typescript
// En el componente de error, después del captureException
const handleFeedback = () => {
  const eventId = Sentry.lastEventId()
  if (eventId) Sentry.showReportDialog({ eventId })
}
// Agregar un botón: "Reportar qué estabas haciendo"
```

---

## 7. Asociar Errores con Usuarios

Después del login, pasar el usuario a Sentry para correlacionar errores:

```typescript
// app/(auth)/layout.tsx o en el provider de sesión
import * as Sentry from '@sentry/nextjs'
import { createClient } from '@/lib/supabase/server'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Server-side: en middleware o en el layout
    Sentry.setUser({
      id: user.id,
      email: user.email,
    })
  }

  return <>{children}</>
}
```

```typescript
// En el cliente, después del login
'use client'
import * as Sentry from '@sentry/nextjs'

function onLoginSuccess(user: User) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.user_metadata?.username,
  })

  // Tags para filtrar errores por plan, role, etc.
  Sentry.setTag('plan', user.user_metadata?.plan ?? 'free')
  Sentry.setTag('role', user.user_metadata?.role ?? 'user')
}

// Al hacer logout
function onLogout() {
  Sentry.setUser(null)
}
```

---

## 8. Alertas y Notificaciones

**Configurar en Sentry Dashboard > Alerts:**

- **Alert de tasa de error**: notificar cuando `error rate > 5% en 5 minutos`
- **Alert de nuevo issue**: notificar cuando aparece un tipo de error nuevo (nunca visto antes)
- **Alert de regresión**: notificar cuando un error resuelto reaparece

**Por qué no alertar cada error individual:**
- Alert fatigue: el equipo ignora notificaciones si son constantes
- Sentry agrupa errores por fingerprint (mismo stack trace = mismo issue)
- Mejor configurar umbrales: "más de 10 ocurrencias en 10 minutos"

**Integración con Slack:**
En Sentry > Settings > Integrations > Slack, configurar para que los issues críticos lleguen al canal `#bugs-produccion`.

---

## 9. Graceful Degradation

### Skeleton loading vs error state

```typescript
// Preferir mostrar skeleton hasta confirmar el error
function DataSection() {
  const { data, error, isLoading } = useSWR('/api/data', fetcher)

  if (isLoading) return <DataSkeleton />

  // Si falla: mostrar estado de error con opción de reintentar
  if (error) return <ErrorState onRetry={() => mutate()} />

  return <DataDisplay data={data} />
}
```

### Fallback a datos cacheados

```typescript
// En fetch de servidor: preferir datos viejos a error visible
async function getDashboardData(userId: string) {
  try {
    const fresh = await fetchFromSupabase(userId)
    await cache.set(`dashboard:${userId}`, fresh, { ttl: 300 })
    return fresh
  } catch (error) {
    Sentry.captureException(error, { tags: { fallback: 'cache' } })

    // Intentar servir datos cacheados
    const cached = await cache.get(`dashboard:${userId}`)
    if (cached) {
      logger.warn('Sirviendo datos cacheados por error en fetch', { userId })
      return { ...cached, stale: true }
    }

    // Sin cache: propagar el error para que el boundary lo capture
    throw error
  }
}
```

---

## 10. Testing que Sentry Funciona

```typescript
// app/api/sentry-test/route.ts (solo en desarrollo)
import { NextResponse } from 'next/server'

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 })
  }

  throw new Error('Test error de Sentry — si ves esto en el dashboard, funciona')
}
```

Verificar en Sentry Dashboard que el error llega con:
- Stack trace completo
- Usuario asociado (si hay sesión)
- Environment correcto (development/production)
- Source maps resueltos (líneas del código fuente, no del bundle)

---

## Referencias

- `references/sentry-setup.md` — Configuración completa de archivos Sentry
- `references/error-patterns.md` — Result pattern, typed errors, retry, circuit breaker
