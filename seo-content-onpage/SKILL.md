---
name: seo-content-onpage
description: >
  Content quality, E-E-A-T analysis, AI citation readiness, and on-page SEO
  optimization. Evaluates content against Google QRG (Dec 2025 update extending
  E-E-A-T to all competitive queries), detects AI content quality signals, scores
  passage-level citability for AI Overviews/ChatGPT/Perplexity, and performs deep
  single-page audits covering title tags, meta descriptions, headings, keyword
  optimization, internal linking, and page speed signals. Trigger when user says:
  "content quality", "E-E-A-T", "content analysis", "thin content", "readability",
  "on-page SEO", "title tag", "meta description", "H1 optimization", "keyword
  density", "content audit", "page SEO", "analyze this page", "why is this page
  not ranking", "on-page analysis", "heading structure", "internal linking",
  "AI content detection", "content score", "topical authority", "content clusters",
  "improve content", "page ranking audit", "canonical tag check", "open graph tags".
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - WebFetch
---

# Content Quality, E-E-A-T & On-Page SEO

## E-E-A-T (Dec 2025 QRG Update)

Read `../seo-core/references/eeat-framework.md` for full criteria.

**Critical:** Dec 2025 extended E-E-A-T to ALL competitive queries, not just YMYL.

### Signals Checklist
- **Experience:** Original research, case studies with real numbers, before/after docs, photos/screenshots from actual use
- **Expertise:** Author bio with verifiable credentials, technical depth, awareness of edge cases
- **Authoritativeness:** Backlinks from authoritative publications, expert citations, awards
- **Trustworthiness (most important):** Clear contact info, privacy policy, pub/updated dates, HTTPS, real author names

## Content Metrics

### Word Count Floors

| Page Type | Minimum | Notes |
|-----------|---------|-------|
| Homepage | 500 | Value prop + service summary |
| Service page | 800 | Problem, solution, proof, CTA |
| Blog post | 1,500 | Comprehensive coverage |
| Product page | 300-400 | Description + specs + reviews |
| Location page | 500-600 | >60% unique vs other locations |

### Keyword Optimization
- Primary keyword in title, H1, first 100 words
- Natural density 1-3%; semantic variations present

### Content Structure
- One H1, H2 sections, H3 subsections; no skipped levels
- Lists, ToC for >2,000 words; answer-first (inverted pyramid)

### Internal Linking
- 3-5 relevant links per 1,000 words; descriptive anchors
- No orphan pages; link within content clusters

## AI Content Assessment (2026)

Google QRG (Sept 2025) formally assesses AI content quality. Question is not "is this AI?" but "does it show genuine E-E-A-T?"

- **Acceptable:** E-E-A-T signals, unique value, human oversight, specific examples, author attribution
- **Low-quality:** Generic phrasing, no original insight, repetitive structure, no attribution, factual errors

## AI Citation Readiness

See `references/ai-citation.md` for passage-level citability scoring and platform-specific preferences.

Key: **134-167 word** self-contained answer blocks. Direct answer first, specific facts, named sources, quotable sentence.

---

## Single Page Analysis

### Pre-Analysis
Gather: target keyword(s), current ranking, page type, audience. Infer from content if not provided.

### Scoring Model
See `references/scoring-model.md` for full point breakdown per category.

| Category | Points |
|----------|--------|
| On-Page SEO Elements | /25 |
| Content Quality | /30 |
| Technical Page Elements | /25 |
| Schema Markup | /10 |
| Images | /10 |
| **Total** | **/100** |

90-100: Excellent | 75-89: Good | 60-74: Fair | 45-59: Poor | <45: Critical

## Quick Wins vs Long Game
- **2-4 weeks:** Fix noindex on ranking pages, fetchpriority on LCP image, front-load keywords in titles, add missing alt text, fix canonical inconsistencies, update meta descriptions on top 10
- **3-6+ months:** Content depth expansion, E-E-A-T building, internal link restructure, schema implementation, CWV optimization

## Content Freshness
- Visible pub date (ISO 8601 in structured data) + last updated date
- Flag content >12 months old on fast-moving topics
- Annual review for evergreen content

## Output: PAGE-ANALYSIS.md
1. Page Score Card
2. Executive Summary (what works, biggest barrier, highest-impact action)
3. Issues (Critical / High / Medium / Low)
4. Recommendations Table (Priority, Element, Current, Target, Impact)
5. Schema Opportunities (JSON-LD blocks)
6. Quick Win Action Plan (top 5)
7. Competitive Gap Summary (if target keyword known)
