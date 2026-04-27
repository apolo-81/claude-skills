# Offline UI & Background Sync Code

## Network Status Hook — `hooks/useNetworkStatus.ts`

```typescript
'use client'
import { useEffect, useState } from 'react'

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  useEffect(() => {
    setIsOnline(navigator.onLine)
    const online = () => setIsOnline(true)
    const offline = () => setIsOnline(false)
    window.addEventListener('online', online)
    window.addEventListener('offline', offline)
    return () => {
      window.removeEventListener('online', online)
      window.removeEventListener('offline', offline)
    }
  }, [])
  return isOnline
}
```

## Offline Banner Component

```typescript
'use client'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'

export function OfflineBanner() {
  const isOnline = useNetworkStatus()
  if (isOnline) return null
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 py-2 text-center text-sm font-medium text-yellow-900">
      Sin conexion — mostrando contenido en cache
    </div>
  )
}
```

## Background Sync — Offline Queue

```typescript
// lib/offline-queue.ts
import { openDB } from 'idb'

const getDB = () => openDB('offline-queue', 1, {
  upgrade(db) { db.createObjectStore('forms', { autoIncrement: true }) },
})

export async function queueFormData(data: unknown) {
  await (await getDB()).add('forms', { data, timestamp: Date.now() })
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const sw = await navigator.serviceWorker.ready
    await (sw as any).sync.register('sync-forms')
  }
}
```

## Service Worker Sync Handler — `public/sw-custom.js`

```javascript
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-forms') event.waitUntil(syncForms())
})
async function syncForms() {
  // open IDB, iterate items, fetch POST, delete if ok
}
```

See `service-worker-patterns.md` for full retry implementation.
