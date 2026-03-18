---
name: seo-core
description: >
  Core SEO analysis engine: full website audits, technical SEO (crawlability,
  indexability, security, Core Web Vitals with INP, JS rendering, IndexNow,
  AI crawler management), and orchestration of parallel subagents. Trigger when
  user says: "SEO", "audit", "technical SEO", "Core Web Vitals", "crawl issues",
  "robots.txt", "page speed", "site speed", "Googlebot", "indexing problems",
  "security headers", "mobile SEO", "JavaScript SEO", "SPA SEO", "canonical tags",
  "redirect chains", "crawl budget", "full SEO check", "SEO health", "SEO report",
  "diagnose my site", "why doesn't my site appear on Google", "why am I not on the
  first page", "LCP too slow", "INP score", "CLS score", "HTTPS issues",
  "noindex problems", "mobile-first indexing", or shares a URL for general analysis.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - WebFetch
---

# SEO Core — Audit & Technical Analysis

## Quick Reference

| Command | Action |
|---------|--------|
| `/seo audit <url>` | Full audit with parallel subagent delegation |
| `/seo technical <url>` | Technical SEO audit (9 categories) |

## Industry Detection

Detect business type from homepage before analysis — drives quality thresholds:
- **SaaS**: pricing page, /features, /integrations, /docs, "free trial"
- **Local Service**: phone, address, service area, Google Maps embed
- **E-commerce**: /products, /cart, "add to cart", Product schema
- **Publisher**: /blog, /articles, author pages, Article schema
- **Agency**: /case-studies, /portfolio, client logos

## Scoring — SEO Health Score (0-100)

| Category | Weight |
|----------|--------|
| Technical SEO | 25% |
| Content Quality | 25% |
| On-Page SEO | 20% |
| Schema / Structured Data | 10% |
| Performance (CWV) | 10% |
| Images | 5% |
| AI Search Readiness | 5% |

### Priority Levels
- **Critical**: Blocks indexing/penalties (fix same day)
- **High**: Significant ranking impact (fix within 1 week)
- **Medium**: Optimization opportunity (fix within 1 month)
- **Low**: Nice to have (backlog)

## Quality Gates

See `references/quality-gates.md` for thin content thresholds.
- WARNING at 30+ location pages (enforce 60%+ unique content)
- HARD STOP at 50+ location pages (require user justification)
- Never recommend HowTo schema (deprecated Sept 2023)
- FAQ schema only for government/healthcare sites
- All CWV references use INP, never FID (deprecated March 2024)

## Reference Files (load on-demand)
- `references/cwv-thresholds.md` — CWV thresholds and measurement
- `references/schema-types.md` — Schema types with deprecation status
- `references/eeat-framework.md` — E-E-A-T evaluation criteria (Dec 2025)
- `references/quality-gates.md` — Content length minimums, uniqueness thresholds
- `pdf/google-seo-reference.md` — Google SEO quick reference

---

## Full Audit Workflow

### Step 1 — Fetch Homepage
`WebFetch` homepage HTML. Extract: title, meta desc, H1, internal links, tech signals, business type signals.

### Step 2 — Detect Business Type
Classify from homepage signals (see Industry Detection).

### Step 3 — Crawl Site
Follow internal links up to 500 pages. Config: respect robots.txt, max 3 redirect hops, 30s timeout/page, 5 concurrent, 1s min delay. Collect per page: status, title, meta desc, H1, canonical, robots meta, links, word count, schema, images.

For SPAs: fetch raw HTML first to see what Googlebot sees without JS.

### Step 4 — Delegate to Subagents (Parallel)

| Subagent | Scope |
|----------|-------|
| `seo-core` (technical) | robots.txt, sitemaps, canonicals, CWV, security headers |
| `seo-content-onpage` | E-E-A-T, readability, thin content, on-page elements |
| `seo-assets` | Schema detection/validation, sitemap analysis, image optimization |
| `seo-international` | Hreflang validation (if multi-language detected) |
| Performance | LCP, INP, CLS via PageSpeed Insights |
| Visual | Screenshots, mobile rendering, above-fold analysis |

### Step 5 — Aggregate Scores
Combine using weighted scoring (see Scoring above).

### Step 6 — Generate Report
Write `FULL-AUDIT-REPORT.md` and `ACTION-PLAN.md`. Structure: Executive Summary (Score, Type, Pages, Top 5 Issues, Top 5 Quick Wins), then each category with score, then full issues list by priority.

---

## Technical SEO Checklist

### 1. Crawlability
- robots.txt: exists, valid syntax, not blocking important resources
- XML sitemap: exists, in robots.txt, valid XML, no 4xx/5xx URLs
- Noindex: distinguish intentional from accidental
- Crawl depth: important pages within 3 clicks
- JS rendering: verify critical content not behind JS
- Crawl budget: for >10k pages, prioritize important ones

**Critical signals:** `Disallow: /` (Critical), sitemap 404 (High), key pages depth >5 (Medium)

#### AI Crawler Management
See `references/ai-crawlers.md` for full table. Key distinctions:
- Blocking `Google-Extended` does NOT affect Google Search or AI Overviews
- Blocking `GPTBot` does NOT prevent ChatGPT citing via `OAI-SearchBot`

### 2. Indexability
- Canonical tags: self-referencing, no conflicts with noindex
- Duplicate content: parameter URLs, www/non-www, HTTP/HTTPS, trailing slash
- Thin content: pages below minimum word counts
- Pagination: proper rel=next/prev or load-more
- Index bloat: tag/category/filtered pages consuming crawl budget

### 3. Security
- HTTPS with 301 from HTTP; valid SSL; no mixed content
- Headers: HSTS (High), CSP (Medium), X-Content-Type-Options (Medium), X-Frame-Options (Medium), Referrer-Policy (Low)

### 4. URL Structure
- Clean, descriptive, hyphenated; no query params for canonical content
- No redirect chains >1 hop; no loops; consistent trailing slashes; lowercase; <100 chars

### 5. Mobile
Mobile-first indexing 100% complete (July 2024). Mobile IS your site.
- Responsive + viewport meta; touch targets 48x48px/8px spacing
- Font min 16px; no horizontal scroll; content parity; no intrusive interstitials

### 6. Core Web Vitals

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** | <2.5s | 2.5s-4.0s | >4.0s |
| **INP** | <200ms | 200ms-500ms | >500ms |
| **CLS** | <0.1 | 0.1-0.25 | >0.25 |

INP replaced FID March 12, 2024. See `references/cwv-thresholds.md` for subparts and bottlenecks.

### 7. Structured Data
JSON-LD preferred. See `seo-assets` skill and `references/schema-types.md`.

### 8. JavaScript Rendering (Dec 2025 Google clarifications)
1. Raw HTML vs JS-injected canonical: Google may use either — must match
2. noindex in raw HTML may be honored even if JS removes it
3. Google does NOT render JS on non-200 pages
4. JS-injected structured data faces delayed processing

**Best practice:** Serve critical SEO elements in server-rendered HTML.

### 9. IndexNow
Key file at site root; supported by Bing, Yandex, Seznam (not Google). Low effort, measurable Bing indexing speed improvement.

## Technical Output Format

| Category | Status | Score | Top Issue |
|----------|--------|-------|-----------|
| Crawlability | Pass/Warning/Fail | XX/100 | [finding] |
| Indexability | Pass/Warning/Fail | XX/100 | [finding] |
| Security | Pass/Warning/Fail | XX/100 | [finding] |
| URL Structure | Pass/Warning/Fail | XX/100 | [finding] |
| Mobile | Pass/Warning/Fail | XX/100 | [finding] |
| Core Web Vitals | Pass/Warning/Fail | XX/100 | LCP/INP/CLS |
| Structured Data | Pass/Warning/Fail | XX/100 | [finding] |
| JS Rendering | Pass/Warning/Fail | XX/100 | [finding] |
| IndexNow | Pass/Warning/Fail | XX/100 | [finding] |

Issues by Priority: Critical > High > Medium > Low

## Priority Matrix

| Impact | Effort | Priority |
|--------|--------|----------|
| Blocks indexing | Any | Critical — fix same day |
| Significant drop | Low | High — fix this week |
| Significant drop | High | High — next sprint |
| Moderate opportunity | Low | Medium — next month |
| Moderate opportunity | High | Medium — backlog |
| Minor improvement | Any | Low — backlog |
