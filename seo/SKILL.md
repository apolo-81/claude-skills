---
name: seo
description: >
  Comprehensive SEO analysis for any website. Triggers: "SEO", "audit", "schema",
  "Core Web Vitals", "sitemap", "E-E-A-T", "AI Overviews", "GEO", "technical SEO",
  "content quality", "page speed", "structured data", "rankings", "organic traffic",
  "Google ranking", "keyword research", "meta tags", "robots.txt", "canonical URL",
  "crawl errors", "indexing problems", "mobile SEO", "local SEO", "international SEO",
  "hreflang", "link building", "por qué no aparezco en Google", "mejorar posición",
  "más tráfico orgánico", "site visibility", "search presence".
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - WebFetch
---

# SEO — Universal SEO Analysis Skill

Comprehensive SEO analysis across all industries (SaaS, local services,
e-commerce, publishers, agencies). Orchestrates 12 specialized sub-skills
and up to 6 subagents for parallel analysis.

## Quick Reference

| Command | What it does |
|---------|-------------|
| `/seo audit <url>` | Full website audit with parallel subagent delegation |
| `/seo page <url>` | Deep single-page analysis |
| `/seo sitemap <url or generate>` | Analyze or generate XML sitemaps |
| `/seo schema <url>` | Detect, validate, and generate Schema.org markup |
| `/seo images <url>` | Image optimization analysis |
| `/seo technical <url>` | Technical SEO audit (8 categories) |
| `/seo content <url>` | E-E-A-T and content quality analysis |
| `/seo geo <url>` | AI Overviews / Generative Engine Optimization |
| `/seo plan <business-type>` | Strategic SEO planning |
| `/seo programmatic [url\|plan]` | Programmatic SEO analysis and planning |
| `/seo competitor-pages [url\|generate]` | Competitor comparison page generation |
| `/seo hreflang [url]` | Hreflang/i18n SEO audit and generation |

## Orchestration Logic

### When to spawn subagents in parallel

Use parallel subagents for **full site audits** (`/seo audit`) because the analysis
covers 6 independent technical domains that have no dependency on each other's results.
Running them in parallel cuts total analysis time from ~30 minutes to ~8 minutes and
delivers a higher-quality integrated report.

**Parallel subagent flow for `/seo audit`:**
1. Detect business type from homepage (SaaS, local, ecommerce, publisher, agency, other)
2. Spawn all 6 subagents simultaneously — they work independently:
   - `seo-technical` — robots.txt, sitemaps, canonicals, Core Web Vitals, security headers
   - `seo-content` — E-E-A-T, readability, thin content, AI citation readiness
   - `seo-schema` — detection, validation, generation recommendations
   - `seo-sitemap` — structure analysis, quality gates, missing pages
   - `seo-performance` — LCP, INP, CLS measurements
   - `seo-visual` — screenshots, mobile testing, above-fold analysis
3. Collect all results and aggregate into unified SEO Health Score (0-100)
4. Create prioritized action plan (Critical → High → Medium → Low)

### When NOT to use subagents

Do NOT spawn subagents for:
- Single-page analysis (`/seo page`) — one focused agent is faster and sufficient
- Quick schema checks or sitemap validation — load the relevant sub-skill directly
- Content audits of 1-3 pages — run inline sequentially
- Targeted questions ("Is my robots.txt correct?") — answer directly without spawning

For individual commands, load the relevant sub-skill directly and run it inline.

## Industry Detection

Detect business type from homepage signals before running analysis — it determines
which quality thresholds, schema types, and content standards apply:

- **SaaS**: pricing page, /features, /integrations, /docs, "free trial", "sign up"
- **Local Service**: phone number, address, service area, "serving [city]", Google Maps embed
- **E-commerce**: /products, /collections, /cart, "add to cart", product schema
- **Publisher**: /blog, /articles, /topics, article schema, author pages, publication dates
- **Agency**: /case-studies, /portfolio, /industries, "our work", client logos

## Quality Gates

Read `references/quality-gates.md` for thin content thresholds per page type.
Hard rules:
- WARNING at 30+ location pages (enforce 60%+ unique content)
- HARD STOP at 50+ location pages (require user justification before proceeding)
- Never recommend HowTo schema (deprecated Sept 2023)
- FAQ schema only for government and healthcare sites
- All Core Web Vitals references use INP, never FID (deprecated March 2024)

## Reference Files

Load these on-demand as needed — do NOT load all at startup:
- `references/cwv-thresholds.md` — Current Core Web Vitals thresholds and measurement details
- `references/schema-types.md` — All supported schema types with deprecation status
- `references/eeat-framework.md` — E-E-A-T evaluation criteria (Dec 2025 QRG update)
- `references/quality-gates.md` — Content length minimums, uniqueness thresholds

## Scoring Methodology

### SEO Health Score (0-100)

This weighted aggregate reflects the relative business impact of each category.
Technical SEO and Content Quality carry the most weight because they are foundational
— technical issues can block all other improvements, and content quality is the
primary determinant of organic ranking in 2026.

| Category | Weight | Why this weight |
|----------|--------|-----------------|
| Technical SEO | 25% | Foundation — blocks all other improvements if broken |
| Content Quality | 25% | Primary ranking factor post-HCS merge into core algo |
| On-Page SEO | 20% | Direct click-through and ranking signals |
| Schema / Structured Data | 10% | Rich results and AI citation enablement |
| Performance (CWV) | 10% | Page Experience signals, INP now a Core Web Vital |
| Images | 5% | Performance and accessibility impact |
| AI Search Readiness | 5% | Emerging channel — growing rapidly in 2026 |

### Priority Levels

- **Critical**: Blocks indexing or causes penalties (immediate fix required, same day)
- **High**: Significantly impacts rankings (fix within 1 week)
- **Medium**: Optimization opportunity (fix within 1 month)
- **Low**: Nice to have (add to backlog)

When presenting findings, always lead with Critical issues — even one Critical issue
can negate all other optimization work.

## Sub-Skills

This skill orchestrates 12 specialized sub-skills:

1. **seo-audit** — Full website audit with parallel delegation
2. **seo-page** — Deep single-page analysis
3. **seo-technical** — Technical SEO (8 categories, including IndexNow)
4. **seo-content** — E-E-A-T and content quality (Dec 2025 update)
5. **seo-schema** — Schema markup detection and generation
6. **seo-images** — Image optimization
7. **seo-sitemap** — Sitemap analysis and generation
8. **seo-geo** — AI Overviews / GEO optimization (all platforms)
9. **seo-plan** — Strategic planning with templates
10. **seo-programmatic** — Programmatic SEO analysis and planning
11. **seo-competitor-pages** — Competitor comparison page generation
12. **seo-hreflang** — Hreflang/i18n SEO audit and generation

## Subagents

For parallel analysis during full audits:
- `seo-technical` — Crawlability, indexability, security, CWV, JS rendering
- `seo-content` — E-E-A-T, readability, thin content, AI citation readiness
- `seo-schema` — Detection, validation, generation
- `seo-sitemap` — Structure, coverage, quality gates
- `seo-performance` — Core Web Vitals measurement (LCP, INP, CLS)
- `seo-visual` — Screenshots, mobile testing, above-fold analysis
