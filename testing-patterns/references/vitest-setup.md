# Vitest — Setup completo y patrones avanzados

Stack: Next.js 15 App Router + TypeScript + Supabase.

---

## Setup con TypeScript paths completo

### tsconfig.json (fragmento relevante)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/app/*": ["./app/*"],
      "@/types/*": ["./types/*"]
    }
  }
}
```

### vitest.config.ts completo

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    // Excluir E2E de los tests de Vitest
    exclude: ['node_modules', '.next', 'tests/e2e/**'],
    // Correr tests en paralelo con threads
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1,
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        '.next/**',
        'vitest.config.ts',
        'vitest.setup.ts',
        'playwright.config.ts',
        'tests/e2e/**',
        '**/*.d.ts',
        '**/types/**',
        'tailwind.config.*',
        'next.config.*',
      ],
      // Umbrales: guía, no obsesión
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@/components': resolve(__dirname, './components'),
      '@/lib': resolve(__dirname, './lib'),
      '@/app': resolve(__dirname, './app'),
      '@/types': resolve(__dirname, './types'),
    },
  },
})
```

### vitest.setup.ts completo

```typescript
import '@testing-library/jest-dom'
import { vi, beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './tests/mocks/server'

// MSW: interceptar fetch en todos los tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/test-path',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  redirect: vi.fn(),
  notFound: vi.fn(),
  permanentRedirect: vi.fn(),
}))

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn((name: string) => undefined),
    set: vi.fn(),
    delete: vi.fn(),
    has: vi.fn(() => false),
    getAll: vi.fn(() => []),
  })),
  headers: vi.fn(() => new Headers()),
}))

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn((fn) => fn),
}))

// Silenciar console.error en tests (opcional: quitar si prefieres ver errores)
const originalConsoleError = console.error
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    // Silenciar errores conocidos de React Testing Library
    if (typeof args[0] === 'string' && args[0].includes('Warning:')) return
    originalConsoleError(...args)
  }
})
afterAll(() => {
  console.error = originalConsoleError
})
```

---

## Coverage: qué porcentaje buscar

### Por qué no obsesionarse con el 100%

- El 100% de coverage NO garantiza que los tests sean buenos
- Los snapshots automáticos inflan el coverage sin valor
- Testear getters/setters triviales no aporta valor
- El tiempo dedicado a subir de 80% a 100% rara vez vale la pena

### Umbrales recomendados por tipo de código

| Tipo de código | Coverage objetivo |
|---|---|
| Lógica de negocio (validaciones, cálculos) | 90%+ |
| Server Actions | 80%+ |
| API Routes | 75%+ |
| Componentes con estado | 70%+ |
| Utilidades/helpers | 85%+ |
| Componentes UI puros | No testear |
| Tipos TypeScript | No aplica |

### Leer el reporte de coverage

```bash
npm run test:coverage
# Abre ./coverage/index.html para ver qué líneas faltan
```

Enfocarse en líneas rojas en archivos de lógica de negocio.
Ignorar líneas rojas en archivos de configuración o tipos.

---

## MSW — Mock Service Worker setup completo

### Instalación

```bash
npm install -D msw
```

### Estructura de mocks

```
tests/
  mocks/
    server.ts      ← Node.js server para Vitest
    handlers.ts    ← Handlers reutilizables
    browser.ts     ← Browser worker (si usas Storybook/dev)
```

### tests/mocks/handlers.ts

```typescript
import { http, HttpResponse, delay } from 'msw'

// Datos de ejemplo reutilizables entre tests
export const mockContact = {
  id: 'contact-123',
  name: 'Test User',
  email: 'test@example.com',
  createdAt: '2024-01-01T00:00:00.000Z',
}

export const handlers = [
  // Resend: envío de emails
  http.post('https://api.resend.com/emails', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json(
      { id: `email-${Date.now()}`, object: 'email' },
      { status: 200 }
    )
  }),

  // n8n webhook
  http.post('https://n8n.example.com/webhook/:workflowId', async () => {
    await delay(10) // Simular latencia mínima
    return HttpResponse.json({ success: true, executionId: 'exec-123' })
  }),

  // Stripe: crear PaymentIntent
  http.post('https://api.stripe.com/v1/payment_intents', () => {
    return HttpResponse.json({
      id: 'pi_test_123',
      client_secret: 'pi_test_123_secret_456',
      status: 'requires_payment_method',
    })
  }),

  // API interna de la app
  http.get('/api/contacts', () => {
    return HttpResponse.json({ data: [mockContact], total: 1 })
  }),

  http.post('/api/contacts', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json(
      { data: { ...mockContact, ...body, id: 'new-contact-456' } },
      { status: 201 }
    )
  }),
]
```

### tests/mocks/server.ts

```typescript
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

### Uso en tests: sobrescribir handlers por caso

```typescript
import { server } from '@/tests/mocks/server'
import { http, HttpResponse } from 'msw'

describe('ContactService', () => {
  it('maneja error 429 de Resend', async () => {
    server.use(
      http.post('https://api.resend.com/emails', () => {
        return HttpResponse.json(
          { error: { message: 'Rate limit exceeded' } },
          { status: 429 }
        )
      })
    )

    await expect(sendEmail('user@example.com', 'Test')).rejects.toThrow('Rate limit')
  })

  it('maneja timeout de n8n', async () => {
    server.use(
      http.post('https://n8n.example.com/webhook/*', async () => {
        await delay(5000) // Simular timeout
        return HttpResponse.json({ success: true })
      })
    )

    const result = await triggerWebhook('workflow-123', {})
    expect(result.success).toBe(false)
    expect(result.error).toContain('timeout')
  })
})
```

---

## Snapshot testing

### Cuándo SÍ usar snapshots

- Componentes UI completamente estables (Design System, componentes base)
- Output de funciones de serialización/formateo complejas
- Estructura de objetos de configuración generados programáticamente

```typescript
it('renderiza el badge correctamente', () => {
  const { container } = render(<Badge variant="success">Activo</Badge>)
  expect(container.firstChild).toMatchSnapshot()
})
```

### Cuándo NO usar snapshots

- Componentes que cambian frecuentemente
- Cuando los snapshots se actualizan automáticamente sin revisión (`--updateSnapshot`)
- Para testear comportamiento (usar assertions específicas)
- Para reemplazar tests de lógica

### Actualizar snapshots deliberadamente

```bash
vitest run --updateSnapshot
# Revisar SIEMPRE el diff antes de commitear snapshots actualizados
git diff --stat
```

**Regla:** Si actualizas snapshots sin revisarlos, no estás testeando — estás documentando.

---

## Test de hooks personalizados

```typescript
// hooks/__tests__/useContact.test.ts
import { renderHook, act, waitFor } from '@testing-library/react'
import { useContact } from '../useContact'

describe('useContact', () => {
  it('carga datos al montar', async () => {
    const { result } = renderHook(() => useContact('contact-123'))

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.contact).toMatchObject({
      id: 'contact-123',
      email: expect.any(String),
    })
  })

  it('expone función de actualización', async () => {
    const { result } = renderHook(() => useContact('contact-123'))

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.updateContact({ name: 'Nuevo Nombre' })
    })

    expect(result.current.contact?.name).toBe('Nuevo Nombre')
  })

  it('maneja error de carga', async () => {
    // Sobrescribir MSW handler para este test
    server.use(
      http.get('/api/contacts/:id', () => {
        return HttpResponse.json({ error: 'Not found' }, { status: 404 })
      })
    )

    const { result } = renderHook(() => useContact('nonexistent-id'))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('Not found')
    expect(result.current.contact).toBeNull()
  })
})
```

---

## Test de Context Providers

```typescript
// Wrapper de utilidad reutilizable
import { render, RenderOptions } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'

// tests/utils/render.tsx
const mockSession = {
  user: { id: 'user-123', email: 'test@example.com' },
  expires: '2099-01-01',
}

function AllProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider session={mockSession}>
      <ThemeProvider defaultTheme="light">
        {children}
      </ThemeProvider>
    </AuthProvider>
  )
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options })
}

// Uso en tests:
import { renderWithProviders } from '@/tests/utils/render'

it('muestra el perfil del usuario', () => {
  renderWithProviders(<UserProfile />)
  expect(screen.getByText('test@example.com')).toBeInTheDocument()
})
```

---

## Parallel test execution

```bash
# Correr en paralelo (default con pool: threads)
vitest run

# Ver cuánto tarda cada archivo
vitest run --reporter=verbose

# Forzar serial si hay conflictos de estado global
vitest run --pool=forks --poolOptions.forks.singleFork

# Correr solo tests que fallaron en el último run
vitest run --failed
```

### Evitar conflictos en tests paralelos

```typescript
// MAL: estado global compartido entre tests
let db: Database

beforeAll(() => {
  db = new Database() // Compartido entre tests paralelos
})

// BIEN: instancia por test
it('opera con la db', () => {
  const db = new Database() // Aislado por test
  // ...
})
```

---

## CI configuration — GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    name: Unit & Integration Tests
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests with coverage
        run: npm run test:coverage
        env:
          # Variables de entorno para tests (no reales)
          NEXT_PUBLIC_SUPABASE_URL: http://localhost:54321
          NEXT_PUBLIC_SUPABASE_ANON_KEY: test-anon-key
          SUPABASE_SERVICE_ROLE_KEY: test-service-key

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          file: ./coverage/lcov.info
          fail_ci_if_error: false  # No fallar CI por coverage

      - name: Upload coverage report
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: coverage-report
          path: coverage/
          retention-days: 7
```

### Caché de node_modules en CI

```yaml
# Agregar a cualquier job que use npm
- name: Cache node_modules
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

### Correr tests en matrix (múltiples versiones de Node)

```yaml
strategy:
  matrix:
    node-version: ['18', '20', '22']
steps:
  - uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node-version }}
```
