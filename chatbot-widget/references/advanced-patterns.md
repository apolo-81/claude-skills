# Advanced Patterns — Chatbot Widget

Patrones avanzados con código completo y funcional.

---

## 1. Tool Use con n8n — Webhook dentro del execute

```typescript
// app/api/chat/route.ts
import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: `
Eres el asistente de soporte de Acme. Puedes crear tickets y agendar demos.
Cuando el usuario pide crear un ticket, usa createSupportTicket.
Cuando el usuario pide hablar con ventas, usa scheduleDemoCall.
    `.trim(),
    messages,
    maxSteps: 5,
    tools: {
      createSupportTicket: {
        description: 'Crea un ticket de soporte en el sistema',
        parameters: z.object({
          title: z.string().describe('Título breve del problema'),
          description: z.string().describe('Descripción completa del problema'),
          priority: z.enum(['low', 'medium', 'high']).default('medium'),
          userEmail: z.string().email().optional().describe('Email del usuario si lo proporcionó'),
        }),
        execute: async ({ title, description, priority, userEmail }) => {
          try {
            // Llamar al webhook de n8n — n8n procesa y guarda en Supabase, Linear, Jira, etc.
            const response = await fetch(process.env.N8N_SUPPORT_WEBHOOK!, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title, description, priority, userEmail }),
            })

            if (!response.ok) throw new Error(`n8n webhook failed: ${response.status}`)

            const data = await response.json()
            return {
              success: true,
              ticketId: data.ticketId ?? `TKT-${Date.now()}`,
              message: `Ticket #${data.ticketId} creado. Recibirás una respuesta en menos de 24h.`,
            }
          } catch (err) {
            return { success: false, message: 'No pude crear el ticket ahora. Por favor intenta más tarde.' }
          }
        },
      },

      scheduleDemoCall: {
        description: 'Agenda una llamada de demo con el equipo de ventas',
        parameters: z.object({
          name: z.string().describe('Nombre completo del prospecto'),
          email: z.string().email().describe('Email del prospecto'),
          company: z.string().optional().describe('Empresa del prospecto'),
          preferredTime: z.string().describe('Horario preferido en lenguaje natural, ej: "martes o miércoles por la tarde"'),
          useCase: z.string().optional().describe('Para qué quiere usar el producto'),
        }),
        execute: async ({ name, email, company, preferredTime, useCase }) => {
          // n8n puede: enviar email de confirmación, crear lead en CRM, notificar a Slack
          const response = await fetch(process.env.N8N_DEMO_WEBHOOK!, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, company, preferredTime, useCase }),
          })

          const data = await response.json()
          return {
            success: true,
            calendarLink: data.calendarLink, // ej: Calendly link generado
            message: `Perfecto ${name}. Te enviaremos un email a ${email} con el link para agendar tu demo. El equipo se pondrá en contacto pronto.`,
          }
        },
      },

      searchKnowledgeBase: {
        description: 'Busca en la base de conocimiento del producto',
        parameters: z.object({
          query: z.string().describe('Consulta de búsqueda'),
        }),
        execute: async ({ query }) => {
          // Llamar a n8n que ejecuta búsqueda semántica en Supabase
          const response = await fetch(`${process.env.N8N_SEARCH_WEBHOOK}?q=${encodeURIComponent(query)}`)
          const data = await response.json()
          return { results: data.results ?? [], found: data.results?.length > 0 }
        },
      },
    },
  })

  return result.toDataStreamResponse()
}
```

**Cómo mostrar resultados de tools al usuario** — `useChat` lo hace automáticamente. El modelo formula una respuesta en lenguaje natural usando el resultado del `execute`. No necesitas código extra en el cliente.

Para mostrar UI personalizada por tool (ej: un card con el ticket creado):
```tsx
// En ChatMessages.tsx — detectar tool results en los messages
{msg.toolInvocations?.map((tool) => (
  tool.state === 'result' && tool.toolName === 'createSupportTicket' && (
    <div key={tool.toolCallId} className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700 text-sm">
      <p className="font-medium text-green-800 dark:text-green-300">Ticket creado: #{tool.result.ticketId}</p>
    </div>
  )
))}
```

---

## 2. RAG con Supabase pgvector

### Schema SQL

```sql
-- Habilitar extensión pgvector
create extension if not exists vector;

-- Tabla de chunks de documentación
create table document_chunks (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  embedding vector(1536),   -- 1536 para text-embedding-3-small de OpenAI
                             -- o 1024 para voyage-3-lite de Anthropic
  metadata jsonb default '{}', -- { source, title, url, section }
  created_at timestamptz default now()
);

-- Índice HNSW para búsqueda aproximada rápida
create index on document_chunks using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- Función para búsqueda semántica
create or replace function match_documents(
  query_embedding vector(1536),
  match_count int default 5,
  match_threshold float default 0.7
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    dc.id,
    dc.content,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) as similarity
  from document_chunks dc
  where 1 - (dc.embedding <=> query_embedding) > match_threshold
  order by dc.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

### Script de indexación de docs

```typescript
// scripts/index-docs.ts
// Ejecutar: npx tsx scripts/index-docs.ts
import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import OpenAI from 'openai' // o Anthropic voyage

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

function chunkText(text: string, maxChars = 1500): string[] {
  const paragraphs = text.split(/\n\n+/)
  const chunks: string[] = []
  let current = ''

  for (const para of paragraphs) {
    if ((current + para).length > maxChars && current) {
      chunks.push(current.trim())
      current = para
    } else {
      current += (current ? '\n\n' : '') + para
    }
  }
  if (current) chunks.push(current.trim())
  return chunks.filter((c) => c.length > 50)
}

async function embedText(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })
  return response.data[0].embedding
}

async function indexDirectory(dir: string) {
  const files = readdirSync(dir).filter((f) => f.endsWith('.md') || f.endsWith('.txt'))
  console.log(`Indexando ${files.length} archivos...`)

  for (const file of files) {
    const content = readFileSync(join(dir, file), 'utf-8')
    const chunks = chunkText(content)
    console.log(`  ${file}: ${chunks.length} chunks`)

    for (const chunk of chunks) {
      const embedding = await embedText(chunk)
      await supabase.from('document_chunks').insert({
        content: chunk,
        embedding,
        metadata: { source: file },
      })
      // Rate limiting
      await new Promise((r) => setTimeout(r, 100))
    }
  }
  console.log('Indexacion completa.')
}

indexDirectory(join(process.cwd(), 'content'))
```

### RAG en la API route

```typescript
// lib/rag.ts
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function getRelevantContext(query: string, maxChunks = 5): Promise<string> {
  // 1. Generar embedding de la query
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  })
  const queryEmbedding = embeddingResponse.data[0].embedding

  // 2. Buscar chunks relevantes en Supabase
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_count: maxChunks,
    match_threshold: 0.6,
  })

  if (error || !data?.length) return ''

  // 3. Formatear contexto
  return data
    .map((chunk: { content: string; metadata: { source?: string } }) =>
      `[${chunk.metadata?.source ?? 'doc'}]\n${chunk.content}`
    )
    .join('\n\n---\n\n')
}

// app/api/chat/route.ts — con RAG
export async function POST(req: Request) {
  const { messages } = await req.json()

  // Extraer última pregunta del usuario
  const lastUserMessage = [...messages].reverse().find((m: { role: string }) => m.role === 'user')?.content ?? ''
  const context = await getRelevantContext(lastUserMessage)

  const system = context
    ? `Eres el asistente de Acme. Usa SOLO la siguiente documentación para responder:\n\n${context}\n\nSi la respuesta no está en la documentación, dilo explícitamente.`
    : `Eres el asistente de Acme. Responde preguntas sobre el producto.`

  const result = streamText({ model: anthropic('claude-sonnet-4-6'), system, messages })
  return result.toDataStreamResponse()
}
```

---

## 3. Conversation History con Supabase

### Schema SQL completo

```sql
create table conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text,                         -- generado del primer mensaje
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  tokens_used integer,
  created_at timestamptz default now()
);

-- RLS: usuarios solo ven sus conversaciones
alter table conversations enable row level security;
alter table messages enable row level security;

create policy "users_own_conversations" on conversations
  for all using (auth.uid() = user_id);

create policy "users_own_messages" on messages
  for all using (
    conversation_id in (
      select id from conversations where user_id = auth.uid()
    )
  );

-- Índices
create index on conversations (user_id, updated_at desc);
create index on messages (conversation_id, created_at);
```

### Hook useChatHistory

```typescript
// hooks/useChatHistory.ts
'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface Conversation {
  id: string
  title: string | null
  created_at: string
  updated_at: string
}

export function useChatHistory() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('conversations')
        .select('id, title, created_at, updated_at')
        .order('updated_at', { ascending: false })
        .limit(50)

      setConversations(data ?? [])
      setIsLoading(false)
    }
    load()
  }, [supabase])

  async function createConversation(firstMessage: string): Promise<string> {
    const title = firstMessage.slice(0, 60) + (firstMessage.length > 60 ? '...' : '')
    const { data } = await supabase
      .from('conversations')
      .insert({ title })
      .select('id')
      .single()
    return data!.id
  }

  async function deleteConversation(id: string) {
    await supabase.from('conversations').delete().eq('id', id)
    setConversations((prev) => prev.filter((c) => c.id !== id))
  }

  return { conversations, isLoading, createConversation, deleteConversation }
}
```

### API route con persistencia

```typescript
// app/api/chat/route.ts — con guardado en Supabase
import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { messages, conversationId } = await req.json()

  // Crear conversación si no existe
  let convId = conversationId
  if (!convId) {
    const firstMsg = messages[0]?.content ?? 'Nueva conversación'
    const { data } = await supabase
      .from('conversations')
      .insert({ user_id: user.id, title: firstMsg.slice(0, 60) })
      .select('id')
      .single()
    convId = data!.id
  }

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    messages,
    onFinish: async ({ text, usage }) => {
      // Guardar el último mensaje del usuario + respuesta del assistant
      const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === 'user')
      await supabase.from('messages').insert([
        { conversation_id: convId, role: 'user', content: lastUserMsg?.content ?? '' },
        { conversation_id: convId, role: 'assistant', content: text, tokens_used: usage.completionTokens },
      ])
      // Actualizar timestamp de la conversación
      await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', convId)
    },
  })

  // Incluir conversationId en la respuesta para que el cliente lo guarde
  const response = result.toDataStreamResponse()
  response.headers.set('X-Conversation-Id', convId)
  return response
}
```

---

## 4. Rate Limiting con Supabase

```sql
-- Tabla para rate limiting (alternativa simple a Redis/Upstash)
create table rate_limits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  window_start timestamptz not null,
  request_count integer default 1,
  unique (user_id, window_start)
);

create index on rate_limits (user_id, window_start);
```

```typescript
// lib/rate-limit.ts
import { SupabaseClient } from '@supabase/supabase-js'

const WINDOW_MINUTES = 60
const MAX_REQUESTS = 20

export async function checkRateLimit(
  supabase: SupabaseClient,
  userId: string
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  // Ventana de 1 hora redondeada al inicio de la hora
  const now = new Date()
  const windowStart = new Date(now)
  windowStart.setMinutes(0, 0, 0)
  const resetAt = new Date(windowStart.getTime() + WINDOW_MINUTES * 60_000)

  // Upsert: incrementar contador o crear si no existe
  const { data, error } = await supabase.rpc('increment_rate_limit', {
    p_user_id: userId,
    p_window_start: windowStart.toISOString(),
    p_max_requests: MAX_REQUESTS,
  })

  // Fallback si no existe la función RPC: query directa
  if (error) {
    const { count } = await supabase
      .from('rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('window_start', windowStart.toISOString())

    const used = count ?? 0
    return { allowed: used < MAX_REQUESTS, remaining: Math.max(0, MAX_REQUESTS - used), resetAt }
  }

  return {
    allowed: data.allowed,
    remaining: Math.max(0, MAX_REQUESTS - data.count),
    resetAt,
  }
}

// Función SQL para atomic increment
// create or replace function increment_rate_limit(p_user_id uuid, p_window_start timestamptz, p_max_requests int)
// returns json language plpgsql as $$
// declare v_count int;
// begin
//   insert into rate_limits (user_id, window_start, request_count)
//   values (p_user_id, p_window_start, 1)
//   on conflict (user_id, window_start)
//   do update set request_count = rate_limits.request_count + 1
//   returning request_count into v_count;
//   return json_build_object('count', v_count, 'allowed', v_count <= p_max_requests);
// end;
// $$;
```

### Uso en API route con headers de Rate Limit

```typescript
// app/api/chat/route.ts
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { allowed, remaining, resetAt } = await checkRateLimit(supabase, user.id)

  if (!allowed) {
    return Response.json(
      { error: 'Has alcanzado el límite de mensajes. Intenta de nuevo en una hora.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': resetAt.toISOString(),
          'Retry-After': String(Math.ceil((resetAt.getTime() - Date.now()) / 1000)),
        },
      }
    )
  }

  // ... streamText normal
  const result = streamText({ /* ... */ })
  const response = result.toDataStreamResponse()
  response.headers.set('X-RateLimit-Remaining', String(remaining - 1))
  return response
}
```

---

## 5. Multi-modal — Imágenes en el chat

El usuario puede enviar screenshots o imágenes para que el asistente las analice.

### Frontend — Input con imágenes

```tsx
// components/ChatInput.tsx — con soporte de imágenes
'use client'

import { useRef, useState, ChangeEvent, FormEvent } from 'react'
import { Paperclip, X, Send } from 'lucide-react'
import { useChat } from 'ai/react'

export function ChatInputWithImages() {
  const [attachedImages, setAttachedImages] = useState<{ url: string; file: File }[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { messages, input, handleInputChange, append, isLoading } = useChat({ api: '/api/chat' })

  async function handleImageAttach(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const newImages = await Promise.all(
      files.slice(0, 3).map(async (file) => ({ // máx 3 imágenes
        file,
        url: await fileToBase64(file),
      }))
    )
    setAttachedImages((prev) => [...prev, ...newImages].slice(0, 3))
  }

  function removeImage(index: number) {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault()
    if (!input.trim() && attachedImages.length === 0) return

    // Construir mensaje multi-modal
    const content: Array<{ type: string; text?: string; image?: string; mimeType?: string }> = []

    if (input.trim()) {
      content.push({ type: 'text', text: input })
    }

    for (const img of attachedImages) {
      content.push({
        type: 'image',
        image: img.url.split(',')[1], // base64 sin el prefijo data:...
        mimeType: img.file.type,
      })
    }

    await append({ role: 'user', content: content as any })
    setAttachedImages([])
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-3 space-y-2">
      {/* Preview de imágenes adjuntas */}
      {attachedImages.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {attachedImages.map((img, i) => (
            <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(i)}
                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSend} className="flex items-end gap-2">
        {/* Botón adjuntar imagen */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <Paperclip size={16} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={handleImageAttach}
        />

        <textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Escribe tu pregunta o adjunta una imagen..."
          rows={1}
          className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          type="submit"
          disabled={isLoading || (!input.trim() && attachedImages.length === 0)}
          className="flex-shrink-0 w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center disabled:opacity-40"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  )
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.readAsDataURL(file)
  })
}
```

### API route — multi-modal con Claude

```typescript
// app/api/chat/route.ts — Claude maneja imágenes nativamente
import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

export async function POST(req: Request) {
  const { messages } = await req.json()

  // Vercel AI SDK pasa los content arrays directamente a la API de Anthropic
  // Claude claude-sonnet-4-6 acepta imágenes en base64 o URLs
  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: 'Eres un asistente que puede analizar imágenes y texto. Si el usuario envía una imagen, descríbela y responde según el contexto.',
    messages, // Los mensajes con imágenes ya vienen en el formato correcto de Vercel AI SDK
  })

  return result.toDataStreamResponse()
}
```

---

## 6. Observabilidad con Helicone

```typescript
// lib/anthropic.ts — cliente singleton con Helicone
import { createAnthropic } from '@ai-sdk/anthropic'

export const heliconeAnthropic = createAnthropic({
  baseURL: 'https://anthropic.helicone.ai/v1',
  headers: {
    'Helicone-Auth': `Bearer ${process.env.HELICONE_API_KEY}`,
    'Helicone-Property-App': 'chatbot-widget',
    'Helicone-User-Id': 'will-be-set-per-request', // sobrescribir por request
  },
})

// app/api/chat/route.ts
import { heliconeAnthropic } from '@/lib/anthropic'

export async function POST(req: Request) {
  const { messages } = await req.json()
  const user = await getUser(req)

  const model = heliconeAnthropic('claude-sonnet-4-6', {
    // Headers por request para tracking de usuarios
    headers: {
      'Helicone-User-Id': user?.id ?? 'anonymous',
      'Helicone-Property-Plan': user?.plan ?? 'free',
    },
  } as any)

  const result = streamText({ model, messages })
  return result.toDataStreamResponse()
}
```

### Alertas de costo con cron

```typescript
// app/api/cron/cost-alert/route.ts
// Configurar en vercel.json: { "crons": [{ "path": "/api/cron/cost-alert", "schedule": "0 9 * * *" }] }

export async function GET(req: Request) {
  // Verificar que viene de Vercel Cron
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

  // Calcular tokens del día anterior
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0]
  const { data } = await supabase
    .from('chat_usage')
    .select('tokens, model')
    .gte('created_at', yesterday)

  const totalTokens = data?.reduce((sum, row) => sum + (row.tokens ?? 0), 0) ?? 0

  // Costos aproximados (USD per 1M tokens)
  const COSTS: Record<string, { input: number; output: number }> = {
    'claude-haiku-4-5': { input: 0.25, output: 1.25 },
    'claude-sonnet-4-6': { input: 3, output: 15 },
  }

  const estimatedCost = totalTokens * (3 / 1_000_000) // estimación promedio

  const THRESHOLD_USD = Number(process.env.DAILY_COST_THRESHOLD_USD ?? 10)

  if (estimatedCost > THRESHOLD_USD) {
    // Enviar alerta — aquí puedes usar Resend, SendGrid, Slack webhook, etc.
    await fetch(process.env.SLACK_ALERT_WEBHOOK!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `Alerta de costo LLM: $${estimatedCost.toFixed(2)} USD ayer (threshold: $${THRESHOLD_USD}). Tokens: ${totalTokens.toLocaleString()}.`,
      }),
    })
  }

  return Response.json({ totalTokens, estimatedCost, threshold: THRESHOLD_USD })
}
```
