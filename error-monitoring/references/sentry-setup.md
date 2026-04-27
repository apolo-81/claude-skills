# Sentry — Configuración Completa para Next.js 15

Stack: Next.js 15 App Router + TypeScript + Supabase + Vercel

---

## Instalación

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

El wizard pregunta:
1. Si usar Sentry SaaS o self-hosted → SaaS
2. Si agregar ejemplos de código → Sí (para verificar que funciona)
3. CI provider → GitHub Actions (o None si no aplica)

El wizard crea y modifica automáticamente:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `instrumentation.ts`
- `next.config.ts` (agrega `withSentryConfig`)
- `.env.local` (agrega `SENTRY_DSN`)
- `.gitignore` (agrega `.env.sentry-build-plugin`)

---

## Variables de Entorno

```bash
# .env.local — para desarrollo y producción
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
NEXT_PUBLIC_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0

# Para source maps en build (NO commitear, agregar a .gitignore)
SENTRY_AUTH_TOKEN=sntrys_eyJ...
SENTRY_ORG=nombre-de-tu-org
SENTRY_PROJECT=nombre-del-proyecto
```

**En Vercel:** ir a Project Settings > Environment Variables y agregar todas. El `SENTRY_AUTH_TOKEN` va solo en el entorno de "Build" (no en Runtime).

**Cómo obtener el auth token:** Sentry Dashboard > Settings > Auth Tokens > Create New Token, con scopes `project:releases` y `org:read`.

---

## Archivos de Configuración

### `sentry.client.config.ts`

Se ejecuta en el navegador del usuario. Inicializa Sentry para capturar errores de JS del lado cliente.

```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Entorno: distingue errores de production vs preview vs development
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,

  // Performance monitoring: % de requests a trazar
  // En prod: 10% para no saturar el plan. En dev: 100%
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session Replay: graba pantalla cuando hay un error
  // replaysOnErrorSampleRate: 1.0, // 100% de sesiones con error
  // replaysSessionSampleRate: 0.1, // 10% de sesiones normales

  // No capturar en desarrollo local (comentar para testear)
  enabled: process.env.NODE_ENV === 'production',

  // Errores conocidos que no queremos en Sentry
  ignoreErrors: [
    // Errores de extensiones de navegador
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    // Errores de red del usuario (no son bugs del código)
    'NetworkError',
    'Failed to fetch',
    'Load failed',
    // Errores de navegadores viejos que no soportamos
    "Can't find variable: __sentryRewriteFrames",
  ],

  // No capturar errores de scripts de terceros
  denyUrls: [
    /extensions\//i,
    /^chrome:\/\//i,
    /^chrome-extension:\/\//i,
    /googletagmanager\.com/i,
    /hotjar\.com/i,
  ],

  beforeSend(event, hint) {
    // Filtrar errores que no queremos enviar a Sentry
    const error = hint.originalException
    if (error instanceof Error) {
      // Ignorar errores de cancelación de requests (usuario navegó a otra página)
      if (error.name === 'AbortError') return null
    }
    return event
  },
})
```

### `sentry.server.config.ts`

Se ejecuta en Node.js (servidor de Next.js). Captura errores de Server Components, Server Actions y Route Handlers.

```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  enabled: process.env.NODE_ENV === 'production',

  // Spotlight: debug de errores de servidor en desarrollo
  // spotlight: process.env.NODE_ENV === 'development',
})
```

### `sentry.edge.config.ts`

Se ejecuta en el Edge Runtime (middleware de Next.js). Tiene un subset limitado de APIs disponibles.

```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,

  // Edge tiene overhead mayor, samplear menos
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,

  enabled: process.env.NODE_ENV === 'production',
})
```

### `instrumentation.ts`

```typescript
// app/instrumentation.ts — se ejecuta antes de que arranque el servidor
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config')
  }
}

// Capturar errores de request handler (Next.js 15+)
export const onRequestError = Sentry.captureRequestError
```

**Importante:** `instrumentation.ts` debe estar en la raíz del proyecto (al mismo nivel que `app/`), no dentro de `app/`.

Activar en `next.config.ts`:

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    instrumentationHook: true, // requerido en Next.js 14, automático en 15
  },
}
```

---

## `next.config.ts` con Sentry

```typescript
import { withSentryConfig } from '@sentry/nextjs'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // tu configuración existente
}

export default withSentryConfig(nextConfig, {
  // Organización y proyecto de Sentry
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Silenciar logs de Sentry en el build
  silent: !process.env.CI,

  // Source maps: subir al build para ver código fuente en errores
  widenClientFileUpload: true,

  // Ocultar source maps del bundle público (solo Sentry los ve)
  hideSourceMaps: true,

  // Deshabilitar el logger de Sentry en el bundle de cliente (reduce bundle size)
  disableLogger: true,

  // Tunneling: evitar ad-blockers que bloquean requests a sentry.io
  // tunnelRoute: '/monitoring',

  // Automáticamente crear releases asociadas a deploys de Vercel
  automaticVercelMonitors: true,
})
```

---

## Performance Monitoring

### Traces y Transactions

Sentry agrupa operaciones relacionadas en una "transaction" (ej: el tiempo total de un request).

```typescript
// Crear un span manual para medir una operación crítica
import * as Sentry from '@sentry/nextjs'

async function fetchUserData(userId: string) {
  return Sentry.startSpan(
    {
      name: 'fetchUserData',
      op: 'db.query',
      attributes: { userId },
    },
    async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
    }
  )
}
```

### Sampling por Ambiente

```typescript
// En sentry.client.config.ts
tracesSampler: (samplingContext) => {
  // 100% en desarrollo para ver todo
  if (process.env.NODE_ENV === 'development') return 1.0

  // Preview deployments: 50%
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview') return 0.5

  // Producción: 10% general, pero 100% para rutas críticas
  const url = samplingContext.request?.url ?? ''
  if (url.includes('/api/checkout') || url.includes('/api/webhooks')) {
    return 1.0
  }

  return 0.1
},
```

---

## Tags y Contexto Personalizado

```typescript
// Agregar contexto que aparece en todos los errores de esa sesión
Sentry.setTag('app_version', process.env.NEXT_PUBLIC_APP_VERSION)
Sentry.setTag('plan', user.plan)          // 'free' | 'pro' | 'enterprise'
Sentry.setTag('locale', user.locale)      // 'es' | 'en'

// Contexto adicional para debugging (no filtrable, pero visible en el error)
Sentry.setContext('feature_flags', {
  newCheckout: true,
  betaDashboard: false,
})

// Capturar error con contexto específico del momento
Sentry.captureException(error, {
  tags: {
    action: 'processCheckout',
    paymentProvider: 'stripe',
  },
  extra: {
    cartItems: cart.items.length,
    totalAmount: cart.total,
    currency: cart.currency,
  },
  level: 'error', // 'fatal' | 'error' | 'warning' | 'info' | 'debug'
})
```

---

## Releases y Deploy Tracking

Sentry puede correlacionar errores con deploys específicos. Con `automaticVercelMonitors: true` en `withSentryConfig`, esto es automático en Vercel.

Para CI/CD manual:

```bash
# En el pipeline de CI, después del build
npx sentry-cli releases new "$VERSION"
npx sentry-cli releases set-commits "$VERSION" --auto
npx sentry-cli releases finalize "$VERSION"
npx sentry-cli releases deploys "$VERSION" new -e production
```

---

## Ignorar Errores Conocidos

```typescript
// sentry.client.config.ts
ignoreErrors: [
  // TypeError genérico de extensiones
  /^TypeError: Cannot read properties of undefined/,

  // Error específico conocido que no es un bug
  'ChunkLoadError',

  // Errores de navegación (usuario cancela antes de cargar)
  /Hydration failed/,
],

denyUrls: [
  // Scripts de analytics de terceros
  /googletagmanager\.com/,
  /analytics\.google\.com/,
  /hotjar\.com/,
  /intercom\.io/,
],
```

---

## Verificar que Sentry Funciona

### 1. Error de cliente

```typescript
// app/(dev)/sentry-test/page.tsx — solo en desarrollo
'use client'

import * as Sentry from '@sentry/nextjs'

export default function SentryTestPage() {
  return (
    <div className="p-8 space-y-4">
      <h1>Test de Sentry</h1>
      <button
        onClick={() => {
          throw new Error('Test error de cliente — ' + new Date().toISOString())
        }}
      >
        Lanzar error de cliente
      </button>
      <button
        onClick={() => {
          Sentry.captureMessage('Mensaje de test desde cliente', 'info')
        }}
      >
        Enviar mensaje (sin error)
      </button>
    </div>
  )
}
```

### 2. Error de servidor

```typescript
// app/api/sentry-test/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  // Bloquear en producción
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  throw new Error('Test error de servidor — ' + new Date().toISOString())
}
```

### 3. Checklist de verificación

Después de hacer el deploy a producción:

- [ ] El error aparece en Sentry Dashboard dentro de los 30 segundos
- [ ] El stack trace muestra líneas del código fuente (no del bundle minificado)
- [ ] El error tiene el usuario asociado (`user.id`, `user.email`)
- [ ] El environment es "production" (no "development")
- [ ] Las tags personalizadas aparecen en el error
- [ ] Llega la notificación a Slack (si está configurado)

---

## Configurar Alertas en Sentry Dashboard

1. Ir a **Alerts > Create Alert Rule**
2. Tipos recomendados:

**Alert de tasa de error:**
- Condition: `Number of events > 10`
- Time window: `5 minutes`
- Environment: `production`
- Action: Notify Slack channel `#bugs-produccion`

**Alert de nuevo issue:**
- Condition: `A new issue is created`
- Filter: `issue.priority: critical OR high`
- Action: Notify Slack + email del equipo

**Alert de regresión:**
- Condition: `A resolved issue re-appears`
- Action: Notify Slack + asignar al owner del issue

---

## Integración con Supabase

Los errores de RLS (Row Level Security) y queries fallidas no llegan a Sentry automáticamente. Capturarlos explícitamente:

```typescript
// lib/supabase/client-with-monitoring.ts
import { createClient } from '@/lib/supabase/client'
import * as Sentry from '@sentry/nextjs'

export function createMonitoredClient() {
  const supabase = createClient()
  return supabase
}

// Helper para queries con monitoring
export async function queryWithMonitoring<T>(
  queryFn: () => Promise<{ data: T | null; error: unknown }>,
  context: { table: string; operation: string; userId?: string }
): Promise<T> {
  const { data, error } = await queryFn()

  if (error) {
    Sentry.captureException(error, {
      tags: {
        table: context.table,
        operation: context.operation,
        type: 'supabase_error',
      },
      extra: { userId: context.userId },
    })
    throw error
  }

  if (!data) {
    throw new Error(`No data returned from ${context.table}.${context.operation}`)
  }

  return data
}
```
