---
name: seo-technical
description: >
  Technical SEO audit: crawlability, indexability, Core Web Vitals, security,
  JS rendering. Triggers: "technical SEO", "crawl issues", "robots.txt",
  "Core Web Vitals", "site speed", "page speed", "canonical tags", "noindex",
  "mobile SEO", "JavaScript SEO", "SPA SEO", "crawl budget", "redirect chains",
  "LCP", "CLS", "INP", "security headers", "HTTPS", "SSL certificate",
  "Googlebot blocked", "crawl errors in Search Console", "render-blocking".
---

# Technical SEO Audit

## Overview

Technical SEO covers everything that affects how search engines discover, crawl,
render, and index a site. Issues here are foundational — a single critical
technical issue (e.g., robots.txt blocking Googlebot) can prevent all other
SEO work from having any effect. Always check technical health before optimizing
content or links.

## Categories

### 1. Crawlability

Crawlability determines whether search engine bots can discover and access your
pages. Issues here mean pages may never be seen by Google, regardless of how
good the content is.

**Check for:**
- robots.txt: exists, valid syntax, not accidentally blocking important resources
  (CSS, JS, images needed for rendering)
- XML sitemap: exists, referenced in robots.txt, valid XML format, no 4xx/5xx URLs
- Noindex tags: distinguish intentional (staging, thin pages) from accidental
- Crawl depth: important pages within 3 clicks of homepage (deeper = less crawled)
- JavaScript rendering: verify critical content is not hidden behind JS execution
- Crawl budget: for large sites (>10k pages), prioritize important pages in XML sitemap
  and remove low-value URLs from crawl via robots.txt or noindex

**Critical signals:**
- robots.txt with `Disallow: /` — blocks entire site (Critical)
- sitemap.xml returning 404 — missing discovery mechanism (High)
- Key pages at crawl depth >5 — likely under-crawled (Medium)

**Tools:** Google Search Console Coverage report, Screaming Frog, Sitebulb

#### AI Crawler Management

As of 2026, AI companies actively crawl the web for training data and to power
AI search experiences. Managing these crawlers via robots.txt is a meaningful
technical SEO decision — blocking them can reduce AI search visibility.

**Known AI crawlers:**

| Crawler | Company | robots.txt token | Purpose |
|---------|---------|-----------------|---------|
| GPTBot | OpenAI | `GPTBot` | Model training |
| OAI-SearchBot | OpenAI | `OAI-SearchBot` | ChatGPT web search index |
| ChatGPT-User | OpenAI | `ChatGPT-User` | ChatGPT real-time browsing |
| ClaudeBot | Anthropic | `ClaudeBot` | Claude web features + training |
| anthropic-ai | Anthropic | `anthropic-ai` | Anthropic training |
| PerplexityBot | Perplexity | `PerplexityBot` | Perplexity search index + training |
| Bytespider | ByteDance | `Bytespider` | TikTok/Douyin AI training |
| Google-Extended | Google | `Google-Extended` | Gemini AI training only |
| CCBot | Common Crawl | `CCBot` | Open dataset (frequently blocked) |
| cohere-ai | Cohere | `cohere-ai` | Cohere model training |

**Critical distinctions:**
- Blocking `Google-Extended` prevents Gemini AI training but does NOT affect Google
  Search indexing or AI Overviews (those use `Googlebot` — never block it)
- Blocking `GPTBot` prevents OpenAI training but does NOT prevent ChatGPT from
  citing your content via real-time browsing (`OAI-SearchBot`, `ChatGPT-User`)
- ~5-8% of websites now use AI-specific robots.txt rules (growing rapidly)

**Example — strategic AI crawler configuration:**
```
# Allow all search indexing (never block Googlebot)
User-agent: Googlebot
Allow: /

# Allow AI search visibility crawlers
User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

# Block training-only crawlers if desired
User-agent: GPTBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: *
Allow: /
```

Cross-reference `seo-geo` skill for full AI visibility strategy.

### 2. Indexability

Indexability determines which pages Google actually stores and ranks. Even if
Googlebot can crawl a page, it may not index it due to duplicate signals,
conflicting directives, or thin content.

**Check for:**
- Canonical tags: self-referencing on intended pages, no conflicts with noindex
  (a page with both canonical and noindex is contradictory)
- Duplicate content: near-duplicates from parameter URLs (?color=blue&color=red),
  www vs non-www, HTTP vs HTTPS, trailing slash variants
- Thin content: pages below minimum word counts per type (see seo-content skill)
- Pagination: proper rel=next/prev implementation or load-more pattern
- Hreflang: correct for multi-language/multi-region sites (cross-reference seo-hreflang)
- Index bloat: tag pages, category pages, filtered pages, search result pages
  consuming crawl budget without providing ranking value

**Critical signals:**
- noindex on homepage or key landing pages (Critical)
- Canonical pointing to a different URL that itself has noindex (Critical)
- More than 20% of indexed pages are thin/duplicate (High)
- Parameter URLs generating thousands of near-duplicate pages (High)

### 3. Security

Security signals directly affect Google's willingness to rank a site and
user trust. HTTPS is a ranking factor and required for many browser features.

**Check for:**
- HTTPS: fully enforced with 301 redirects from HTTP, valid SSL certificate
- No mixed content: all resources (CSS, JS, images) load over HTTPS
- SSL certificate: valid, not expiring within 30 days, issued by trusted CA
- Security headers (check via curl or browser dev tools):

| Header | Purpose | Priority |
|--------|---------|---------|
| Strict-Transport-Security (HSTS) | Force HTTPS | High |
| Content-Security-Policy (CSP) | Prevent XSS | Medium |
| X-Content-Type-Options | Prevent MIME sniffing | Medium |
| X-Frame-Options | Prevent clickjacking | Medium |
| Referrer-Policy | Control referrer data | Low |
| Permissions-Policy | Control browser features | Low |

- HSTS preload: check inclusion in Chrome's preload list for high-security sites

**Critical signals:**
- Site accessible via HTTP without redirect (Critical)
- Mixed content blocking resources (High)
- Expired SSL certificate (Critical)
- Missing HSTS header (Medium)

### 4. URL Structure

Clean, logical URLs help both users and search engines understand page hierarchy.
They also affect click-through rates in search results.

**Check for:**
- Clean URLs: descriptive, hyphenated words, no query parameters for canonical content
- Hierarchy: folder structure reflects site architecture (e.g., /blog/category/post)
- Redirects: no chains longer than 1 hop for permanent moves (use 301, not 302)
  — redirect chains waste crawl budget and dilute link equity
- URL length: flag URLs >100 characters — shorter is better for readability
- Trailing slashes: consistent usage across the entire site (mixed causes duplicates)
- Case sensitivity: use lowercase only — mixed case creates duplicate URL variants

**Critical signals:**
- Redirect chains >3 hops (High)
- Redirect loops — infinite recursion (Critical)
- URLs using underscores instead of hyphens (Low — Google can handle, but hyphens preferred)
- URL parameters used as canonical content URLs (Medium)

### 5. Mobile Optimization

Mobile-first indexing is complete (100% of sites as of July 5, 2024). Google
crawls and indexes ALL websites exclusively with the mobile Googlebot user-agent.
The mobile version of your site IS your site for Google. Issues on mobile
directly impact your Google rankings.

**Check for:**
- Responsive design: viewport meta tag present, responsive CSS, no fixed-width layouts
- Touch targets: minimum 48x48px clickable elements with 8px spacing between targets
- Font size: minimum 16px base to avoid mobile zoom requirement
- No horizontal scroll on mobile viewport
- Content parity: all important content present in mobile version (not hidden/deferred)
- Interstitials: no large pop-ups covering content immediately on mobile load

**Critical signals:**
- Missing viewport meta tag (Critical — breaks mobile rendering)
- Content present on desktop but absent on mobile (Critical — Google won't see it)
- Intrusive interstitials on mobile (High — Google penalty risk)
- Touch targets <40px (Medium)

### 6. Core Web Vitals

Core Web Vitals are Google's user experience metrics that are Page Experience ranking
signals. Measured at the 75th percentile of real-user data (CrUX). Poor scores
directly affect rankings, especially in competitive SERPs.

**2026 Thresholds:**

| Metric | Good | Needs Improvement | Poor | What it measures |
|--------|------|-------------------|------|-----------------|
| **LCP** | <2.5s | 2.5s–4.0s | >4.0s | Largest content element load time |
| **INP** | <200ms | 200ms–500ms | >500ms | Worst interaction responsiveness |
| **CLS** | <0.1 | 0.1–0.25 | >0.25 | Unexpected layout shift amount |

**Important notes:**
- **INP replaced FID on March 12, 2024.** FID was removed from all Chrome tools
  (CrUX API, PageSpeed Insights, Lighthouse, Search Console) on September 9, 2024.
  Never reference FID — it is fully deprecated.
- All thresholds evaluated at 75th percentile of real users, not lab data
- Use PageSpeed Insights API, CrUX API, or Search Console CWV report for real-user data
- Lighthouse provides lab data only — use for debugging, not for reporting pass/fail

**Common LCP issues:** Unoptimized images, render-blocking resources, slow TTFB,
no preload for LCP image, lazy-loading the LCP element (do NOT lazy-load LCP)

**Common INP issues:** Long JavaScript tasks (>50ms), event handler delays,
input-blocking animations, excessive DOM size

**Common CLS issues:** Images/ads without explicit dimensions, late-loading fonts,
dynamically injected content above existing content

### 7. Structured Data

Structured data enables rich results in Google Search (review stars, FAQ dropdowns,
breadcrumbs, etc.) and improves AI citation in AI Overviews.

**Check for:**
- Format: JSON-LD (preferred by Google), Microdata, RDFa
- Implementation: in `<head>` or `<body>`, valid JSON, no syntax errors
- Validate against Google's Rich Results Test
- See `seo-schema` skill for full detection, validation, and generation workflow

**Critical signals:**
- Syntax errors in JSON-LD (breaks rich results)
- Deprecated schema types: HowTo (deprecated Sept 2023) — remove immediately
- FAQ schema on commercial pages (only appropriate for government/healthcare)
- Duplicate IDs or conflicting schema on same page

### 8. JavaScript Rendering

Google renders JavaScript, but with significant caveats. Content requiring JS
execution may be indexed hours or days later — or not at all if rendering fails.

**Check for:**
- Content visible in initial HTML response vs requires JS execution
- Identify rendering type: SSR (server-side rendered), SSG (static generated),
  CSR (client-side rendered), or hybrid
- Flag SPA frameworks (React, Vue, Angular, Next.js CSR mode) that render on client
- Verify dynamic rendering if applicable
- Check for prerendering service if using CSR

**December 2025 Google JS SEO clarifications (critical):**

1. **Canonical conflicts**: If raw HTML canonical differs from JS-injected canonical,
   Google may use either. Canonical tags in raw HTML and JS output must be identical.

2. **noindex behavior**: If raw HTML has `<meta name="robots" content="noindex">` but
   JavaScript removes it, Google MAY still honor the raw HTML noindex. Always serve
   correct robots directives in the initial server response.

3. **Non-200 status codes**: Google does NOT render JavaScript on pages returning
   non-200 HTTP status. Any JS-injected content on error pages is invisible to Googlebot.

4. **Structured data timing**: Structured data injected via JS (especially Product markup)
   may face delayed or incomplete processing. For time-sensitive markup, include it in
   the initial server-rendered HTML.

**Best practice**: Serve all critical SEO elements (canonical, meta robots, structured
data, title, meta description, primary content) in the initial server-rendered HTML.
Use JS to enhance, not to produce, essential content.

**Critical signals:**
- Homepage content only visible after JS execution (Critical)
- Title/meta description rendered client-side only (High)
- Product schema injected via JS on e-commerce product pages (Medium)

### 9. IndexNow Protocol

IndexNow allows instant notification to Bing, Yandex, Seznam, and other participating
search engines when content is published or updated. Google does not yet support IndexNow
but uses its own crawling signals.

**Check for:**
- IndexNow key file present at site root (e.g., `/[key].txt`)
- IndexNow implementation: CMS plugin, API calls on publish, sitemap ping
- Benefit: pages indexed on Bing/Yandex within minutes of publication

**Recommendation**: For sites publishing time-sensitive content, implement IndexNow
for non-Google visibility. Low effort, measurable Bing indexing speed improvement.

## Priority Matrix

Use this to triage findings when multiple issues are found simultaneously:

| Impact | Effort | Priority | Action |
|--------|--------|----------|--------|
| Blocks indexing | Any | Critical | Fix same day |
| Significant ranking drop | Low | High | Fix this week |
| Significant ranking drop | High | High | Schedule next sprint |
| Moderate opportunity | Low | Medium | Fix next month |
| Moderate opportunity | High | Medium | Backlog |
| Minor improvement | Any | Low | Backlog |

**Always address Critical issues before anything else** — an optimized H1 tag
means nothing if Googlebot cannot crawl the page.

## Output

### Technical Score: XX/100

### Category Breakdown

| Category | Status | Score | Top Issue |
|----------|--------|-------|-----------|
| Crawlability | / | XX/100 | [key finding] |
| Indexability | / | XX/100 | [key finding] |
| Security | / | XX/100 | [key finding] |
| URL Structure | / | XX/100 | [key finding] |
| Mobile | / | XX/100 | [key finding] |
| Core Web Vitals | / | XX/100 | LCP Xs / INP Xms / CLS X |
| Structured Data | / | XX/100 | [key finding] |
| JS Rendering | / | XX/100 | [key finding] |

Use: Pass, Warning, or Fail for Status column.

### Critical Issues (fix immediately)
### High Priority (fix within 1 week)
### Medium Priority (fix within 1 month)
### Low Priority (backlog)
