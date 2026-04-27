# Sanity Setup — Schema completo, Queries y Next.js Integration

Setup completo de Sanity v3 con blog, live preview y on-demand revalidation.

## Instalación

```bash
npm install next-sanity @sanity/client @sanity/image-url @portabletext/react
npm install --save-dev @sanity/types
```

---

## 1. Schemas de Blog (Sanity v3, TypeScript)

### schemas/post.ts

```typescript
// sanity/schemaTypes/post.ts
import { defineType, defineField, defineArrayMember } from 'sanity'
import { DocumentTextIcon } from '@sanity/icons'

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: (r) => r.required().max(100).warning('Más de 100 caracteres puede truncarse en SEO'),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Extracto',
      type: 'text',
      rows: 3,
      description: 'Resumen breve (160 chars máximo para SEO)',
      validation: (r) => r.max(200),
    }),
    defineField({
      name: 'body',
      title: 'Contenido (Portable Text)',
      type: 'array',
      of: [
        defineArrayMember({ type: 'block' }),
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'caption', type: 'string', title: 'Pie de foto' }),
            defineField({ name: 'alt', type: 'string', title: 'Texto alternativo' }),
          ],
        }),
        defineArrayMember({
          type: 'object',
          name: 'callout',
          title: 'Callout / nota destacada',
          fields: [
            defineField({ name: 'text', type: 'text', title: 'Texto' }),
            defineField({
              name: 'type',
              type: 'string',
              options: { list: ['info', 'warning', 'success', 'error'] },
            }),
          ],
          preview: {
            select: { text: 'text', type: 'type' },
            prepare: ({ text, type }) => ({ title: `[${type ?? 'info'}] ${text}` }),
          },
        }),
      ],
    }),
    defineField({
      name: 'mainImage',
      title: 'Imagen principal',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', type: 'string', title: 'Texto alternativo' }),
      ],
    }),
    defineField({
      name: 'author',
      title: 'Autor',
      type: 'reference',
      to: [{ type: 'author' }],
    }),
    defineField({
      name: 'categories',
      title: 'Categorías',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: { type: 'category' } })],
      validation: (r) => r.max(5),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Fecha de publicación',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'featured',
      title: '¿Destacado?',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        defineField({
          name: 'title',
          title: 'SEO Title',
          type: 'string',
          description: 'Dejar vacío para usar el título del post',
          validation: (r) => r.max(60),
        }),
        defineField({
          name: 'description',
          title: 'SEO Description',
          type: 'text',
          rows: 2,
          description: 'Dejar vacío para usar el extracto',
          validation: (r) => r.max(160),
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
      publishedAt: 'publishedAt',
    },
    prepare({ title, author, media, publishedAt }) {
      const date = publishedAt
        ? new Date(publishedAt).toLocaleDateString('es', { dateStyle: 'medium' })
        : 'Sin fecha'
      return {
        title,
        subtitle: `${author ? `por ${author} · ` : ''}${date}`,
        media,
      }
    },
  },
})
```

### schemas/author.ts

```typescript
// sanity/schemaTypes/author.ts
import { defineType, defineField } from 'sanity'
import { UserIcon } from '@sanity/icons'

export const authorType = defineType({
  name: 'author',
  title: 'Autor',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
    }),
    defineField({
      name: 'image',
      title: 'Foto',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', type: 'string', title: 'Texto alternativo' }),
      ],
    }),
    defineField({
      name: 'bio',
      title: 'Biografía',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'role',
      title: 'Cargo',
      type: 'string',
    }),
    defineField({
      name: 'social',
      title: 'Redes sociales',
      type: 'object',
      fields: [
        defineField({ name: 'twitter', type: 'url', title: 'Twitter / X' }),
        defineField({ name: 'linkedin', type: 'url', title: 'LinkedIn' }),
        defineField({ name: 'github', type: 'url', title: 'GitHub' }),
      ],
    }),
  ],
  preview: {
    select: { title: 'name', media: 'image' },
  },
})
```

### schemas/category.ts

```typescript
// sanity/schemaTypes/category.ts
import { defineType, defineField } from 'sanity'
import { TagIcon } from '@sanity/icons'

export const categoryType = defineType({
  name: 'category',
  title: 'Categoría',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Nombre',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'description',
      title: 'Descripción',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'color',
      title: 'Color (hex)',
      type: 'string',
      description: 'Ej: #3b82f6',
      validation: (r) => r.regex(/^#[0-9a-fA-F]{6}$/).warning('Debe ser un color hex válido'),
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'description' },
  },
})
```

### sanity.config.ts

```typescript
// sanity.config.ts (raíz del proyecto)
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { postType } from './sanity/schemaTypes/post'
import { authorType } from './sanity/schemaTypes/author'
import { categoryType } from './sanity/schemaTypes/category'

export default defineConfig({
  name: 'mi-proyecto',
  title: 'Mi Proyecto CMS',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Contenido')
          .items([
            S.listItem()
              .title('Posts')
              .child(S.documentTypeList('post').title('Posts')),
            S.divider(),
            S.listItem()
              .title('Autores')
              .child(S.documentTypeList('author').title('Autores')),
            S.listItem()
              .title('Categorías')
              .child(S.documentTypeList('category').title('Categorías')),
          ]),
    }),
    visionTool(), // GROQ playground en el studio
  ],

  schema: {
    types: [postType, authorType, categoryType],
  },
})
```

---

## 2. GROQ Queries con TypeScript

### lib/sanity/queries.ts

```typescript
// lib/sanity/queries.ts
import { client } from './client'

// ---- Types ----

export interface SanityImage {
  _type: 'image'
  asset: { _ref: string; _type: 'reference' }
  hotspot?: { x: number; y: number }
  alt?: string
}

export interface Author {
  name: string
  image: SanityImage
  bio?: string
  role?: string
  slug?: { current: string }
}

export interface Category {
  title: string
  slug: { current: string }
  color?: string
}

export interface PostSummary {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  publishedAt?: string
  mainImage?: SanityImage
  author?: Pick<Author, 'name' | 'image'>
  categories?: Category[]
  featured?: boolean
}

export interface PostFull extends PostSummary {
  body: any[] // PortableTextBlock[]
  seo?: { title?: string; description?: string }
}

// ---- Queries ----

// Lista de posts con paginación
export const postsQuery = `
  *[_type == "post" && defined(slug.current) && defined(publishedAt)]
  | order(publishedAt desc)
  [$start...$end] {
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    featured,
    mainImage { asset, hotspot, alt },
    "author": author->{ name, "image": image { asset, alt } },
    "categories": categories[]->{ title, "slug": slug, color }
  }
`

export const postCountQuery = `
  count(*[_type == "post" && defined(slug.current) && defined(publishedAt)])
`

// Post individual por slug (con body completo)
export const postBySlugQuery = `
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    body,
    mainImage { asset, hotspot, alt },
    featured,
    "author": author->{ name, slug, image { asset, alt }, bio, role },
    "categories": categories[]->{ title, slug, color },
    "seo": seo { title, description }
  }
`

// Posts por categoría
export const postsByCategoryQuery = `
  *[_type == "post"
    && defined(slug.current)
    && defined(publishedAt)
    && $categorySlug in categories[]->slug.current
  ]
  | order(publishedAt desc)
  [$start...$end] {
    _id, title, slug, excerpt, publishedAt, mainImage { asset, alt },
    "author": author->{ name },
    "categories": categories[]->{ title, slug, color }
  }
`

// Featured posts
export const featuredPostsQuery = `
  *[_type == "post" && featured == true && defined(slug.current)]
  | order(publishedAt desc)
  [0...6] {
    _id, title, slug, excerpt, publishedAt,
    mainImage { asset, hotspot, alt },
    "author": author->{ name, image { asset } }
  }
`

// Búsqueda por texto
export const searchPostsQuery = `
  *[_type == "post"
    && defined(slug.current)
    && (title match $query || excerpt match $query)
  ]
  | order(publishedAt desc)
  [0...10] {
    _id, title, slug, excerpt, publishedAt,
    mainImage { asset, alt }
  }
`

// Slugs para generateStaticParams
export const postSlugsQuery = `
  *[_type == "post" && defined(slug.current)].slug.current
`

// Sitemap
export const sitemapQuery = `
  *[_type == "post" && defined(slug.current) && defined(publishedAt)] {
    "slug": slug.current,
    publishedAt,
    "_updatedAt": _updatedAt
  }
`

// ---- Typed fetch helpers ----

export async function getPosts(
  page = 0,
  pageSize = 10,
): Promise<PostSummary[]> {
  return client.fetch<PostSummary[]>(postsQuery, {
    start: page * pageSize,
    end: (page + 1) * pageSize,
  })
}

export async function getPostCount(): Promise<number> {
  return client.fetch<number>(postCountQuery)
}

export async function getPostBySlug(slug: string): Promise<PostFull | null> {
  return client.fetch<PostFull | null>(postBySlugQuery, { slug })
}

export async function getPostsByCategory(
  categorySlug: string,
  page = 0,
  pageSize = 10,
): Promise<PostSummary[]> {
  return client.fetch<PostSummary[]>(postsByCategoryQuery, {
    categorySlug,
    start: page * pageSize,
    end: (page + 1) * pageSize,
  })
}

export async function getFeaturedPosts(): Promise<PostSummary[]> {
  return client.fetch<PostSummary[]>(featuredPostsQuery)
}

export async function searchPosts(query: string): Promise<PostSummary[]> {
  return client.fetch<PostSummary[]>(searchPostsQuery, { query: `${query}*` })
}

export async function getPostSlugs(): Promise<string[]> {
  return client.fetch<string[]>(postSlugsQuery)
}

export async function getSitemapPosts(): Promise<
  { slug: string; publishedAt: string; _updatedAt: string }[]
> {
  return client.fetch(sitemapQuery)
}
```

---

## 3. Next.js Integration Completa

### lib/sanity/client.ts

```typescript
// lib/sanity/client.ts
import { createClient, type QueryParams } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { draftMode } from 'next/headers'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!
const apiVersion = '2024-01-01'

// Cliente público (published, CDN)
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
})

// Cliente de preview (drafts, sin CDN)
export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: 'previewDrafts',
  token: process.env.SANITY_API_READ_TOKEN,
})

// Usar preview client si draft mode está activo (Server Component)
export async function getSanityClient() {
  const { isEnabled } = await draftMode()
  return isEnabled ? previewClient : client
}

// Image URL builder
const builder = imageUrlBuilder(client)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}
```

### lib/sanity/image.ts

```typescript
// lib/sanity/image.ts
import { urlFor } from './client'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

export interface SanityImageProps {
  width?: number
  height?: number
  quality?: number
  blur?: boolean
}

export function getSanityImageUrl(
  source: SanityImageSource,
  { width = 800, height, quality = 80 }: SanityImageProps = {},
): string {
  let builder = urlFor(source).width(width).quality(quality).auto('format')
  if (height) builder = builder.height(height)
  return builder.url()
}

export function getSanityBlurDataUrl(source: SanityImageSource): string {
  return urlFor(source).width(20).quality(30).blur(10).url()
}

// Uso en componentes:
// <Image
//   src={getSanityImageUrl(post.mainImage, { width: 1200, height: 630 })}
//   alt={post.mainImage.alt ?? post.title}
//   width={1200}
//   height={630}
//   placeholder="blur"
//   blurDataURL={getSanityBlurDataUrl(post.mainImage)}
// />
```

### components/PortableText.tsx

```typescript
// components/PortableText.tsx
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import Image from 'next/image'
import Link from 'next/link'
import { getSanityImageUrl } from '@/lib/sanity/image'
import { cn } from '@/lib/utils'

const components: PortableTextComponents = {
  types: {
    // Imagen dentro del contenido
    image: ({ value }) => {
      if (!value?.asset) return null
      return (
        <figure className="my-8">
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <Image
              src={getSanityImageUrl(value, { width: 900 })}
              alt={value.alt || ''}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
          {value.caption && (
            <figcaption className="mt-2 text-center text-sm text-muted-foreground">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
    // Callout / nota destacada
    callout: ({ value }) => {
      const styles = {
        info:    'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-100',
        warning: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100',
        error:   'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/30 dark:text-red-100',
      }
      return (
        <div className={cn('my-6 rounded-lg border p-4 text-sm', styles[value.type as keyof typeof styles] ?? styles.info)}>
          {value.text}
        </div>
      )
    },
  },
  marks: {
    link: ({ children, value }) => {
      const isExternal = value.href?.startsWith('http')
      return isExternal ? (
        <a
          href={value.href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-primary underline-offset-4 hover:text-primary"
        >
          {children}
        </a>
      ) : (
        <Link
          href={value.href}
          className="underline decoration-primary underline-offset-4 hover:text-primary"
        >
          {children}
        </Link>
      )
    },
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">{children}</code>
    ),
  },
  block: {
    h2: ({ children }) => (
      <h2 className="mt-10 mb-4 scroll-mt-20 text-2xl font-bold tracking-tight">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 mb-3 scroll-mt-20 text-xl font-semibold">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="mt-6 mb-2 text-lg font-semibold">{children}</h4>
    ),
    normal: ({ children }) => (
      <p className="leading-7 [&:not(:first-child)]:mt-4">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-4 border-primary pl-6 italic text-muted-foreground">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="my-4 ml-6 list-disc [&>li]:mt-2">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="my-4 ml-6 list-decimal [&>li]:mt-2">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="text-sm leading-7">{children}</li>,
    number: ({ children }) => <li className="text-sm leading-7">{children}</li>,
  },
}

export function PortableTextRenderer({ value }: { value: any[] }) {
  if (!value?.length) return null
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <PortableText value={value} components={components} />
    </div>
  )
}
```

### app/blog/page.tsx

```typescript
// app/blog/page.tsx
import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getPosts, getPostCount } from '@/lib/sanity/queries'
import { getSanityImageUrl } from '@/lib/sanity/image'
import type { PostSummary } from '@/lib/sanity/queries'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const revalidate = 60 // ISR: revalidar cada 60s

const PAGE_SIZE = 9

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(0, parseInt(pageParam ?? '0', 10) - 1)

  const [posts, total] = await Promise.all([
    getPosts(page, PAGE_SIZE),
    getPostCount(),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold">Blog</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          {total} artículos publicados
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <Link
              key={i}
              href={`/blog?page=${i + 1}`}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                page === i
                  ? 'bg-primary text-primary-foreground'
                  : 'border hover:bg-muted'
              }`}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}

function PostCard({ post }: { post: PostSummary }) {
  return (
    <Link href={`/blog/${post.slug.current}`} className="group flex flex-col">
      {post.mainImage && (
        <div className="relative aspect-video overflow-hidden rounded-xl">
          <Image
            src={getSanityImageUrl(post.mainImage, { width: 600, height: 340 })}
            alt={post.mainImage.alt ?? post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="mt-4 flex-1">
        {post.categories?.[0] && (
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">
            {post.categories[0].title}
          </span>
        )}
        <h2 className="mt-1 text-lg font-bold leading-tight group-hover:text-primary">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
        )}
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          {post.author?.name && <span>{post.author.name}</span>}
          {post.author?.name && post.publishedAt && <span>·</span>}
          {post.publishedAt && (
            <span>
              {format(new Date(post.publishedAt), "d 'de' MMMM yyyy", { locale: es })}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
```

### app/blog/[slug]/page.tsx

```typescript
// app/blog/[slug]/page.tsx
import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getPostBySlug, getPostSlugs } from '@/lib/sanity/queries'
import { getSanityImageUrl, getSanityBlurDataUrl } from '@/lib/sanity/image'
import { PortableTextRenderer } from '@/components/PortableText'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const revalidate = 60

// Generar páginas estáticas para todos los posts
export async function generateStaticParams() {
  const slugs = await getPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

// Metadata dinámica para SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}

  const seoTitle = post.seo?.title ?? post.title
  const seoDescription = post.seo?.description ?? post.excerpt ?? ''
  const imageUrl = post.mainImage
    ? getSanityImageUrl(post.mainImage, { width: 1200, height: 630 })
    : undefined

  return {
    title: seoTitle,
    description: seoDescription,
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      type: 'article',
      publishedTime: post.publishedAt,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      images: imageUrl ? [imageUrl] : [],
    },
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) notFound()

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      {/* Header */}
      <header className="mb-8">
        {post.categories?.[0] && (
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">
            {post.categories[0].title}
          </span>
        )}
        <h1 className="mt-2 text-4xl font-bold leading-tight lg:text-5xl">{post.title}</h1>
        {post.excerpt && (
          <p className="mt-4 text-xl text-muted-foreground">{post.excerpt}</p>
        )}

        {/* Meta */}
        <div className="mt-6 flex items-center gap-4">
          {post.author?.image && (
            <Image
              src={getSanityImageUrl(post.author.image, { width: 80, height: 80 })}
              alt={post.author.name}
              width={40}
              height={40}
              className="rounded-full"
            />
          )}
          <div>
            {post.author?.name && (
              <p className="text-sm font-medium">{post.author.name}</p>
            )}
            {post.publishedAt && (
              <p className="text-sm text-muted-foreground">
                {format(new Date(post.publishedAt), "d 'de' MMMM yyyy", { locale: es })}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Imagen principal */}
      {post.mainImage && (
        <div className="relative mb-10 aspect-video overflow-hidden rounded-2xl">
          <Image
            src={getSanityImageUrl(post.mainImage, { width: 1200, height: 675 })}
            alt={post.mainImage.alt ?? post.title}
            fill
            priority
            placeholder="blur"
            blurDataURL={getSanityBlurDataUrl(post.mainImage)}
            className="object-cover"
          />
        </div>
      )}

      {/* Contenido */}
      {post.body && <PortableTextRenderer value={post.body} />}
    </article>
  )
}
```

### app/api/revalidate/route.ts

```typescript
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

// Configurar en Sanity Studio: Settings → API → Webhooks
// URL: https://tu-dominio.com/api/revalidate?secret=TU_SECRET
// HTTP method: POST
// Trigger on: Create, Update, Delete

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')

  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  let body: { _type?: string; slug?: { current?: string } } = {}

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'Invalid body' }, { status: 400 })
  }

  const { _type, slug } = body

  switch (_type) {
    case 'post':
      revalidatePath('/blog')
      if (slug?.current) {
        revalidatePath(`/blog/${slug.current}`)
      }
      revalidateTag('posts')
      break
    case 'author':
      revalidatePath('/blog')
      revalidateTag('posts')
      break
    case 'category':
      revalidatePath('/blog')
      revalidateTag('posts')
      break
    default:
      revalidatePath('/', 'layout')
  }

  return NextResponse.json({
    revalidated: true,
    now: Date.now(),
    type: _type,
  })
}
```

---

## 4. Live Preview (Draft Mode)

### app/api/draft/route.ts

```typescript
// app/api/draft/route.ts
// URL para activar preview desde Sanity Studio:
// https://tu-dominio.com/api/draft?secret=TU_SECRET&slug=/blog/mi-post

import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')
  const slug = searchParams.get('slug') ?? '/'

  if (secret !== process.env.SANITY_PREVIEW_SECRET) {
    return new Response('Token inválido', { status: 401 })
  }

  // Activar draft mode (cookie de sesión)
  const draft = await draftMode()
  draft.enable()

  // Redirigir a la página solicitada
  redirect(slug)
}
```

### app/api/disable-draft/route.ts

```typescript
// app/api/disable-draft/route.ts
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const returnTo = searchParams.get('returnTo') ?? '/'

  const draft = await draftMode()
  draft.disable()

  redirect(returnTo)
}
```

### components/PreviewBanner.tsx

```typescript
// components/PreviewBanner.tsx
// Usar en layouts que pueden estar en preview mode.
// Ejemplo: app/blog/layout.tsx → <PreviewBanner slug={`/blog/${slug}`} />

import { draftMode } from 'next/headers'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

interface PreviewBannerProps {
  slug?: string
}

export async function PreviewBanner({ slug = '/' }: PreviewBannerProps) {
  const { isEnabled } = await draftMode()
  if (!isEnabled) return null

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between bg-amber-400 px-4 py-2 text-sm font-medium text-amber-900">
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4" />
        <span>
          Modo Preview activo — estás viendo borradores no publicados
        </span>
      </div>
      <Link
        href={`/api/disable-draft?returnTo=${encodeURIComponent(slug)}`}
        className="flex items-center gap-1.5 rounded-md bg-amber-900/10 px-3 py-1 text-xs hover:bg-amber-900/20"
      >
        <EyeOff className="h-3.5 w-3.5" />
        Salir del preview
      </Link>
    </div>
  )
}
```

---

## Variables de Entorno

```env
# .env.local
NEXT_PUBLIC_SANITY_PROJECT_ID=xxxxxxxx
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=sk...            # Solo para draft mode (Read token en Sanity)
SANITY_REVALIDATE_SECRET=tu-secret-random
SANITY_PREVIEW_SECRET=otro-secret-random

# next.config.js → images.remotePatterns
# { protocol: 'https', hostname: 'cdn.sanity.io' }
```
