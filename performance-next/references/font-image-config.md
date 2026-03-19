# Font & Image Configuration

## Image Patterns — `next/image`

```typescript
// Hero (above the fold) — priority + sizes
<Image src="/hero.jpg" alt="Hero" width={1200} height={600}
  priority sizes="(max-width: 768px) 100vw, 50vw" quality={85} />

// Blur placeholder
<Image src={src} alt={alt} width={800} height={600}
  placeholder="blur" blurDataURL={blurDataURL} />

// fill — container defines size
<div className="relative w-full h-64">
  <Image src={src} alt={alt} fill className="object-cover" />
</div>

// Avatars/icons — fixed dimensions
<Image src={avatar} alt={name} width={40} height={40} className="rounded-full" />
```

## Image Config — `next.config.ts`

```typescript
const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co', pathname: '/storage/v1/object/public/**' },
      { protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/images/**' },
    ],
  },
}
```

## Google Fonts — `next/font`

```typescript
// app/fonts.ts
import { Inter, Playfair_Display } from 'next/font/google'

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
})

export const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  weight: ['400', '700'],
})

// app/layout.tsx
import { inter, playfair } from '@/app/fonts'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

## Variable fonts (single file, all weights)

```typescript
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  // Don't specify weight → loads variable font automatically
})
```

## Self-hosted — `next/font/local`

```typescript
import localFont from 'next/font/local'

export const myFont = localFont({
  src: [
    { path: '../public/fonts/MyFont-Regular.woff2', weight: '400' },
    { path: '../public/fonts/MyFont-Bold.woff2', weight: '700' },
  ],
  display: 'swap',
  variable: '--font-custom',
})
```

## Tailwind Integration

```typescript
// tailwind.config.ts
const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        display: ['var(--font-playfair)'],
      },
    },
  },
}
```
