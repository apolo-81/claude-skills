---
name: seo-hreflang
description: >
  Hreflang and international SEO audit, validation, and generation. Triggers:
  "hreflang", "international SEO", "SEO internacional", "multi-language",
  "multi-region", "x-default", "hreflang errors", "i18n SEO", "alternate tags",
  "sitio multilenguaje", "geo-targeting SEO", "ccTLD SEO", "subdirectorios por
  idioma", "wrong country in search results", "páginas duplicadas por idioma",
  "mi sitio sale en el país equivocado", "hreflang sitemap", "global SEO".
---

# Hreflang & International SEO

Validate existing hreflang implementations or generate correct hreflang tags
for multi-language and multi-region sites. Supports HTML link tags, HTTP response
headers, and XML sitemap implementations.

## Why Hreflang Matters

Hreflang tells Google which language/region version of a page to show to which
users. Without correct hreflang: users get the wrong language version in search
results, international traffic goes to the wrong pages, and conversion rates drop.
Getting hreflang wrong is worse than not having it — broken implementations
cause Google to ignore ALL alternate tags for affected pages.

## When NOT to Use Hreflang

Do not implement hreflang in these situations — it will be ignored or cause harm:

**1. Single-language site serving a single country:**
If all your content is in English and you target US users only, hreflang provides
zero benefit. Adding it creates maintenance overhead for no gain.

**2. Translated content vs truly localized content:**
Hreflang is for genuinely different language/region versions. Machine-translated
pages with no regional adaptation (same pricing, same examples, same CTA) often
fail to provide enough value to justify indexing as separate pages. Google may
treat them as duplicate content. Localize, don't just translate.

**3. Content behind login or geo-blocking:**
If the alternate page isn't publicly accessible to Googlebot, hreflang tags
pointing to it will fail. The page must return HTTP 200 to crawlers.

**4. Sites with no search presence in target markets:**
If you have no domain authority or backlinks in Germany, adding `de` hreflang
tags won't make you rank in Germany. Hreflang helps Google serve the right page
to users already finding you — it doesn't create visibility where none exists.

**5. Pagination and filter pages:**
Never add hreflang to paginated series, filtered views, or parameter-based URLs.
Only include canonical, indexable pages in your hreflang implementation.

## Validation Checks

### 1. Self-Referencing Tags
- Every page MUST include an hreflang tag pointing to itself
- The self-referencing URL must exactly match the page's canonical URL (including
  protocol, www/non-www, trailing slash, query parameters)
- Why: Missing self-reference causes Google to ignore the entire hreflang set for that page
- Check: `<link rel="alternate" hreflang="[lang]" href="[this-page-exact-URL]" />`

### 2. Return Tags (Bidirectional Requirement)
- If page A has hreflang pointing to page B, page B MUST have hreflang pointing back to page A
- Every hreflang relationship must be bidirectional — full mesh across all variants
- Why: Unidirectional tags signal an incomplete or broken implementation
- Failure mode: Page A's signal is weakened; page B's alternate tag is ignored entirely

### 3. x-default Tag
- x-default designates the fallback page for users whose language/region doesn't
  match any specific variant
- Required on every page that has any hreflang tags
- Points to: language selector page, or the most broadly applicable version (usually `en`)
- Only one x-default per URL set
- x-default must also appear in ALL other language variants' hreflang sets (return tag)
- Common mistake: pointing x-default to the homepage when language variants exist at subpaths

### 4. Language Code Validation
Use ISO 639-1 two-letter codes only:
| Correct | Wrong | Language |
|---------|-------|----------|
| `en` | `eng` | English (ISO 639-2, not valid) |
| `ja` | `jp` | Japanese (`jp` is Japan the country, not the language) |
| `zh-Hans` | `zh-cn` | Simplified Chinese (must use script subtag, not region alone) |
| `zh-Hant` | `zh-tw` | Traditional Chinese |
| `pt` | `por` | Portuguese |
| `ko` | `kr` | Korean |

### 5. Region Code Validation
Region qualifier uses ISO 3166-1 Alpha-2 (uppercase):
| Correct | Wrong | Issue |
|---------|-------|-------|
| `en-GB` | `en-uk` | UK is not a valid ISO 3166-1 code |
| `pt-BR` | `pt-br` | Region code must be uppercase |
| `es-MX` | `es-LA` | Latin America is not a country |
| `fr-FR` | `fr-fr` | Case sensitivity (should be uppercase region) |
| `zh-Hans` | `zh-Hans-CN` | Overly specific — `zh-Hans` is sufficient |

### 6. Canonical URL Alignment
- Hreflang tags must only appear on canonical URLs
- If page has `rel=canonical` pointing elsewhere → hreflang on that page is ignored
- The canonical URL in `<link rel="canonical">` must exactly match the hreflang `href`
- Non-canonical pages (paginated, filtered, parameter variants) must NOT be in hreflang sets

### 7. Protocol Consistency
- All URLs in an hreflang set must use the same protocol (HTTPS)
- Mixed HTTP/HTTPS within a set causes validation failures
- After HTTPS migration: update every hreflang tag to HTTPS

### 8. URL Format Consistency
- Trailing slash: `https://example.com/page/` vs `https://example.com/page` — pick one
- www vs non-www: must be consistent within the hreflang set
- All URLs must match exactly what the server serves (no redirects within the set)

### 9. Cross-Domain Support
- Hreflang works across different domains (`example.com` and `example.de`)
- Requires return tags on both domains
- Both domains must be verified separately in Google Search Console
- Recommendation: use sitemap-based implementation for cross-domain setups

## 5 Most Common Hreflang Errors (Diagnosed)

### Error 1: Missing Return Tags
**Symptom:** GSC shows "Hreflang: not confirmed" for some language variants.
**Cause:** You added hreflang to your English pages pointing to French pages, but
the French pages don't link back to the English pages.
**Fix:** For every `A → B` relationship, add a matching `B → A` tag. Use a crawler
or script to verify that every URL in the hreflang set includes tags pointing to
all other variants AND back to itself.

### Error 2: Missing Self-Reference
**Symptom:** GSC shows "Alternate page without redirect" in Coverage report.
**Cause:** The English page has hreflang tags for fr and de but no tag for en pointing
to itself.
**Fix:** Every page must include `<link rel="alternate" hreflang="[its-own-lang]" href="[its-own-URL]" />`.

### Error 3: Using Wrong Language Codes
**Symptom:** Tags silently ignored — no GSC error, but pages served to wrong markets.
**Cause:** Using `jp` (country code for Japan) instead of `ja` (language code for
Japanese), or `zh-CN` instead of `zh-Hans`.
**Fix:** Audit all hreflang lang values against ISO 639-1. Replace incorrect codes.
Most common mistakes: `jp`, `kr`, `zh-CN`, `zh-TW`, `en-uk`, `es-latam`.

### Error 4: Hreflang on Non-Canonical Pages
**Symptom:** Hreflang implemented on paginated pages (page 2, 3...) or filtered
views, causing conflicting signals.
**Cause:** CMS adds hreflang globally including to pages that have canonical pointing
to a different URL.
**Fix:** Only implement hreflang on canonical pages. Add a condition: if
`rel=canonical != self`, skip hreflang output.

### Error 5: x-default Missing or Pointing to Wrong URL
**Symptom:** Users without a matched language variant land on unexpected pages.
**Cause:** x-default missing entirely, or pointing to a language-specific page
rather than a neutral landing page.
**Fix:** Add `hreflang="x-default"` to every page in every hreflang set, pointing
to either a language selector page or the most universal language version (typically
the language-neutral `en` version, not `en-US`).

## Common Error Diagnostic Table

| Error | Severity | Symptom | Fix |
|-------|----------|---------|-----|
| Missing self-referencing tag | Critical | GSC: "Alternate page without redirect" | Add self-reference hreflang tag |
| Missing return tags (A→B, no B→A) | Critical | GSC: "Hreflang: not confirmed" | Add matching return tags on all alternates |
| Missing x-default | High | Wrong fallback shown in unmatched locales | Add x-default to every page in the set |
| Invalid language code (`eng`, `jp`) | High | Tags silently ignored | Use ISO 639-1 codes |
| Invalid region code (`en-uk`) | High | Tags silently ignored | Use ISO 3166-1 Alpha-2 |
| Hreflang on non-canonical URL | High | Ignored by Google entirely | Move hreflang to canonical URL only |
| HTTP/HTTPS mismatch | Medium | Inconsistent signals | Standardize to HTTPS everywhere |
| Trailing slash inconsistency | Medium | Partial signal loss | Match canonical URL format exactly |
| Duplicate hreflang declarations | Medium | Conflicting signals | Remove duplicates |
| Hreflang in both HTML and sitemap | Low | Redundant but not harmful | Choose one method — sitemap preferred at scale |
| `zh` without script subtag | High | Ambiguous — Simplified or Traditional? | Use `zh-Hans` or `zh-Hant` |

## Diagnosing Hreflang Issues

### Step-by-Step Diagnosis Process

1. **Pull the hreflang set** for a representative page (view source or use a crawler)
2. **Check self-reference** — does this page's URL appear in its own hreflang tags?
3. **Verify return tags** — open each alternate URL and check it links back to this page
4. **Validate language codes** — match each code against ISO 639-1 list
5. **Validate region codes** — match each code against ISO 3166-1 Alpha-2 list
6. **Check canonical alignment** — does hreflang URL match the canonical tag URL?
7. **Check Google Search Console** — International Targeting report shows detected errors
8. **Check Coverage report** — "Alternate page without redirect" often indicates hreflang issues

### GSC Error Messages Decoded
| GSC Message | Root Cause |
|-------------|-----------|
| "Alternate page with proper canonical tag" | Non-canonical page in hreflang set |
| "Submitted URL not found (404)" | Dead URL in hreflang set |
| "Hreflang: not confirmed" | Missing return tag |
| Multiple pages for same hreflang value | Duplicate hreflang declarations |

## Implementation Methods

### Method 1: HTML Link Tags
Best for: Sites with fewer than 50 language/region variants per page.

Place in `<head>` section. Every page must include ALL alternates including itself.

```html
<link rel="alternate" hreflang="en-US" href="https://example.com/en/page" />
<link rel="alternate" hreflang="en-GB" href="https://example.co.uk/page" />
<link rel="alternate" hreflang="fr" href="https://example.com/fr/page" />
<link rel="alternate" hreflang="de" href="https://example.de/page" />
<link rel="alternate" hreflang="zh-Hans" href="https://example.com/zh/page" />
<link rel="alternate" hreflang="x-default" href="https://example.com/en/page" />
```

### Method 2: HTTP Response Headers
Best for: Non-HTML files (PDFs, documents, images with SEO value).

```
Link: <https://example.com/en/doc.pdf>; rel="alternate"; hreflang="en-US",
      <https://example.com/fr/doc.pdf>; rel="alternate"; hreflang="fr",
      <https://example.com/en/doc.pdf>; rel="alternate"; hreflang="x-default"
```

Configure via web server (Nginx, Apache) or CDN edge rules.

### Method 3: XML Sitemap (Recommended for large sites)
Best for: Sites with many language variants, cross-domain setups, or 50+ pages.
Advantage: Centralized management, no page-level bloat, supports cross-domain.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://example.com/en/page</loc>
    <xhtml:link rel="alternate" hreflang="en-US" href="https://example.com/en/page" />
    <xhtml:link rel="alternate" hreflang="fr" href="https://example.com/fr/page" />
    <xhtml:link rel="alternate" hreflang="de" href="https://example.de/page" />
    <xhtml:link rel="alternate" hreflang="zh-Hans" href="https://example.com/zh/page" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/en/page" />
  </url>
  <url>
    <loc>https://example.com/fr/page</loc>
    <xhtml:link rel="alternate" hreflang="en-US" href="https://example.com/en/page" />
    <xhtml:link rel="alternate" hreflang="fr" href="https://example.com/fr/page" />
    <xhtml:link rel="alternate" hreflang="de" href="https://example.de/page" />
    <xhtml:link rel="alternate" hreflang="zh-Hans" href="https://example.com/zh/page" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/en/page" />
  </url>
</urlset>
```

Critical: Include `xmlns:xhtml` namespace. Every `<url>` entry must include ALL
language alternates including itself. Split at 50,000 URLs per sitemap file.

### Method Comparison
| Method | Best For | Pros | Cons |
|--------|----------|------|------|
| HTML link tags | Small sites (<50 variants) | Easy to implement, crawled immediately | Bloats `<head>`, hard to maintain at scale |
| HTTP headers | Non-HTML files | Works for PDFs, images | Complex server config, invisible in HTML |
| XML sitemap | Large sites, cross-domain | Scalable, centralized, cross-domain | Requires sitemap maintenance, delayed pickup |

## Real-World Implementation Examples

### Example A: SaaS with 3 Languages, Single Domain

Site structure: `example.com/en/`, `example.com/fr/`, `example.com/de/`

```html
<!-- On /en/pricing page -->
<link rel="alternate" hreflang="en" href="https://example.com/en/pricing/" />
<link rel="alternate" hreflang="fr" href="https://example.com/fr/tarifs/" />
<link rel="alternate" hreflang="de" href="https://example.com/de/preise/" />
<link rel="alternate" hreflang="x-default" href="https://example.com/en/pricing/" />

<!-- The SAME four tags must appear on /fr/tarifs/ and /de/preise/ -->
```

Note: Each language variant can use localized URL slugs (`/tarifs/` for French,
`/preise/` for German) — Google follows the hreflang mapping, not URL structure.

### Example B: Country Variants for Spanish (es-MX, es-ES, es-AR)

Three Spanish variants must maintain full bidirectional mesh:

```html
<!-- On the Mexico page -->
<link rel="alternate" hreflang="es-MX" href="https://example.com/mx/inicio/" />
<link rel="alternate" hreflang="es-ES" href="https://example.com/es/inicio/" />
<link rel="alternate" hreflang="es-AR" href="https://example.com/ar/inicio/" />
<link rel="alternate" hreflang="en" href="https://example.com/en/home/" />
<link rel="alternate" hreflang="x-default" href="https://example.com/en/home/" />
```

Key decision: Use `es-MX`, `es-ES`, `es-AR` (language + country) when content
is genuinely localized for each country. Use `es` alone only if one Spanish
version serves all Spanish-speaking users without regional differentiation.

### Example C: Cross-Domain with ccTLDs (example.com, example.co.uk, example.de)

```html
<!-- On example.com (English global) -->
<link rel="alternate" hreflang="en" href="https://example.com/" />
<link rel="alternate" hreflang="en-GB" href="https://example.co.uk/" />
<link rel="alternate" hreflang="de" href="https://example.de/" />
<link rel="alternate" hreflang="x-default" href="https://example.com/" />
```

Both `example.co.uk` and `example.de` must have matching return tags pointing back
to `example.com`. Verify all three domains in GSC separately. Recommend sitemap-based
implementation for cross-domain setups to avoid maintaining tags on 3+ domains.

## x-default: When and How to Use It

### When to Use x-default
- You have multiple language versions of your site
- Some users' languages are not served by any specific variant
- You have a language selector or global homepage that serves all users

### x-default Destinations (in order of preference)
1. **Language selector page** — e.g., `example.com/choose-language` — best if you have one
2. **Most universal language version** — e.g., English international (`en`) without region suffix
3. **Global homepage** — if all language variants are subpaths of the same domain

### What x-default Is NOT
- Not a fallback for SEO — it does not help pages rank
- Not a canonical tag — it does not consolidate ranking signals
- Not required on every page — only on pages within an hreflang set

## Hreflang Generation Process

1. **Detect languages**: Scan site for language indicators (URL path, subdomain, ccTLD, HTML `lang` attribute)
2. **Map page equivalents**: Match corresponding pages across all language/region variants
3. **Validate language codes**: Verify all codes against ISO 639-1 + ISO 3166-1
4. **Generate tags**: Create hreflang tags for each page including self-reference
5. **Verify return tags**: Confirm all relationships are bidirectional (full mesh)
6. **Add x-default**: Set fallback for each URL set
7. **Choose method**: HTML tags, HTTP headers, or sitemap XML based on site scale
8. **Output**: Generate implementation-ready code

## Output Format

### Hreflang Validation Report (HREFLANG-AUDIT.md)

#### Summary
- Pages scanned: XX
- Language variants detected: XX (list all codes found)
- Issues found: XX (Critical: X, High: X, Medium: X, Low: X)
- Implementation method: HTML / HTTP Headers / Sitemap / Mixed

#### Validation Results
| Page | Language | URL | Self-Ref | Return Tags | x-default | Code Valid | Status |
|------|----------|-----|----------|-------------|-----------|------------|--------|
| /page | en-US | https://... | OK | OK | OK | OK | Pass |
| /fr/page | fr | https://... | MISSING | OK | OK | OK | FAIL |
| /de/page | de | https://... | OK | MISSING | OK | INVALID | FAIL |

#### Critical Issues (fix before anything else)
List all Critical severity issues with specific URLs and exact fix instructions.

#### Generated Hreflang Implementation
- HTML `<link>` tags (if HTML method chosen) — one block per page template
- HTTP header values (if header method chosen) — server config snippets
- `hreflang-sitemap.xml` (if sitemap method chosen) — complete XML file

#### Recommendations
- Missing implementations to add
- Incorrect codes to fix
- Method migration suggestions (e.g., HTML → sitemap when crossing 50 variants)
- GSC verification steps
- Testing checklist: verify return tags, validate codes, check in GSC International Targeting
