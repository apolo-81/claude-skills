---
name: market-seo
description: >
  SEO content analysis within the marketing suite. Triggers: "content SEO",
  "auditoría de contenido SEO", "keyword analysis", "por qué no rankeo",
  "on-page SEO", "content optimization", "E-E-A-T", "keyword research",
  "análisis de palabras clave", "optimizar contenido para SEO",
  "my content is not ranking", "SEO del contenido". Produces SEO-AUDIT.md.
---

# SEO Content Audit (Marketing Suite)

## Skill Purpose

Realiza un audit SEO comprehensivo de una página web o sitio: on-page SEO, calidad de contenido (E-E-A-T), análisis de keywords, SEO técnico básico y estrategia de contenido. Combina análisis automatizado vía `scripts/analyze_page.py` con revisión experta para producir `SEO-AUDIT.md` accionable.

**market-seo vs. seo/* suite:**
- **market-seo** (este skill): SEO como parte de una revisión de marketing general. Se integra con market-audit, market-report y los otros skills market-*.
- **seo/* suite**: Suite SEO standalone para análisis técnico profundo — backlinks, crawl del sitio completo, análisis de dominio, keyword tracking.

Si el usuario ya corrió `/market audit` o `/market landing`, cross-reference esos findings con el SEO audit para un análisis más completo.

## How to Execute

### Step 1: Run Automated Analysis

```bash
python3 scripts/analyze_page.py <url>
```

This script extracts: title tag, meta description, Open Graph tags, heading hierarchy (H1-H6), links (internal/external), images and alt text, forms and CTAs, schema/structured data, social links, tracking scripts, viewport meta tag, canonical tag, robots meta directives.

Capture the JSON output as the foundation for manual analysis. The script finds the data; this skill interprets what it means.

### Step 2: On-Page SEO Checklist

Evaluate each element and score as Pass, Needs Work, or Fail. See [`references/content-seo-frameworks.md`](references/content-seo-frameworks.md) for the full criteria table per element.

Key elements to evaluate:
- **Title tag:** 50-60 characters, primary keyword near the start, unique per page, compelling to click
- **Meta description:** 150-160 characters, keyword naturally included, clear reason to click
- **Heading hierarchy:** Exactly one H1 with primary keyword, logical H2/H3 structure, no skipped levels
- **Image optimization:** All images have descriptive alt text, optimized file sizes, descriptive filenames
- **Internal linking:** 3-10 internal links per 1,000 words, descriptive anchor text, no broken links
- **URL structure:** Human-readable, keywords included, under 75 characters, hyphens (not underscores)

### Step 3: Content Quality Assessment (E-E-A-T)

**Why intent analysis goes before keyword selection:** A page can rank for the right keyword and still fail if the content format doesn't match what users expect when they search. Misalignment between intent and content is the most common reason technically correct SEO doesn't produce rankings.

Evaluate against Google's E-E-A-T framework:

| Dimension | What to Check | Score |
|---|---|---|
| **Experience** | First-hand examples, case studies, screenshots, specific details only an expert would know | Strong / Present / Weak / Missing |
| **Expertise** | Author bio with credentials, depth of content, accurate data, proper terminology | Strong / Present / Weak / Missing |
| **Authoritativeness** | Author bylines, about page, industry awards, backlinks from authoritative sites, media mentions | Strong / Present / Weak / Missing |
| **Trustworthiness** | HTTPS, privacy policy, contact info, customer reviews, sourced claims, up-to-date content | Strong / Present / Weak / Missing |

### Step 4: Keyword and Intent Analysis

**Why search intent analysis comes before keyword selection:** Targeting the right keyword but mismatching the content format is a ranking killer. A user searching "how to do X" (informational) who lands on a sales page (transactional) bounces — and Google notices and penalizes.

**Search intent types:**
| Intent | User Goal | Content Should Be |
|---|---|---|
| Informational | Learn something | Blog post, guide, tutorial, FAQ |
| Commercial | Compare options | Comparison page, review, list |
| Transactional | Buy something | Product page, pricing page, checkout |
| Navigational | Find a specific page | Homepage, login, specific tool |

**Keyword assessment:**
- Primary keyword identified and search intent aligned
- Keyword in title, H1, first 100 words, at least one H2/H3, meta description, URL
- Keyword density: 1-2% ideal, over 3% is stuffing
- 5-10 secondary keywords: synonyms, long-tail variations, related questions, LSI keywords

### Step 5: Technical SEO Quick Check

**Core Web Vitals benchmarks:**
| Metric | Good | Needs Work | Poor |
|---|---|---|---|
| LCP (Largest Contentful Paint) | Under 2.5s | 2.5-4.0s | Over 4.0s |
| FID/INP (Interaction) | Under 100ms | 100-300ms | Over 300ms |
| CLS (Layout Shift) | Under 0.1 | 0.1-0.25 | Over 0.25 |
| TTFB (Time to First Byte) | Under 200ms | 200-500ms | Over 500ms |

**Revenue impact of Core Web Vitals** (research-backed):
- Sites passing all Core Web Vitals see 24% fewer page abandonments
- A 100ms decrease in LCP correlates with 1.1% increase in conversion rates
- Pages loading in 2s have ~9% bounce rate; pages loading in 5s have ~38% bounce rate

**Quick checks:**
- [ ] robots.txt accessible and not blocking important pages or CSS/JS
- [ ] sitemap.xml exists, contains all important pages, submitted to Google Search Console
- [ ] Canonical tag present and pointing to the correct URL
- [ ] Viewport meta tag present (mobile-friendliness)
- [ ] HTTPS active

**Common speed issues to flag:** unoptimized images (recommend WebP), render-blocking JS/CSS, no browser caching, no CDN, excessive third-party scripts, unminified assets, missing gzip/brotli compression.

### Step 6: Content Gap Analysis

**Why existing content is the starting point:** Improving existing content that's already indexed is 3-5x faster to impact than creating new content from scratch. Identify gaps in existing pages before recommending new content.

Methodology:
1. Identify the topic cluster: what main topic does this page/site cover?
2. Map existing content: what subtopics are already covered?
3. Identify missing subtopics: what are competitors covering that this site isn't?
4. Analyze People Also Ask: what questions do searchers have about this topic?
5. Check related searches: what does Google suggest at the bottom of the SERP?

**Content Gap Template:**
| Missing Topic | Search Volume Potential | Competition | Content Type Needed | Priority |
|---|---|---|---|---|
| [Topic] | High/Med/Low | High/Med/Low | Blog/Guide/Tool/Page | 1-5 |

### Step 7: Featured Snippet and Schema Opportunities

See [`references/content-seo-frameworks.md`](references/content-seo-frameworks.md) for complete schema markup table and snippet optimization checklist.

**Featured snippet types:**
- **Paragraph** — Answer in 40-60 words; use question as H2/H3 followed by concise answer
- **List** — Use ordered/unordered lists with H2 containing the target query
- **Table** — Use HTML tables with clear headers
- **Video** — Include video with descriptive title and timestamps

**Schema types to check:** Organization, LocalBusiness, Product, Article, FAQ, HowTo, Review/AggregateRating, BreadcrumbList. Use JSON-LD format (Google's preferred format). Validate with Google's Rich Results Test.

### Step 8: Internal Linking and Content Strategy

**Internal linking opportunities:**
1. Orphan pages — pages with no internal links pointing to them
2. Hub pages — high-authority pages that should link to related content
3. Topical clusters — group related content and create linking structures
4. CTA links — blog content should link to relevant product/service pages

**Content strategy recommendations** (based on audit findings):
- Publishing cadence based on competition and available resources
- Content types: blog posts, guides, tools, videos, infographics
- Keyword targeting strategy: balance high-volume vs. long-tail
- Content update strategy: how often to refresh existing content
- Distribution plan: how to promote content beyond organic search

**Content Prioritization Matrix:**
| Content Idea | Search Volume | Competition | Business Value | Priority Score |
|---|---|---|---|---|
| [Topic] | High/Med/Low | High/Med/Low | High/Med/Low | 1-10 |

Scoring logic: High volume + Low competition + High business value = Highest priority

## Output Format

Generate `SEO-AUDIT.md` in the project root:

```markdown
# SEO Content Audit
## [URL]
### Date: [Date]

---

## SEO Health Score: [X/100]

[1-2 sentence interpretation: what the score means for this specific site]

---

## On-Page SEO Checklist

### Title Tag
- Status: [Pass/Needs Work/Fail]
- Current: "[current title]"
- Recommended: "[improved title]"
- Issues: [specific problems]

### Meta Description
- Status: [Pass/Needs Work/Fail]
- Current: "[current meta]"
- Recommended: "[improved meta]"

### Heading Hierarchy
[H1-H6 structure with assessment]

### Image Optimization
[Alt text audit results with specific images]

### Internal Linking
[Link count, anchor text quality, broken links]

### URL Structure
[Assessment with specific recommendations]

---

## Content Quality (E-E-A-T)
| Dimension | Score | Evidence |
|---|---|---|
| Experience | [Strong/Present/Weak/Missing] | [specific details] |
| Expertise | [Strong/Present/Weak/Missing] | [specific details] |
| Authoritativeness | [Strong/Present/Weak/Missing] | [specific details] |
| Trustworthiness | [Strong/Present/Weak/Missing] | [specific details] |

---

## Keyword Analysis
- Primary Keyword: [keyword]
- Search Intent: [type + alignment assessment]
- Keyword Placement: [checklist results]
- Secondary Keywords: [list with placement notes]

---

## Technical SEO
[Core Web Vitals status, robots.txt, sitemap, canonical, mobile-friendliness]

---

## Content Gap Analysis
[Missing topics table with priority scores]

---

## Featured Snippet Opportunities
[Specific opportunities with recommended content format per opportunity]

---

## Schema Markup
[Current schema vs. recommended — specific types to implement]

---

## Internal Linking Opportunities
[Specific links to add with anchor text recommendations]

---

## Content Strategy Recommendations
[Publishing plan, content priorities with priority matrix]

---

## Prioritized Recommendations

### Critical (Fix Immediately)
1. [Recommendation] — Expected impact: [specific outcome]

### High Priority (This Month)
1. [Recommendation]

### Medium Priority (This Quarter)
1. [Recommendation]

### Low Priority (When Resources Allow)
1. [Recommendation]
```

## Key Principles

- SEO audits should be educational, not just diagnostic. Explain WHY each element matters so the client understands the value and acts on it.
- Always provide "before" (current state) and "after" (recommended change) — the client must see exactly what needs to change.
- Tie improvements to business outcomes. "Optimizing your title tag could increase click-through rate by 20-35%, bringing an estimated 500 more visitors/month" is actionable. "Optimize your title tag" is not.
- Use the automated script data as a foundation, but add expert interpretation on top. The script finds the data; this skill explains what it means.
- Prioritize by effort-to-impact ratio. A title tag change takes 5 minutes but impacts every search impression. A full content rewrite takes weeks.
- The existing content is the starting point. Improving indexed pages is faster than creating new ones.
