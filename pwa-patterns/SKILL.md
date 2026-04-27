---
name: pwa-patterns
description: >
  Convierte una web app en PWA instalable con soporte offline y notificaciones push.
  Stack: Next.js 15 + service worker + Web Push API.
  Usar cuando: "PWA", "app instalable", "offline", "service worker", "push notifications",
  "manifest.json", "add to home screen", "que funcione sin internet", "background sync".
---

# PWA Patterns — Next.js 15 + React + Tailwind

## 1. Installability Requirements

1. HTTPS (or localhost for dev)
2. Valid `manifest.json` with `name`, `icons` (192 + 512), `start_url`, `display: standalone`
3. Service worker registered with at least one fetch handler

**PWA vs Native:** PWA when budget limited, cross-platform audience, existing web app. Native when app store presence critical, deep hardware access, or intensive background processing needed.

**Platform support (2026):** iOS 16.4+ push notifications, iOS 17+ partial beforeinstallprompt. Android full support since Chrome 67+. Desktop Chrome/Edge full PWA.

**next-pwa vs manual SW:** Use `next-pwa` for 90% of cases. Manual only for custom SW lifecycle or very specific caching strategies.

---

## 2. Web App Manifest

Ver `references/manifest-install.md` para complete `app/manifest.ts` code.

Generate icons: `npx pwa-asset-generator logo.svg public/icons`

---

## 3. Service Worker — next-pwa

```typescript
// next.config.ts
import withPWA from 'next-pwa'

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: { document: '/offline' },
  runtimeCaching: [
    { urlPattern: /^https:\/\/.*\/api\/.*/i, handler: 'NetworkFirst',
      options: { cacheName: 'api-cache', expiration: { maxEntries: 50, maxAgeSeconds: 300 }, networkTimeoutSeconds: 10 } },
    { urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i, handler: 'CacheFirst',
      options: { cacheName: 'google-fonts', expiration: { maxEntries: 20, maxAgeSeconds: 31536000 } } },
    { urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i, handler: 'CacheFirst',
      options: { cacheName: 'images', expiration: { maxEntries: 100, maxAgeSeconds: 2592000 } } },
    { urlPattern: /^https:\/\/.*/i, handler: 'StaleWhileRevalidate',
      options: { cacheName: 'pages', expiration: { maxEntries: 50, maxAgeSeconds: 86400 } } },
  ],
})
```

| Strategy | Use for | Behavior |
|---|---|---|
| NetworkFirst | APIs | Fresh data with cache fallback |
| CacheFirst | Fonts, images | Fast response, rarely changes |
| StaleWhileRevalidate | Pages | Immediate cache response + background update |

Offline page (`app/offline/page.tsx`): static page with "Retry" button (`window.location.reload()`). Ver `references/service-worker-patterns.md`.

---

## 4. Install Prompt (A2HS)

Ver `references/manifest-install.md` para `useInstallPrompt` hook and `InstallBanner` component.

---

## 5. Push Notifications

Setup: `npm install web-push` + generate VAPID keys:
```bash
npx web-push generate-vapid-keys
# Add to .env: NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT
```

**Client subscription:**
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

**Permission UX:** Never ask on page load. Ask after demonstrating value. Handle `'denied'` by explaining how to re-enable in browser settings.

Ver `references/push-notifications.md` para subscribe/send API routes and expired subscription handling (410 Gone).

---

## 6. Background Sync & Offline UI

Ver `references/offline-background-sync.md` para `useNetworkStatus` hook, `OfflineBanner`, and offline queue with IndexedDB.

Pattern: save to IndexedDB if offline -> register sync tag -> SW sends on reconnect.

Ver `references/service-worker-patterns.md` para full retry implementation.

---

## 7. iOS Specifics (2026)

```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="MiApp" />
<link rel="apple-touch-startup-image" href="/splash/iphone14.png"
  media="(device-width: 390px) and (-webkit-device-pixel-ratio: 3)" />
```

**Persistent limitations:** No Badging API. Background Sync very limited (foreground only). No periodic background sync. Push requires iOS 16.4+ and home screen install first.

---

## 8. PWA Audit Checklist

**Lighthouse PWA (target: 100):**
- [ ] Valid manifest linked (`<link rel="manifest">`)
- [ ] Service worker with fetch handler
- [ ] HTTPS in production
- [ ] Functional offline page (`/offline`)
- [ ] `theme-color` meta tag
- [ ] Icons 192x192 and 512x512
- [ ] Responsive (viewport meta tag)
- [ ] `start_url` responds 200 offline

**Additional:**
- [ ] `beforeinstallprompt` captured + banner implemented
- [ ] iOS meta tags configured
- [ ] Push notifications with correct permission UX
- [ ] Background sync for critical forms
- [ ] Offline banner with `useNetworkStatus`
- [ ] Tested on real device (not just Lighthouse)
