---
name: market
description: >
  Suite de marketing: orquestador y 13 módulos (auditoría, copy, landing CRO, funnel, competidores, anuncios,
  emails, redes sociales, voz de marca, lanzamiento, propuesta para cliente, reporte MD y PDF).
  Usar cuando: "marketing", "estrategia de marketing", "auditoría de marketing", "analiza mi sitio", "copy",
  "reescribe mi homepage", "email marketing", "secuencia de emails", "funnel", "por qué no convierte",
  "anuncios Google/Meta", "calendario de redes", "voz de marca", "propuesta para cliente", "presupuesto",
  "plan de lanzamiento", "analiza a mi competencia", "reporte PDF para cliente".
---

# AI Marketing Suite -- Main Orchestrator

## Quick Start

```
/market audit <url>       -> Full marketing audit with score (flagship)
/market quick <url>       -> 60-second snapshot, no subagents
/market copy <url>        -> Analyze and rewrite website copy
/market landing <url>     -> Landing page CRO teardown
/market competitors <url> -> Competitive intelligence report
```

## Command Reference

| Command | Output |
|---------|--------|
| `/market audit <url>` | MARKETING-AUDIT.md |
| `/market quick <url>` | Terminal output |
| `/market copy <url>` | COPY-SUGGESTIONS.md |
| `/market emails <topic/url>` | EMAIL-SEQUENCES.md |
| `/market social <topic/url>` | SOCIAL-CALENDAR.md |
| `/market ads <url>` | AD-CAMPAIGNS.md |
| `/market funnel <url>` | FUNNEL-ANALYSIS.md |
| `/market competitors <url>` | COMPETITOR-REPORT.md |
| `/market landing <url>` | LANDING-CRO.md |
| `/market launch <product>` | LAUNCH-PLAYBOOK.md |
| `/market proposal <client>` | CLIENT-PROPOSAL.md |
| `/market report <url>` | MARKETING-REPORT.md |
| `/market report-pdf <url>` | MARKETING-REPORT.pdf |
| `/market seo <url>` | SEO-AUDIT.md *(usa la skill `seo-core`)* |
| `/market brand <url>` | BRAND-VOICE.md |

## Routing Logic

### Full Marketing Audit (`/market audit <url>`)

Flagship command. Launches **5 parallel subagents:**
1. **market-content** -> Content quality, messaging, copy
2. **market-conversion** -> CRO, funnels, landing pages, signup flows
3. **market-competitive** -> Competitive positioning, market landscape
4. **market-technical** -> Technical SEO, site architecture, page speed
5. **market-strategy** -> Overall strategy, pricing, growth opportunities

**Scoring (Marketing Score 0-100):**

| Category | Weight |
|----------|--------|
| Content & Messaging | 25% |
| Conversion Optimization | 20% |
| SEO & Discoverability | 20% |
| Competitive Positioning | 15% |
| Brand & Trust | 10% |
| Growth & Strategy | 10% |

**Composite Marketing Score** = Weighted average of all 6 categories.

### Quick Snapshot (`/market quick <url>`)

Fast 60-second assessment. NO subagents. Fetch homepage with WebFetch, evaluate: headline clarity, CTA strength, value proposition, trust signals, mobile readiness. Output quick scorecard with top 3 wins and top 3 fixes. Keep under 30 lines.

### Individual Commands

Route `/market <command>` to `references/<command>.md` inside this skill (`/market cro` = `landing`). Read that file fully before
running the command; the detail files it cites live in `references/<command>/`. Since 2026-10-01 each former `market-*` skill is
one of these references (same content, one entry in the skill list instead of 14).

| Command | Reference | What it does |
|---|---|---|
| `/market ads` | `references/ads.md` | Genera campañas de anuncios para Google, Meta, LinkedIn y TikTok. |
| `/market audit` | `references/audit.md` | Auditoría completa de marketing con 5 subagentes paralelos. |
| `/market brand` | `references/brand.md` | Análisis y generación de voz de marca, tono e identidad comunicacional. |
| `/market competitors` | `references/competitors.md` | Inteligencia competitiva: mensajería, precios, features y SEO vs competidores. |
| `/market copy` | `references/copy.md` | Análisis y generación de copy para sitios web. |
| `/market emails` | `references/emails.md` | Secuencias de email marketing listas para enviar: bienvenida, onboarding, nurture, retención. |
| `/market funnel` | `references/funnel.md` | Análisis y optimización del embudo de ventas de visita a compra. |
| `/market landing` | `references/landing.md` | Análisis CRO de landing pages — identifica por qué no convierten y cómo mejorarlas. |
| `/market launch` | `references/launch.md` | Playbook de lanzamiento semana a semana para productos o servicios. |
| `/market proposal` | `references/proposal.md` | Genera propuestas de servicios profesionales para clientes. |
| `/market report` | `references/report.md` | Reporte de marketing en Markdown para uso interno con scorecard y resumen ejecutivo. |
| `/market report-pdf` | `references/report-pdf.md` | Reporte de marketing en PDF con gráficos, gauges y tablas visuales para entregar a clientes. |
| `/market social` | `references/social.md` | Calendario de contenido 30 días para redes sociales, listo para publicar. |
| `/market seo <url>` | skill `seo-core` | Technical and on-page SEO audit |

## Business Context Detection

Detect before any analysis -- shapes the entire focus:

| Type | Detection Signals | Focus |
|------|-------------------|-------|
| **SaaS** | Free trial, pricing tiers, login, API docs | Trial-to-paid, onboarding, churn |
| **E-commerce** | Product listings, cart, checkout | Product pages, cart abandonment, AOV |
| **Agency/Services** | Case studies, portfolio, "work with us" | Trust, positioning, lead qualification |
| **Local Business** | Address, phone, hours, maps | Local SEO, GBP, reviews, NAP |
| **Creator/Course** | Lead magnets, email capture, courses | Capture rate, funnel, content quality |
| **Marketplace** | Two-sided messaging, buyer/seller flows | Supply/demand, trust, network effects |

## Output Standards

1. **Actionable over theoretical** -- specific enough to implement today
2. **Prioritized** -- rank by impact (High/Medium/Low) and effort
3. **Revenue-focused** -- connect every suggestion to business outcome
4. **Example-driven** -- before/after copy examples, not just advice
5. **Client-ready** -- presentable without editing

## File Output

Save to markdown in current directory. Include URL, date, and overall score at top. Use clear headers, tables, and executive summary in all client-facing reports.

## Cross-Skill Integration

- `/market audit` calls all subagents for comprehensive analysis
- `/market proposal` references audit results if `MARKETING-AUDIT.md` exists
- `/market report` and `/market report-pdf` compile all available analysis data
- `/market copy` uses `BRAND-VOICE.md` if available
- `/market emails` deepens sequences when `FUNNEL-ANALYSIS.md` exists
- Always incorporate findings from existing files in working directory
