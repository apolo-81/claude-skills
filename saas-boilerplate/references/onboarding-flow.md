# Onboarding Flow — Next.js 15 App Router

Stack: Next.js 15, Supabase, TypeScript, Tailwind CSS

---

## Middleware check

```typescript
// middleware.ts (excerpt — add inside your existing matcher)
import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (c) => c.forEach(({ name, value, options }) => res.cookies.set(name, value, options)),
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', req.url))

  // Skip onboarding check if already on /onboarding
  if (!req.nextUrl.pathname.startsWith('/onboarding')) {
    const { data: progress } = await supabase
      .from('onboarding_progress')
      .select('completed_at')
      .eq('user_id', user.id)
      .single()

    if (progress && progress.completed_at === null) {
      return NextResponse.redirect(new URL('/onboarding', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login|signup).*)'],
}
```

---

## hooks/useOnboarding.ts

```typescript
'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export type OnboardingStep = 0 | 1 | 2 | 3
// 0 = CreateOrg | 1 = InviteTeam | 2 = FirstAction | 3 = Done

interface UseOnboardingReturn {
  currentStep: OnboardingStep
  isLastStep: boolean
  goToNext: () => void
  goToPrev: () => void
  skip: () => void
  complete: () => Promise<void>
  saving: boolean
}

export function useOnboarding(userId: string, orgId: string): UseOnboardingReturn {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(0)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const persist = useCallback(async (step: OnboardingStep) => {
    await supabase
      .from('onboarding_progress')
      .update({ current_step: step, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
  }, [userId, supabase])

  const goToNext = useCallback(() => {
    const next = Math.min(currentStep + 1, 3) as OnboardingStep
    setCurrentStep(next)
    persist(next)
  }, [currentStep, persist])

  const goToPrev = useCallback(() => {
    const prev = Math.max(currentStep - 1, 0) as OnboardingStep
    setCurrentStep(prev)
    persist(prev)
  }, [currentStep, persist])

  const skip = useCallback(() => goToNext(), [goToNext])

  const complete = useCallback(async () => {
    setSaving(true)
    await supabase
      .from('onboarding_progress')
      .update({ completed_at: new Date().toISOString(), current_step: 3 })
      .eq('user_id', userId)
    setSaving(false)
    router.push('/dashboard')
  }, [userId, supabase, router])

  return {
    currentStep,
    isLastStep: currentStep === 2,
    goToNext,
    goToPrev,
    skip,
    complete,
    saving,
  }
}
```

---

## app/onboarding/page.tsx

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OnboardingClient } from './OnboardingClient'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: progress } = await supabase
    .from('onboarding_progress')
    .select('current_step, organization_id, completed_at')
    .eq('user_id', user.id)
    .single()

  if (progress?.completed_at) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <OnboardingClient
          userId={user.id}
          orgId={progress?.organization_id ?? ''}
          initialStep={(progress?.current_step ?? 0) as 0 | 1 | 2 | 3}
        />
      </div>
    </div>
  )
}
```

---

## app/onboarding/OnboardingClient.tsx

```typescript
'use client'

import { StepIndicator } from './components/StepIndicator'
import { CreateOrgStep } from './components/steps/CreateOrgStep'
import { InviteTeamStep } from './components/steps/InviteTeamStep'
import { FirstActionStep } from './components/steps/FirstActionStep'
import { useOnboarding } from '@/hooks/useOnboarding'

const STEPS = ['Tu organización', 'Invita tu equipo', 'Primera acción']

interface Props {
  userId: string
  orgId: string
  initialStep: 0 | 1 | 2 | 3
}

export function OnboardingClient({ userId, orgId, initialStep }: Props) {
  const { currentStep, goToNext, goToPrev, skip, complete, saving } = useOnboarding(userId, orgId)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <StepIndicator steps={STEPS} currentStep={currentStep} />
      </div>

      <div className="p-6">
        {currentStep === 0 && (
          <CreateOrgStep orgId={orgId} onComplete={goToNext} />
        )}
        {currentStep === 1 && (
          <InviteTeamStep orgId={orgId} onComplete={goToNext} onSkip={skip} />
        )}
        {currentStep === 2 && (
          <FirstActionStep orgId={orgId} onComplete={complete} saving={saving} />
        )}
      </div>
    </div>
  )
}
```

---

## app/onboarding/components/StepIndicator.tsx

```typescript
interface Props {
  steps: string[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: Props) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((label, i) => {
        const done = i < currentStep
        const active = i === currentStep
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={[
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                  done   ? 'bg-indigo-600 text-white' : '',
                  active ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : '',
                  !done && !active ? 'bg-gray-100 text-gray-400' : '',
                ].join(' ')}
              >
                {done ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`mt-1 text-xs whitespace-nowrap ${active ? 'text-indigo-600 font-medium' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px flex-1 mx-2 mt-[-10px] transition-colors ${done ? 'bg-indigo-600' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
```

---

## app/onboarding/components/steps/CreateOrgStep.tsx

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  orgId: string
  onComplete: () => void
}

export function CreateOrgStep({ orgId, onComplete }: Props) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    const { error } = await supabase
      .from('organizations')
      .update({ name: name.trim() })
      .eq('id', orgId)
    if (error) { setError(error.message); setSaving(false); return }
    onComplete()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Dale nombre a tu organización</h2>
        <p className="mt-1 text-sm text-gray-500">Puedes cambiarlo después en cualquier momento.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="org-name" className="block text-sm font-medium text-gray-700">
            Nombre de la organización
          </label>
          <input
            id="org-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Acme Corp"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Guardando...' : 'Continuar'}
        </button>
      </form>
    </div>
  )
}
```

---

## app/onboarding/components/steps/InviteTeamStep.tsx

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  orgId: string
  onComplete: () => void
  onSkip: () => void
}

export function InviteTeamStep({ orgId, onComplete, onSkip }: Props) {
  const [emails, setEmails] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    const list = emails.split(',').map((e) => e.trim()).filter(Boolean)
    const { data: { user } } = await supabase.auth.getUser()

    await Promise.all(
      list.map((email) =>
        supabase.from('invitations').upsert(
          { organization_id: orgId, email, role: 'member', invited_by: user!.id },
          { onConflict: 'organization_id,email' }
        )
      )
    )
    setSent(true)
    setSending(false)
    setTimeout(onComplete, 800)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Invita a tu equipo</h2>
        <p className="mt-1 text-sm text-gray-500">Separa los correos con comas. Puedes invitar más personas después.</p>
      </div>

      {sent ? (
        <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Invitaciones enviadas
        </div>
      ) : (
        <form onSubmit={handleInvite} className="space-y-4">
          <textarea
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            placeholder="ana@empresa.com, juan@empresa.com"
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={sending || !emails.trim()}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {sending ? 'Enviando...' : 'Enviar invitaciones'}
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              Omitir
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
```

---

## app/onboarding/components/steps/FirstActionStep.tsx

```typescript
'use client'

interface Props {
  orgId: string
  onComplete: () => Promise<void>
  saving: boolean
}

// Inline SVG illustration — replace with your own asset
function EmptyIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="120" rx="60" fill="#EEF2FF" />
      <rect x="30" y="45" width="60" height="40" rx="4" fill="#C7D2FE" />
      <rect x="38" y="35" width="44" height="14" rx="3" fill="#818CF8" />
      <circle cx="60" cy="85" r="6" fill="#4F46E5" />
      <rect x="57" y="55" width="6" height="18" rx="3" fill="#4F46E5" />
      <rect x="51" y="61" width="18" height="6" rx="3" fill="#4F46E5" />
    </svg>
  )
}

export function FirstActionStep({ orgId, onComplete, saving }: Props) {
  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <EmptyIllustration />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Crea tu primer proyecto</h2>
        <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
          Todo empieza con un proyecto. Puedes añadir miembros, tareas y más una vez que lo crees.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <button
          onClick={onComplete}
          disabled={saving}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Guardando...' : 'Crear mi primer proyecto'}
        </button>
        <button
          onClick={onComplete}
          disabled={saving}
          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
        >
          Ir al dashboard sin crear
        </button>
      </div>
    </div>
  )
}
```
