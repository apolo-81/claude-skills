---
name: cms-integration
description: >
  Use when adding a CMS to a website, connecting a headless CMS to Next.js, or
  enabling non-technical users to edit website content. Trigger for: "CMS", "headless
  CMS", "Sanity", "Contentful", "Strapi", "content management", "editable content",
  "blog con CMS", "sitio administrable", "content editing", "rich text editor",
  "GROQ", "content API", "preview mode", "live preview", "quiero que el cliente
  pueda editar", "contenido dinámico", "página de blog", "portfolio administrable",
  "productos administrables".
---

# CMS Headless Integration — Next.js

## 1. Elegir el CMS correcto

### Decision Tree

```
¿El cliente necesita editar contenido sin conocimientos técnicos?
├── NO → Usa MDX (archivos Markdown en el repo). No necesitas CMS.
└── YES →
    ¿Necesitas self-hosted / control total / open source?
    ├── YES → Strapi o Directus
    └── NO →
        ¿Es un proyecto enterprise con equipo grande y múltiples idiomas?
        ├── YES → Contentful (pero caro)
        └── NO →
            ¿Necesitas schema flexible, real-time collab, live preview?
            └── YES → Sanity (recomendado para agencias/freelancers)
```

### Cuándo NO usar CMS headless
- Sitios simples donde el dev controla el contenido (usa MDX)
- Landing pages estáticas que raramente cambian
- Proyectos sin presupuesto para mantenimiento del CMS
- Cuando el cliente no va a editar contenido en los próximos 6 meses

### Comparativa rápida

| | Sanity | Contentful | Strapi | TinaCMS |
|---|---|---|---|---|
| Precio | Free tier generoso | Caro en escala | Open source | Free/paid |
| Self-hosted | No | No | Sí | No |
| DX | Excelente | Bueno | Bueno | Bueno |
| Live Preview | Nativo | Limitado | Manual | Nativo |
| Multilingual | Plugin | Nativo | Plugin | No |
| Schema | Código (flexible) | UI + código | UI + código | Git-based |

---

## 2. Sanity — Opción principal recomendada

### Setup inicial

```bash
# Crear proyecto Sanity (studio embebido en Next.js)
npm create sanity@latest -- --template clean --create-project "Mi Proyecto" --dataset production

# O en monorepo: studio separado
npx sanity@latest init
```

**Variables de entorno en `.env.local`:**
```env
NEXT_PUBLIC_SANITY_PROJECT_ID=xxxxxxxx
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=sk...  # Solo para draft/preview mode
```

**`/lib/sanity/client.ts`:**
```typescript
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: true, // false en preview mode
})

const builder = imageUrlBuilder(client)
export const urlFor = (source: SanityImageSource) => builder.image(source)
```

### Schema design

**`/sanity/schemaTypes/post.ts`:**
```typescript
import { defineType, defineField } from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Autor',
      type: 'reference',
      to: [{ type: 'author' }],
    }),
    defineField({
      name: 'mainImage',
      title: 'Imagen principal',
      type: 'image',
      options: { hotspot: true }, // Permite ajustar el punto focal para cropping
    }),
    defineField({
      name: 'categories',
      title: 'Categorías',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'category' } }],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Publicado el',
      type: 'datetime',
    }),
    defineField({
      name: 'excerpt',
      title: 'Extracto',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'body',
      title: 'Contenido',
      type: 'array',
      of: [
        { type: 'block' }, // Portable Text (rich text)
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'caption', type: 'string', title: 'Pie de foto' }),
            defineField({ name: 'alt', type: 'string', title: 'Texto alternativo' }),
          ],
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'title', author: 'author.name', media: 'mainImage' },
    prepare(selection) {
      const { author } = selection
      return { ...selection, subtitle: author ? `por ${author}` : '' }
    },
  },
})
```

### GROQ queries esenciales

```typescript
// /lib/sanity/queries.ts

// Lista de posts (con paginación)
export const postsQuery = `
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc) [$start...$end] {
    _id,
    title,
    slug,
    publishedAt,
    excerpt,
    mainImage,
    "author": author->{ name, image },
    "categories": categories[]->{ title, slug }
  }
`

// Post individual por slug
export const postBySlugQuery = `
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    publishedAt,
    body,
    mainImage,
    "author": author->{ name, image, bio },
    "categories": categories[]->{ title, slug }
  }
`

// Posts destacados (featured)
export const featuredPostsQuery = `
  *[_type == "post" && featured == true] | order(publishedAt desc)[0...3] {
    _id, title, slug, publishedAt, excerpt, mainImage,
    "author": author->{ name }
  }
`

// Total de posts (para paginación)
export const postCountQuery = `count(*[_type == "post" && defined(slug.current)])`

// Slugs para generateStaticParams
export const postSlugsQuery = `*[_type == "post" && defined(slug.current)].slug.current`
```

### Fetch en Next.js App Router

```typescript
// app/blog/page.tsx — Server Component
import { client } from '@/lib/sanity/client'
import { postsQuery, postCountQuery } from '@/lib/sanity/queries'

export const revalidate = 60 // ISR: revalidar cada 60 segundos

export default async function BlogPage() {
  const posts = await client.fetch(postsQuery, { start: 0, end: 10 })
  return <PostGrid posts={posts} />
}

// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const slugs = await client.fetch(postSlugsQuery)
  return slugs.map((slug: string) => ({ slug }))
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await client.fetch(postBySlugQuery, { slug: params.slug })
  if (!post) notFound()
  return <PostDetail post={post} />
}
```

### Portable Text — Renderizar rich text

```bash
npm install @portabletext/react
```

```typescript
// components/PortableTextRenderer.tsx
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import { urlFor } from '@/lib/sanity/client'
import Image from 'next/image'

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => (
      <div className="my-8 relative aspect-video">
        <Image
          src={urlFor(value).width(800).url()}
          alt={value.alt || ''}
          fill
          className="object-cover rounded-lg"
        />
        {value.caption && (
          <p className="text-center text-sm text-muted-foreground mt-2">{value.caption}</p>
        )}
      </div>
    ),
  },
  marks: {
    link: ({ children, value }) => (
      <a href={value.href} target="_blank" rel="noopener noreferrer" className="underline text-primary">
        {children}
      </a>
    ),
  },
  block: {
    h2: ({ children }) => <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xl font-semibold mt-6 mb-3">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary pl-4 italic my-4">{children}</blockquote>
    ),
  },
}

export function PortableTextRenderer({ value }: { value: any[] }) {
  return <PortableText value={value} components={components} />
}
```

### On-demand Revalidation con Webhooks

```typescript
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')

  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  const body = await req.json()
  const { _type } = body

  // Revalidar según el tipo de documento modificado
  if (_type === 'post') {
    revalidatePath('/blog')
    revalidateTag('posts')
  } else if (_type === 'page') {
    revalidatePath('/', 'layout')
  }

  return NextResponse.json({ revalidated: true, now: Date.now() })
}
```

En Sanity Studio: Settings → API → Webhooks → URL: `https://tu-sitio.com/api/revalidate?secret=TU_SECRET`

### Live Preview (Draft Mode)

```bash
npm install next-sanity
```

```typescript
// app/api/draft/route.ts
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')
  const slug = searchParams.get('slug')

  if (secret !== process.env.SANITY_PREVIEW_SECRET) {
    return new Response('Invalid token', { status: 401 })
  }

  draftMode().enable()
  redirect(slug ? `/blog/${slug}` : '/')
}
```

---

## 3. Contentful — Alternativa enterprise

```bash
npm install contentful @contentful/rich-text-react-renderer
```

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

// Fetch posts
export async function getPosts() {
  const entries = await client.getEntries({ content_type: 'blogPost', order: ['-sys.createdAt'] })
  return entries.items
}

export async function getPostBySlug(slug: string) {
  const entries = await client.getEntries({
    content_type: 'blogPost',
    'fields.slug': slug,
    limit: 1,
  })
  return entries.items[0] ?? null
}
```

Webhook Contentful → Next.js: igual que Sanity, apunta al API route de revalidación.

---

## 4. Strapi — Self-hosted

```bash
npx create-strapi-app@latest my-backend --quickstart
# Deploy en Railway: conecta el repo y agrega PostgreSQL addon
```

```typescript
// lib/strapi/client.ts
const STRAPI_URL = process.env.STRAPI_URL!
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN!

async function strapiQuery<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${STRAPI_URL}/api/${endpoint}`)
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`Strapi error: ${res.status}`)
  return res.json()
}

export async function getPosts() {
  return strapiQuery('posts?populate=*&sort=publishedAt:desc')
}
```

**Media con Cloudinary:** En Strapi Admin → Settings → Media Library → Cloudinary provider.

---

## 5. Imágenes desde CMS con next/image

```typescript
// Sanity
import { urlFor } from '@/lib/sanity/client'
import Image from 'next/image'

<Image
  src={urlFor(post.mainImage).width(800).height(450).url()}
  alt={post.mainImage.alt ?? post.title}
  width={800}
  height={450}
  placeholder="blur"
  blurDataURL={urlFor(post.mainImage).width(20).blur(10).url()}
  className="rounded-lg object-cover"
/>

// Contentful — el CDN permite transformaciones en la URL
<Image
  src={`https:${asset.fields.file.url}?w=800&h=450&fit=fill&f=face`}
  alt={asset.fields.description}
  width={800}
  height={450}
/>
```

Agregar dominios en `next.config.js`:
```js
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'cdn.sanity.io' },
    { protocol: 'https', hostname: 'images.ctfassets.net' }, // Contentful
  ],
}
```

---

## 6. Patrones de contenido comunes

### Blog
- `post`: title, slug, excerpt, body (rich text), mainImage, author (ref), categories (ref[]), publishedAt, featured
- `author`: name, image, bio, social links
- `category`: title, slug, description, color

### Portfolio
- `project`: title, slug, description, coverImage, gallery (image[]), tags (string[]), url, githubUrl, featured
- `testimonial`: quote, author, company, avatar, rating

### Sitio empresa (homepage editable)
- `homepage`: hero (title, subtitle, ctaText, ctaUrl, image), features (array of {icon, title, description}), testimonials (ref[]), cta (title, subtitle, buttonText)
- `servicePage`: title, slug, description, features, pricing, faq

---

## Referencias

Ver archivos en `references/`:
- `sanity-setup.md`: Schema completo de blog, queries avanzadas, live preview paso a paso
- `cms-comparison.md`: Tabla detallada y decisión matrix por tipo de proyecto
