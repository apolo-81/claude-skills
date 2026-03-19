# Bundle Optimization — Next.js 15 App Router

Análisis y reducción sistemática del bundle JavaScript.

---

## Setup: `@next/bundle-analyzer`

```bash
npm install --save-dev @next/bundle-analyzer
```

```typescript
// next.config.ts
import type { NextConfig } from 'next'
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: true, // Abre el browser automáticamente
})

const nextConfig: NextConfig = {
  // tu config...
}

export default withBundleAnalyzer(nextConfig)
```

```bash
# Analizar
ANALYZE=true npm run build
```

Genera dos archivos HTML interactivos:
- `client.html` — bundle del cliente (lo que descarga el usuario)
- `server.html` — bundle del servidor (solo para diagnóstico)

**El más importante: `client.html`.**

---

## Cómo leer el treemap

El treemap muestra rectángulos donde el área = tamaño del módulo.

**Qué buscar:**

| Señal | Causa probable | Solución |
|---|---|---|
| Rectángulo gigante de `node_modules` | Librería pesada importada en client | Dynamic import o mover a Server Component |
| El mismo módulo aparece en múltiples chunks | Deduplicación fallida o versiones duplicadas | Ver sección "vendor duplicados" |
| `moment.js` (>200KB) | No se usa tree-shaking en moment | Migrar a `dayjs` (2KB) |
| `lodash` (70KB+) | Import de todo el objeto | Migrar a `lodash-es` con named imports |
| Páginas muy grandes | Barrel files o falta de code splitting | Ver sección "barrel files" |

**Pestañas del analyzer:**
- **Stat**: tamaño antes de minificar.
- **Parsed**: tamaño minificado.
- **Gzipped**: tamaño final que descarga el usuario. **Esta es la métrica real.**

---

## Dynamic Imports

### Componentes pesados en el cliente

```typescript
import dynamic from 'next/dynamic'

// Patrón básico
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded" />,
  ssr: false, // Editor de texto suele necesitar window
})

// Con named export
const LineChart = dynamic(
  () => import('recharts').then((mod) => mod.LineChart),
  { ssr: false }
)

// Carga condicional (modal, drawer, panel)
'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'

const AnalyticsModal = dynamic(() => import('@/components/AnalyticsModal'))

export function DashboardHeader() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button onClick={() => setShowModal(true)}>Ver analytics</button>
      {showModal && <AnalyticsModal onClose={() => setShowModal(false)} />}
    </>
  )
}
```

### Librerías pesadas — reemplazos recomendados

```typescript
// ANTES: moment.js (231KB gzipped)
import moment from 'moment'
const formatted = moment(date).format('DD/MM/YYYY')

// DESPUES: dayjs (2.9KB gzipped)
import dayjs from 'dayjs'
import 'dayjs/locale/es'
dayjs.locale('es')
const formatted = dayjs(date).format('DD/MM/YYYY')

// ---

// ANTES: lodash (70KB)
import _ from 'lodash'
const unique = _.uniqBy(items, 'id')

// DESPUES: lodash-es con named import (tree-shakeable)
import { uniqBy } from 'lodash-es'
const unique = uniqBy(items, 'id')

// O mejor aún: implementación nativa
const unique = [...new Map(items.map(item => [item.id, item])).values()]

// ---

// ANTES: date-fns importando todo
import { format, parseISO, addDays } from 'date-fns'
// Esto ya es tree-shakeable, pero asegúrate de no importar el índice:
import * as dateFns from 'date-fns' // MAL — importa todo
```

---

## El problema de los Barrel Files

Un barrel file es un `index.ts` que re-exporta todo desde una carpeta:

```typescript
// components/index.ts — BARREL FILE PROBLEMÁTICO
export { Button } from './Button'
export { Input } from './Input'
export { Modal } from './Modal'
export { DataTable } from './DataTable'       // 50KB
export { RichEditor } from './RichEditor'     // 200KB
export { PDFViewer } from './PDFViewer'       // 400KB
```

**El problema:**

```typescript
// Al importar solo Button, webpack/turbopack puede no tree-shakear correctamente
// y terminar incluyendo DataTable, RichEditor, PDFViewer en el bundle
import { Button } from '@/components'
```

**Solución 1: import directo (más seguro)**

```typescript
// BIEN: import directo, zero ambigüedad
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
```

**Solución 2: `optimizePackageImports` en next.config (Next.js 13.5+)**

```typescript
// next.config.ts — Next.js optimiza los barrel files de estas librerías
const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      '@/components',       // Tu propio barrel file
      'lucide-react',       // 1000+ iconos — crítico optimizar
      '@radix-ui/react-icons',
      'framer-motion',
    ],
  },
}
```

**Solución 3: `modularizeImports` para Material UI / Ant Design**

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  modularizeImports: {
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
    'antd': {
      transform: 'antd/lib/{{kebabCase member}}',
    },
  },
}
```

---

## Server Components — Código que NO llega al cliente

La optimización más impactante en App Router: mover lógica al servidor.

```typescript
// Este componente es un Server Component (por defecto en App Router)
// Todo el código de fetch, formateo y lógica queda en el servidor
// El cliente solo recibe el HTML renderizado

// app/blog/page.tsx — Server Component
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'  // Esta función NO va al bundle del cliente

export default async function BlogPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, slug, published_at')
    .eq('status', 'published')

  return (
    <ul>
      {posts?.map(post => (
        <li key={post.id}>
          <a href={`/blog/${post.slug}`}>{post.title}</a>
          <time>{formatDate(post.published_at)}</time>
        </li>
      ))}
    </ul>
  )
}
```

**Regla:** solo añadir `'use client'` cuando el componente necesite:
- Event handlers (`onClick`, `onChange`, `onSubmit`).
- Hooks de estado (`useState`, `useReducer`).
- Hooks de efectos (`useEffect`, `useLayoutEffect`).
- APIs del browser (`window`, `document`, `localStorage`).
- Context providers que usen los anteriores.

**Patrón correcto — separar lógica client del componente padre server:**

```typescript
// app/products/page.tsx — Server Component (fetch de datos)
import { ProductGrid } from '@/components/ProductGrid'
import { AddToCartButton } from '@/components/AddToCartButton' // 'use client'

export default async function ProductsPage() {
  const products = await getProducts() // Queda en el servidor

  return (
    <ProductGrid>
      {products.map(product => (
        <div key={product.id}>
          <h2>{product.name}</h2>
          <p>{product.price}</p>
          {/* Solo el botón interactivo es client */}
          <AddToCartButton productId={product.id} />
        </div>
      ))}
    </ProductGrid>
  )
}
```

---

## Tree-shaking efectivo

Tree-shaking elimina exports que no se usan. Para que funcione correctamente:

**Named exports vs default exports:**

```typescript
// Named exports — tree-shakeable
export function formatDate(date: Date): string { ... }
export function formatCurrency(amount: number): string { ... }

// Default export — NO tree-shakeable cuando se importa el módulo completo
export default {
  formatDate,
  formatCurrency,
}

// BIEN — import solo lo necesario
import { formatDate } from '@/lib/utils'

// MAL — import de todo el objeto default
import utils from '@/lib/utils'
utils.formatDate(...)
```

**`sideEffects` en package.json para librerías propias:**

```json
// package.json de tu librería de componentes (si usas monorepo)
{
  "sideEffects": false
}
// O listar solo los archivos CON side effects (CSS, polyfills):
{
  "sideEffects": ["*.css", "*.scss", "./src/polyfills.ts"]
}
```

---

## `source-map-explorer` — Analizar dependencias

```bash
npm install --save-dev source-map-explorer

# Generar source maps en producción (temporalmente)
# next.config.ts: productionBrowserSourceMaps: true

GENERATE_SOURCEMAP=true npm run build

# Analizar un chunk específico
npx source-map-explorer .next/static/chunks/pages/_app-*.js

# Ver de dónde viene una dependencia específica
npx source-map-explorer .next/static/chunks/*.js --only-mapped
```

---

## Checklist de reducción de bundle

```
[ ] @next/bundle-analyzer instalado y analizado
[ ] No hay moment.js → reemplazado por dayjs
[ ] lodash importado como lodash-es con named imports
[ ] lucide-react en optimizePackageImports
[ ] No hay barrel file imports de módulos pesados
[ ] Componentes heavy (editor, chart, PDF) con dynamic import
[ ] Librerías de terceros pesadas movidas a Server Components donde sea posible
[ ] 'use client' solo donde es estrictamente necesario
[ ] Bundle del cliente <200KB gzipped en la ruta principal
```
