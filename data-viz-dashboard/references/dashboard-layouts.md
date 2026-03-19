# Dashboard Layouts — Código TSX Completo

Patterns completos para dashboards Next.js 15 + Tailwind.

---

## Layout Completo con Sidebar

```typescript
// app/dashboard/layout.tsx
import { Sidebar } from '@/components/dashboard/Sidebar'
import { TopBar } from '@/components/dashboard/TopBar'

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
```

```typescript
// components/dashboard/Sidebar.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Settings,
  Zap,
  ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/dashboard/workflows', icon: Zap, label: 'Workflows' },
  { href: '/dashboard/team', icon: Users, label: 'Equipo' },
  { href: '/dashboard/settings', icon: Settings, label: 'Configuración' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-card transition-all duration-200',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-4">
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight">MiApp</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground',
            collapsed && 'mx-auto',
          )}
        >
          <ChevronLeft
            className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')}
          />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                collapsed && 'justify-center',
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      {!collapsed && (
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
              AU
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">Admin User</p>
              <p className="truncate text-xs text-muted-foreground">admin@app.com</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
```

```typescript
// components/dashboard/TopBar.tsx
'use client'
import { Bell, Search } from 'lucide-react'

export function TopBar() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-6">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Buscar..."
          className="h-9 w-full rounded-md border bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button className="relative rounded-md p-2 text-muted-foreground hover:bg-muted">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
      </div>
    </header>
  )
}
```

---

## Grid de Métricas KPI — 4 Cards Responsive

```typescript
// components/dashboard/KPIGrid.tsx
import { MetricCard } from './MetricCard'
import { Suspense } from 'react'

interface KPIData {
  totalRuns: number
  successRate: number
  avgDuration: number
  errorsToday: number
  changes: {
    totalRuns: number
    successRate: number
    avgDuration: number
    errorsToday: number
  }
}

export function KPIGrid({ data }: { data: KPIData }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total ejecuciones"
        value={data.totalRuns}
        change={data.changes.totalRuns}
        trend={data.changes.totalRuns >= 0 ? 'up' : 'down'}
      />
      <MetricCard
        title="Tasa de éxito"
        value={data.successRate}
        suffix="%"
        change={data.changes.successRate}
        trend={data.changes.successRate >= 0 ? 'up' : 'down'}
      />
      <MetricCard
        title="Tiempo promedio"
        value={data.avgDuration}
        suffix="s"
        change={data.changes.avgDuration}
        trend={data.changes.avgDuration <= 0 ? 'up' : 'down'} // Menos tiempo = mejor
      />
      <MetricCard
        title="Errores hoy"
        value={data.errorsToday}
        change={data.changes.errorsToday}
        trend={data.changes.errorsToday <= 0 ? 'up' : 'down'} // Menos errores = mejor
      />
    </div>
  )
}

// Con Suspense (Server Components):
export function KPIGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border bg-card p-6 shadow-sm">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="mt-2 h-8 w-32 rounded bg-muted" />
          <div className="mt-2 h-4 w-40 rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}

// En la page:
// <Suspense fallback={<KPIGridSkeleton />}>
//   <AsyncKPIGrid dateRange={dateRange} />
// </Suspense>
```

---

## DateRangePicker — Filtrar Charts

```typescript
// components/dashboard/DateRangePicker.tsx
'use client'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Calendar } from 'lucide-react'

export type DateRange = '7d' | '30d' | '90d' | 'ytd' | '1y'

const PRESETS: { label: string; value: DateRange }[] = [
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: '90d', value: '90d' },
  { label: 'Este año', value: 'ytd' },
  { label: '1 año', value: '1y' },
]

export function getDateRangeFromParam(range: DateRange = '30d'): { from: Date; to: Date } {
  const to = new Date()
  const from = new Date()

  switch (range) {
    case '7d':
      from.setDate(from.getDate() - 7)
      break
    case '30d':
      from.setDate(from.getDate() - 30)
      break
    case '90d':
      from.setDate(from.getDate() - 90)
      break
    case 'ytd':
      from.setMonth(0, 1)
      break
    case '1y':
      from.setFullYear(from.getFullYear() - 1)
      break
  }

  return { from, to }
}

export function DateRangePicker() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = (searchParams.get('range') as DateRange) ?? '30d'

  const setRange = useCallback(
    (value: DateRange) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('range', value)
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams],
  )

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <div className="flex gap-1 rounded-lg border bg-muted/40 p-1">
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            onClick={() => setRange(preset.value)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              current === preset.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  )
}
```

---

## Tabla de Datos con Paginación

```typescript
// components/dashboard/DataTable.tsx
'use client'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Column<T> {
  key: keyof T | string
  header: string
  render?: (row: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  pageSize?: number
  caption?: string
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  pageSize = 10,
  caption,
}: DataTableProps<T>) {
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(data.length / pageSize)
  const pageData = data.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <div className="space-y-3">
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          {caption && (
            <caption className="sr-only">{caption}</caption>
          )}
          <thead className="bg-muted/50">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground',
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {pageData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-sm text-muted-foreground"
                >
                  Sin datos para mostrar
                </td>
              </tr>
            ) : (
              pageData.map((row, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={cn('px-4 py-3', col.className)}
                    >
                      {col.render ? col.render(row) : String(row[col.key as keyof T] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            {page * pageSize + 1}–{Math.min((page + 1) * pageSize, data.length)} de {data.length}
          </p>
          <div className="flex items-center gap-1">
            <PaginationButton onClick={() => setPage(0)} disabled={page === 0}>
              <ChevronsLeft className="h-4 w-4" />
            </PaginationButton>
            <PaginationButton onClick={() => setPage(page - 1)} disabled={page === 0}>
              <ChevronLeft className="h-4 w-4" />
            </PaginationButton>
            <span className="px-3 py-1 text-muted-foreground">
              {page + 1} / {totalPages}
            </span>
            <PaginationButton onClick={() => setPage(page + 1)} disabled={page >= totalPages - 1}>
              <ChevronRight className="h-4 w-4" />
            </PaginationButton>
            <PaginationButton onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}>
              <ChevronsRight className="h-4 w-4" />
            </PaginationButton>
          </div>
        </div>
      )}
    </div>
  )
}

function PaginationButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void
  disabled: boolean
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-md border p-1.5 text-muted-foreground hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  )
}

// Uso:
// <DataTable
//   data={workflows}
//   columns={[
//     { key: 'name', header: 'Workflow' },
//     { key: 'status', header: 'Estado', render: (r) => <StatusBadge status={r.status} /> },
//     { key: 'duration', header: 'Duración', render: (r) => `${r.duration}ms` },
//   ]}
// />
```

---

## Suspense + Skeleton Loading por Sección

```typescript
// Pattern completo de loading state para cada sección del dashboard

// 1. Skeleton genérico de chart
export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div
      className="animate-pulse rounded-xl bg-muted"
      style={{ height }}
      role="status"
      aria-label="Cargando gráfico..."
    />
  )
}

// 2. Skeleton de tabla
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-0 rounded-lg border overflow-hidden">
      <div className="h-10 bg-muted/50" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 border-t px-4 py-3">
          <div className="h-4 w-1/4 rounded bg-muted" />
          <div className="h-4 w-1/3 rounded bg-muted" />
          <div className="h-4 w-1/5 rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}

// 3. Uso en la page con Suspense
// app/dashboard/page.tsx
import { Suspense } from 'react'
import { KPIGridSkeleton } from '@/components/dashboard/KPIGrid'
import { ChartSkeleton, TableSkeleton } from '@/components/dashboard/Skeletons'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const { range = '30d' } = await searchParams

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Resumen de actividad</p>
        </div>
        <DateRangePicker />
      </div>

      {/* KPIs */}
      <Suspense fallback={<KPIGridSkeleton />}>
        <AsyncKPIGrid range={range} />
      </Suspense>

      {/* Charts principales */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-base font-semibold">Ejecuciones por día</h2>
          <Suspense fallback={<ChartSkeleton height={280} />}>
            <AsyncTimeSeriesChart range={range} />
          </Suspense>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-base font-semibold">Por workflow</h2>
          <Suspense fallback={<ChartSkeleton height={280} />}>
            <AsyncDonutChart range={range} />
          </Suspense>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="mb-4 text-base font-semibold">Últimas ejecuciones</h2>
        <Suspense fallback={<TableSkeleton rows={8} />}>
          <AsyncRunsTable range={range} />
        </Suspense>
      </div>
    </div>
  )
}
```

---

## Hook `useDashboardData(dateRange)` con SWR

```typescript
// hooks/useDashboardData.ts
'use client'
import useSWR from 'swr'
import { getDateRangeFromParam, type DateRange } from '@/components/dashboard/DateRangePicker'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message ?? `HTTP ${res.status}`)
  }
  return res.json()
}

export interface DashboardMetrics {
  kpi: {
    totalRuns: number
    successRate: number
    avgDuration: number
    errorsToday: number
    changes: Record<string, number>
  }
  timeSeries: Array<{ date: string; runs: number; errors: number }>
  byWorkflow: Array<{ name: string; value: number }>
  recentRuns: Array<{
    id: string
    workflow: string
    status: 'success' | 'error' | 'running'
    duration: number
    startedAt: string
  }>
}

export function useDashboardData(range: DateRange = '30d') {
  const { from, to } = getDateRangeFromParam(range)

  const params = new URLSearchParams({
    from: from.toISOString(),
    to: to.toISOString(),
  })

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<DashboardMetrics>(`/api/dashboard/metrics?${params}`, fetcher, {
    refreshInterval: 60_000,         // Refresh cada minuto
    revalidateOnFocus: true,
    dedupingInterval: 5_000,
    keepPreviousData: true,          // No flash de undefined al cambiar dateRange
    onError: (err) => {
      console.error('[useDashboardData]', err)
    },
  })

  return {
    data,
    error,
    isLoading,
    isRefreshing: isValidating && !isLoading,
    refresh: mutate,
  }
}

// Uso en un Client Component:
// function DashboardClient({ initialRange }: { initialRange: DateRange }) {
//   const { data, error, isLoading, isRefreshing } = useDashboardData(initialRange)
//   if (isLoading) return <DashboardSkeleton />
//   if (error) return <ErrorState message={error.message} />
//   return <DashboardContent data={data!} />
// }
```

```typescript
// app/api/dashboard/metrics/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from') ?? new Date(Date.now() - 30 * 86400000).toISOString()
  const to = searchParams.get('to') ?? new Date().toISOString()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Queries en paralelo
  const [runsRes, byWorkflowRes] = await Promise.all([
    supabase
      .from('workflow_runs')
      .select('status, duration_ms, started_at, workflow_name')
      .gte('started_at', from)
      .lte('started_at', to)
      .order('started_at', { ascending: false }),
    supabase
      .from('workflow_runs')
      .select('workflow_name, count:id')
      .gte('started_at', from)
      .lte('started_at', to),
  ])

  const runs = runsRes.data ?? []
  const total = runs.length
  const errors = runs.filter((r) => r.status === 'error').length
  const avgDuration = total
    ? Math.round(runs.reduce((s, r) => s + (r.duration_ms ?? 0), 0) / total / 1000)
    : 0

  return NextResponse.json({
    kpi: {
      totalRuns: total,
      successRate: total ? Math.round(((total - errors) / total) * 100 * 10) / 10 : 100,
      avgDuration,
      errorsToday: errors,
      changes: { totalRuns: 0, successRate: 0, avgDuration: 0, errorsToday: 0 }, // calcular vs período anterior
    },
    recentRuns: runs.slice(0, 50).map((r) => ({
      id: r.id,
      workflow: r.workflow_name,
      status: r.status,
      duration: r.duration_ms,
      startedAt: r.started_at,
    })),
  })
}
```
