# Manifest & Install Prompt Code

## Web App Manifest — `app/manifest.ts`

```typescript
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
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable any' },
    ],
    screenshots: [
      { src: '/screenshots/desktop.png', sizes: '1280x720', type: 'image/png' },
      { src: '/screenshots/mobile.png', sizes: '390x844', type: 'image/png' },
    ],
  }
}
```

## Install Prompt Hook — `hooks/useInstallPrompt.ts`

```typescript
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
    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent))
    setIsInstalled(window.matchMedia('(display-mode: standalone)').matches)
    const handler = (e: Event) => { e.preventDefault(); setPrompt(e as BeforeInstallPromptEvent) }
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

## Install Banner Component

```typescript
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
