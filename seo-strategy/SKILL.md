---
name: seo-strategy
description: >
  Strategic SEO planning, programmatic SEO at scale, and competitor comparison page
  generation. Creates comprehensive SEO strategies with content roadmaps, competitive
  analysis, site architecture, and phased implementation plans. Plans and audits
  programmatic pages from data sources with quality gates. Generates competitor
  "X vs Y", "alternatives to X", and roundup pages. Trigger when user says:
  "SEO plan", "SEO strategy", "SEO roadmap", "content strategy", "keyword research",
  "site architecture", "90 day SEO plan", "increase organic traffic", "SEO quick wins",
  "programmatic SEO", "pages at scale", "template pages", "location pages",
  "generated pages", "data-driven SEO", "competitor comparison", "X vs Y page",
  "alternative to X", "comparison page", "vs page", "alternatives page",
  "feature matrix", "challenger brand content", "content calendar", "link building plan".
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - WebFetch
---

# SEO Strategy, Programmatic SEO & Competitor Pages

Strategic SEO planning + scaled page generation + competitive content creation.

---

## Part 1: Strategic SEO Planning

### Step 1: Business Stage Detection

**Stage A — New Site (0-6mo, <1k monthly organic):**
Priority: Technical foundation > Core pages > Schema > Initial content.
First meaningful traffic in 3-6 months; competitive rankings in 6-12 months.

**Stage B — Growing (6mo-3yr, 1k-50k monthly organic):**
Priority: Content audit > Gap analysis > Content expansion > Link building.
Traffic improvements within 60-90 days.

**Stage C — Established (3+yr, 50k+ monthly organic):**
Priority: Content consolidation > Cannibalization fix > Authority building.
Recovery from consolidation in 30-60 days.

**Stage D — Declining (meaningful traffic drop in 6-12mo):**
Priority: Penalty diagnosis > Content quality uplift > Recovery plan.
Quality-based recovery takes 6-18 months.

### Step 2: Resource Reality Check

| Level | Monthly Content | Link Building |
|-------|----------------|---------------|
| Bootstrap (1 person, <5hr/wk) | 2-4 pieces | Relationships only |
| Small team (2-5 people) | 4-8 pieces | Outreach 1x/week |
| Funded (dedicated SEO budget) | 8-20 pieces | Active outreach |
| Scale (SEO as core channel) | 20+ pieces | Systematic |

### Step 3: Discovery & Situation Analysis
Collect: industry/niche, geography, business model, revenue driver, differentiator.
Assess: indexed pages, monthly organic traffic, top pages, technical issues, backlinks.
Keywords: core terms, informational, branded, competitor-intent.

### Step 4: Competitive Analysis
For each top 3-5 competitor: estimated traffic, domain authority, content strategy,
top traffic pages, keyword gaps, content gaps, technical setup, E-E-A-T signals, backlinks.

### Step 5: Site Architecture
Load industry template from `assets/` directory:
- `saas.md`, `local-service.md`, `ecommerce.md`, `publisher.md`, `agency.md`, `generic.md`

Architecture principles: max 3 clicks from homepage, topical clustering,
URL hierarchy reflects content, no orphan pages, flat > deep.

### Step 6: Content Strategy

**Tier 1 (Commercial intent — highest priority):** Service/product pages, pricing,
comparison/vs pages, "best [category]" pages.

**Tier 2 (Mid-funnel):** "How to choose" guides, case studies, industry-specific
landing pages, problem-aware content.

**Tier 3 (Informational/awareness):** "What is X" posts, ultimate guides, trends,
original research.

### Step 7: Technical Foundation
**Day 1:** GSC, GA4, sitemap, robots.txt, HTTPS, mobile-responsive, CWV passing.
**Month 1:** Canonical tags, schema, OG tags, redirects, compressed images, internal links.
**Quarter 1:** Rich results, hreflang (if multi-language), image/video sitemaps, breadcrumbs.

### Step 8: Quick Wins vs Long Game

**Quick Wins (30 days):** Fix noindex, improve title tags on high-impression/low-CTR
pages, add fetchpriority to hero images, fix broken internal links, add schema, update
meta descriptions on top 10 pages.

**Medium-term (2-4 months):** Content depth expansion, new pillar pages, CWV
optimization, internal linking restructure, 5-10 quality backlinks/month.

**Long game (6-12+ months):** Domain authority building, content clusters, E-E-A-T
development, programmatic SEO, thought leadership, content refresh program.

### Step 9: Implementation Roadmap

**90-Day Plan:**
- Days 1-14: Foundation (GSC, GA4, fix critical technical issues, top 3-5 commercial pages, schema)
- Days 15-45: Content (2-4 pillar pieces, 4-6 blog posts, internal linking, sitemap)
- Days 46-90: Acceleration (8-12 more pieces, link building, optimize from GSC data)

### Output Deliverables
1. SEO-STRATEGY.md — Strategic overview
2. SITE-STRUCTURE.md — URL hierarchy with keywords
3. CONTENT-CALENDAR.md — 90-day detail + 12-month overview
4. COMPETITOR-ANALYSIS.md — Per competitor assessment
5. IMPLEMENTATION-ROADMAP.md — Phased tasks with owners and KPIs

---

## Part 2: Programmatic SEO

### Data Source Assessment
- CSV/JSON: row count, column uniqueness, missing values, duplicates
- API: response structure, freshness, rate limits
- Per-record viability: 5-7 meaningful unique data points minimum
- Near-duplicates (>80% overlap): merge or noindex

### Template Quality
Every page must pass: "Would this page be worth publishing if no other similar pages existed?"

**Components:**
- Static: nav, footer, generic descriptions (shared)
- Dynamic: entity-specific data, specs, reviews, stats (must dominate)
- Conditional: shown/hidden based on data availability

**Content variation strategies:** Data depth, UGC integration, dynamic related
content, third-party data enrichment, supplementary editorial (top 10-20%).

### Uniqueness Requirements

| Page Type | Minimum Unique |
|-----------|---------------|
| Location pages | 40% |
| Integration/tool directories | 35% |
| Glossary/definition | 50% |
| Product pages with specs | 30% |
| Comparison pages | 45% |

### URL Patterns
`/[city]/[service]/`, `/tools/[tool-name]/`, `/integrations/[platform]/`,
`/glossary/[term]/`, `/vs/[competitor]/`, `/[a]-vs-[b]/`

### Quality Gates

| Metric | Threshold | Action |
|--------|-----------|--------|
| Unique content | <40% | Flag as thin — penalty risk |
| Unique content | <30% | HARD STOP — do not publish |
| Word count | <300 | Flag for review |
| Word count | <150 | Do not publish |
| Pages without review | 100+ | WARNING |
| Pages without approval | 500+ | HARD STOP |

### When NOT to Use Programmatic SEO
1. Data too thin (<5-7 unique data points per record)
2. Demand doesn't exist (validate keyword volume first)
3. Business can't support pages (no presence in claimed locations)
4. YMYL niche without expert review
5. Domain authority too low (DR <20, <5% indexation rate)
6. Can't maintain/update data automatically

### Scaled Content Abuse Policy (2024-2026)
Progressive rollout: batches of 50-100; monitor 2-4 weeks before expanding.
Human review: sample 5-10% before publishing. Never 500+ pages simultaneously.
30-40% genuinely unique content minimum between any two pages.

### Internal Linking Automation
Hub/spoke model, related items (3-5 by shared attributes), auto-generated
BreadcrumbList, cross-linking, varied anchor text, 3-5 links per 1,000 words.

---

## Part 3: Competitor Comparison Pages

### Why These Convert Well
"[Competitor] alternative" queries carry extreme purchase intent. Users are
already in purchase decision — higher conversion, lower bounce rate.

### Page Types
1. **X vs Y** — head-to-head feature comparison
2. **Best Alternatives to X** — list of 5-10 alternatives with pros/cons
3. **Why Choose Us Over X** — bottom-of-funnel direct landing page
4. **Best [Category] Tools** — curated roundup with ranking criteria
5. **Comparison Table** — feature matrix, multiple products

### Pre-Writing Research
Verify from competitor's site (not memory): current pricing per plan, features
per plan, recently launched features, G2/Capterra/TrustPilot ratings, common
complaints in negative reviews, competitor's genuine strengths.

### Page Angle Frameworks
- **Challenger vs Incumbent:** "[Competitor] was built for [old]. We're built for [new]."
- **Specialist vs Generalist:** "[Competitor] does everything. We do [X] better."
- **Feature Parity + Lower Price:** "Everything they do. At [X]% of the cost."
- **Values/Ethics:** Privacy-first, open-source, independent — state facts, don't moralize.

### SEO: Keyword Strategy
"[competitor] alternative" outperforms "[our brand] vs [competitor]" — higher
commercial intent, less brand awareness needed, lower competition.

**Title formulas:**
- `[N] Best [Competitor] Alternatives in [Year] (Free & Paid)`
- `[A] vs [B]: Honest Comparison ([Year])`

### Conversion-Optimized Layout
1. H1 + hook paragraph (above fold)
2. Quick verdict / TL;DR box
3. Comparison table (most-visited section)
4. Per-alternative H2 sections (best for, pricing, pros, cons)
5. Migration/switching section
6. Social proof (quotes from users who switched)
7. Pricing comparison table
8. FAQ (5-8 real questions)
9. Final CTA (specific, low-friction)

### Schema Markup
- Product with AggregateRating for each product
- SoftwareApplication for software comparisons
- ItemList for roundup/alternatives pages

### Ethics & Legal
**Can do:** Compare features accurately, state public pricing, quote public reviews.
**Cannot do:** False claims, private info, imply endorsement, defamatory statements.
**Required:** Affiliation disclosure, methodology, date, pricing disclaimer.
Update quarterly; when competitor launches major feature, update within 2 weeks.

### Output: COMPARISON-PAGE.md
- Meta tags block; full page content following layout above
- Comparison table with verified data; FAQ section
- comparison-schema.json (JSON-LD)
- KEYWORD-STRATEGY.md (primary + secondary keywords)
