# Chart Components — Código TSX Completo

Código listo para copy-paste. Stack: Recharts + Tailwind + Next.js 15.

## Instalación

```bash
npm install recharts date-fns
npm install @tremor/react  # Solo si usas Tremor
```

---

## LineChart — Time Series (múltiples líneas, tooltip custom, formato fechas)

```typescript
// components/charts/LineChart.tsx
'use client'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type TooltipProps,
} from 'recharts'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

type DataPoint = {
  date: string
  [key: string]: string | number
}

type LineConfig = {
  dataKey: string
  label: string
  color: string
  dashed?: boolean
}

interface MultiLineChartProps {
  data: DataPoint[]
  lines: LineConfig[]
  height?: number
  formatY?: (value: number) => string
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        {format(new Date(label), "dd 'de' MMMM yyyy", { locale: es })}
      </p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold">
            {typeof entry.value === 'number' ? entry.value.toLocaleString('es') : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export function MultiLineChart({
  data,
  lines,
  height = 320,
  formatY = (v) => v.toLocaleString(),
}: MultiLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(val) => format(new Date(val), 'dd MMM', { locale: es })}
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatY}
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12 }}
          formatter={(value) => lines.find((l) => l.dataKey === value)?.label ?? value}
        />
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            name={line.label}
            stroke={line.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            strokeDasharray={line.dashed ? '5 5' : undefined}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

// Uso:
// <MultiLineChart
//   data={[{ date: '2024-01-01', actual: 1200, previo: 1050 }]}
//   lines={[
//     { dataKey: 'actual', label: 'Período actual', color: 'hsl(var(--primary))' },
//     { dataKey: 'previo', label: 'Período anterior', color: 'hsl(var(--muted-foreground))', dashed: true },
//   ]}
//   formatY={(v) => `$${v.toLocaleString()}`}
// />
```

---

## BarChart — Vertical, Horizontal, Stacked y Grouped

```typescript
// components/charts/BarChart.tsx
'use client'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'

type BarDataPoint = { name: string; [key: string]: string | number }

// --- Vertical simple (destacar máximo) ---
export function VerticalBarChart({
  data,
  dataKey = 'value',
  height = 300,
}: {
  data: BarDataPoint[]
  dataKey?: string
  height?: number
}) {
  const values = data.map((d) => Number(d[dataKey]))
  const max = Math.max(...values)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 8,
            fontSize: 13,
          }}
        />
        <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={
                Number(entry[dataKey]) === max
                  ? 'hsl(var(--primary))'
                  : 'hsl(var(--primary) / 0.35)'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// --- Horizontal (rankings con nombres largos) ---
export function HorizontalBarChart({
  data,
  dataKey = 'value',
  labelWidth = 100,
}: {
  data: BarDataPoint[]
  dataKey?: string
  labelWidth?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(data.length * 44, 200)}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={labelWidth}
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 8,
          }}
        />
        <Bar dataKey={dataKey} fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// --- Grouped (comparar múltiples series por categoría) ---
const GROUP_COLORS = [
  'hsl(var(--primary))',
  '#60a5fa',
  '#34d399',
  '#fbbf24',
]

export function GroupedBarChart({
  data,
  groups,
  height = 300,
}: {
  data: BarDataPoint[]
  groups: { dataKey: string; label: string }[]
  height?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 8,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {groups.map((g, i) => (
          <Bar
            key={g.dataKey}
            dataKey={g.dataKey}
            name={g.label}
            fill={GROUP_COLORS[i % GROUP_COLORS.length]}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

// --- Stacked (composición del total) ---
export function StackedBarChart({
  data,
  groups,
  height = 300,
}: {
  data: BarDataPoint[]
  groups: { dataKey: string; label: string }[]
  height?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 8,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {groups.map((g, i) => (
          <Bar
            key={g.dataKey}
            dataKey={g.dataKey}
            name={g.label}
            stackId="stack"
            fill={GROUP_COLORS[i % GROUP_COLORS.length]}
            radius={i === groups.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
```

---

## AreaChart con Gradient Fill

```typescript
// components/charts/AreaChart.tsx
'use client'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

type AreaConfig = {
  dataKey: string
  label: string
  color: string
  stacked?: boolean
}

interface GradientAreaChartProps {
  data: Record<string, any>[]
  areas: AreaConfig[]
  dateKey?: string
  height?: number
  formatY?: (value: number) => string
}

export function GradientAreaChart({
  data,
  areas,
  dateKey = 'date',
  height = 300,
  formatY = (v) => v.toLocaleString(),
}: GradientAreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <defs>
          {areas.map((area) => (
            <linearGradient key={area.dataKey} id={`grad-${area.dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={area.color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={area.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey={dateKey}
          tickFormatter={(val) => {
            try {
              return format(new Date(val), 'dd MMM', { locale: es })
            } catch {
              return val
            }
          }}
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatY}
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
          width={60}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 8,
          }}
          labelFormatter={(label) => {
            try {
              return format(new Date(label), "dd 'de' MMMM yyyy", { locale: es })
            } catch {
              return label
            }
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />

        {areas.map((area) => (
          <Area
            key={area.dataKey}
            type="monotone"
            dataKey={area.dataKey}
            name={area.label}
            stroke={area.color}
            strokeWidth={2}
            fill={`url(#grad-${area.dataKey})`}
            stackId={area.stacked ? 'stack' : undefined}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}

// Uso simple (una sola área):
// <GradientAreaChart
//   data={timeSeriesData}
//   areas={[{ dataKey: 'revenue', label: 'Revenue', color: 'hsl(var(--primary))' }]}
//   formatY={(v) => `$${v.toLocaleString()}`}
// />
```

---

## DonutChart / PieChart con Custom Label de Porcentaje

```typescript
// components/charts/DonutChart.tsx
'use client'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type PieLabelRenderProps,
} from 'recharts'

const COLORS = [
  'hsl(var(--primary))',
  '#60a5fa',
  '#34d399',
  '#fbbf24',
  '#f87171',
  '#a78bfa',
  '#fb923c',
]

type PieDataPoint = { name: string; value: number }

// Label exterior con porcentaje
const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
}: PieLabelRenderProps) => {
  if (!cx || !cy || !midAngle || !innerRadius || !outerRadius || !percent) return null
  if (percent < 0.04) return null // No mostrar labels muy pequeños

  const RADIAN = Math.PI / 180
  const radius = Number(outerRadius) + 30
  const x = Number(cx) + radius * Math.cos(-Number(midAngle) * RADIAN)
  const y = Number(cy) + radius * Math.sin(-Number(midAngle) * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="hsl(var(--foreground))"
      textAnchor={x > Number(cx) ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={12}
      fontWeight={500}
    >
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  )
}

// Label central para el donut (muestra total)
function CenterLabel({ cx, cy, total }: { cx: number; cy: number; total: number }) {
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
      <tspan x={cx} dy="-0.5em" fontSize={24} fontWeight={700} fill="hsl(var(--foreground))">
        {total.toLocaleString()}
      </tspan>
      <tspan x={cx} dy="1.5em" fontSize={12} fill="hsl(var(--muted-foreground))">
        Total
      </tspan>
    </text>
  )
}

interface DonutChartProps {
  data: PieDataPoint[]
  showCenterLabel?: boolean
  showPercentLabel?: boolean
  height?: number
  innerRadius?: number
  outerRadius?: number
}

export function DonutChart({
  data,
  showCenterLabel = true,
  showPercentLabel = true,
  height = 300,
  innerRadius = 65,
  outerRadius = 100,
}: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const centerX = 150 // aprox, ResponsiveContainer lo ajusta

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
          labelLine={showPercentLabel}
          label={showPercentLabel ? renderCustomLabel : undefined}
        >
          {data.map((_, index) => (
            <Cell
              key={index}
              fill={COLORS[index % COLORS.length]}
              stroke="hsl(var(--background))"
              strokeWidth={2}
            />
          ))}
        </Pie>

        <Tooltip
          formatter={(value: number, name: string) => [
            `${value.toLocaleString()} (${((value / total) * 100).toFixed(1)}%)`,
            name,
          ]}
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 8,
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

// Versión simple sin label central (PieChart normal):
export function SimplePieChart({ data, height = 280 }: { data: PieDataPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={90}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [value.toLocaleString(), '']}
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 8,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
```

---

## MetricCard — Número grande + Trend Indicator + Sparkline

```typescript
// components/dashboard/MetricCard.tsx
'use client'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'
import { cn } from '@/lib/utils'

type Trend = 'up' | 'down' | 'neutral'

interface MetricCardProps {
  title: string
  value: string | number
  change?: number          // porcentaje, ej: 12.5 o -3.2
  trend?: Trend
  subtitle?: string
  prefix?: string          // ej: "$"
  suffix?: string          // ej: "%"
  sparklineData?: number[] // últimos N valores para el sparkline
  loading?: boolean
}

function Sparkline({ data, trend }: { data: number[]; trend?: Trend }) {
  const color =
    trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : 'hsl(var(--muted-foreground))'
  const chartData = data.map((v, i) => ({ i, v }))

  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
        <Tooltip
          content={() => null} // sin tooltip en el sparkline
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function MetricCard({
  title,
  value,
  change,
  trend,
  subtitle,
  prefix,
  suffix,
  sparklineData,
  loading,
}: MetricCardProps) {
  if (loading) return <MetricCardSkeleton />

  const trendColor =
    trend === 'up'
      ? 'text-emerald-600 dark:text-emerald-400'
      : trend === 'down'
        ? 'text-red-600 dark:text-red-400'
        : 'text-muted-foreground'

  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  const formattedValue =
    typeof value === 'number' ? value.toLocaleString('es') : value

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
      </div>

      <div className="mt-2 flex items-baseline gap-1">
        {prefix && <span className="text-lg text-muted-foreground">{prefix}</span>}
        <span className="text-3xl font-bold tracking-tight tabular-nums">{formattedValue}</span>
        {suffix && <span className="text-lg text-muted-foreground">{suffix}</span>}
      </div>

      {change !== undefined && (
        <div className={cn('mt-2 flex items-center gap-1 text-sm font-medium', trendColor)}>
          <TrendIcon className="h-4 w-4" />
          <span>
            {change > 0 ? '+' : ''}
            {change.toFixed(1)}% vs período anterior
          </span>
        </div>
      )}

      {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}

      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-3 -mx-1">
          <Sparkline data={sparklineData} trend={trend} />
        </div>
      )}
    </div>
  )
}

function MetricCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border bg-card p-6 shadow-sm">
      <div className="h-4 w-24 rounded bg-muted" />
      <div className="mt-2 h-8 w-32 rounded bg-muted" />
      <div className="mt-2 h-4 w-40 rounded bg-muted" />
    </div>
  )
}

// Uso:
// <MetricCard
//   title="Revenue mensual"
//   value={48352}
//   prefix="$"
//   change={12.5}
//   trend="up"
//   sparklineData={[3200, 3800, 4100, 4700, 5200, 4900, 5400]}
// />
```

---

## StatCard — Comparación con Período Anterior

```typescript
// components/dashboard/StatCard.tsx
import { ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  current: number
  previous: number
  prefix?: string
  suffix?: string
  formatValue?: (v: number) => string
  invertColors?: boolean // Para métricas donde bajar es bueno (errores, churn)
}

export function StatCard({
  title,
  current,
  previous,
  prefix = '',
  suffix = '',
  formatValue = (v) => v.toLocaleString('es'),
  invertColors = false,
}: StatCardProps) {
  const delta = previous === 0 ? 0 : ((current - previous) / previous) * 100
  const isPositive = delta > 0
  const isNeutral = delta === 0

  // invertColors: si bajar es bueno (errores), el rojo/verde se invierte
  const colorClass = isNeutral
    ? 'text-muted-foreground'
    : (isPositive && !invertColors) || (!isPositive && invertColors)
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-red-600 dark:text-red-400'

  const bgClass = isNeutral
    ? 'bg-muted/50'
    : (isPositive && !invertColors) || (!isPositive && invertColors)
      ? 'bg-emerald-50 dark:bg-emerald-950/30'
      : 'bg-red-50 dark:bg-red-950/30'

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>

      <p className="mt-1 text-2xl font-bold tabular-nums">
        {prefix}
        {formatValue(current)}
        {suffix}
      </p>

      <div className={cn('mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold', colorClass, bgClass)}>
        {!isNeutral && (
          isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
        )}
        {isNeutral ? '—' : `${Math.abs(delta).toFixed(1)}%`}
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Anterior: {prefix}
        {formatValue(previous)}
        {suffix}
      </p>
    </div>
  )
}

// Uso:
// <StatCard title="Errores" current={3} previous={8} invertColors />
// <StatCard title="Revenue" current={48352} previous={42100} prefix="$" />
```

---

## Tremor Equivalents

```bash
npm install @tremor/react
```

```typescript
// Tremor: AreaChart
import { AreaChart, Card, Title } from '@tremor/react'

<Card>
  <Title>Revenue</Title>
  <AreaChart
    data={chartData}
    index="date"
    categories={['actual', 'previo']}
    colors={['indigo', 'gray']}
    valueFormatter={(v) => `$${v.toLocaleString()}`}
    yAxisWidth={60}
    showLegend
    showAnimation
  />
</Card>

// Tremor: BarChart
import { BarChart } from '@tremor/react'

<BarChart
  data={data}
  index="name"
  categories={['q1', 'q2', 'q3']}
  colors={['violet', 'indigo', 'blue']}
  stack={false}  // true para stacked
  yAxisWidth={48}
/>

// Tremor: DonutChart
import { DonutChart, Legend } from '@tremor/react'

<DonutChart
  data={donutData}
  category="value"
  index="name"
  colors={['indigo', 'violet', 'fuchsia', 'cyan']}
  valueFormatter={(v) => `${v} usuarios`}
  showAnimation
/>

// Tremor: Metric + BadgeDelta
import { Card, Metric, Text, BadgeDelta, Flex } from '@tremor/react'

<Card>
  <Text>Monthly Revenue</Text>
  <Flex alignItems="end" justifyContent="between">
    <Metric>$48,352</Metric>
    <BadgeDelta deltaType="increase" size="xl">12.5%</BadgeDelta>
  </Flex>
</Card>

// Tremor es ideal para: prototipos rápidos, admin panels internos
// Recharts es mejor para: diseño custom, control total, apps con diseño propio
```
