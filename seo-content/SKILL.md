---
name: seo-content
description: >
  Content quality, E-E-A-T analysis, AI citation readiness. Triggers:
  "content quality", "E-E-A-T", "content audit", "thin content",
  "duplicate content", "content analysis", "Helpful Content", "content score",
  "topical authority", "pillar pages", "content clusters", "readability",
  "keyword density", "content depth", "AI content detection",
  "improve my blog SEO", "author authority", "expertise signals",
  "internal linking strategy", "people-first content".
---

# Content Quality & E-E-A-T Analysis

## Purpose

Content quality analysis determines whether your pages satisfy user intent with
sufficient expertise, experience, authority, and trust. Since the March 2024 core
update merged the Helpful Content System into the core ranking algorithm, helpfulness
and E-E-A-T signals are evaluated continuously — not just during dedicated HCU updates.

## E-E-A-T Framework (December 2025 QRG Update)

Read `seo/references/eeat-framework.md` for full evaluation criteria.

**Critical 2025-2026 update:** The December 2025 Quality Rater Guidelines update
extended rigorous E-E-A-T evaluation to **all competitive queries** — not just
YMYL (Your Money Your Life) topics like health, finance, and safety. Any page
competing in a crowded SERP (home improvement, software reviews, travel, B2B SaaS,
recipes) is now assessed for E-E-A-T signals. This means E-E-A-T is no longer
optional for non-YMYL sites.

### Experience (first-hand signals)

Google values content demonstrating the author has direct personal experience with
the topic. This is difficult to fake and signals genuine human expertise.

**Strong signals:**
- Original research, surveys, proprietary data, case studies with real numbers
- Before/after documentation with specific metrics
- Personal anecdotes with concrete details (dates, names, outcomes)
- Process documentation from direct involvement
- Photos, screenshots, or videos from actual use/experience
- User-generated content showing community experience

**Weak signals:**
- Generic advice not grounded in specific experience
- No personal perspective on the topic
- Content that could have been written without touching the subject matter

### Expertise

Expertise signals that the content creator has the knowledge required to produce
accurate, nuanced coverage of the topic.

**Strong signals:**
- Author bio with verifiable credentials (certifications, degrees, job titles)
- Professional background directly relevant to the topic
- Technical depth appropriate for the target audience (not oversimplified)
- Accurate, well-sourced claims with citations to primary sources
- Demonstrates awareness of edge cases, limitations, and nuance
- Content reviewed or co-authored by a named expert

**Weak signals:**
- No author attribution
- Author bio absent or not topic-relevant
- Factual inaccuracies or outdated information
- Oversimplified treatment of complex topics

### Authoritativeness

Authoritativeness is reputation-based — it comes from external recognition by
others in the field, not self-claims. It is the hardest E-E-A-T pillar to build.

**Strong signals:**
- Backlinks from authoritative industry publications and educational institutions
- Brand mentions in respected outlets (press coverage, journalist citations)
- Content cited or referenced by other recognized experts
- Published in or contributed to recognized industry publications
- Awards, certifications, or industry recognition
- Wikipedia article about the brand or key people

**Weak signals:**
- No external mentions or backlinks from relevant domains
- Self-referential authority claims without external validation
- Anonymous brand with no digital footprint

### Trustworthiness

Trustworthiness is the most important E-E-A-T dimension for Google's quality raters.
A page can have experience and expertise but still fail on trust if basic signals
are missing.

**Strong signals:**
- Clear contact information (email, phone, physical address for applicable businesses)
- Privacy policy and terms of service linked from footer
- Customer reviews and testimonials (with platform verification where possible)
- Visible publication and last-updated dates
- Transparent corrections policy and visible update history
- Secure site enforcing HTTPS
- Authorship transparency (real names, not "Admin" or "Staff Writer")
- Money-back guarantees or return policies (e-commerce)

**Weak signals:**
- No contact information
- No privacy policy or outdated policy
- No reviews or testimonials
- Anonymous authorship
- Content without dates

## Content Metrics

### Word Count Analysis

These are **topical coverage floors**, not targets. Google has confirmed word count
is NOT a direct ranking factor — comprehensive topical coverage matters, not
hitting an arbitrary word count. A 600-word page that fully answers a specific
question outranks a 3,000-word page stuffed with tangential content.

Use these minimums as a signal that a page likely lacks sufficient depth:

| Page Type | Minimum to investigate | Notes |
|-----------|----------------------|-------|
| Homepage | 500 words | Key value prop and service summary |
| Service page | 800 words | Problem, solution, proof, CTA |
| Blog post | 1,500 words | Comprehensive topical coverage |
| Product page | 300–400 words | Description + specs + reviews |
| Location page | 500–600 words | Must be >60% unique vs other location pages |
| FAQ page | 200+ words per answer | Each answer self-contained |

When a page is below minimum, flag for content depth review — do not prescribe
adding words without purpose.

### Readability

Target Flesch Reading Ease 60–70 for general audiences; adjust for technical
or professional audiences (lower score = more technical).

**Important clarification:** Readability scores are NOT direct Google ranking factors.
John Mueller has confirmed Google does not use Flesch or similar scores for ranking.
Use readability as a content quality proxy, not as an optimization target. Yoast
deprioritized Flesch scoring in v19.3 for this reason.

- Grade level: match target audience (6th–8th grade for general public, higher for B2B)
- Sentence length: average 15–20 words
- Paragraph length: 2–4 sentences (shorter for mobile-first audiences)

### Keyword Optimization

- Primary keyword present in title, H1, and first 100 words — signals topic clarity
  to Google without requiring mechanical repetition
- Natural keyword density (1–3%) — anything higher risks keyword stuffing detection
- Semantic variations and related terms present (NLP-friendly coverage)
- No keyword stuffing: repetitive exact-match phrases harm both UX and rankings

### Content Structure

Structure helps both users and search engine parsers extract information.
AI systems in particular rely on clear heading structure for passage extraction.

- Logical heading hierarchy (H1 — one per page, H2 for main sections, H3 for subsections)
- Scannable sections with descriptive, benefit-oriented headings
- Bullet and numbered lists where content is sequential or comparative
- Table of contents for content exceeding 2,000 words
- Answer-first formatting: lead with the direct answer, then explain (inverted pyramid)

### Multimedia

Rich media signals effort, experience, and utility — all positive E-E-A-T signals.
- Relevant original images (screenshots, photos from experience) with descriptive alt text
- Videos where the format is superior to text (tutorials, demonstrations)
- Infographics for complex processes or comparative data
- Charts and graphs citing data sources (original data strongly preferred)

### Internal Linking

Internal links distribute PageRank, help crawlers discover content, and improve
user navigation. Each link should be editorially justified.

- 3–5 relevant internal links per 1,000 words (scale with content length)
- Descriptive, topical anchor text (avoid "click here", "learn more")
- Link to related content and pillar pages within the same content cluster
- No orphan pages — every page reachable via internal links within 3 clicks

### External Linking

Citing external sources demonstrates E-E-A-T (you are validating claims against
authoritative sources) and is a trust signal for both users and quality raters.

- Cite primary sources: academic studies, official documentation, government data
- Prefer linking to original research rather than secondary summaries
- Open external links in new tab for UX
- Reasonable count — quality over quantity; avoid link farms

## AI Content Assessment (2026 Update)

Google's quality raters formally assess AI-generated content quality since the
September 2025 QRG update. The question is not "is this AI-generated?" but
"does this demonstrate genuine E-E-A-T regardless of how it was produced?"

### Acceptable AI Content

AI-assisted content that ranks well consistently demonstrates:
- Genuine E-E-A-T signals (even if AI-assisted in drafting)
- Unique value not replicated elsewhere (original data, analysis, perspective)
- Human oversight, editing, and fact-checking (detectable through accuracy)
- Specific, concrete examples rather than generic advice
- Clear author attribution with verifiable credentials

### Low-Quality AI Content Markers (ranking risk)

Raters flag these patterns regardless of whether content is AI-generated:
- Generic phrasing with no specific details ("It's important to...", "There are many...")
- No original insight — content that could have been written by anyone with a Google search
- Repetitive structure across multiple pages (programmatic AI content at scale)
- No author attribution or anonymous authorship
- Factual inaccuracies, especially on YMYL topics
- Excessive hedging without substance ("it depends", "it varies")
- No publication or update dates on time-sensitive content

**AI Content Detection note:** Google has stated it focuses on content quality,
not AI detection. However, at scale (100+ similar pages), patterns become detectable.
For programmatic content, ensure each page has sufficient unique signals.

> **Helpful Content System (March 2024):** The HCS was merged into Google's core
> ranking algorithm during the March 2024 core update. It no longer operates as a
> standalone classifier. Helpfulness signals are now weighted within every core
> update — enforcement is continuous.

## AI Citation Readiness (GEO Signals)

Optimize content to be cited by AI Overviews, ChatGPT, Perplexity, Claude, and
Bing Copilot. AI systems extract and cite specific passages, not entire pages —
passage-level optimization is key.

### Passage-Level Citability

The optimal citability zone is **134–167 words per self-contained answer block**.
Shorter passages lack sufficient context; longer passages are harder for AI to
extract cleanly.

**For each key section, evaluate:**

| Signal | Score (1-5) | Description |
|--------|-------------|-------------|
| Self-contained | — | Can this passage be understood without reading the rest? |
| Direct answer | — | Does the answer appear in the first 2 sentences? |
| Specific facts | — | Does it contain statistics, dates, proper nouns, numbers? |
| Attribution | — | Are claims linked to named sources? |
| Quotable sentence | — | Is there one sentence that cleanly states the key point? |

A passage scoring 4+ on all signals is highly citable. Flag passages scoring
below 3 on "direct answer" or "self-contained" for rewriting.

### Structural Signals for AI Citation

- Clear question-based H2/H3 headings (e.g., "What is X?" "How does Y work?")
- Definition patterns: "X is..." or "X refers to..." in first sentence of section
- Tables for comparative data — AI systems extract tables well
- Numbered lists for step-by-step processes
- FAQ sections with clear Q&A format (not schema — just structure)
- Statistic + source attribution in same sentence ("X% of Y, according to Z")

### Platform-Specific Citation Signals

Different AI systems have different citation preferences:

| Platform | Prioritizes | Secondary signals |
|----------|------------|------------------|
| Google AI Overviews | Top-10 ranking pages, passage relevance | Schema markup, structured content |
| ChatGPT (web search) | Wikipedia, authoritative sources, freshness | Entity mentions, structured data |
| Perplexity | Reddit, Wikipedia, recent news | Community validation, original research |
| Claude (Anthropic) | Authoritative sources, specific facts | Clear attribution, primary sources |
| Bing Copilot | Bing index, news sources | IndexNow, Bing Webmaster Tools |

### GEO Readiness Score (subset of AI Citation Readiness)

Evaluate across 5 dimensions:
1. Citability (passage quality) — 25%
2. Structural readability (heading hierarchy, lists, tables) — 20%
3. Authority signals (author credentials, citations, dates) — 20%
4. Technical accessibility (SSR, AI crawler access, llms.txt) — 20%
5. Brand presence (Wikipedia, Reddit, YouTube mentions) — 15%

Cross-reference `seo-geo` skill for the full GEO workflow.

## Content Freshness

Google's Query Deserves Freshness (QDF) algorithm boosts fresh content for
rapidly evolving topics. Outdated content on fast-moving topics loses rankings.

- Publication date visible in article header (ISO 8601 format in structured data)
- Last updated date displayed if content has been substantively revised
- Flag content older than 12 months without updates for fast-changing topics:
  technology, AI/ML, healthcare guidelines, financial regulations, news
- For evergreen content (how-to guides, definitions), freshness is less critical
  but annual review is still recommended

## Output

### Content Quality Score: XX/100

### E-E-A-T Breakdown

| Factor | Score | Key Signals Present | Missing |
|--------|-------|--------------------|---------|
| Experience | XX/25 | [signals found] | [gaps] |
| Expertise | XX/25 | [signals found] | [gaps] |
| Authoritativeness | XX/25 | [signals found] | [gaps] |
| Trustworthiness | XX/25 | [signals found] | [gaps] |

### AI Citation Readiness: XX/100

| Dimension | Score | Top Recommendation |
|-----------|-------|--------------------|
| Passage citability | XX/25 | [specific action] |
| Structural readability | XX/20 | [specific action] |
| Authority signals | XX/20 | [specific action] |
| Technical accessibility | XX/20 | [specific action] |
| Brand presence | XX/15 | [specific action] |

### Issues Found

List all issues with severity: Critical / High / Medium / Low

### Recommendations

Ordered by expected impact. Each recommendation includes:
- What to change
- Why it matters (which signal it improves)
- Effort estimate (Low / Medium / High)
