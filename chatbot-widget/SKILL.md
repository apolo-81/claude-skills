---
name: chatbot-widget
description: >
  Agrega un chatbot, asistente IA o chat widget a un sitio web o app.
  Usar cuando: "chatbot", "chat widget", "asistente virtual", "chat flotante",
  "bot de ventas", "bot de soporte", "FAQ bot", "useChat", "streaming chat",
  "Vercel AI SDK", "asistente inteligente", "chat con IA", "embedded chat".
---

# Chatbot Widget — Integration Guide

## 1. Decision Tree

| Caso de uso | Stack | Modelo |
|---|---|---|
| FAQ Bot | Docs en system prompt | anthropic/claude-haiku-4-5 |
| Customer Support | RAG con Supabase pgvector | anthropic/claude-sonnet-4-6 |
| In-app Assistant | System prompt dinámico | anthropic/claude-sonnet-4-6 |
| Sales Assistant | Tool use para acciones | anthropic/claude-sonnet-4-6 |

**Stack default:** Vercel AI SDK + AI Gateway (OIDC), Next.js App Router.

**Selección:**
- Docs <50k tokens → system prompt directo
- Docs >50k tokens → pgvector (ver `references/advanced-patterns.md`)
- Free tier → `anthropic/claude-haiku-4-5`; Pro → `anthropic/claude-sonnet-4-6`

## 2. Setup — AI SDK v6 + AI Gateway

```bash
npm install ai @ai-sdk/react zod framer-motion lucide-react
npx ai-elements@latest
```

**No instalar provider SDKs directos** — AI Gateway rutea con OIDC.

```typescript
// app/api/chat/route.ts
import { streamText, convertToModelMessages } from 'ai'
export async function POST(req: Request) {
  const { messages } = await req.json()
  const result = streamText({
    model: 'anthropic/claude-sonnet-4-6',
    system: 'Eres el asistente de [Producto]. Responde solo preguntas sobre [Producto].',
    messages: await convertToModelMessages(messages),
    maxTokens: 1024,
  })
  return result.toUIMessageStreamResponse()
}
```

```typescript
// hooks/useChatWidget.ts
import { useChat, DefaultChatTransport } from '@ai-sdk/react'
export function useChatWidget() {
  return useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    onError: (err) => console.error('Chat error:', err.message),
  })
}
```

## 3. Chat UI Components

Ver `references/chat-components.md` para codigo TSX completo copy-paste.

**ChatWidget (floating)** — estructura clave:
- `fixed bottom-4 right-4 z-50`, AnimatePresence + motion.div para open/close
- `useChat` con `onFinish` para unread counter cuando cerrado
- `isLoading = status === 'streaming' || status === 'submitted'`

**Message Bubbles:**
- User: `ml-auto bg-indigo-600 text-white rounded-2xl rounded-tr-sm`
- Assistant: `mr-auto bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm`
- Streaming: `after:content-['▋'] after:animate-pulse`
- Markdown: `<MessageResponse>` de AI Elements

**Chat Input:**
- `<textarea rows={1}>` con auto-resize (max 120px)
- Enter → enviar, Shift+Enter → nueva linea
- Boton stop (Square icon) durante streaming

## 4. System Prompt Patterns

```typescript
// Customer Support
const system = `Eres el asistente de soporte de ${productName}.
Solo responde preguntas sobre ${productName}.
Si no sabes: "No tengo información, te conecto con soporte humano."
Responde en el idioma del usuario. Conciso, amable, profesional.`.trim()

// In-app con contexto del usuario
const system = `Eres el asistente de ${productName}.
Usuario: ${user.name} (plan: ${user.plan})
Features: ${user.features.join(', ')}
Fecha: ${new Date().toISOString()}`.trim()

// FAQ Bot con docs estaticos
// Leer .md files de content/ dir, cachear, inyectar en system prompt
// Ver references/advanced-patterns.md para getDocs() helper
```

## 5. Rate Limiting y Costos

Ver `references/advanced-patterns.md` para implementacion completa.

Patron clave:
- `checkRateLimit(supabase, userId)` con tabla `chat_usage` y ventana de 1h
- Modelo por plan: `user.plan === 'pro' ? 'claude-sonnet-4-6' : 'claude-haiku-4.5'`
- `result.usage.then()` para trackear tokens post-stream

```sql
create table chat_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  tokens integer, model text,
  created_at timestamptz default now()
);
create index on chat_usage (user_id, created_at);
```

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

Cargar historial como `initialMessages` en `useChat`. En `onFinish`, extraer texto de `message.parts` (v6 UIMessage format) e insertar en DB.

## 7. Tool Use (Chatbot con Acciones)

```typescript
import { streamText, stepCountIs } from 'ai'
import { z } from 'zod'
const result = streamText({
  model: 'anthropic/claude-sonnet-4-6',
  messages: await convertToModelMessages(messages),
  stopWhen: stepCountIs(3),
  tools: {
    createSupportTicket: {
      description: 'Crea ticket de soporte cuando el usuario lo solicita',
      inputSchema: z.object({
        title: z.string(), description: z.string(),
        priority: z.enum(['low', 'medium', 'high']),
      }),
      execute: async ({ title, description, priority }) => {
        const { data } = await supabase.from('tickets').insert({ title, description, priority }).select().single()
        return { ticketId: data.id, message: `Ticket #${data.id} creado.` }
      },
    },
  },
})
```

`useChat` maneja tool calls automaticamente. Para UI personalizada por tool, iterar `message.parts` filtrando `part.type.startsWith('tool-')`.

## 8. Observabilidad

- **AI Gateway** (default): dashboard de costos, usage attribution — sin config extra
- **Helicone**: dashboard detallado, configura como proxy en AI Gateway
- **Langfuse**: open-source, self-hosteable
- Tabla `chat_usage` + cron diario con alerta. Ver `references/advanced-patterns.md`

## 9. Integracion en Layout

```typescript
// app/layout.tsx
import { ChatWidget } from '@/components/ChatWidget'
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es"><body>{children}<ChatWidget /></body></html>
}

// Condicional por ruta
'use client'
import { usePathname } from 'next/navigation'
const EXCLUDED = ['/admin', '/dashboard/settings']
export function ChatWidgetConditional() {
  const pathname = usePathname()
  if (EXCLUDED.some((p) => pathname.startsWith(p))) return null
  return <ChatWidget />
}
```
