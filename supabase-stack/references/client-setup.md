# Client Setup & Middleware Code

## Browser Client — `lib/supabase/client.ts`

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

## Server Client — `lib/supabase/server.ts`

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

## Auth Middleware — `middleware.ts`

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
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

## Real-time Subscription (Client Component)

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

## Storage Patterns

```typescript
const supabase = createClient()

// Upload
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${user.id}/avatar.png`, file, { cacheControl: '3600', upsert: true })

// Public URL
const { data: { publicUrl } } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${user.id}/avatar.png`)

// Signed URL (private, expires in 60s)
const { data, error } = await supabase.storage
  .from('documents')
  .createSignedUrl(`${user.id}/report.pdf`, 60)
```

## File Upload + DB Record (with rollback)

```typescript
async function uploadDocument(file: File, userId: string) {
  const supabase = createClient()
  const path = `${userId}/${Date.now()}-${file.name}`

  const { error: uploadError } = await supabase.storage.from('documents').upload(path, file)
  if (uploadError) throw uploadError

  const { data, error: dbError } = await supabase
    .from('documents')
    .insert({ user_id: userId, storage_path: path, name: file.name })
    .select().single()
  if (dbError) {
    await supabase.storage.from('documents').remove([path])
    throw dbError
  }
  return data
}
```
