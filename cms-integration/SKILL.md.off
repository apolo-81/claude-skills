---
name: cms-integration
description: >
  Integra un CMS headless a Next.js para que el cliente edite contenido sin código.
  Stack: Sanity / Contentful / Strapi.
  Usar cuando: "CMS", "headless CMS", "Sanity", "sitio administrable", "blog con CMS",
  "el cliente quiere editar", "GROQ", "live preview", "contenido dinámico", "Strapi".
---

# CMS Headless Integration — Next.js

## 1. Decision Tree

```
¿El cliente necesita editar contenido sin conocimientos tecnicos?
├── NO → MDX (archivos Markdown en el repo)
└── YES →
    ¿Self-hosted / open source?
    ├── YES → Strapi o Directus
    └── NO →
        ¿Enterprise con equipo grande y multiples idiomas?
        ├── YES → Contentful
        └── NO → Sanity (recomendado para agencias/freelancers)
```

**Cuando NO usar CMS headless:** sitios donde el dev controla contenido, landing pages estaticas que raramente cambian, sin presupuesto de mantenimiento.

| | Sanity | Contentful | Strapi | TinaCMS |
|---|---|---|---|---|
| Precio | Free tier generoso | Caro en escala | Open source | Free/paid |
| Self-hosted | No | No | Si | No |
| Live Preview | Nativo | Limitado | Manual | Nativo |
| Multilingual | Plugin | Nativo | Plugin | No |
| Schema | Codigo (flexible) | UI + codigo | UI + codigo | Git-based |

## 2. Sanity — Opcion principal

### Setup

```bash
npm create sanity@latest -- --template clean --create-project "Mi Proyecto" --dataset production
```

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=xxxxxxxx
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=sk...
```

```typescript
// lib/sanity/client.ts
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: true,
})
const builder = imageUrlBuilder(client)
export const urlFor = (source: any) => builder.image(source)
```

### Schema, GROQ queries, Portable Text, Revalidation, Live Preview

Ver `references/sanity-setup.md` para implementacion completa de todos estos patrones.

**GROQ queries esenciales** (inline por ser decision-relevant):

```typescript
// Lista paginada
const postsQuery = `*[_type == "post" && defined(slug.current)] | order(publishedAt desc) [$start...$end] {
  _id, title, slug, publishedAt, excerpt, mainImage,
  "author": author->{ name, image },
  "categories": categories[]->{ title, slug }
}`
// Post por slug
const postBySlugQuery = `*[_type == "post" && slug.current == $slug][0] { ... }`
// Slugs para generateStaticParams
const postSlugsQuery = `*[_type == "post" && defined(slug.current)].slug.current`
```

**Fetch en App Router:**
- `export const revalidate = 60` para ISR
- `generateStaticParams` con `postSlugsQuery`
- On-demand revalidation via webhook: API route que valida secret y llama `revalidatePath`/`revalidateTag`

**Portable Text:** `npm install @portabletext/react` — ver `references/sanity-setup.md` para componente `PortableTextRenderer`.

**Live Preview:** `npm install next-sanity` — draft mode API route que valida secret y habilita `draftMode()`.

## 3. Contentful — Alternativa enterprise

```typescript
// lib/contentful/client.ts
import { createClient } from 'contentful'
export const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
})
export const previewClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_PREVIEW_TOKEN!,
  host: 'preview.contentful.com',
})
```

Fetch: `client.getEntries({ content_type: 'blogPost', order: ['-sys.createdAt'] })`
Webhook revalidation: mismo patron que Sanity.

## 4. Strapi — Self-hosted

```bash
npx create-strapi-app@latest my-backend --quickstart
```

```typescript
// lib/strapi/client.ts
async function strapiQuery<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${process.env.STRAPI_URL!}/api/${endpoint}`)
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${process.env.STRAPI_API_TOKEN!}` },
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`Strapi error: ${res.status}`)
  return res.json()
}
```

Media con Cloudinary: Strapi Admin > Settings > Media Library > Cloudinary provider.

## 5. Imagenes con next/image

Agregar dominios en `next.config.js`:
```js
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'cdn.sanity.io' },
    { protocol: 'https', hostname: 'images.ctfassets.net' },
  ],
}
```

- Sanity: `urlFor(image).width(800).height(450).url()` + `blurDataURL` con `.width(20).blur(10).url()`
- Contentful: URL params `?w=800&h=450&fit=fill&f=face`

## 6. Patrones de contenido comunes

- **Blog**: post (title, slug, excerpt, body, mainImage, author ref, categories ref[], publishedAt, featured), author, category
- **Portfolio**: project (title, slug, description, coverImage, gallery, tags, url, githubUrl, featured), testimonial
- **Sitio empresa**: homepage (hero, features array, testimonials ref[], cta), servicePage (title, slug, description, features, pricing, faq)

## Referencias

- `references/sanity-setup.md` — Schema completo, queries avanzadas, Portable Text, live preview
- `references/cms-comparison.md` — Tabla detallada y decision matrix por tipo de proyecto
