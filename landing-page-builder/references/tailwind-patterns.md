# Tailwind CSS Patterns — Landing Pages

Patrones Tailwind v4 listos para usar en landing pages. Organizados por caso de uso.

---

## Backgrounds y Gradients

### Hero gradient radial (luz desde arriba)
```tsx
<section className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-background to-background">
```

### Hero gradient mesh (moderno, SaaS)
```tsx
<section className="relative overflow-hidden bg-background">
  {/* Blob 1 */}
  <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -z-10" />
  {/* Blob 2 */}
  <div className="absolute top-0 right-1/4 translate-x-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -z-10" />
</section>
```

### Gradient de texto (headlines destacados)
```tsx
<h1 className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
  Headline en gradiente
</h1>
```

### Gradient border (card destacada)
```tsx
<div className="relative rounded-2xl p-px bg-gradient-to-br from-primary/50 to-purple-600/50">
  <div className="rounded-2xl bg-card p-6">
    {/* contenido */}
  </div>
</div>
```

### Sección alternada de fondo
```tsx
{/* Sección clara */}
<section className="bg-background py-24">...</section>

{/* Sección muted alternada */}
<section className="bg-muted/40 py-24">...</section>

{/* Separador con gradiente en lugar de borde duro */}
<section className="bg-gradient-to-b from-muted/40 to-background py-24">...</section>
```

---

## Glassmorphism

### Card con efecto glass
```tsx
<div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl">
  {/* Brillo en el borde superior */}
  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-t-2xl" />
  {/* contenido */}
</div>
```

### Hero glass card (para mostrar UI de producto)
```tsx
<div className="relative rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl overflow-hidden">
  {/* Reflejo superior */}
  <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/10 to-transparent" />
  <Image src="..." alt="..." width={1200} height={800} className="w-full h-auto" />
</div>
```

### Navbar glass (sticky)
```tsx
<nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
```

---

## Shadows y Depth

### Shadow para screenshots de producto
```tsx
{/* Shadow con color de marca */}
<div className="shadow-[0_20px_80px_-20px_hsl(var(--primary)/0.3)]">
  <Image ... />
</div>

{/* Shadow clásico de screenshot */}
<div className="shadow-2xl ring-1 ring-black/5 dark:ring-white/10 rounded-xl overflow-hidden">
  <Image ... />
</div>
```

### Card con hover shadow
```tsx
<div className="rounded-xl border border-border bg-card p-6
  shadow-sm hover:shadow-md hover:shadow-primary/5
  hover:-translate-y-0.5 transition-all duration-200">
```

### Inset shadow (contenedor activo/seleccionado)
```tsx
<div className="shadow-inner bg-muted rounded-lg p-4">
```

---

## Grids Responsivos

### Feature grid (3 cols, se aplana en mobile)
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
```

### Feature grid asimétrico (featured item más grande)
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Featured — ocupa 2 columnas en desktop */}
  <div className="sm:col-span-2 lg:col-span-2 rounded-2xl border bg-card p-8">
    ...
  </div>
  <div className="rounded-2xl border bg-card p-6">...</div>
  <div className="rounded-2xl border bg-card p-6">...</div>
  <div className="rounded-2xl border bg-card p-6">...</div>
</div>
```

### Pricing grid (centrado en 1-2, expandido en 3)
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
```

### Masonry-like con CSS columns
```tsx
{/* Para testimonios */}
<div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
  {testimonials.map(t => (
    <div key={t.author} className="break-inside-avoid rounded-xl border bg-card p-6">
      ...
    </div>
  ))}
</div>
```

---

## Tipografía

### Headline hero (máximo impacto)
```tsx
<h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-7xl leading-[1.1]">
```

### Headline de sección
```tsx
<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
```

### Subheadline / Lead text
```tsx
<p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl">
```

### Eyebrow (texto pequeño sobre el headline)
```tsx
<p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
  Nuevo en 2025
</p>
```

### Balance para headlines multi-línea (evita líneas huérfanas)
```tsx
<h1 className="text-balance">
  Un headline que puede ocupar dos o tres líneas
</h1>
```

### Pretty para párrafos
```tsx
<p className="text-pretty">
  Párrafo largo que se distribye mejor visualmente.
</p>
```

---

## Componentes de UI Comunes

### Badge / Pill de anuncio
```tsx
<div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
  <span className="relative flex h-2 w-2">
    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
  </span>
  Nuevo: Feature X ya disponible
</div>
```

### Divider con texto
```tsx
<div className="relative my-12">
  <div className="absolute inset-0 flex items-center">
    <span className="w-full border-t border-border" />
  </div>
  <div className="relative flex justify-center text-xs uppercase">
    <span className="bg-background px-2 text-muted-foreground">O continúa con</span>
  </div>
</div>
```

### Stats row
```tsx
<div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
  {[
    { value: '10K+', label: 'Usuarios activos' },
    { value: '99.9%', label: 'Uptime' },
    { value: '$2M', label: 'Procesados' },
    { value: '4.9★', label: 'Rating promedio' },
  ].map(stat => (
    <div key={stat.label} className="text-center">
      <div className="text-3xl font-bold text-foreground">{stat.value}</div>
      <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
    </div>
  ))}
</div>
```

### Comparison table (con/sin producto)
```tsx
<div className="grid grid-cols-2 gap-4 rounded-2xl overflow-hidden border border-border">
  {/* Header */}
  <div className="bg-muted/50 px-6 py-4 font-semibold text-muted-foreground">Sin [Producto]</div>
  <div className="bg-primary/10 px-6 py-4 font-semibold text-primary">Con [Producto]</div>
  {/* Rows */}
  {rows.map((row, i) => (
    <>
      <div key={`without-${i}`} className="px-6 py-3 border-t border-border flex items-center gap-2">
        <X className="h-4 w-4 text-destructive shrink-0" />
        {row.without}
      </div>
      <div key={`with-${i}`} className="px-6 py-3 border-t border-border flex items-center gap-2 bg-primary/5">
        <Check className="h-4 w-4 text-primary shrink-0" />
        {row.with}
      </div>
    </>
  ))}
</div>
```

---

## Animaciones con Tailwind

### Fade in al cargar (CSS puro)
```css
/* globals.css */
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fade-in-up 0.5s ease-out both;
}
```

```tsx
{/* Con delay por elemento */}
<div className="animate-fade-in-up [animation-delay:0ms]">...</div>
<div className="animate-fade-in-up [animation-delay:100ms]">...</div>
<div className="animate-fade-in-up [animation-delay:200ms]">...</div>
```

### Scroll-triggered con IntersectionObserver
```tsx
'use client'
import { useEffect, useRef } from 'react'

export function RevealOnScroll({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('opacity-100', 'translate-y-0'); observer.disconnect() } },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`opacity-0 translate-y-6 transition-all duration-700 ease-out ${className}`}>
      {children}
    </div>
  )
}
```

### Staggered children
```tsx
{features.map((feature, i) => (
  <div
    key={feature.title}
    className="animate-fade-in-up"
    style={{ animationDelay: `${i * 100}ms` }}
  >
    ...
  </div>
))}
```

### Marquee keyframe
```css
/* globals.css o tailwind.config */
@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.animate-marquee {
  animation: marquee 30s linear infinite;
}
.animate-marquee:hover {
  animation-play-state: paused;
}
```

### Pulse en CTA (atención sutil)
```tsx
{/* Anillo de pulse alrededor del CTA principal */}
<div className="relative inline-flex">
  <div className="absolute -inset-1 rounded-lg bg-primary/30 animate-pulse blur-sm" />
  <Button className="relative">Empieza gratis</Button>
</div>
```

### Reduced motion — siempre incluir
```css
/* globals.css */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## Dark Mode

### Patrones de color dark-aware
```tsx
{/* Fondo que funciona en ambos modos */}
<div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">

{/* Shadow visible en dark */}
<div className="shadow-lg shadow-black/5 dark:shadow-black/30">

{/* Glassmorphism en dark */}
<div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-700/50">
```

### Forced dark section (CTA final oscuro en sitio claro)
```tsx
<section className="dark bg-foreground">
  <div className="text-foreground">
    {/* Con dark class en el section, Tailwind dark: aplica aquí */}
  </div>
</section>
```

---

## Layout Helpers

### Container consistente
```tsx
{/* Usa siempre el mismo container para alignment visual */}
<div className="container mx-auto px-4 sm:px-6 lg:px-8">
```

### Centrado vertical full-height (coming soon, waitlist)
```tsx
<main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
```

### Sticky section header (para pricing con muchas columnas)
```tsx
<div className="sticky top-16 z-10 bg-background/95 backdrop-blur border-b border-border py-4">
```

### Grid con líneas de separación (feature comparison)
```tsx
<div className="divide-y divide-border">
  {rows.map(row => (
    <div key={row.label} className="grid grid-cols-4 py-4 gap-4">
      ...
    </div>
  ))}
</div>
```
