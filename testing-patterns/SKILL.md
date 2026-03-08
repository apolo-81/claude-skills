---
name: testing-patterns
description: >
  Use when writing tests, setting up a testing framework, implementing unit tests,
  integration tests, or E2E tests for a Next.js app. Trigger for: "tests", "testing",
  "unit test", "integration test", "E2E test", "Vitest", "Playwright", "Jest",
  "Testing Library", "test coverage", "TDD", "escribir tests", "pruebas unitarias",
  "pruebas de integración", "pruebas E2E", "pruebas automáticas", "CI testing",
  "mock Supabase", "mock fetch", "test Server Components", "test Server Actions",
  "test API routes", "snapshot test", "assertion", "expect", "describe", "it",
  "beforeEach", "afterEach", "test setup", "test environment", "msw", "mock service worker".
---

# Testing Patterns — Next.js 15 App Router

Stack: Next.js 15 App Router + React + TypeScript + Supabase + Vercel.
Unit/integration: Vitest + Testing Library. E2E: Playwright.

---

## 1. Overview — Estrategia de testing para Next.js App Router

### Testing pyramid adaptada a Next.js

```
         /\
        /E2E\        — pocos (flujos críticos completos)
       /------\
      /  Integr \    — algunos (componentes con contexto real)
     /------------\
    /  Unit Tests  \ — muchos (lógica pura, hooks, utilidades)
   /________________\
```

**Regla práctica:** 70% unit, 20% integration, 10% E2E. No invertir la pirámide.

### Por qué Vitest > Jest para Next.js

- Soporte nativo de ESM: sin configuración de transformers
- 2-5x más rápido en modo watch (Vite HMR para tests)
- Misma API que Jest: migración sin cambios en los tests
- Configuración más simple con `@vitejs/plugin-react`
- Compatible con TypeScript paths alias sin babel

### Por qué Playwright para E2E

- Soporte oficial de Next.js (`webServer` automático en config)
- Browsers reales (Chromium, Firefox, WebKit) sin emulación
- Auto-wait nativo: no más `sleep()` ni `waitFor()` manuales para navegación
- Network interception para mock de APIs externas
- Screenshot y video en fallos para CI debugging

### Qué testear primero

**Vale la pena testear:**
- Lógica de negocio pura (validaciones, cálculos, transformaciones)
- Componentes con estado complejo (formularios, flujos multi-paso)
- Server Actions (son funciones async: testeables directamente)
- API Routes con validación
- Hooks personalizados con lógica no trivial

**No vale la pena testear:**
- Componentes puramente visuales sin lógica (botones estáticos, layouts)
- Estilos CSS/Tailwind
- Código de terceros (Supabase SDK, Next.js internals)
- Tipos TypeScript (el compilador ya los verifica)

---

## 2. Setup Vitest para Next.js 15

### Instalación

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event @testing-library/jest-dom happy-dom
```

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',  // más rápido que jsdom
    globals: true,             // describe/it/expect sin imports
    setupFiles: ['./vitest.setup.ts'],
    alias: {
      '@': resolve(__dirname, './'),
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['node_modules', '.next', 'vitest.config.ts', 'vitest.setup.ts'],
    },
  },
})
```

Ver `references/vitest-setup.md` para el contenido completo de `vitest.setup.ts` (mocks de `next/navigation`, `next/headers`, y configuración para CI).

### package.json scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

---

## 3. Testing de Componentes React

### Patrón base

```typescript
// components/__tests__/ContactForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactForm } from '../ContactForm'

describe('ContactForm', () => {
  it('muestra error si email es inválido', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    await user.type(screen.getByLabelText('Email'), 'no-es-email')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(screen.getByText('Email inválido')).toBeInTheDocument()
  })

  it('llama onSubmit con datos válidos', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<ContactForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Nombre'), 'Juan')
    await user.type(screen.getByLabelText('Email'), 'juan@example.com')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Juan',
      email: 'juan@example.com',
    })
  })

  it('deshabilita el botón mientras se procesa', async () => {
    const onSubmit = vi.fn(() => new Promise(r => setTimeout(r, 100)))
    const user = userEvent.setup()
    render(<ContactForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Nombre'), 'Juan')
    await user.type(screen.getByLabelText('Email'), 'juan@example.com')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(screen.getByRole('button', { name: 'Enviando...' })).toBeDisabled()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Enviar' })).not.toBeDisabled()
    )
  })
})
```

### Jerarquía de queries (de mejor a peor)

```
getByRole        → accesibilidad + semántica (preferido)
getByLabelText   → formularios
getByPlaceholderText → inputs sin label visible
getByText        → contenido textual
getByDisplayValue → inputs con valor actual
getByAltText     → imágenes
getByTitle       → atributo title
getByTestId      → último recurso (data-testid)
```

Usar `getByRole` primero: si el test no puede encontrar el elemento por rol,
probablemente el componente tiene un problema de accesibilidad.

### userEvent vs fireEvent

```typescript
// MAL: fireEvent no simula comportamiento real del usuario
fireEvent.click(button)

// BIEN: userEvent simula eventos reales (mousedown, focus, mouseup, click)
const user = userEvent.setup()
await user.click(button)

// userEvent también maneja: type, keyboard, hover, tab, selectOptions
await user.keyboard('{Enter}')
await user.selectOptions(select, ['option1'])
await user.upload(fileInput, file)
```

### Async: cuándo usar findBy vs waitFor

```typescript
// findBy* = getBy* + waitFor (para elementos que aparecen tras async)
const error = await screen.findByText('Error de red')

// waitFor para assertions sobre estado que cambia
await waitFor(() => {
  expect(mockFn).toHaveBeenCalledTimes(1)
})

// findByRole para elementos que aparecen tras acción async
const toast = await screen.findByRole('alert')
expect(toast).toHaveTextContent('Guardado exitosamente')
```

---

## 4. Mocking Supabase

### Mock global en `__mocks__/`

```typescript
// __mocks__/@supabase/supabase-js.ts
import { vi } from 'vitest'

const mockUser = { id: 'user-123', email: 'test@example.com', role: 'authenticated' }

export const createClient = vi.fn(() => ({
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: mockUser, error: null }),
    then: vi.fn().mockResolvedValue({ data: [], error: null }),
  })),
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  },
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn().mockResolvedValue({ data: { path: 'file.jpg' }, error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/file.jpg' } }),
    })),
  },
}))
```

Para sobrescribir en tests específicos: `vi.mocked(createClient).mockReturnValueOnce({ from: vi.fn(() => ({ single: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }) })) } as any)`

---

## 5. Testing de Server Actions

Las Server Actions son funciones async exportadas — se testean directamente sin HTTP.

```typescript
// app/actions/__tests__/contact.test.ts
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { createContactAction } from '../contact'

vi.mock('@/lib/supabase/server')

describe('createContactAction', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('retorna error si email es inválido', async () => {
    const formData = new FormData()
    formData.set('email', 'no-es-email')
    formData.set('name', 'Test User')

    const result = await createContactAction({}, formData) // prevState = {}
    expect(result.success).toBe(false)
    expect(result.errors?.email).toBeDefined()
  })

  it('guarda en Supabase con datos válidos', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    const mockInsert = vi.fn().mockResolvedValue({ data: { id: '1' }, error: null })
    vi.mocked(createClient).mockReturnValue({ from: vi.fn(() => ({ insert: mockInsert })) } as any)

    const formData = new FormData()
    formData.set('email', 'valid@example.com')
    formData.set('name', 'Usuario Test')

    const result = await createContactAction({}, formData)
    expect(result.success).toBe(true)
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ email: 'valid@example.com' }))
  })
})
```

---

## 6. Testing de API Routes

Las Route Handlers son funciones exportadas — se invocan directamente con un `Request` de Web API.

```typescript
// app/api/contact/__tests__/route.test.ts
import { POST } from '../route'

const makeReq = (body: object) => new Request('http://localhost/api/contact', {
  method: 'POST',
  body: JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' },
})

it('retorna 400 si body es inválido', async () => {
  const res = await POST(makeReq({ email: 'invalid' }))
  expect(res.status).toBe(400)
  expect((await res.json()).error).toBeDefined()
})

it('retorna 200 con datos válidos', async () => {
  const res = await POST(makeReq({ email: 'user@example.com', name: 'Test' }))
  expect(res.status).toBe(200)
})
```

---

## 7. MSW — Mock Service Worker para APIs externas

Para interceptar fetch calls a APIs externas (n8n webhooks, Resend, Stripe).

```bash
npm install -D msw
```

```typescript
// tests/mocks/server.ts
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

export const handlers = [
  // Mock Resend email API
  http.post('https://api.resend.com/emails', () => {
    return HttpResponse.json({ id: 'email-123' }, { status: 200 })
  }),

  // Mock n8n webhook
  http.post('https://n8n.example.com/webhook/*', () => {
    return HttpResponse.json({ success: true })
  }),
]

export const server = setupServer(...handlers)
```

```typescript
// vitest.setup.ts — agregar al setup existente
import { server } from './tests/mocks/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

```typescript
// En tests individuales: sobrescribir handlers
import { server } from '@/tests/mocks/server'
import { http, HttpResponse } from 'msw'

it('maneja error de Resend', async () => {
  server.use(
    http.post('https://api.resend.com/emails', () => {
      return HttpResponse.json({ error: 'rate_limit' }, { status: 429 })
    })
  )

  const result = await sendWelcomeEmail('user@example.com')
  expect(result.success).toBe(false)
})
```

Ver `references/vitest-setup.md` para setup completo con TypeScript paths,
coverage, hooks personalizados y CI.

---

## 8. E2E con Playwright

Ver `references/playwright-setup.md` para configuración completa y patrones.

### Casos ideales para E2E (no reemplazar con unit tests)

- Flujo de registro completo (signup → verify email → onboarding)
- Checkout con Stripe (formulario de pago → webhook → confirmación)
- Onboarding multi-paso con persistencia entre pasos
- Login con OAuth (Google, GitHub)
- Upload de archivos con preview

### Cuándo NO escribir E2E

- Validación de formularios (unit test es más rápido)
- Lógica de negocio (unit test)
- Estados de error de API (MSW + unit test)

---

## Referencia rápida de matchers

```typescript
// DOM
expect(el).toBeInTheDocument()
expect(el).toBeVisible()
expect(el).toBeDisabled()
expect(el).toHaveTextContent('texto')
expect(el).toHaveValue('valor')
expect(el).toHaveClass('className')
expect(el).toHaveAttribute('aria-label', 'texto')
expect(el).toHaveFocus()

// Funciones
expect(fn).toHaveBeenCalled()
expect(fn).toHaveBeenCalledTimes(2)
expect(fn).toHaveBeenCalledWith(expect.objectContaining({ key: 'value' }))
expect(fn).toHaveBeenLastCalledWith('arg1')

// Async
await expect(promise).resolves.toEqual({ success: true })
await expect(promise).rejects.toThrow('mensaje de error')
```

---

## Estructura de archivos recomendada

```
app/
  actions/
    contact.ts
    __tests__/
      contact.test.ts          ← Server Actions tests
  api/
    contact/
      route.ts
      __tests__/
        route.test.ts          ← API Routes tests
components/
  ContactForm.tsx
  __tests__/
    ContactForm.test.tsx       ← Component tests
lib/
  utils.ts
  __tests__/
    utils.test.ts              ← Pure logic tests
tests/
  e2e/
    contact-flow.spec.ts       ← Playwright E2E
  mocks/
    server.ts                  ← MSW handlers
__mocks__/
  @supabase/
    supabase-js.ts             ← Global Supabase mock
vitest.config.ts
vitest.setup.ts
playwright.config.ts
```
