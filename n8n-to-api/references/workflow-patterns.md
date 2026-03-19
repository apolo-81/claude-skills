# Workflow Patterns — Configuracion de n8n

## Webhook Trigger Node

El nodo de entrada de todos los patrones. Configuracion completa:

| Campo | Valor |
|-------|-------|
| HTTP Method | POST |
| Path | nombre-descriptivo (ej: `send-welcome-email`) |
| Authentication | Header Auth (recomendado en produccion) |
| Response Mode | `On Received` (fire-and-forget) o `Using Respond to Webhook Node` |
| IP Whitelist | IPs de Vercel si es posible |

**Test URL vs Production URL:**
- Test URL: `https://tu-n8n.com/webhook-test/send-welcome-email` — solo activa cuando el workflow esta abierto en el editor
- Production URL: `https://tu-n8n.com/webhook/send-welcome-email` — siempre activa con el workflow activado
- En `.env.local` siempre usar la Production URL

**Configurar Header Auth en n8n:**
1. Webhook node > Authentication > Header Auth
2. Name: `X-N8N-Api-Key`
3. Value: mismo valor que `N8N_API_KEY` en tu app

---

## Respond to Webhook Node (Pattern B)

Necesario para que n8n devuelva datos al caller (request-response sincrono).

```json
{
  "node": "Respond to Webhook",
  "config": {
    "respondWith": "json",
    "responseBody": "={{ { valid: $json.isValid, company: $json.companyName } }}",
    "responseHeaders": {
      "Content-Type": "application/json"
    },
    "responseCode": 200
  }
}
```

Colocar este nodo al FINAL del flujo de procesamiento, no al principio.
Para errores, usar `responseCode: 422` o `500` segun el caso.

---

## HTTP Request Node — n8n llama a Next.js (Pattern D)

Configuracion del nodo cuando n8n necesita llamar de vuelta a la app:

```json
{
  "node": "HTTP Request",
  "config": {
    "method": "POST",
    "url": "https://tu-app.vercel.app/api/n8n/callback",
    "authentication": "predefinedCredentialType",
    "sendHeaders": true,
    "headers": {
      "X-N8N-Api-Key": "={{ $env.N8N_CALLBACK_SECRET }}",
      "Content-Type": "application/json"
    },
    "sendBody": true,
    "bodyParameters": {
      "eventId": "={{ $json.eventId }}",
      "status": "completed",
      "result": "={{ $json }}"
    }
  }
}
```

Guardar el secret en n8n: Settings > Credentials > New > HTTP Header Auth

---

## Error Workflow Global

Configurar un workflow de manejo de errores para todos los workflows:

1. Settings > n8n Settings > Error Workflow > seleccionar workflow dedicado
2. El Error Workflow recibe: `$execution.error`, `$workflow.name`, `$workflow.id`

Estructura del Error Workflow:

```
[Trigger: Error]
  → [Set: formatear mensaje]
  → [Slack: notificar #errores-n8n]
  → [Supabase: INSERT en n8n_error_log]
```

Mensaje de Slack util:
```
*Error en workflow:* {{ $workflow.name }}
*Error:* {{ $execution.error.message }}
*Node:* {{ $execution.error.node.name }}
*Execution ID:* {{ $execution.id }}
<https://tu-n8n.com/executions/{{ $execution.id }}|Ver ejecucion>
```

---

## Schema SQL Completo — Tabla n8n_events

```sql
-- Tabla principal para tracking de eventos n8n
create table public.n8n_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  type        text not null,           -- nombre del workflow
  payload     jsonb,                   -- datos enviados a n8n
  status      text not null default 'pending'
                check (status in ('pending', 'processing', 'completed', 'failed')),
  result      jsonb,                   -- datos devueltos por n8n
  error       text,                    -- mensaje de error si fallo
  attempts    int not null default 0,  -- numero de intentos
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Indices para queries frecuentes
create index n8n_events_user_id_idx    on public.n8n_events (user_id);
create index n8n_events_status_idx     on public.n8n_events (status);
create index n8n_events_type_idx       on public.n8n_events (type);
create index n8n_events_created_at_idx on public.n8n_events (created_at desc);

-- Actualizar updated_at automaticamente
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger n8n_events_updated_at
  before update on public.n8n_events
  for each row execute function update_updated_at();

-- RLS: usuarios solo ven sus propios eventos
alter table public.n8n_events enable row level security;

create policy "Users can view own events"
  on public.n8n_events for select
  using (auth.uid() = user_id);

create policy "Service role can do everything"
  on public.n8n_events for all
  using (auth.role() = 'service_role');

-- Tabla de log de errores
create table public.n8n_error_log (
  id             uuid primary key default gen_random_uuid(),
  workflow_name  text not null,
  workflow_id    text,
  execution_id   text,
  error_message  text,
  error_node     text,
  created_at     timestamptz not null default now()
);
```

---

## Los 4 Patterns como Workflows n8n

### Pattern A — Fire-and-Forget: Contact Form

```
[Webhook: POST /contact-form]
  → [Set: extraer campos { name, email, message }]
  → [Split: ejecutar en paralelo]
      ├── [Gmail / SMTP: enviar email al equipo]
      ├── [Notion: crear pagina en DB Contactos]
      └── [Slack: mensaje en #leads]
  → [Respond to Webhook: { success: true }]  ← opcional, mejora velocidad si se omite
```

Configurar `Response Mode: On Received` en el Webhook node para no bloquear.

### Pattern B — Request-Response: Validar VAT

```
[Webhook: POST /validate-vat, Response Mode: Using Respond to Webhook Node]
  → [HTTP Request: GET https://ec.europa.eu/taxation_customs/vies/rest-api/ms/{country}/vat/{number}]
  → [IF: statusCode == 200 AND isValid == true]
      ├── [True → Set: { valid: true, company: $json.name }]
      └── [False → Set: { valid: false, company: null }]
  → [Respond to Webhook: $json]
```

### Pattern C — Async: Generar PDF

```
[Webhook: POST /generate-report]
  → [Set: guardar eventId del payload]
  → [Respond to Webhook: { received: true }]   ← responde INMEDIATAMENTE

  [continua en segundo plano...]
  → [HTTP Request: API de generacion de PDF]
  → [Supabase: INSERT/UPDATE file en Storage]
  → [HTTP Request: POST /api/n8n/callback]
      body: { eventId, status: "completed", result: { pdfUrl } }

  [Si error en cualquier paso:]
  → [HTTP Request: POST /api/n8n/callback]
      body: { eventId, status: "failed", error: "mensaje de error" }
```

Clave: el nodo `Respond to Webhook` debe estar ANTES del procesamiento largo.
En n8n esto se logra con el nodo en modo `Respond to Webhook` y activando la ejecucion asincrona del resto.

### Pattern D — n8n llama a Next.js: Cron de sincronizacion

```
[Schedule Trigger: cada hora]
  → [HTTP Request: GET api-externa.com/metrics]
  → [Code: transformar y limpiar datos]
      // Agrupaciones, calculos, normalizacion
  → [HTTP Request: POST https://tu-app.com/api/n8n/sync-metrics]
      headers: { X-N8N-Api-Key: {{ $env.CALLBACK_SECRET }} }
      body: { metrics: $json }
  → [IF: respuesta != 200]
      → [Slack: alertar error de sincronizacion]
```

---

## Manejo de Errores en Workflows

### Patron try-catch en n8n

Para cada HTTP Request critico, conectar el output de error:

```
[HTTP Request: llamada critica]
  ↓ (success)          ↓ (error — conectar el puerto rojo)
[continua flujo]    [Set: { error: true, message: $json.error }]
                      → [Supabase: log error]
                      → [Respond to Webhook: { error } con status 500]
```

### Activar "Continue on Fail" con precaucion

Solo activar `Continue on Fail` en nodos donde el error es esperado y manejable (ej: buscar un registro que puede no existir).

### Retry automatico en n8n

En el Webhook node y HTTP Request nodes, activar:
- `Retry on Fail`: true
- `Max Tries`: 3
- `Wait Between Tries`: 1000ms

---

## Variables de Entorno en n8n

Configurar en n8n > Settings > Variables (o en el archivo `.env` de n8n):

```bash
# Variables disponibles como $env.NOMBRE en expresiones
N8N_CALLBACK_SECRET=mismo-valor-que-en-nextjs
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

Acceder en expresiones: `{{ $env.N8N_CALLBACK_SECRET }}`

---

## Checklist de Produccion

- [ ] Webhook nodes usan Production URL (no Test URL)
- [ ] Header Auth configurado en todos los Webhook nodes
- [ ] Error Workflow global configurado
- [ ] Variables sensibles en n8n Variables (no hardcodeadas)
- [ ] Workflows activados (toggle en la esquina superior derecha)
- [ ] RLS activo en tabla `n8n_events`
- [ ] Service role key usada para updates desde n8n (no anon key)
- [ ] Timeout configurado en HTTP Request nodes (default: 300s — reducir a 30s)
- [ ] Notificacion en Slack para errores criticos
