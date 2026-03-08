# Claude Skills Collection

Skills personalizadas para Claude Code organizadas por categorias.

## Instalacion rapida

```bash
git clone https://github.com/apolo-81/claude-skills.git
cd claude-skills
bash install.sh
```

## Skills incluidas

### SEO (5 skills consolidadas)
| Skill | Descripcion |
|-------|-------------|
| `seo-core` | Auditorias completas, SEO tecnico, Core Web Vitals |
| `seo-content-onpage` | Calidad de contenido, E-E-A-T, optimizacion on-page |
| `seo-international` | hreflang, SEO local, optimizacion para AI search |
| `seo-strategy` | Planificacion estrategica, SEO programatico |
| `seo-assets` | Schema.org, sitemaps XML, SEO de imagenes |

### SEO Legacy (13 skills originales, desactivadas por defecto)
`seo`, `seo-audit`, `seo-competitor-pages`, `seo-content`, `seo-geo`, `seo-hreflang`, `seo-images`, `seo-page`, `seo-plan`, `seo-programmatic`, `seo-schema`, `seo-sitemap`, `seo-technical`

### Marketing (15 skills)
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
| `market-seo` | Analisis SEO dentro del suite de marketing |
| `market-social` | Calendario 30 dias para redes sociales |

### Desarrollo (8 skills)
`form-handling`, `performance-next`, `error-monitoring`, `testing-patterns`, `deployment-vercel`, `supabase-stack`, `saas-boilerplate`, `webhook-integration`

### IA/Chatbot (3 skills)
`chatbot-widget`, `n8n-ai-agents`, `n8n-to-api`

### Diseno/UI (5 skills)
`ui-designer`, `web-animations`, `landing-page-builder`, `data-viz-dashboard`, `email-templates-builder`

### Web (2 skills)
`cms-integration`, `pwa-patterns`

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
| `seo` | 13 | SEO legacy (las originales) |
| `market` | 15 | Marketing digital |
| `dev` | 8 | Desarrollo web |
| `ai` | 3 | IA y chatbots |
| `design` | 5 | Diseno y UI |
| `web` | 2 | CMS y PWA |
| `all` | 46 | Todas las skills |

## Estructura de archivos

```
skill-name/
  SKILL.md          # Definicion principal de la skill
  references/       # Archivos de referencia (cargados bajo demanda)
  assets/           # Templates y recursos
  scripts/          # Scripts auxiliares
```

## Tips de optimizacion de tokens

- Desactiva grupos que no uses con `skill-toggle <grupo> off`
- Las 5 skills SEO consolidadas reemplazan las 13 originales ahorrando ~5,000 tokens
- Las descriptions cortas (<90 chars) ahorran ~8,000 tokens vs las originales
