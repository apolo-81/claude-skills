# React Performance — Patrones con App Router

Patrones de rendimiento React para Next.js 15 App Router + TypeScript.

**Principio fundamental:** medir siempre antes de optimizar. Cada una de estas APIs tiene un costo propio. Aplicarlas sin datos del profiler es optimización prematura.

---

## Herramientas de medición

### React DevTools Profiler

1. Instalar extensión React DevTools en Chrome/Firefox.
2. Abrir DevTools → pestaña "Profiler".
3. Click en "Record" → interactuar con la UI → "Stop".
4. Inspeccionar el flamegraph: barras anchas = componentes que tardan en renderizar.
5. Click en un componente → ver "Why did this render?" (requiere activar en Settings).

### `useRenderCount` — hook de diagnóstico (solo desarrollo)

```typescript
// hooks/useRenderCount.ts — solo para debugging
import { useRef, useEffect } from 'react'

export function useRenderCount(componentName: string) {
  const count = useRef(0)
  count.current++

  if (process.env.NODE_ENV === 'development') {
    console.log(`[${componentName}] render #${count.current}`)
  }
}

// Uso temporal para diagnóstico
function ProductCard({ product }: { product: Product }) {
  useRenderCount('ProductCard') // Eliminar después del diagnóstico
  // ...
}
```

---

## `React.memo`

Evita re-renders de un componente cuando sus props no cambian.

### Cuándo SÍ usar

```typescript
// CASO IDEAL: componente costoso en lista larga donde el padre re-renderiza frecuentemente
// pero las props del item individual no cambian

interface ProductCardProps {
  product: Product
  onAddToCart: (id: string) => void
}

const ProductCard = React.memo(function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  return (
    <div className="border rounded-lg p-4">
      <Image src={product.image} alt={product.name} width={300} height={200} />
      <h2>{product.name}</h2>
      <p>{product.price}</p>
      <button onClick={() => onAddToCart(product.id)}>Añadir</button>
    </div>
  )
})

// El padre re-renderiza cuando cambia el carrito, pero los ProductCards
// solo re-renderizan cuando cambia su product específico
export function ProductGrid({ products }: { products: Product[] }) {
  const [cart, setCart] = useState<string[]>([])

  // IMPORTANTE: sin useCallback, onAddToCart es una nueva función en cada render
  // lo que hace que React.memo sea inútil
  const handleAddToCart = useCallback((id: string) => {
    setCart(prev => [...prev, id])
  }, [])

  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={handleAddToCart}
        />
      ))}
    </div>
  )
}
```

### Cuándo NO usar

```typescript
// MAL: componente simple que siempre re-renderiza de todas formas
const Title = React.memo(function Title({ text }: { text: string }) {
  return <h1>{text}</h1>
})
// El costo de la comparación supera el beneficio

// MAL: componente cuyas props siempre cambian
const Timestamp = React.memo(function Timestamp({ date }: { date: Date }) {
  return <time>{date.toLocaleString()}</time>
})
// Si date es new Date() en cada render del padre, memo nunca evita nada

// MAL: comparación superficial no funciona con objetos complejos mutados
const Chart = React.memo(function Chart({ config }: { config: ChartConfig }) {
  // Si config es el mismo objeto pero mutado, memo no detecta el cambio
})
```

### Comparación custom con segundo argumento

```typescript
const ExpensiveComponent = React.memo(
  function ExpensiveComponent({ user, settings }: Props) {
    // ...
  },
  (prevProps, nextProps) => {
    // Retorna true = son iguales = NO re-renderizar
    // Retorna false = son diferentes = SÍ re-renderizar
    return (
      prevProps.user.id === nextProps.user.id &&
      prevProps.settings.theme === nextProps.settings.theme
    )
  }
)
```

---

## `useMemo`

Memoriza el resultado de un cálculo costoso. Se recalcula solo cuando cambian las dependencias.

### Cuándo SÍ usar (cálculo >10ms o array/objeto usado como prop de memo)

```typescript
'use client'

import { useMemo, useState } from 'react'

interface Transaction {
  id: string
  amount: number
  category: string
  date: string
}

export function TransactionAnalytics({ transactions }: { transactions: Transaction[] }) {
  const [filter, setFilter] = useState<string>('all')

  // CASO 1: cálculo costoso sobre array grande
  const analytics = useMemo(() => {
    // Este cálculo puede tardar varios ms con miles de transacciones
    const filtered = filter === 'all'
      ? transactions
      : transactions.filter(t => t.category === filter)

    return {
      total: filtered.reduce((sum, t) => sum + t.amount, 0),
      byCategory: filtered.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      }, {} as Record<string, number>),
      average: filtered.length > 0
        ? filtered.reduce((sum, t) => sum + t.amount, 0) / filtered.length
        : 0,
    }
  }, [transactions, filter]) // Solo recalcula cuando cambia transactions o filter

  // CASO 2: objeto pasado a componente memoizado como prop
  const chartData = useMemo(() => ({
    labels: Object.keys(analytics.byCategory),
    values: Object.values(analytics.byCategory),
  }), [analytics.byCategory])

  return (
    <div>
      <select value={filter} onChange={e => setFilter(e.target.value)}>
        <option value="all">Todos</option>
        <option value="food">Comida</option>
        <option value="transport">Transporte</option>
      </select>
      <p>Total: {analytics.total}</p>
      <MemoizedChart data={chartData} /> {/* chartData estable → no re-renderiza */}
    </div>
  )
}
```

### Cuándo NO usar

```typescript
// MAL: cálculo trivial — el overhead de useMemo > el cálculo
const fullName = useMemo(() => `${firstName} ${lastName}`, [firstName, lastName])
// BIEN:
const fullName = `${firstName} ${lastName}`

// MAL: objeto inline que no se pasa a componente memo — no hay beneficio
const style = useMemo(() => ({ color: 'red', fontSize: 16 }), [])
// BIEN: mover fuera del componente si es constante
const STYLE = { color: 'red', fontSize: 16 } // Constante de módulo

// MAL: dependencias que siempre cambian — useMemo nunca puede cachear
const result = useMemo(() => expensiveCalc(data), [new Date()]) // date siempre nueva
```

---

## `useCallback`

Memoriza una función. Necesario principalmente para funciones pasadas a componentes `React.memo`.

```typescript
'use client'

import { useCallback, useState, memo } from 'react'

// CASO CORRECTO: función pasada a componente memo
// Sin useCallback, ChildComponent se re-renderiza en cada render del padre
const ChildComponent = memo(function ChildComponent({
  onAction,
}: {
  onAction: (value: string) => void
}) {
  return <button onClick={() => onAction('hello')}>Acción</button>
})

export function ParentComponent() {
  const [count, setCount] = useState(0)
  const [data, setData] = useState<string[]>([])

  // Sin useCallback: nueva función en cada render → ChildComponent siempre re-renderiza
  // Con useCallback: misma función mientras las deps no cambien
  const handleAction = useCallback((value: string) => {
    setData(prev => [...prev, value])
  }, []) // Sin deps externas → función estable para siempre

  const handleActionWithDep = useCallback((value: string) => {
    // Si necesitas una dep externa, inclúyela
    console.log(`Count: ${count}, value: ${value}`)
    setData(prev => [...prev, value])
  }, [count]) // Se recrea cuando count cambia

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
      <ChildComponent onAction={handleAction} />
    </div>
  )
}
```

**La mayoría de las veces `useCallback` no es necesario:**

```typescript
// Si el componente hijo NO es memo, useCallback no aporta nada
function SimpleChild({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick}>Click</button>
}

// Este useCallback es inútil porque SimpleChild no es memo
const handleClick = useCallback(() => {
  doSomething()
}, [])
```

---

## `useTransition` y `startTransition`

Marca updates de estado como "no urgentes", permitiendo que React priorice renders más importantes (como mantener el input responsive).

```typescript
'use client'

import { useTransition, useState, useDeferredValue } from 'react'

// CASO 1: búsqueda/filtro en tiempo real
export function LiveSearch({ items }: { items: SearchItem[] }) {
  const [query, setQuery] = useState('')
  const [filtered, setFiltered] = useState(items)
  const [isPending, startTransition] = useTransition()

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setQuery(value) // Urgente: input debe responder inmediatamente

    startTransition(() => {
      // No urgente: puede esperar si hay trabajo más prioritario
      const results = items.filter(item =>
        item.title.toLowerCase().includes(value.toLowerCase())
      )
      setFiltered(results)
    })
  }

  return (
    <div>
      <input
        value={query}
        onChange={handleSearch}
        placeholder="Buscar..."
        className="border px-3 py-2 rounded"
      />
      {isPending && (
        <span className="text-sm text-gray-500">Filtrando...</span>
      )}
      <ul className={isPending ? 'opacity-50' : ''}>
        {filtered.map(item => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </div>
  )
}

// CASO 2: navegación entre tabs con contenido costoso
export function TabPanel() {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'settings'>('overview')
  const [isPending, startTransition] = useTransition()

  function switchTab(tab: typeof activeTab) {
    startTransition(() => {
      setActiveTab(tab)
    })
  }

  return (
    <div>
      <nav className="flex gap-2">
        {(['overview', 'analytics', 'settings'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => switchTab(tab)}
            className={activeTab === tab ? 'font-bold' : ''}
            disabled={isPending}
          >
            {tab}
          </button>
        ))}
      </nav>
      <div className={isPending ? 'opacity-75 transition-opacity' : ''}>
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'analytics' && <AnalyticsTab />} {/* Costoso */}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  )
}
```

---

## `useDeferredValue`

Alternativa a debounce para inputs de búsqueda. A diferencia de debounce, no introduce delay artificial: React renderiza con el valor anterior mientras calcula el nuevo.

```typescript
'use client'

import { useDeferredValue, useState, useMemo, memo } from 'react'

// Componente costoso de renderizar
const SearchResults = memo(function SearchResults({
  query,
  items,
}: {
  query: string
  items: Item[]
}) {
  // Cálculo costoso
  const results = useMemo(
    () => items.filter(item => item.name.toLowerCase().includes(query.toLowerCase())),
    [query, items]
  )

  return (
    <ul>
      {results.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  )
})

export function SearchInput({ items }: { items: Item[] }) {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query) // Valor "retrasado"

  const isStale = query !== deferredQuery // True mientras se calcula

  return (
    <div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Buscar..."
      />
      {/* SearchResults se renderiza con el valor anterior mientras calcula el nuevo */}
      <div className={isStale ? 'opacity-50' : ''}>
        <SearchResults query={deferredQuery} items={items} />
      </div>
    </div>
  )
}
```

**`useDeferredValue` vs debounce:**
- Debounce: espera N ms fijos antes de actualizar. Lento en hardware rápido, roto en hardware lento.
- `useDeferredValue`: React decide cuándo actualizar según la carga actual. Se adapta al hardware.

---

## Virtualización con `@tanstack/virtual`

Para listas largas (>100 items), renderizar solo los elementos visibles.

```bash
npm install @tanstack/react-virtual
```

```typescript
'use client'

import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

interface VirtualListProps {
  items: Item[]
  itemHeight?: number
}

export function VirtualList({ items, itemHeight = 60 }: VirtualListProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan: 5, // Renderizar 5 items extra fuera del viewport (scroll suave)
  })

  return (
    // Contenedor scrolleable con altura fija
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto"
    >
      {/* Div del tamaño total de la lista (para que el scrollbar sea correcto) */}
      <div
        style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}
      >
        {rowVirtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <ItemRow item={items[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}

// Virtualización de grid (2D)
export function VirtualGrid({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null)
  const COLUMNS = 3

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(items.length / COLUMNS),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 250, // Altura de cada fila del grid
    overscan: 2,
  })

  return (
    <div ref={parentRef} className="h-[800px] overflow-auto">
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
        {rowVirtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
              display: 'grid',
              gridTemplateColumns: `repeat(${COLUMNS}, 1fr)`,
              gap: '1rem',
            }}
          >
            {Array.from({ length: COLUMNS }, (_, col) => {
              const index = virtualRow.index * COLUMNS + col
              return index < items.length ? (
                <ItemCard key={items[index].id} item={items[index]} />
              ) : null
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Cuándo virtualizar:**
- Listas con >100 items visibles en scroll.
- Tablas con >50 filas.
- Feeds infinitos (infinite scroll).

---

## `key` prop — por qué `key={index}` es un bug

```typescript
// MAL: key={index} en lista ordenable o con items que se añaden/eliminan
function BadList({ items }: { items: Todo[] }) {
  return (
    <ul>
      {items.map((item, index) => (
        <TodoItem key={index} item={item} /> // Bug: al reordenar, React reutiliza DOM incorrecto
      ))}
    </ul>
  )
}

// BIEN: key basada en el ID estable del item
function GoodList({ items }: { items: Todo[] }) {
  return (
    <ul>
      {items.map(item => (
        <TodoItem key={item.id} item={item} />
      ))}
    </ul>
  )
}

// BIEN: key={index} ES correcto cuando la lista es estática y nunca se reordena
function StaticList() {
  const STEPS = ['Configurar', 'Instalar', 'Ejecutar'] // Lista fija
  return (
    <ol>
      {STEPS.map((step, i) => (
        <li key={i}>{step}</li> // OK: la lista nunca cambia
      ))}
    </ol>
  )
}
```

**Por qué `key={index}` rompe cosas:**
- React usa `key` para identificar qué componente es qué entre renders.
- Al eliminar el item 0, todos los índices bajan en 1.
- React cree que el item 1 "se convirtió" en el item 0, y reutiliza su estado interno.
- Input con texto, animaciones, y estado local quedan asociados al item incorrecto.

---

## Suspense + Error Boundary en App Router

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

// Error Boundary para cada sección independiente
function SectionError({ error, resetErrorBoundary }: {
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <div className="border border-red-200 bg-red-50 rounded p-4">
      <p className="text-red-700 text-sm">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="mt-2 text-sm text-red-600 underline"
      >
        Reintentar
      </button>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <ErrorBoundary FallbackComponent={SectionError}>
        <Suspense fallback={<MetricsSkeleton />}>
          <MetricsSection />
        </Suspense>
      </ErrorBoundary>

      <div className="grid md:grid-cols-2 gap-6">
        <ErrorBoundary FallbackComponent={SectionError}>
          <Suspense fallback={<ChartSkeleton />}>
            <RevenueChart />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary FallbackComponent={SectionError}>
          <Suspense fallback={<TableSkeleton />}>
            <RecentOrders />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  )
}
```

**Regla:** cada `<ErrorBoundary>` + `<Suspense>` par aísla fallos. Si `RevenueChart` falla, `RecentOrders` sigue funcionando.

---

## `use()` hook para promises

```typescript
// En Next.js App Router, los Server Components son async por defecto.
// El hook use() es para Client Components que reciben promises como props.

// app/page.tsx — Server Component
import { Suspense } from 'react'
import { ClientComponent } from '@/components/ClientComponent'

export default function Page() {
  // Crear promise sin await — se pasa al cliente
  const dataPromise = fetchData() // No await

  return (
    <Suspense fallback={<Loading />}>
      <ClientComponent dataPromise={dataPromise} />
    </Suspense>
  )
}

// components/ClientComponent.tsx — Client Component
'use client'

import { use } from 'react'

interface Props {
  dataPromise: Promise<Data>
}

export function ClientComponent({ dataPromise }: Props) {
  // use() suspende el componente hasta que la promise se resuelva
  // Suspense en el padre muestra el fallback mientras tanto
  const data = use(dataPromise)

  return <div>{data.title}</div>
}
```

---

## Checklist de React Performance

```
[ ] Profiler ejecutado antes de optimizar — identificar componentes que renderizan >16ms
[ ] React.memo solo en componentes en listas largas con renders frecuentes del padre
[ ] useCallback usado junto a React.memo (sin memo, useCallback no sirve)
[ ] useMemo solo para cálculos que tardan >10ms o para estabilizar deps de otros hooks
[ ] key={id estable} en todas las listas dinámicas
[ ] useTransition para filtros/búsquedas en tiempo real
[ ] useDeferredValue como alternativa a debounce en inputs de búsqueda
[ ] Virtualización con @tanstack/virtual para listas >100 items
[ ] Suspense boundaries granulares (una por sección independiente)
[ ] ErrorBoundary por sección para aislar fallos
[ ] 'use client' lo más abajo posible en el árbol de componentes
```
