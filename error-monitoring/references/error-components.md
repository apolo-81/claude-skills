# Error Monitoring — Component & Code References

## app/error.tsx

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
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4 max-w-md px-4">
        <h2 className="text-xl font-semibold text-gray-900">Algo salio mal</h2>
        <p className="text-sm text-gray-500">Ocurrio un error inesperado. El equipo fue notificado.</p>
        {error.digest && (
          <p className="text-xs text-gray-400 font-mono">ID: {error.digest}</p>
        )}
        <button onClick={reset}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
          Reintentar
        </button>
      </div>
    </div>
  )
}
```

## lib/logger.ts

```typescript
type LogLevel = 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  environment: string | undefined
  [key: string]: unknown
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    environment: process.env.NODE_ENV,
    ...meta,
  }

  if (process.env.NODE_ENV === 'production') {
    console[level](JSON.stringify(entry))
  } else {
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

## Server Action Error Handling Pattern

```typescript
'use server'

import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/logger'

export async function processCheckout(formData: FormData) {
  const userId = formData.get('userId') as string

  try {
    const result = await stripe.checkout.create({ ... })
    logger.info('Checkout completado', { userId, sessionId: result.id })
    return { success: true, sessionId: result.id }
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'processCheckout' },
      extra: { userId, formData: Object.fromEntries(formData) },
    })
    logger.error('Error en checkout', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    })
    return { error: 'Error al procesar el pago. El equipo fue notificado.' }
  }
}
```

## useAction Hook with Sonner Toasts

```typescript
import { toast } from 'sonner'
import { useTransition } from 'react'

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
      toast.success('Operacion completada')
    })
  }

  return { execute, isPending }
}
```

## Sentry User Association

```typescript
// Server-side: en layout o middleware
import * as Sentry from '@sentry/nextjs'
import { createClient } from '@/lib/supabase/server'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    Sentry.setUser({ id: user.id, email: user.email })
  }
  return <>{children}</>
}

// Client-side: despues del login
function onLoginSuccess(user: User) {
  Sentry.setUser({ id: user.id, email: user.email, username: user.user_metadata?.username })
  Sentry.setTag('plan', user.user_metadata?.plan ?? 'free')
  Sentry.setTag('role', user.user_metadata?.role ?? 'user')
}

function onLogout() {
  Sentry.setUser(null)
}
```
