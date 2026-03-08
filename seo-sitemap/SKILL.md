---
name: seo-sitemap
description: >
  XML sitemap analysis, validation, and generation. Triggers: "sitemap",
  "sitemap.xml", "generar sitemap", "sitemap errors", "image sitemap",
  "video sitemap", "sitemap index", "sitemap coverage", "crawl budget",
  "pages not in sitemap", "Google no indexa mis páginas", "crawl coverage",
  "sitemap para Next.js/WordPress/Shopify", "enviar sitemap a Google",
  "changefreq", "lastmod", "robots.txt sitemap", "indexation gaps".
---

# Sitemap Analysis & Generation

Validate, diagnose, and generate XML sitemaps. A well-configured sitemap is the
most direct signal you can send Google about which pages you want crawled and
how fresh they are. A poorly configured sitemap actively misleads Googlebot and
wastes crawl budget.

## Understanding What Sitemaps Do (and Don't Do)

**What sitemaps DO:**
- Help Googlebot discover pages it might not find via links
- Signal which pages you consider important
- Communicate freshness via `<lastmod>` dates
- Enable specialized indexing via image and video sitemaps

**What sitemaps DON'T DO:**
- Guarantee indexing (Google decides what to index)
- Improve rankings directly
- Override robots.txt disallow rules
- Make non-canonical pages canonical

**Common misconception:** `<priority>` and `<changefreq>` are ignored by Google.
Do not waste time setting these attributes — Google has confirmed they use their
own signals to determine crawl frequency and page priority. Omit them entirely
to reduce file size and eliminate maintenance overhead.

## Mode 1: Analyze Existing Sitemap

### Step 1: Obtain the Sitemap

Check these locations in order:
1. `https://[domain].com/sitemap.xml` — most common location
2. `https://[domain].com/sitemap_index.xml` — common alternative
3. `robots.txt` → look for `Sitemap: [URL]` directive
4. Google Search Console → Sitemaps report → check submitted sitemaps

### Step 2: Structural Validation

#### Format Checks
- Valid XML: well-formed, no malformed tags, correct encoding (UTF-8)
- Correct namespace: `xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`
- URL count: < 50,000 per sitemap file (protocol hard limit)
- File size: < 50MB uncompressed per sitemap file (protocol hard limit)
- If > 50,000 URLs: sitemap index file should exist

#### URL Health Checks
| Check | Method | Expected |
|-------|--------|----------|
| HTTP status | Fetch each URL | All return HTTP 200 |
| Redirects | Follow headers | No redirects — use final URL |
| Noindex pages | Check meta robots | No noindexed pages in sitemap |
| Non-canonical URLs | Check canonical tags | Only canonical URLs in sitemap |
| HTTPS consistency | Check protocol | All HTTPS, none HTTP |
| WWW consistency | Check subdomain | Consistent with canonical form |

#### Content Quality Checks
| Issue | Detection | Severity |
|-------|-----------|----------|
| Non-200 URLs | Fetch URLs | Critical — remove dead links |
| Noindexed URLs | Check meta robots on each | High — remove |
| Redirected URLs | Check HTTP status | Medium — update to final URL |
| Non-canonical URLs | Check rel=canonical | High — use canonical URL only |
| HTTP URLs (not HTTPS) | Check protocol | Medium — update to HTTPS |
| Identical `<lastmod>` dates | Compare dates in set | Low — use real update dates |
| `<priority>` values present | Check for element | Info — can remove (ignored) |
| `<changefreq>` values present | Check for element | Info — can remove (ignored) |
| Missing important pages | Compare to crawl | High — add missing pages |
| Orphan pages in sitemap | Check for inlinks | Medium — add internal links |

### Step 3: Coverage Analysis

Compare sitemap URLs against what should be indexed:

1. **Expected page count** vs **sitemap URL count**: are major sections missing?
2. **GSC Coverage report**: are pages in sitemap marked "Crawled — not indexed"?
   This signals Google is finding the pages but choosing not to index them.
3. **Crawl vs Sitemap**: do crawl tools find pages NOT in sitemap? These may be
   orphan pages or pages that accidentally lack links.
4. **Sitemap vs GSC index**: are indexed pages missing from the sitemap?

### Pages That Should Be EXCLUDED from the Sitemap

Exclude these URL types — including them wastes crawl budget and sends conflicting signals:

| URL Type | Why Exclude |
|----------|------------|
| Noindex pages | Contradiction: sitemap says "crawl" but meta says "don't index" |
| Non-canonical pages | Only canonical URLs in sitemap |
| Paginated pages (page 2, 3...) | Usually thin; page 1 handles indexation |
| Filtered/faceted navigation URLs | Duplicate content; canonical to base URL |
| Login/account pages | Not crawlable by Googlebot |
| Thin content (< 300 words) | Inclusion wastes crawl budget, signals low quality |
| Parameter-based URLs (`?sort=price`) | Canonical to clean URL |
| Session IDs in URLs | Creates thousands of fake duplicates |
| Admin, API, or staging URLs | Internal only |
| 404/410 pages | Obviously |

### Common Issues Diagnostic Table

| Issue | Severity | Symptom | Fix |
|-------|----------|---------|-----|
| > 50k URLs in single file | Critical | Sitemap errors in GSC | Split with sitemap index |
| Non-200 URLs | High | GSC: "Submitted URL returns error" | Remove or fix broken URLs |
| Noindexed URLs in sitemap | High | GSC: contradictory signals | Remove noindexed pages |
| Non-canonical URLs | High | Diluted signals | Replace with canonical URLs |
| Redirected URLs | Medium | Wasted crawl budget | Update to final destination URLs |
| All identical lastmod dates | Low | Misleads Googlebot on freshness | Use actual modification dates |
| Sitemap not in robots.txt | Medium | Slower discovery | Add `Sitemap:` directive |
| Not submitted to GSC | Medium | Delayed discovery | Submit in GSC → Sitemaps |
| Priority/changefreq present | Info | Harmless but useless | Can remove to simplify |
| HTTP URLs | Medium | Inconsistent canonicalization | Update to HTTPS |

## Mode 2: Generate New Sitemap

### Step 1: Determine Site Scale and Type

| Site Scale | URL Count | Approach |
|------------|-----------|----------|
| Small site | < 1,000 URLs | Single sitemap.xml |
| Medium site | 1,000-50,000 URLs | Single sitemap.xml or split by type |
| Large site | 50,000-500,000 URLs | Sitemap index with multiple files |
| Very large site | > 500,000 URLs | Sitemap index, split by section + date |

| Site Type | Special Sitemaps Needed |
|-----------|------------------------|
| E-commerce (many product images) | Image sitemap |
| Publisher / news site | News sitemap (if Google News approved) |
| Video platform / YouTube alternative | Video sitemap |
| Multi-language site | Hreflang sitemap (see seo-hreflang skill) |
| Programmatic SEO site | Auto-generated sitemap from data source |

### Step 2: CMS-Specific Generation Guides

#### WordPress
- **Plugin**: Yoast SEO or Rank Math — both auto-generate at `/sitemap_index.xml`
- **Check**: Settings → Reading → "XML Sitemaps" must be enabled
- **Custom post types**: Ensure custom CPTs are included in sitemap settings
- **Exclude**: Draft, private, noindexed, and password-protected pages
- **Regenerate**: After major content changes, manually ping GSC

#### Webflow
- **Built-in**: Webflow generates sitemap automatically at `/sitemap.xml`
- **Pages excluded by default**: Password-protected, 404, utility pages
- **Custom exclusions**: CMS Collections → individual items → toggle "Exclude from sitemap"
- **Limitation**: No image sitemap support natively; use custom code or third-party

#### Next.js (App Router)
Create `/app/sitemap.js` (or `.ts`):
```js
export default function sitemap() {
  return [
    {
      url: 'https://example.com',
      lastModified: new Date(),
    },
    {
      url: 'https://example.com/blog',
      lastModified: new Date('2026-02-01'),
    },
  ]
}
```
Next.js serves this at `/sitemap.xml` automatically. For dynamic pages, fetch from
database inside the function and map to URL objects.

#### React / SPA (Single Page Application)
SPAs with client-side routing need server-side sitemap generation:
- **Option 1**: Static file at `/public/sitemap.xml` — works for sites with fixed URLs
- **Option 2**: Express route generating sitemap dynamically from database
- **Option 3**: Build-time generation (Gatsby: `gatsby-plugin-sitemap`, Vite: custom script)
- **Critical note**: Ensure sitemap is served from the domain root, not behind `/app/`

#### Shopify
- **Built-in**: Shopify generates sitemap at `/sitemap.xml` automatically
- **Includes**: Products, collections, pages, blogs, articles
- **Limitation**: Cannot exclude specific products from sitemap; use noindex meta tag instead
- **Image sitemap**: Shopify's sitemap includes product image URLs by default

#### Static Sites (Hugo, Jekyll, Eleventy)
- **Hugo**: `hugo.toml` → `enableRobotsTXT = true` and install `sitemap.xml` template
- **Jekyll**: `jekyll-sitemap` gem — add to `_config.yml`
- **Eleventy**: `@quasibit/eleventy-plugin-sitemap` or custom Nunjucks template
- Generated at build time — update on every new publish

### Step 3: Load Industry Template

Select from `assets/` directory:
- `saas.md` — Feature pages, pricing, integrations, blog, comparisons
- `local-service.md` — Service area pages, location pages, service pages
- `ecommerce.md` — Category pages, product pages, brand pages, blog
- `publisher.md` — Topic hub pages, tag pages, author pages, articles
- `agency.md` — Service pages, case studies, blog, team pages
- `generic.md` — Standard business site structure

### Step 4: Apply Quality Gates

Before adding any page to the sitemap, verify:
- Page returns HTTP 200
- Page is NOT noindexed
- Page is the canonical version (self-referencing canonical)
- Page has meaningful content (not empty, under construction, or login-gated)
- Page is NOT blocked by robots.txt

**Programmatic page quality gates (additional):**
- Warning at 30+ location/programmatic pages — require 60%+ unique content check
- Hard stop at 50+ location pages without explicit content quality review
- Never include programmatic pages with < 30% unique content in sitemap

### Step 5: Determine URL Priority (Sitemap Structure)

Organize URLs in a logical order — this helps communicate site structure:
1. Homepage
2. Core service/product pages
3. Category pages
4. Individual product/service/post pages
5. Support/informational pages
6. Blog/content pages

### Step 6: Set lastmod Correctly

`<lastmod>` must reflect the actual last modification date of the page content:
- For manually updated pages: use the date the content was last meaningfully changed
- For programmatic pages: use the data source's last update timestamp
- Do NOT use today's date on all pages — Google detects this and ignores lastmod entirely
- Do NOT use the page's creation date as a static lastmod — update it when content changes
- Acceptable formats: `YYYY-MM-DD` or `YYYY-MM-DDTHH:MM:SS+TZ`

## Sitemap Formats

### Standard Sitemap
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2026-03-01</lastmod>
  </url>
  <url>
    <loc>https://example.com/services/web-design/</loc>
    <lastmod>2026-02-15</lastmod>
  </url>
  <url>
    <loc>https://example.com/blog/seo-guide/</loc>
    <lastmod>2026-01-20</lastmod>
  </url>
</urlset>
```

Note: No `<priority>` or `<changefreq>` — these are ignored by Google and
add unnecessary file size.

### Sitemap Index (for sites with > 50k URLs or multiple sitemap files)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://example.com/sitemap-pages.xml</loc>
    <lastmod>2026-03-01</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://example.com/sitemap-posts.xml</loc>
    <lastmod>2026-03-01</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://example.com/sitemap-products.xml</loc>
    <lastmod>2026-02-28</lastmod>
  </sitemap>
</sitemapindex>
```

Reference the sitemap index in robots.txt:
```
Sitemap: https://example.com/sitemap-index.xml
```

### Image Sitemap

Create an image sitemap when you have important images that should appear in
Google Images search — product photos, editorial images, infographics.

**When to create an image sitemap:**
- E-commerce site with unique product photos
- Photography or creative portfolio site
- Publisher with original photography or infographics
- Any site where Google Images drives meaningful referral traffic or could

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://example.com/product/blue-widget/</loc>
    <image:image>
      <image:loc>https://example.com/images/blue-widget-front.webp</image:loc>
      <image:title>Blue Widget - Front View</image:title>
      <image:caption>High-resolution front view of the Blue Widget, available in 3 sizes</image:caption>
    </image:image>
    <image:image>
      <image:loc>https://example.com/images/blue-widget-side.webp</image:loc>
      <image:title>Blue Widget - Side Profile</image:title>
    </image:image>
  </url>
</urlset>
```

Image sitemap rules:
- Up to 1,000 images per `<url>` entry
- `<image:loc>` must be the absolute image URL
- `<image:title>` and `<image:caption>` are optional but recommended
- Images must be publicly accessible (not behind authentication)
- Include images even if they are on different domains/CDNs

### Video Sitemap

Create a video sitemap when your site has original video content you want
indexed in Google Video search.

**When to create a video sitemap:**
- Site hosts original video content (tutorials, product demos, webinars)
- Videos are a significant traffic source (or potential source)
- Videos are not on YouTube (YouTube handles its own indexing)
- You want to appear in Google's video rich results

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  <url>
    <loc>https://example.com/tutorial/getting-started/</loc>
    <video:video>
      <video:thumbnail_loc>https://example.com/thumbnails/getting-started.jpg</video:thumbnail_loc>
      <video:title>Getting Started with Example Product</video:title>
      <video:description>Learn how to set up Example Product in under 5 minutes.</video:description>
      <video:content_loc>https://example.com/videos/getting-started.mp4</video:content_loc>
      <video:duration>287</video:duration>
      <video:publication_date>2026-01-15</video:publication_date>
    </video:video>
  </url>
</urlset>
```

Video sitemap rules:
- `<video:thumbnail_loc>`: required, must be crawlable
- `<video:title>`: required
- `<video:description>`: required
- `<video:content_loc>` OR `<video:player_loc>`: at least one required
- `<video:duration>`: in seconds, strongly recommended
- Up to 1,000 `<video:video>` entries per sitemap file

## robots.txt Integration

Every sitemap must be declared in robots.txt:
```
User-agent: *
Disallow: /admin/
Disallow: /private/

Sitemap: https://example.com/sitemap.xml
```

For multiple sitemaps, add multiple lines:
```
Sitemap: https://example.com/sitemap-index.xml
Sitemap: https://example.com/image-sitemap.xml
```

## Google Search Console Submission

After creating or updating a sitemap:
1. Go to Google Search Console → Sitemaps
2. Enter the sitemap URL and click "Submit"
3. Monitor the Sitemaps report for errors within 24-48 hours
4. Check "Coverage" report to see indexation status of submitted URLs
5. Re-submit whenever the sitemap is significantly updated (major new page additions)

Dynamic sitemaps that update automatically do not need manual re-submission —
GSC will re-fetch them on its own schedule. But re-submission speeds up discovery.

**Interpreting GSC Sitemap Report:**
| GSC Status | Meaning | Action |
|------------|---------|--------|
| Success | Sitemap parsed without errors | Monitor coverage rate |
| Has errors | Structural or URL errors | Fix and resubmit |
| Couldn't fetch | Sitemap URL returning non-200 | Fix URL accessibility |
| Index coverage: Submitted but not indexed | Google found but chose not to index | Improve content quality |
| Index coverage: Indexed | Pages successfully indexed from sitemap | No action needed |

## Output Format

### For Analysis: SITEMAP-VALIDATION-REPORT.md

#### Summary
- Sitemap URL: [URL]
- Total URLs in sitemap: XX
- URLs returning 200: XX / XX
- Issues found: XX (Critical: X, High: X, Medium: X, Low: X)
- GSC submission status: Submitted / Not submitted

#### Issues Table
| Issue | Severity | Count | Affected URLs (sample) | Fix |
|-------|----------|-------|----------------------|-----|
| Non-200 URLs | Critical | X | /dead-page/ | Remove or fix |
| Noindexed pages | High | X | /tag/example/ | Remove from sitemap |

#### Pages That Should Be Excluded
List of pages found in sitemap that should be removed, with reason.

#### Coverage Gap Analysis
- Pages found via crawl but NOT in sitemap: XX
- Pages in sitemap but returning errors: XX
- Recommended pages to add: [list]
- Recommended pages to remove: [list]

#### Recommendations (prioritized)
1. [Critical fix]
2. [High priority fix]
3. [Medium priority improvement]

### For Generation

Deliver:
- `sitemap.xml` — primary sitemap (or sitemap index file)
- Split files if > 50,000 URLs: `sitemap-pages.xml`, `sitemap-posts.xml`, etc.
- `image-sitemap.xml` — if image sitemap requested or recommended
- `video-sitemap.xml` — if video sitemap requested or recommended
- robots.txt Sitemap directive to add
- GSC submission instructions
- URL count summary and split logic explanation
- CMS-specific implementation notes if a specific platform was identified
