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

## 1. Stack de observabilidad

| Herramienta | Responsabilidad |
|---|---|
| Sentry | Excepciones, crashes, errores JS y servidor |
| Vercel Analytics | Performance, Web Vitals, errores de red |
| Supabase Dashboard | Logs de queries, errores de DB, RLS violations |

- **Sentry**: excepciones inesperadas, crashes
- **Logger estructurado**: eventos de negocio (pago, registro, email)
- **Vercel Logs**: debugging rapido en produccion

## 2. Sentry Setup

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

El wizard crea `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` e `instrumentation.ts`.

```bash
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
NEXT_PUBLIC_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
SENTRY_AUTH_TOKEN=sntrys_...  # CI/CD only
SENTRY_ORG=mi-org
SENTRY_PROJECT=mi-proyecto
```

Ver `references/sentry-setup.md` para configuracion completa de archivos.

## 3. Error Boundaries en App Router

### `app/error.tsx` — Errores en rutas

Ver `references/error-components.md` para componente completo con Sentry + UI.

Patron clave: `useEffect(() => Sentry.captureException(error), [error])` + boton reset + mostrar `error.digest` para correlacion.

### `app/global-error.tsx`
Mismo patron pero **debe incluir `<html>` y `<body>`** (reemplaza root layout).

### `app/not-found.tsx`
Archivo estatico sin Sentry (404 no son excepciones). Mensaje amigable + enlace a `/`.

### Error boundaries anidados

```
app/
├── error.tsx              # fallback global
├── dashboard/
│   ├── error.tsx          # solo falla dashboard
│   └── analytics/
│       └── error.tsx      # aisla widget de analytics
```

## 4. Server-side Error Handling

### Server Actions

Patron: try/catch con `Sentry.captureException(error, { tags, extra })` + `logger.error()` + retornar mensaje generico al cliente.

Para tracing automatico: `Sentry.withServerActionInstrumentation('actionName', { formData: true, recordResponse: true }, async (formData) => { ... })`

### Route Handlers

Mismo patron try/catch: `Sentry.captureException` + `NextResponse.json({ error: 'mensaje generico' }, { status: 400 })`.

## 5. Logging Estructurado

Ver `references/error-components.md` para implementacion completa de `lib/logger.ts`.

Patron: JSON estructurado en produccion (parseable por Vercel Logs, Datadog, Logtail), formato legible en desarrollo.

**Cuando usar que:**
- `logger.info()` — eventos de negocio (suscripcion creada, pago procesado)
- `logger.warn()` — errores esperados (card_declined, rate limit)
- `Sentry.captureException()` + `logger.error()` — errores inesperados

## 6. User Feedback en Errores

**Reglas:**
1. Nunca mostrar stack traces, mensajes de DB ni rutas internas
2. Siempre loguear error completo en servidor
3. Mensaje amigable + accion clara (reintentar, volver al inicio)
4. Incluir `error.digest` como ID de referencia

**Toasts con Sonner:** usar `useAction` hook que llama `toast.error(result.error)` o `toast.success()`. Ver `references/error-components.md`.

**Sentry User Feedback:** `Sentry.showReportDialog({ eventId: Sentry.lastEventId() })`

## 7. Asociar Errores con Usuarios

```typescript
// Server-side: en layout o middleware
Sentry.setUser({ id: user.id, email: user.email })
// Client-side: despues del login
Sentry.setUser({ id: user.id, email: user.email })
Sentry.setTag('plan', user.user_metadata?.plan ?? 'free')
// Logout
Sentry.setUser(null)
```

## 8. Alertas y Notificaciones

**Configurar en Sentry Dashboard > Alerts:**
- Error rate > 5% en 5 minutos
- Nuevo issue (tipo de error nunca visto)
- Regresion (error resuelto reaparece)

Configurar umbrales, no alertar cada error individual. Integracion Slack: Settings > Integrations > Slack → canal `#bugs-produccion`.

## 9. Graceful Degradation

**Patron skeleton → error state:**
```typescript
if (isLoading) return <DataSkeleton />
if (error) return <ErrorState onRetry={() => mutate()} />
return <DataDisplay data={data} />
```

**Fallback a cache:** try fetch fresco → cache.set → catch → cache.get → si hay cache servir con `{ stale: true }` → si no hay cache, throw para boundary.

## 10. Testing Sentry

```typescript
// app/api/sentry-test/route.ts (solo desarrollo)
export async function GET() {
  if (process.env.NODE_ENV === 'production') return NextResponse.json({ error: 'Not available' }, { status: 404 })
  throw new Error('Test error de Sentry')
}
```

Verificar: stack trace completo, usuario asociado, environment correcto, source maps resueltos.

## Referencias

- `references/sentry-setup.md` — Configuracion completa de archivos Sentry
- `references/error-patterns.md` — Result pattern, typed errors, retry, circuit breaker
- `references/error-components.md` — error.tsx, logger.ts, useAction hook (code completo)
