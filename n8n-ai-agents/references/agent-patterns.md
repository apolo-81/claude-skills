# Agent Patterns — n8n AI Agents

## 1. RAG con pgvector en Supabase

### Setup SQL completo

```sql
-- Habilitar extensión pgvector
create extension if not exists vector;

-- Tabla de documentos
create table documents (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  metadata jsonb default '{}',
  embedding vector(1536),
  created_at timestamptz default now()
);

-- Índice para búsqueda por similitud (coseno)
create index on documents using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Función de búsqueda semántica
create or replace function match_documents(
  query_embedding vector(1536),
  match_threshold float default 0.7,
  match_count int default 5
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    id,
    content,
    metadata,
    1 - (embedding <=> query_embedding) as similarity
  from documents
  where 1 - (embedding <=> query_embedding) > match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;
```

**Por qué IVFFlat:** Para colecciones pequeñas-medianas (< 1M docs). Más rápido que búsqueda exacta. Si tienes más de 100k docs, ajusta `lists` a `sqrt(num_rows)`.

---

## 2. Workflow n8n — Indexar Documentos

### Nodos en orden:

**1. Trigger** (Manual o Schedule o Webhook)
```
Configuración: recibe { file_url, file_type, metadata }
```

**2. HTTP Request** — Descargar archivo
```
Method: GET
URL: {{ $json.file_url }}
Response Format: File
```

**3. Default Data Loader** (para PDFs: PDF Loader)
```
Data Type: Binary
Binary Property: data
```

**4. Character Text Splitter**
```
Chunk Size: 1000
Chunk Overlap: 200
```

**Por qué overlap:** Evita cortar contexto importante en los bordes de los chunks. 200 caracteres garantizan continuidad semántica entre chunks.

**5. Embeddings OpenAI**
```
Model: text-embedding-3-small  (1536 dims, barato)
o
Model: text-embedding-3-large  (3072 dims, más preciso)
```

**6. Supabase Vector Store**
```
Operation: Insert
Table Name: documents
Query Name: embedding
Content Column: content
Metadata: {{ $json.metadata }}
```

---

## 3. Workflow n8n — RAG Query

### Nodos en orden:

**1. Webhook** — Recibe pregunta del usuario
```json
{ "question": "...", "session_id": "..." }
```

**2. Embeddings OpenAI** — Vectorizar la pregunta
```
Input: {{ $json.question }}
Model: text-embedding-3-small
```

**3. Supabase Vector Store** — Recuperar documentos relevantes
```
Operation: Get Many
Query Embedding: {{ $json.embedding }}
Limit: 5
Threshold: 0.7
```

**4. Code Node** — Construir contexto
```javascript
const docs = $input.all();
const context = docs
  .map((item, i) => `[Doc ${i+1}]: ${item.json.content}`)
  .join('\n\n');

return [{ json: { context, question: $('Webhook').first().json.question } }];
```

**5. Basic LLM Chain** — Responder con contexto
```
System Message:
Eres un asistente experto. Usa SOLO el siguiente contexto para responder.
Si la respuesta no está en el contexto, di "No tengo información sobre eso".

Contexto:
{{ $json.context }}

User Message:
{{ $json.question }}
```

**6. Respond to Webhook**
```
Response Body: {{ $json.text }}
```

---

## 4. Pattern A — Fire-and-Forget (Background)

**Caso de uso:** Clasificar un email recibido sin bloquear la respuesta al usuario.

### Next.js Route Handler
```typescript
// app/api/emails/incoming/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const email = await req.json()

  // Fire-and-forget: no await
  fetch(process.env.N8N_WEBHOOK_CLASSIFY_EMAIL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email_id: email.id,
      from: email.from,
      subject: email.subject,
      body: email.body,
    }),
  }).catch(console.error) // log pero no bloquea

  // Respuesta inmediata al cliente
  return NextResponse.json({ received: true })
}
```

### n8n Workflow
```
Webhook (POST) → AI Transform (clasificar) → Switch (por categoría)
  → BILLING: crear ticket en Zendesk
  → TECHNICAL: asignar a equipo técnico
  → GENERAL: auto-responder
```

**Consideración:** Si el webhook de n8n falla, el email no se clasifica. Para producción, usar una cola (Supabase + pg_cron o un job queue) antes del webhook.

---

## 5. Pattern B — Request-Response (Síncrono)

**Caso de uso:** Validar el contenido de un formulario con IA antes de guardarlo.

### Next.js Route Handler
```typescript
// app/api/posts/validate/route.ts
import { NextRequest, NextResponse } from 'next/server'

interface ValidationResult {
  approved: boolean
  reason: string
  suggestions: string[]
}

export async function POST(req: NextRequest) {
  const { content, title } = await req.json()

  const response = await fetch(process.env.N8N_WEBHOOK_VALIDATE_CONTENT!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, title }),
  })

  if (!response.ok) {
    return NextResponse.json(
      { error: 'Validation service unavailable' },
      { status: 503 }
    )
  }

  const result: ValidationResult = await response.json()

  return NextResponse.json(result)
}
```

### n8n Workflow
```
Webhook (POST) → Basic LLM Chain (validar contenido) → Code (parsear JSON) → Respond to Webhook
```

**Prompt de validación:**
```
Analiza este contenido para un blog profesional.

Título: {{ $json.title }}
Contenido: {{ $json.content }}

Responde SOLO con este JSON (sin markdown):
{
  "approved": true/false,
  "reason": "explicación breve",
  "suggestions": ["mejora 1", "mejora 2"]
}

Criterios: sin spam, sin contenido ofensivo, mínimo 100 palabras, relevante al negocio.
```

**Timeout:** El nodo Respond to Webhook de n8n espera hasta 5 minutos. Para operaciones largas, usa el Pattern D.

---

## 6. Pattern C — Streaming con SSE

**Caso de uso:** Chat en tiempo real donde el usuario ve el texto aparecer progresivamente.

### Next.js Route Handler (SSE)
```typescript
// app/api/chat/route.ts
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const { message, sessionId } = await req.json()

  // n8n responde con SSE si el nodo Respond to Webhook tiene streaming habilitado
  // Alternativa: hacer streaming directo con Claude API y guardar en n8n async
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await fetch(process.env.N8N_WEBHOOK_CHAT!, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, session_id: sessionId }),
        })

        const reader = response.body?.getReader()
        if (!reader) throw new Error('No response body')

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          // Forward chunks como SSE
          const chunk = new TextDecoder().decode(value)
          controller.enqueue(encoder.encode(`data: ${chunk}\n\n`))
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
```

### Cliente React
```typescript
// components/Chat.tsx
'use client'

import { useState } from 'react'

export function Chat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)

  async function sendMessage() {
    if (!input.trim() || streaming) return

    const userMessage = input
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setStreaming(true)

    // Agregar mensaje vacío del asistente
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage, sessionId: 'user-123' }),
    })

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '))

      for (const line of lines) {
        const data = line.replace('data: ', '')
        if (data === '[DONE]') break

        setMessages(prev => {
          const last = prev[prev.length - 1]
          return [...prev.slice(0, -1), { ...last, content: last.content + data }]
        })
      }
    }

    setStreaming(false)
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-100 ml-8' : 'bg-gray-100 mr-8'}`}>
            {msg.content}
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-4">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          className="flex-1 border rounded px-3 py-2"
          placeholder="Escribe un mensaje..."
        />
        <button onClick={sendMessage} disabled={streaming} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
          Enviar
        </button>
      </div>
    </div>
  )
}
```

---

## 7. Pattern D — Async con Supabase Realtime

**Caso de uso:** Análisis de documento largo (30+ segundos). El usuario ve el progreso en tiempo real.

### Flujo completo

```
1. POST /api/analyze → inserta job en Supabase → devuelve job_id
2. n8n webhook recibe job_id → procesa documento → actualiza Supabase
3. Cliente escucha Supabase Realtime → muestra progreso/resultado
```

### Supabase: tabla de jobs
```sql
create table analysis_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  status text default 'pending' check (status in ('pending', 'processing', 'done', 'error')),
  input jsonb not null,
  result jsonb,
  error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: solo el dueño puede ver su job
alter table analysis_jobs enable row level security;
create policy "users see own jobs" on analysis_jobs
  for all using (auth.uid() = user_id);
```

### Next.js: crear job
```typescript
// app/api/analyze/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // Crear job en Supabase
  const { data: job, error } = await supabase
    .from('analysis_jobs')
    .insert({ user_id: user.id, input: body })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Disparar n8n en background
  fetch(process.env.N8N_WEBHOOK_ANALYZE!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_id: job.id, ...body }),
  }).catch(console.error)

  return NextResponse.json({ job_id: job.id })
}
```

### Cliente: escuchar con Realtime
```typescript
// components/AnalysisStatus.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function AnalysisStatus({ jobId }: { jobId: string }) {
  const [status, setStatus] = useState<string>('pending')
  const [result, setResult] = useState<unknown>(null)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel(`job-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'analysis_jobs',
          filter: `id=eq.${jobId}`,
        },
        (payload) => {
          setStatus(payload.new.status)
          if (payload.new.result) setResult(payload.new.result)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [jobId, supabase])

  return (
    <div>
      <p>Estado: {status}</p>
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  )
}
```

### n8n: actualizar job al terminar
```
Webhook → [proceso largo con AI] → Supabase (Update Row)
  Table: analysis_jobs
  Row ID: {{ $json.job_id }}
  Fields: { status: "done", result: {{ $json.result }}, updated_at: now() }
```

---

## 8. Postgres Chat Memory — Configuración Completa

### SQL en Supabase
```sql
create table n8n_chat_memory (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  message jsonb not null,
  created_at timestamptz default now()
);

create index on n8n_chat_memory (session_id, created_at);
```

### Configuración del nodo en n8n
```
Node: Postgres Chat Memory
Connection: [Tu conexión a Supabase PostgreSQL]
  Host: db.<project-ref>.supabase.co
  Port: 5432
  Database: postgres
  User: postgres
  Password: [tu password]
  SSL: require

Table Name: n8n_chat_memory
Session ID: {{ $json.user_id }}_{{ $json.conversation_id }}
Context Window Length: 10
```

**Por qué 10 mensajes:** Equilibrio entre contexto y tokens. Para soporte técnico donde el contexto es crítico, sube a 20. Para clasificación simple, baja a 4.

---

## 9. AI Agent con Custom HTTP Request Tools

### Configuración de cada tool

El agente decide qué tool usar basado en la **descripción**. Esta es la parte más importante.

**Tool: Buscar empresa**
```
Name: search_company
Description: Busca información pública sobre una empresa dado su nombre.
  Devuelve: website, descripción, número de empleados, sector, país.
  Úsala cuando necesites datos básicos de una empresa.

HTTP Method: GET
URL: https://api.apollo.io/v1/organizations/search
Headers:
  x-api-key: {{ $vars.apollo_api_key }}
Query Parameters:
  q: {{ $fromAI('company_name', 'El nombre de la empresa a buscar') }}
```

**Tool: Buscar contactos**
```
Name: find_contacts
Description: Encuentra contactos (emails, LinkedIn) de personas en una empresa.
  Requiere: company_domain o company_name.
  Devuelve: lista de contactos con nombre, cargo, email, LinkedIn.
  Úsala DESPUÉS de search_company para encontrar a quién contactar.

HTTP Method: GET
URL: https://api.apollo.io/v1/people/search
Headers:
  x-api-key: {{ $vars.apollo_api_key }}
Query Parameters:
  organization_name: {{ $fromAI('company', 'Nombre o dominio de la empresa') }}
  per_page: 5
```

**Tool: Enviar email**
```
Name: send_email
Description: Envía un email a un contacto. Úsala SOLO cuando el usuario
  confirme que quiere enviar. No la uses para buscar información.

HTTP Method: POST
URL: https://api.resend.com/emails
Headers:
  Authorization: Bearer {{ $vars.resend_api_key }}
  Content-Type: application/json
Body (JSON):
  {
    "from": "{{ $vars.from_email }}",
    "to": "{{ $fromAI('to', 'Email del destinatario') }}",
    "subject": "{{ $fromAI('subject', 'Asunto del email') }}",
    "html": "{{ $fromAI('body', 'Cuerpo del email en HTML') }}"
  }
```

---

## 10. Error Handling en Agentes

### Problemas comunes y soluciones

**Agente en loop infinito:**
- Síntoma: el agente llama la misma tool repetidamente
- Causa: la tool no devuelve lo que el agente espera, o la descripción es ambigua
- Solución: agregar `Max Iterations: 5` en la config del agente. Mejorar la descripción de la tool con ejemplos de cuándo NO usarla.

**Tool devuelve error y el agente no lo maneja:**
```javascript
// En el Code Node después de la HTTP Request Tool:
const response = $input.first().json

if (response.error || response.status >= 400) {
  return [{
    json: {
      success: false,
      error: response.error?.message || 'API error',
      data: null
    }
  }]
}

return [{ json: { success: true, data: response } }]
```

Agregar al system prompt del agente:
```
Si una tool devuelve { success: false }, informa al usuario del error
y sugiere alternativas. No intentes la misma tool más de 2 veces.
```

**Agente no devuelve JSON cuando se lo pides:**

Usar el nodo **Information Extractor** en lugar de pedir JSON al agente directamente. O agregar al final del workflow un Code Node:

```javascript
const output = $input.first().json.output

// Intentar parsear JSON si el modelo lo envolvió en markdown
const jsonMatch = output.match(/```(?:json)?\n?([\s\S]*?)\n?```/)
const jsonStr = jsonMatch ? jsonMatch[1] : output

try {
  return [{ json: JSON.parse(jsonStr) }]
} catch {
  // Si no es JSON válido, devolver el texto en un campo
  return [{ json: { raw_output: output, parse_error: true } }]
}
```

**Timeout del webhook (5 min limit):**
- Para procesos > 2 minutos: usar Pattern D (async con Supabase Realtime)
- Configurar n8n: `Execution Timeout` en Settings → aumentar si self-hosted
- Agregar nodo `Respond to Webhook` temprano con un `job_id` y procesar el resto en background
