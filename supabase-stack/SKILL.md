---
name: supabase-stack
description: >
  Use when building web apps that need a backend without a custom server: auth,
  database, storage, real-time, or edge functions. Trigger when user mentions
  Supabase, needs login/signup, user authentication, database for web app,
  file uploads, real-time updates, or wants a full-stack app without backend code.
  Also trigger for: "quiero guardar datos de usuarios", "necesito una base de datos
  para mi app", "auth para mi next.js", "registro de usuarios", row-level security,
  PostgreSQL for web app, Supabase Storage, Supabase Realtime, Edge Functions.
---

# Supabase Stack — Next.js App Router

## 1. Overview

Supabase is a PostgreSQL-backed BaaS (Backend-as-a-Service) that provides Auth, Database (Postgres + RLS), Storage, Realtime, and Edge Functions through a single hosted platform.

**Choose Supabase when:**
- You need Auth + database + storage without managing servers
- You want SQL power (joins, RLS, triggers, full-text search)
- Your app needs real-time updates
- You prefer open-source and can self-host later

**Choose something else when:**
- Firebase: you need native mobile SDKs with offline-first sync as the primary concern
- PlanetScale/Neon: you only need a database (no auth/storage)
- Custom backend: you need complex business logic, microservices, or non-HTTP protocols

**Decision tree:**
```
Need login + DB + storage? → Supabase
Need only a database?      → Neon or PlanetScale
Need ML/vector search?     → Supabase pgvector (still Supabase)
Need serverless functions? → API Routes + Supabase client (skip Edge Functions unless latency critical)
```

**Target stack:** Next.js 15 App Router + TypeScript + Tailwind + Supabase v2

---

## 2. Setup & Configuration

### Install

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...          # safe to expose — enforced by RLS
SUPABASE_SERVICE_ROLE_KEY=eyJ...              # NEVER expose client-side
```

The `anon` key is intentionally public — Row Level Security is the enforcement layer. The `service_role` key bypasses RLS entirely; keep it server-only.

### Browser Client — `lib/supabase/client.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Server Client — `lib/supabase/server.ts`

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
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
}
```

Use `createClient` from `server.ts` in Server Components, Server Actions, and Route Handlers. Use `client.ts` only inside Client Components.

---

## 3. Authentication

See `references/auth-patterns.md` for complete flows. Core pattern:

### Middleware — `middleware.ts` (root of project)

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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

  const { data: { user } } = await supabase.auth.getUser()

  // Redirect unauthenticated users away from protected routes
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

### Get user in Server Component

```typescript
// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return <div>Welcome {user.email}</div>
}
```

---

## 4. Database (PostgreSQL)

### Generate TypeScript types

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
```

Run this after every schema change.

### Core CRUD

```typescript
const supabase = await createClient()

// SELECT with filter
const { data, error } = await supabase
  .from('posts')
  .select('id, title, created_at, profiles(username)')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .range(0, 9) // pagination: first 10 items

// INSERT
const { data, error } = await supabase
  .from('posts')
  .insert({ title: 'Hello', user_id: user.id })
  .select()
  .single()

// UPDATE
const { error } = await supabase
  .from('posts')
  .update({ title: 'Updated' })
  .eq('id', postId)
  .eq('user_id', user.id) // always scope updates to the owner

// DELETE
const { error } = await supabase
  .from('posts')
  .delete()
  .eq('id', postId)
```

### Row Level Security — why it is critical

RLS is your server-side authorization layer. Without it, anyone with your anon key can read all data from all users. **Always enable RLS on every table containing user data.**

See `references/rls-patterns.md` for complete SQL policies.

Quick enable + common policy:

```sql
-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Users see only their own rows
CREATE POLICY "own_posts" ON posts
  FOR ALL USING (auth.uid() = user_id);
```

### Real-time subscriptions (Client Component)

```typescript
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function LivePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('posts-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        (payload) => {
          if (payload.eventType === 'INSERT')
            setPosts(prev => [payload.new as Post, ...prev])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>
}
```

---

## 5. Storage

```typescript
const supabase = createClient() // browser client for uploads

// Upload (with progress via XMLHttpRequest if needed)
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${user.id}/avatar.png`, file, {
    cacheControl: '3600',
    upsert: true,
  })

// Public URL (for public buckets)
const { data: { publicUrl } } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${user.id}/avatar.png`)

// Signed URL (for private buckets, expires in 60s)
const { data, error } = await supabase.storage
  .from('documents')
  .createSignedUrl(`${user.id}/report.pdf`, 60)
```

**Bucket types:** Public buckets serve files without auth (good for avatars, public assets). Private buckets require signed URLs or service_role access (good for user documents, invoices).

See `references/schema-patterns.md` for the complete avatar upload + DB record pattern.

---

## 6. Edge Functions

Use Edge Functions when you need server-side logic that runs close to the user, handles webhooks (Stripe, n8n), or requires the `service_role` key without exposing it via API Routes.

For most cases, **Next.js Route Handlers are sufficient**. Prefer them for simplicity.

```typescript
// When to use Edge Functions:
// - Stripe webhooks (need raw body + secret verification)
// - Scheduled jobs via Supabase cron
// - Logic that must run outside Next.js (e.g., called from n8n)

// Invoke from client:
const { data, error } = await supabase.functions.invoke('send-email', {
  body: { to: 'user@example.com', subject: 'Welcome' },
})
```

---

## 7. Common Patterns

### User Profiles (synced with auth.users)

Create a `profiles` table that mirrors `auth.users` via a database trigger. This keeps user data in your public schema where you can join it freely.

See `references/schema-patterns.md` → "Profiles pattern" for the complete SQL.

### File Upload + DB Record (atomic-ish)

```typescript
async function uploadDocument(file: File, userId: string) {
  const supabase = createClient()
  const path = `${userId}/${Date.now()}-${file.name}`

  // 1. Upload file
  const { error: uploadError } = await supabase.storage
    .from('documents').upload(path, file)
  if (uploadError) throw uploadError

  // 2. Record in database
  const { data, error: dbError } = await supabase
    .from('documents')
    .insert({ user_id: userId, storage_path: path, name: file.name })
    .select().single()
  if (dbError) {
    // Rollback: delete the uploaded file
    await supabase.storage.from('documents').remove([path])
    throw dbError
  }

  return data
}
```

### Error Handling

```typescript
const { data, error } = await supabase.from('posts').select()

if (error) {
  // error.code: Postgres error code (e.g., '23505' = unique violation)
  // error.message: human-readable
  // error.details: additional context
  console.error(`[Supabase] ${error.code}: ${error.message}`)
  throw new Error(error.message)
}
```

---

## 8. Security Checklist

- Never import or use `SUPABASE_SERVICE_ROLE_KEY` in Client Components or any file with `'use client'`
- Enable RLS on every table before adding data — not after
- Add `USING` clauses that reference `auth.uid()` — never trust client-supplied user IDs
- Validate data in Server Actions / Route Handlers even when RLS is enabled (defense in depth)
- Set bucket policies in addition to storage RLS for fine-grained control
- Use `supabase.auth.getUser()` (makes a network call to verify JWT) — not `getSession()` — in Server Components for auth checks

---

## 9. References

| File | Content |
|------|---------|
| `references/auth-patterns.md` | Signup, login, OAuth, password reset, protected routes middleware |
| `references/rls-patterns.md` | Common RLS policies with full SQL and explanations |
| `references/schema-patterns.md` | Table schemas: profiles, posts, files, notifications, multi-tenant |
