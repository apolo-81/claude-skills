---
name: seo-international
description: >
  SEO internacional y local: hreflang, sitios multi-idioma/región, GEO (visibilidad en
  AI Overviews, ChatGPT, Perplexity, Claude). Cubre x-default, ccTLD, llms.txt, RSL 1.0.
  Usar cuando: "hreflang", "SEO internacional", "multi-idioma", "multi-región",
  "geo-targeting", "llms.txt", "AI search", "GEO", "aparecer en ChatGPT/Perplexity",
  "citas en IA", "país incorrecto en resultados", "x-default".
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

---

## Part 1: Hreflang & International SEO

### When NOT to Use Hreflang
1. Single-language, single-country site
2. Machine-translated pages without real localization
3. Content behind login or geo-blocking (must return 200 to Googlebot)
4. No search presence in target markets
5. Pagination/filter pages (only canonical pages)

### Validation Checks

1. **Self-referencing:** Every page MUST include hreflang pointing to itself. URL must exactly match canonical.
2. **Return tags:** If A points to B, B MUST point back to A. Full bidirectional mesh.
3. **x-default:** Required on every page with hreflang. Points to language selector or most universal version.
4. **Language codes (ISO 639-1):**

| Correct | Wrong | Note |
|---------|-------|------|
| `ja` | `jp` | jp = country, ja = language |
| `zh-Hans` | `zh-cn` | Must use script subtag |
| `ko` | `kr` | kr = country |
| `en-GB` | `en-uk` | UK not valid ISO 3166-1 |

5. **Region codes:** ISO 3166-1 Alpha-2, uppercase (`en-GB`, not `en-gb`).
6. **Canonical alignment:** Hreflang only on canonical URLs. Non-canonical = ignored.
7. **Protocol/URL consistency:** All HTTPS, consistent www/trailing slash.

### 5 Most Common Errors

| Error | Fix |
|-------|-----|
| Missing return tags | Add matching B>A tags |
| Missing self-reference | Add self-referencing tag |
| Wrong codes (`jp`, `kr`) | Use ISO 639-1 |
| Hreflang on non-canonical | Move to canonical URL only |
| x-default missing/wrong | Add to every page in set |

### Implementation Methods
See `references/hreflang-examples.md` for code examples (HTML link tags, HTTP headers, XML sitemap) and generation process.

- **HTML link tags:** Best for <50 variants
- **HTTP headers:** Best for non-HTML (PDFs)
- **XML sitemap:** Best for large sites, cross-domain

### Output: HREFLANG-AUDIT.md
Summary (pages, variants, issues, method), validation results per page, critical issues with fixes, generated code, GSC verification steps.

---

## Part 2: AI Search / GEO Optimization (March 2026)

See `references/geo-optimization.md` for stats, brand signal correlations, AI crawler config, llms.txt, RSL 1.0, and platform-specific optimization.

### GEO Analysis Criteria

| Dimension | Weight | Key Signals |
|-----------|--------|-------------|
| Passage-level citability | 25% | 134-167 word answer blocks, direct answer first, specific facts, attribution |
| Structural readability | 20% | Question headings, short paragraphs, tables, lists, FAQ |
| Multi-modal content | 15% | Text + images/video/infographics/tools (156% higher citation rates) |
| Authority & brand signals | 20% | Author byline, pub dates, source citations, Wikipedia/Reddit/YouTube presence |
| Technical accessibility | 20% | SSR required (AI crawlers don't execute JS), robots.txt access, llms.txt |

**Critical:** Brand mentions correlate 3x more strongly with AI visibility than backlinks.

### Output: GEO-ANALYSIS.md
1. GEO Readiness Score: XX/100 (breakdown by dimension)
2. Platform Scores table
3. AI Crawler Access Status
4. llms.txt Status
5. Brand Mention Analysis
6. Passage-Level Citability (3 best, 3 worst with rewrites)
7. SSR Check
8. RSL 1.0 Status
9. Top 5 Highest-Impact Actions
10. Content Reformatting Suggestions (before/after)
