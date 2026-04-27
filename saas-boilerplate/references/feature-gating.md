# Feature Gating por Plan

Stack: Next.js 15 App Router, Supabase, TypeScript, Tailwind CSS

---

## lib/plans.ts

```typescript
export type Plan = 'free' | 'pro' | 'enterprise'

export interface PlanLimits {
  projects: number        // -1 = unlimited
  teamMembers: number
  apiAccess: boolean
  customDomain: boolean
  prioritySupport: boolean
  analyticsRetentionDays: number
  storageGB: number
  exportFormats: string[]
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    projects: 3,
    teamMembers: 1,
    apiAccess: false,
    customDomain: false,
    prioritySupport: false,
    analyticsRetentionDays: 7,
    storageGB: 1,
    exportFormats: ['csv'],
  },
  pro: {
    projects: 50,
    teamMembers: 10,
    apiAccess: true,
    customDomain: true,
    prioritySupport: false,
    analyticsRetentionDays: 90,
    storageGB: 20,
    exportFormats: ['csv', 'xlsx', 'pdf'],
  },
  enterprise: {
    projects: -1,
    teamMembers: -1,
    apiAccess: true,
    customDomain: true,
    prioritySupport: true,
    analyticsRetentionDays: -1,
    storageGB: -1,
    exportFormats: ['csv', 'xlsx', 'pdf', 'json'],
  },
}

export const PLAN_DISPLAY_NAMES: Record<Plan, string> = {
  free: 'Gratis',
  pro: 'Pro',
  enterprise: 'Enterprise',
}

/** Returns the lowest plan that satisfies a given feature check */
export function lowestPlanWith(feature: keyof PlanLimits): Plan {
  const order: Plan[] = ['free', 'pro', 'enterprise']
  for (const plan of order) {
    const val = PLAN_LIMITS[plan][feature]
    if (val === true || (typeof val === 'number' && val !== 0)) return plan
  }
  return 'enterprise'
}
```

---

## lib/feature-access.ts

```typescript
import { createClient } from '@/lib/supabase/server'
import { PLAN_LIMITS, Plan, PlanLimits } from './plans'

interface AccessResult {
  allowed: boolean
  plan: Plan
  limit: PlanLimits[keyof PlanLimits]
  current?: number
}

export async function checkFeatureAccess(
  feature: keyof PlanLimits,
  orgId: string,
  currentUsage?: number
): Promise<AccessResult> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('organization_id', orgId)
    .single()

  const plan: Plan = (data?.plan as Plan) ?? 'free'
  const isActive = !data || ['active', 'trialing'].includes(data.status)

  // Downgrade to free if subscription is not active
  const effectivePlan: Plan = isActive ? plan : 'free'
  const limit = PLAN_LIMITS[effectivePlan][feature]

  let allowed: boolean
  if (typeof limit === 'boolean') {
    allowed = limit
  } else if (limit === -1) {
    allowed = true // unlimited
  } else if (typeof currentUsage === 'number') {
    allowed = currentUsage < (limit as number)
  } else {
    allowed = true
  }

  return { allowed, plan: effectivePlan, limit, current: currentUsage }
}

/** Convenience: check numeric usage limit */
export async function checkUsageLimit(
  feature: keyof PlanLimits,
  orgId: string,
  currentUsage: number
): Promise<{ allowed: boolean; limit: number; plan: Plan }> {
  const result = await checkFeatureAccess(feature, orgId, currentUsage)
  return {
    allowed: result.allowed,
    limit: result.limit as number,
    plan: result.plan,
  }
}
```

---

## hooks/useFeatureAccess.ts

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PLAN_LIMITS, Plan, PlanLimits } from '@/lib/plans'

interface UseFeatureAccessResult {
  allowed: boolean | null  // null = loading
  plan: Plan | null
  limit: PlanLimits[keyof PlanLimits] | null
  loading: boolean
}

export function useFeatureAccess(
  feature: keyof PlanLimits,
  orgId: string,
  currentUsage?: number
): UseFeatureAccessResult {
  const [result, setResult] = useState<UseFeatureAccessResult>({
    allowed: null,
    plan: null,
    limit: null,
    loading: true,
  })
  const supabase = createClient()

  useEffect(() => {
    if (!orgId) return

    const check = async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('plan, status')
        .eq('organization_id', orgId)
        .single()

      const plan: Plan = (data?.plan as Plan) ?? 'free'
      const isActive = !data || ['active', 'trialing'].includes(data.status ?? '')
      const effectivePlan: Plan = isActive ? plan : 'free'
      const limit = PLAN_LIMITS[effectivePlan][feature]

      let allowed: boolean
      if (typeof limit === 'boolean') {
        allowed = limit
      } else if (limit === -1) {
        allowed = true
      } else if (typeof currentUsage === 'number') {
        allowed = currentUsage < (limit as number)
      } else {
        allowed = true
      }

      setResult({ allowed, plan: effectivePlan, limit, loading: false })
    }

    check()
  }, [orgId, feature, currentUsage])

  return result
}
```

---

## components/FeatureGate.tsx

```typescript
'use client'

import { ReactNode } from 'react'
import { useFeatureAccess } from '@/hooks/useFeatureAccess'
import { UpgradePrompt } from './UpgradePrompt'
import { PlanLimits } from '@/lib/plans'

interface Props {
  feature: keyof PlanLimits
  orgId: string
  currentUsage?: number
  children: ReactNode
  /** Custom fallback — defaults to <UpgradePrompt> */
  fallback?: ReactNode
}

export function FeatureGate({ feature, orgId, currentUsage, children, fallback }: Props) {
  const { allowed, plan, loading } = useFeatureAccess(feature, orgId, currentUsage)

  if (loading) {
    return (
      <div className="animate-pulse rounded-lg bg-gray-100 h-20 w-full" />
    )
  }

  if (!allowed) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <UpgradePrompt feature={feature} currentPlan={plan!} />
    )
  }

  return <>{children}</>
}
```

---

## components/UpgradePrompt.tsx

```typescript
'use client'

import { useRouter } from 'next/navigation'
import { PlanLimits, Plan, PLAN_DISPLAY_NAMES, lowestPlanWith } from '@/lib/plans'

interface Props {
  feature: keyof PlanLimits
  currentPlan: Plan
  orgId?: string
  variant?: 'banner' | 'modal'
}

const FEATURE_LABELS: Partial<Record<keyof PlanLimits, string>> = {
  apiAccess: 'Acceso a la API',
  customDomain: 'Dominio personalizado',
  prioritySupport: 'Soporte prioritario',
  projects: 'Proyectos adicionales',
  teamMembers: 'Miembros adicionales',
  analyticsRetentionDays: 'Historial de analíticas extendido',
  exportFormats: 'Exportación avanzada',
}

export function UpgradePrompt({ feature, currentPlan, orgId, variant = 'banner' }: Props) {
  const router = useRouter()
  const requiredPlan = lowestPlanWith(feature)
  const featureLabel = FEATURE_LABELS[feature] ?? String(feature)

  const handleUpgrade = () => {
    if (orgId) {
      router.push(`/settings/billing?upgrade=${requiredPlan}&orgId=${orgId}`)
    } else {
      router.push('/settings/billing')
    }
  }

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Actualiza tu plan</h3>
            <p className="text-sm text-gray-500">
              <strong>{featureLabel}</strong> está disponible en el plan{' '}
              <strong>{PLAN_DISPLAY_NAMES[requiredPlan]}</strong> y superiores.
            </p>
          </div>
          <button
            onClick={handleUpgrade}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Ver planes — desde $29/mes
          </button>
        </div>
      </div>
    )
  }

  // Default: banner
  return (
    <div className="flex items-center gap-3 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
      <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      <p className="text-sm text-indigo-700 flex-1">
        <strong>{featureLabel}</strong> requiere el plan{' '}
        <strong>{PLAN_DISPLAY_NAMES[requiredPlan]}</strong>.
      </p>
      <button
        onClick={handleUpgrade}
        className="shrink-0 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors"
      >
        Actualizar
      </button>
    </div>
  )
}
```

---

## components/UsageBar.tsx

```typescript
'use client'

import { useFeatureAccess } from '@/hooks/useFeatureAccess'
import { PlanLimits } from '@/lib/plans'
import { useRouter } from 'next/navigation'

interface Props {
  feature: keyof PlanLimits
  orgId: string
  currentUsage: number
  label?: string
}

export function UsageBar({ feature, orgId, currentUsage, label }: Props) {
  const { limit, plan, loading } = useFeatureAccess(feature, orgId, currentUsage)
  const router = useRouter()

  if (loading) return <div className="animate-pulse h-8 w-full rounded bg-gray-100" />

  const isUnlimited = limit === -1 || limit === true || limit === false
  const maxVal = isUnlimited ? 0 : (limit as number)
  const percentage = isUnlimited ? 0 : Math.min((currentUsage / maxVal) * 100, 100)
  const isAtLimit = !isUnlimited && currentUsage >= maxVal
  const isNearLimit = !isUnlimited && percentage >= 80

  const barColor = isAtLimit
    ? 'bg-red-500'
    : isNearLimit
    ? 'bg-amber-500'
    : 'bg-indigo-500'

  if (isUnlimited) {
    return (
      <div className="text-sm text-gray-500">
        {label ?? String(feature)}: <span className="font-medium text-gray-700">{currentUsage} / ilimitado</span>
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">{label ?? String(feature)}</span>
        <span className={`font-medium ${isAtLimit ? 'text-red-600' : 'text-gray-700'}`}>
          {currentUsage}/{maxVal}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isAtLimit && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-red-600 font-medium">
            {currentUsage}/{maxVal} usados — Actualiza para más
          </p>
          <button
            onClick={() => router.push(`/settings/billing?orgId=${orgId}`)}
            className="text-xs text-indigo-600 font-medium hover:underline"
          >
            Actualizar
          </button>
        </div>
      )}
      {isNearLimit && !isAtLimit && (
        <p className="text-xs text-amber-600">
          Cerca del límite — {maxVal - currentUsage} restantes
        </p>
      )}
    </div>
  )
}
```

---

## Uso en Server Actions

```typescript
// app/actions/projects.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { checkUsageLimit } from '@/lib/feature-access'
import { revalidatePath } from 'next/cache'

export async function createProject(orgId: string, name: string) {
  const supabase = await createClient()

  // 1. Get current count
  const { count } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId)

  // 2. Check limit
  const { allowed, limit, plan } = await checkUsageLimit('projects', orgId, count ?? 0)

  if (!allowed) {
    return {
      error: `Limite de proyectos alcanzado (${limit} en plan ${plan}). Actualiza para crear mas.`,
    }
  }

  // 3. Create
  const { data, error } = await supabase
    .from('projects')
    .insert({ organization_id: orgId, name })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/projects')
  return { data }
}
```

---

## Uso en API Routes

```typescript
// app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkFeatureAccess } from '@/lib/feature-access'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orgId, name } = await req.json()

  // Check API access feature flag
  const apiAccess = await checkFeatureAccess('apiAccess', orgId)
  if (!apiAccess.allowed) {
    return NextResponse.json(
      { error: 'API access requires Pro plan or higher', requiredPlan: 'pro' },
      { status: 403 }
    )
  }

  // Check projects usage limit
  const { count } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId)

  const usageCheck = await checkFeatureAccess('projects', orgId, count ?? 0)
  if (!usageCheck.allowed) {
    return NextResponse.json(
      { error: `Projects limit reached (${usageCheck.limit} on ${usageCheck.plan} plan)`, requiredPlan: 'pro' },
      { status: 403 }
    )
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({ organization_id: orgId, name })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}
```

---

## Ejemplo de uso en componentes

```typescript
// Gating por feature flag booleano
<FeatureGate feature="apiAccess" orgId={orgId}>
  <ApiKeysPanel orgId={orgId} />
</FeatureGate>

// Gating por limite numerico
<FeatureGate feature="projects" orgId={orgId} currentUsage={projectCount}>
  <CreateProjectButton />
</FeatureGate>

// Barra de uso en settings/billing
<UsageBar
  feature="projects"
  orgId={orgId}
  currentUsage={projectCount}
  label="Proyectos"
/>
<UsageBar
  feature="teamMembers"
  orgId={orgId}
  currentUsage={memberCount}
  label="Miembros del equipo"
/>
<UsageBar
  feature="storageGB"
  orgId={orgId}
  currentUsage={usedStorage}
  label="Almacenamiento (GB)"
/>
```
