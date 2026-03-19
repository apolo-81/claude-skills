# Auth Patterns — Supabase + Next.js App Router

## Email/Password Signup

### Server Action (recommended — no API route needed)

```typescript
// app/auth/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export async function signup(formData: FormData) {
  const parsed = SignupSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: 'Invalid email or password (min 8 chars)' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      // Optional: pass metadata to the profiles trigger
      data: { full_name: formData.get('full_name') as string },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) return { error: error.message }

  // If email confirmation is required, tell the user
  return { success: 'Check your email to confirm your account.' }
}
```

### Signup Form Component

```tsx
// app/signup/page.tsx
'use client'
import { useActionState } from 'react'
import { signup } from '@/app/auth/actions'

type State = { error?: string; success?: string } | null

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState<State, FormData>(
    signup,
    null
  )

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-bold">Create account</h1>

      <input
        name="full_name"
        type="text"
        placeholder="Full name"
        className="border rounded px-3 py-2"
        required
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        className="border rounded px-3 py-2"
        required
      />
      <input
        name="password"
        type="password"
        placeholder="Password (min 8 chars)"
        className="border rounded px-3 py-2"
        required
        minLength={8}
      />

      {state?.error && (
        <p className="text-red-600 text-sm">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-green-600 text-sm">{state.success}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
      >
        {isPending ? 'Creating account...' : 'Sign up'}
      </button>
    </form>
  )
}
```

---

## Email/Password Login

```typescript
// app/auth/actions.ts (add to same file)
export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: error.message }

  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
```

```tsx
// app/login/page.tsx
'use client'
import { useActionState } from 'react'
import { login } from '@/app/auth/actions'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null)

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-bold">Sign in</h1>

      <input name="email" type="email" placeholder="Email"
        className="border rounded px-3 py-2" required />
      <input name="password" type="password" placeholder="Password"
        className="border rounded px-3 py-2" required />

      {state?.error && <p className="text-red-600 text-sm">{state.error}</p>}

      <button type="submit" disabled={isPending}
        className="bg-black text-white rounded px-4 py-2 disabled:opacity-50">
        {isPending ? 'Signing in...' : 'Sign in'}
      </button>

      <a href="/forgot-password" className="text-sm text-center text-gray-500">
        Forgot password?
      </a>
    </form>
  )
}
```

---

## OAuth (Google, GitHub)

### Enable in Supabase Dashboard

1. Go to Authentication → Providers
2. Enable Google / GitHub
3. Add Client ID and Secret from the provider's developer console
4. Copy the callback URL shown (`https://xxxx.supabase.co/auth/v1/callback`) → paste into the OAuth app's "Authorized redirect URIs"

### Trigger OAuth from Client Component

```tsx
// components/OAuthButtons.tsx
'use client'
import { createClient } from '@/lib/supabase/client'

export function GoogleSignInButton() {
  async function handleGoogleSignIn() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    // Supabase redirects the browser — no further action needed here
  }

  return (
    <button onClick={handleGoogleSignIn}
      className="flex items-center gap-2 border rounded px-4 py-2 hover:bg-gray-50">
      Sign in with Google
    </button>
  )
}
```

### Auth Callback Route — `app/auth/callback/route.ts`

This route is required — Supabase redirects back here with the code after OAuth.

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
```

---

## Password Reset Flow

### Step 1: Request reset email

```typescript
// app/auth/actions.ts
export async function requestPasswordReset(formData: FormData) {
  const email = formData.get('email') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  })

  // Always return success to avoid email enumeration
  if (error) console.error(error)
  return { success: 'If that email exists, a reset link has been sent.' }
}
```

### Step 2: Update password (after clicking email link)

```typescript
// app/auth/reset-password/page.tsx — Client Component
'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Password updated!')
      setTimeout(() => router.push('/dashboard'), 1500)
    }
  }

  return (
    <form onSubmit={handleReset} className="flex flex-col gap-4 max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-bold">New password</h1>
      <input type="password" value={password} onChange={e => setPassword(e.target.value)}
        placeholder="New password (min 8 chars)" className="border rounded px-3 py-2"
        required minLength={8} />
      {message && <p className="text-sm">{message}</p>}
      <button type="submit" className="bg-black text-white rounded px-4 py-2">
        Update password
      </button>
    </form>
  )
}
```

---

## Protected Routes Middleware (Complete)

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/settings', '/profile']
// Routes that require the user to be a guest (redirect if logged in)
const AUTH_ROUTES = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: use getUser(), not getSession() — getUser() verifies the JWT server-side
  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route))
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route))

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname) // preserve intended destination
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
```

---

## useUser Hook (Client Components)

```typescript
// hooks/useUser.ts
'use client'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
```

Usage:
```tsx
'use client'
import { useUser } from '@/hooks/useUser'

export function NavBar() {
  const { user, loading } = useUser()
  if (loading) return null
  return <div>{user ? user.email : <a href="/login">Sign in</a>}</div>
}
```

---

## Email Confirmation Callback

When `supabase.auth.signUp` sends a confirmation email, configure `emailRedirectTo` to point to your `/auth/callback` route (shown above). The same route handles both OAuth and email confirmation — no additional setup needed.

Enable or disable email confirmation in: Supabase Dashboard → Authentication → Settings → "Enable email confirmations".
