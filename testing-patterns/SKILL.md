---
name: testing-patterns
description: >
  Tests en Next.js: unit, integración y E2E. Stack: Vitest + Testing Library + Playwright.
  Usar cuando: "tests", "pruebas unitarias", "pruebas E2E", "Vitest", "Playwright",
  "TDD", "test coverage", "mock Supabase", "test Server Actions", "CI testing".
---

# Testing Patterns — Next.js 15 App Router

Stack: Vitest + Testing Library (unit/integration), Playwright (E2E).

## 1. Testing Pyramid

```
         /\
        /E2E\        — pocos (flujos criticos completos)
       /------\
      /  Integr \    — algunos (componentes con contexto real)
     /------------\
    /  Unit Tests  \ — muchos (logica pura, hooks, utilidades)
   /________________\
```

**Regla:** 70% unit, 20% integration, 10% E2E.

**Testear:** logica de negocio pura, componentes con estado complejo, Server Actions, API Routes, hooks con logica no trivial.
**No testear:** componentes puramente visuales, estilos, codigo de terceros, tipos TypeScript.

## 2. Setup Vitest

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event @testing-library/jest-dom happy-dom
```

Ver `references/vitest-setup.md` para `vitest.config.ts` y `vitest.setup.ts` completos.

```json
{ "scripts": { "test": "vitest", "test:run": "vitest run", "test:coverage": "vitest run --coverage" } }
```

## 3. Testing de Componentes React

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('ContactForm', () => {
  it('muestra error si email invalido', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    await user.type(screen.getByLabelText('Email'), 'no-es-email')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(screen.getByText('Email inválido')).toBeInTheDocument()
  })
})
```

### Query hierarchy (mejor a peor)

```
getByRole → getByLabelText → getByPlaceholderText → getByText → getByDisplayValue → getByAltText → getByTitle → getByTestId
```

Si no se encuentra por rol, probablemente hay un problema de accesibilidad.

### userEvent vs fireEvent

Siempre `userEvent.setup()` + `await user.click()`. Simula eventos reales (mousedown, focus, mouseup, click). `fireEvent` no simula comportamiento real.

### Async: findBy vs waitFor

- `findBy*` = `getBy*` + `waitFor` — para elementos que aparecen tras async
- `waitFor(() => expect(...))` — para assertions sobre estado que cambia

## 4. Mocking Supabase

Ver `references/vitest-setup.md` para mock global completo en `__mocks__/@supabase/supabase-js.ts`.

Sobrescribir en tests especificos: `vi.mocked(createClient).mockReturnValueOnce({ ... } as any)`

## 5. Testing Server Actions

Server Actions son funciones async — testear directamente sin HTTP.

```typescript
vi.mock('@/lib/supabase/server')
describe('createContactAction', () => {
  beforeEach(() => { vi.clearAllMocks() })
  it('retorna error si email invalido', async () => {
    const formData = new FormData()
    formData.set('email', 'no-es-email')
    formData.set('name', 'Test User')
    const result = await createContactAction({}, formData)
    expect(result.success).toBe(false)
    expect(result.errors?.email).toBeDefined()
  })
})
```

## 6. Testing API Routes

Route Handlers son funciones exportadas — invocar con Web API `Request`.

```typescript
const makeReq = (body: object) => new Request('http://localhost/api/contact', {
  method: 'POST', body: JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' },
})
it('retorna 400 si body invalido', async () => {
  const res = await POST(makeReq({ email: 'invalid' }))
  expect(res.status).toBe(400)
})
```

## 7. MSW — Mock Service Worker

Para interceptar fetch a APIs externas (webhooks, Resend, Stripe).

```bash
npm install -D msw
```

```typescript
// tests/mocks/server.ts
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
export const handlers = [
  http.post('https://api.resend.com/emails', () => HttpResponse.json({ id: 'email-123' })),
]
export const server = setupServer(...handlers)
```

En `vitest.setup.ts`:
```typescript
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

Sobrescribir en tests: `server.use(http.post('...', () => HttpResponse.json({ error: 'rate_limit' }, { status: 429 })))`

## 8. E2E con Playwright

Ver `references/playwright-setup.md` para configuracion completa.

**Casos para E2E:** registro completo, checkout con Stripe, onboarding multi-paso, OAuth login, file upload con preview.
**No E2E:** validacion de forms (unit test), logica de negocio (unit test), estados de error API (MSW).

## Matchers rapida referencia

| Categoria | Matchers |
|---|---|
| DOM | `toBeInTheDocument()`, `toBeVisible()`, `toBeDisabled()`, `toHaveTextContent()`, `toHaveValue()`, `toHaveClass()`, `toHaveAttribute()`, `toHaveFocus()` |
| Funciones | `toHaveBeenCalled()`, `toHaveBeenCalledTimes(n)`, `toHaveBeenCalledWith(expect.objectContaining({...}))` |
| Async | `await expect(promise).resolves.toEqual({...})`, `await expect(promise).rejects.toThrow('...')` |

## Estructura de archivos

```
app/actions/__tests__/       ← Server Actions tests
app/api/contact/__tests__/   ← API Routes tests
components/__tests__/        ← Component tests
lib/__tests__/               ← Pure logic tests
tests/e2e/                   ← Playwright E2E
tests/mocks/server.ts        ← MSW handlers
__mocks__/@supabase/         ← Global Supabase mock
```
