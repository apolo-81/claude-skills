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

Comprehensive SEO analysis engine covering full website audits and technical SEO
across 9 categories. Orchestrates parallel subagents for audit efficiency.

## Quick Reference

| Command | What it does |
|---------|-------------|
| `/seo audit <url>` | Full website audit with parallel subagent delegation |
| `/seo technical <url>` | Technical SEO audit (9 categories) |

## Industry Detection

Detect business type from homepage before analysis — drives quality thresholds:

- **SaaS**: pricing page, /features, /integrations, /docs, "free trial", "sign up"
- **Local Service**: phone number, address, service area, Google Maps embed
- **E-commerce**: /products, /collections, /cart, "add to cart", Product schema
- **Publisher**: /blog, /articles, author pages, publication dates, Article schema
- **Agency**: /case-studies, /portfolio, "our work", client logos

## Scoring Methodology

### SEO Health Score (0-100) — Weighted Aggregate

| Category | Weight | Why |
|----------|--------|-----|
| Technical SEO | 25% | Foundation — blocks all improvements if broken |
| Content Quality | 25% | Primary ranking factor post-HCS merge |
| On-Page SEO | 20% | Direct click-through and ranking signals |
| Schema / Structured Data | 10% | Rich results and AI citation enablement |
| Performance (CWV) | 10% | Page Experience signals, INP as Core Web Vital |
| Images | 5% | Performance and accessibility impact |
| AI Search Readiness | 5% | Emerging channel — growing rapidly in 2026 |

### Priority Levels

- **Critical**: Blocks indexing or causes penalties (fix same day)
- **High**: Significantly impacts rankings (fix within 1 week)
- **Medium**: Optimization opportunity (fix within 1 month)
- **Low**: Nice to have (backlog)

## Quality Gates

Read `references/quality-gates.md` for thin content thresholds per page type.
Hard rules:
- WARNING at 30+ location pages (enforce 60%+ unique content)
- HARD STOP at 50+ location pages (require user justification)
- Never recommend HowTo schema (deprecated Sept 2023)
- FAQ schema only for government and healthcare sites
- All Core Web Vitals references use INP, never FID (deprecated March 2024)

## Reference Files

Load on-demand — do NOT load all at startup:
- `references/cwv-thresholds.md` — Current CWV thresholds and measurement
- `references/schema-types.md` — All supported schema types with deprecation status
- `references/eeat-framework.md` — E-E-A-T evaluation criteria (Dec 2025 update)
- `references/quality-gates.md` — Content length minimums, uniqueness thresholds
- `pdf/google-seo-reference.md` — Google SEO quick reference

---

## Full Audit Workflow

### Step 1 — Fetch Homepage

Use `WebFetch` to retrieve homepage HTML. Extract:
- Title tag, meta description, H1
- Internal link structure (to plan crawl)
- Technology signals (CMS, framework, JS rendering type)
- Business type signals (for industry detection)

### Step 2 — Detect Business Type

Classify from homepage signals (see Industry Detection above).

### Step 3 — Crawl Site

Follow internal links up to 500 pages. Crawl config:
- Respect robots.txt; follow redirects (max 3 hops)
- Timeout 30s/page; concurrent requests: 5; delay: 1s minimum
- Collect per page: status, title, meta desc, H1, canonical, robots meta,
  internal/external links, word count, schema presence, images

For SPAs: fetch raw HTML first to see what Googlebot sees without JS rendering.

### Step 4 — Delegate to Subagents (Parallel)

Spawn 6 independent subagents simultaneously:

| Subagent | Scope |
|----------|-------|
| `seo-core` (technical) | robots.txt, sitemaps, canonicals, CWV, security headers |
| `seo-content-onpage` | E-E-A-T, readability, thin content, on-page elements |
| `seo-assets` | Schema detection/validation, sitemap analysis, image optimization |
| `seo-international` | Hreflang validation (if multi-language detected) |
| Performance | LCP, INP, CLS measurements via PageSpeed Insights |
| Visual | Screenshots, mobile rendering, above-fold analysis |

### Step 5 — Aggregate Scores

Combine results using weighted scoring (see Scoring Methodology).

### Step 6 — Generate Report

Write `FULL-AUDIT-REPORT.md` and `ACTION-PLAN.md` to working directory.

**Report structure:**
- Executive Summary (Score, Business Type, Pages Crawled, Top 5 Issues, Top 5 Quick Wins)
- Technical SEO (XX/25)
- Content Quality (XX/25)
- On-Page SEO (XX/20)
- Schema & Structured Data (XX/10)
- Performance — Core Web Vitals (XX/10)
- Images (XX/5)
- AI Search Readiness (XX/5)
- Full Issues List (Critical / High / Medium / Low)

---

## Technical SEO Checklist

### 1. Crawlability

- robots.txt: exists, valid syntax, not blocking important resources
- XML sitemap: exists, referenced in robots.txt, valid XML, no 4xx/5xx URLs
- Noindex tags: distinguish intentional from accidental
- Crawl depth: important pages within 3 clicks of homepage
- JavaScript rendering: verify critical content not hidden behind JS
- Crawl budget: for >10k page sites, prioritize important pages

**Critical signals:**
- `Disallow: /` in robots.txt (Critical)
- sitemap.xml returning 404 (High)
- Key pages at crawl depth >5 (Medium)

#### AI Crawler Management

Known AI crawlers and robots.txt tokens:

| Crawler | Company | Purpose |
|---------|---------|---------|
| GPTBot | OpenAI | Model training |
| OAI-SearchBot | OpenAI | ChatGPT web search index |
| ChatGPT-User | OpenAI | ChatGPT real-time browsing |
| ClaudeBot | Anthropic | Claude web features + training |
| anthropic-ai | Anthropic | Training |
| PerplexityBot | Perplexity | Search index + training |
| Google-Extended | Google | Gemini AI training only |
| CCBot | Common Crawl | Open dataset |

**Key distinctions:**
- Blocking `Google-Extended` does NOT affect Google Search or AI Overviews
- Blocking `GPTBot` does NOT prevent ChatGPT from citing via `OAI-SearchBot`

### 2. Indexability

- Canonical tags: self-referencing, no conflicts with noindex
- Duplicate content: parameter URLs, www vs non-www, HTTP vs HTTPS, trailing slash
- Thin content: pages below minimum word counts
- Pagination: proper rel=next/prev or load-more
- Index bloat: tag/category/filtered pages consuming crawl budget

### 3. Security

- HTTPS enforced with 301 redirects from HTTP
- No mixed content; valid SSL certificate
- Security headers: HSTS (High), CSP (Medium), X-Content-Type-Options (Medium),
  X-Frame-Options (Medium), Referrer-Policy (Low)

### 4. URL Structure

- Clean, descriptive, hyphenated URLs; no query parameters for canonical content
- No redirect chains >1 hop; no redirect loops
- Consistent trailing slashes; lowercase only
- URL length <100 characters

### 5. Mobile Optimization

Mobile-first indexing is 100% complete (July 5, 2024). Mobile IS your site for Google.
- Responsive design with viewport meta tag
- Touch targets minimum 48x48px with 8px spacing
- Font size minimum 16px; no horizontal scroll
- Content parity: all content present on mobile
- No intrusive interstitials

### 6. Core Web Vitals (2026 Thresholds)

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** | <2.5s | 2.5s-4.0s | >4.0s |
| **INP** | <200ms | 200ms-500ms | >500ms |
| **CLS** | <0.1 | 0.1-0.25 | >0.25 |

INP replaced FID on March 12, 2024. Never reference FID.
See `references/cwv-thresholds.md` for LCP subparts, measurement sources, and
common bottlenecks.

### 7. Structured Data

- JSON-LD preferred; validate against Rich Results Test
- See `seo-assets` skill for full schema workflow
- See `references/schema-types.md` for active/deprecated types

### 8. JavaScript Rendering

**December 2025 Google clarifications:**
1. Raw HTML canonical vs JS-injected canonical: Google may use either — must match
2. noindex in raw HTML may be honored even if JS removes it
3. Google does NOT render JS on non-200 status pages
4. JS-injected structured data faces delayed processing

**Best practice:** Serve all critical SEO elements in initial server-rendered HTML.

### 9. IndexNow Protocol

- Key file at site root, CMS plugin or API calls on publish
- Supported by Bing, Yandex, Seznam (not Google)
- Low effort, measurable Bing indexing speed improvement

## Technical Output Format

### Technical Score: XX/100

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

### Issues by Priority
- Critical (fix immediately)
- High (fix within 1 week)
- Medium (fix within 1 month)
- Low (backlog)

## Priority Matrix

| Impact | Effort | Priority | Action |
|--------|--------|----------|--------|
| Blocks indexing | Any | Critical | Fix same day |
| Significant ranking drop | Low | High | Fix this week |
| Significant ranking drop | High | High | Schedule next sprint |
| Moderate opportunity | Low | Medium | Fix next month |
| Moderate opportunity | High | Medium | Backlog |
| Minor improvement | Any | Low | Backlog |
