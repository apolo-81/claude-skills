---
name: landing-page-builder
description: >
  Use when building a landing page from scratch or implementing a design into code.
  Trigger when user wants to create a landing page, convert a mockup to code, build
  a hero section, pricing page, features section, testimonials, CTA section, or any
  marketing page. Also trigger for: "construir landing page", "hacer página de ventas",
  "implementar diseño de landing", "quiero una página para mi producto", "crear homepage",
  "página de captura de leads", "squeeze page", converting Figma to Next.js/Tailwind,
  building signup pages, waitlist pages, or SaaS marketing sites.
---

# Landing Page Builder

## Overview

Este skill cierra el loop entre análisis/diseño (market-landing) y código implementado. Produce landing pages de alta conversión con Next.js 15 App Router + Tailwind CSS v4.

**Cuándo usar este skill vs solo escribir componentes:**
- Usar este skill: página nueva desde cero, conversión es el objetivo principal, necesitas estructura CRO completa
- Solo componentes: agregando una sección a página existente, refactor de UI sin cambio de copy

**Stack default:**
- Next.js 15 App Router (Server Components por defecto, Client solo cuando necesario)
- Tailwind CSS v4
- shadcn/ui (opcional, solo importar lo que se usa)
- TypeScript estricto

## Decision Tree: Tipo de Landing

| Tipo | Objetivo | Secciones prioritarias |
|------|----------|----------------------|
| SaaS homepage | Activar trials/demos | Hero > Features > Social proof > Pricing > FAQ > CTA |
| Lead capture / Email opt-in | Capturar email | Hero con form > Beneficios > Testimonio > CTA |
| Waitlist page | Generar anticipación | Hero + form > Por qué importa > Fundadores |
| Product launch | Ventas day-one | Hero > Problema > Solución > Demo > Pricing > Garantía |
| Pricing page | Convertir trial a pago | Pricing cards > Comparación > FAQ > Testimonios |
| Coming soon | Capturar interés temprano | Hero minimal + countdown + email |

## Anatomía de Alta Conversión

### Above the Fold (donde se gana o pierde la conversión)

**Por qué es crítico:** El usuario decide en 3-5 segundos si continúa. Todo lo visible sin scroll debe comunicar el valor completo.

**Hero — reglas de conversión:**
1. H1 único: propuesta de valor en menos de 10 palabras, verbo activo, beneficio concreto
2. Subheadline: expande el H1, menciona el mecanismo y el resultado esperado (2-3 líneas máx)
3. CTA primario: acción específica ("Empieza gratis" > "Comenzar"), color de máximo contraste
4. CTA secundario: alternativa de menor compromiso ("Ver demo", "Ver cómo funciona")
5. Hero visual: screenshot del producto o ilustración que muestre el resultado, no el proceso
6. Nunca poner formulario largo en el hero de SaaS; sí en lead capture simple

```tsx
// Implementación mínima correcta
<section className="relative min-h-[90vh] flex items-center">
  <div className="container mx-auto px-4 py-24 text-center lg:text-left">
    <h1 className="text-4xl font-bold tracking-tight lg:text-6xl">
      {headline}
    </h1>
    <p className="mt-6 text-xl text-muted-foreground max-w-2xl">
      {subheadline}
    </p>
    <div className="mt-10 flex gap-4 flex-wrap justify-center lg:justify-start">
      <Button size="lg" asChild>
        <Link href={primaryCTA.href}>{primaryCTA.label}</Link>
      </Button>
      <Button size="lg" variant="outline" asChild>
        <Link href={secondaryCTA.href}>{secondaryCTA.label}</Link>
      </Button>
    </div>
  </div>
</section>
```

### Social Proof

**Por qué funciona:** Reduce la fricción de decisión — si otros confían, el riesgo percibido baja.

- **Logo wall:** Colocar justo debajo del hero. "Usado por equipos en [logos]". Sin texto excesivo.
- **Testimonios:** Foto real + nombre + cargo + empresa. Evitar genéricos. Destacar el resultado específico logrado.
- **Stats:** Números concretos con unidad ("10,000 equipos", "$2M ahorrados", "99.9% uptime"). Nunca "muchos" o "miles".

### Features / Benefits

**Regla clave:** Vende beneficios, describe features. Cada feature necesita su "para que tú puedas..."

- **Feature grid (3-4 cols):** Icono Lucide + título corto + descripción 1-2 líneas. Para comunicar amplitud.
- **Feature spotlight (alternado):** Imagen + texto. Para demostrar profundidad de una feature estrella.
- **Comparación:** Tabla "Sin [producto] vs Con [producto]". Alta conversión para usuarios con alternativas actuales.

### Pricing Section

**Por qué el toggle monthly/annual convierte:** El usuario ve el ahorro anual inmediatamente, lo que justifica el compromiso.

- Máximo 3 tiers. El tier medio es el que quieres vender — dale "Most popular" badge.
- Lista de features: check verde para incluido, dash gris para no incluido. Nunca X rojo (negativo).
- CTA diferente por tier: Free="Empieza gratis", Pro="Empieza prueba", Enterprise="Contactar ventas"

### FAQ

Usa Accordion de shadcn/ui. Incluye Schema markup FAQPage para SEO. Responde las 5-7 objeciones reales del cliente, no preguntas triviales.

### Final CTA

La última oportunidad. Repite la propuesta de valor y el CTA primario. Añade urgencia real si existe (no falsa escasez). Fondo de alto contraste para que destaque visualmente.

## Componentes — Guía de Implementación

Los componentes completos están en `references/component-library.md`. Estructura de archivos:

```
app/
  (landing)/
    page.tsx              # Composición de secciones
    layout.tsx            # Metadata, fonts
components/
  landing/
    hero.tsx
    feature-grid.tsx
    testimonial-card.tsx
    pricing-card.tsx
    faq.tsx
    logo-wall.tsx
    cta-section.tsx
```

**Regla de Server vs Client Components:**
- Server por defecto: Hero, FeatureGrid, LogoWall, CTASection (contenido estático)
- Client solo cuando necesario: PricingCard (toggle), FAQ Accordion, Forms

## Patrones de Conversión

### Copywriting — Fórmulas por Sección

Ver `references/copywriting-formulas.md` para ejemplos completos.

**Hero headline:** PAS (Problema-Agitación-Solución) comprimido: "Deja de [problema]. [Producto] te da [resultado]."
**Feature:** AIDA — Atención (título), Interés (descripción del mecanismo), Deseo (resultado implícito)
**CTA:** Verbo activo + beneficio inmediato. "Empieza gratis hoy" > "Registrarse"

### A/B Testing — Estructura de Código

Encapsula variantes en componentes separados para facilitar testing con herramientas como Vercel Edge Config:

```tsx
// app/(landing)/page.tsx
import { HeroA } from '@/components/landing/variants/hero-a'
import { HeroB } from '@/components/landing/variants/hero-b'

const variant = await getVariant('hero') // Vercel Edge Config o cookie
export default function Page() {
  return variant === 'b' ? <HeroB /> : <HeroA />
}
```

### CTA — Reglas de Color y Contraste

- Contraste mínimo WCAG AA: 4.5:1 texto sobre fondo del botón
- Color CTA: nunca el mismo que el color de marca principal si aparece en el nav — necesita destacar
- Hover state: `scale-105` + darkening del color (no solo opacity)
- Loading state: spinner + texto "Procesando..." + `disabled` en el botón

## Performance y SEO

### Core Web Vitals — Targets para Landing Pages

| Métrica | Target | Qué no hacer |
|---------|--------|-------------|
| LCP | < 2.5s | Imagen hero sin `priority`, font sin `next/font` |
| CLS | < 0.1 | Imágenes sin `width/height`, fonts con `display: swap` manual |
| INP | < 200ms | Animaciones en el main thread, JS pesado en el fold |

### Implementación obligatoria

```tsx
// app/(landing)/layout.tsx
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'Headline de Producto | Nombre del Producto',
  description: 'Subheadline. Propuesta de valor en 155 caracteres máx.',
  openGraph: {
    title: '...',
    description: '...',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}
```

```tsx
// Hero image — siempre priority en above-the-fold
<Image
  src="/hero-screenshot.png"
  alt="Dashboard de [Producto] mostrando [feature principal]"
  width={1200}
  height={800}
  priority  // precarga — crítico para LCP
  className="rounded-xl shadow-2xl"
/>
```

### Structured Data

Incluir en `<head>` vía script JSON-LD:
- `WebPage` o `SoftwareApplication` para la homepage
- `FAQPage` para la sección FAQ (boost en SERPs)
- `Product` con `offers` si hay pricing

## Animaciones

Integración con el skill `web-animations`. Reglas para landing pages:

1. **Cuándo animar:** Solo secciones below-the-fold; el hero debe ser instantáneo
2. **Entrance animations:** `fade-in + translateY` al entrar en viewport con `IntersectionObserver`
3. **Micro-interactions CTA:** `scale-105` en hover, pulse sutil en el CTA primario
4. **Siempre respetar:**

```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

Evitar: animaciones continuas (spinner decorativo), parallax agresivo, transiciones >500ms en elementos interactivos.

## Lead Capture & Forms

### Email Capture (patrón mínimo)

```tsx
'use client'
// Estado: idle | loading | success | error
const [state, setState] = useState<'idle'|'loading'|'success'|'error'>('idle')

async function handleSubmit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault()
  setState('loading')
  const res = await fetch('/api/waitlist', {
    method: 'POST',
    body: JSON.stringify({ email: new FormData(e.currentTarget).get('email') })
  })
  setState(res.ok ? 'success' : 'error')
}
```

**API Route con Resend:**

```ts
// app/api/waitlist/route.ts
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const { email } = await req.json()
  await resend.contacts.create({ email, audienceId: process.env.RESEND_AUDIENCE_ID! })
  return Response.json({ ok: true })
}
```

**Principios de conversión en forms:**
- Mínimo 1 campo (email). Cada campo adicional reduce conversión ~10%
- Placeholder con ejemplo real: `"tu@empresa.com"` > `"Email"`
- Privacy micro-copy bajo el botón: "Sin spam. Cancela cuando quieras."
- Success state: mensaje específico, siguiente paso claro ("Revisa tu inbox")

## Deploy y Analytics

### Deploy a Vercel

```bash
vercel --prod
# O con el skill vercel:deploy
```

Variables de entorno necesarias en Vercel Dashboard:
- `RESEND_API_KEY`
- `RESEND_AUDIENCE_ID`
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (si usas Plausible)

### Analytics y Conversion Tracking

```tsx
// app/layout.tsx — Vercel Analytics (zero config)
import { Analytics } from '@vercel/analytics/react'
export default function RootLayout({ children }) {
  return <html><body>{children}<Analytics /></body></html>
}
```

**Eventos de conversión a trackear:**
- CTA primario click: `track('cta_primary_click', { position: 'hero' })`
- Form submit success: `track('lead_captured', { source: 'waitlist_form' })`
- Pricing tier click: `track('pricing_cta_click', { tier: 'pro' })`

## Referencias

- `references/component-library.md` — Código TSX completo de todos los componentes
- `references/copywriting-formulas.md` — Fórmulas y ejemplos de copy por sección
- `references/tailwind-patterns.md` — Patrones Tailwind para landing pages (gradients, glassmorphism, grids)
