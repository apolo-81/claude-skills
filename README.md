# Claude Skills Collection

Skills personalizadas y optimizadas para Claude Code organizadas por categorias.

## Instalacion rapida

```bash
git clone https://github.com/apolo-81/claude-skills.git
cd claude-skills
bash install.sh
```

## Skills incluidas (36 total)

> Todas las skills fueron optimizadas (~45% reduccion de tokens) moviendo codigo y templates a `references/` y eliminando prosa redundante.

### SEO (5 skills)
| Skill | Descripcion |
|-------|-------------|
| `seo-core` | Auditorias completas, SEO tecnico, Core Web Vitals |
| `seo-content-onpage` | Calidad de contenido, E-E-A-T, optimizacion on-page |
| `seo-international` | hreflang, SEO local, optimizacion para AI search |
| `seo-strategy` | Planificacion estrategica, SEO programatico |
| `seo-assets` | Schema.org, sitemaps XML, SEO de imagenes |

### Marketing (14 skills)
| Skill | Descripcion |
|-------|-------------|
| `market` | Orquestador principal del suite de marketing |
| `market-audit` | Auditoria completa con 5 subagentes en paralelo |
| `market-brand` | Voz de marca y brand guidelines |
| `market-competitors` | Inteligencia competitiva |
| `market-copy` | Copywriting para sitios web |
| `market-ads` | Campanas multi-plataforma (Google, Meta, LinkedIn) |
| `market-emails` | Secuencias de email |
| `market-funnel` | Analisis de funnel de ventas |
| `market-landing` | CRO de landing pages |
| `market-launch` | Playbook de lanzamiento de producto |
| `market-proposal` | Propuestas de servicios de marketing |
| `market-report` | Reporte Markdown (uso interno) |
| `market-report-pdf` | Reporte PDF con charts y gauges |
| `market-social` | Calendario 30 dias para redes sociales |

### Desarrollo (7 skills)
| Skill | Descripcion |
|-------|-------------|
| `form-handling` | Formularios con validacion y uploads |
| `performance-next` | Optimizacion de rendimiento Next.js |
| `error-monitoring` | Monitoreo de errores con Sentry |
| `testing-patterns` | Testing con Vitest y Playwright |
| `supabase-stack` | Backend con Supabase (auth, DB, storage) |
| `saas-boilerplate` | Boilerplate SaaS con Stripe y auth |
| `webhook-integration` | Integraciones con webhooks |

### IA/Chatbot (3 skills)
| Skill | Descripcion |
|-------|-------------|
| `chatbot-widget` | Widget de chatbot con IA |
| `n8n-ai-agents` | Agentes de IA en n8n |
| `n8n-to-api` | Exponer workflows n8n como API |

### Diseno/UI (5 skills)
| Skill | Descripcion |
|-------|-------------|
| `ui-designer` | Extraccion de design systems y generacion de UI |
| `web-animations` | Animaciones web (CSS, Framer Motion) |
| `landing-page-builder` | Constructor de landing pages |
| `data-viz-dashboard` | Dashboards y visualizacion de datos |
| `email-templates-builder` | Templates de email HTML responsivos |

### Web (2 skills)
| Skill | Descripcion |
|-------|-------------|
| `cms-integration` | Integracion de CMS headless |
| `pwa-patterns` | Progressive Web Apps |

## skill-toggle

Script para activar/desactivar skills por grupo. Renombra `SKILL.md` <-> `SKILL.md.off`.

```bash
skill-toggle status          # Ver estado de todas
skill-toggle seo off         # Desactivar SEO
skill-toggle market off      # Desactivar Marketing
skill-toggle dev on          # Activar Desarrollo
skill-toggle all off         # Desactivar todas
skill-toggle list            # Listar grupos
```

### Grupos disponibles

| Grupo | Skills | Descripcion |
|-------|--------|-------------|
| `seo` | 5 | SEO consolidado |
| `market` | 14 | Marketing digital |
| `dev` | 7 | Desarrollo web |
| `ai` | 3 | IA y chatbots |
| `design` | 5 | Diseno y UI |
| `web` | 2 | CMS y PWA |
| `all` | 36 | Todas las skills |

## Estructura de archivos

```
skill-name/
  SKILL.md          # Definicion principal (optimizada, solo logica de decision)
  references/       # Codigo, templates, output formats (cargados bajo demanda)
  assets/           # Templates y recursos
  scripts/          # Scripts auxiliares
```

## Optimizacion de tokens

Las skills fueron optimizadas siguiendo estos principios:

- **SKILL.md compacto**: solo arboles de decision, tablas rapidas y checklists
- **references/**: codigo, templates de output y frameworks detallados movidos aqui
- **Sin prosa redundante**: eliminadas secciones "por que importa" y conocimiento generico
- Desactiva grupos que no uses con `skill-toggle <grupo> off`

## Backup & Restore

Captura el estado de plugins y MCPs instalados para reproducirlo en otra maquina.

### Capturar estado actual

```bash
python3 bin/backup.py           # actualiza backup/plugins.json y mcp-servers.json
python3 bin/backup.py --commit  # lo mismo + git commit + push automatico
```

### Restaurar en nueva maquina

```bash
git clone https://github.com/apolo-81/claude-skills.git
cd claude-skills

# 1. Instalar skills custom
bash install.sh

# 2. Configurar tokens (ver backup/env.example)
cp backup/env.example ~/.env
nano ~/.env

# 3. Instalar plugins y configurar MCPs
python3 bin/restore.py

# 4. Preview sin instalar nada
python3 bin/restore.py --dry-run
```

### Archivos de backup

| Archivo | Descripcion |
|---------|-------------|
| `backup/plugins.json` | Lista de plugins con marketplace de origen |
| `backup/mcp-servers.json` | Configuracion de MCPs (tokens redactados con $VAR) |
| `backup/env.example` | Plantilla de variables de entorno requeridas |
