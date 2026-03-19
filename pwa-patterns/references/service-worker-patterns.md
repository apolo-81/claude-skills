# Service Worker Patterns — next-pwa + Manual SW

## Configuracion completa de next-pwa

```bash
npm install next-pwa
npm install --save-dev @types/next-pwa
```

```typescript
// next.config.ts
import withPWA from 'next-pwa'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // tu config existente
  reactStrictMode: true,
}

const pwaConfig = withPWA({
  dest: 'public',           // donde genera sw.js y workbox files
  register: true,           // registra el SW automaticamente
  skipWaiting: true,        // activa nuevo SW sin esperar tabs abiertas
  disable: process.env.NODE_ENV === 'development',  // no en dev
  scope: '/',
  sw: 'sw.js',
  fallbacks: {
    document: '/offline',   // pagina offline para navegacion
    image: '/icons/offline-image.png',  // opcional
  },
  buildExcludes: [
    /middleware-manifest\.json$/,
    /app-build-manifest\.json$/,
  ],
  runtimeCaching: [
    // ----------------------------------------------------------------
    // 1. API routes propias — NetworkFirst
    //    Por que: queremos datos frescos, pero funcionar offline si hay cache
    // ----------------------------------------------------------------
    {
      urlPattern: /^https:\/\/.*\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 60 * 5,   // 5 minutos
        },
        networkTimeoutSeconds: 10,
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // ----------------------------------------------------------------
    // 2. Google Fonts CSS — StaleWhileRevalidate
    //    Por que: el CSS cambia poco, pero queremos actualizaciones eventuales
    // ----------------------------------------------------------------
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'google-fonts-stylesheets',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365,  // 1 año
        },
      },
    },
    // ----------------------------------------------------------------
    // 3. Google Fonts archivos — CacheFirst
    //    Por que: los archivos de fuentes no cambian (URL contiene hash)
    // ----------------------------------------------------------------
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24 * 365,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // ----------------------------------------------------------------
    // 4. Assets estaticos JS/CSS — CacheFirst
    //    Por que: Next.js incluye hash en el nombre, nunca cambia misma URL
    // ----------------------------------------------------------------
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 365,
        },
      },
    },
    // ----------------------------------------------------------------
    // 5. Next.js Image Optimization — CacheFirst
    //    Por que: las imagenes optimizadas tienen cache busting por URL
    // ----------------------------------------------------------------
    {
      urlPattern: /\/_next\/image\?.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-image',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30,  // 30 dias
        },
      },
    },
    // ----------------------------------------------------------------
    // 6. Imagenes estaticas — CacheFirst
    //    Por que: raramente cambian, priorizar rendimiento
    // ----------------------------------------------------------------
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
      },
    },
    // ----------------------------------------------------------------
    // 7. Paginas HTML — NetworkFirst
    //    Por que: contenido dinamico, queremos frescura con fallback offline
    // ----------------------------------------------------------------
    {
      urlPattern: ({ request }: { request: Request }) =>
        request.destination === 'document',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24,  // 1 dia
        },
        networkTimeoutSeconds: 5,
      },
    },
    // ----------------------------------------------------------------
    // 8. CDN externo (ej. Supabase storage) — CacheFirst
    // ----------------------------------------------------------------
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'supabase-storage',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 7,  // 7 dias
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
  ],
})

export default pwaConfig(nextConfig)
```

---

## Offline Fallback — app/offline/page.tsx

```typescript
// app/offline/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sin conexion',
}

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 px-4 py-16 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
        <svg
          className="h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 3l18 18M8.111 8.111A5.992 5.992 0 006 12a6 6 0 006 6 5.992 5.992 0 003.889-1.438M15.5 9.5A5.97 5.97 0 0118 12c0 .636-.098 1.248-.278 1.822M1.5 1.5l21 21"
          />
        </svg>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Sin conexion a internet
        </h1>
        <p className="max-w-sm text-sm text-gray-500">
          No podemos cargar esta pagina ahora. Revisa tu conexion y vuelve a intentar.
          El contenido que ya visitaste sigue disponible.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
        >
          Reintentar
        </button>
        <button
          onClick={() => window.history.back()}
          className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Volver
        </button>
      </div>
    </div>
  )
}
```

---

## Background Sync con IndexedDB

```typescript
// lib/indexed-db.ts
import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

interface OfflineQueueDB extends DBSchema {
  forms: {
    key: number
    value: {
      id?: number
      endpoint: string
      method: string
      data: unknown
      timestamp: number
      retries: number
    }
  }
}

let dbInstance: IDBPDatabase<OfflineQueueDB> | null = null

async function getDB() {
  if (dbInstance) return dbInstance
  dbInstance = await openDB<OfflineQueueDB>('offline-queue', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('forms')) {
        db.createObjectStore('forms', { keyPath: 'id', autoIncrement: true })
      }
    },
  })
  return dbInstance
}

export async function addToOfflineQueue(
  endpoint: string,
  method: string,
  data: unknown,
) {
  const db = await getDB()
  const id = await db.add('forms', {
    endpoint,
    method,
    data,
    timestamp: Date.now(),
    retries: 0,
  })

  // Registrar sync si el browser lo soporta
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const sw = await navigator.serviceWorker.ready
    try {
      await (sw as ServiceWorkerRegistration & {
        sync: { register: (tag: string) => Promise<void> }
      }).sync.register('sync-forms')
    } catch (e) {
      console.warn('Background sync no disponible, intentando sync inmediato', e)
      await syncNow()
    }
  } else {
    await syncNow()
  }

  return id
}

export async function getPendingItems() {
  const db = await getDB()
  return db.getAll('forms')
}

export async function removeItem(id: number) {
  const db = await getDB()
  return db.delete('forms', id)
}

export async function incrementRetries(id: number) {
  const db = await getDB()
  const item = await db.get('forms', id)
  if (item) {
    await db.put('forms', { ...item, retries: item.retries + 1 })
  }
}

// Fallback: sync manual si no hay SyncManager
async function syncNow() {
  if (!navigator.onLine) return
  const items = await getPendingItems()
  for (const item of items) {
    try {
      await fetch(item.endpoint, {
        method: item.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data),
      })
      await removeItem(item.id!)
    } catch (e) {
      console.error('Sync fallido para item', item.id, e)
    }
  }
}
```

```typescript
// hooks/useOfflineForm.ts
'use client'
import { addToOfflineQueue } from '@/lib/indexed-db'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'

export function useOfflineForm() {
  const isOnline = useNetworkStatus()

  async function submitForm(endpoint: string, data: unknown) {
    if (isOnline) {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Error enviando formulario')
      return res.json()
    } else {
      await addToOfflineQueue(endpoint, 'POST', data)
      return { queued: true, message: 'Guardado. Se enviara cuando tengas conexion.' }
    }
  }

  return { submitForm, isOnline }
}
```

**Handler en el Service Worker** (agregar en `public/custom-sw.js` o en worker de next-pwa):

```javascript
// Este codigo va en el service worker
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js')

// Background sync handler
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-forms') {
    event.waitUntil(syncOfflineForms())
  }
})

async function syncOfflineForms() {
  // Abrir IndexedDB directamente desde el SW
  const db = await new Promise((resolve, reject) => {
    const req = indexedDB.open('offline-queue', 1)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })

  const items = await new Promise((resolve) => {
    const tx = db.transaction('forms', 'readonly')
    const req = tx.objectStore('forms').getAll()
    req.onsuccess = () => resolve(req.result)
  })

  for (const item of items) {
    try {
      const res = await fetch(item.endpoint, {
        method: item.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data),
      })
      if (res.ok) {
        const tx = db.transaction('forms', 'readwrite')
        tx.objectStore('forms').delete(item.id)
      }
    } catch (e) {
      console.error('[SW] Sync error:', e)
    }
  }
}
```

---

## Service Worker Manual (sin next-pwa)

Solo usar si necesitas control total o `next-pwa` no cubre tu caso.

```typescript
// app/layout.tsx — registrar el SW
'use client'
import { useEffect } from 'react'

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          console.log('[SW] Registrado:', reg.scope)
          // Actualizar SW cuando hay nueva version disponible
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing
            newWorker?.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Notificar al usuario que hay actualizacion
                console.log('[SW] Nueva version disponible')
              }
            })
          })
        })
        .catch((err) => console.error('[SW] Error registro:', err))
    }
  }, [])
  return null
}
```

```javascript
// public/sw.js — SW manual basico
const CACHE_NAME = 'v1'
const PRECACHE_URLS = ['/', '/offline', '/manifest.webmanifest']

// Install: precachear recursos criticos
self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
})

// Activate: limpiar caches viejos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

// Fetch: NetworkFirst para navegacion, CacheFirst para assets
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)

  // Assets estaticos: CacheFirst
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) => cached || fetch(event.request).then((res) => {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          return res
        })
      )
    )
    return
  }

  // Navegacion: NetworkFirst con fallback a /offline
  if (event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/offline') || new Response('Offline'))
    )
    return
  }
})
```
