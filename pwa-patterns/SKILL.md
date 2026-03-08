---
name: pwa-patterns
description: >
  Use when making a web app installable, adding offline support, implementing push
  notifications, or building Progressive Web App features. Trigger for: "PWA",
  "Progressive Web App", "app instalable", "offline mode", "service worker", "push
  notifications", "web push", "install prompt", "add to home screen", "cache strategy",
  "offline first", "background sync", "manifest.json", "hacer mi app instalable",
  "notificaciones push web", "app sin internet", "que funcione offline".
---

# PWA Patterns — Next.js 15 + React + Tailwind

## 1. Overview — Cuando vale la pena una PWA

**PWA vs Native App:**
- Elegir PWA cuando: budget limitado, audiencia cross-platform, ya tienes web app, no necesitas APIs nativas complejas (ARKit, Bluetooth avanzado)
- Elegir native cuando: experiencia de tienda es critica, necesitas acceso a hardware profundo, background processing intensivo

**Requisitos minimos para ser instalable:**
1. HTTPS (o localhost para dev)
2. `manifest.json` valido con `name`, `icons` (192 + 512), `start_url`, `display: standalone`
3. Service worker registrado con al menos un fetch handler

**Capacidades en 2026:**
- iOS 16.4+: push notifications, install prompt (beforeinstallprompt parcial via iOS 17+)
- Android: soporte completo desde Chrome 67+
- Desktop: Chrome/Edge soportan install prompt y PWA completa

**next-pwa vs manual service worker:**
- Usar `next-pwa` para el 90% de casos — maneja precaching, runtimeCaching, y offline automaticamente
- Manual solo si necesitas control total del SW lifecycle o estrategias muy custom

---

## 2. Web App Manifest

```typescript
// app/manifest.ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mi App Nombre Completo',
    short_name: 'MiApp',
    description: 'Descripcion clara de que hace la app',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    theme_color: '#0f172a',
    background_color: '#ffffff',
    categories: ['productivity'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable any',
      },
    ],
    screenshots: [
      { src: '/screenshots/desktop.png', sizes: '1280x720', type: 'image/png' },
      { src: '/screenshots/mobile.png', sizes: '390x844', type: 'image/png' },
    ],
  }
}
```

Generar iconos: `npx pwa-asset-generator logo.svg public/icons`

---

## 3. Service Worker con next-pwa

```typescript
// next.config.ts
import withPWA from 'next-pwa'

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/offline',
  },
  runtimeCaching: [
    {
      // APIs propias — NetworkFirst: datos frescos con fallback a cache
      urlPattern: /^https:\/\/.*\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
        networkTimeoutSeconds: 10,
      },
    },
    {
      // Fonts — CacheFirst: raramente cambian, priorizar rendimiento
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
      },
    },
    {
      // Imagenes — CacheFirst con limite de entradas
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    {
      // Paginas de contenido — StaleWhileRevalidate: respuesta inmediata + actualiza en bg
      urlPattern: /^https:\/\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'pages',
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
      },
    },
  ],
})

const nextConfig = pwaConfig({ /* tu next config aqui */ })
export default nextConfig
```

**Pagina offline** (`app/offline/page.tsx`): pagina estatica con boton "Reintentar" (`window.location.reload()`). Ver codigo completo en `references/service-worker-patterns.md`.

---

## 4. Install Prompt (A2HS)

```typescript
// hooks/useInstallPrompt.ts
'use client'
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function useInstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    const isIOSDevice = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIsIOS(isIOSDevice)
    setIsInstalled(window.matchMedia('(display-mode: standalone)').matches)

    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setIsInstalled(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!prompt) return false
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    setPrompt(null)
    return outcome === 'accepted'
  }

  return { canInstall: !!prompt, isInstalled, isIOS, install }
}
```

```typescript
// components/InstallBanner.tsx
'use client'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { useState } from 'react'

export function InstallBanner() {
  const { canInstall, isInstalled, isIOS, install } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(false)
  if (isInstalled || dismissed) return null

  if (isIOS) return (
    <div className="fixed bottom-4 left-4 right-4 rounded-xl bg-gray-900 p-4 text-white shadow-xl">
      <p className="text-sm font-medium">Instala la app</p>
      <p className="mt-1 text-xs text-gray-300">
        Toca <span className="font-semibold">Compartir</span> → <span className="font-semibold">Agregar a pantalla de inicio</span>
      </p>
      <button onClick={() => setDismissed(true)} className="mt-2 text-xs text-gray-400">Cerrar</button>
    </div>
  )

  if (!canInstall) return null
  return (
    <div className="fixed bottom-4 left-4 right-4 flex items-center gap-3 rounded-xl bg-gray-900 p-4 text-white shadow-xl">
      <p className="flex-1 text-sm font-medium">Instala la app para acceso rapido</p>
      <button onClick={install} className="rounded-lg bg-blue-500 px-3 py-1.5 text-sm font-medium">Instalar</button>
      <button onClick={() => setDismissed(true)} className="text-gray-400">✕</button>
    </div>
  )
}
```

---

## 5. Push Notifications Web

Setup: `npm install web-push` + generar VAPID keys:
```bash
npx web-push generate-vapid-keys
# Agregar a .env:
# NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
# VAPID_PRIVATE_KEY=...
# VAPID_SUBJECT=mailto:tu@email.com
```

**Suscripcion del cliente** (`lib/web-push-client.ts`):
```typescript
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null
  const sw = await navigator.serviceWorker.ready
  const existing = await sw.pushManager.getSubscription()
  if (existing) return existing
  return sw.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  })
}
```

**API route subscribe** (`app/api/push/subscribe/route.ts`):
```typescript
export async function POST(req: Request) {
  const subscription = await req.json()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  await supabase.from('push_subscriptions').upsert(
    { user_id: user?.id, endpoint: subscription.endpoint, subscription },
    { onConflict: 'endpoint' }
  )
  return NextResponse.json({ ok: true })
}
```

**API route send** — inicializa `webpush.setVapidDetails(...)` al top del archivo, luego `webpush.sendNotification(subscription, JSON.stringify({ title, body, url }))`. Ver implementacion completa con manejo de subscripciones expiradas (410 Gone) en `references/push-notifications.md`.

**Pedir permiso correctamente — nunca al entrar, si despues de mostrar valor:**
```typescript
const result = await Notification.requestPermission() // 'granted' | 'denied' | 'default'
// Si denied: explicar como re-habilitar en Settings del browser
```

---

## 6. Background Sync

Patron: guardar en IndexedDB si offline → registrar sync tag → SW envía al reconectar.

```typescript
// lib/offline-queue.ts
import { openDB } from 'idb'  // npm install idb

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

Service worker (`public/sw-custom.js`):
```javascript
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-forms') event.waitUntil(syncForms())
})
async function syncForms() {
  // abrir IDB, iterar items, fetch POST, borrar si ok
}
```

Ver implementacion completa con IndexedDB helpers y manejo de reintentos en `references/service-worker-patterns.md`.

---

## 7. Offline UI

```typescript
// hooks/useNetworkStatus.ts
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

```typescript
// components/OfflineBanner.tsx
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

Cuando datos no estan en cache: mostrar skeleton con `<p className="text-sm text-gray-400">Disponible cuando estes online</p>`.

---

## 8. iOS Specifics (2026)

```typescript
// app/layout.tsx — en el <head>
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="MiApp" />
{/* Splash screens para devices comunes */}
<link rel="apple-touch-startup-image" href="/splash/iphone14.png"
  media="(device-width: 390px) and (-webkit-device-pixel-ratio: 3)" />
```

**Limitaciones que persisten en 2026:**
- No Badging API en Safari
- Background Sync muy limitado en iOS (solo cuando app esta en foreground reciente)
- No periodic background sync
- Push notifications requieren iOS 16.4+ y que el usuario agregue la app a home screen primero

---

## 9. Checklist de Auditoria PWA

**Lighthouse PWA Score (objetivo: 100):**
- [ ] Manifest valido y linkado (`<link rel="manifest">`)
- [ ] Service worker registrado con fetch handler
- [ ] HTTPS en produccion
- [ ] Pagina offline funcional (`/offline`)
- [ ] `theme-color` meta tag
- [ ] Icons 192x192 y 512x512
- [ ] Responsive design (viewport meta tag)
- [ ] `start_url` responde con 200 offline

**Checklist adicional:**
- [ ] `beforeinstallprompt` capturado y banner implementado
- [ ] iOS meta tags configurados
- [ ] Push notifications con permiso UX correcto (no pedir al cargar)
- [ ] Background sync para formularios criticos
- [ ] Offline banner con `useNetworkStatus`
- [ ] Probado en dispositivo real (no solo Lighthouse)

Ver referencias para implementaciones completas con codigo funcional.
