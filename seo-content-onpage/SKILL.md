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

Evaluate content against Google's Quality Rater Guidelines and perform deep
single-page SEO analysis with scored, prioritized recommendations.

## E-E-A-T Framework (December 2025 QRG Update)

Read `../seo-core/references/eeat-framework.md` for full evaluation criteria.

**Critical update:** Dec 2025 extended E-E-A-T to ALL competitive queries, not
just YMYL. Any page in a crowded SERP is assessed for E-E-A-T signals.

### Experience (first-hand signals)
- Original research, surveys, proprietary data, case studies with real numbers
- Before/after documentation; personal anecdotes with concrete details
- Photos, screenshots, videos from actual use/experience

### Expertise
- Author bio with verifiable credentials relevant to topic
- Technical depth appropriate for audience; accurate, well-sourced claims
- Demonstrates awareness of edge cases and limitations

### Authoritativeness
- Backlinks from authoritative publications; brand mentions in respected outlets
- Content cited by recognized experts; awards, certifications
- Wikipedia article about brand or key people

### Trustworthiness (most important dimension)
- Clear contact info; privacy policy and terms linked from footer
- Visible publication and last-updated dates; transparent corrections
- Secure site (HTTPS); authorship transparency (real names)

## Content Metrics

### Word Count (Topical Coverage Floors)

| Page Type | Minimum | Notes |
|-----------|---------|-------|
| Homepage | 500 | Key value prop and service summary |
| Service page | 800 | Problem, solution, proof, CTA |
| Blog post | 1,500 | Comprehensive topical coverage |
| Product page | 300-400 | Description + specs + reviews |
| Location page | 500-600 | Must be >60% unique vs other location pages |

### Readability
- Flesch Reading Ease 60-70 for general audiences; lower for technical B2B
- Sentence length: avg 15-20 words; paragraphs: 2-4 sentences
- NOT a direct ranking factor (confirmed by John Mueller)

### Keyword Optimization
- Primary keyword in title, H1, first 100 words
- Natural density 1-3%; semantic variations present
- No keyword stuffing

### Content Structure
- Logical heading hierarchy (one H1, H2 for sections, H3 for subsections)
- Bullet/numbered lists; table of contents for >2,000 words
- Answer-first formatting (inverted pyramid)

### Internal Linking
- 3-5 relevant internal links per 1,000 words
- Descriptive anchor text (not "click here")
- No orphan pages; link within content clusters

### External Linking
- Cite primary sources: academic studies, official documentation
- Open external links in new tab; reasonable count

## AI Content Assessment (2026)

Google's quality raters formally assess AI content quality since Sept 2025 QRG.
The question is not "is this AI-generated?" but "does it demonstrate genuine E-E-A-T?"

**Acceptable:** Genuine E-E-A-T signals, unique value, human oversight, specific
examples, clear author attribution.

**Low-quality markers:** Generic phrasing, no original insight, repetitive
structure across pages, no attribution, factual inaccuracies, excessive hedging.

## AI Citation Readiness (GEO Signals)

### Passage-Level Citability
Optimal zone: **134-167 words** per self-contained answer block.

| Signal | Description |
|--------|-------------|
| Self-contained | Understandable without reading rest of page |
| Direct answer | Answer in first 2 sentences |
| Specific facts | Statistics, dates, proper nouns, numbers |
| Attribution | Claims linked to named sources |
| Quotable sentence | One sentence cleanly states key point |

Score 4+ on all = highly citable. Below 3 on "direct answer" = flag for rewrite.

### Structural Signals for AI Citation
- Question-based H2/H3 headings ("What is X?" "How does Y work?")
- Definition patterns: "X is..." in first sentence
- Tables for comparative data; numbered lists for steps
- Statistic + source in same sentence

### Platform-Specific Citation Preferences

| Platform | Prioritizes |
|----------|------------|
| Google AI Overviews | Top-10 ranking pages, passage relevance, schema |
| ChatGPT | Wikipedia, authoritative sources, freshness |
| Perplexity | Reddit, Wikipedia, original research |
| Claude | Authoritative sources, specific facts, clear attribution |
| Bing Copilot | Bing index, news sources, IndexNow |

---

## Single Page Analysis Framework

### Pre-Analysis: Gather Context
- Target keyword(s), current ranking, page type, audience
- If not provided, infer from content and confirm with user

### Category 1: On-Page SEO Elements (25 points)

**Title Tag (8 pts):** 50-60 chars, primary keyword near start, unique, brand included.
Front-load keyword; use numbers and power words for CTR.

**Meta Description (5 pts):** 150-160 chars, compelling, keyword + CTA.
Write as mini-ad; Google bolds matching keywords.

**H1 Tag (5 pts):** Exactly one, includes primary keyword, under 70 chars.
Related to but not identical to title tag.

**Heading Hierarchy (4 pts):** Logical H1>H2>H3, no skipped levels, descriptive.

**URL Structure (3 pts):** Short, descriptive, hyphenated, keyword included.

### Category 2: Content Quality (30 points)

**Word Count (6 pts):** Compare against top 3 ranking pages for target keyword.

**Keyword Usage (6 pts):** Primary in title/H1/first 100 words; density 1-3%;
semantic variations; secondary keywords in H2s.

**Content Depth (8 pts):** Covers all subtopics competitors cover; unique angles;
answers follow-up questions; specific examples and data.

**Readability (4 pts):** Flesch 60-70; sentences <20 words; paragraphs 3-4 sentences.

**E-E-A-T Signals (6 pts):** Experience 1.5pt, Expertise 1.5pt, Authority 1.5pt,
Trust 1.5pt.

### Category 3: Technical Page Elements (25 points)

**Canonical Tag (6 pts):** Self-referencing, consistent www/protocol/slash.

**Meta Robots (4 pts):** index,follow (or absent = default). Flag noindex on
pages meant to rank as Critical.

**Open Graph (4 pts):** og:title, og:description, og:image (1200x630+), og:url, og:type.

**Page Speed Signals (6 pts):** LCP risk (hero image), INP risk (JS bundles),
CLS risk (missing dimensions), render-blocking resources.

**Internal Links (3 pts):** 3-5 relevant links out; 1-2 pages linking in;
descriptive anchors.

**External Links (2 pts):** Links to authoritative sources for claims.

### Category 4: Schema Markup (10 points)
See `seo-assets` skill for full schema workflow.

### Category 5: Images (10 points)
See `seo-assets` skill for image analysis.

## Scoring Model

```
Overall Score: XX/100
On-Page SEO:     XX/25
Content Quality: XX/30
Technical:       XX/25
Schema:          XX/10
Images:          XX/10
```

90-100: Excellent | 75-89: Good | 60-74: Fair | 45-59: Poor | <45: Critical

## Quick Win vs Long Game

**Quick Wins (2-4 weeks):**
- Fix noindex on ranking pages; add fetchpriority to LCP image
- Update title tags with keyword front-loaded; add missing alt text
- Fix canonical inconsistencies; update meta descriptions on top 10 pages

**Long Game (3-6+ months):**
- Content depth expansion; E-E-A-T signal building
- Internal link equity restructure; schema implementation
- Core Web Vitals optimization

## Content Freshness

- Publication date visible (ISO 8601 in structured data)
- Last updated date if substantively revised
- Flag content >12 months old on fast-moving topics
- Annual review recommended even for evergreen content

## Output Format

### PAGE-ANALYSIS.md
1. Page Score Card with visual bars
2. Executive Summary (3-5 sentences): what works, biggest barrier, highest-impact action
3. Issues Found (Critical / High / Medium / Low)
4. Recommendations Table (Priority, Element, Current, Target, Impact)
5. Schema Opportunities (JSON-LD code blocks)
6. Quick Win Action Plan (top 5 by impact-to-effort)
7. Competitive Gap Summary (if target keyword known)
