# Claude Skills Collection

Skills personalizadas y optimizadas para Claude Code — stack React/Next.js/Node.js/Express/Baileys/GHL.

## Restauración rápida (post reinstall)

```bash
git clone https://github.com/apolo-81/claude-skills.git ~/claude-skills
cd ~/claude-skills
bash scripts/install.sh
```

El script instala skills, plugins del marketplace, agents, commands y configura los grupos toggleables.

---

## Estructura del repo

```
claude-skills/
├── <skill-name>/         # 44 skills personalizadas
│   └── SKILL.md
├── config/
│   ├── settings.json     # Configuración Claude Code (plugins, hooks, permisos)
│   ├── CLAUDE.md         # Instrucciones globales
│   ├── statusline-command.sh
│   ├── agents/           # 4 agentes personalizados
│   └── commands/         # 3 comandos personalizados (/resume, /compress, /skills)
└── scripts/
    ├── install.sh        # Script de restauración completa
    └── skill-toggle      # Script para activar/desactivar grupos
```

---

## Skills incluidas (44 total)

### Siempre activas (sin grupo)

| Skill | Stack |
|-------|-------|
| `auth-patterns` | NextAuth v5, JWT custom, RBAC, Prisma adapter |
| `background-jobs` | BullMQ + Redis, queues anti-ban WhatsApp |
| `chatbot-widget` | Vercel AI SDK, chat widgets embebibles |
| `deployment` | Railway (SQLite volumes) + Vercel, GitHub Actions |
| `express-api` | Express 5 + Zod + multi-tenant (patrón GHL) |
| `ghl-integration` | GoHighLevel OAuth2, webhooks, iFrame SSO |
| `pdf-generation` | Puppeteer, @sparticuz/chromium, @react-pdf |
| `prisma-orm` | Prisma 5+, PostgreSQL, Neon, transactions |

### Dev group (ON por defecto)

| Skill | Descripción |
|-------|-------------|
| `form-handling` | Formularios Next.js, react-hook-form, Zod |
| `performance-next` | Core Web Vitals, bundle optimization |
| `error-monitoring` | Sentry, logging estructurado, error boundaries |
| `testing-patterns` | Vitest, Playwright E2E, Testing Library |
| `supabase-stack` | Auth, PostgreSQL, Storage, Realtime, RLS |
| `saas-boilerplate` | Billing Stripe, multi-tenant, onboarding |
| `webhook-integration` | Verificación HMAC, retry, idempotencia |

### Design group (ON por defecto)

| Skill | Descripción |
|-------|-------------|
| `ui-designer` | Design systems desde imágenes de referencia |
| `web-animations` | Framer Motion, GSAP, CSS animations |
| `pro-presentations` | Slides profesionales de alto impacto |
| `landing-page-builder` | Landing pages desde cero o diseño Figma |
| `data-viz-dashboard` | Recharts, Chart.js, dashboards React |
| `email-templates-builder` | HTML emails, Resend, React Email |
| `cms-integration` | Contentful, Sanity, Strapi con Next.js |
| `pwa-patterns` | Service workers, offline-first, instalable |

### Market suite (ON por defecto)

| Skill | Descripción |
|-------|-------------|
| `market` | Orquestador del suite de marketing |
| `market-copy` | Copywriting web, análisis y reescritura |
| `market-landing` | CRO, análisis de landing pages |
| `market-proposal` | Propuestas de servicios profesionales |
| `market-brand` | Voz de marca, tono e identidad |
| `market-launch` | Playbook de lanzamiento semana a semana |
| `market-emails` | Secuencias de email marketing |

### Audit group (OFF por defecto — bajo demanda)

```bash
skill-toggle audit on   # Activar
skill-toggle audit off  # Desactivar
```

12 skills: seo-core, seo-content-onpage, seo-international, seo-strategy, seo-assets, market-audit, market-competitors, market-funnel, market-social, market-ads, market-report, market-report-pdf

### N8N group (OFF por defecto — bajo demanda)

```bash
skill-toggle n8n on
skill-toggle n8n off
```

2 skills: `n8n-ai-agents`, `n8n-to-api`

---

## Plugins del marketplace

Instalados via `ccpm` — se restauran automáticamente con `install.sh`:

| Plugin | Marketplace |
|--------|-------------|
| context7 | claude-plugins-official |
| ralph-loop | claude-plugins-official |
| commit-commands | claude-plugins-official |
| playground | claude-plugins-official |
| superpowers | claude-plugins-official |
| playwright | claude-plugins-official |
| plugin-dev | claude-plugins-official |
| code-review | claude-plugins-official |
| feature-dev | claude-plugins-official |
| claude-code-history-files-finder | daymade-skills |
| competitors-analysis | daymade-skills |
| deep-research | daymade-skills |
| pdf-creator | daymade-skills |
| ppt-creator | daymade-skills |
| skill-reviewer | daymade-skills |
| skills-search | daymade-skills |
| debugging-toolkit | claude-code-workflows |
| codex | openai-codex |

---

## skill-toggle

```bash
skill-toggle status        # Ver estado actual de todos los grupos
skill-toggle audit on/off  # SEO + market research (12 skills)
skill-toggle n8n on/off    # N8N/Automatización (2 skills)
skill-toggle dev on/off    # Desarrollo (7 skills)
skill-toggle design on/off # Diseño/UI (8 skills)
skill-toggle web on/off    # CMS/PWA (2 skills)
skill-toggle list          # Listar grupos
```

Después de togglear ejecutar `/reload-plugins` en Claude Code.

---

## MCPs configurados

`config/settings.json` incluye: `obsidian`, `supabase`, `openspace`.  
Requieren configuración manual de credenciales en cada proyecto.
