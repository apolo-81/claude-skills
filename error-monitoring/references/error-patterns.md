# Error Patterns — TypeScript + Next.js 15

Patrones avanzados de manejo de errores. Todos funcionales con Next.js 15 App Router.

---

## 1. Result Pattern (sin excepciones)

Evita el uso de `try/catch` en cada llamada. El tipo `Result<T>` hace que los errores sean explícitos en la firma de la función.

```typescript
// lib/types/result.ts
export type Result<T, E = string> =
  | { ok: true; data: T }
  | { ok: false; error: E }

export function ok<T>(data: T): Result<T, never> {
  return { ok: true, data }
}

export function err<E = string>(error: E): Result<never, E> {
  return { ok: false, error }
}

// Uso en una función
async function getUserById(userId: string): Promise<Result<User>> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return err(`Usuario no encontrado: ${error.message}`)
  if (!data) return err('Usuario no encontrado')

  return ok(data)
}

// Consumo — TypeScript fuerza a manejar ambos casos
const result = await getUserById(userId)

if (!result.ok) {
  logger.warn('Usuario no encontrado', { userId, error: result.error })
  return redirect('/login')
}

// Aquí result.data está disponible y tipado
const user = result.data
```

### Result con errores tipados

```typescript
// Para distinguir tipos de error en el caller
type GetUserError =
  | { type: 'not_found' }
  | { type: 'unauthorized' }
  | { type: 'db_error'; message: string }

async function getUser(
  userId: string,
  requesterId: string
): Promise<Result<User, GetUserError>> {
  if (userId !== requesterId) {
    return err({ type: 'unauthorized' })
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return err({ type: 'db_error', message: error.message })
  if (!data) return err({ type: 'not_found' })

  return ok(data)
}

// El caller puede manejar cada caso
const result = await getUser(userId, session.userId)

if (!result.ok) {
  switch (result.error.type) {
    case 'not_found':
      return notFound()
    case 'unauthorized':
      return redirect('/403')
    case 'db_error':
      Sentry.captureException(new Error(result.error.message))
      throw new Error('Error de base de datos')
  }
}
```

---

## 2. Typed Errors con Clases

Permite distinguir el tipo de error con `instanceof` y agregar propiedades específicas.

```typescript
// lib/errors.ts

// Error base con soporte para causa y metadata
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    options?: ErrorOptions
  ) {
    super(message, options)
    this.name = this.constructor.name
    // Mantener stack trace en V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      id ? `${resource} con id "${id}" no encontrado` : `${resource} no encontrado`,
      'NOT_FOUND',
      404
    )
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly fields?: Record<string, string[]>
  ) {
    super(message, 'VALIDATION_ERROR', 400)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 'UNAUTHORIZED', 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acceso denegado') {
    super(message, 'FORBIDDEN', 403)
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409)
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, cause: unknown) {
    super(
      `Error en servicio externo: ${service}`,
      'EXTERNAL_SERVICE_ERROR',
      502,
      { cause }
    )
  }
}
```

### Uso en Route Handlers

```typescript
// app/api/users/[id]/route.ts
import { NotFoundError, UnauthorizedError, AppError } from '@/lib/errors'
import * as Sentry from '@sentry/nextjs'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserById(params.id)
    return NextResponse.json(user)
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }

    // Error inesperado: loguear y responder genéricamente
    Sentry.captureException(error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
```

---

## 3. `invariant` Helper

Assertions con mensajes descriptivos. Falla rápido si una condición que debería ser verdadera no lo es.

```typescript
// lib/invariant.ts
export function invariant(
  condition: unknown,
  message: string | (() => string)
): asserts condition {
  if (!condition) {
    const msg = typeof message === 'function' ? message() : message
    throw new Error(`Invariant violated: ${msg}`)
  }
}

// Variante que nunca llega al runtime (para tipos)
export function assertDefined<T>(
  value: T | null | undefined,
  message: string
): asserts value is T {
  invariant(value !== null && value !== undefined, message)
}
```

```typescript
// Uso
import { invariant, assertDefined } from '@/lib/invariant'

async function processPayment(orderId: string) {
  const order = await getOrder(orderId)

  // Falla con mensaje claro en vez de "Cannot read property of null"
  assertDefined(order, `Orden ${orderId} no encontrada al procesar pago`)

  invariant(
    order.status === 'pending',
    `Orden ${orderId} no puede procesarse: estado actual es "${order.status}"`
  )

  invariant(
    order.total > 0,
    () => `Total inválido para orden ${orderId}: ${order.total}`
  )

  // Aquí order está tipado sin null, con estado garantizado
  await stripe.checkout.create({ amount: order.total })
}
```

---

## 4. Error Serialization para Server Actions

Los Server Actions de Next.js 15 no pueden pasar objetos de Error directamente al cliente. Se deben serializar.

```typescript
// lib/action-error.ts
export type ActionError = {
  code: string
  message: string
  fields?: Record<string, string[]>  // Para errores de validación por campo
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: ActionError }

export function actionError(
  code: string,
  message: string,
  fields?: Record<string, string[]>
): { success: false; error: ActionError } {
  return { success: false, error: { code, message, fields } }
}

export function actionSuccess<T>(data: T): { success: true; data: T } {
  return { success: true, data }
}
```

```typescript
// app/actions/create-project.ts
'use server'

import { z } from 'zod'
import * as Sentry from '@sentry/nextjs'
import { actionError, actionSuccess, ActionResult } from '@/lib/action-error'
import { logger } from '@/lib/logger'

const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100),
  description: z.string().optional(),
})

export async function createProject(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const parsed = CreateProjectSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
  })

  if (!parsed.success) {
    return actionError(
      'VALIDATION_ERROR',
      'Datos inválidos',
      parsed.error.flatten().fieldErrors
    )
  }

  try {
    const project = await db.projects.create(parsed.data)
    logger.info('Proyecto creado', { projectId: project.id })
    return actionSuccess({ id: project.id })
  } catch (error) {
    Sentry.captureException(error)
    return actionError('INTERNAL_ERROR', 'Error al crear el proyecto')
  }
}
```

```typescript
// app/dashboard/new-project/page.tsx (cliente)
'use client'

import { createProject } from '@/app/actions/create-project'
import { toast } from 'sonner'

export default function NewProjectPage() {
  async function handleSubmit(formData: FormData) {
    const result = await createProject(formData)

    if (!result.success) {
      if (result.error.fields) {
        // Mostrar errores por campo en el formulario
        Object.entries(result.error.fields).forEach(([field, errors]) => {
          toast.error(`${field}: ${errors[0]}`)
        })
      } else {
        toast.error(result.error.message)
      }
      return
    }

    toast.success('Proyecto creado')
    // result.data.id disponible y tipado
  }

  return <form action={handleSubmit}>{/* ... */}</form>
}
```

---

## 5. Retry con Exponential Backoff

```typescript
// lib/retry.ts
interface RetryOptions {
  maxAttempts?: number
  initialDelayMs?: number
  maxDelayMs?: number
  backoffFactor?: number
  shouldRetry?: (error: unknown, attempt: number) => boolean
  onRetry?: (error: unknown, attempt: number) => void
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelayMs = 500,
    maxDelayMs = 10_000,
    backoffFactor = 2,
    shouldRetry = () => true,
    onRetry,
  } = options

  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (attempt === maxAttempts || !shouldRetry(error, attempt)) {
        break
      }

      const delay = Math.min(
        initialDelayMs * backoffFactor ** (attempt - 1),
        maxDelayMs
      )

      // Agregar jitter para evitar thundering herd
      const jitter = Math.random() * delay * 0.1
      const totalDelay = delay + jitter

      onRetry?.(error, attempt)
      await new Promise((resolve) => setTimeout(resolve, totalDelay))
    }
  }

  throw lastError
}
```

```typescript
// Uso
import { withRetry, ExternalServiceError } from '@/lib'

const emailSent = await withRetry(
  () => sendEmailViaResend({ to: user.email, subject: '...', body: '...' }),
  {
    maxAttempts: 3,
    initialDelayMs: 1000,
    shouldRetry: (error) => {
      // Solo reintentar errores de red/timeout, no de validación
      if (error instanceof ExternalServiceError) return true
      if (error instanceof ValidationError) return false
      return true
    },
    onRetry: (error, attempt) => {
      logger.warn('Reintentando envío de email', { attempt, error: String(error) })
    },
  }
)
```

---

## 6. Timeout en Fetch con AbortController

```typescript
// lib/fetch-with-timeout.ts
export async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeoutMs?: number } = {}
): Promise<Response> {
  const { timeoutMs = 10_000, ...fetchOptions } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    })
    return response
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout después de ${timeoutMs}ms: ${url}`)
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}
```

```typescript
// Combinar con retry
const data = await withRetry(
  async () => {
    const response = await fetchWithTimeout('https://api.externo.com/data', {
      timeoutMs: 5_000,
    })

    if (!response.ok) {
      throw new ExternalServiceError('API externa', response.statusText)
    }

    return response.json()
  },
  { maxAttempts: 3 }
)
```

---

## 7. Error Boundary Granular con `react-error-boundary`

```bash
npm install react-error-boundary
```

```typescript
// components/error-boundary.tsx
'use client'

import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary'
import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

function DefaultFallback({ error, resetErrorBoundary }: FallbackProps) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="text-sm text-red-700">
        Este componente no pudo cargar.
      </p>
      <button
        onClick={resetErrorBoundary}
        className="mt-2 text-xs text-red-600 underline"
      >
        Reintentar
      </button>
    </div>
  )
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<FallbackProps>
  onError?: (error: Error, info: React.ErrorInfo) => void
}

export function ErrorBoundary({
  children,
  fallback: Fallback = DefaultFallback,
  onError,
}: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={Fallback}
      onError={(error, info) => {
        Sentry.captureException(error, { extra: { componentStack: info.componentStack } })
        onError?.(error, info)
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}
```

```typescript
// Uso: aislar secciones que pueden fallar independientemente
export default function DashboardPage() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Si Analytics falla, el resto del dashboard sigue funcionando */}
      <ErrorBoundary fallback={({ resetErrorBoundary }) => (
        <div className="col-span-1 bg-gray-100 rounded p-4 text-center">
          <p className="text-sm">Analytics no disponible</p>
          <button onClick={resetErrorBoundary} className="text-xs underline mt-1">
            Reintentar
          </button>
        </div>
      )}>
        <AnalyticsWidget />
      </ErrorBoundary>

      <ErrorBoundary>
        <RevenueChart />
      </ErrorBoundary>

      <ErrorBoundary>
        <RecentActivity />
      </ErrorBoundary>
    </div>
  )
}
```

---

## 8. Pattern "Fail Fast"

Validar inputs al inicio de la función, antes de hacer cualquier operación costosa.

```typescript
// MAL: validar en el medio de la función
async function createSubscription(userId: string, planId: string, coupon?: string) {
  const user = await db.users.findById(userId)      // query innecesaria si planId es inválido
  const plan = await db.plans.findById(planId)      // query innecesaria si userId es vacío

  if (!userId) throw new Error('userId requerido')  // demasiado tarde
  if (!plan) throw new Error('Plan inválido')
  // ...
}

// BIEN: fail fast con todas las validaciones al inicio
async function createSubscription(userId: string, planId: string, coupon?: string) {
  // 1. Validar inputs sincrónicamente (cero costo)
  invariant(userId, 'userId es requerido')
  invariant(planId, 'planId es requerido')

  const validPlans = ['free', 'pro', 'enterprise'] as const
  if (!validPlans.includes(planId as typeof validPlans[number])) {
    throw new ValidationError(`Plan "${planId}" no válido. Opciones: ${validPlans.join(', ')}`)
  }

  // 2. Validar precondiciones (queries rápidas)
  const [user, plan] = await Promise.all([
    db.users.findById(userId),
    db.plans.findById(planId),
  ])

  if (!user) throw new NotFoundError('Usuario', userId)
  if (!plan) throw new NotFoundError('Plan', planId)

  if (user.subscription?.status === 'active') {
    throw new ConflictError('El usuario ya tiene una suscripción activa')
  }

  // 3. Ahora sí: lógica de negocio con datos validados
  const subscription = await stripe.subscriptions.create({ ... })
  return subscription
}
```

---

## 9. Logging con Contexto Rico

```typescript
// lib/logger.ts — versión con contexto de request
import { headers } from 'next/headers'

type LogLevel = 'info' | 'warn' | 'error'

interface LogMeta {
  userId?: string
  requestId?: string
  endpoint?: string
  duration?: number
  [key: string]: unknown
}

function log(level: LogLevel, message: string, meta?: LogMeta): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    environment: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    ...meta,
  }

  if (process.env.NODE_ENV === 'production') {
    console[level](JSON.stringify(entry))
  } else {
    const color = level === 'error' ? '\x1b[31m' : level === 'warn' ? '\x1b[33m' : '\x1b[36m'
    console[level](`${color}[${level.toUpperCase()}]\x1b[0m ${message}`, meta ?? '')
  }
}

export const logger = {
  info: (msg: string, meta?: LogMeta) => log('info', msg, meta),
  warn: (msg: string, meta?: LogMeta) => log('warn', msg, meta),
  error: (msg: string, meta?: LogMeta) => log('error', msg, meta),
}

// Logger con contexto de request (para Server Components y Actions)
export function createRequestLogger(context: { userId?: string; requestId?: string }) {
  return {
    info: (msg: string, meta?: LogMeta) =>
      log('info', msg, { ...context, ...meta }),
    warn: (msg: string, meta?: LogMeta) =>
      log('warn', msg, { ...context, ...meta }),
    error: (msg: string, meta?: LogMeta) =>
      log('error', msg, { ...context, ...meta }),
  }
}
```

```typescript
// Uso en Server Action con contexto
'use server'

import { createRequestLogger } from '@/lib/logger'
import { auth } from '@/lib/auth'

export async function updateProfile(formData: FormData) {
  const session = await auth()
  const log = createRequestLogger({ userId: session?.user?.id })

  log.info('Actualizando perfil', {
    fields: Array.from(formData.keys()),
  })

  try {
    const result = await db.users.update(session!.user.id, {
      name: formData.get('name') as string,
    })

    log.info('Perfil actualizado', { duration: Date.now() - startTime })
    return { success: true }
  } catch (error) {
    log.error('Error al actualizar perfil', {
      error: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
}
```

---

## 10. Circuit Breaker Simple

Evita cascadas de fallos cuando un servicio externo está caído. Después de N fallos, "abre el circuito" y falla rápido sin intentar el request.

```typescript
// lib/circuit-breaker.ts
type CircuitState = 'closed' | 'open' | 'half-open'

interface CircuitBreakerOptions {
  failureThreshold?: number    // Fallos antes de abrir el circuito
  successThreshold?: number    // Éxitos para cerrar desde half-open
  timeoutMs?: number           // Tiempo antes de pasar a half-open
}

export class CircuitBreaker {
  private state: CircuitState = 'closed'
  private failureCount = 0
  private successCount = 0
  private lastFailureTime = 0

  constructor(
    private readonly name: string,
    private readonly options: CircuitBreakerOptions = {}
  ) {}

  private get failureThreshold() { return this.options.failureThreshold ?? 5 }
  private get successThreshold() { return this.options.successThreshold ?? 2 }
  private get timeoutMs() { return this.options.timeoutMs ?? 60_000 }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      const elapsed = Date.now() - this.lastFailureTime
      if (elapsed < this.timeoutMs) {
        throw new Error(`Circuit breaker "${this.name}" abierto. Servicio no disponible.`)
      }
      // Intentar recuperación
      this.state = 'half-open'
      this.successCount = 0
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess() {
    this.failureCount = 0
    if (this.state === 'half-open') {
      this.successCount++
      if (this.successCount >= this.successThreshold) {
        this.state = 'closed'
        logger.info(`Circuit breaker "${this.name}" cerrado (recuperado)`)
      }
    }
  }

  private onFailure() {
    this.failureCount++
    this.lastFailureTime = Date.now()
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'open'
      logger.warn(`Circuit breaker "${this.name}" abierto`, {
        failureCount: this.failureCount,
      })
    }
  }

  getState(): CircuitState {
    return this.state
  }
}

// Instancias singleton por servicio externo
import { logger } from './logger'

export const emailServiceBreaker = new CircuitBreaker('email-service', {
  failureThreshold: 3,
  timeoutMs: 30_000,
})

export const analyticsBreaker = new CircuitBreaker('analytics', {
  failureThreshold: 5,
  timeoutMs: 60_000,
})
```

```typescript
// Uso
import { emailServiceBreaker } from '@/lib/circuit-breaker'

async function sendWelcomeEmail(user: User) {
  try {
    await emailServiceBreaker.execute(() =>
      resend.emails.send({
        from: 'noreply@miapp.com',
        to: user.email,
        subject: 'Bienvenido',
        html: welcomeEmailHtml(user),
      })
    )
  } catch (error) {
    // Si el circuito está abierto, loguear pero no bloquear el registro
    logger.warn('Email de bienvenida no enviado', {
      userId: user.id,
      reason: error instanceof Error ? error.message : String(error),
    })
    // Encolar para reintentar más tarde (ej: con una queue de Supabase)
    await db.emailQueue.create({ userId: user.id, type: 'welcome', scheduledFor: new Date() })
  }
}
```
