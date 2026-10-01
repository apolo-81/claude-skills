---
name: ghl-integration
description: >
  Integración con GoHighLevel (GHL): OAuth2, webhooks, API v2 y apps de Marketplace.
  Autenticación de sub-accounts, token refresh, iFrame SSO y verificación de webhooks.
  Usar cuando: "GoHighLevel", "GHL", "GHL OAuth", "sub-account", "location_id",
  "GHL webhook", "GHL API", "GHL Marketplace app", "HighLevel integration",
  "GHL token refresh", "GHL iFrame", "agency GHL", "GHL app install",
  "GHL custom app", "GHL workflow trigger".
---

# GHL Integration — GoHighLevel API v2

Stack: **Express 5 + Node.js + SQLite** — patrón multi-tenant por `location_id`.

---

## 1. Flujo OAuth2

```
Usuario instala app en GHL Marketplace
→ GHL redirige a tu /oauth/callback?code=XXX&location_id=YYY
→ Tu app intercambia code por access_token + refresh_token
→ Guardas tokens por location_id
→ Cada request usa access_token (expira en 24h)
→ Refresh automático con refresh_token (expira en 30 días)
```

---

## 2. Configuración

```env
GHL_CLIENT_ID=your-client-id
GHL_CLIENT_SECRET=your-client-secret
GHL_REDIRECT_URI=https://yourapp.railway.app/oauth/callback
GHL_WEBHOOK_SECRET=your-webhook-secret  # opcional pero recomendado
```

```javascript
// src/lib/ghl.js
export const GHL_BASE = 'https://services.leadconnectorhq.com'

export const GHL_SCOPES = [
  'contacts.readonly',
  'contacts.write',
  'conversations.readonly',
  'conversations.write',
  'conversations/message.readonly',
  'conversations/message.write',
  'locations.readonly',
].join(' ')
```

---

## 3. OAuth — Rutas Express

```javascript
// src/routes/oauth.js
import { Router } from 'express'
import axios from 'axios'
import { GHL_BASE, GHL_SCOPES } from '../lib/ghl.js'

export const oauthRouter = Router()

// Paso 1: Iniciar OAuth
oauthRouter.get('/install', (req, res) => {
  const params = new URLSearchParams({
    response_type: 'code',
    redirect_uri: process.env.GHL_REDIRECT_URI,
    client_id: process.env.GHL_CLIENT_ID,
    scope: GHL_SCOPES,
  })
  res.redirect(`https://marketplace.gohighlevel.com/oauth/chooselocation?${params}`)
})

// Paso 2: Callback — intercambiar code por tokens
oauthRouter.get('/oauth/callback', async (req, res, next) => {
  try {
    const { code, location_id } = req.query
    if (!code || !location_id) return res.status(400).send('Missing code or location_id')

    const { data } = await axios.post(`${GHL_BASE}/oauth/token`, {
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.GHL_REDIRECT_URI,
      client_id: process.env.GHL_CLIENT_ID,
      client_secret: process.env.GHL_CLIENT_SECRET,
    })

    // Guardar tokens por location_id
    await saveTokens(location_id, {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    })

    // Redirigir al dashboard de la app
    res.redirect(`/dashboard?location_id=${location_id}`)
  } catch (err) {
    next(err)
  }
})
```

---

## 4. Token Refresh

```javascript
// src/lib/ghl-auth.js
import axios from 'axios'
import { getTokens, saveTokens } from './db.js'

export async function getValidToken(locationId) {
  const tokens = await getTokens(locationId)
  if (!tokens) throw new Error(`No tokens for location ${locationId}`)

  // Refrescar si expira en menos de 5 minutos
  if (tokens.expiresAt - Date.now() < 5 * 60 * 1000) {
    return refreshToken(locationId, tokens.refreshToken)
  }

  return tokens.accessToken
}

async function refreshToken(locationId, refreshToken) {
  const { data } = await axios.post(`https://services.leadconnectorhq.com/oauth/token`, {
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: process.env.GHL_CLIENT_ID,
    client_secret: process.env.GHL_CLIENT_SECRET,
  })

  await saveTokens(locationId, {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  })

  return data.access_token
}

// Cliente axios pre-configurado por location
export async function ghlClient(locationId) {
  const token = await getValidToken(locationId)
  return axios.create({
    baseURL: 'https://services.leadconnectorhq.com',
    headers: {
      Authorization: `Bearer ${token}`,
      Version: '2021-07-28',
    },
  })
}
```

---

## 5. Llamadas a la API GHL

```javascript
// src/services/ghl-contacts.js
import { ghlClient } from '../lib/ghl-auth.js'

// Obtener contacto por ID
export async function getContact(locationId, contactId) {
  const client = await ghlClient(locationId)
  const { data } = await client.get(`/contacts/${contactId}`)
  return data.contact
}

// Buscar contacto por teléfono
export async function findContactByPhone(locationId, phone) {
  const client = await ghlClient(locationId)
  const { data } = await client.get('/contacts/', {
    params: { locationId, query: phone, limit: 1 },
  })
  return data.contacts?.[0] ?? null
}

// Crear o actualizar contacto (upsert por email)
export async function upsertContact(locationId, contactData) {
  const client = await ghlClient(locationId)
  const { data } = await client.post('/contacts/upsert', {
    locationId,
    ...contactData,
  })
  return data.contact
}

// Agregar nota a contacto
export async function addNote(locationId, contactId, note) {
  const client = await ghlClient(locationId)
  await client.post(`/contacts/${contactId}/notes`, { body: note, userId: 'system' })
}

// Agregar tag
export async function addTag(locationId, contactId, tag) {
  const client = await ghlClient(locationId)
  await client.post(`/contacts/${contactId}/tags`, { tags: [tag] })
}
```

---

## 6. Webhooks

```javascript
// src/routes/webhooks.js
import { Router } from 'express'
import crypto from 'crypto'

export const webhookRouter = Router()

// Verificar firma del webhook (si está configurada)
function verifyWebhookSignature(req) {
  const secret = process.env.GHL_WEBHOOK_SECRET
  if (!secret) return true  // sin secreto, no verificar

  const signature = req.headers['x-ghl-signature']
  if (!signature) return false

  const expected = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex')

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}

webhookRouter.post('/webhook', (req, res, next) => {
  try {
    if (!verifyWebhookSignature(req)) {
      return res.status(401).json({ error: 'Invalid signature' })
    }

    // Responder inmediatamente — GHL espera 200 rápido
    res.status(200).json({ received: true })

    // Procesar en background
    processWebhookEvent(req.body).catch(console.error)
  } catch (err) {
    next(err)
  }
})

async function processWebhookEvent(payload) {
  const { type, locationId, contactId, data } = payload

  switch (type) {
    case 'ContactCreate':
      await handleNewContact(locationId, data)
      break
    case 'ContactUpdate':
      await handleContactUpdate(locationId, contactId, data)
      break
    case 'InboundMessage':
      await handleInboundMessage(locationId, data)
      break
    case 'AppointmentCreate':
      await handleNewAppointment(locationId, data)
      break
    default:
      console.log(`[GHL Webhook] Unhandled event: ${type}`)
  }
}
```

---

## 7. iFrame SSO (Marketplace App)

```javascript
// Cuando GHL abre tu app en un iFrame, envía un JWT de sesión
// src/routes/app.js
import jwt from 'jsonwebtoken'

// GHL redirige a: /app?token=JWT_TOKEN
app.get('/app', (req, res) => {
  try {
    const { token } = req.query
    const session = jwt.verify(token, process.env.GHL_CLIENT_SECRET)
    // session.locationId — la sub-account activa
    // session.userId — el usuario que abrió la app

    res.redirect(`/dashboard?location_id=${session.locationId}`)
  } catch {
    res.redirect('/install')  // no autenticado → reinstalar
  }
})
```

---

## 8. DB — Guardar tokens por location

```javascript
// src/lib/db.js (SQLite con better-sqlite3)
const db = new Database(process.env.DATABASE_URL)

db.exec(`
  CREATE TABLE IF NOT EXISTS ghl_tokens (
    location_id TEXT PRIMARY KEY,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER DEFAULT (unixepoch())
  )
`)

export function saveTokens(locationId, { accessToken, refreshToken, expiresAt }) {
  db.prepare(`
    INSERT OR REPLACE INTO ghl_tokens (location_id, access_token, refresh_token, expires_at)
    VALUES (?, ?, ?, ?)
  `).run(locationId, accessToken, refreshToken, expiresAt)
}

export function getTokens(locationId) {
  return db.prepare('SELECT * FROM ghl_tokens WHERE location_id = ?').get(locationId)
}
```

---

## 9. Errores comunes

| Error | Causa | Fix |
|---|---|---|
| `401 Unauthorized` en API | Token expirado | Implementar `getValidToken()` con refresh automático |
| Webhook no llega | URL no pública | Usar ngrok en dev: `ngrok http 3000` |
| `invalid_grant` en refresh | Refresh token expirado (30d) | Re-instalar la app — flujo OAuth desde cero |
| iFrame en blanco | `X-Frame-Options` bloqueando | Agregar header `Content-Security-Policy: frame-ancestors https://*.gohighlevel.com` |
| Rate limit 429 | Muchas requests seguidas | Implementar retry con backoff exponencial |

---

## 10. Headers requeridos

```javascript
// Todas las requests a GHL v2 necesitan:
{
  'Authorization': `Bearer ${accessToken}`,
  'Version': '2021-07-28',           // versión de la API — no omitir
  'Content-Type': 'application/json',
}
```
