---
name: chatbot-widget
description: >
  Use when adding a chatbot, AI assistant, or chat widget to a website or web app.
  Trigger for: "chatbot", "chat widget", "AI assistant", "Claude widget", "OpenAI
  chat", "customer support bot", "chat con IA", "asistente virtual", "chat flotante",
  "embedded chat", "AI chat", "chatbot en mi web", "asistente de soporte",
  "agregar chat a mi sitio", "bot de ventas", "FAQ bot", "Vercel AI SDK",
  "useChat hook", "streaming responses", "chat UI", "asistente inteligente".
---

# Chatbot Widget — Integration Guide

## 1. Overview — Decision Tree

| Caso de uso | Stack recomendado | Modelo |
|---|---|---|
| **FAQ Bot** | Docs en system prompt | claude-haiku-4-5 |
| **Customer Support** | RAG con Supabase pgvector | claude-sonnet-4-6 |
| **In-app Assistant** | System prompt dinámico con contexto del usuario | claude-sonnet-4-6 |
| **Sales Assistant** | Tool use para acciones (agendar demos, calificar leads) | claude-sonnet-4-6 |

**Stack default:** Vercel AI SDK + Anthropic Claude, Next.js 15 App Router.

**Reglas de selección:**
- Docs <50k tokens → incluir en system prompt directamente
- Docs >50k tokens → escalar a pgvector (ver `references/advanced-patterns.md`)
- Free tier → claude-haiku-4-5 (70% más barato); Pro → claude-sonnet-4-6

---

## 2. Setup — Vercel AI SDK + Claude

```bash
npm install ai @ai-sdk/anthropic zod framer-motion react-markdown rehype-highlight rehype-sanitize remark-gfm lucide-react
```

```typescript
// app/api/chat/route.ts
import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

export const runtime = 'edge'

export async function POST(req: Request) {
  const { messages } = await req.json()
  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: 'Eres el asistente de [Producto]. Responde solo preguntas sobre [Producto].',
    messages,
    maxTokens: 1024,
  })
  return result.toDataStreamResponse()
}
```

```typescript
// hooks/useChatWidget.ts
import { useChat } from 'ai/react'
export function useChatWidget() {
  return useChat({
    api: '/api/chat',
    onError: (err) => console.error('Chat error:', err.message),
    onFinish: (message) => { /* guardar en Supabase si se necesita historial */ },
  })
}
```

---

## 3. Chat UI Components

Ver código TSX completo copy-paste en `references/chat-components.md`.

### ChatWidget (floating) — estructura
```typescript
// components/ChatWidget.tsx
'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, X } from 'lucide-react'
import { useChat } from 'ai/react'

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } = useChat({
    api: '/api/chat',
    onFinish: () => { if (!isOpen) setUnreadCount((c) => c + 1) },
  })

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="w-[calc(100vw-2rem)] sm:w-96 h-[520px] sm:h-[560px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden max-h-[calc(100vh-5rem)]"
          >
            {/* Header + ChatMessages + ChatInput — ver chat-components.md */}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
        onClick={() => { setIsOpen((o) => !o); setUnreadCount(0) }}
        className="relative w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center"
      >
        <AnimatePresence mode="wait">
          {isOpen
            ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X size={22} /></motion.span>
            : <motion.span key="msg" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><MessageCircle size={22} /></motion.span>
          }
        </AnimatePresence>
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </motion.button>
    </div>
  )
}
```

### Message Bubbles
- User: `ml-auto bg-indigo-600 text-white rounded-2xl rounded-tr-sm`
- Assistant: `mr-auto bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm`
- Streaming: cursor `after:content-['▋'] after:animate-pulse`
- Markdown: `react-markdown` + `rehype-highlight` + `rehype-sanitize` + `@tailwindcss/typography`
- Timestamps relativos con `Intl.RelativeTimeFormat`

### Chat Input
- `<textarea rows={1}>` con `onInput` para auto-resize (max 120px)
- `Enter` → enviar, `Shift+Enter` → nueva línea
- Disabled + opacity-50 durante `isLoading`
- Botón de stop (Square icon) para interrumpir streaming

### TypingIndicator
```typescript
export function TypingIndicator() {
  return (
    <div className="flex gap-1 items-center h-5">
      {[0, 0.15, 0.3].map((delay, i) => (
        <motion.span key={i} className="block w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500"
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 0.7, delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}
```

---

## 4. System Prompt Patterns

```typescript
// Customer Support
const system = `
Eres el asistente de soporte de ${productName}.
Solo responde preguntas sobre ${productName}.
Si no sabes algo, di: "No tengo información sobre eso, te conecto con soporte humano."
Responde siempre en el mismo idioma que el usuario. Sé conciso, amable y profesional.
`.trim()

// In-app con contexto del usuario — generar por request, NO hardcoded
const system = `
Eres el asistente de ${productName}.
Usuario: ${user.name} (plan: ${user.plan})
Features disponibles: ${user.features.join(', ')}
Fecha actual: ${new Date().toISOString()}
`.trim()

// FAQ Bot con docs estáticos
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
let cachedDocs: string | null = null
export function getDocs(): string {
  if (cachedDocs) return cachedDocs
  const dir = join(process.cwd(), 'content')
  cachedDocs = readdirSync(dir).filter((f) => f.endsWith('.md'))
    .map((f) => readFileSync(join(dir, f), 'utf-8')).join('\n\n---\n\n')
  return cachedDocs
}
// En route.ts: system = `Documentación:\n${getDocs()}\n\nResponde SOLO con la documentación.`
```

---

## 5. Rate Limiting y Costos

```typescript
// app/api/chat/route.ts — verificar ANTES de streamText
const LIMIT = 20 // mensajes/hora por usuario

async function checkRateLimit(supabase: any, userId: string) {
  const windowStart = new Date(Date.now() - 3_600_000).toISOString()
  const { count } = await supabase.from('chat_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId).gte('created_at', windowStart)
  return { allowed: (count ?? 0) < LIMIT, remaining: LIMIT - (count ?? 0) }
}

export async function POST(req: Request) {
  const { messages } = await req.json()
  const user = await getUser(req)
  const { allowed } = await checkRateLimit(supabase, user.id)
  if (!allowed) return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })

  const model = user.plan === 'pro' ? 'claude-sonnet-4-6' : 'claude-haiku-4-5'
  const result = streamText({ model: anthropic(model), messages })
  result.usage.then(({ totalTokens }) =>
    supabase.from('chat_usage').insert({ user_id: user.id, tokens: totalTokens, model })
  )
  return result.toDataStreamResponse()
}
```

```sql
create table chat_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  tokens integer, model text,
  created_at timestamptz default now()
);
create index on chat_usage (user_id, created_at);
```

---

## 6. Historial de Conversaciones

```sql
create table conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations on delete cascade not null,
  role text check (role in ('user', 'assistant')),
  content text not null, created_at timestamptz default now()
);
```

```typescript
// Cargar historial → pasar como initialMessages a useChat
const { data: prevMessages } = await supabase
  .from('messages').select('role, content')
  .eq('conversation_id', conversationId).order('created_at')

useChat({
  api: '/api/chat',
  initialMessages: prevMessages ?? [],
  onFinish: async (message) => {
    await supabase.from('messages').insert({
      conversation_id: conversationId, role: message.role, content: message.content,
    })
  },
})
```

---

## 7. RAG Simple

Para docs <50k tokens usar `getDocs()` en system prompt (ver sección 4).

Cuándo escalar a pgvector: docs >50k tokens o >100 páginas, o respuestas irrelevantes por contexto largo.
Ver implementación completa en `references/advanced-patterns.md` (schema, script de indexación, búsqueda semántica).

---

## 8. Tool Use (Chatbot con Acciones)

```typescript
import { z } from 'zod'
const result = streamText({
  model: anthropic('claude-sonnet-4-6'),
  messages,
  maxSteps: 3,
  tools: {
    createSupportTicket: {
      description: 'Crea un ticket de soporte cuando el usuario lo solicita explícitamente',
      parameters: z.object({
        title: z.string(), description: z.string(),
        priority: z.enum(['low', 'medium', 'high']),
      }),
      execute: async ({ title, description, priority }) => {
        // Opción A: Supabase directo
        // Opción B: webhook n8n (ver advanced-patterns.md)
        const { data } = await supabase.from('tickets').insert({ title, description, priority }).select().single()
        return { ticketId: data.id, message: `Ticket #${data.id} creado.` }
      },
    },
  },
})
```

`useChat` maneja tool calls automáticamente — el usuario ve solo la respuesta final en lenguaje natural.
Para UI personalizada por tool (card con ticketId), usar `msg.toolInvocations` en ChatMessages.

---

## 9. Observabilidad

```typescript
// Helicone: drop-in proxy, sin cambios de código extra
import { createAnthropic } from '@ai-sdk/anthropic'
const helicone = createAnthropic({
  baseURL: 'https://anthropic.helicone.ai/v1',
  headers: { 'Helicone-Auth': `Bearer ${process.env.HELICONE_API_KEY}` },
})

// Logging mínimo en API route
console.log({ event: 'chat_request', systemLength: system.length, messagesCount: messages.length, model })
result.usage.then(({ promptTokens, completionTokens }) => {
  console.log({ event: 'chat_complete', promptTokens, completionTokens })
})
```

**Herramientas:** Helicone (dashboard de costos, drop-in), Langfuse (open-source, self-hosteable), o tabla `chat_usage` + cron diario con alerta en Slack/email. Ver cron completo en `references/advanced-patterns.md`.

---

## 10. Integración en Layout

```typescript
// app/layout.tsx
import { ChatWidget } from '@/components/ChatWidget'
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es"><body>{children}<ChatWidget /></body></html>
}

// Condicional por ruta — no mostrar en /admin ni /dashboard/settings
'use client'
import { usePathname } from 'next/navigation'
const EXCLUDED = ['/admin', '/dashboard/settings']
export function ChatWidgetConditional() {
  const pathname = usePathname()
  if (EXCLUDED.some((p) => pathname.startsWith(p))) return null
  return <ChatWidget />
}
```
