---
name: seo-assets
description: >
  Schema.org (JSON-LD), sitemaps XML e imágenes SEO. Rich results, rich snippets,
  knowledge panels, WebP/AVIF, alt text, LCP de imagen, CLS, srcset.
  Usar cuando: "schema", "datos estructurados", "JSON-LD", "rich results", "sitemap XML",
  "optimizar imágenes", "alt text", "WebP", "AVIF", "LCP imagen", "image SEO",
  "srcset", "lazy loading", "errores schema GSC".
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

---

## Part 1: Schema Markup

### Detection
1. JSON-LD: `<script type="application/ld+json">`
2. Microdata: `itemscope`, `itemtype`, `itemprop`
3. RDFa: `typeof`, `property`, `vocab`
4. Note delivery method (server-rendered vs JS-injected — JS faces delayed processing)

### Validation

| Error | Severity | Fix |
|-------|----------|-----|
| Missing `@context` | Critical | Add `"@context": "https://schema.org"` |
| Missing/invalid `@type` | Critical | Use exact Schema.org type name |
| Relative URLs | High | Use absolute HTTPS URLs |
| Invalid ISO 8601 date | High | Use `YYYY-MM-DD` |
| Deprecated type | Critical | Replace with active alternative |
| `aggregateRating` zero reviews | High | Minimum 1 review required |

### Schema Type Status (March 2026)

**ACTIVE:** Organization, LocalBusiness, Person, ProfilePage, Article, BlogPosting, NewsArticle, WebPage, WebSite, Product, ProductGroup, Offer, Service, VideoObject, ImageObject, Review, AggregateRating, BreadcrumbList, Event, JobPosting, Course, SoftwareApplication, DiscussionForumPosting

**RESTRICTED:** FAQ — ONLY government/healthcare (Aug 2023)

**DEPRECATED — Never recommend:** HowTo (Sept 2023), SpecialAnnouncement (July 2025), CourseInfo/EstimatedSalary/LearningVideo/ClaimReview/VehicleListing (June 2025), Practice Problem/Dataset (late 2025)

See `../seo-core/references/schema-types.md` for full details.

### JSON-LD Templates
See `references/schema-templates.md` for ready-to-use templates: Product, Article/BlogPosting, LocalBusiness, Organization, BreadcrumbList, WebSite, SoftwareApplication.

### Schema and AI Overviews
- Organization + sameAs: AI brand entity identification
- Article + dateModified: increases citation likelihood
- Product + complete Offer: enables product cards in AI responses
- Person schema on author pages: builds E-E-A-T signals

### Output: SCHEMA-RECOMMENDATIONS.md
Detection results, validation results, missing opportunities with CTR impact, GSC fix priority, generated-schema.json with placement instructions.

---

## Part 2: Sitemaps

`<priority>` and `<changefreq>` ignored by Google — omit them.

### Analyze Existing Sitemap
**Locate:** `/sitemap.xml` > `/sitemap_index.xml` > robots.txt `Sitemap:` directive

**Validate:** Valid XML, correct namespace, <50,000 URLs/file, <50MB uncompressed. All URLs return 200, no redirects, no noindex, only canonical URLs.

**Coverage:** Compare sitemap vs crawled vs indexed pages.

**Exclude:** Noindex, non-canonical, paginated (2+), filtered/faceted, login, thin (<300 words), parameter URLs, session IDs, admin/staging.

### Generate New Sitemap

| Scale | Approach |
|-------|----------|
| <1,000 URLs | Single sitemap.xml |
| 1k-50k | Single or split by type |
| 50k-500k | Sitemap index, multiple files |
| >500k | Sitemap index, split by section + date |

**CMS:** WordPress (Yoast/Rank Math), Webflow (built-in), Next.js (`/app/sitemap.js`), Shopify (built-in), static sites (Hugo/Jekyll/Eleventy plugins).

**lastmod:** Must reflect actual modification date. Never set today's date on all pages.

### Sitemap Formats
- **Standard:** `<urlset>` with `<url><loc>` and `<lastmod>` only
- **Index:** `<sitemapindex>` referencing multiple files
- **Image:** `xmlns:image` namespace, up to 1,000 images per URL
- **Video:** `xmlns:video` namespace, thumbnail/title/description required

Always declare in robots.txt: `Sitemap: https://example.com/sitemap.xml`

### Output: SITEMAP-VALIDATION-REPORT.md
Summary, issues table with severity, coverage gap analysis, prioritized recommendations.

---

## Part 3: Image Optimization

See `references/image-optimization.md` for file size thresholds, format selection, LCP image rules, responsive images, lazy loading, CLS prevention, and AI citability.

### Analysis Checklist
1. **Alt text:** Present on all non-decorative images; descriptive, contextual; 10-125 chars; decorative = `alt=""`
2. **File size:** Check against thresholds in reference file
3. **Format:** AVIF > WebP > JPEG; SVG for icons; video for large GIFs
4. **Responsive:** srcset with 2+ widths; sizes matching breakpoints
5. **LCP image:** `fetchpriority="high"`, no lazy-load, no decoding="async", in initial HTML
6. **Lazy loading:** `loading="lazy"` only on below-fold images
7. **CLS:** width/height on all `<img>` or CSS `aspect-ratio`
8. **File names:** Descriptive, hyphenated, lowercase, <60 chars
9. **CDN:** Recommend for >50 images or global audience
10. **ImageObject schema:** For editorial/product/author photos

### Output: IMAGE-OPTIMIZATION.md
Audit summary table, prioritized optimization list, recommendations by severity, corrected HTML snippets.
