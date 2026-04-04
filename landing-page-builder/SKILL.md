---
name: landing-page-builder
description: >
  Construye landing pages desde cero o implementa diseños en código Next.js + Tailwind.
  Para análisis CRO de una landing existente usar `market-landing`.
  Usar cuando: "construir landing page", "página de ventas", "hero section", "pricing page",
  "testimonials", "implementar diseño", "Figma a Next.js", "waitlist page", "homepage".
---

# Landing Page Builder

## Related Skills

- **`market-landing`** — Auditoria CRO antes de implementar. Usa ese skill primero para diagnosticar.

**Stack:** Next.js 15 App Router + Tailwind CSS v4 + shadcn/ui (opcional) + TypeScript estricto.

## Decision Tree: Tipo de Landing

| Tipo | Objetivo | Secciones prioritarias |
|------|----------|----------------------|
| SaaS homepage | Activar trials/demos | Hero > Features > Social proof > Pricing > FAQ > CTA |
| Lead capture | Capturar email | Hero con form > Beneficios > Testimonio > CTA |
| Waitlist | Anticipacion | Hero + form > Por que importa > Fundadores |
| Product launch | Ventas day-one | Hero > Problema > Solucion > Demo > Pricing > Garantia |
| Pricing page | Trial a pago | Pricing cards > Comparacion > FAQ > Testimonios |
| Coming soon | Interes temprano | Hero minimal + countdown + email |

## Anatomia de Alta Conversion

### Above the Fold — Hero

El usuario decide en 3-5s. Reglas:
1. **H1:** propuesta de valor <10 palabras, verbo activo, beneficio concreto
2. **Subheadline:** expande H1, mecanismo + resultado (2-3 lineas max)
3. **CTA primario:** accion especifica ("Empieza gratis" > "Comenzar"), maximo contraste
4. **CTA secundario:** menor compromiso ("Ver demo")
5. **Hero visual:** screenshot/ilustracion del resultado, no del proceso
6. Nunca form largo en hero SaaS; si en lead capture simple

Ver `references/component-library.md` para implementacion TSX del Hero.

### Social Proof

- **Logo wall:** justo debajo del hero, "Usado por equipos en [logos]"
- **Testimonios:** foto real + nombre + cargo + empresa + resultado especifico
- **Stats:** numeros concretos con unidad ("10,000 equipos", "$2M ahorrados")

### Features / Benefits

Vende beneficios, describe features. Cada feature necesita "para que tu puedas..."
- **Feature grid (3-4 cols):** icono Lucide + titulo + 1-2 lineas
- **Feature spotlight (alternado):** imagen + texto para features estrella
- **Comparacion:** tabla "Sin vs Con [producto]"

### Pricing

- Max 3 tiers. Tier medio = "Most popular" badge
- Features: check verde incluido, dash gris no incluido (nunca X rojo)
- CTAs diferenciados: Free="Empieza gratis", Pro="Empieza prueba", Enterprise="Contactar ventas"

### FAQ

Accordion de shadcn/ui + Schema markup FAQPage para SEO. 5-7 objeciones reales.

### Final CTA

Repetir propuesta de valor + CTA primario. Urgencia real si existe. Fondo alto contraste.

## Estructura de Archivos

```
app/(landing)/page.tsx layout.tsx
components/landing/ hero.tsx feature-grid.tsx testimonial-card.tsx pricing-card.tsx faq.tsx logo-wall.tsx cta-section.tsx
```

**Server Components por defecto.** Client solo para: PricingCard (toggle), FAQ Accordion, Forms.

## Copywriting

Ver `references/copywriting-formulas.md` para formulas completas.

- **Hero:** PAS comprimido: "Deja de [problema]. [Producto] te da [resultado]."
- **Feature:** AIDA — Atencion (titulo), Interes (mecanismo), Deseo (resultado)
- **CTA:** Verbo activo + beneficio inmediato

## A/B Testing

```tsx
const variant = await getVariant('hero') // Vercel Edge Config o cookie
return variant === 'b' ? <HeroB /> : <HeroA />
```

## CTA — Color y Contraste

- Contraste minimo WCAG AA: 4.5:1
- Color CTA diferente al color de marca del nav
- Hover: `scale-105` + darkening (no solo opacity)
- Loading: spinner + "Procesando..." + `disabled`

## Performance y SEO

| Metrica | Target | Evitar |
|---------|--------|--------|
| LCP | < 2.5s | Imagen hero sin `priority`, font sin `next/font` |
| CLS | < 0.1 | Imagenes sin width/height |
| INP | < 200ms | Animaciones main thread, JS pesado en fold |

- Hero image: siempre `priority` prop
- Metadata: title + description + OpenGraph con image 1200x630
- Structured Data JSON-LD: `WebPage`, `FAQPage`, `Product` con offers

Ver `references/component-library.md` para implementacion de metadata y Image.

## Animaciones

- Solo below-the-fold; hero instantaneo
- Entrance: `fade-in + translateY` con IntersectionObserver
- CTA: `scale-105` hover, pulse sutil
- Siempre `prefers-reduced-motion: reduce`

## Lead Capture

Ver `references/component-library.md` para email capture + API route con Resend.

Principios: 1 campo (email), placeholder real (`tu@empresa.com`), privacy micro-copy, success state claro.

## Deploy y Analytics

```bash
vercel --prod
```

Eventos de conversion: `track('cta_primary_click')`, `track('lead_captured')`, `track('pricing_cta_click')`.

---

## Referencias

- `references/component-library.md` — Codigo TSX completo
- `references/copywriting-formulas.md` — Formulas y ejemplos por seccion
- `references/tailwind-patterns.md` — Gradients, glassmorphism, grids
