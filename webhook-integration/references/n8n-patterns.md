# n8n Webhook Patterns

Patrones específicos para integrar n8n con aplicaciones Next.js: configuración de nodos, estructuras de payload, manejo de errores y flujos completos.

---

## Configurar el nodo Webhook en n8n

### Configuración básica

1. Agrega el nodo **Webhook** como primer nodo del workflow
2. Configura:
   - **HTTP Method:** POST (usa GET solo para triggers de terceros que no soporten POST)
   - **Path:** nombre descriptivo sin slashes iniciales (ej: `payment-completed`, `user-created`)
   - **Response Mode:** "When Last Node Finishes" para responder con datos, "Immediately" para responder 200 y procesar en background
   - **Response Code:** 200

### Autenticación del Webhook Trigger

Usa **Header Auth** (recomendado para llamadas server-to-server):

- En el nodo Webhook → Authentication → Header Auth
- Header Name: `x-api-key`
- Header Value: genera un secreto con `openssl rand -hex 32`
- Guarda el mismo valor en tu app como `N8N_API_KEY`

Alternativa: **Basic Auth** si el servicio externo no soporta headers custom.

### Test URL vs Production URL

- **Test URL** (`/webhook-test/...`): solo funciona mientras el workflow está en "listening" (botón "Listen for test event"). No funciona con el workflow activo.
- **Production URL** (`/webhook/...`): solo funciona cuando el workflow está **activado** (toggle en la esquina superior derecha).

En desarrollo: usa la Test URL + ngrok. En producción: activa el workflow y usa la Production URL.

---

## Estructuras de Payload que n8n Espera

### Payload estándar desde tu app

Usa siempre esta estructura para consistencia entre workflows:

```json
{
  "event": "payment.completed",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-03-06T14:30:00.000Z",
  "data": {
    "userId": "user_2abc123",
    "amount": 4999,
    "currency": "usd",
    "orderId": "ord_xyz789"
  }
}
```

### Acceder a los datos en n8n

En nodos posteriores al Webhook, accede al payload con expresiones n8n:

```javascript
// Acceder al evento
{{ $json.event }}

// Acceder a datos anidados
{{ $json.data.userId }}
{{ $json.data.amount }}

// El ID único del webhook (útil para logging)
{{ $json.id }}

// Timestamp como fecha formateada
{{ $json.timestamp }}
```

### Eventos comunes y sus payloads

```typescript
// user.created — tras registro exitoso
{
  event: 'user.created',
  id: crypto.randomUUID(),
  timestamp: new Date().toISOString(),
  data: {
    userId: string,
    email: string,
    name: string,
    plan: 'free' | 'pro',
    source: 'signup-form' | 'oauth-google' | 'oauth-github',
  }
}

// payment.completed — tras pago exitoso
{
  event: 'payment.completed',
  id: crypto.randomUUID(),
  timestamp: new Date().toISOString(),
  data: {
    userId: string,
    orderId: string,
    amount: number,         // en centavos
    currency: string,       // 'usd', 'eur', 'mxn'
    plan: string,
    stripePaymentIntentId: string,
  }
}

// form.submitted — tras envío de formulario
{
  event: 'form.submitted',
  id: crypto.randomUUID(),
  timestamp: new Date().toISOString(),
  data: {
    formId: string,
    name: string,
    email: string,
    message: string,
    source: string,         // URL de la página
  }
}

// file.uploaded — tras subida de archivo
{
  event: 'file.uploaded',
  id: crypto.randomUUID(),
  timestamp: new Date().toISOString(),
  data: {
    userId: string,
    fileId: string,
    fileName: string,
    fileSize: number,
    mimeType: string,
    url: string,
  }
}
```

---

## HTTP Request Node — n8n llama a tu app

Configura el nodo **HTTP Request** en n8n para llamar a endpoints de Next.js:

### Configuración del nodo

- **Method:** POST
- **URL:** `https://tuapp.com/api/actions/{{ $json.action }}` o URL hardcodeada
- **Authentication:** Generic Credential Type → Header Auth
  - Name: `x-api-key`
  - Value: tu `INTERNAL_API_KEY`
- **Body Content Type:** JSON
- **Specify Body:** Using JSON / Using Fields Below

### Ejemplo: n8n notifica a tu app que el email fue enviado

```json
// Body del HTTP Request node en n8n
{
  "userId": "{{ $json.data.userId }}",
  "emailType": "welcome",
  "sentAt": "{{ $now }}"
}
```

### Manejo del response en n8n

El nodo HTTP Request recibe la respuesta de tu app. Si tu app responde:

```json
{ "success": true, "userId": "user_123" }
```

En el siguiente nodo puedes acceder con `{{ $json.success }}` y `{{ $json.userId }}`.

---

## Manejo de Errores en n8n

### Error Workflow global

Configura un workflow de errores en Settings → Error Workflow. Este workflow recibe todos los errores no manejados.

```javascript
// En el Error Workflow, el payload disponible es:
{{ $json.execution.id }}          // ID de la ejecución fallida
{{ $json.execution.url }}         // URL para ver la ejecución en n8n
{{ $json.error.message }}         // Mensaje de error
{{ $json.error.stack }}           // Stack trace
{{ $json.workflow.id }}           // ID del workflow
{{ $json.workflow.name }}         // Nombre del workflow
```

### Try/Catch en nodo Code

```javascript
// Nodo Code en n8n — manejo de errores local
try {
  const result = await someOperation()
  return [{ json: { success: true, result } }]
} catch (error) {
  // Puedes continuar el flujo con un error controlado
  return [{ json: { success: false, error: error.message } }]
}
```

### Continuar en error (Continue on Error)

En cada nodo → Settings → "Continue on Error: true" permite que el workflow continúe aunque ese nodo falle. El siguiente nodo recibe `{ error: {...} }` en lugar de los datos normales.

### Retry en HTTP Request node

Para el nodo HTTP Request que llama a tu app:
- Settings → Retry on Fail: true
- Max Tries: 3
- Wait Between Tries: 1000ms

---

## Workflow Completo: Usuario Registrado → CRM + Email

```
Webhook Trigger (path: user-created)
  └─> IF (plan === 'pro')
        ├─ true  → HTTP Request (POST /api/crm/contacts → agrega como lead calificado)
        │           └─> Send Email (bienvenida + acceso pro)
        └─ false → HTTP Request (POST /api/crm/contacts → agrega como lead free)
                    └─> Send Email (bienvenida + trial CTA)
```

### Nodo IF en n8n

- Condition: `{{ $json.data.plan }}` Equal To `pro`

### Extraer datos del webhook en nodos posteriores

```javascript
// En el nodo HTTP Request para CRM
// Body (JSON):
{
  "email": "{{ $json.data.email }}",
  "name": "{{ $json.data.name }}",
  "plan": "{{ $json.data.plan }}",
  "source": "webhook",
  "createdAt": "{{ $json.timestamp }}"
}
```

---

## Workflow Completo: Pago → Email + Factura + Slack

```
Webhook Trigger (path: payment-completed)
  └─> Set Node (preparar datos: formatear monto, construir nombre)
        └─> [Paralelo con Merge node]
              ├─> Gmail / Resend (email de confirmación al cliente)
              ├─> HTTP Request (generar factura en tu app o API externa)
              └─> Slack (notificar al equipo en #ventas)
```

### Set Node para preparar datos

```javascript
// En Set Node, agrega estos campos:
amountFormatted: "={{ ($json.data.amount / 100).toFixed(2) }} {{ $json.data.currency.toUpperCase() }}"
customerName:    "={{ $json.data.name || 'Cliente' }}"
orderUrl:        "=https://tuapp.com/orders/{{ $json.data.orderId }}"
```

---

## Depurar Webhooks en n8n

### Ver ejecuciones pasadas

Workflows → selecciona el workflow → "Executions" (ícono del reloj). Cada ejecución muestra el payload recibido y el resultado de cada nodo.

### Probar sin activar el workflow

1. Activa "Listen for test event" en el nodo Webhook
2. Envía el webhook desde tu app (o con curl)
3. n8n muestra los datos recibidos en tiempo real
4. Ejecuta el workflow manualmente para probar el resto del flujo

### Simular el webhook con curl durante desarrollo

```bash
# Probar el workflow con Test URL
curl -X POST "https://n8n.tudominio.com/webhook-test/payment-completed" \
  -H "Content-Type: application/json" \
  -H "x-api-key: tu-api-key-de-n8n" \
  -d '{
    "event": "payment.completed",
    "id": "test-123",
    "timestamp": "2026-03-06T14:30:00.000Z",
    "data": {
      "userId": "user_test",
      "orderId": "ord_test",
      "amount": 4999,
      "currency": "usd",
      "plan": "pro"
    }
  }'
```

### Logging desde nodo Code

```javascript
// En cualquier nodo Code, loguea a la consola de n8n
console.log('Processing payment:', $json.data.orderId)
console.log('Full payload:', JSON.stringify($json, null, 2))

// Los logs aparecen en el panel de output del nodo durante ejecución
return [{ json: $json }] // siempre retornar los datos
```

---

## Variables de Entorno en n8n

Guarda secretos como variables de entorno en n8n (Settings → Variables) y accede con:

```javascript
{{ $env.INTERNAL_API_KEY }}
{{ $env.RESEND_API_KEY }}
{{ $env.SLACK_WEBHOOK_URL }}
```

Esto evita exponer secretos en la configuración de los nodos.

---

## Checklist antes de activar un workflow en producción

- Cambia las URLs de Test URL a Production URL en sistemas externos (Stripe, GitHub, etc.)
- Activa el workflow (toggle ON)
- Verifica que el Header Auth secret coincide entre n8n y tu app
- Prueba con un evento real en staging antes de producción
- Configura el Error Workflow global para recibir alertas de fallos
- Revisa que los nodos críticos tengan "Retry on Fail" activado
