# Chat Components — Copy-Paste TSX

Stack: Next.js 15 App Router, Tailwind CSS, Framer Motion, Vercel AI SDK, react-markdown, rehype-highlight.

## Install

```bash
npm install ai @ai-sdk/anthropic framer-motion react-markdown rehype-highlight rehype-sanitize remark-gfm lucide-react
```

---

## ChatWidget.tsx — Floating Button + Panel

```tsx
// components/ChatWidget.tsx
'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, X, Minimize2 } from 'lucide-react'
import { useChat } from 'ai/react'
import { ChatMessages } from './ChatMessages'
import { ChatInput } from './ChatInput'

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } = useChat({
    api: '/api/chat',
    onFinish: () => {
      if (!isOpen) setUnreadCount((c) => c + 1)
    },
    onError: (err) => {
      console.error('[ChatWidget] error:', err.message)
    },
  })

  function open() {
    setIsOpen(true)
    setIsMinimized(false)
    setUnreadCount(0)
  }

  function close() {
    setIsOpen(false)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? 'auto' : undefined,
            }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={[
              'w-[calc(100vw-2rem)] sm:w-96',
              'bg-white dark:bg-gray-900',
              'rounded-2xl shadow-2xl',
              'border border-gray-200 dark:border-gray-700',
              'flex flex-col overflow-hidden',
              isMinimized ? '' : 'h-[520px] sm:h-[560px]',
              // Mobile: fullscreen con safe area
              'max-h-[calc(100vh-5rem)] sm:max-h-[600px]',
            ].join(' ')}
            style={{
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-indigo-600 text-white flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                </span>
                <span className="font-semibold text-sm tracking-tight">Asistente</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized((m) => !m)}
                  className="p-1 rounded hover:bg-white/20 transition-colors"
                  aria-label="Minimizar"
                >
                  <Minimize2 size={15} />
                </button>
                <button
                  onClick={close}
                  className="p-1 rounded hover:bg-white/20 transition-colors"
                  aria-label="Cerrar"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Body */}
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col flex-1 min-h-0"
                >
                  <ChatMessages messages={messages} isLoading={isLoading} />
                  <ChatInput
                    input={input}
                    handleInputChange={handleInputChange}
                    handleSubmit={handleSubmit}
                    isLoading={isLoading}
                    onStop={stop}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={isOpen ? close : open}
        className="relative w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        aria-label={isOpen ? 'Cerrar chat' : 'Abrir chat'}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={22} />
            </motion.span>
          ) : (
            <motion.span
              key="msg"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle size={22} />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        <AnimatePresence>
          {unreadCount > 0 && !isOpen && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
```

---

## ChatMessages.tsx — Lista de mensajes con scroll automático

```tsx
// components/ChatMessages.tsx
'use client'

import { useEffect, useRef } from 'react'
import { Message } from 'ai'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import { TypingIndicator } from './TypingIndicator'

// Import un tema de highlight.js en globals.css:
// @import 'highlight.js/styles/github-dark.css';

interface ChatMessagesProps {
  messages: Message[]
  isLoading: boolean
}

function formatTime(date: Date | undefined) {
  if (!date) return ''
  const now = Date.now()
  const diff = now - date.getTime()
  if (diff < 60_000) return 'ahora'
  if (diff < 3_600_000) return `hace ${Math.floor(diff / 60_000)}m`
  return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom cuando llegan mensajes nuevos
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-2xl">
          👋
        </div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Hola, ¿en qué puedo ayudarte?</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Escribe tu pregunta abajo</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-3 py-4 space-y-3 scroll-smooth"
    >
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
        >
          <div
            className={[
              'max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed',
              msg.role === 'user'
                ? 'bg-indigo-600 text-white rounded-tr-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-sm',
            ].join(' ')}
          >
            {msg.role === 'user' ? (
              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-pre:my-2 prose-pre:rounded-lg prose-code:text-xs">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeSanitize, rehypeHighlight]}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 px-1">
            {formatTime(msg.createdAt)}
          </span>
        </div>
      ))}

      {isLoading && (
        <div className="flex items-start">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-3 py-2">
            <TypingIndicator />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
```

---

## ChatInput.tsx — Textarea auto-resize con keyboard shortcuts

```tsx
// components/ChatInput.tsx
'use client'

import { useRef, ChangeEvent, FormEvent, KeyboardEvent } from 'react'
import { Send, Square } from 'lucide-react'
import { motion } from 'framer-motion'

interface ChatInputProps {
  input: string
  handleInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  onStop?: () => void
}

export function ChatInput({ input, handleInputChange, handleSubmit, isLoading, onStop }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function autoResize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    handleInputChange(e)
    autoResize()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isLoading && input.trim()) {
        formRef.current?.requestSubmit()
      }
    }
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-3 flex-shrink-0">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex items-end gap-2"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="Escribe tu pregunta... (Enter para enviar)"
          rows={1}
          className={[
            'flex-1 resize-none rounded-xl border border-gray-200 dark:border-gray-700',
            'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100',
            'px-3 py-2 text-sm leading-relaxed',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all duration-150 max-h-[120px] overflow-y-auto',
          ].join(' ')}
          style={{ minHeight: '40px' }}
        />

        {isLoading ? (
          <motion.button
            type="button"
            onClick={onStop}
            whileTap={{ scale: 0.9 }}
            className="flex-shrink-0 w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
            aria-label="Detener"
          >
            <Square size={14} fill="currentColor" />
          </motion.button>
        ) : (
          <motion.button
            type="submit"
            disabled={!input.trim()}
            whileTap={{ scale: 0.9 }}
            className={[
              'flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors',
              input.trim()
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed',
            ].join(' ')}
            aria-label="Enviar"
          >
            <Send size={15} />
          </motion.button>
        )}
      </form>
      <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-1 text-center">
        Shift+Enter para nueva línea
      </p>
    </div>
  )
}
```

---

## TypingIndicator.tsx — Dots animation

```tsx
// components/TypingIndicator.tsx
'use client'

import { motion } from 'framer-motion'

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 h-5">
      {[0, 0.15, 0.3].map((delay, i) => (
        <motion.span
          key={i}
          className="block w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500"
          animate={{ y: [0, -4, 0] }}
          transition={{
            repeat: Infinity,
            duration: 0.7,
            delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
```

---

## Tailwind Dark Mode — clases clave

```tsx
// tailwind.config.ts — activar dark mode por clase
export default {
  darkMode: 'class', // o 'media' si se quiere seguir el sistema
  // ...
}
```

Clases dark mode usadas en el widget:

| Elemento | Light | Dark |
|---|---|---|
| Panel bg | `bg-white` | `dark:bg-gray-900` |
| Border | `border-gray-200` | `dark:border-gray-700` |
| Assistant bubble | `bg-gray-100` | `dark:bg-gray-800` |
| Text | `text-gray-900` | `dark:text-gray-100` |
| Input bg | `bg-gray-50` | `dark:bg-gray-800` |
| Timestamp | `text-gray-400` | `dark:text-gray-500` |

---

## react-markdown con rehype-highlight

```tsx
// 1. Instalar: npm install react-markdown rehype-highlight rehype-sanitize remark-gfm
// 2. Importar el tema CSS en globals.css:
// @import 'highlight.js/styles/github.css';        /* light */
// @import 'highlight.js/styles/github-dark.css';   /* dark */

// 3. Uso dentro de ChatMessages.tsx (ya incluido arriba):
<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  rehypePlugins={[rehypeSanitize, rehypeHighlight]}
  components={{
    // Custom renderer para code blocks con copy button
    pre: ({ children }) => (
      <div className="relative group">
        <pre className="overflow-x-auto">{children}</pre>
        {/* Agregar botón copy si se desea */}
      </div>
    ),
    code: ({ node, inline, className, children, ...props }) => {
      if (inline) {
        return <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs font-mono" {...props}>{children}</code>
      }
      return <code className={className} {...props}>{children}</code>
    },
    a: ({ href, children }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 underline">
        {children}
      </a>
    ),
  }}
>
  {content}
</ReactMarkdown>

// 4. Prose classes en tailwind.config.ts:
// plugins: [require('@tailwindcss/typography')]
// npm install @tailwindcss/typography
```

---

## Uso en layout.tsx

```tsx
// app/layout.tsx
import { ChatWidget } from '@/components/ChatWidget'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {children}
        <ChatWidget />
      </body>
    </html>
  )
}
```

## Responsive: mobile fullscreen

Para que en mobile el widget sea fullscreen, reemplaza las clases de tamaño del panel:

```tsx
// Mobile (< sm): fullscreen
// Desktop (>= sm): panel flotante 384px
className="
  fixed inset-0 sm:inset-auto sm:bottom-4 sm:right-4
  w-full sm:w-96
  h-full sm:h-[560px]
  z-50
"
```

Y añade al `<body>`: `overflow-hidden sm:overflow-auto` cuando el chat está abierto en mobile (con `useEffect` + `document.body.classList`).
