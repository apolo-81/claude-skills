---
name: seo-images
description: >
  Image optimization for SEO, performance, and AI search. Triggers:
  "image optimization", "optimización de imágenes", "alt text", "image SEO",
  "WebP", "AVIF", "lazy loading", "image compression", "LCP image",
  "responsive images", "srcset", "image CDN", "Core Web Vitals images",
  "CLS images", "fetchpriority", "image sitemap", "Google Images ranking",
  "imágenes lentas", "imagen hero", "next-gen formats", "visual search SEO".
---

# Image Optimization Analysis

Analyze and optimize images for SEO, performance, Core Web Vitals, and AI search
citability. Images are often the single largest performance bottleneck and a
frequently overlooked SEO opportunity. Every image check has a direct ranking impact.

## Why Image SEO Matters

- LCP (Largest Contentful Paint) is most commonly caused by an unoptimized hero image
- Missing alt text = invisible to Google Images (5-10% of all search traffic)
- Oversized images = slow pages = lower rankings (Core Web Vitals signals)
- AI image search and AI Overviews use alt text to understand and cite images
- Proper dimensions prevent CLS (layout shift), which is a direct ranking signal
- Google Images is a massive, underutilized SEO channel — treat it as a priority

## Analysis Checklist

### 1. Alt Text Quality

Check every `<img>` element (except decorative images with `role="presentation"` or `alt=""`).

**Requirements:**
- Present on all non-decorative images
- Descriptive: describes actual image content, not the filename
- Contextually relevant: connects to the surrounding page content and keyword theme
- Natural keyword integration: includes relevant keywords where they fit naturally
- Length: 10-125 characters (flag too-short AND keyword-stuffed)

**Good alt text examples:**
- "Professional plumber repairing kitchen sink faucet" (descriptive, keyword-natural)
- "Red 2024 Toyota Camry sedan front view" (specific, useful)
- "Bar chart showing 40% year-over-year revenue growth" (describes data images)
- "Team of five engineers reviewing code on dual monitors" (specific scene)
- "Box of 12 organic oat protein bars, chocolate flavor, 200 calories each" (product-specific)

**Bad alt text examples:**
- `alt="image.jpg"` — filename, not description
- `alt="photo"` — generic, useless
- `alt="plumber plumbing plumber services plumber"` — keyword stuffing
- `alt=""` on a non-decorative image — treated as missing by Google
- `alt="Click here"` — action, not description

**Decorative images (alt="" is correct):**
- Background textures, decorative dividers, purely stylistic icons
- These should use `role="presentation"` OR `alt=""` — both tell assistive tech to skip

### 2. File Size

Apply tiered thresholds based on image role:

| Image Category | Target | Warning | Critical |
|----------------|--------|---------|----------|
| Thumbnails / icons | < 30KB | > 75KB | > 150KB |
| Content images (body) | < 100KB | > 200KB | > 500KB |
| Hero / banner images | < 200KB | > 350KB | > 700KB |
| Background images | < 150KB | > 300KB | > 600KB |

Recommend compression tools: Squoosh (free, browser-based), ImageOptim (Mac),
sharp (Node.js), or imagemin for build pipelines.

### 3. Format Selection in 2026

Choose the right format based on content type and deployment constraints:

| Format | Browser Support | Best For | Avoid When |
|--------|-----------------|----------|------------|
| AVIF | 93%+ | Best compression, photos, illustrations | Need IE/very old Safari support |
| WebP | 97%+ | Photos, screenshots — safe default | Rarely — almost universal now |
| JPEG | 100% | Fallback for photos | New deployments without legacy constraints |
| PNG | 100% | Logos, UI screenshots needing transparency | Photos (much larger file size than AVIF/WebP) |
| SVG | 100% | Icons, logos, illustrations, diagrams | Photos or complex raster images |
| GIF | 100% | Simple animations (small, <30 frames) | Animations >30 frames — use `<video>` instead |

**Format decision framework for 2026:**

1. **New deployments (no legacy browser constraint):** AVIF first, WebP as fallback,
   JPEG as final fallback — use `<picture>` element to serve all three.

2. **Existing site modernization:** Converting JPEG/PNG to WebP is the highest-ROI
   single format change. Typically reduces file size 25-35% with no visible quality loss.
   Add AVIF afterward for an additional 20-30% reduction.

3. **Icons and logos:** SVG always — infinitely scalable, often under 5KB, no format
   conversion ever needed.

4. **Animated content:** Convert GIFs over 100KB to `<video autoplay loop muted playsinline>`.
   Video codecs (H.264, H.265, AV1) achieve 90%+ smaller file sizes for animations.

5. **JPEG XL:** Available in Chromium (Rust decoder) as of late 2025 but not yet
   in Chrome stable or Firefox stable. Do not deploy for production yet — monitor 2026.

**Recommended `<picture>` element pattern:**
```html
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img
    src="image.jpg"
    alt="Descriptive alt text here"
    width="800"
    height="600"
    loading="lazy"
    decoding="async"
  >
</picture>
```

Browser loads the first supported format. AVIF first (best compression), WebP second,
JPEG as universal fallback. Current support: AVIF 93.8%, WebP 97.3%.

### 4. Responsive Images (srcset + sizes)

Every content image must serve size-appropriate versions to avoid sending
1200px images to mobile users.

```html
<img
  src="image-800.jpg"
  srcset="
    image-400.jpg  400w,
    image-800.jpg  800w,
    image-1200.jpg 1200w,
    image-2400.jpg 2400w
  "
  sizes="
    (max-width: 480px) 400px,
    (max-width: 1024px) 800px,
    1200px
  "
  alt="Description"
  width="800"
  height="600"
>
```

**SEO and performance impact of srcset:**
- Mobile users on 3G or slower connections don't download the full-size desktop image
- Google's mobile-first indexing crawls with a mobile user agent — serving correctly
  sized images to mobile Googlebot improves perceived performance scores
- Reduces total page weight by 40-70% on mobile, which directly improves Core Web Vitals
  for mobile users (the primary ranking signal)

**Validation checks:**
- `srcset` present with at least 2 width descriptors
- `sizes` attribute matches actual CSS layout breakpoints
- Smallest srcset variant serves mobile screen sizes (320-480px range)
- Largest srcset variant covers 2x DPR desktop (2400px for 1200px layouts)

### 5. LCP Image — Critical Performance Checks

The LCP element is most often the hero image. LCP is a Core Web Vitals ranking signal.
An unoptimized LCP image is the single highest-impact fix for most pages.

**Required attributes for LCP image:**
```html
<!-- CORRECT: LCP hero image -->
<img
  src="hero.webp"
  fetchpriority="high"
  alt="Hero image description"
  width="1200"
  height="630"
>
<!-- No loading="lazy" — eager load is default and required for LCP images -->
<!-- No decoding="async" on LCP — synchronous decoding is faster for above-fold -->
```

**Why `fetchpriority="high"` matters:**
Without this attribute, the browser's preload scanner discovers the hero image
after parsing CSS and JS in the `<head>`, delaying its download start by hundreds
of milliseconds. `fetchpriority="high"` signals the browser to treat this resource
as critical, moving it ahead of other resources in the download queue.

**Common LCP image mistakes:**
- `loading="lazy"` on the hero image — NEVER do this; it directly harms LCP by
  delaying image download until the element enters the viewport
- Missing `fetchpriority="high"` — browser delays discovery in favor of CSS/JS
- LCP image not in initial HTML (loaded via JS) — delays crawl and rendering
- No `width`/`height` — causes layout shift as image loads
- LCP image behind CSS `background-image` — not preloaded by browser scanner;
  use `<link rel="preload" as="image">` in `<head>` as a workaround

**Detecting the LCP image:**
- Open Chrome DevTools → Performance tab → record page load → find LCP element
- Or use PageSpeed Insights — it identifies the specific LCP element
- Alternatively: Core Web Vitals extension in Chrome shows LCP element on hover

**Target LCP thresholds:**
- Good: < 2.5 seconds
- Needs Improvement: 2.5-4.0 seconds
- Poor: > 4.0 seconds

### 6. Lazy Loading (Below-Fold Images)

```html
<!-- Below fold — correct lazy loading -->
<img
  src="photo.webp"
  loading="lazy"
  decoding="async"
  alt="Description"
  width="600"
  height="400"
>

<!-- Above fold / LCP — never lazy load -->
<img
  src="hero.webp"
  fetchpriority="high"
  alt="Hero image"
  width="1200"
  height="630"
>
```

- Apply `loading="lazy"` to all images below the fold (approximately below 800px from top)
- Add `decoding="async"` to non-LCP images to prevent decoding from blocking main thread
- Never apply `loading="lazy"` to the first visible image in the viewport
- Native lazy loading is well-supported (97%+ browsers) — remove JS-based lazy loading libraries
- Rule of thumb: the first 2-3 images on the page should never be lazy-loaded

### 7. CLS Prevention (Cumulative Layout Shift)

CLS is a Core Web Vitals ranking signal. Images without dimensions cause layout shift
as they load because the browser doesn't reserve space.

```html
<!-- GOOD: explicit dimensions prevent layout shift -->
<img src="photo.webp" width="800" height="600" alt="Description">

<!-- GOOD: CSS aspect-ratio as alternative -->
<style>
  .responsive-img {
    aspect-ratio: 4 / 3;
    width: 100%;
  }
</style>
<img class="responsive-img" src="photo.webp" alt="Description">

<!-- BAD: no dimensions — causes layout shift -->
<img src="photo.webp" alt="Description">
```

- Set `width` and `height` attributes on all `<img>` elements
- Attributes can differ from displayed CSS size — the browser uses them for aspect ratio only
- For responsive images, set attributes matching the natural image dimensions
- Target CLS: < 0.1 (Good) | 0.1-0.25 (Needs Improvement) | > 0.25 (Poor)

### 8. File Names

- Descriptive: `red-running-shoes-2024.webp` not `IMG_4892.jpg`
- Hyphenated, lowercase, no spaces or special characters
- Include 1-2 relevant keywords naturally
- Keep under 60 characters
- File name is a minor signal for Google Images rankings — it helps Googlebot
  understand content before even reading the alt text

### 9. CDN Usage

- Check if images are served from a CDN (different subdomain, CDN response headers)
- Recommend CDN for any site with more than 50 images or global audience
- Key CDN benefits: edge caching (lower TTFB), automatic format negotiation, image
  resizing APIs (Cloudinary, Imgix, Cloudflare Images)
- Check for `Cache-Control: max-age` headers — images should have long cache TTLs (1 year)
- Modern image CDNs (Cloudinary, Imgix) auto-convert to AVIF/WebP based on Accept header —
  a single integration eliminates format conversion work entirely

### 10. Image Schema Markup (ImageObject)

For editorial images, product images, and author photos, add ImageObject schema
to improve indexation in Google Images and AI-powered visual search:

```json
{
  "@context": "https://schema.org",
  "@type": "ImageObject",
  "url": "https://example.com/image.webp",
  "width": 1200,
  "height": 630,
  "caption": "Brief, descriptive caption",
  "author": {
    "@type": "Person",
    "name": "[Photographer Name]"
  },
  "license": "https://creativecommons.org/licenses/by/4.0/"
}
```

## Images and AI Search Citability

AI Overviews, ChatGPT, Perplexity, and Google Lens use image alt text to understand,
categorize, and attribute images in AI-generated responses. Optimizing for AI image
citability is an emerging but high-value SEO strategy:

**Write alt text for AI, not just humans:**
- Name the subject precisely (brand, model, color, size where applicable)
- Include the context (who is doing what, in what setting)
- For charts and data visualizations: describe the key finding, not just "chart"
  — e.g., "Line graph showing 40% month-over-month growth in organic traffic, 2025"
- For product images: include brand, model, color, and defining attributes
  — e.g., "Nike Air Max 270 in black/white, men's size 10, side profile"

**Why detailed alt text matters for AI search in 2026:**
Google's AI Overviews and Google Lens increasingly surface images from crawled content.
When AI systems generate product comparisons, how-to guides, or informational summaries,
they attribute images by their alt text and surrounding content. Pages with precise,
descriptive alt text are more citable than pages with generic or missing alt text.

**Additional AI citability signals:**
- Add `ImageObject` schema for images you want cited in AI-generated content
- Use descriptive captions — AI systems weight captions alongside alt text
- For infographics: add a text summary below the image for AI systems that process
  text but not embedded image text
- Keep important images in the initial HTML (not loaded via JavaScript) — AI crawlers
  may not execute JavaScript

## Output Format

### IMAGE-OPTIMIZATION.md — Primary Deliverable

#### Image Audit Summary

| Metric | Status | Count | Impact |
|--------|--------|-------|--------|
| Total Images | - | XX | - |
| Missing Alt Text | FAIL | XX | High — Google Images invisible |
| Keyword-Stuffed Alt | WARN | XX | Medium — potential spam signal |
| LCP Image Missing fetchpriority | FAIL | XX | Critical — direct LCP impact |
| LCP Image Using lazy | FAIL | XX | Critical — direct LCP impact |
| Oversized Hero (>350KB) | WARN | XX | High — LCP/performance |
| Oversized Content (>200KB) | WARN | XX | Medium — performance |
| Wrong Format (not WebP/AVIF) | WARN | XX | Medium — bandwidth |
| No Dimensions (CLS risk) | WARN | XX | Medium — CLS score |
| No lazy loading (below-fold) | INFO | XX | Low — wasted bandwidth |
| No srcset | WARN | XX | Medium — mobile performance |
| Descriptive File Names | INFO | XX | Low |

#### Prioritized Optimization List

Sorted by estimated impact (LCP fixes first, then file size savings, then alt text):

| Image URL | Category | Current Size | Format | Issues | Priority | Est. Savings |
|-----------|----------|--------------|--------|--------|----------|--------------|
| /hero.jpg | LCP | 450KB | JPEG | No fetchpriority, wrong format | Critical | 300KB |
| /product-1.png | Content | 380KB | PNG | Oversized, no alt | High | 280KB |

#### Recommendations (Prioritized)

1. **Critical (fix immediately):** LCP image issues — missing fetchpriority, wrong format,
   or lazy loading applied. Every hour these are unfixed costs LCP score.
2. **High (this sprint):** Missing alt text on key product/editorial images. Convert
   top 10 heaviest images to WebP/AVIF.
3. **Medium (this month):** Add dimensions to all images without width/height to eliminate
   CLS. Add srcset to remaining content images.
4. **Low (backlog):** Rename non-descriptive image files, add ImageObject schema for
   editorial images, set up image CDN.

#### Implementation Code

Provide ready-to-use HTML snippets for corrected image markup where specific
images were identified for fixes. Every snippet must be copy-paste ready.
