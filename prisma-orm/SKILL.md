---
name: prisma-orm
description: >
  Prisma ORM con PostgreSQL (Neon/Railway): schema, migraciones, relaciones, transacciones y seeding.
  Stack: Prisma + PostgreSQL + Next.js App Router / Express.
  Usar cuando: "Prisma", "schema.prisma", "migración", "modelo de datos", "relaciones Prisma",
  "prisma migrate", "prisma generate", "$transaction", "seeding", "Prisma Client",
  "query Prisma", "foreign key", "enum Prisma", "upsert", "incluir relaciones".
---

# Prisma ORM

Stack: **Prisma 5+ + PostgreSQL (Neon / Railway)** — usado en Next.js App Router y Express.

## 1. Setup

```bash
npm install prisma @prisma/client
npx prisma init --datasource-provider postgresql
```

```env
# .env
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

```typescript
// lib/prisma.ts — singleton para Next.js (evita hot-reload leak)
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['query'] : [] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## 2. Schema — Patrones comunes

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Timestamps reutilizables
model Lead {
  id        String   @id @default(cuid())
  nombre    String
  email     String   @unique
  telefono  String?
  estado    EstadoLead @default(NUEVO)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relación 1:many
  seguimientos Seguimiento[]
  // Relación many:1
  programa   ProgramaAcademico? @relation(fields: [programaId], references: [id])
  programaId String?

  @@index([email])
  @@index([estado])
}

enum EstadoLead {
  NUEVO
  CONTACTADO
  ENTREVISTADO
  INSCRITO
  DESCARTADO
}

model Seguimiento {
  id        String   @id @default(cuid())
  tipo      String   // "llamada" | "email" | "whatsapp" | "nota"
  resultado String?
  lead      Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)
  leadId    String
  createdAt DateTime @default(now())

  @@index([leadId])
}
```

**Reglas de schema:**
- Usar `cuid()` para IDs (URL-safe, sin colisiones)
- Siempre `createdAt` + `updatedAt` en tablas principales
- `onDelete: Cascade` en relaciones hijo
- `@@index` en campos que se usan en `where` frecuente
- Enums en MAYÚSCULAS, nombres de modelos en PascalCase

---

## 3. Migraciones

```bash
# Desarrollo — genera migración + aplica
npx prisma migrate dev --name descripcion-breve

# Producción — solo aplica migraciones pendientes
npx prisma migrate deploy

# Reset completo (solo dev)
npx prisma migrate reset

# Ver estado
npx prisma migrate status

# Regenerar Prisma Client después de cambios al schema
npx prisma generate
```

**Flujo de migración:**
1. Editar `schema.prisma`
2. `npx prisma migrate dev --name <nombre>`
3. Commit `prisma/migrations/` al repo
4. En producción (Railway/Vercel): `npx prisma migrate deploy` en el build command

---

## 4. Queries — Patrones frecuentes

```typescript
import { prisma } from '@/lib/prisma'

// Crear
const lead = await prisma.lead.create({
  data: { nombre, email, telefono, programaId },
})

// Buscar con relaciones
const lead = await prisma.lead.findUnique({
  where: { id },
  include: {
    seguimientos: { orderBy: { createdAt: 'desc' } },
    programa: true,
  },
})

// Lista con filtros + paginación
const leads = await prisma.lead.findMany({
  where: {
    estado: { in: ['NUEVO', 'CONTACTADO'] },
    ...(search && {
      OR: [
        { nombre: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    }),
  },
  orderBy: { createdAt: 'desc' },
  take: 20,
  skip: (page - 1) * 20,
})

// Actualizar
const updated = await prisma.lead.update({
  where: { id },
  data: { estado: 'CONTACTADO', updatedAt: new Date() },
})

// Upsert (crear o actualizar)
const record = await prisma.lead.upsert({
  where: { email },
  update: { nombre, telefono },
  create: { nombre, email, telefono },
})

// Eliminar
await prisma.lead.delete({ where: { id } })

// Contar
const total = await prisma.lead.count({ where: { estado: 'NUEVO' } })
```

---

## 5. Transacciones

```typescript
// $transaction — operaciones atómicas
const [seguimiento, lead] = await prisma.$transaction([
  prisma.seguimiento.create({
    data: { tipo, resultado, leadId },
  }),
  prisma.lead.update({
    where: { id: leadId },
    data: { estado: nuevoEstado },
  }),
])

// $transaction interactiva — para lógica condicional
const resultado = await prisma.$transaction(async (tx) => {
  const lead = await tx.lead.findUnique({ where: { id: leadId } })
  if (!lead) throw new Error('Lead no encontrado')

  const seguimiento = await tx.seguimiento.create({
    data: { tipo, resultado: descripcion, leadId },
  })

  await tx.lead.update({
    where: { id: leadId },
    data: { estado: 'CONTACTADO' },
  })

  return seguimiento
})
```

**Regla:** Nunca usar `prisma.X` dentro de un `$transaction` — siempre usar el parámetro `tx`.

---

## 6. Seeding

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Upsert para idempotencia (puede correrse múltiples veces)
  await prisma.programaAcademico.upsert({
    where: { nombre: 'Maestría en Teología' },
    update: {},
    create: {
      nombre: 'Maestría en Teología',
      tipo: 'Maestria',
      duracion: '4 cuatrimestres',
      modalidad: 'En linea',
    },
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

```json
// package.json
{
  "prisma": { "seed": "ts-node --compiler-options '{\"module\":\"CommonJS\"}' prisma/seed.ts" }
}
```

```bash
npx prisma db seed
```

---

## 7. Búsqueda case-insensitive

```typescript
// Buscar por nombre ignorando mayúsculas/tildes
const programa = await prisma.programaAcademico.findFirst({
  where: {
    nombre: { contains: nombre, mode: 'insensitive' },
  },
})
```

---

## 8. Deployment

**Vercel:** Agregar en `package.json` → `"postinstall": "prisma generate"`

**Railway:** Build command: `npx prisma migrate deploy && npm run build`

**Variables de entorno requeridas:**
```env
DATABASE_URL=postgresql://...   # Neon: incluir ?sslmode=require
```

**Neon connection pooling** (recomendado para serverless):
```env
DATABASE_URL=postgresql://...?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://...  # Para migraciones
```

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // Solo si usas connection pooling
}
```

---

## 9. Errores comunes

| Error | Causa | Fix |
|---|---|---|
| `P2002` | Unique constraint violated | Verificar antes de crear o usar `upsert` |
| `P2025` | Record not found | Usar `findUnique` antes de `update`/`delete` |
| `P2003` | Foreign key violation | El registro padre no existe |
| `P2016` | Query interpretation error | Schema desincronizado — `npx prisma generate` |
| `prepared statement already exists` | Múltiples instancias Prisma | Usar singleton de `lib/prisma.ts` |

---

## Referencias

- `npx prisma studio` — UI visual para explorar la DB en desarrollo
- Docs: https://www.prisma.io/docs
