---
name: data-viz-dashboard
description: >
  Use when building dashboards, charts, graphs, or data visualization components
  in React/Next.js. Trigger for: "dashboard", "charts", "graphs", "Recharts",
  "Chart.js", "metrics", "KPIs", "data visualization", "analytics dashboard",
  "gráficas", "gráficos", "tablero de métricas", "visualizar datos", "time series",
  "bar chart", "pie chart", "line chart", "funnel chart", "heatmap", "gauge",
  "stats card", "metric card", "mostrar datos de n8n", "panel de control",
  "reporting dashboard", "business intelligence", "admin dashboard".
---

# Data Visualization Dashboard — React/Next.js

## 1. Elegir la librería correcta

### Decision Tree

```
¿Necesitas algo completamente custom que las librerías no pueden hacer?
├── YES → D3.js (curva alta, solo para casos extremos)
└── NO →
    ¿Prototipo rápido / internal tool / admin panel?
    ├── YES → Tremor o shadcn/ui Charts (cero config, Tailwind nativo)
    └── NO →
        ¿Muchos datos (>10k puntos) o animaciones complejas?
        ├── YES → Chart.js + react-chartjs-2 (canvas, mejor performance)
        └── NO → Recharts (recomendado — composable, SVG, excelente DX)
```

### Comparativa

| | Recharts | Tremor | Chart.js | Nivo | D3 |
|---|---|---|---|---|---|
| DX | Excelente | Excelente | Bueno | Bueno | Difícil |
| Tailwind | Manual | Nativo | Manual | No | No |
| Performance | Buena | Buena | Excelente | Buena | Excelente |
| Customización | Alta | Media | Alta | Alta | Total |
| Bundle size | ~300kb | ~150kb | ~200kb | ~500kb | ~500kb |
| Casos de uso | General | Prototipos | Big data | Viz complejas | Todo custom |

**Regla:** Recharts o Tremor para el 90% de casos. D3 solo como último recurso.

---

## 2. Setup Recharts (stack principal)

```bash
npm install recharts date-fns
npm install @types/recharts  # Si TS lo pide
```

**Regla crítica — Server vs Client Components:**
- Todos los charts son siempre `'use client'` — necesitan DOM y `window` para el resize
- Fetch los datos en un Server Component y pásalos como props al chart

```typescript
// app/dashboard/page.tsx — Server Component (fetch data aquí)
import { SalesChart } from '@/components/charts/SalesChart'
import { getMetrics } from '@/lib/data'

export default async function DashboardPage() {
  const metrics = await getMetrics() // fetch en server
  return <SalesChart data={metrics} />
}

// components/charts/SalesChart.tsx — Client Component (chart aquí)
'use client'
import { LineChart, /* ... */ } from 'recharts'
```

**ResponsiveContainer — siempre envolver los charts:**
```typescript
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>...</LineChart>
</ResponsiveContainer>
```

---

## 3. Charts más comunes

Ver código completo y listo para copy-paste en `references/chart-components.md`.

### Line Chart — Time Series
Para métricas a lo largo del tiempo (usuarios, revenue, ejecuciones de n8n, etc.).
Soporte: múltiples líneas, tooltip custom con formato de fechas, línea punteada para período anterior.

```typescript
'use client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

export function TimeSeriesChart({ data }: { data: Array<{ date: string; value: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="date" tickFormatter={(v) => format(new Date(v), 'dd MMM')} axisLine={false} tickLine={false} />
        <YAxis axisLine={false} tickLine={false} />
        <Tooltip labelFormatter={(l) => format(new Date(l), 'dd MMM yyyy')} />
        <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

### Bar Chart
Vertical (comparación), Horizontal (rankings), Grouped y Stacked — ver `references/chart-components.md`.

### Area Chart con Gradient
Gradiente de transparencia hacia abajo, soporte stacked y múltiples áreas — ver `references/chart-components.md`.

### Donut / Pie Chart
Custom label de porcentaje, label central con total, versión simple sin label — ver `references/chart-components.md`.

---

## 4. Metric Cards (sin librería)

Ver componentes completos en `references/chart-components.md`:
- `MetricCard`: número grande + TrendingUp/Down icon + sparkline con Recharts
- `StatCard`: comparación con período anterior, delta percentage con colores verde/rojo y badge

Skeleton de loading incluido en ambos componentes.

```typescript
// Uso rápido:
<MetricCard
  title="Revenue mensual"
  value={48352}
  prefix="$"
  change={12.5}
  trend="up"
  sparklineData={[3200, 3800, 4100, 4700, 5200]}
/>

<StatCard title="Errores" current={3} previous={8} invertColors />
```

---

## 5. Datos desde n8n

### Patrón A — n8n escribe en Supabase, dashboard lee

```typescript
// lib/data/n8n-metrics.ts
import { createClient } from '@/lib/supabase/server'

export async function getWorkflowMetrics(days = 30) {
  const supabase = createClient()
  const since = new Date(Date.now() - days * 86400000).toISOString()

  const { data } = await supabase
    .from('workflow_runs')
    .select('workflow_name, status, executed_at, duration_ms')
    .gte('executed_at', since)
    .order('executed_at', { ascending: true })

  return data ?? []
}

export async function getWorkflowStats() {
  const supabase = createClient()
  const { data } = await supabase.rpc('get_workflow_stats') // SQL function de agregación
  return data
}
```

### Patrón B — Dashboard hace polling al webhook de n8n

```typescript
'use client'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useN8nMetrics() {
  const { data, error, isLoading } = useSWR(
    '/api/n8n-metrics',
    fetcher,
    { refreshInterval: 30_000 }
  )
  return { metrics: data, error, isLoading }
}

// app/api/n8n-metrics/route.ts
export async function GET() {
  const res = await fetch(process.env.N8N_WEBHOOK_URL!, {
    headers: { 'x-api-key': process.env.N8N_API_KEY! },
    next: { revalidate: 0 },
  })
  const data = await res.json()
  return Response.json(data)
}
```

---

## 6. Dashboard Layout

Ver layout completo con sidebar colapsable, TopBar con search y notificaciones en `references/dashboard-layouts.md`.

```typescript
// app/dashboard/layout.tsx — estructura base
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}

// Grid de métricas KPI — responsive
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <MetricCard title="Total ejecuciones" value={1284} change={12.5} trend="up" />
  <MetricCard title="Tasa de éxito" value={98.2} suffix="%" change={0.3} trend="up" />
  <MetricCard title="Tiempo promedio" value={1.4} suffix="s" change={-8.1} trend="up" />
  <MetricCard title="Errores hoy" value={3} change={50} trend="down" />
</div>

// Layout de charts 2/3 + 1/3
<div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
  <div className="lg:col-span-2 rounded-xl border bg-card p-6">
    <TimeSeriesChart data={timeSeriesData} />
  </div>
  <div className="rounded-xl border bg-card p-6">
    <DonutChart data={byWorkflow} />
  </div>
</div>
```

---

## 7. Date Range Filter

Filtra todos los charts via URL search params. Ver `references/dashboard-layouts.md` para implementación completa con `getDateRangeFromParam()` helper.

```typescript
// Presets: 7d, 30d, 90d, ytd, 1y → guarda en ?range=30d
// En la page (Server Component):
const { range = '30d' } = await searchParams
const { from, to } = getDateRangeFromParam(range)
```

Tabla de datos con paginación client-side y hook `useDashboardData(range)` con SWR también en `references/dashboard-layouts.md`.

---

## 8. Performance

```typescript
// Memoizar transformaciones de datos pesadas
const chartData = useMemo(() => {
  return rawData.map((d) => ({
    date: format(new Date(d.date), 'yyyy-MM-dd'),
    value: d.count,
  }))
}, [rawData])

// Suspense boundaries por sección
<Suspense fallback={<ChartSkeleton height={300} />}>
  <AsyncMetricCard />
</Suspense>

// Skeleton loaders durante el fetch
{isLoading ? (
  <div className="h-[300px] rounded-xl bg-muted animate-pulse" />
) : (
  <TimeSeriesChart data={chartData} />
)}

// Tablas grandes: virtualización
npm install @tanstack/react-virtual
```

Ver skeletons `ChartSkeleton` y `TableSkeleton` en `references/dashboard-layouts.md`.

---

## 9. Tremor — Alternativa rápida

```bash
npm install @tremor/react
```

```typescript
import { Card, Metric, Text, AreaChart, DonutChart, BadgeDelta } from '@tremor/react'

<Card>
  <Text>Total Revenue</Text>
  <Metric>$48,352</Metric>
  <BadgeDelta deltaType="increase">12.5%</BadgeDelta>
</Card>

<Card>
  <AreaChart
    data={chartData}
    index="date"
    categories={['value', 'previousValue']}
    colors={['indigo', 'gray']}
    yAxisWidth={48}
  />
</Card>
```

Ver equivalentes Tremor completos para todos los charts en `references/chart-components.md`.

Preferir Tremor cuando: prototipo rápido, internal tool, admin panel, cliente quiere algo funcional en horas.

---

## Referencias

Ver archivos en `references/`:
- `chart-components.md`: Código TSX completo listo para copy-paste (MultiLineChart, BarChart vertical/horizontal/grouped/stacked, GradientAreaChart, DonutChart/PieChart con label de %, MetricCard con sparkline, StatCard con delta, Tremor equivalents)
- `dashboard-layouts.md`: Sidebar colapsable, TopBar, KPIGrid con Suspense, DateRangePicker, DataTable con paginación, skeletons, hook `useDashboardData`, API route de métricas
