# Component Library — Landing Page Builder

Componentes TSX completos listos para copy-paste. Stack: Next.js 15 App Router + Tailwind CSS v4 + TypeScript estricto.

---

## Hero Component

```tsx
// components/landing/hero.tsx
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface HeroProps {
  headline: string
  subheadline: string
  primaryCTA: { label: string; href: string }
  secondaryCTA?: { label: string; href: string }
  badge?: string
  image?: { src: string; alt: string; width: number; height: number }
}

export function Hero({ headline, subheadline, primaryCTA, secondaryCTA, badge, image }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <div className="container mx-auto px-4 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Copy */}
          <div className="text-center lg:text-left">
            {badge && (
              <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm font-medium mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {badge}
              </div>
            )}
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {headline}
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-xl mx-auto lg:mx-0">
              {subheadline}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="text-base font-semibold shadow-lg hover:scale-105 transition-transform" asChild>
                <Link href={primaryCTA.href}>{primaryCTA.label}</Link>
              </Button>
              {secondaryCTA && (
                <Button size="lg" variant="outline" className="text-base" asChild>
                  <Link href={secondaryCTA.href}>{secondaryCTA.label}</Link>
                </Button>
              )}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Sin tarjeta de crédito. Cancela cuando quieras.
            </p>
          </div>

          {/* Visual */}
          {image && (
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/5 rounded-2xl blur-3xl" />
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                priority
                className="relative rounded-xl shadow-2xl border border-border/50 w-full h-auto"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
```

---

## LogoWall Component

```tsx
// components/landing/logo-wall.tsx
import Image from 'next/image'

interface Logo {
  name: string
  src: string
  width: number
  height: number
}

interface LogoWallProps {
  heading?: string
  logos: Logo[]
  marquee?: boolean
}

export function LogoWall({ heading = 'Usado por equipos en', logos, marquee = false }: LogoWallProps) {
  return (
    <section className="border-y border-border/40 bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm font-medium text-muted-foreground mb-8 uppercase tracking-widest">
          {heading}
        </p>
        {marquee ? (
          <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]">
            <div className="flex gap-12 animate-[marquee_30s_linear_infinite] w-max">
              {[...logos, ...logos].map((logo, i) => (
                <div key={i} className="flex items-center justify-center h-10 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
                  <Image src={logo.src} alt={logo.name} width={logo.width} height={logo.height} className="h-8 w-auto object-contain" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
            {logos.map((logo) => (
              <div key={logo.name} className="opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
                <Image src={logo.src} alt={logo.name} width={logo.width} height={logo.height} className="h-8 w-auto object-contain" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// tailwind.config — agregar keyframe si usas marquee:
// keyframes: { marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } } }
```

---

## FeatureGrid Component

```tsx
// components/landing/feature-grid.tsx
import { LucideIcon } from 'lucide-react'

interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

interface FeatureGridProps {
  heading: string
  subheading?: string
  features: Feature[]
  columns?: 2 | 3 | 4
}

export function FeatureGrid({ heading, subheading, features, columns = 3 }: FeatureGridProps) {
  const gridCols = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{heading}</h2>
          {subheading && (
            <p className="mt-4 text-lg text-muted-foreground">{subheading}</p>
          )}
        </div>
        <div className={`grid gap-8 ${gridCols[columns]}`}>
          {features.map((feature) => (
            <div key={feature.title} className="group relative rounded-2xl border border-border/60 bg-card p-6 hover:border-primary/50 hover:shadow-md transition-all">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

## FeatureSpotlight Component (alternado)

```tsx
// components/landing/feature-spotlight.tsx
import Image from 'next/image'
import { CheckCircle } from 'lucide-react'

interface SpotlightItem {
  eyebrow: string
  heading: string
  description: string
  bullets: string[]
  image: { src: string; alt: string }
}

interface FeatureSpotlightProps {
  items: SpotlightItem[]
}

export function FeatureSpotlight({ items }: FeatureSpotlightProps) {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 space-y-32">
        {items.map((item, index) => (
          <div
            key={item.heading}
            className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:[direction:rtl]' : ''}`}
          >
            <div className="[direction:ltr]">
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">{item.eyebrow}</p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{item.heading}</h2>
              <p className="mt-4 text-lg text-muted-foreground">{item.description}</p>
              <ul className="mt-8 space-y-3">
                {item.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="[direction:ltr] relative">
              <div className="absolute -inset-4 bg-primary/5 rounded-2xl blur-2xl" />
              <Image
                src={item.image.src}
                alt={item.image.alt}
                width={600}
                height={400}
                className="relative rounded-xl shadow-xl border border-border/50 w-full h-auto"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
```

---

## TestimonialCard Component

```tsx
// components/landing/testimonials.tsx
import Image from 'next/image'
import { Star } from 'lucide-react'

interface Testimonial {
  quote: string
  author: string
  role: string
  company: string
  avatar: string
  stars?: number
}

interface TestimonialsProps {
  heading: string
  testimonials: Testimonial[]
}

export function Testimonials({ heading, testimonials }: TestimonialsProps) {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-16 sm:text-4xl">{heading}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.author} className="flex flex-col rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              {t.stars && (
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              )}
              <blockquote className="flex-1 text-foreground leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <Image
                  src={t.avatar}
                  alt={t.author}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-sm text-foreground">{t.author}</div>
                  <div className="text-xs text-muted-foreground">{t.role}, {t.company}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

## PricingCard Component (con toggle)

```tsx
// components/landing/pricing.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Check, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface PricingTier {
  name: string
  description: string
  monthlyPrice: number | null  // null = custom/contact
  annualPrice: number | null
  features: { label: string; included: boolean }[]
  cta: { label: string; href: string }
  highlighted?: boolean
  badge?: string
}

interface PricingProps {
  heading: string
  tiers: PricingTier[]
}

export function Pricing({ heading, tiers }: PricingProps) {
  const [annual, setAnnual] = useState(false)

  return (
    <section className="py-24 bg-muted/30" id="pricing">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{heading}</h2>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Label htmlFor="billing-toggle" className={cn('text-sm', !annual && 'font-semibold')}>Mensual</Label>
            <Switch id="billing-toggle" checked={annual} onCheckedChange={setAnnual} />
            <Label htmlFor="billing-toggle" className={cn('text-sm', annual && 'font-semibold')}>
              Anual
              <Badge variant="secondary" className="ml-2 text-xs font-medium">Ahorra 20%</Badge>
            </Label>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
          {tiers.map((tier) => {
            const price = annual ? tier.annualPrice : tier.monthlyPrice
            return (
              <div
                key={tier.name}
                className={cn(
                  'rounded-2xl border p-8 flex flex-col',
                  tier.highlighted
                    ? 'border-primary bg-primary text-primary-foreground shadow-2xl scale-105'
                    : 'border-border bg-card'
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">{tier.name}</h3>
                  {tier.badge && (
                    <Badge className={tier.highlighted ? 'bg-primary-foreground text-primary' : ''}>
                      {tier.badge}
                    </Badge>
                  )}
                </div>
                <p className={cn('text-sm mb-6', tier.highlighted ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                  {tier.description}
                </p>
                <div className="mb-8">
                  {price !== null ? (
                    <>
                      <span className="text-4xl font-bold">${price}</span>
                      <span className={cn('text-sm ml-1', tier.highlighted ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                        /mes{annual && ' facturado anual'}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold">Contactar</span>
                  )}
                </div>
                <Button
                  className={cn('mb-8', tier.highlighted && 'bg-primary-foreground text-primary hover:bg-primary-foreground/90')}
                  variant={tier.highlighted ? 'default' : 'outline'}
                  asChild
                >
                  <Link href={tier.cta.href}>{tier.cta.label}</Link>
                </Button>
                <ul className="space-y-3 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature.label} className="flex items-center gap-3 text-sm">
                      {feature.included ? (
                        <Check className={cn('h-4 w-4 shrink-0', tier.highlighted ? 'text-primary-foreground' : 'text-primary')} />
                      ) : (
                        <Minus className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                      )}
                      <span className={cn(!feature.included && 'text-muted-foreground/50 line-through')}>
                        {feature.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
```

---

## FAQ Component con Schema Markup

```tsx
// components/landing/faq.tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface FAQItem {
  question: string
  answer: string
}

interface FAQProps {
  heading: string
  items: FAQItem[]
}

export function FAQ({ heading, items }: FAQProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  return (
    <section className="py-24 bg-background" id="faq">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-12 sm:text-4xl">{heading}</h2>
        <Accordion type="single" collapsible className="space-y-2">
          {items.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-border/60 rounded-xl px-6 data-[state=open]:border-primary/50 transition-colors"
            >
              <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
```

---

## CTASection Component (cierre)

```tsx
// components/landing/cta-section.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface CTASectionProps {
  heading: string
  subheading: string
  primaryCTA: { label: string; href: string }
  secondaryCTA?: { label: string; href: string }
  microcopy?: string
  variant?: 'gradient' | 'dark' | 'bordered'
}

export function CTASection({ heading, subheading, primaryCTA, secondaryCTA, microcopy, variant = 'gradient' }: CTASectionProps) {
  const backgrounds = {
    gradient: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background',
    dark: 'bg-foreground text-background',
    bordered: 'border-y border-border bg-muted/30',
  }

  return (
    <section className={`py-24 ${backgrounds[variant]}`}>
      <div className="container mx-auto px-4 text-center max-w-3xl">
        <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">{heading}</h2>
        <p className="mt-6 text-lg text-muted-foreground">{subheading}</p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="text-base font-semibold shadow-lg hover:scale-105 transition-transform group" asChild>
            <Link href={primaryCTA.href}>
              {primaryCTA.label}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          {secondaryCTA && (
            <Button size="lg" variant="outline" className="text-base" asChild>
              <Link href={secondaryCTA.href}>{secondaryCTA.label}</Link>
            </Button>
          )}
        </div>
        {microcopy && (
          <p className="mt-4 text-sm text-muted-foreground">{microcopy}</p>
        )}
      </div>
    </section>
  )
}
```

---

## WaitlistForm Component

```tsx
// components/landing/waitlist-form.tsx
'use client'
import { useState, FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle, Loader2 } from 'lucide-react'
import { track } from '@vercel/analytics'

type FormState = 'idle' | 'loading' | 'success' | 'error'

interface WaitlistFormProps {
  placeholder?: string
  buttonLabel?: string
  privacyNote?: string
  apiEndpoint?: string
}

export function WaitlistForm({
  placeholder = 'tu@empresa.com',
  buttonLabel = 'Unirme a la lista',
  privacyNote = 'Sin spam. Solo actualizaciones importantes.',
  apiEndpoint = '/api/waitlist',
}: WaitlistFormProps) {
  const [state, setState] = useState<FormState>('idle')
  const [email, setEmail] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('loading')
    try {
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error()
      setState('success')
      track('lead_captured', { source: 'waitlist_form' })
    } catch {
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-6 py-4 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
        <CheckCircle className="h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">Estás en la lista.</p>
          <p className="text-sm opacity-80">Revisa tu inbox para confirmar tu email.</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2 max-w-md">
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
          disabled={state === 'loading'}
        />
        <Button type="submit" disabled={state === 'loading'} className="shrink-0">
          {state === 'loading' ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Procesando</>
          ) : buttonLabel}
        </Button>
      </div>
      {state === 'error' && (
        <p className="text-sm text-destructive">Algo salió mal. Intenta de nuevo.</p>
      )}
      <p className="text-xs text-muted-foreground">{privacyNote}</p>
    </form>
  )
}
```

---

## API Route — Waitlist con Resend

```ts
// app/api/waitlist/route.ts
import { Resend } from 'resend'
import { z } from 'zod'

const resend = new Resend(process.env.RESEND_API_KEY)

const schema = z.object({ email: z.string().email() })

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email } = schema.parse(body)

    await resend.contacts.create({
      email,
      audienceId: process.env.RESEND_AUDIENCE_ID!,
    })

    // Email de confirmación (opcional)
    await resend.emails.send({
      from: 'noreply@tudominio.com',
      to: email,
      subject: 'Confirma tu lugar en la lista',
      html: `<p>Gracias por unirte. Te avisaremos cuando estemos listos.</p>`,
    })

    return Response.json({ ok: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({ error: 'Email inválido' }, { status: 400 })
    }
    return Response.json({ error: 'Error interno' }, { status: 500 })
  }
}
```

---

## Structured Data Component (WebPage + Product)

```tsx
// components/landing/structured-data.tsx

interface WebPageSchemaProps {
  name: string
  description: string
  url: string
}

export function WebPageSchema({ name, description, url }: WebPageSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url,
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

interface SoftwareAppSchemaProps {
  name: string
  description: string
  price: string
  priceCurrency?: string
  applicationCategory?: string
  operatingSystem?: string
}

export function SoftwareAppSchema({
  name, description, price, priceCurrency = 'USD',
  applicationCategory = 'BusinessApplication',
  operatingSystem = 'Web'
}: SoftwareAppSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    applicationCategory,
    operatingSystem,
    offers: { '@type': 'Offer', price, priceCurrency },
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}
```

---

## Page Composition Example

```tsx
// app/(landing)/page.tsx
import { Hero } from '@/components/landing/hero'
import { LogoWall } from '@/components/landing/logo-wall'
import { FeatureGrid } from '@/components/landing/feature-grid'
import { Testimonials } from '@/components/landing/testimonials'
import { Pricing } from '@/components/landing/pricing'
import { FAQ } from '@/components/landing/faq'
import { CTASection } from '@/components/landing/cta-section'
import { Zap, Shield, BarChart3, Globe } from 'lucide-react'

export default function LandingPage() {
  return (
    <main>
      <Hero
        headline="Lanza tu producto sin escribir una línea de backend"
        subheadline="La plataforma que conecta tu idea con tus primeros clientes en horas, no semanas. Sin servidores, sin configuración, sin fricción."
        primaryCTA={{ label: 'Empieza gratis', href: '/signup' }}
        secondaryCTA={{ label: 'Ver demo', href: '/demo' }}
        badge="Nuevo: integración con Stripe en 1 click"
        image={{ src: '/dashboard-screenshot.png', alt: 'Dashboard del producto', width: 1200, height: 800 }}
      />

      <LogoWall
        logos={[
          { name: 'Vercel', src: '/logos/vercel.svg', width: 80, height: 24 },
          { name: 'Stripe', src: '/logos/stripe.svg', width: 60, height: 24 },
        ]}
      />

      <FeatureGrid
        heading="Todo lo que necesitas para lanzar"
        subheading="Sin configurar 12 servicios distintos. Una plataforma, todo integrado."
        features={[
          { icon: Zap, title: 'Deploy en segundos', description: 'Push a main y tu app está en producción automáticamente.' },
          { icon: Shield, title: 'Auth incluido', description: 'Login, registro, OAuth y 2FA sin escribir código.' },
          { icon: BarChart3, title: 'Analytics en tiempo real', description: 'Conoce de dónde vienen tus usuarios y qué hacen.' },
          { icon: Globe, title: 'CDN global', description: 'Menos de 50ms de latencia desde cualquier parte del mundo.' },
        ]}
      />

      <Pricing
        heading="Precio simple, valor enorme"
        tiers={[
          {
            name: 'Free', description: 'Para experimentar y proyectos personales.',
            monthlyPrice: 0, annualPrice: 0,
            features: [
              { label: '3 proyectos', included: true },
              { label: '100 usuarios/mes', included: true },
              { label: 'Analytics básico', included: true },
              { label: 'Custom domain', included: false },
            ],
            cta: { label: 'Empieza gratis', href: '/signup' },
          },
          {
            name: 'Pro', description: 'Para productos en producción con clientes reales.',
            monthlyPrice: 49, annualPrice: 39,
            features: [
              { label: 'Proyectos ilimitados', included: true },
              { label: 'Usuarios ilimitados', included: true },
              { label: 'Analytics avanzado', included: true },
              { label: 'Custom domain', included: true },
            ],
            cta: { label: 'Empieza prueba 14 días', href: '/signup?plan=pro' },
            highlighted: true, badge: 'Más popular',
          },
          {
            name: 'Enterprise', description: 'Para equipos con requisitos específicos.',
            monthlyPrice: null, annualPrice: null,
            features: [
              { label: 'Todo en Pro', included: true },
              { label: 'SLA 99.99%', included: true },
              { label: 'SSO / SAML', included: true },
              { label: 'Soporte dedicado', included: true },
            ],
            cta: { label: 'Contactar ventas', href: '/contact' },
          },
        ]}
      />

      <FAQ
        heading="Preguntas frecuentes"
        items={[
          { question: '¿Necesito tarjeta de crédito para empezar?', answer: 'No. El plan Free es gratuito para siempre sin tarjeta.' },
          { question: '¿Puedo migrar desde mi setup actual?', answer: 'Sí. Tenemos guías de migración para los setups más comunes y soporte en el proceso.' },
        ]}
      />

      <CTASection
        heading="Lanza esta semana, no en 3 meses"
        subheading="Únete a 10,000 founders que eligieron enfocarse en su producto, no en su infraestructura."
        primaryCTA={{ label: 'Empieza gratis ahora', href: '/signup' }}
        microcopy="Sin tarjeta de crédito. Setup en menos de 5 minutos."
      />
    </main>
  )
}
```
