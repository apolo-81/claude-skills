---
name: webhook-integration
description: >
  Recibe webhooks de servicios externos: verificación de firma HMAC, idempotencia,
  retry logic y patrones de queue. Para n8n usar skill `n8n-to-api`.
  Usar cuando: "webhook", "Stripe webhook", "GitHub webhook", "HMAC", "firma de webhook",
  "idempotencia", "verificar webhook", "Clerk webhook", "webhook handler".
---

# Webhook Integration

## Mecanismos

| Mecanismo | Cuándo |
|-----------|--------|
| **Webhook** | Servicio externo inicia (Stripe, GitHub, Clerk) |
| **Polling** | Sin soporte webhooks; toleras latencia |
| **WebSocket** | Bidireccional tiempo real (chat, juegos) |

3 flujos principales:
1. **Recibir** — Stripe/GitHub/Clerk llaman a `POST /api/webhooks/[service]`
2. **Enviar** — App dispara URL Webhook Trigger de n8n
3. **Exponer** — Next.js publica endpoints que n8n consume via HTTP Request

---

## 1. Recibir Webhooks en Next.js

Ruta: `app/api/webhooks/[service]/route.ts`

**Regla critica:** Leer body con `request.text()` antes de parsear. HMAC requiere bytes originales; `request.json()` los pierde.

Ver `references/signature-verification.md` para verificacion de Stripe, GitHub, Clerk, Shopify, Twilio y generico.

### Stripe — Ejemplo completo

Ver `references/webhook-handlers.md` para implementacion completa con verificacion + idempotencia + procesamiento async.

Flujo: verificar firma > check idempotencia > responder 200 inmediato > procesar en background.

### Idempotencia

Servicios reenvian si no reciben 200 a tiempo. Sin idempotencia, un pago se procesa dos veces.

Ver `references/webhook-handlers.md` para `checkWebhookProcessed()`, `markWebhookProcessed()` y schema SQL.

### Responder rapido, procesar async

Stripe cancela tras 30s, GitHub tras 10s. Responder 200 inmediato, procesar en background.

Ver `references/webhook-handlers.md` para `processWebhookAsync()` con switch por event.type y envio a n8n.

---

## 2. Enviar Webhooks a n8n / n8n llama a tu app

Para patrones de comunicacion bidireccional Next.js <> n8n, consulta skill **`n8n-to-api`**.

---

## 3. Queue Pattern para Webhooks Criticos

Usar cola cuando procesamiento >10-30s o necesitas garantias de entrega.

Ver `references/webhook-handlers.md` para implementacion MVP con Supabase y schema SQL.

Para alta carga en produccion: [Trigger.dev](https://trigger.dev) o Upstash QStash.

---

## 4. Testing y Debugging

```bash
# Stripe CLI — reenviar eventos a localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger payment_intent.succeeded

# ngrok para n8n
ngrok http 3000

# curl generico
curl -X POST http://localhost:3000/api/webhooks/generic \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: tu-secreto" \
  -d '{"event": "user.created", "data": {"id": "123", "email": "test@example.com"}}'
```

Loguear siempre: `event_id`, `event_type`, `service`, `timestamp`. Nunca: tokens, passwords, PII.

---

## 5. Flujo Completo: Stripe + Next.js + n8n

```
Stripe --POST--> /api/webhooks/stripe --verifica firma--> procesa pago
                                                        └──sendToN8n--> n8n workflow
                                                                        ├── Email confirmacion
                                                                        └── Actualiza CRM
```

---

## 6. Security Checklist

- [ ] Verificar firma de cada webhook
- [ ] HTTPS siempre en produccion
- [ ] Secretos en variables de entorno
- [ ] No loguear payload completo (PII/tarjetas)
- [ ] Rate limiting en endpoint (ej: `@upstash/ratelimit`)
- [ ] Responder 200 solo si firma valida
- [ ] Implementar idempotencia
- [ ] Allowlist IPs del servicio si es posible

---

## Referencias

- `references/signature-verification.md` — HMAC para Stripe, GitHub, Clerk, Shopify, Twilio, generico
- `references/n8n-patterns.md` — Configuracion nodos n8n, payloads, errores
- `references/webhook-handlers.md` — Handler Stripe completo, idempotencia, queue pattern
