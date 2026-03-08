---
name: seo-assets
description: >
  Schema.org structured data (JSON-LD) detection, validation, and generation;
  XML sitemap analysis and generation; and image SEO optimization. Covers rich
  results, rich snippets, knowledge panels, sitemap indexes, image/video sitemaps,
  CMS-specific guides, image alt text, formats (WebP/AVIF), responsive images,
  LCP image optimization, and CLS prevention. Trigger when user says: "schema",
  "structured data", "JSON-LD", "rich results", "rich snippets", "sitemap",
  "sitemap XML", "image optimization", "alt text", "image SEO", "WebP", "AVIF",
  "lazy loading", "LCP image", "hero image", "srcset", "responsive images",
  "image sitemap", "video sitemap", "schema validation", "GSC schema errors",
  "Google Images", "image compression", "fetchpriority", "CLS images",
  "Product schema", "Article schema", "LocalBusiness schema", "BreadcrumbList",
  "sitemap not found", "pages not indexed", "crawl coverage", or asks about
  rich result appearance, schema errors, sitemap generation, or image performance.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - WebFetch
---

# SEO Assets — Schema, Sitemaps & Images

Technical SEO assets: structured data markup, XML sitemaps, and image optimization.
All three are "implementable assets" that directly enable rich results, crawl
discovery, and performance improvements.

---

## Part 1: Schema Markup

### Detection
1. Scan for JSON-LD: `<script type="application/ld+json">`
2. Check Microdata: `itemscope`, `itemtype`, `itemprop`
3. Check RDFa: `typeof`, `property`, `vocab`
4. Note delivery method (server-rendered vs JS-injected — JS faces delayed processing)

### Validation

| Error | Severity | Fix |
|-------|----------|-----|
| Missing `@context` | Critical | Add `"@context": "https://schema.org"` |
| Missing/invalid `@type` | Critical | Use exact Schema.org type name |
| Relative URLs | High | Use absolute HTTPS URLs |
| Invalid ISO 8601 date | High | Use `YYYY-MM-DD` format |
| Deprecated type in use | Critical | Replace with active alternative |
| `aggregateRating` with zero reviews | High | Minimum 1 review required |

**Validation levels:** Valid > Recommended > Warning > Invalid

### Schema Type Status (March 2026)

**ACTIVE — Recommend freely:**
Organization, LocalBusiness, Person, ProfilePage, Article, BlogPosting,
NewsArticle, WebPage, WebSite, Product, ProductGroup, Offer, Service,
VideoObject, ImageObject, Review, AggregateRating, BreadcrumbList,
Event, JobPosting, Course, SoftwareApplication, DiscussionForumPosting

**RESTRICTED:** FAQ — ONLY for government/healthcare sites (Aug 2023)

**DEPRECATED — Never recommend:**
HowTo (Sept 2023), SpecialAnnouncement (July 2025), CourseInfo/EstimatedSalary/
LearningVideo/ClaimReview/VehicleListing (June 2025), Practice Problem/Dataset (late 2025)

See `../seo-core/references/schema-types.md` for full details.

### JSON-LD Templates

Provide ready-to-use templates for: Product, Article/BlogPosting, LocalBusiness,
Organization, BreadcrumbList, WebSite (Sitelinks Searchbox), SoftwareApplication.
See `references/schema-templates.md` for all templates.

### Schema and AI Overviews
- Organization + sameAs helps AI identify brand entity
- Article + dateModified increases citation likelihood
- Product + complete Offer enables product cards in AI responses
- Person schema on author pages builds E-E-A-T signals

### Output: SCHEMA-RECOMMENDATIONS.md
- Detection Results table
- Validation Results table
- Missing Opportunities with CTR impact
- GSC Fix Priority table
- generated-schema.json with placement instructions

---

## Part 2: Sitemaps

### Understanding Sitemaps
**DO:** Help Googlebot discover pages, signal importance, communicate freshness.
**DON'T:** Guarantee indexing, improve rankings directly, override robots.txt.

`<priority>` and `<changefreq>` are ignored by Google — omit them.

### Analyze Existing Sitemap

**Locate:** `/sitemap.xml` > `/sitemap_index.xml` > robots.txt `Sitemap:` directive

**Structural validation:**
- Valid XML, correct namespace, <50,000 URLs/file, <50MB uncompressed
- URL health: all return 200, no redirects, no noindexed pages, only canonical URLs

**Coverage analysis:** Compare sitemap vs crawled pages vs indexed pages.

**Pages to EXCLUDE:** Noindex pages, non-canonical pages, paginated pages (2+),
filtered/faceted URLs, login pages, thin content (<300 words), parameter URLs,
session ID URLs, admin/staging URLs.

### Generate New Sitemap

**By site scale:**
- Small (<1,000 URLs): single sitemap.xml
- Medium (1k-50k): single or split by type
- Large (50k-500k): sitemap index with multiple files
- Very large (>500k): sitemap index, split by section + date

**CMS-specific guides:**
- WordPress: Yoast/Rank Math at `/sitemap_index.xml`
- Webflow: built-in at `/sitemap.xml`
- Next.js: `/app/sitemap.js` (App Router)
- Shopify: built-in, includes product images
- Static sites: Hugo, Jekyll, Eleventy plugins

**Quality gates before adding:** HTTP 200, not noindexed, canonical version,
meaningful content, not blocked by robots.txt.

**lastmod:** Must reflect actual last modification date. Never set today's date
on all pages — Google detects and ignores.

### Sitemap Formats

**Standard:** `<urlset>` with `<url><loc>` and `<lastmod>` only.
**Sitemap Index:** `<sitemapindex>` referencing multiple sitemap files.
**Image Sitemap:** `xmlns:image` namespace, up to 1,000 images per URL entry.
**Video Sitemap:** `xmlns:video` namespace, thumbnail/title/description required.

Always declare sitemaps in robots.txt: `Sitemap: https://example.com/sitemap.xml`

### Output: SITEMAP-VALIDATION-REPORT.md
- Summary (URL, total URLs, 200 count, issues)
- Issues table with severity and fix
- Coverage gap analysis
- Prioritized recommendations

---

## Part 3: Image Optimization

### Why Image SEO Matters
- LCP most commonly caused by unoptimized hero image
- Missing alt text = invisible to Google Images (5-10% of search traffic)
- Oversized images = slow pages = lower rankings
- Proper dimensions prevent CLS (layout shift ranking signal)

### Analysis Checklist

**1. Alt Text Quality**
- Present on all non-decorative images; descriptive, contextual
- Natural keyword integration; 10-125 characters
- Decorative images: `alt=""` or `role="presentation"`

**2. File Size Thresholds**

| Category | Target | Warning | Critical |
|----------|--------|---------|----------|
| Thumbnails/icons | <30KB | >75KB | >150KB |
| Content images | <100KB | >200KB | >500KB |
| Hero/banner | <200KB | >350KB | >700KB |

**3. Format Selection (2026)**
- New deployments: AVIF first, WebP fallback, JPEG final — use `<picture>`
- Modernization: JPEG/PNG to WebP (25-35% reduction)
- Icons/logos: SVG always
- Animated: convert GIFs >100KB to `<video autoplay loop muted playsinline>`

**4. Responsive Images:** srcset with 2+ width descriptors; sizes matching breakpoints.

**5. LCP Image (Critical):**
```html
<img src="hero.webp" fetchpriority="high" alt="..." width="1200" height="630">
```
- NEVER `loading="lazy"` on LCP image
- NEVER `decoding="async"` on LCP image
- Must be in initial HTML (not JS-loaded)

**6. Lazy Loading:** `loading="lazy"` + `decoding="async"` on below-fold images only.
First 2-3 images: never lazy-load.

**7. CLS Prevention:** Set width/height on all `<img>` elements. Alternative: CSS `aspect-ratio`.

**8. File Names:** Descriptive, hyphenated, lowercase, 1-2 keywords, <60 chars.

**9. CDN:** Recommend for >50 images or global audience. Long cache TTLs (1 year).

**10. ImageObject Schema:** For editorial/product/author photos — improves Google
Images and AI visual search indexation.

### Images and AI Search Citability
- Write alt text for AI: name subject precisely, include context
- For charts: describe key finding, not just "chart"
- Add text summaries below infographics for AI systems
- Keep images in initial HTML — AI crawlers may not execute JS

### Output: IMAGE-OPTIMIZATION.md
- Audit summary table (total images, missing alt, oversized, wrong format, etc.)
- Prioritized optimization list sorted by impact
- Recommendations (Critical > High > Medium > Low)
- Ready-to-use corrected HTML snippets
