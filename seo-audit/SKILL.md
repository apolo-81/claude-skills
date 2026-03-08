---
name: seo-audit
description: >
  Full website SEO audit with parallel subagent delegation and SEO Health Score.
  Triggers: "audit my site", "full SEO check", "SEO audit", "website health check",
  "SEO health", "complete SEO analysis", "SEO report", "SEO diagnostic",
  "full site audit", "analyze my website SEO", "what's wrong with my site's SEO",
  "run a complete SEO check", "give me an SEO report".
---

# Full Website SEO Audit

## Purpose

The full audit gives a panoramic view of a site's SEO health by running all
specialized analysis modules in parallel. It is the right choice when the user
wants comprehensive coverage rather than a targeted deep-dive into one area.

## Process

### Step 1 — Fetch Homepage

Use `WebFetch` to retrieve the homepage HTML. Extract:
- Title tag, meta description, H1
- Internal link structure (to plan crawl)
- Technology signals (CMS, framework, JS rendering type)
- Business type signals (for industry detection in Step 2)

### Step 2 — Detect Business Type

Analyze homepage signals to classify the site. This drives which quality
thresholds, schema types, and content standards apply throughout the audit:

| Business Type | Detection Signals |
|---------------|------------------|
| SaaS | pricing page, /features, /integrations, /docs, "free trial" |
| Local Service | phone number, address, service area, Google Maps embed |
| E-commerce | /products, /collections, /cart, "add to cart", Product schema |
| Publisher | /blog, /articles, author pages, publication dates, Article schema |
| Agency | /case-studies, /portfolio, "our work", client logos |

### Step 3 — Crawl Site

Follow internal links from the homepage up to 500 pages. Crawl configuration:

```
Max pages:           500
Respect robots.txt:  Yes — never fetch pages disallowed for Googlebot
Follow redirects:    Yes (max 3 hops — flag redirect chains longer than 3)
Timeout per page:    30 seconds
Concurrent requests: 5 (respectful crawl rate)
Delay between reqs:  1 second minimum
User-agent:          Googlebot-compatible
```

While crawling, collect for each page:
- HTTP status code
- Title tag and meta description
- H1 and heading structure
- Canonical URL
- Robots meta tags (noindex, nofollow)
- Internal and external links
- Word count (approximate)
- Schema markup presence
- Images (src, alt text, size if detectable)

### Step 4 — Delegate to Subagents (Parallel)

Spawn all 6 subagents simultaneously — they are fully independent and can run
in parallel without waiting for each other:

| Subagent | Scope |
|----------|-------|
| `seo-technical` | robots.txt, sitemaps, canonicals, Core Web Vitals (LCP/INP/CLS), security headers |
| `seo-content` | E-E-A-T, readability, thin content, duplicate content, AI citation readiness |
| `seo-schema` | Detection, validation against Google's supported types, generation recommendations |
| `seo-sitemap` | Structure analysis, quality gates, missing pages, coverage gaps |
| `seo-performance` | LCP, INP, CLS measurements via PageSpeed Insights API |
| `seo-visual` | Screenshots, mobile rendering, above-fold content analysis |

If subagents are unavailable, run each module sequentially inline using the
corresponding sub-skill instructions.

### Step 5 — Aggregate Scores

Combine subagent results into the unified SEO Health Score using weighted aggregation:

| Category | Weight |
|----------|--------|
| Technical SEO | 25% |
| Content Quality | 25% |
| On-Page SEO | 20% |
| Schema / Structured Data | 10% |
| Performance (CWV) | 10% |
| Images | 5% |
| AI Search Readiness | 5% |

Calculate score: Sum each (subagent_score × weight). Round to nearest integer.

### Step 6 — Generate Report

Write `FULL-AUDIT-REPORT.md` and `ACTION-PLAN.md` to the working directory
(or current project folder). See Expected Output section below.

## Crawl Configuration (Detail)

For sites with robots.txt disallowing large sections, note the restriction and
crawl only allowed pages. If the site has a sitemap.xml, use it to discover
pages rather than crawling from homepage links — it is faster and more complete.

For SPAs (React, Vue, Angular) where content requires JavaScript execution:
- Fetch the raw HTML first to see what Googlebot sees without JS rendering
- Note any critical content (headings, product info, links) that is missing
  from raw HTML — this is a critical technical SEO issue

## Expected Output

### Output Files

- `FULL-AUDIT-REPORT.md` — Comprehensive findings across all categories
- `ACTION-PLAN.md` — Prioritized recommendations (Critical → High → Medium → Low)
- `screenshots/` — Desktop + mobile captures (only if Playwright is available)

### Report Structure

The report follows this exact structure for consistency and readability:

---
**FULL-AUDIT-REPORT.md structure:**

```
# SEO Audit Report — [Site Name]
**Date:** [YYYY-MM-DD]
**URL:** [URL audited]
**Business Type:** [Detected type]

---

## Executive Summary

### Overall SEO Health Score: XX/100
[One-sentence interpretation: "Good", "Needs Improvement", or "Critical Issues Found"]

### Business Type: [Type]
### Pages Crawled: X of max 500

### Top 5 Critical Issues
1. [Issue] — [Impact]
...

### Top 5 Quick Wins
1. [Action] — [Expected impact]
...

---

## Technical SEO (XX/25)
[Findings from seo-technical subagent]
- Crawlability: [status]
- Indexability: [status]
- Security: [status]
- Core Web Vitals: LCP Xs | INP Xms | CLS X
- JavaScript rendering: [status]
- IndexNow: [status]

## Content Quality (XX/25)
[Findings from seo-content subagent]
- E-E-A-T Assessment: [score/breakdown]
- Thin content pages: X found
- Duplicate content: [status]
- AI Citation Readiness: XX/100

## On-Page SEO (XX/20)
- Title tag issues: X pages
- Meta description problems: X pages
- Heading structure issues: X pages
- Internal linking gaps: [key finding]

## Schema & Structured Data (XX/10)
[Findings from seo-schema subagent]
- Types detected: [list]
- Validation errors: X
- Missing opportunities: [list]

## Performance — Core Web Vitals (XX/10)
[Findings from seo-performance subagent]
- LCP: Xs (Good/Needs Improvement/Poor)
- INP: Xms (Good/Needs Improvement/Poor)
- CLS: X (Good/Needs Improvement/Poor)
- Resource optimization: [key finding]
- Third-party impact: [key finding]

## Images (XX/5)
- Missing alt text: X images
- Oversized images: X found
- Format recommendations: [WebP/AVIF opportunities]

## AI Search Readiness (XX/5)
[Findings from seo-geo subagent]
- Citability score: XX/100
- llms.txt: [present/missing]
- AI crawler access: [status]
- Key structural improvements: [list]

---

## Full Issues List
[All issues sorted by priority]

### Critical (fix immediately)
### High (fix within 1 week)
### Medium (fix within 1 month)
### Low (backlog)
```
---

**ACTION-PLAN.md structure:**
Actionable checklist, each item with owner (Dev/Content/Marketing) and effort estimate.

## Priority Definitions

- **Critical**: Blocks indexing, causes manual penalties, or disallows Googlebot — fix same day
- **High**: Significantly impacts rankings or click-through (fix within 1 week)
- **Medium**: Optimization opportunity with measurable upside (fix within 1 month)
- **Low**: Nice to have, minimal ranking impact (add to backlog)
