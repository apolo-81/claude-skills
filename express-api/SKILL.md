---
name: express-api
description: >
  API REST con Node.js + Express 5: estructura, middleware, validación con Zod,
  manejo de errores, autenticación JWT y patrones de producción.
  Usar cuando: "Express", "API REST", "Node.js backend", "Express router",
  "middleware Express", "Express 5", "API con Express", "servidor Node",
  "validar request", "JWT en Express", "CORS", "rate limiting", "Express error handler".
---

# Express API — Node.js + Express 5

Stack: **Node.js + Express 5 + Zod + better-sqlite3 / Prisma + TypeScript (opcional)**

Usado en: GHL WA Broadcaster, WA Group Poster y backends de proyectos propios.

## Related Skills

- **`wa-baileys`** — Para proyectos con integración WhatsApp. Define la estructura del socket y sesión; usa express-api para la API de control (endpoints de envío, estado, webhook GHL).
- **`ghl-integration`** — OAuth2 y webhooks GHL que disparan mensajes WA.
- **`background-jobs`** — BullMQ para cola de mensajes anti-ban sobre Express.

## 1. Estructura de proyecto

```
src/
├── index.js          # Entry point — inicializa app y arranca servidor
├── routes/           # Routers por dominio
│   ├── groups.js
│   ├── posts.js
│   └── auth.js
├── middleware/        # Middleware reutilizable
│   ├── auth.js        # Verificación de token/tenant
│   ├── validate.js    # Validación Zod
│   └── errorHandler.js
├── services/          # Lógica de negocio (sin Express)
│   └── tenantManager.js
└── lib/
    └── db.js          # Instancia de DB
```

---

## 2. Setup base

```javascript
// src/index.js
import express from 'express'
import cors from 'cors'
import { groupsRouter } from './routes/groups.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

// Middleware global
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*' }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => res.json({ ok: true, ts: Date.now() }))

// Rutas
app.use('/api/groups', groupsRouter)

// Error handler — siempre al final
app.use(errorHandler)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
```

---

## 3. Router modular

```javascript
// src/routes/groups.js
import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../middleware/validate.js'
import { tenantMiddleware } from '../middleware/auth.js'

export const groupsRouter = Router()

// Aplicar tenant middleware a todas las rutas del router
groupsRouter.use(tenantMiddleware)

const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
  jid: z.string(),
  active: z.boolean().default(true),
})

// GET /api/groups
groupsRouter.get('/', async (req, res, next) => {
  try {
    const groups = await req.db.all(
      'SELECT * FROM groups WHERE location_id = ? ORDER BY created_at DESC',
      [req.locationId]
    )
    res.json(groups)
  } catch (err) {
    next(err)
  }
})

// POST /api/groups
groupsRouter.post('/', validate(createGroupSchema), async (req, res, next) => {
  try {
    const { name, jid, active } = req.body
    const result = await req.db.run(
      'INSERT INTO groups (name, jid, active, location_id) VALUES (?, ?, ?, ?)',
      [name, jid, active ? 1 : 0, req.locationId]
    )
    res.status(201).json({ id: result.lastID, name, jid, active })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/groups/:id
groupsRouter.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const group = await req.db.get(
      'SELECT * FROM groups WHERE id = ? AND location_id = ?',
      [id, req.locationId]
    )
    if (!group) return res.status(404).json({ error: 'Group not found' })

    await req.db.run('DELETE FROM groups WHERE id = ?', [id])
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})
```

---

## 4. Middleware de validación con Zod

```javascript
// src/middleware/validate.js
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        issues: result.error.flatten().fieldErrors,
      })
    }
    req.body = result.data  // datos parseados y tipados
    next()
  }
}

// Para validar query params
export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query)
    if (!result.success) {
      return res.status(400).json({ error: 'Invalid query params', issues: result.error.flatten() })
    }
    req.query = result.data
    next()
  }
}
```

---

## 5. Error handler global

```javascript
// src/middleware/errorHandler.js
export function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, err)

  // Errores conocidos con status
  if (err.status) {
    return res.status(err.status).json({ error: err.message })
  }

  // SQLite unique constraint
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return res.status(409).json({ error: 'Duplicate entry' })
  }

  // Prisma unique constraint
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Duplicate entry' })
  }

  // Default 500
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  })
}

// Helper para crear errores con status
export function createError(status, message) {
  const err = new Error(message)
  err.status = status
  return err
}
```

---

## 6. Multi-tenant middleware (patrón GHL/SaaS)

```javascript
// src/middleware/auth.js
export function tenantMiddleware(req, res, next) {
  const locationId = req.headers['x-location-id'] || req.query.location_id

  if (!locationId) {
    return res.status(401).json({ error: 'Missing location_id' })
  }

  req.locationId = locationId
  next()
}

// JWT Bearer token
export function jwtMiddleware(req, res, next) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' })
  }

  try {
    const token = auth.slice(7)
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = payload
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}
```

---

## 7. Async wrapper (evitar try/catch repetitivo)

```javascript
// Wrapper para rutas async — Express 5 maneja errores async nativamente
// En Express 4: usar este wrapper
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

// Uso:
router.get('/', asyncHandler(async (req, res) => {
  const data = await someAsyncOperation()
  res.json(data)
}))
```

> **Express 5 (recomendado):** las rutas async lanzan errores automáticamente — no necesitas el wrapper.

---

## 8. Rate limiting

```javascript
import rateLimit from 'express-rate-limit'

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, try again later' },
})

// Anti-spam para endpoints sensibles
export const strictLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minuto
  max: 5,
  message: { error: 'Rate limit exceeded' },
})

// En index.js
app.use('/api/', apiLimiter)
app.use('/api/auth/', strictLimiter)
```

---

## 9. Variables de entorno

```env
PORT=3000
NODE_ENV=production
DATABASE_URL=./data/db.sqlite
JWT_SECRET=your-secret-min-32-chars
ALLOWED_ORIGINS=https://yourapp.com,https://app.gohighlevel.com
```

---

## 10. Package.json base

```json
{
  "type": "module",
  "scripts": {
    "dev": "node --watch src/index.js",
    "start": "node src/index.js"
  },
  "dependencies": {
    "express": "^5.0.0",
    "zod": "^3.23.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.4.0",
    "jsonwebtoken": "^9.0.2",
    "better-sqlite3": "^11.0.0"
  }
}
```

---

## 11. Patrones de respuesta consistentes

```javascript
// Siempre mismo formato de respuesta
// Success
res.json({ data: result, meta: { total, page } })
// o simplemente
res.json(result)

// Error
res.status(400).json({ error: 'Mensaje descriptivo', field: 'campo' })

// Created
res.status(201).json({ id: newRecord.id, ...newRecord })

// No content
res.status(204).send()
```
