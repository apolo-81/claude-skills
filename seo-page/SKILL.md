---
name: seo-page
description: >
  Deep single-page SEO analysis with scored report. Triggers: "on-page SEO",
  "analyze this page", "analizar esta URL", "page SEO review", "title tag",
  "meta description", "H1 optimization", "heading structure", "keyword density",
  "por qué no rankea esta página", "page score", "meta tags", "canonical tag",
  "E-E-A-T page analysis", "Core Web Vitals page", "internal link audit",
  "why is this page not ranking", "mejorar esta página para Google".
---

# Single Page SEO Analysis

Perform a comprehensive, scored SEO audit of a single page. This is not a surface-level
check — it is a deep diagnostic that covers every ranking factor measurable from page
HTML, content, and structure. The output is a prioritized action plan, not just a
list of observations.

## Pre-Analysis: Gather Context

Before analyzing, collect:
- **Target keyword(s)**: What query should this page rank for?
- **Current ranking position**: Is this a new page or one that's underperforming?
- **Page type**: Blog post, product page, service page, landing page, homepage?
- **Audience**: Who is this page for? What do they need from it?

If the user doesn't provide these, infer from the page content and ask for confirmation.

## Analysis Framework

### Category 1: On-Page SEO Elements (25 points)

#### Title Tag (8 points)

The title tag is the single most important on-page element. It appears in SERPs,
browser tabs, and is the primary signal Google uses to understand page topic.

Scoring criteria:
- **8/8**: 50-60 chars, primary keyword near start, unique, descriptive, includes brand
- **6/8**: 50-60 chars but keyword placement weak, or missing brand
- **4/8**: Too long (>60) or too short (<30), but keyword present
- **2/8**: Missing keyword entirely, or generic/duplicated
- **0/8**: Missing title tag

Checks to perform:
- Length: flag if <30 or >60 characters (pixel equivalent ~580px for desktop)
- Primary keyword: present? near the beginning? (first 3 words ideally)
- Uniqueness: is this title used on other pages? (if context available)
- Click appeal: would a user click this in SERPs over competing titles?
- Brand inclusion: brand name present? (typically at end: `Page Topic | Brand`)
- Title tag vs H1 discrepancy: they should be related but not identical — different
  title and H1 help cover more keyword surface area while maintaining consistency

**Title optimization principles:**
- Front-load the primary keyword: "Best CRM Software for Small Business | Brand" not
  "Brand | Best CRM Software for Small Business"
- Use numbers where relevant: "7 Best CRM Tools..." tends to outperform "Best CRM Tools..."
- Include a power word that increases click intent: "Best", "Free", "Ultimate", "Complete"
- Avoid click-bait that doesn't match content — high bounce rate hurts rankings

#### Meta Description (5 points)

Meta description doesn't directly affect rankings but is a critical CTR signal.
A 10% improvement in CTR acts as a ranking boost through improved engagement signals.

Scoring criteria:
- **5/5**: 150-160 chars, compelling, includes primary keyword and a call-to-action
- **3/5**: Present and relevant but missing CTA or slightly off-length
- **1/5**: Present but generic, too short, or missing keyword
- **0/5**: Missing entirely (Google auto-generates — usually worse than manual)

Write meta descriptions as mini-ads:
- Include the primary keyword (Google bolds it in SERPs when it matches the query)
- State the value proposition: what does the user get from this page?
- End with a CTA: "Learn how", "Get started", "Compare now", "Download free"
- Target exactly 155 characters — avoid truncation with `...`

Note: Meta description is not a direct ranking factor but directly affects CTR.
A compelling meta description can increase clicks by 5-30%, which does affect rankings
through behavioral signals.

#### H1 Tag (5 points)

The H1 is the main visible heading of the page — it reinforces the title tag's
topic signal and tells users immediately what the page covers.

- **5/5**: Exactly one H1, includes primary keyword, matches page intent, under 70 chars
- **3/5**: One H1 but keyword missing or weak match to intent
- **1/5**: Multiple H1s, or H1 present but irrelevant
- **0/5**: No H1 found

Rules:
- Exactly one H1 per page (having zero or multiple H1s is an error)
- H1 should match or closely relate to the title tag topic
- H1 does not need to be identical to the title tag — use it as an opportunity
  to include a semantic variation or additional keyword

#### Heading Hierarchy (4 points)

Heading hierarchy serves two functions: it creates a scannable structure for users
and provides semantic content signals for search engines. Proper hierarchy is also
an accessibility requirement (WCAG 2.1).

- **4/4**: Logical H1→H2→H3 hierarchy, no skipped levels, descriptive headings
- **2/4**: Skipped levels (H1→H3) or non-descriptive headings
- **0/4**: Chaotic hierarchy, no subheadings, or headings used for styling

Checks:
- H2s present and cover major page sections (act as a table of contents)
- No heading levels skipped (H1 directly to H3 is wrong)
- Headings are descriptive content, not generic labels like "Section 1"
- Secondary keywords and semantic variations appear naturally in H2s
- H3s and below used for subsections within H2 topics

#### URL Structure (3 points)

URLs are a minor but measurable ranking signal and significantly affect CTR in SERPs.
A clean, readable URL is trusted and clicked more than a dynamic URL.

- **3/3**: Short, descriptive, hyphenated, includes keyword, no parameters
- **2/3**: Slightly long but clean, or missing keyword
- **1/3**: Has parameters, underscores, or stop words that should be removed
- **0/3**: Dynamic URL (`?id=12345`), very long, or completely non-descriptive

Best practices:
- Include the primary keyword: `/blog/best-crm-software/` not `/blog/post-147/`
- Use hyphens not underscores (Google treats underscores as word connectors)
- Remove stop words where they add length without clarity (the, a, in, of)
- Keep under 60 characters for full display in SERPs
- Avoid dates in URLs for evergreen content (creates maintenance burden)

---

### Category 2: Content Quality (30 points)

#### Word Count vs Page Type (6 points)

Word count alone is not a ranking factor — but pages below minimum thresholds
usually lack the depth needed to compete with more comprehensive pages.
Long pages are justified by comprehensiveness, not padding.

Minimum thresholds by page type:
| Page Type | Minimum | Target | Flag |
|-----------|---------|--------|------|
| Blog post / article | 800 words | 1,500+ | < 600 words = thin |
| Product page | 300 words | 800+ | < 200 words = thin |
| Service page | 500 words | 1,200+ | < 400 words = thin |
| Category/landing page | 300 words | 600+ | < 200 words = thin |
| Local page | 400 words | 900+ | < 300 words = thin |
| Homepage | 300 words | 700+ | < 200 words = thin |

Compare against the average word count of the top 3 ranking pages for the target
keyword — if they average 2,000 words and this page has 600, that's a content
depth deficit, not just a word count issue.

#### Keyword Usage (6 points)

Evaluate keyword presence and distribution, not just density. Google's algorithms
understand semantic relevance — topical coverage matters more than repetition.

- Primary keyword appears in: title, H1, first 100 words, and naturally throughout
- Keyword density: 1-3% (flag if <0.5% or >3%)
- Semantic variations: related terms and LSI keywords present (not just exact match)
- No keyword stuffing: keyword appears naturally in context, not forced
- Secondary keywords: present in H2s and supporting paragraphs
- Missing semantic signals: identify related terms competitors use that this page lacks

**Keyword placement checklist:**
- [ ] Primary keyword in title tag
- [ ] Primary keyword in H1
- [ ] Primary keyword in first 100 words of body content
- [ ] Primary keyword in at least one H2
- [ ] Primary keyword in meta description
- [ ] Primary keyword in at least one image alt text
- [ ] Secondary keywords in additional H2s
- [ ] Semantic variations distributed throughout body content

#### Content Depth & Comprehensiveness (8 points)

This is the highest-weighted content check because it reflects what Google actually
rewards: pages that comprehensively answer the user's query better than competing pages.

Compare this page against the top 3 ranking pages for the target keyword:
- Does this page cover all major subtopics those pages cover?
- Does this page add anything unique those pages don't have?
- Are there obvious questions the user might have that aren't answered?
- Is there supporting content: data, examples, case studies, visuals, lists?
- Does the page demonstrate first-hand experience or unique perspective?

Scoring:
- **8/8**: Comprehensive, covers all subtopics competitors cover, unique angles present
- **5/8**: Covers main topic but missing several subtopics competitors address
- **2/8**: Surface-level treatment, competitors are significantly more thorough
- **0/8**: Thin content, minimal value beyond the title

**What makes content genuinely comprehensive:**
- Answers the primary question directly and completely
- Addresses follow-up questions the user would naturally have
- Includes specific examples, data points, or case studies (not generic statements)
- Covers edge cases and nuanced scenarios
- Has a clear, unique angle that differentiated it from similar pages

#### Readability (4 points)

Readability affects dwell time, bounce rate, and scroll depth — all behavioral
signals that correlate with rankings. Dense walls of text cause abandonment.

- Flesch Reading Ease: aim for 60-70 for general audiences, 40-60 for technical B2B
- Average sentence length: under 20 words per sentence
- Paragraph length: 3-4 sentences max (web reading is scanning, not linear reading)
- Bullet points and numbered lists used where appropriate (especially for steps, options)
- No jargon without explanation (unless target audience is domain experts)
- Subheadings every 200-350 words to enable scanning

**Readability diagnosis:**
- If average sentence length exceeds 25 words → split long sentences
- If paragraphs exceed 5 lines → add line breaks
- If page has no subheadings → add H2/H3 structure every 200-350 words
- If jargon appears without definition → add inline explanations

#### E-E-A-T Signals (6 points)

Google's E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) is
most critical for YMYL (Your Money, Your Life) content: health, finance, legal, safety.
These pages face the highest quality bar in Google's quality rater guidelines.

| Signal | Check | Points |
|--------|-------|--------|
| **Experience** | First-hand experience markers (personal examples, specific data, "we tested", "in our experience") | 1.5 |
| **Expertise** | Author credentials visible, author bio linked, relevant qualifications stated | 1.5 |
| **Authoritativeness** | Cites authoritative external sources, references verifiable data, links to primary sources | 1.5 |
| **Trustworthiness** | Publication/update date visible, contact info accessible, privacy policy linked, no misleading claims | 1.5 |

**E-E-A-T improvement checklist:**
- [ ] Author name and bio on every content page
- [ ] Author's credentials or qualifications stated
- [ ] Publication date and last updated date visible
- [ ] At least 2-3 links to authoritative external sources
- [ ] Original data, research, or first-hand experience included
- [ ] Contact information accessible from this page or site-wide footer
- [ ] No unverifiable superlatives ("best in the world", "#1 solution") without evidence

---

### Category 3: Technical Page Elements (25 points)

#### Canonical Tag (6 points)

The canonical tag prevents duplicate content issues by explicitly telling Google
which URL is the "official" version of a page. Without it, Google may index the
wrong URL variant or split ranking signals across multiple URLs.

- **6/6**: Present, self-referencing (matches exact page URL including protocol/www/slash)
- **4/6**: Present but URL has minor inconsistency (www vs non-www)
- **2/6**: Points to a different URL without clear reason
- **0/6**: Missing entirely on a page that could have duplicates

Check for:
- Self-referencing canonical: `<link rel="canonical" href="https://exact-page-url.com/page/">`
- www vs non-www consistency with the rest of the site
- HTTP vs HTTPS (must be HTTPS)
- Trailing slash consistency
- No canonical pointing to a paginated or redirected URL

#### Meta Robots (4 points)

Meta robots controls whether Google indexes this page and follows its links.
A `noindex` on a page meant to rank is a critical error that blocks all rankings.

- **4/4**: `index, follow` (or no meta robots tag — defaults to index, follow)
- **2/4**: `noindex` or `nofollow` present — flag and ask if intentional
- **0/4**: `noindex` on a page that should rank = critical error requiring immediate fix

Also check:
- X-Robots-Tag HTTP header (can override meta robots — check both)
- robots.txt disallow rules for this URL
- If `noindex` is intentional (e.g., thank-you pages, admin pages) — confirm with user

#### Open Graph & Social Meta (4 points)

OG tags control how the page appears when shared on social media. They don't
affect rankings but affect referral traffic quality and brand perception on social.

Required OG tags: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`
Twitter: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`

- **4/4**: All required OG tags present with non-generic values and a properly sized image
- **2/4**: OG present but missing image, or image below 1200x630px, or generic values
- **0/4**: No OG tags (social shares will look unprofessional)

OG image requirements: minimum 1200x630px, under 1MB, JPEG or PNG preferred.

#### Page Speed Signals (6 points)

Core Web Vitals are confirmed ranking signals. INP replaced FID as a Core Web Vitals
metric in March 2024 — always use INP for current analysis.

These cannot be measured from HTML alone — provide estimates based on what's visible:

- **LCP risk**: Hero image without `fetchpriority="high"`, very large hero image (>350KB),
  or LCP image loaded via JavaScript
- **INP risk**: Large JavaScript bundles, third-party scripts loaded synchronously,
  event handlers on non-debounced inputs, heavy framework hydration
- **CLS risk**: Images without explicit dimensions, injected banners or cookie notices,
  web fonts without `font-display: swap`, ads with reserved space
- **Render-blocking resources**: `<link rel="stylesheet">` in `<body>`, synchronous
  `<script>` in `<head>` without `defer` or `async`

**Core Web Vitals thresholds (as of 2026):**
| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP (Largest Contentful Paint) | < 2.5s | 2.5-4.0s | > 4.0s |
| INP (Interaction to Next Paint) | < 200ms | 200-500ms | > 500ms |
| CLS (Cumulative Layout Shift) | < 0.1 | 0.1-0.25 | > 0.25 |

**Note on INP:** INP measures the worst interaction delay across the entire page visit
(clicks, taps, keyboard inputs). High INP is commonly caused by: long JavaScript
tasks (>50ms), large event handler callbacks, synchronous third-party scripts
(chat widgets, analytics, A/B testing tools).

#### Internal Links (3 points)

Internal links distribute PageRank (link equity) across the site and help Google
discover and understand the relationship between pages. Orphaned pages receive
no equity and are often ignored.

- At least 3-5 relevant internal links from this page to related content
- At least 1-2 other pages should link TO this page (not orphaned)
- Anchor text is descriptive and keyword-relevant, not "click here" or "read more"
- No broken internal links (404 responses)
- Links to deeper pages in the content topic cluster (not just homepage/navigation)

**Internal linking diagnosis:**
- If page links out to 10+ other pages but few pages link to it → it needs more inbound
  internal links from hub pages
- If all internal links use generic anchor text → update to descriptive anchors
- If no related content pages exist to link to → identify content gap, create those pages

#### External Links (2 points)

Linking to authoritative external sources signals credibility and supports E-E-A-T.
Pages that cite no external sources can appear thin or self-promotional.

- Links to authoritative external sources where claims are made (statistics, research, quotes)
- External links should go to genuinely authoritative domains (.gov, .edu, established
  publications, primary research sources)
- No links to low-authority, spammy, or irrelevant domains
- Appropriate use of `target="_blank"` (for UX context) and `rel="noopener noreferrer"`
- No excessive outbound linking that could be perceived as a link scheme

---

### Category 4: Schema Markup (10 points)

#### Detection & Validation (5 points)

Apply the full schema analysis from the seo-schema skill:
- Detect all schema types present on the page
- Validate required properties per type (missing required = no rich result)
- Check for deprecated types: HowTo (removed Sept 2023), FAQ (restricted Aug 2023)
- Check for JSON-LD format (preferred over Microdata or RDFa)
- Verify schema is in initial HTML, not JavaScript-injected (delayed processing risk)

#### Schema Opportunities (5 points)

Identify schema types missing that would benefit this specific page type:
- Blog post without Article schema → missed author/date display in SERPs
- Product page without Product+Offer schema → missed price/rating in SERPs
- Local business page without LocalBusiness schema → missed knowledge panel
- Recipe without Recipe schema → missed cooking time/rating rich result
- Software without SoftwareApplication schema → missed rating display
- Any page without BreadcrumbList → missed breadcrumb trail in SERPs (high CTR value)
- Any page without Organization schema (homepage) → weakened brand entity signals

Provide ready-to-use JSON-LD code blocks for every identified opportunity.

---

### Category 5: Images (10 points)

Apply abbreviated image checks per the seo-images skill:
- Alt text: present and descriptive on all non-decorative images (3 pts)
- File size: no images over 500KB; hero under 200KB (2 pts)
- Format: WebP/AVIF used (2 pts)
- Dimensions: width/height attributes set for CLS prevention (2 pts)
- LCP image: `fetchpriority="high"`, not lazy-loaded, in initial HTML (1 pt)

---

## Scoring Model

```
Overall Score: XX/100

On-Page SEO:     XX/25   [████████░░░░░░░░░░░░░░░░░]
Content Quality: XX/30   [██████████████████████░░░░]
Technical:       XX/25   [████████████░░░░░░░░░░░░░░]
Schema:          XX/10   [████████░░]
Images:          XX/10   [████████░░]
```

Score interpretation:
- 90-100: Excellent — minor polish only; competitive for top 3 positions
- 75-89: Good — targeted improvements needed; competitive for top 10
- 60-74: Fair — multiple gaps hurting rankings; likely outside top 20
- 45-59: Poor — significant work required; likely outside top 50
- Below 45: Critical — fundamental issues blocking rankings entirely

---

## Quick Win vs Long Game Framework

### Quick Wins (impact within 2-4 weeks):
- Fix `noindex` on pages meant to rank (immediate, once recrawled)
- Add `fetchpriority="high"` to LCP image (LCP improvement within days)
- Update title tag with keyword near the front (CTR improvement next crawl)
- Add missing alt text to images (Google Images indexing within weeks)
- Fix canonical tag inconsistencies (deduplication signal improvement)
- Remove `loading="lazy"` from hero image (LCP fix)

### Long Game (impact in 3-6+ months):
- Content depth expansion to match/exceed top-ranking competitors
- E-E-A-T signal building (author pages, external citations, original research)
- Internal link equity improvements (linking from hub pages to this page)
- Schema markup implementation (rich result eligibility takes 1-3 months)
- Core Web Vitals optimization (technical improvements compound over time)

---

## Output Format

### PAGE-ANALYSIS.md

#### 1. Page Score Card
Present the scoring table above with actual values and visual bars.

#### 2. Executive Summary (3-5 sentences)
State: what is working, what is the single biggest barrier to ranking, and what
is the highest-impact action to take this week. Be specific — name the exact
element and exact fix.

#### 3. Issues Found

Organize by priority tier:

**CRITICAL (fix immediately — blocking rankings):**
- Specific issue + specific location + specific fix + reason it blocks rankings

**HIGH (fix this week — direct ranking impact):**
- Specific issue with quantified impact where possible

**MEDIUM (fix this month — indirect impact):**
- Specific issue with context and timeline expectation

**LOW (backlog — marginal improvements):**
- Specific issue, justification for low priority

#### 4. Recommendations Table

| Priority | Element | Current State | Target State | Estimated Impact |
|----------|---------|--------------|-------------|-----------------|
| Critical | Title tag | "Home \| Company" | "Keyword-Rich Title \| Brand" | High CTR gain |
| High | Alt text | Missing on 3 images | Descriptive alt text | Google Images indexing |

#### 5. Schema Opportunities

Ready-to-use JSON-LD code blocks for any detected schema opportunities.
Each block must be copy-paste ready with placeholders clearly marked `[REPLACE: description]`.

#### 6. Quick Win Action Plan

Top 5 specific actions ranked by impact-to-effort ratio. Each action:
- Exact change to make (not vague advice)
- Where to make it (specific HTML element or file)
- Expected timeline for impact
- Effort estimate (minutes / hours / days)

#### 7. Competitive Gap Summary (if target keyword known)

"Pages ranking #1-3 for [keyword] typically have: [X, Y, Z]. This page
is missing: [A, B]. Closing these gaps is the primary path to the first page."
