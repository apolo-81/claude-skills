# Playwright — Setup E2E completo para Next.js 15

Stack: Next.js 15 App Router + TypeScript + Supabase + Vercel.

---

## Instalación

```bash
npm install -D @playwright/test
npx playwright install chromium firefox webkit
```

---

## playwright.config.ts para Next.js

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  // Directorio donde viven los tests E2E
  testDir: './tests/e2e',
  testMatch: '**/*.spec.ts',

  // Timeout por test
  timeout: 30_000,
  expect: { timeout: 5_000 },

  // Reintentos en CI para flakiness
  retries: process.env.CI ? 2 : 0,

  // Paralelo: todos los workers en local, la mitad en CI
  workers: process.env.CI ? '50%' : undefined,

  // Reporte: HTML siempre, line en CI
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    process.env.CI ? ['github'] : ['line'],
  ],

  use: {
    // Base URL del servidor Next.js
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

    // Guardar artifacts en fallo
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',

    // Locale y timezone consistentes
    locale: 'es-ES',
    timezoneId: 'Europe/Madrid',
  },

  projects: [
    // Setup: autenticación (corre primero)
    {
      name: 'setup',
      testMatch: '**/auth.setup.ts',
    },

    // Tests autenticados (dependen de setup)
    {
      name: 'chromium-auth',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // Tests no autenticados
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: '**/authenticated/**',
    },

    // Mobile
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
      testIgnore: '**/authenticated/**',
    },

    // Cross-browser (solo en CI para velocidad)
    ...(process.env.CI
      ? [
          {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
            testIgnore: '**/authenticated/**',
          },
          {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
            testIgnore: '**/authenticated/**',
          },
        ]
      : []),
  ],

  // Arrancar Next.js automáticamente
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NODE_ENV: 'test',
      // Usar base de datos de test
      NEXT_PUBLIC_SUPABASE_URL: process.env.TEST_SUPABASE_URL || '',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.TEST_SUPABASE_ANON_KEY || '',
    },
  },
})
```

---

## Page Object Model (POM)

Centralizar selectores evita duplicación y facilita mantenimiento cuando cambia el HTML.

### Por qué POM

- Cambiar un selector en un lugar actualiza todos los tests
- Tests más legibles: `loginPage.fillEmail()` vs `page.locator('[data-testid="email-input"]')`
- Reutilización entre tests sin duplicar código

### Implementación

```typescript
// tests/e2e/pages/LoginPage.ts
import { Page, Locator, expect } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator
  readonly forgotPasswordLink: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.getByLabel('Email')
    this.passwordInput = page.getByLabel('Contraseña')
    this.submitButton = page.getByRole('button', { name: 'Iniciar sesión' })
    this.errorMessage = page.getByRole('alert')
    this.forgotPasswordLink = page.getByRole('link', { name: '¿Olvidaste tu contraseña?' })
  }

  async goto() {
    await this.page.goto('/login')
    await expect(this.submitButton).toBeVisible()
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }

  async expectErrorMessage(text: string) {
    await expect(this.errorMessage).toContainText(text)
  }
}
```

```typescript
// tests/e2e/pages/DashboardPage.ts
import { Page, Locator, expect } from '@playwright/test'

export class DashboardPage {
  readonly page: Page
  readonly welcomeHeading: Locator
  readonly userMenu: Locator
  readonly signOutButton: Locator
  readonly newContactButton: Locator

  constructor(page: Page) {
    this.page = page
    this.welcomeHeading = page.getByRole('heading', { name: /Bienvenido/ })
    this.userMenu = page.getByRole('button', { name: /Mi cuenta/ })
    this.signOutButton = page.getByRole('menuitem', { name: 'Cerrar sesión' })
    this.newContactButton = page.getByRole('button', { name: 'Nuevo contacto' })
  }

  async expectToBeVisible() {
    await expect(this.welcomeHeading).toBeVisible()
    await expect(this.page).toHaveURL('/dashboard')
  }

  async signOut() {
    await this.userMenu.click()
    await this.signOutButton.click()
  }
}
```

```typescript
// tests/e2e/login.spec.ts
import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'

test('login exitoso redirige al dashboard', async ({ page }) => {
  const loginPage = new LoginPage(page)
  const dashboardPage = new DashboardPage(page)

  await loginPage.goto()
  await loginPage.login('user@example.com', 'password123')
  await dashboardPage.expectToBeVisible()
})

test('muestra error con credenciales inválidas', async ({ page }) => {
  const loginPage = new LoginPage(page)

  await loginPage.goto()
  await loginPage.login('wrong@example.com', 'wrongpass')
  await loginPage.expectErrorMessage('Credenciales incorrectas')
})
```

---

## Autenticación en tests E2E: reusar sesión

Autenticar en cada test es lento. Playwright permite guardar y reusar el estado de sesión.

### tests/e2e/auth.setup.ts

```typescript
import { test as setup, expect } from '@playwright/test'
import { LoginPage } from './pages/LoginPage'

const authFile = 'playwright/.auth/user.json'

setup('autenticación de usuario', async ({ page }) => {
  const loginPage = new LoginPage(page)

  await loginPage.goto()
  await loginPage.login(
    process.env.TEST_USER_EMAIL || 'test@example.com',
    process.env.TEST_USER_PASSWORD || 'test-password-123'
  )

  // Esperar a que el dashboard cargue (confirma login exitoso)
  await expect(page).toHaveURL('/dashboard', { timeout: 10_000 })

  // Guardar el estado de autenticación (cookies + localStorage)
  await page.context().storageState({ path: authFile })
})
```

```typescript
// tests/e2e/authenticated/contacts.spec.ts
// Este test usa storageState definido en playwright.config.ts
import { test, expect } from '@playwright/test'

test('puede crear un contacto', async ({ page }) => {
  // La sesión ya está autenticada — no hay que hacer login
  await page.goto('/dashboard/contacts')
  await page.getByRole('button', { name: 'Nuevo contacto' }).click()
  await page.getByLabel('Nombre').fill('Juan García')
  await page.getByLabel('Email').fill('juan@example.com')
  await page.getByRole('button', { name: 'Guardar' }).click()

  await expect(page.getByText('Contacto creado exitosamente')).toBeVisible()
  await expect(page.getByText('juan@example.com')).toBeVisible()
})
```

### Múltiples roles de usuario

```typescript
// playwright.config.ts — proyectos con distintos roles
projects: [
  { name: 'setup-admin', testMatch: '**/admin.setup.ts' },
  { name: 'setup-user', testMatch: '**/user.setup.ts' },
  {
    name: 'admin-tests',
    use: { storageState: 'playwright/.auth/admin.json' },
    dependencies: ['setup-admin'],
  },
  {
    name: 'user-tests',
    use: { storageState: 'playwright/.auth/user.json' },
    dependencies: ['setup-user'],
  },
]
```

---

## Mock de Stripe Checkout en E2E

### Estrategia: Stripe test mode + stripe-cli para webhooks locales

```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe
stripe login

# En desarrollo/test: redirigir webhooks localmente
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### playwright.config.ts — variables de entorno para Stripe test mode

```typescript
webServer: {
  env: {
    STRIPE_SECRET_KEY: process.env.STRIPE_TEST_SECRET_KEY || '',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_TEST_WEBHOOK_SECRET || '',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_TEST_PUBLISHABLE_KEY || '',
  },
}
```

### Test de checkout con tarjeta de test

```typescript
// tests/e2e/authenticated/checkout.spec.ts
import { test, expect } from '@playwright/test'

// Tarjetas de test de Stripe: https://stripe.com/docs/testing
const STRIPE_TEST_CARDS = {
  success: '4242 4242 4242 4242',
  decline: '4000 0000 0000 0002',
  requiresAuth: '4000 0025 0000 3155',
}

test('checkout exitoso con tarjeta de test', async ({ page }) => {
  await page.goto('/pricing')
  await page.getByRole('button', { name: 'Contratar Pro' }).click()

  // Esperar redirección a Stripe Checkout
  await expect(page).toHaveURL(/checkout\.stripe\.com/, { timeout: 15_000 })

  // Rellenar formulario de Stripe
  await page.getByLabel('Email').fill('test@example.com')
  await page.getByLabel('Card number').fill(STRIPE_TEST_CARDS.success)
  await page.getByLabel('Expiration').fill('12/26')
  await page.getByLabel('CVC').fill('123')
  await page.getByLabel('Name on card').fill('Test User')
  await page.getByRole('button', { name: 'Pay' }).click()

  // Esperar redirección de vuelta a la app
  await expect(page).toHaveURL(/\/dashboard\?checkout=success/, { timeout: 30_000 })
  await expect(page.getByText('Suscripción activada')).toBeVisible()
})

test('muestra error con tarjeta rechazada', async ({ page }) => {
  await page.goto('/pricing')
  await page.getByRole('button', { name: 'Contratar Pro' }).click()
  await expect(page).toHaveURL(/checkout\.stripe\.com/, { timeout: 15_000 })

  await page.getByLabel('Card number').fill(STRIPE_TEST_CARDS.decline)
  await page.getByLabel('Expiration').fill('12/26')
  await page.getByLabel('CVC').fill('123')
  await page.getByRole('button', { name: 'Pay' }).click()

  await expect(page.getByText(/Your card was declined/i)).toBeVisible()
})
```

---

## Visual regression testing

```typescript
// tests/e2e/visual/landing.spec.ts
import { test, expect } from '@playwright/test'

test('landing page — visual regression', async ({ page }) => {
  await page.goto('/')

  // Esperar a que carguen fuentes e imágenes
  await page.waitForLoadState('networkidle')

  // Screenshot de la página completa
  await expect(page).toHaveScreenshot('landing-full.png', {
    fullPage: true,
    // Umbral de diferencia permitida (pixels)
    maxDiffPixels: 100,
  })
})

test('componente Hero — visual regression', async ({ page }) => {
  await page.goto('/')

  const hero = page.locator('section[data-testid="hero"]')
  await expect(hero).toHaveScreenshot('hero-component.png')
})

test('modo oscuro — visual regression', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Toggle dark mode' }).click()
  await page.waitForLoadState('networkidle')

  await expect(page).toHaveScreenshot('landing-dark.png', { fullPage: true })
})
```

```bash
# Generar screenshots de referencia (primera vez)
npx playwright test --update-snapshots tests/e2e/visual/

# Correr comparación
npx playwright test tests/e2e/visual/
```

---

## Accessibility testing con axe-playwright

```bash
npm install -D @axe-core/playwright
```

```typescript
// tests/e2e/a11y/landing.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('landing page — sin violaciones de accesibilidad', async ({ page }) => {
  await page.goto('/')

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()

  // Mostrar violaciones si las hay (mejor DX que solo fallar)
  if (results.violations.length > 0) {
    console.log('Violaciones de accesibilidad encontradas:')
    results.violations.forEach(v => {
      console.log(`  [${v.impact}] ${v.id}: ${v.description}`)
      v.nodes.forEach(n => console.log(`    → ${n.target}`))
    })
  }

  expect(results.violations).toHaveLength(0)
})

test('formulario de contacto — accesibilidad', async ({ page }) => {
  await page.goto('/contact')

  // Excluir reglas conocidas como aceptadas (ej: color contrast de brand)
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .exclude('.brand-gradient') // Excluir selectores específicos si es necesario
    .analyze()

  expect(results.violations).toHaveLength(0)
})
```

---

## Test de mobile viewport

```typescript
// tests/e2e/mobile/navigation.spec.ts
import { test, expect, devices } from '@playwright/test'

// Test con viewport de móvil específico
test.use({ ...devices['iPhone 14'] })

test('menú hamburguesa funciona en mobile', async ({ page }) => {
  await page.goto('/')

  // En mobile el nav principal está oculto
  const desktopNav = page.getByRole('navigation', { name: 'Principal' })
  await expect(desktopNav).not.toBeVisible()

  // Abrir menú hamburguesa
  await page.getByRole('button', { name: 'Abrir menú' }).click()

  // Nav ahora visible
  await expect(desktopNav).toBeVisible()

  // Navegar a una sección
  await page.getByRole('link', { name: 'Contacto' }).click()
  await expect(page).toHaveURL('/contact')

  // El menú se cierra tras navegar
  await expect(desktopNav).not.toBeVisible()
})

test('formulario usable en mobile', async ({ page }) => {
  await page.goto('/contact')

  // Verificar que los inputs son accesibles en mobile
  const emailInput = page.getByLabel('Email')
  await emailInput.tap() // tap en vez de click para mobile
  await expect(emailInput).toBeFocused()

  await emailInput.fill('test@example.com')
  await expect(emailInput).toHaveValue('test@example.com')
})
```

---

## CI setup con GitHub Actions

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  e2e:
    name: Playwright E2E
    runs-on: ubuntu-latest
    timeout-minutes: 30

    env:
      # Supabase de test (proyecto separado)
      NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
      SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.TEST_SUPABASE_SERVICE_ROLE_KEY }}
      # Stripe test mode
      STRIPE_SECRET_KEY: ${{ secrets.STRIPE_TEST_SECRET_KEY }}
      STRIPE_WEBHOOK_SECRET: ${{ secrets.STRIPE_TEST_WEBHOOK_SECRET }}
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${{ secrets.STRIPE_TEST_PUBLISHABLE_KEY }}
      # Credenciales de usuario de test
      TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
      TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install chromium --with-deps
        # Solo Chromium en CI para velocidad. Añadir firefox/webkit si es crítico.

      - name: Build Next.js
        run: npm run build
        env:
          NEXT_TELEMETRY_DISABLED: '1'

      - name: Run Playwright tests
        run: npx playwright test
        env:
          CI: 'true'
          PLAYWRIGHT_BASE_URL: 'http://localhost:3000'

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: always()  # Subir reporte tanto si pasan como si fallan
        with:
          name: playwright-report-${{ github.run_number }}
          path: playwright-report/
          retention-days: 14

      - name: Upload test artifacts (screenshots/videos en fallo)
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-artifacts-${{ github.run_number }}
          path: test-results/
          retention-days: 7
```

### Optimizaciones de CI

```yaml
# Caché de browsers de Playwright
- name: Cache Playwright browsers
  uses: actions/cache@v4
  id: playwright-cache
  with:
    path: ~/.cache/ms-playwright
    key: playwright-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}

- name: Install Playwright browsers
  if: steps.playwright-cache.outputs.cache-hit != 'true'
  run: npx playwright install chromium --with-deps

- name: Install system dependencies (si el caché aplica)
  if: steps.playwright-cache.outputs.cache-hit == 'true'
  run: npx playwright install-deps chromium
```

### Correr E2E solo en PRs que tocan rutas relevantes

```yaml
on:
  pull_request:
    paths:
      - 'app/**'
      - 'components/**'
      - 'tests/e2e/**'
      - 'playwright.config.ts'
```

---

## Fixtures personalizadas

```typescript
// tests/e2e/fixtures.ts
import { test as base, Page } from '@playwright/test'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'

type MyFixtures = {
  loginPage: LoginPage
  dashboardPage: DashboardPage
  authenticatedPage: Page
}

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page))
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page))
  },

  // Fixture que ya tiene sesión iniciada (alternativa a storageState)
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'playwright/.auth/user.json',
    })
    const page = await context.newPage()
    await use(page)
    await context.close()
  },
})

export { expect } from '@playwright/test'

// Uso:
// import { test, expect } from './fixtures'
// test('algo', async ({ loginPage, dashboardPage }) => { ... })
```

---

## Comandos útiles

```bash
# Correr todos los tests E2E
npx playwright test

# Correr un archivo específico
npx playwright test tests/e2e/login.spec.ts

# Correr tests que coincidan con un patrón
npx playwright test --grep "checkout"

# Modo debug interactivo (abre el browser visible)
npx playwright test --debug

# Modo UI (interfaz gráfica para ver tests)
npx playwright test --ui

# Generar código grabando acciones del browser
npx playwright codegen http://localhost:3000

# Ver último reporte HTML
npx playwright show-report

# Actualizar screenshots de referencia
npx playwright test --update-snapshots

# Correr solo en Chromium
npx playwright test --project=chromium

# Correr con video siempre (no solo en fallo)
npx playwright test --video=on
```
