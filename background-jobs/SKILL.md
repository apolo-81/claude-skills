---
name: background-jobs
description: >
  Colas de trabajo asíncronas con BullMQ + Redis en Node.js/Express.
  Reintentos, concurrencia, delays anti-ban, workers y monitoreo.
  Usar cuando: "cola de mensajes", "job queue", "BullMQ", "tareas en background",
  "envío masivo", "anti-ban WhatsApp", "rate limiting mensajes", "worker",
  "reintentar tarea fallida", "procesar en segundo plano", "Bull", "Redis queue",
  "scheduled jobs", "delayed jobs".
---

# Background Jobs — BullMQ + Redis

Stack: **BullMQ + Redis** (Node.js/Express) — usado en GHL WA Broadcaster para queues anti-ban.

## Related Skills

- **`wa-baileys`** — Para queues de mensajes WhatsApp. La skill wa-baileys define los delays y límites anti-ban; background-jobs implementa el Worker y la Queue que los ejecuta.
- **`express-api`** — El servidor Express expone los endpoints que encolan jobs en BullMQ.

---

## 1. Setup

```bash
npm install bullmq ioredis
# Redis local para desarrollo
docker run -d -p 6379:6379 redis:alpine
```

```javascript
// src/lib/redis.js
import { Redis } from 'ioredis'

export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,  // requerido por BullMQ
})
```

---

## 2. Definir una Queue

```javascript
// src/queues/whatsapp.js
import { Queue } from 'bullmq'
import { redis } from '../lib/redis.js'

export const waQueue = new Queue('whatsapp-messages', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },  // 5s, 10s, 20s
    removeOnComplete: { count: 100 },               // conservar últimos 100 completados
    removeOnFail: { count: 50 },
  },
})

// Agregar job
export async function queueMessage(locationId, phone, message, delayMs = 0) {
  return waQueue.add(
    'send-message',
    { locationId, phone, message },
    {
      delay: delayMs,           // delay antes de procesar (anti-ban)
      jobId: `${locationId}-${phone}-${Date.now()}`,  // ID único
    }
  )
}

// Agregar múltiples mensajes con delay escalonado (anti-ban)
export async function queueBroadcast(locationId, recipients, message) {
  const jobs = recipients.map((phone, i) => ({
    name: 'send-message',
    data: { locationId, phone, message },
    opts: {
      delay: i * 3000,  // 3 segundos entre cada mensaje
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    },
  }))

  return waQueue.addBulk(jobs)
}
```

---

## 3. Worker — Procesar Jobs

```javascript
// src/workers/whatsapp.js
import { Worker } from 'bullmq'
import { redis } from '../lib/redis.js'
import { getWAClient } from '../services/whatsapp.js'

export const waWorker = new Worker(
  'whatsapp-messages',
  async (job) => {
    const { locationId, phone, message } = job.data

    // Progreso opcional
    await job.updateProgress(10)

    const client = await getWAClient(locationId)
    await client.sendMessage(`${phone}@s.whatsapp.net`, { text: message })

    await job.updateProgress(100)
    return { sent: true, phone, ts: Date.now() }
  },
  {
    connection: redis,
    concurrency: 1,          // 1 mensaje a la vez por worker (anti-ban)
    limiter: {
      max: 10,               // máximo 10 jobs
      duration: 60_000,      // por minuto (rate limiting)
    },
  }
)

// Event listeners
waWorker.on('completed', (job) => {
  console.log(`[WA] Mensaje enviado a ${job.data.phone} (job ${job.id})`)
})

waWorker.on('failed', (job, err) => {
  console.error(`[WA] Error en job ${job?.id}: ${err.message}`)
})

waWorker.on('error', (err) => {
  console.error('[WA Worker] Error:', err)
})
```

---

## 4. Inicializar en el servidor

```javascript
// src/index.js
import './workers/whatsapp.js'  // Iniciar worker al arrancar

// O con control explícito
import { waWorker } from './workers/whatsapp.js'

// Graceful shutdown
process.on('SIGTERM', async () => {
  await waWorker.close()
  process.exit(0)
})
```

---

## 5. Scheduled Jobs (Cron)

```javascript
import { Queue } from 'bullmq'

const reportQueue = new Queue('reports', { connection: redis })

// Job recurrente — cada día a las 8am
await reportQueue.add(
  'daily-report',
  { type: 'daily' },
  {
    repeat: { pattern: '0 8 * * *' },  // cron syntax
  }
)

// Remover job recurrente
const repeatableJobs = await reportQueue.getRepeatableJobs()
for (const job of repeatableJobs) {
  if (job.name === 'daily-report') {
    await reportQueue.removeRepeatableByKey(job.key)
  }
}
```

---

## 6. Monitoreo — Bull Board

```bash
npm install @bull-board/express @bull-board/api
```

```javascript
// src/index.js
import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js'
import { ExpressAdapter } from '@bull-board/express'

const serverAdapter = new ExpressAdapter()
serverAdapter.setBasePath('/admin/queues')

createBullBoard({
  queues: [new BullMQAdapter(waQueue)],
  serverAdapter,
})

// Solo en desarrollo o con auth
app.use('/admin/queues', requireAuth, serverAdapter.getRouter())
```

---

## 7. Variables de entorno

```env
REDIS_URL=redis://localhost:6379
# Railway: usar Railway Redis plugin → inyecta REDIS_URL automáticamente
```

### Railway — Redis

```bash
# En railway.app → New Service → Database → Redis
# REDIS_URL se inyecta automáticamente en el servicio
```

---

## 8. Patrones anti-ban WhatsApp

```javascript
// Delay dinámico según volumen
function calcDelay(index, totalMessages) {
  const baseDelay = 2000       // 2s mínimo
  const jitter = Math.random() * 1000  // 0-1s aleatorio (evitar patrones)
  const rampUp = index < 10 ? index * 500 : 0  // ramp-up lento al inicio
  return baseDelay + jitter + rampUp
}

// Pausar queue si se detectan errores de conexión
waWorker.on('failed', async (job, err) => {
  if (err.message.includes('Connection Closed') || err.message.includes('Stream Errored')) {
    await waQueue.pause()
    setTimeout(() => waQueue.resume(), 30_000)  // pausa 30s
  }
})
```

---

## 9. Errores comunes

| Error | Causa | Fix |
|---|---|---|
| `maxRetriesPerRequest must be null` | Config de Redis incorrecta | `maxRetriesPerRequest: null` en ioredis |
| Jobs se procesan pero no completan | Worker no retorna valor | Asegurar que el callback async retorne |
| Queue no procesa | Worker no iniciado | Importar el worker en index.js |
| Redis ECONNREFUSED | Redis no corriendo | `docker run -d -p 6379:6379 redis:alpine` |
| Jobs duplicados | Mismo jobId dos veces | Usar IDs únicos o dejar que BullMQ genere el ID |
