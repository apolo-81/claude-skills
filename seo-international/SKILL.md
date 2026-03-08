---
name: seo-international
description: >
  International and local SEO: hreflang audit/validation/generation for multi-language
  and multi-region sites, plus AI search optimization (GEO) for AI Overviews, ChatGPT,
  Perplexity, Claude, and Bing Copilot. Covers language/region codes, return tags,
  x-default, cross-domain hreflang, sitemap-based implementation, llms.txt, RSL 1.0,
  brand mention signals, AI crawler accessibility, and platform-specific citation
  strategies. Trigger when user says: "hreflang", "international SEO", "multi-language",
  "multi-region", "wrong country in search results", "x-default", "geo-targeting",
  "ccTLD", "subdirectory by language", "AI Overviews", "GEO", "AI search",
  "LLM optimization", "Perplexity", "AI citations", "ChatGPT search", "llms.txt",
  "AI visibility", "generative engine optimization", "AI Mode", "cited by AI",
  "zero-click AI results", "AI search traffic", "local SEO", "Google Business Profile".
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - WebFetch
---

# International SEO & AI Search Optimization (GEO)

Hreflang/i18n SEO and Generative Engine Optimization — both about ensuring
the right content reaches the right audience, whether human or AI.

---

## Part 1: Hreflang & International SEO

### Why Hreflang Matters
Hreflang tells Google which language/region version to show. Broken implementations
cause Google to ignore ALL alternate tags for affected pages.

### When NOT to Use Hreflang
1. Single-language, single-country site
2. Machine-translated pages without real localization
3. Content behind login or geo-blocking (must return 200 to Googlebot)
4. No search presence in target markets (hreflang helps serve, not create visibility)
5. Pagination and filter pages (only canonical pages)

### Validation Checks

**1. Self-Referencing Tags:** Every page MUST include hreflang pointing to itself.
URL must exactly match canonical (protocol, www, trailing slash).

**2. Return Tags:** If A points to B, B MUST point back to A. Full bidirectional mesh.

**3. x-default:** Required on every page with hreflang tags. Points to language
selector or most universal version. Must appear in ALL variants' sets.

**4. Language Codes (ISO 639-1):**

| Correct | Wrong | Note |
|---------|-------|------|
| `ja` | `jp` | jp is Japan (country), ja is Japanese (language) |
| `zh-Hans` | `zh-cn` | Must use script subtag |
| `ko` | `kr` | kr is Korea (country) |
| `en-GB` | `en-uk` | UK not valid ISO 3166-1 |

**5. Region Codes:** ISO 3166-1 Alpha-2, uppercase (`en-GB`, not `en-gb`).

**6. Canonical Alignment:** Hreflang only on canonical URLs. If canonical points
elsewhere, hreflang is ignored.

**7. Protocol/URL Consistency:** All HTTPS, consistent www/trailing slash.

### 5 Most Common Errors

| Error | Symptom | Fix |
|-------|---------|-----|
| Missing return tags | GSC: "not confirmed" | Add matching B>A tags |
| Missing self-reference | GSC: "Alternate page without redirect" | Add self-referencing tag |
| Wrong language codes (`jp`, `kr`) | Tags silently ignored | Use ISO 639-1 |
| Hreflang on non-canonical pages | Ignored entirely | Move to canonical URL only |
| x-default missing/wrong | Wrong fallback shown | Add to every page in set |

### Implementation Methods

**HTML Link Tags** (best for <50 variants):
```html
<link rel="alternate" hreflang="en-US" href="https://example.com/en/page" />
<link rel="alternate" hreflang="fr" href="https://example.com/fr/page" />
<link rel="alternate" hreflang="x-default" href="https://example.com/en/page" />
```

**HTTP Headers** (best for non-HTML files like PDFs).

**XML Sitemap** (best for large sites, cross-domain):
```xml
<url>
  <loc>https://example.com/en/page</loc>
  <xhtml:link rel="alternate" hreflang="en-US" href="https://example.com/en/page" />
  <xhtml:link rel="alternate" hreflang="fr" href="https://example.com/fr/page" />
  <xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/en/page" />
</url>
```

### Cross-Domain Support
Works across different domains (example.com, example.de). Requires return tags on
both domains, separate GSC verification. Prefer sitemap-based implementation.

### Hreflang Generation Process
1. Detect languages from URL path, subdomain, ccTLD, HTML `lang` attribute
2. Map page equivalents across all variants
3. Validate codes against ISO 639-1 + ISO 3166-1
4. Generate tags with self-reference for each page
5. Verify bidirectional return tags (full mesh)
6. Add x-default; choose implementation method
7. Output implementation-ready code

### Output: HREFLANG-AUDIT.md
- Summary (pages scanned, variants, issues, method)
- Validation results table per page
- Critical issues with exact fix instructions
- Generated implementation code
- GSC verification steps and testing checklist

---

## Part 2: AI Search / GEO Optimization (March 2026)

### What is GEO
Generative Engine Optimization = optimizing content to be cited by AI search.
Success is measured by citation frequency, not ranking position.

**Key stats (2026):**
- AI Overviews: 50%+ of Google queries, 1.5B users/month
- AI-referred sessions grew 527% (Jan-May 2025)
- Only 11% of domains cited by both ChatGPT and Google AIO for same query
- 92% of AIO citations from top-10 pages; 47% from ranks 6-10+

### Critical: Brand Mentions > Backlinks
Brand mentions correlate 3x more strongly with AI visibility than backlinks.

| Signal | Correlation |
|--------|-------------|
| YouTube mentions | ~0.737 (strongest) |
| Reddit mentions | High |
| Wikipedia presence | High |
| Domain Rating (backlinks) | ~0.266 (weak) |

### GEO Analysis Criteria

**1. Passage-Level Citability (25%):** 134-167 word self-contained answer blocks.
Direct answer first, specific facts, named attribution, quotable sentence.

**2. Structural Readability (20%):** Question-based headings, short paragraphs,
tables for comparative data, ordered/unordered lists, FAQ sections.

**3. Multi-Modal Content (15%):** Text + images, video with transcripts,
infographics, interactive tools. 156% higher AI citation selection rates.

**4. Authority & Brand Signals (20%):** Author byline + credentials, publication
dates, citations to primary sources, entity presence (Wikipedia, Wikidata,
Knowledge Panel), Reddit/YouTube/LinkedIn presence.

**5. Technical Accessibility (20%):** AI crawlers do NOT execute JavaScript.
SSR required. Check AI crawler access in robots.txt, llms.txt presence.

### AI Crawler Configuration
Allow search-facing crawlers; evaluate training crawlers per IP policy.
- OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot: Allow (drives citation)
- GPTBot, Google-Extended, CCBot: Block if IP concern (training only)
- Never block Googlebot

### llms.txt Standard
Machine-readable guide at `/llms.txt` for AI systems (analogous to robots.txt).
Sections: site description, main content pages, products/services, about/authority,
key facts. Update within 6 months.

### RSL 1.0 (Really Simple Licensing)
Machine-readable AI content licensing via `<link rel="license">` or
`/.well-known/rsl.json`. Terms: Allow, Restrict, or License.
Backed by Reddit, Yahoo, Medium, Quora, Cloudflare, Akamai, Creative Commons.

### Platform-Specific Optimization

**Google AI Overviews:** Maintain top-10 ranking, question-based headings,
definition patterns, Article/Organization schema, content in raw HTML.

**ChatGPT:** Build Wikipedia presence, publish on Reddit authentically,
allow OAI-SearchBot, add dates and author credentials.

**Perplexity:** Reddit presence, cite primary sources, academic citation format,
publish original research/data.

**Claude:** Factual accuracy, clear attribution, Organization/Person schema,
direct prose without hedging.

**Bing Copilot:** Submit sitemap to Bing Webmaster Tools, implement IndexNow,
optimize Open Graph tags.

### Output: GEO-ANALYSIS.md
1. GEO Readiness Score: XX/100 (breakdown by dimension)
2. Platform Scores table
3. AI Crawler Access Status
4. llms.txt Status
5. Brand Mention Analysis
6. Passage-Level Citability Analysis (3 best, 3 worst with rewrites)
7. SSR Check
8. RSL 1.0 Status
9. Top 5 Highest-Impact Actions
10. Content Reformatting Suggestions with before/after
