---
name: auth-patterns
description: >
  Autenticación en Next.js: NextAuth v5 (Auth.js), JWT, sesiones, middleware y RBAC.
  Stack: Next.js App Router + NextAuth v5 / Supabase Auth / JWT custom.
  Usar cuando: "NextAuth", "Auth.js", "login", "sesión", "JWT", "middleware de auth",
  "proteger rutas", "RBAC", "roles y permisos", "OAuth", "credentials provider",
  "useSession", "getServerSession", "auth middleware", "redirect si no autenticado".
---

# Auth Patterns — Next.js App Router

Stack: **NextAuth v5 (Auth.js) + Prisma / Supabase** como adapter.

> Para proyectos con Supabase como DB principal, ver también `supabase-stack` (tiene su propio sistema de auth con RLS).

---

## 1. Decision Tree

```
¿Usas Supabase como DB?
├── SÍ → Supabase Auth (ver supabase-stack)
└── NO
    ├── ¿OAuth (Google, GitHub) + credentials?  → NextAuth v5
    ├── ¿Solo JWT custom (API/Express)?          → JWT manual (Sección 6)
    └── ¿Solo sesiones simples?                  → iron-session
```

---

## 2. NextAuth v5 — Setup

```bash
npm install next-auth@beta @auth/prisma-adapter
```

```typescript
// auth.ts (raíz del proyecto)
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      async authorize(credentials) {
        const parsed = z.object({
          email: z.string().email(),
          password: z.string().min(6),
        }).safeParse(credentials)

        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        })
        if (!user?.password) return null

        const valid = await bcrypt.compare(parsed.data.password, user.password)
        if (!valid) return null

        return { id: user.id, email: user.email, name: user.name, role: user.role }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role  // extender token con campos custom
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as string
      return session
    },
  },
})
```

```typescript
// app/api/auth/[...nextauth]/route.ts
export { handlers as GET, handlers as POST } from '@/auth'
```

---

## 3. Middleware — Proteger rutas

```typescript
// middleware.ts (raíz del proyecto)
import { auth } from '@/auth'
import { NextResponse } from 'next/server'

const PUBLIC_ROUTES = ['/', '/login', '/register', '/api/auth']
const ADMIN_ROUTES = ['/admin']

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r))

  if (!req.auth && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // RBAC: solo admins en /admin
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (req.auth?.user?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/).*)'],
}
```

---

## 4. Sesión en Server Components y API Routes

```typescript
// Server Component
import { auth } from '@/auth'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/login')

  return <div>Hola {session.user.name}</div>
}

// API Route (Server Action)
import { auth } from '@/auth'

export async function getLeads() {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  return prisma.lead.findMany({ where: { userId: session.user.id } })
}
```

---

## 5. Sesión en Client Components

```typescript
'use client'
import { useSession, signIn, signOut } from 'next-auth/react'

export function UserMenu() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <Skeleton />
  if (!session) return <button onClick={() => signIn()}>Login</button>

  return (
    <div>
      <span>{session.user.name}</span>
      <button onClick={() => signOut({ callbackUrl: '/' })}>Logout</button>
    </div>
  )
}
```

```typescript
// SessionProvider en layout.tsx
import { SessionProvider } from 'next-auth/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
```

---

## 6. JWT Custom (Express / API pura)

```javascript
// Para backends Express sin NextAuth
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// Generar token en login
export function generateTokens(userId, role) {
  const accessToken = jwt.sign(
    { sub: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  )
  const refreshToken = jwt.sign(
    { sub: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  )
  return { accessToken, refreshToken }
}

// Middleware de verificación
export function requireAuth(req, res, next) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' })
  }
  try {
    const payload = jwt.verify(auth.slice(7), process.env.JWT_SECRET)
    req.user = payload
    next()
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido'
    res.status(401).json({ error: msg })
  }
}

// Middleware de rol
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ error: 'Sin permiso' })
    }
    next()
  }
}
```

---

## 7. Schema Prisma para auth

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String?   // null si usa OAuth
  name          String?
  role          Role      @default(USER)
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())

  // NextAuth adapter
  accounts Account[]
  sessions Session[]
}

enum Role {
  USER
  ADMIN
  SUPERVISOR
}

// Solo si usas NextAuth con DB adapter
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}
```

---

## 8. Variables de entorno

```env
# NextAuth v5
AUTH_SECRET=min-32-chars-random-string  # npx auth secret
AUTH_URL=https://yourapp.com            # producción
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# JWT custom (Express)
JWT_SECRET=min-32-chars
JWT_REFRESH_SECRET=min-32-chars-diferente
```

---

## 9. Errores comunes

| Error | Causa | Fix |
|---|---|---|
| `[auth] missing secret` | `AUTH_SECRET` no configurado | Generar con `npx auth secret` |
| Session siempre null en RSC | Olvidó `await auth()` | Usar `const session = await auth()` |
| OAuth no redirige | `AUTH_URL` incorrecto en prod | Configurar `AUTH_URL` exacto |
| JWT expirado en cliente | Access token vence rápido | Implementar refresh token rotation |
| Middleware bloquea assets | `matcher` muy amplio | Excluir `_next/static`, `images/` |

---

## 10. JWT custom legacy (SPA Vite + Express backend)

Patrón confirmado en AULA UC LOGOS LMS. Usar cuando frontend Vite/React SPA está separado del backend Express y NO se usa NextAuth.

### Convenciones críticas (rotas si cambias, sesiones legacy se rompen)

| Convención | Valor obligatorio | Razón |
|---|---|---|
| Storage key en navegador | `auth_token` (no `token`) | Sesiones existentes asumen este nombre |
| Claim de user en payload | `userId` (no `id`, no `sub`) | Backend espera `req.user.userId` |
| Invalidación de sesiones | `tokenVersion` en payload + DB | Bump `users.token_version` invalida tokens emitidos antes |

### Payload + emisión

```js
const token = jwt.sign(
  { userId: user.id, tokenVersion: user.token_version, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '30d' }
);
```

### Middleware Express con `tokenVersion`

```js
function authRequired(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'no_token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = db.prepare('SELECT token_version FROM users WHERE id = ?').get(payload.userId);
    if (!user || user.token_version !== payload.tokenVersion) {
      return res.status(401).json({ error: 'token_revoked' });
    }
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'invalid_token' });
  }
}
```

### Reglas de oro

- **NUNCA** poner `JWT_SECRET` en `VITE_*` o `NEXT_PUBLIC_*` — termina en bundle público.
- **NUNCA** servir assets privados directamente — frontend pide URL firmada al backend (ver `bunny-cdn`).
- Logout server-side: incrementar `users.token_version` invalida todos los tokens previos sin tocar al cliente.
- Frontend lee `localStorage.getItem('auth_token')` — mantener clave exacta o tendrás logouts masivos.
