# Push Notifications Web — Setup Completo

## 1. Setup paso a paso

### Instalar dependencias
```bash
npm install web-push
npm install --save-dev @types/web-push
```

### Generar VAPID keys (una sola vez, guardar en lugar seguro)
```bash
npx web-push generate-vapid-keys
# Output:
# Public Key: BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U
# Private Key: UUxI4O8-FbRouAevSmBQ6co62grn0bj04RA60WZPZoA
```

### Variables de entorno
```bash
# .env.local
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U
VAPID_PRIVATE_KEY=UUxI4O8-FbRouAevSmBQ6co62grn0bj04RA60WZPZoA
VAPID_SUBJECT=mailto:admin@tuapp.com
```

---

## 2. Tabla en Supabase

### SQL — crear tabla con RLS
```sql
-- Tabla de subscripciones push
create table public.push_subscriptions (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade,
  endpoint    text not null unique,
  subscription jsonb not null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Indice para buscar por user
create index push_subscriptions_user_id_idx on public.push_subscriptions(user_id);

-- RLS: los usuarios solo ven/editan sus propias subscripciones
alter table public.push_subscriptions enable row level security;

create policy "Users can manage own subscriptions"
  on public.push_subscriptions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Service role puede leer todo (para enviar notificaciones desde el servidor)
create policy "Service role can read all"
  on public.push_subscriptions
  for select
  using (auth.role() = 'service_role');

-- Trigger para updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger push_subscriptions_updated_at
  before update on public.push_subscriptions
  for each row execute procedure update_updated_at();
```

### Tipo TypeScript
```typescript
// types/push.ts
export interface PushSubscriptionRow {
  id: string
  user_id: string | null
  endpoint: string
  subscription: PushSubscriptionJSON
  created_at: string
  updated_at: string
}

export interface PushPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  url?: string
  tag?: string
  data?: Record<string, unknown>
}
```

---

## 3. Hook useNotifications — UX correcto

El flujo correcto: educar al usuario → mostrar prompt nativo → manejar denegacion.
**Nunca pedir permiso al cargar la pagina.**

```typescript
// hooks/useNotifications.ts
'use client'
import { useState, useEffect, useCallback } from 'react'

type PermissionState = 'idle' | 'asking' | 'granted' | 'denied' | 'unsupported'

export function useNotifications() {
  const [permission, setPermission] = useState<PermissionState>('idle')
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Verificar soporte
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setPermission('unsupported')
      return
    }

    // Leer permiso actual
    if (Notification.permission === 'granted') {
      setPermission('granted')
      loadExistingSubscription()
    } else if (Notification.permission === 'denied') {
      setPermission('denied')
    }
  }, [])

  async function loadExistingSubscription() {
    try {
      const sw = await navigator.serviceWorker.ready
      const existing = await sw.pushManager.getSubscription()
      setSubscription(existing)
    } catch (e) {
      console.error('Error cargando subscripcion:', e)
    }
  }

  const requestPermission = useCallback(async () => {
    if (permission === 'unsupported') return false
    if (permission === 'granted') return true

    setIsLoading(true)
    setPermission('asking')

    try {
      const result = await Notification.requestPermission()

      if (result === 'granted') {
        setPermission('granted')
        await subscribe()
        return true
      } else {
        setPermission(result === 'denied' ? 'denied' : 'idle')
        return false
      }
    } catch (e) {
      console.error('Error pidiendo permiso:', e)
      setPermission('idle')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [permission])

  const subscribe = useCallback(async () => {
    try {
      const sw = await navigator.serviceWorker.ready
      const existing = await sw.pushManager.getSubscription()
      if (existing) {
        setSubscription(existing)
        await saveSubscriptionToServer(existing)
        return existing
      }

      const newSub = await sw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      })

      setSubscription(newSub)
      await saveSubscriptionToServer(newSub)
      return newSub
    } catch (e) {
      console.error('Error suscribiendo:', e)
      return null
    }
  }, [])

  const unsubscribe = useCallback(async () => {
    if (!subscription) return
    setIsLoading(true)
    try {
      await subscription.unsubscribe()
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      })
      setSubscription(null)
    } finally {
      setIsLoading(false)
    }
  }, [subscription])

  return {
    permission,
    subscription,
    isLoading,
    isSupported: permission !== 'unsupported',
    isSubscribed: !!subscription,
    requestPermission,
    unsubscribe,
  }
}

async function saveSubscriptionToServer(sub: PushSubscription) {
  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sub.toJSON()),
  })
}

// Utilidad: convertir VAPID key de base64 a Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
```

### Componente con UX educacional
```typescript
// components/NotificationPermissionCard.tsx
'use client'
import { useNotifications } from '@/hooks/useNotifications'

export function NotificationPermissionCard() {
  const { permission, isSubscribed, isLoading, requestPermission, unsubscribe } =
    useNotifications()

  if (permission === 'unsupported') return null

  if (permission === 'denied') {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-sm font-medium text-yellow-800">Notificaciones bloqueadas</p>
        <p className="mt-1 text-xs text-yellow-700">
          Para activarlas, ve a Configuracion del sitio en tu navegador y permite notificaciones.
        </p>
      </div>
    )
  }

  if (isSubscribed) {
    return (
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <p className="text-sm font-medium text-gray-900">Notificaciones activas</p>
          <p className="text-xs text-gray-500">Recibiras alertas importantes</p>
        </div>
        <button
          onClick={unsubscribe}
          disabled={isLoading}
          className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
        >
          Desactivar
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm font-medium text-gray-900">Mantente al dia</p>
      <p className="mt-1 text-xs text-gray-500">
        Activa las notificaciones para recibir alertas cuando haya novedades importantes.
      </p>
      <button
        onClick={requestPermission}
        disabled={isLoading}
        className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Activando...' : 'Activar notificaciones'}
      </button>
    </div>
  )
}
```

---

## 4. API Routes completas

### POST /api/push/subscribe
```typescript
// app/api/push/subscribe/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { PushSubscriptionJSON } from 'web-push'

export async function POST(req: Request) {
  try {
    const subscription: PushSubscriptionJSON = await req.json()

    if (!subscription.endpoint) {
      return NextResponse.json({ error: 'Subscription invalida' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: user?.id ?? null,
          endpoint: subscription.endpoint,
          subscription: subscription,
        },
        { onConflict: 'endpoint' }
      )

    if (error) {
      console.error('Error guardando subscription:', error)
      return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
```

### DELETE /api/push/unsubscribe
```typescript
// app/api/push/unsubscribe/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { endpoint } = await req.json()
    const supabase = await createClient()

    await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint)

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
```

### POST /api/push/send
```typescript
// app/api/push/send/route.ts
import webpush from 'web-push'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { PushPayload } from '@/types/push'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

interface SendPushBody {
  userId?: string        // enviar a un usuario especifico
  userIds?: string[]     // enviar a varios usuarios
  broadcast?: boolean    // enviar a todos
  payload: PushPayload
}

export async function POST(req: Request) {
  // Verificar que es una llamada interna o autenticada como admin
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.INTERNAL_API_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { userId, userIds, broadcast, payload }: SendPushBody = await req.json()

  const supabase = await createClient()
  let query = supabase.from('push_subscriptions').select('subscription, endpoint')

  if (broadcast) {
    // Enviar a todos (no filtrar)
  } else if (userId) {
    query = query.eq('user_id', userId)
  } else if (userIds?.length) {
    query = query.in('user_id', userIds)
  } else {
    return NextResponse.json({ error: 'Especifica userId, userIds o broadcast' }, { status: 400 })
  }

  const { data: subscriptions, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!subscriptions?.length) return NextResponse.json({ sent: 0 })

  const results = await Promise.allSettled(
    subscriptions.map(async ({ subscription, endpoint }) => {
      try {
        await webpush.sendNotification(
          subscription as webpush.PushSubscription,
          JSON.stringify(payload),
          { TTL: 60 * 60 * 24 }  // 24h de TTL
        )
        return { endpoint, status: 'sent' }
      } catch (err: any) {
        // Si la subscripcion ya no es valida (410 Gone), borrarla
        if (err.statusCode === 410 || err.statusCode === 404) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', endpoint)
        }
        throw err
      }
    })
  )

  const sent = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length

  return NextResponse.json({ sent, failed, total: subscriptions.length })
}
```

---

## 5. Service Worker — Push Handler

```javascript
// Agregar en tu service worker (public/sw.js o via next-pwa worker entry)

// Recibir push
self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    payload = { title: 'Nueva notificacion', body: event.data.text() }
  }

  const { title, body, icon, badge, url, tag, data } = payload

  const options = {
    body: body || '',
    icon: icon || '/icons/icon-192.png',
    badge: badge || '/icons/badge-72.png',
    tag: tag || 'default',
    data: { url: url || '/', ...data },
    requireInteraction: false,
    actions: url
      ? [{ action: 'open', title: 'Ver', icon: '/icons/open.png' }]
      : [],
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// Click en la notificacion
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = event.notification.data?.url || '/'

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si ya hay una ventana abierta con esa URL, enfocarla
        for (const client of clientList) {
          if (client.url === targetUrl && 'focus' in client) {
            return client.focus()
          }
        }
        // Si no hay ventana, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow(targetUrl)
        }
      })
  )
})

// Notificacion cerrada sin interaccion (analytics)
self.addEventListener('notificationclose', (event) => {
  // Aqui puedes enviar evento de analytics
  console.log('[SW] Notificacion cerrada sin click:', event.notification.tag)
})
```

---

## 6. Envio programado desde n8n

Enviar notificaciones desde un workflow n8n via webhook hacia tu API route.

**n8n HTTP Request node config:**
```
Method: POST
URL: https://tuapp.com/api/push/send
Headers:
  Authorization: Bearer {{$env.INTERNAL_API_SECRET}}
  Content-Type: application/json
Body (JSON):
{
  "userId": "{{ $json.user_id }}",
  "payload": {
    "title": "{{ $json.titulo }}",
    "body": "{{ $json.mensaje }}",
    "url": "{{ $json.url }}",
    "icon": "/icons/icon-192.png"
  }
}
```

**Para broadcast desde n8n (a todos los usuarios):**
```json
{
  "broadcast": true,
  "payload": {
    "title": "Actualizacion importante",
    "body": "Hemos lanzado una nueva funcionalidad",
    "url": "/novedades"
  }
}
```

**Lib helper para llamar desde server actions o API routes internas:**
```typescript
// lib/push.ts
import webpush from 'web-push'
import { createAdminClient } from '@/lib/supabase/admin'
import type { PushPayload } from '@/types/push'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

export async function sendPushToUser(userId: string, payload: PushPayload) {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('push_subscriptions')
    .select('subscription, endpoint')
    .eq('user_id', userId)

  if (!data?.length) return { sent: 0 }

  const results = await Promise.allSettled(
    data.map(({ subscription, endpoint }) =>
      webpush
        .sendNotification(subscription as webpush.PushSubscription, JSON.stringify(payload))
        .catch(async (err) => {
          if (err.statusCode === 410 || err.statusCode === 404) {
            await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)
          }
          throw err
        })
    )
  )

  return {
    sent: results.filter((r) => r.status === 'fulfilled').length,
    failed: results.filter((r) => r.status === 'rejected').length,
  }
}

// Usar en server action:
// await sendPushToUser(userId, {
//   title: 'Tu pedido esta listo',
//   body: 'El pedido #1234 ha sido procesado',
//   url: '/pedidos/1234',
// })
```
