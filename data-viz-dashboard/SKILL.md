---
name: data-viz-dashboard
description: >
  Dashboards y visualización de datos en React/Next.js. Stack: Recharts / Chart.js.
  Usar cuando: "dashboard", "gráfica", "chart", "KPIs", "métricas", "stat cards",
  "bar chart", "pie chart", "line chart", "heatmap", "panel de analytics",
  "reporting dashboard", "admin panel con datos", "visualizar datos".
  Do NOT use for: un chart aislado en una landing page (usar Chart.js inline sin librería),
  reportes PDF estáticos (usar pdf-generation),
  visualizaciones en emails (usar email-templates-builder).
---

# Data Visualization Dashboard — React/Next.js

## 1. Decision Tree

```
¿Completamente custom que librerías no pueden hacer?
├── YES → D3.js (solo casos extremos)
└── NO →
    ¿Prototipo rápido / internal tool / admin panel?
    ├── YES → Tremor o shadcn/ui Charts
    └── NO →
        ¿>10k puntos o animaciones complejas?
        ├── YES → Chart.js + react-chartjs-2 (canvas)
        └── NO → Recharts (recomendado)
```

**Regla:** Recharts o Tremor para el 90% de casos.

---

## 2. Setup Recharts

```bash
npm install recharts date-fns
```

- Charts siempre `'use client'` (necesitan DOM + window)
- Fetch datos en Server Component, pasar como props
- Siempre envolver en `<ResponsiveContainer width="100%" height={300}>`

```typescript
// Server Component fetches, Client Component renders
// app/dashboard/page.tsx
const metrics = await getMetrics()
return <SalesChart data={metrics} />
```

---

## 3. Charts comunes

Ver codigo completo en `references/chart-components.md`.

### Line Chart — Time Series
Para metricas en el tiempo. Soporte: multiples lineas, tooltip custom, linea punteada periodo anterior.

```typescript
'use client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
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

### Otros charts disponibles en `references/chart-components.md`:
- Bar Chart (vertical, horizontal, grouped, stacked)
- Area Chart con gradient
- Donut/Pie Chart con label de %

---

## 4. Metric Cards

Ver `references/chart-components.md` para componentes completos con skeleton.

```typescript
<MetricCard title="Revenue mensual" value={48352} prefix="$" change={12.5} trend="up"
  sparklineData={[3200, 3800, 4100, 4700, 5200]} />
<StatCard title="Errores" current={3} previous={8} invertColors />
```

---

## 5. Datos desde n8n

Ver `references/data-patterns.md` para implementaciones completas.

**Patron A — n8n escribe en Supabase, dashboard lee:** Server Component con `getWorkflowMetrics(days)`.

**Patron B — Dashboard polling a n8n:** SWR hook con `refreshInterval: 30_000` via API route proxy.

---

## 6. Dashboard Layout

Ver `references/dashboard-layouts.md` para layout completo con sidebar colapsable y TopBar.

```typescript
// Estructura base
<div className="flex min-h-screen bg-background">
  <Sidebar />
  <div className="flex flex-1 flex-col">
    <TopBar />
    <main className="flex-1 overflow-auto p-6 lg:p-8">{children}</main>
  </div>
</div>

// Grid KPI responsive
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <MetricCard ... />
</div>

// Charts 2/3 + 1/3
<div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
  <div className="lg:col-span-2 rounded-xl border bg-card p-6"><TimeSeriesChart /></div>
  <div className="rounded-xl border bg-card p-6"><DonutChart /></div>
</div>
```

---

## 7. Date Range Filter

Filtra charts via URL search params. Presets: 7d, 30d, 90d, ytd, 1y.

```typescript
const { range = '30d' } = await searchParams
const { from, to } = getDateRangeFromParam(range)
```

Ver `references/dashboard-layouts.md` para `getDateRangeFromParam()`, `useDashboardData` hook y DataTable con paginacion.

---

## 8. Performance

- `useMemo` para transformaciones de datos pesadas
- Suspense boundaries por seccion con `<ChartSkeleton />`
- Skeleton loaders durante fetch: `<div className="h-[300px] rounded-xl bg-muted animate-pulse" />`
- Tablas grandes: `@tanstack/react-virtual`

Ver skeletons en `references/dashboard-layouts.md`.

---

## 9. Tremor — Alternativa rapida

```bash
npm install @tremor/react
```

Preferir Tremor cuando: prototipo rapido, internal tool, admin panel.

```typescript
import { Card, Metric, Text, AreaChart, BadgeDelta } from '@tremor/react'
<Card>
  <Text>Total Revenue</Text>
  <Metric>$48,352</Metric>
  <BadgeDelta deltaType="increase">12.5%</BadgeDelta>
</Card>
```

Ver equivalentes Tremor completos en `references/chart-components.md`.

---

## Referencias

- `references/chart-components.md` — Codigo TSX completo (todos los charts, MetricCard, StatCard, Tremor)
- `references/dashboard-layouts.md` — Sidebar, TopBar, KPIGrid, DateRangePicker, DataTable, skeletons
- `references/data-patterns.md` — Patrones Supabase + n8n para datos
