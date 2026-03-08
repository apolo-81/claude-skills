---
name: seo-programmatic
description: >
  Programmatic SEO for pages generated at scale from data sources. Triggers:
  "programmatic SEO", "pages at scale", "template pages", "dynamic pages",
  "data-driven SEO", "location pages", "service area pages", "glossary SEO",
  "bulk page creation", "generar páginas desde CSV/API/base de datos",
  "páginas de ciudad + servicio", "landing pages automatizadas",
  "SEO at scale", "integration pages", "directorio de herramientas",
  "páginas generadas a escala", "long tail programmatic".
---

# Programmatic SEO Analysis & Planning

Build and audit SEO pages generated at scale from structured data sources.
Enforces quality gates to prevent thin content penalties and index bloat.
The goal is to create hundreds or thousands of pages that each genuinely serve
a user's specific query — not to create pages that exist only to target keywords.

## Detecting If a Site Already Uses Programmatic SEO

Before planning new programmatic pages, check if the site already generates pages
at scale — and whether those pages are working or causing harm.

### Detection Signals (How to Identify Competitor Programmatic SEO)

Use these signals to detect if a competitor uses programmatic SEO at scale:

- **URL patterns with repeated structure:** `/[city]/[service]/`, `/tools/[tool-name]/`, `/vs/[competitor]/`
  — consistent patterns across hundreds of URLs reveal template-generated content
- **Large page count relative to content team size:** 1,000+ pages at a company with
  3 people means the content isn't manually written
- **Near-identical content with variable substitution:** view source on 3-4 similar
  pages; if only the city name or product name changes, it's programmatic
- **High index count in GSC vs published content count:** 10,000 indexed pages with
  a 5-person team = programmatic
- **Crawl report shows thousands of thin pages** with <300 words
- **GSC Coverage shows large numbers of "Crawled — currently not indexed"** pages =
  Google found the pages but didn't find them valuable enough to index
- **Sitemap with sequential IDs or data-derived slugs:** `/locations/4829/`, `/tools/slack-1/`
- **Structured URL patterns in Ahrefs/SEMrush organic pages report:**
  if their top organic pages all follow the same pattern, it's programmatic

### If Already Using Programmatic SEO (audit mode)
1. Pull a sample of 20-50 programmatic pages across the set
2. Measure unique content percentage (see Uniqueness Calculation below)
3. Check GSC: are these pages being indexed? Generating impressions?
4. Check for manual actions in GSC Search Console → Manual Actions
5. Compare organic traffic trend since programmatic rollout — uplift or decline?

## Data Source Assessment

Evaluate the data before designing templates. Weak data = weak pages.

### Data Quality Checks
- **CSV/JSON files**: Row count, column uniqueness, missing values, duplicate rows
- **API endpoints**: Response structure, data freshness, rate limits, reliability
- **Database queries**: Record count, field completeness, update frequency

### Per-Record Viability Test
Each record must pass these checks before a page is generated:
- Does this record have enough unique attributes to produce distinct content from
  every other record? (Minimum 5-7 meaningful unique data points)
- Are there near-duplicate records? (>80% field overlap = merge or noindex)
- Is the data fresh enough? (Stale data produces outdated pages — check last updated)
- Would a real user find value in a dedicated page for this record?

### Data Minimum Viable Standard
| Data Type | Minimum Fields for Viable Page |
|-----------|-------------------------------|
| Location pages | City, service description, local data/reviews/pricing, local schema |
| Integration pages | Integration name, setup docs, API details, use cases, screenshots |
| Product pages | Name, description, specs, price, availability, images, reviews |
| Glossary terms | Term, 200+ word definition, examples, related terms, use cases |
| Tool/template pages | Name, description, download/use, instructions, categories |
| Comparison pages | Both entities' real feature data — not just names |

## Template Engine Planning

### Template Quality Standard
Every template must produce pages that pass the "Standalone Value Test":
> "Would this page be worth publishing even if no other similar pages existed?"

If the answer is "only because of the keyword target," the template is too thin.

### Template Components

**Static components (shared across all pages in the set):**
- Site navigation, footer, global CTAs
- Generic category descriptions
- General instructional text that applies to all items in the set

**Dynamic components (unique per page — must dominate the page):**
- Primary entity name, description, attributes
- Entity-specific data: specs, pricing, reviews, statistics
- Related entities drawn from data (linked automatically)
- User-generated content where available (reviews, comments, questions)
- Contextual content generated from data attributes (not just string substitution)

**Conditional components (shown/hidden based on data availability):**
- Review section (only if reviews exist for this entity)
- Pricing table (only if pricing data available)
- "Near me" section (only for location pages where geo data exists)
- Comparison table (only if comparison data available)

### Template Review Checklist
- [ ] No "mad-libs" pattern: swapping `[city]` into identical text = thin content
- [ ] Dynamic sections provide information, not just keyword variations
- [ ] Each page reads as a standalone, valuable resource to a real user
- [ ] Template includes at least 3-5 unique data points per record
- [ ] Conditional sections prevent empty or placeholder sections
- [ ] Internal links are generated from data relationships, not random

### Content Variation Strategies (Avoid Thin Content)

**Strategy 1: Data depth** — Pull every available data attribute into the page.
Instead of just city + service name, include: population, median income (for
service context), local competitors, local reviews, regional pricing variations.

**Strategy 2: User-generated content integration** — Reviews, Q&A, forum mentions
create automatic uniqueness without editorial effort.

**Strategy 3: Dynamic related content** — Auto-link to 3-5 related pages based on
shared attributes. "Other services in [City]" and "Other cities for [Service]" both
create unique contextual links.

**Strategy 4: Third-party data integration** — Enrich your data with public APIs:
Census data for demographic context, Yelp for local reviews, Google Places for
local context.

**Strategy 5: Supplementary editorial content** — For the most important 10-20%
of programmatic pages, add a human-written editorial section that provides depth
beyond what the template can generate automatically.

### Unique Content Percentage Requirements by Page Type

The required uniqueness threshold varies by how much competition exists and how
strictly Google scrutinizes the category:

| Page Type | Minimum Unique Content | Notes |
|-----------|----------------------|-------|
| Location pages (city + service) | 40% | High scrutiny; many spam sites in this pattern |
| Integration/tool directories | 35% | Lower scrutiny if real setup docs used |
| Glossary/definition pages | 50% | Must go beyond dictionary definition |
| Product pages with real specs | 30% | Spec data itself creates differentiation |
| Comparison pages | 45% | Must have real feature differences, not just names |
| User profile/listing pages | 25% | UGC creates natural uniqueness |

## URL Pattern Strategy

### Common Proven Patterns
| Pattern | Use Case | Example |
|---------|----------|---------|
| `/[city]/[service]/` | Local service businesses | `/austin/plumbers/` |
| `/tools/[tool-name]/` | SaaS tool directories | `/tools/slack-alternative/` |
| `/integrations/[platform]/` | Integration directories | `/integrations/zapier/` |
| `/glossary/[term]/` | Glossary/definition pages | `/glossary/cost-per-click/` |
| `/templates/[name]/` | Template libraries | `/templates/invoice-template/` |
| `/vs/[competitor]/` | Competitor comparison | `/vs/hubspot/` |
| `/[a]-vs-[b]/` | Head-to-head | `/notion-vs-confluence/` |
| `/[category]/[item]/` | Product/item directories | `/laptops/macbook-pro-14/` |

### URL Rules
- Lowercase, hyphenated slugs derived from data field values
- Slugify: convert special characters, remove stop words where they lengthen URLs
- Enforce uniqueness at generation time — duplicate slugs = duplicate content
- Keep URLs under 100 characters
- No query parameters for primary content URLs (use clean paths)
- Consistent trailing slash usage (match existing site convention)
- Avoid date-stamping programmatic URLs unless content is time-sensitive

## When NOT to Use Programmatic SEO

This is as important as knowing when to use it. Programmatic SEO has caused
significant penalties when misapplied — here are specific failure cases:

**1. Data is too thin:**
You have fewer than 5-7 meaningful unique data points per record. Thin data = thin pages.
**Real penalty case:** Location pages that only substitute city name into identical text
were targeted in Google's March 2024 Helpful Content update wave. Sites with thousands
of "We serve [City] residents" pages lost 60-80% of organic traffic overnight.

**2. Demand doesn't exist:**
If nobody searches for `[city] + [obscure service]`, a page for every combination
of 500 cities × 50 services = 25,000 pages no one visits. Validate demand first.
Use keyword research tools to confirm actual search volume before generation — not
assumed demand. If a keyword has <10 searches/month, a dedicated page is index bloat.

**3. The business can't support the pages:**
Location pages for cities where you don't serve create a trust deficit when users
visit and discover you don't actually operate there.
**Real penalty case:** SaaS companies creating "Best [Software] in [City]" pages for
cities where they had no customers, support, or local knowledge were deindexed en masse
in 2024-2025 for creating pages that misled users about geographic presence.

**4. You're in a YMYL niche:**
Health, finance, and legal content requires expert review. Programmatic generation
of medical or financial content without review is both dangerous and likely to be
penalized.
**Real penalty case:** Health sites auto-generating "Symptoms of [condition] in [city]"
or "Doctors for [condition] in [city]" pages received manual actions and site-wide
demotion in 2025 for YMYL thin content.

**5. Your domain authority is too low:**
New domains (DR < 20) get little benefit from large programmatic rollouts because
Google doesn't trust the site enough to index the pages. Build authority first.
Publishing 1,000 pages on a new domain typically results in <5% indexation rate.

**6. Competitors are not using programmatic SEO:**
If the entire niche relies on hand-crafted, in-depth content, a programmatic play
may stand out negatively. Fit the approach to the competitive landscape.

**7. You can't maintain the pages:**
Programmatic pages with stale data (outdated prices, closed businesses, dead integrations)
hurt user experience and trigger deindexation. If you can't update data, don't publish.
**Rule:** Only build programmatic pages if you have a system to update the data source
automatically. Manual updates at scale don't work.

## Internal Linking Automation

Internal links for programmatic pages must be auto-generated from data relationships:

- **Hub/spoke model**: Category hub pages (`/[city]/`) link to individual pages (`/[city]/[service]/`)
- **Related items**: Auto-link to 3-5 related pages based on shared data attributes
  (same city, same service, same category, same price range)
- **Breadcrumbs**: Generate BreadcrumbList schema from URL hierarchy
  (`Home > [City] > [Service]`)
- **Cross-linking**: Pages sharing attributes link to each other
  (all Austin service pages link to each other)
- **Anchor text**: Use descriptive, varied anchor text derived from data attributes.
  Do not repeat the same anchor text on every page in the set.
- **Link density**: 3-5 internal links per 1000 words

## Thin Content Safeguards

### Quality Gates

| Metric | Threshold | Action |
|--------|-----------|--------|
| Pages without content review | 100+ | WARNING: require content audit before publishing |
| Pages without explicit approval | 500+ | HARD STOP: require user approval + thin content audit |
| Unique content per page | < 40% | Flag as thin content — likely penalty risk |
| Unique content per page | < 30% | HARD STOP — do not publish |
| Word count per page | < 300 | Flag for review — insufficient value |
| Word count per page | < 150 | Do not publish — too thin |

### Scaled Content Abuse Policy (2024-2026 Enforcement)

Google's Scaled Content Abuse policy (March 2024) escalated enforcement in 2025:

- **June 2025**: Wave of manual actions targeting AI-generated content at scale
- **August 2025**: SpamBrain update enhanced detection of AI content farms and
  scaled link schemes
- **Result**: Google reported 45% reduction in low-quality, unoriginal content
  post-March 2024 enforcement

**Enhanced quality requirements:**
- Content differentiation: at minimum 30-40% genuinely unique content between any
  two pages in the programmatic set (not just name/location substitution)
- Human review: sample minimum 5-10% of generated pages before publishing
- Progressive rollout: publish in batches of 50-100 pages; monitor indexing and
  rankings for 2-4 weeks before expanding. Never publish 500+ pages simultaneously.
- Site reputation abuse: publishing programmatic content under a high-authority
  domain you don't own may trigger site reputation abuse penalties (enforced
  aggressively since November 2024)

### Uniqueness Calculation
```
Unique content % = (words unique to this page) / (total words on page) × 100
```
Measure against all other pages in the programmatic set.
- Shared headers, footers, and site navigation: EXCLUDED from calculation
- Template boilerplate text: INCLUDED (it contributes to thin content)
- Dynamically generated content from data: INCLUDED (as unique if the data differs)

### Safe Programmatic Content (OK at scale)
- Integration pages with real setup documentation, API details, screenshots
- Template/tool pages with downloadable content and usage instructions
- Glossary pages with 200+ word definitions, examples, and related terms
- Product pages with unique specs, reviews, comparison data per SKU
- Data-driven pages with unique statistics, charts, analysis per record
- User profile pages (user-generated content drives natural uniqueness)

### High Penalty Risk (avoid at scale)
- Location pages with only city/state name swapped into identical template text
- "Best [tool] for [industry]" pages without industry-specific value or data
- "[Competitor] alternative" pages without real comparison data
- AI-generated pages without human review and verifiable unique value-add
- Pages where >60% of content is shared template boilerplate

## Canonical Strategy

- Every programmatic page must have a self-referencing canonical tag
- Faceted navigation / filter variants: canonical to the base URL
- Paginated series: canonical to page 1, or use rel=next/prev for large pagination
- If a programmatic page overlaps with a manual editorial page, the manual page
  is canonical — noindex or redirect the programmatic version
- No canonical pointing to a different domain unless intentional cross-domain setup

## Sitemap Integration

- Auto-generate sitemap entries for all programmatic pages that pass quality gates
- Split at 50,000 URLs per sitemap file (protocol limit)
- Use sitemap index if multiple sitemap files needed
- `<lastmod>` reflects actual data update timestamp — not page generation timestamp
- Exclude all noindexed programmatic pages from sitemap
- Register sitemap in robots.txt
- Update sitemap dynamically as new records are added to data source

## Index Bloat Prevention

The biggest long-term risk of programmatic SEO is index bloat: thousands of pages
that get indexed but generate no traffic, diluting domain authority.

**Prevention strategies:**
- Noindex pages that don't meet quality gates — publish the URL structure but block indexing
- Noindex paginated results beyond page 2 (or use rel=next/prev)
- Noindex filtered views; canonical to base category
- Monitor crawl budget for sites with >10k programmatic pages via GSC
- Merge thin records with insufficient data into aggregated pages
- Monthly audit: compare intended indexed count vs actual indexed count in GSC
- Set up GSC alerts for sudden drops in indexed pages (signals deindexation)

## Output Format

### Programmatic SEO Score: XX/100

### Assessment Summary
| Category | Status | Score | Priority Issues |
|----------|--------|-------|----------------|
| Data Quality | OK/WARN/FAIL | XX/100 | [Top issue] |
| Template Uniqueness | OK/WARN/FAIL | XX/100 | [Top issue] |
| URL Structure | OK/WARN/FAIL | XX/100 | [Top issue] |
| Internal Linking | OK/WARN/FAIL | XX/100 | [Top issue] |
| Thin Content Risk | OK/WARN/FAIL | XX/100 | [Top issue] |
| Index Management | OK/WARN/FAIL | XX/100 | [Top issue] |

### Critical Issues (fix before publishing)
Each issue: specific description, affected pages/templates, specific fix.

### High Priority (fix within 1 week)

### Medium Priority (fix within 1 month)

### Low Priority (backlog)

### PROGRAMMATIC-SEO-PLAN.md Deliverable

When planning a new programmatic SEO strategy, produce this document:

1. **Data Assessment** — Source quality, viable records, data gaps to fill
2. **Template Design** — Component breakdown (static vs dynamic vs conditional)
3. **URL Pattern** — Chosen pattern with rationale and examples
4. **Quality Gates** — Specific thresholds for this site's data
5. **Uniqueness Strategy** — How content variation will be achieved at scale
6. **Rollout Plan** — Batch sizes, monitoring intervals, go/no-go criteria per batch
7. **Internal Linking Map** — Auto-generated link logic from data relationships
8. **Sitemap Strategy** — Auto-generation approach, split logic, update frequency
9. **Monitoring Dashboard** — GSC metrics to track post-launch (index rate, impressions/page, CTR)
10. **Exit Criteria** — Conditions that would trigger a rollback or noindex of the set
