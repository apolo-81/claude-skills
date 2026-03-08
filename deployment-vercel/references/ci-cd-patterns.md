# CI/CD Patterns — GitHub Actions + Vercel

Stack: Next.js 15 App Router + TypeScript + Supabase + n8n

---

## Secrets requeridos en GitHub

Configurar en GitHub → Settings → Secrets and variables → Actions → New repository secret:

| Secret | Cómo obtenerlo |
|--------|---------------|
| `VERCEL_TOKEN` | vercel.com → Settings → Tokens → Create |
| `VERCEL_ORG_ID` | `vercel env pull` o `.vercel/project.json` → `orgId` |
| `VERCEL_PROJECT_ID` | `vercel env pull` o `.vercel/project.json` → `projectId` |
| `SLACK_WEBHOOK_URL` | Slack → Apps → Incoming Webhooks |

Para obtener `VERCEL_ORG_ID` y `VERCEL_PROJECT_ID`:

```bash
cd tu-proyecto
vercel link  # Si no está vinculado
cat .vercel/project.json
# {"orgId":"team_xxx","projectId":"prj_xxx"}
```

---

## Workflow Completo: Preview (PRs)

```yaml
# .github/workflows/preview.yml
name: Preview Deployment

on:
  pull_request:
    types: [opened, synchronize, reopened]

concurrency:
  group: preview-${{ github.ref }}
  cancel-in-progress: true

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  quality:
    name: Quality Checks
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

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Unit tests
        run: npm run test -- --coverage
        env:
          CI: true

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          fail_ci_if_error: false

  deploy-preview:
    name: Deploy Preview
    runs-on: ubuntu-latest
    needs: quality
    outputs:
      preview-url: ${{ steps.deploy.outputs.preview-url }}
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Vercel CLI
        run: npm install -g vercel@latest

      - name: Pull Vercel environment
        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build project
        run: vercel build --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy to preview
        id: deploy
        run: |
          PREVIEW_URL=$(vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }})
          echo "preview-url=$PREVIEW_URL" >> $GITHUB_OUTPUT

      - name: Comment PR with preview URL
        uses: actions/github-script@v7
        with:
          script: |
            const previewUrl = '${{ steps.deploy.outputs.preview-url }}';
            const commitSha = context.sha.substring(0, 7);

            // Buscar comentario existente del bot
            const { data: comments } = await github.rest.issues.listComments({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
            });

            const botComment = comments.find(c =>
              c.user.type === 'Bot' && c.body.includes('Vercel Preview')
            );

            const body = `## Vercel Preview Deployment

            | Status | URL | Commit |
            |--------|-----|--------|
            | Ready | [${previewUrl}](${previewUrl}) | \`${commitSha}\` |

            > Updated: ${new Date().toISOString()}`;

            if (botComment) {
              await github.rest.issues.updateComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                comment_id: botComment.id,
                body,
              });
            } else {
              await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                body,
              });
            }

  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: deploy-preview
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
        run: npx playwright install --with-deps chromium

      - name: Run E2E tests
        run: npx playwright test
        env:
          PLAYWRIGHT_BASE_URL: ${{ needs.deploy-preview.outputs.preview-url }}

      - name: Upload Playwright report
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

---

## Workflow Completo: Producción (merge a main)

```yaml
# .github/workflows/production.yml
name: Production Deployment

on:
  push:
    branches: [main]

concurrency:
  group: production
  cancel-in-progress: false  # NUNCA cancelar deploys a producción

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  quality:
    name: Quality Checks
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

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Unit tests
        run: npm run test
        env:
          CI: true

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: quality
    environment: production  # Requiere aprobación manual si está configurado
    outputs:
      deployment-url: ${{ steps.deploy.outputs.deployment-url }}
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Vercel CLI
        run: npm install -g vercel@latest

      - name: Pull Vercel environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build project
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy to production
        id: deploy
        run: |
          DEPLOY_URL=$(vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }})
          echo "deployment-url=$DEPLOY_URL" >> $GITHUB_OUTPUT

      - name: Create deployment summary
        run: |
          echo "## Production Deployment" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "**URL:** ${{ steps.deploy.outputs.deployment-url }}" >> $GITHUB_STEP_SUMMARY
          echo "**Commit:** ${{ github.sha }}" >> $GITHUB_STEP_SUMMARY
          echo "**Time:** $(date -u)" >> $GITHUB_STEP_SUMMARY

  smoke-tests:
    name: Smoke Tests
    runs-on: ubuntu-latest
    needs: deploy-production
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps chromium

      - name: Run smoke tests against production
        run: npx playwright test --project=smoke
        env:
          PLAYWRIGHT_BASE_URL: https://tu-dominio.com

  notify-failure:
    name: Notify on Failure
    runs-on: ubuntu-latest
    needs: [quality, deploy-production, smoke-tests]
    if: failure()
    steps:
      - name: Notify Slack
        uses: slackapi/slack-github-action@v1.26.0
        with:
          webhook: ${{ secrets.SLACK_WEBHOOK_URL }}
          webhook-type: incoming-webhook
          payload: |
            {
              "text": "Production deployment failed!",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Production deployment failed* :red_circle:\n*Repo:* ${{ github.repository }}\n*Branch:* `${{ github.ref_name }}`\n*Commit:* `${{ github.sha }}`\n*Author:* ${{ github.actor }}\n*<${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View Run>*"
                  }
                }
              ]
            }
```

---

## vercel/action Oficial vs CLI Manual

### `vercel/action` (más simple, menos control)

```yaml
- name: Deploy to Vercel
  uses: amondnet/vercel-action@v25
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
    vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
    vercel-args: '--prod'
```

Ventajas: Setup mínimo, un solo step.
Desventajas: Menos control sobre el proceso de build, no permite separar build de deploy.

### CLI manual (recomendado para control total)

```yaml
- name: Pull environment
  run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}

- name: Build
  run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}

- name: Deploy (prebuilt)
  run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

Ventajas: El build corre en GitHub Actions (más rápido con caché), se puede inspeccionar el output, separar responsabilidades.

**Recomendación**: Usar CLI manual. El flujo `pull → build → deploy --prebuilt` es más rápido porque el build usa la caché de GitHub Actions.

---

## Cache de node_modules y Next.js entre Runs

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js con caché de npm
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'  # Caché automático de ~/.npm

      - name: Caché de Next.js build
        uses: actions/cache@v4
        with:
          path: |
            .next/cache
            ${{ github.workspace }}/.next/cache
          key: ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-${{ hashFiles('**/*.ts', '**/*.tsx', '**/*.js') }}
          restore-keys: |
            ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-
            ${{ runner.os }}-nextjs-

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
```

Ahorros típicos de tiempo con caché activo:
- `npm ci` con caché: ~20s → ~5s
- `next build` con caché `.next/cache`: ~120s → ~30s

---

## Matrix Testing — Múltiples Versiones de Node.js

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: ['18', '20', '22']
      fail-fast: false  # Continuar con otras versiones si una falla
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test
```

---

## Deploy Condicional — Solo a Producción en main

```yaml
on:
  push:
    branches: ['*']  # Todos los branches

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # ... pasos de build ...

      - name: Deploy preview
        if: github.ref != 'refs/heads/main'
        run: vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy production
        if: github.ref == 'refs/heads/main'
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## Status Checks — Requerir Tests Antes de Merge

En GitHub → Settings → Branches → Branch protection rules → main:

1. Activar "Require status checks to pass before merging"
2. Agregar como required: `quality`, `deploy-preview`, `e2e`
3. Activar "Require branches to be up to date before merging"

Los jobs de GitHub Actions aparecen como status checks cuando tienen `name:` definido.

---

## Playwright Config para Tests contra Preview

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'smoke',
      testMatch: '**/*.smoke.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // Iniciar servidor local solo si no hay PLAYWRIGHT_BASE_URL
  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## package.json Scripts Necesarios

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui"
  }
}
```

---

## Workflow para Dependencias Desactualizadas (Opcional)

```yaml
# .github/workflows/dependencies.yml
name: Check Dependencies

on:
  schedule:
    - cron: '0 9 * * 1'  # Lunes a las 9am
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Check for updates
        run: npx npm-check-updates --format group

      - name: Create issue if outdated
        uses: actions/github-script@v7
        with:
          script: |
            // Crear issue si hay dependencias desactualizadas
            // (implementar lógica según necesidad)
```
