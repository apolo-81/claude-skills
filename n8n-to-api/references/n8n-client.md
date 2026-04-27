# n8n Client — Implementacion TypeScript Completa

## lib/n8n-client.ts

```typescript
// lib/n8n-client.ts
import { createClient } from '@/lib/supabase/server'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type WorkflowName = keyof typeof WORKFLOWS

export interface N8nError extends Error {
  status?: number
  workflow?: WorkflowName
  attempt?: number
}

interface RequestOptions {
  timeout?: number      // ms — default 10_000 para trigger, 30_000 para call
  retries?: number      // default 3
  logEvent?: boolean    // default true — guarda en n8n_events
}

// ─── Registro de Workflows ────────────────────────────────────────────────────
// Centraliza todas las URLs. Nunca hardcodear URLs en los routes.

const WORKFLOWS = {
  'send-welcome-email':  process.env.N8N_WEBHOOK_WELCOME_EMAIL!,
  'contact-form':        process.env.N8N_WEBHOOK_CONTACT_FORM!,
  'process-payment':     process.env.N8N_WEBHOOK_PAYMENT!,
  'generate-report':     process.env.N8N_WEBHOOK_REPORT!,
  'validate-vat':        process.env.N8N_WEBHOOK_VALIDATE_VAT!,
  'upgrade-plan':        process.env.N8N_WEBHOOK_UPGRADE_PLAN!,
  'sync-metrics':        process.env.N8N_WEBHOOK_SYNC_METRICS!,
} as const

// ─── Clase Principal ──────────────────────────────────────────────────────────

class N8nClient {
  private async fetchWithRetry(
    url: string,
    payload: unknown,
    options: RequestOptions & { method?: string } = {}
  ): Promise<Response> {
    const {
      timeout = 10_000,
      retries = 3,
      method = 'POST',
    } = options

    let lastError: N8nError | null = null

    for (let attempt = 1; attempt <= retries; attempt++) {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), timeout)

      try {
        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'X-N8N-Api-Key': process.env.N8N_API_KEY ?? '',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        })

        clearTimeout(timer)

        if (!res.ok) {
          const err: N8nError = new Error(`n8n responded ${res.status}`)
          err.status = res.status
          err.attempt = attempt
          throw err
        }

        return res

      } catch (err) {
        clearTimeout(timer)

        const n8nErr = err as N8nError
        lastError = n8nErr

        if (attempt < retries) {
          // Backoff exponencial: 1s, 2s, 4s
          await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)))
        }
      }
    }

    throw lastError
  }

  /**
   * Fire-and-forget: dispara un workflow y no espera respuesta.
   * Lanza excepcion si todos los reintentos fallan.
   */
  async trigger(workflow: WorkflowName, payload: unknown, options?: RequestOptions): Promise<void> {
    const url = WORKFLOWS[workflow]
    if (!url) throw new Error(`Unknown workflow: ${workflow}`)

    await this.fetchWithRetry(url, payload, {
      timeout: 10_000,
      ...options,
    })
  }

  /**
   * Request-response: llama al workflow y retorna su respuesta tipada.
   * n8n debe tener un nodo "Respond to Webhook".
   */
  async call<T = unknown>(
    workflow: WorkflowName,
    payload: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const url = WORKFLOWS[workflow]
    if (!url) throw new Error(`Unknown workflow: ${workflow}`)

    const res = await this.fetchWithRetry(url, payload, {
      timeout: 30_000,
      ...options,
    })

    return res.json() as Promise<T>
  }
}

// Singleton exportado
export const n8n = new N8nClient()
```

---

## lib/n8n-auth.ts

```typescript
// lib/n8n-auth.ts
import { timingSafeEqual } from 'crypto'

/**
 * Verifica que una request entrante proviene de n8n.
 * Usar en API routes que n8n llama (Pattern D).
 * Retorna null si es valida, o un Response 401 si no lo es.
 */
export function verifyN8nRequest(req: Request): Response | null {
  const apiKey = req.headers.get('x-n8n-api-key')
  const expected = process.env.N8N_CALLBACK_SECRET

  if (!apiKey || !expected) {
    return Response.json(
      { error: 'Missing authentication' },
      { status: 401 }
    )
  }

  // Evitar timing attacks con comparacion de longitud constante
  if (apiKey.length !== expected.length) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const a = Buffer.from(apiKey, 'utf8')
  const b = Buffer.from(expected, 'utf8')

  if (!timingSafeEqual(a, b)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return null
}
```

---

## middleware.ts — Proteger rutas de callback de n8n

```typescript
// middleware.ts (Next.js)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // Proteger rutas de callback de n8n
  if (req.nextUrl.pathname.startsWith('/api/n8n/')) {
    const apiKey = req.headers.get('x-n8n-api-key')
    const expected = process.env.N8N_CALLBACK_SECRET

    if (!apiKey || apiKey !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/n8n/:path*'],
}
```

> Nota: el middleware no tiene acceso a `timingSafeEqual` (Edge Runtime). Para mayor seguridad, usar `verifyN8nRequest` directamente en el route handler.

---

## hooks/useN8nTrigger.ts

```typescript
// hooks/useN8nTrigger.ts
'use client'
import { useState, useCallback } from 'react'

interface TriggerOptions<TPayload> {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

interface TriggerState {
  loading: boolean
  error: Error | null
  success: boolean
}

/**
 * Hook para disparar workflows de n8n desde componentes React.
 * Llama a una API route de Next.js que internamente usa n8nClient.
 * NO llama a n8n directamente desde el cliente (no exponer URLs/keys).
 *
 * @example
 * const { trigger, loading, error } = useN8nTrigger('/api/contact')
 * <button onClick={() => trigger({ name, email })} disabled={loading}>
 */
export function useN8nTrigger<TPayload = Record<string, unknown>>(
  apiRoute: string,
  options: TriggerOptions<TPayload> = {}
) {
  const [state, setState] = useState<TriggerState>({
    loading: false,
    error: null,
    success: false,
  })

  const trigger = useCallback(async (payload: TPayload) => {
    setState({ loading: true, error: null, success: false })

    try {
      const res = await fetch(apiRoute, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `Request failed with status ${res.status}`)
      }

      setState({ loading: false, error: null, success: true })
      options.onSuccess?.()

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setState({ loading: false, error, success: false })
      options.onError?.(error)
    }
  }, [apiRoute, options])

  const reset = useCallback(() => {
    setState({ loading: false, error: null, success: false })
  }, [])

  return { trigger, reset, ...state }
}
```

---

## hooks/useN8nAsync.ts — Para Pattern C (Async + Supabase)

```typescript
// hooks/useN8nAsync.ts
'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

type AsyncStatus = 'idle' | 'triggering' | 'pending' | 'completed' | 'failed'

interface N8nAsyncOptions<TResult> {
  onCompleted?: (result: TResult) => void
  onFailed?: (error: string) => void
}

/**
 * Hook para workflows async largos (Pattern C).
 * 1. Llama a la API route que dispara n8n y retorna eventId
 * 2. Escucha Supabase Realtime para saber cuando termina
 *
 * @example
 * const { trigger, status, result } = useN8nAsync<{ pdfUrl: string }>('/api/reports/generate')
 */
export function useN8nAsync<TResult = unknown>(
  apiRoute: string,
  options: N8nAsyncOptions<TResult> = {}
) {
  const [status, setStatus] = useState<AsyncStatus>('idle')
  const [result, setResult] = useState<TResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [eventId, setEventId] = useState<string | null>(null)

  const supabase = createClient()

  // Escuchar cambios en n8n_events cuando hay un eventId
  useEffect(() => {
    if (!eventId || status !== 'pending') return

    const channel = supabase
      .channel(`n8n-event-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'n8n_events',
          filter: `id=eq.${eventId}`,
        },
        (payload) => {
          const row = payload.new as {
            status: string
            result: TResult
            error: string
          }

          if (row.status === 'completed') {
            setResult(row.result)
            setStatus('completed')
            options.onCompleted?.(row.result)
          } else if (row.status === 'failed') {
            setError(row.error ?? 'Workflow failed')
            setStatus('failed')
            options.onFailed?.(row.error ?? 'Workflow failed')
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId, status])

  const trigger = useCallback(async (payload: Record<string, unknown>) => {
    setStatus('triggering')
    setError(null)
    setResult(null)

    try {
      const res = await fetch(apiRoute, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error(`Failed to start workflow`)

      const { eventId: id } = await res.json()
      setEventId(id)
      setStatus('pending')

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(msg)
      setStatus('failed')
    }
  }, [apiRoute])

  const reset = useCallback(() => {
    setStatus('idle')
    setResult(null)
    setError(null)
    setEventId(null)
  }, [])

  return { trigger, status, result, error, eventId, reset }
}
```

---

## Ejemplos de uso por Pattern

### Pattern A — Formulario de contacto

```typescript
// components/ContactForm.tsx
'use client'
import { useN8nTrigger } from '@/hooks/useN8nTrigger'

export function ContactForm() {
  const { trigger, loading, success, error } = useN8nTrigger('/api/contact', {
    onSuccess: () => console.log('Mensaje enviado'),
  })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    await trigger({
      name: form.get('name') as string,
      email: form.get('email') as string,
      message: form.get('message') as string,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="email" type="email" required />
      <textarea name="message" required />
      <button type="submit" disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar'}
      </button>
      {success && <p>Mensaje enviado correctamente.</p>}
      {error && <p>Error: {error.message}</p>}
    </form>
  )
}
```

### Pattern B — Validacion sincrona

```typescript
// app/api/validate-vat/route.ts
import { n8n } from '@/lib/n8n-client'

export async function POST(req: Request) {
  const { vatNumber } = await req.json()

  const result = await n8n.call<{ valid: boolean; company: string; country: string }>(
    'validate-vat',
    { vatNumber }
  )

  return Response.json(result)
}
```

### Pattern C — Generacion de PDF

```typescript
// components/ReportButton.tsx
'use client'
import { useN8nAsync } from '@/hooks/useN8nAsync'

export function ReportButton({ userId }: { userId: string }) {
  const { trigger, status, result } = useN8nAsync<{ pdfUrl: string }>(
    '/api/reports/generate',
    { onCompleted: (r) => window.open(r.pdfUrl) }
  )

  return (
    <div>
      <button
        onClick={() => trigger({ userId, reportType: 'monthly' })}
        disabled={status === 'triggering' || status === 'pending'}
      >
        {status === 'idle' && 'Generar Reporte'}
        {status === 'triggering' && 'Iniciando...'}
        {status === 'pending' && 'Procesando... (puede tardar 1-2 min)'}
        {status === 'completed' && 'Listo - Generar otro'}
        {status === 'failed' && 'Error - Reintentar'}
      </button>
      {result && <a href={result.pdfUrl} target="_blank">Descargar PDF</a>}
    </div>
  )
}
```

### Pattern D — Callback de n8n

```typescript
// app/api/n8n/callback/route.ts
import { verifyN8nRequest } from '@/lib/n8n-auth'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const authError = verifyN8nRequest(req)
  if (authError) return authError

  const { eventId, status, result, error } = await req.json()

  if (!eventId || !status) {
    return Response.json({ error: 'Missing eventId or status' }, { status: 400 })
  }

  const supabase = createClient()
  await supabase
    .from('n8n_events')
    .update({
      status,
      result: result ?? null,
      error: error ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', eventId)

  return Response.json({ received: true })
}
```
