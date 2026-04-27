---
name: wa-baileys
description: >
  Integración con WhatsApp Web API usando Baileys: conexión, autenticación QR,
  envío de mensajes, resolución de JID, manejo de sesión y anti-ban.
  Stack: @whiskeysockets/baileys + Node.js/Express.
  Usar cuando: "Baileys", "WhatsApp bot", "enviar mensaje WhatsApp", "WA sesión",
  "QR code WhatsApp", "wa-socket", "whatsapp web api", "automatizar WhatsApp",
  "wa broadcaster", "outreach WhatsApp", "makeWASocket", "useMultiFileAuthState".
  Do NOT use for: bots de chat en web (usar chatbot-widget), integraciones GHL sin WA
  (usar ghl-integration), SMS o canales que no sean WhatsApp.
---

# WhatsApp Integration — Baileys

Stack: **@whiskeysockets/baileys + Node.js/Express + better-sqlite3 + BullMQ**

Usado en: GHL WA Broadcaster, WA Group Poster, WA Outreach.

## Related Skills

- **`express-api`** — Estructura del servidor Express que expone la API de control WA.
- **`background-jobs`** — BullMQ para cola de mensajes con delays anti-ban.
- **`ghl-integration`** — Upstream: GHL webhooks disparan mensajes via esta skill.
- **`deployment`** — Ver sección 11 "Long-Running Processes" para deploy en Railway.

---

## 1. Setup

```bash
npm install @whiskeysockets/baileys
npm install qrcode-terminal
```

```javascript
// src/wa/client.js
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys'
```

---

## 2. Conexión y autenticación

### Patrón correcto de inicialización

```javascript
// src/wa/client.js
export async function createWAClient(sessionDir) {
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir)
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    browser: ['WA Broadcaster', 'Chrome', '1.0.0'],
  })

  // ⚠️ CRÍTICO: registrar listeners ANTES de que la conexión complete
  // Si se registran después de connect(), se pierde el evento si la conexión es rápida
  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log('Escanea el QR en WhatsApp → Dispositivos vinculados')
    }

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode
      const shouldReconnect = code !== DisconnectReason.loggedOut

      console.log(`WA conexión cerrada (código ${code}). Reconectar: ${shouldReconnect}`)

      if (shouldReconnect) {
        return createWAClient(sessionDir) // recursivo
      } else {
        // loggedOut → el proceso debe reiniciarse para mostrar nuevo QR
        process.exit(1)
      }
    }

    if (connection === 'open') {
      console.log(`✅ WA conectado: ${sock.user?.id}`)
    }
  })

  return sock
}
```

### ⚠️ NO usar logout() para desconectar

```javascript
// ❌ INCORRECTO — logout() RECONECTA automáticamente, no desconecta
await sock.logout()

// ✅ CORRECTO — para desconexión limpia que requiere nuevo QR:
process.exit(1)  // Railway/PM2 restartea y muestra nuevo QR en logs
```

---

## 3. Resolución de JID — Regla México

WhatsApp México almacena números móviles con prefijo `521` (13 dígitos). Enviar a `52XXXXXXXXXX` falla silenciosamente — Baileys reporta éxito pero el mensaje no llega.

```javascript
// src/wa/jid.js
export async function resolveJID(sock, phoneNumber) {
  // Normalizar: quitar +, espacios, guiones
  const clean = phoneNumber.replace(/\D/g, '')

  // Verificar en WhatsApp (obtiene JID canónico)
  const [result] = await sock.onWhatsApp(clean)

  if (!result?.exists) {
    throw new Error(`Número no registrado en WhatsApp: ${clean}`)
  }

  // result.jid será "521XXXXXXXXXX@s.whatsapp.net" para México
  return result.jid
}

// Uso:
const jid = await resolveJID(sock, '5512345678')  // devuelve '521XXXXXXXXXX@s.whatsapp.net'
await sock.sendMessage(jid, { text: 'Hola!' })
```

> **Por qué:** WhatsApp México almacena con `521` (prefijo de móvil internacional MX). `onWhatsApp()` es la única fuente confiable del JID canónico — nunca construirlo manualmente.

---

## 4. Envío de mensajes

### Texto simple

```javascript
await sock.sendMessage(jid, { text: 'Hola! Mensaje de prueba.' })
```

### Con imagen

```javascript
await sock.sendMessage(jid, {
  image: { url: 'https://example.com/imagen.jpg' },
  caption: 'Mira esto'
})
```

### Con documento

```javascript
await sock.sendMessage(jid, {
  document: fs.readFileSync('./archivo.pdf'),
  mimetype: 'application/pdf',
  fileName: 'propuesta.pdf'
})
```

### Marcar como leído

```javascript
await sock.readMessages([msg.key])
```

---

## 5. Anti-ban — Rate limiting con BullMQ

Enviar mensajes en bulk sin delays activa detección de spam. Usar BullMQ con delays aleatorios.

Ver skill `background-jobs` para setup completo de BullMQ + Redis.

```javascript
// src/queues/wa-queue.js
import { Queue, Worker } from 'bullmq'

const waQueue = new Queue('wa-messages', {
  connection: { host: 'localhost', port: 6379 },
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  }
})

export async function enqueueMessage(jid, content, delayMs) {
  await waQueue.add('send', { jid, content }, { delay: delayMs })
}

new Worker('wa-messages', async (job) => {
  const { jid, content } = job.data
  await sock.sendMessage(jid, content)
}, { connection: { host: 'localhost', port: 6379 } })

// Patrón de delays recomendado para outreach masivo
const BASE_DELAY = 3000   // 3s mínimo entre mensajes
const JITTER = 5000       // +0-5s aleatorio

for (let i = 0; i < contacts.length; i++) {
  const delay = i * (BASE_DELAY + Math.random() * JITTER)
  await enqueueMessage(contacts[i].jid, message, delay)
}
```

> **Límites seguros (2026):** < 50 mensajes/hora a números nuevos. < 200/hora a contactos existentes. Pausar 15min después de 100 mensajes consecutivos.

---

## 6. Persistencia de sesión

```javascript
const { state, saveCreds } = await useMultiFileAuthState('./data/wa-sessions')
// La sesión se guarda automáticamente en el directorio configurado
```

```env
# .env — apuntar sesión al volumen persistente (Railway)
WA_SESSION_DIR=/app/data/wa-sessions
```

```
# .gitignore — NUNCA commitear sesión WA
data/wa-sessions/
*.sqlite
```

---

## 7. SQLite con better-sqlite3 — Gotcha crítico

```javascript
// ❌ INCORRECTO — lanza "cannot prepare a statement inside a transaction"
db.transaction(() => {
  const stmt = db.prepare('INSERT INTO logs VALUES (?, ?)')  // ERROR aquí
  stmt.run(jid, message)
})()

// ✅ CORRECTO — preparar statements ANTES de abrir la transaction
const insertLog = db.prepare('INSERT INTO logs VALUES (?, ?)')  // preparar fuera

db.transaction(() => {
  insertLog.run(jid, message)  // usar dentro
})()
```

> **Por qué:** `db.prepare()` dentro de una transaction activa lanza error en better-sqlite3. Error frecuente al combinar listeners de Baileys (async) con transacciones síncronas de SQLite.

---

## 8. Escuchar mensajes entrantes

```javascript
sock.ev.on('messages.upsert', async ({ messages, type }) => {
  if (type !== 'notify') return  // ignorar mensajes históricos al conectar

  for (const msg of messages) {
    if (msg.key.fromMe) continue  // ignorar mensajes propios

    const from = msg.key.remoteJid
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text

    if (!text) continue  // ignorar stickers, voz, etc

    console.log(`Mensaje de ${from}: ${text}`)
  }
})
```

---

## Quality Checklist

Antes de hacer deploy de cualquier integración WA:

- [ ] Listeners registrados ANTES de `connect()` / `createWAClient()`
- [ ] JID resuelto con `sock.onWhatsApp()`, nunca construido manualmente
- [ ] Delays anti-ban configurados (≥3s entre mensajes)
- [ ] Sesión guardada en volumen persistente (no en `/tmp`)
- [ ] Health check verifica `sock.user !== null`
- [ ] `db.prepare()` llamado fuera de transactions
- [ ] `.gitignore` excluye `wa-sessions/` y `.sqlite`
- [ ] `process.exit(1)` en lugar de `sock.logout()` para desconexión permanente
