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

**Target stack:** Next.js 15 App Router + TypeScript + Tailwind + Supabase v2

**Decision tree:**
```
Need login + DB + storage? -> Supabase
Need only a database?      -> Neon or PlanetScale
Need ML/vector search?     -> Supabase pgvector
Need serverless functions?  -> API Routes + Supabase client (Edge Functions only if latency critical)
```

---

## 1. Setup

```bash
npm install @supabase/supabase-js @supabase/ssr
```

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...          # safe to expose — enforced by RLS
SUPABASE_SERVICE_ROLE_KEY=eyJ...              # NEVER expose client-side
```

The `anon` key is intentionally public — RLS is the enforcement layer. The `service_role` key bypasses RLS; keep it server-only.

Ver `references/client-setup.md` para browser client, server client, and auth middleware code.

Use server client in Server Components, Server Actions, Route Handlers. Browser client only in Client Components.

---

## 2. Authentication

Ver `references/auth-patterns.md` para complete signup, login, OAuth, password reset flows.

**Get user in Server Component:**
```typescript
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/login')
```

**Key rule:** Use `supabase.auth.getUser()` (network call, verifies JWT) not `getSession()` in Server Components.

---

## 3. Database (PostgreSQL)

### Generate TypeScript Types

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
```

Run after every schema change.

### Core CRUD

```typescript
// SELECT with join + pagination
const { data, error } = await supabase
  .from('posts')
  .select('id, title, created_at, profiles(username)')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .range(0, 9)

// INSERT
const { data, error } = await supabase
  .from('posts').insert({ title: 'Hello', user_id: user.id }).select().single()

// UPDATE — always scope to owner
const { error } = await supabase
  .from('posts').update({ title: 'Updated' }).eq('id', postId).eq('user_id', user.id)

// DELETE
const { error } = await supabase.from('posts').delete().eq('id', postId)
```

### Row Level Security

**Always enable RLS on every table with user data.** Without it, anyone with the anon key can read all data.

```sql
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_posts" ON posts FOR ALL USING (auth.uid() = user_id);
```

Ver `references/rls-patterns.md` para complete SQL policies.

### Real-time Subscriptions

Ver `references/client-setup.md` para LivePosts component example.

---

## 4. Storage

Ver `references/client-setup.md` para upload, public URL, signed URL, and file upload + DB record pattern.

**Bucket types:** Public (avatars, public assets — no auth). Private (documents, invoices — signed URLs or service_role).

---

## 5. Edge Functions

Prefer Next.js Route Handlers for most cases. Use Edge Functions for:
- Stripe webhooks (raw body + secret verification)
- Scheduled jobs via Supabase cron
- Logic called from outside Next.js (e.g., n8n)

```typescript
const { data, error } = await supabase.functions.invoke('send-email', {
  body: { to: 'user@example.com', subject: 'Welcome' },
})
```

---

## 6. Error Handling

```typescript
const { data, error } = await supabase.from('posts').select()
if (error) {
  // error.code: Postgres code (e.g., '23505' = unique violation)
  // error.message: human-readable
  console.error(`[Supabase] ${error.code}: ${error.message}`)
  throw new Error(error.message)
}
```

---

## 7. Security Checklist

- Never use `SUPABASE_SERVICE_ROLE_KEY` in Client Components or `'use client'` files
- Enable RLS on every table **before** adding data
- `USING` clauses must reference `auth.uid()` — never trust client-supplied user IDs
- Validate data in Server Actions/Route Handlers even with RLS (defense in depth)
- Set bucket policies in addition to storage RLS
- Use `getUser()` not `getSession()` in Server Components

---

## 8. References

| File | Content |
|------|---------|
| `references/auth-patterns.md` | Signup, login, OAuth, password reset, protected routes |
| `references/rls-patterns.md` | Common RLS policies with full SQL |
| `references/schema-patterns.md` | Table schemas: profiles, posts, files, notifications, multi-tenant |
| `references/client-setup.md` | Browser/server clients, middleware, real-time, storage, file upload |
