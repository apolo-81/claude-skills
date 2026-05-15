---
name: n8n-to-api
description: >
  Expone workflows n8n como APIs o integra n8n con una app web como backend de lógica.
  Usar cuando: "n8n webhook", "llamar n8n desde Next.js", "n8n como backend",
  "fire and forget n8n", "n8n HTTP trigger", "n8n responde a webhook",
  "tarea async n8n", "n8n + Supabase Realtime", "n8n callback", "n8n API".
---

# n8n como Backend de Lógica de Negocio

## 1. Cuándo usar n8n

**Usar n8n para:** emails transaccionales, notificaciones Slack/Discord, sync con CRM, procesamiento async largo (PDFs, imagenes), orquestacion multi-servicio.

**No usar n8n para:** logica critica <100ms, autenticacion (usar NextAuth/Supabase Auth), operaciones directas a DB, validacion de formularios.

| Tarea | Herramienta |
|-------|-------------|
| Email bienvenida | n8n |
| Validar email unico | Supabase Edge Function |
| Sincronizar con HubSpot | n8n |
| Autenticar JWT | Next.js Middleware |
| Generar PDF > 30s | n8n + Supabase Realtime |
| Consulta SQL simple | Supabase client |

---

## 2. Los 4 Patrones de Comunicacion

### Pattern A — Fire-and-Forget (mas comun)

App envia webhook a n8n sin esperar respuesta. Para: emails, notificaciones, CRM, logging.

```typescript
// app/api/contact/route.ts
import { n8n } from '@/lib/n8n-client'

export async function POST(req: Request) {
  const body = await req.json()
  n8n.trigger('send-contact-email', {
    name: body.name, email: body.email, message: body.message,
  }).catch(err => console.error('[n8n] trigger failed:', err))
  return Response.json({ ok: true })
}
```

### Pattern B — Request-Response (sincrono)

App llama a n8n y espera respuesta. n8n debe tener nodo "Respond to Webhook". Limite: Vercel 30s free / 60s Pro.

```typescript
const result = await n8n.call<{ valid: boolean; company: string }>(
  'validate-vat', { vatNumber }
)
```

### Pattern C — Async con Supabase (tareas largas)

Para tareas >30s. App dispara n8n, n8n guarda resultado en Supabase, app escucha con Realtime.

Ver `references/async-pattern.md` para implementacion completa (API route + React hook con Realtime).

### Pattern D — n8n llama a Next.js

n8n hace HTTP Request a API route de Next.js. Para: callbacks async, push notifications, sync de estado.

Ver `references/async-pattern.md` para implementacion del callback endpoint.

---

## 3. Autenticacion de Webhooks n8n

Ver `references/async-pattern.md` para `verifyN8nRequest()` con timingSafeEqual.

En n8n: HTTP Request node > Authentication > Header Auth > Name: `x-n8n-api-key`, Value: el mismo secreto.

---

## 4. N8nClient — Clase Reutilizable

Ver `references/n8n-client.md` para implementacion completa con retry, timeouts y hooks.

```typescript
import { n8n } from '@/lib/n8n-client'
// Fire-and-forget
await n8n.trigger('send-welcome-email', { userId, email })
// Sincrono con respuesta tipada
const result = await n8n.call<{ pdfUrl: string }>('generate-report', { userId })
```

---

## 5. Error Handling y Resiliencia

- **Timeout:** AbortController 10s (trigger) / 30s (call)
- **Retry:** 3 intentos, backoff exponencial (1s, 2s, 4s)
- **Dead letter:** si falla tras retries, guardar en `n8n_events` con `status: 'failed'`
- **Alertas:** webhook a Slack si error rate supera umbral

Ver `references/async-pattern.md` para schema `n8n_events`.

---

## 6. Testing Local

Ver `references/async-pattern.md` para comandos de Docker, ngrok y curl de prueba.

---

## 7. Variables de Entorno

```bash
# .env.local
N8N_BASE_URL=https://your-n8n-instance.com
N8N_API_KEY=your-n8n-api-key
N8N_CALLBACK_SECRET=random-secret-for-incoming-webhooks
# Webhook URLs de produccion (Test URL vs Production URL en n8n)
```

---

## 8. Casos de Uso Comunes

**Generar reporte (Pattern C):**
Click > POST /api/reports/generate > crear n8n_events (pending) > n8n.trigger > respuesta con eventId > useReportGeneration escucha Realtime > n8n genera PDF, sube a Storage, llama callback > UI muestra link

**Form de contacto (Pattern A):**
Submit > POST /api/contact > n8n.trigger('contact-form') > 200 inmediato > n8n: Notion + email + Slack

**Upgrade de plan (Pattern A):**
Stripe webhook > verificar firma > actualizar plan en Supabase > n8n.trigger('user-upgraded') > n8n: Mailchimp + email + Slack + Notion

**Cron n8n > Dashboard (Pattern D):**
n8n Cron (cada hora) > scraping/API > transforma datos > POST /api/n8n/sync-metrics > Supabase > Dashboard ISR/Realtime

---

## Referencias

- `references/n8n-client.md` — Implementacion TypeScript completa + React hook
- `references/workflow-patterns.md` — Configuracion de workflows en n8n paso a paso
- `references/async-pattern.md` — Pattern C/D completo, auth, n8n_events schema, testing
