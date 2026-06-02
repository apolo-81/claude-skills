# Next.js App Router (con foco Next 16)

Guía para App Router: Server Components, Server Actions, caché, middleware/proxy, rendering. Si el proyecto usa Pages Router, migrar a App Router.

## Breaking changes Next.js 16 (los que más muerden)

| Antes | Ahora (Next 16) |
|-------|-----------------|
| `cookies()` síncrono | `const c = await cookies()` — **async** |
| `headers()` síncrono | `const h = await headers()` — **async** |
| `params` directo | `const { slug } = await params` — **async** |
| `searchParams` directo | `const { q } = await searchParams` — **async** |
| `middleware.ts` / `export function middleware` | `proxy.ts` / `export function proxy` (renombrar función y archivo) |
| `revalidateTag(tag)` | `revalidateTag(tag, "max")` — segundo arg con perfil cacheLife |
| `cacheHandler:` (singular) | `cacheHandlers:` (plural, handler por tipo) |
| `useRef()` | `useRef(null)` — React 19 exige valor inicial |
| `next export` (CLI) | `output: "export"` en `next.config.js` |

> Los `cookies/headers/params/searchParams` async **no** aplican en componentes `"use client"`.

## Migración Pages Router → App Router

| Pages Router (removido/legacy) | App Router |
|-------------------------------|------------|
| `getServerSideProps` | Server Component async + fetch directo |
| `getStaticProps` | `generateStaticParams()` + Server Component |
| `next/router` (`useRouter`) | `next/navigation` (`useRouter`, `usePathname`, `useSearchParams`) |
| `next/head` | `export const metadata` o `generateMetadata()` |
| `pages/api/*.ts` (`NextApiRequest/Response`, `export default handler`) | Route handlers: `export async function GET/POST(...)` con Web Request/Response |

## Reglas de arquitectura serverless

- **`"use client"`** es obligatorio arriba del archivo para usar `useState`/`useEffect` y demás hooks de React.
- **Cachés en memoria del proceso** (`lru-cache`, `node-cache`, `Map` global) **se pierden** entre invocaciones serverless → usar Vercel Runtime Cache o un store externo (Redis/Upstash).
- **No montar Express/Fastify/Koa** dentro de Next → usar route handlers o `proxy.ts` para interceptar requests.
- **ORMs pesados** (TypeORM, Sequelize) penalizan cold start → preferir Drizzle/Prisma o `@neondatabase/serverless`.
- **Fonts**: `next/font` (self-hosted, zero-CLS) en vez de `<link>` a Google Fonts.
- **Auth**: el plugin oficial empuja proveedores manejados (Clerk/Descope/Auth0). Tu stack usa NextAuth v5 / JWT custom — válido; mirá tu skill `auth-patterns`.

## Caché y revalidación (mental model)

- **Static por defecto**: rutas sin datos dinámicos se prerenderizan en build.
- **ISR**: `export const revalidate = 60` (segundos) o `revalidateTag(tag, "max")` / `revalidatePath()` on-demand desde Server Actions o route handlers.
- **Dynamic**: usar `cookies()`/`headers()`/`searchParams` (o `export const dynamic = "force-dynamic"`) opta la ruta a render por request.
- Para optimizar Core Web Vitals, bundle, Suspense y streaming → tu skill `performance-next`.
