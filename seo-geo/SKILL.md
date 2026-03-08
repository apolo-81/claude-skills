---
name: seo-geo
description: >
  GEO (Generative Engine Optimization) for AI search experiences. Triggers:
  "AI Overviews", "SGE", "GEO", "AI search", "Perplexity", "ChatGPT search",
  "AI citations", "LLM optimization", "AI visibility", "llms.txt",
  "Google AI Mode", "Bing AI", "Copilot search", "Claude search",
  "no aparezco en AI Overviews", "optimizar para búsqueda por IA",
  "AI search optimization", "zero-click AI results", "AI search traffic".
---

# AI Search / GEO Optimization (March 2026)

## What is GEO and Why It Matters

Generative Engine Optimization (GEO) is the discipline of optimizing content
to be cited, extracted, and featured by AI-powered search systems. Unlike
traditional SEO where ranking position is the goal, GEO success is measured
by citation frequency — whether your content is used as a source when AI
systems answer user questions.

In 2026, this matters because:
- AI Overviews now appear on 50%+ of all Google queries
- Google AI Mode (launched May 2025) delivers conversational results with
  zero organic blue links — AI citation is the only visibility mechanism
- AI-referred sessions grew 527% between January and May 2025
- Only 11% of domains are cited by both ChatGPT and Google AI Overviews for
  the same query — platform-specific strategies are required

## Key Statistics (2026)

| Metric | Value | Source |
|--------|-------|--------|
| AI Overviews reach | 1.5B users/month, 200+ countries | Google |
| AI Overviews query coverage | 50%+ of all Google queries | Industry data |
| AI-referred sessions growth | 527% (Jan–May 2025) | SparkToro |
| ChatGPT weekly active users | 900M+ | OpenAI |
| Perplexity monthly queries | 500M+ | Perplexity |
| Cross-platform citation overlap | 11% (ChatGPT + AIO for same query) | Industry research |
| AI Overview source pages | 92% from top-10 ranked pages | Industry data |
| Non-position-5 AIO citations | 47% of AIO citations from ranks 6–10+ | Industry data |

## Critical Insight: Brand Mentions > Backlinks for AI Visibility

**Brand mentions correlate 3x more strongly with AI visibility than backlinks.**
(Ahrefs December 2025 study, 75,000 brands)

| Signal | Correlation with AI Citations | Platform |
|--------|------------------------------|---------|
| YouTube mentions | ~0.737 (strongest signal) | All platforms |
| Reddit mentions | High | ChatGPT, Perplexity |
| Wikipedia presence | High | ChatGPT, Perplexity, Claude |
| LinkedIn presence | Moderate | Professional queries |
| Domain Rating (backlinks) | ~0.266 (weak) | Google AIO primarily |

Implication: traditional link building is less effective for AI visibility than
building brand presence across community platforms and reference sites.

---

## GEO Analysis Criteria

### 1. Passage-Level Citability Score (25%)

AI systems extract specific passages from pages, not entire documents. A page can
rank well in traditional search but have poor AI citability if its passages are
not self-contained and directly answerable.

**Optimal passage structure:**
- **Length**: 134–167 words per self-contained answer block
  - Shorter: lacks context for attribution
  - Longer: harder for AI to extract cleanly
- **Direct answer first**: the key claim or answer appears in the first 2 sentences
- **Self-contained**: the passage makes sense without reading surrounding content
- **Specific facts**: contains statistics, named entities, dates, percentages
- **Attribution**: claims linked to named sources in the same passage

**Passage evaluation rubric (score each passage 1–5):**

| Dimension | 5 (Excellent) | 3 (Adequate) | 1 (Poor) |
|-----------|--------------|--------------|---------|
| Self-contained | Fully understandable standalone | Needs minor context | Requires full page context |
| Direct answer | Answer in first sentence | Answer in first paragraph | Answer buried or absent |
| Specificity | Named entities, numbers, dates | Some specific details | All generic statements |
| Attribution | Named source in same passage | Linked source nearby | No attribution |
| Quotability | One clean extractable sentence | Somewhat extractable | Not extractable |

Passages scoring 4+ across all dimensions are high-citability passages.
Flag anything below 3 on "self-contained" or "direct answer" for revision.

**Pattern templates that AI systems cite well:**
- Definition: "X is [precise definition]. [Qualifying detail]. [Example]."
- Statistic: "According to [source], [specific finding with number]."
- Process: Numbered list with each step containing a single action
- Comparison: Table with named items, named metrics, and specific values

**Weak passage patterns (AI avoids citing these):**
- Vague generalizations ("It depends on many factors...")
- Buried conclusions ("...and therefore, when considering all of the above...")
- Opinion without evidence ("Many experts believe...")
- Excessive hedging without substance

### 2. Structural Readability (20%)

Structure is how AI systems parse and navigate your content. Poorly structured
content is harder to extract from, even when the underlying information is good.

**92% of AI Overview citations come from top-10 ranking pages**, but
**47% come from pages ranking below position 5** — showing that structural quality
can secure AI citations even for pages not dominating traditional SERPs.

**Strong structural signals:**
- Clean H1 → H2 → H3 heading hierarchy (no skipped levels)
- Question-based headings that mirror how users query AI ("What is...?", "How do I...?")
- Short paragraphs (2–4 sentences) — AI extracts paragraph-level content
- Tables for comparative data (AI systems extract tabular data accurately)
- Ordered lists for sequences and processes
- Unordered lists for multi-item content without sequence
- FAQ sections with clear Q&A format (plain HTML, not necessarily schema)

**Weak structural signals:**
- Wall-of-text paragraphs without subheadings
- Inconsistent heading levels (H2 → H4 with no H3)
- Key information buried mid-paragraph
- No lists or tables for content that would benefit from them

### 3. Multi-Modal Content (15%)

Content with multi-modal elements shows **156% higher selection rates** in AI citations.

**Check for:**
- Text + relevant original images (screenshots, diagrams, photos)
- Video content (embedded YouTube, Vimeo) with text transcripts or summaries
- Original infographics and charts (AI systems reference them; users share them)
- Interactive tools (calculators, quizzes) — drive brand mentions and links
- Structured data supporting media (ImageObject, VideoObject schema)

For AI citation: text must accompany all media. AI systems primarily process
text — media signals effort and authority but the citation comes from text.

### 4. Authority & Brand Signals (20%)

**Strong authority signals:**
- Author byline with verifiable credentials (full name, title, publication)
- Publication date AND last-updated date in visible text and schema
- Citations to primary sources (studies, official documentation, government data)
- Organization credentials, certifications, and affiliations stated explicitly
- Expert quotes with full attribution (name, title, organization)
- Entity presence: Wikipedia article, Wikidata entry, Google Knowledge Panel
- Active community presence: Reddit (posts, comments, AMAs), YouTube channel
- LinkedIn company page and author profiles

**Weak authority signals:**
- Anonymous or pseudonymous authorship
- No dates on time-sensitive content
- No sources cited for factual claims
- No brand presence on Wikipedia, Reddit, or YouTube
- No Google Knowledge Panel for brand or key people

### 5. Technical Accessibility (20%)

**AI crawlers do NOT execute JavaScript.** Content requiring JS execution is
invisible to AI crawlers — server-side rendering is not optional for AI visibility.

**Check for:**
- Server-side rendering (SSR) or static generation for all key content
- AI crawler access in robots.txt (see AI Crawler section below)
- llms.txt file presence, structure, and completeness
- RSL 1.0 licensing terms for AI use
- Content accessible without login, paywall, or cookies

---

## AI Crawler Detection & Configuration

Check `robots.txt` for AI crawler permissions. Default recommendation:
allow search-facing crawlers, evaluate training crawlers per your IP policy.

| Crawler | Owner | Purpose | Recommendation |
|---------|-------|---------|---------------|
| GPTBot | OpenAI | ChatGPT model training | Allow for brand training data; block if IP concern |
| OAI-SearchBot | OpenAI | ChatGPT web search index | Allow — drives ChatGPT citation |
| ChatGPT-User | OpenAI | ChatGPT real-time browsing | Allow — drives ChatGPT citation |
| ClaudeBot | Anthropic | Claude web features + training | Allow — drives Claude citation |
| anthropic-ai | Anthropic | Anthropic training | Allow or block per IP policy |
| PerplexityBot | Perplexity | Perplexity search index | Allow — drives Perplexity citation |
| CCBot | Common Crawl | Open training dataset | Block if IP concern |
| Bytespider | ByteDance | TikTok/Douyin AI | Block unless targeting TikTok markets |
| cohere-ai | Cohere | Cohere model training | Block if IP concern |
| Google-Extended | Google | Gemini AI training only | Block does NOT affect Google Search |

**Recommended robots.txt configuration for maximum AI visibility:**
```
# Allow all search-facing AI crawlers
User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

# Block training-only crawlers (optional — based on IP policy)
User-agent: CCBot
Disallow: /

User-agent: GPTBot
Disallow: /

# Never block Googlebot
User-agent: Googlebot
Allow: /

User-agent: *
Allow: /
```

---

## llms.txt Standard

The **llms.txt** standard (proposed by Jeremy Howard, 2024) gives AI systems a
curated, machine-readable guide to site content — analogous to robots.txt for
crawlers but optimized for LLM context windows.

**Why it matters in 2026:** As AI systems increasingly use retrieval-augmented
generation (RAG), having a structured llms.txt helps AI assistants surface the
most relevant content from your site and attribute it correctly.

**Location:** `/llms.txt` at the domain root (e.g., `https://example.com/llms.txt`)

**Full format specification:**
```markdown
# [Site Name]
> [One-sentence description of what the site is and who it serves]

## [Main Content Section]
- [Page Title](https://example.com/page): [One-sentence description of what this page covers and why it is valuable]
- [Another Page](https://example.com/page2): [Description]

## [Products / Services]
- [Product Name](https://example.com/product): [Description]

## [About / Authority]
- [About Us](https://example.com/about): [Company background, credentials, founding year]
- [Author Name](https://example.com/author/name): [Author credentials, expertise areas]

## Optional: Key Facts
- Founded: [Year]
- Headquarters: [Location]
- Specialization: [Topic areas]
- Contact: [email or contact page URL]
```

**Evaluation checklist:**
- [ ] `/llms.txt` present and accessible (HTTP 200)
- [ ] Clear site description in opening block
- [ ] All high-value pages listed with descriptive summaries
- [ ] Author/team credentials included in About section
- [ ] Key factual information (founding date, location, specialization)
- [ ] No broken URLs in llms.txt
- [ ] Updated within last 6 months

**Advanced:** For large sites, also consider `/llms-full.txt` containing expanded
content summaries (500+ words per page) for AI systems with larger context windows.

---

## RSL 1.0 (Really Simple Licensing)

RSL 1.0 is a machine-readable standard for stating AI content licensing terms,
launched December 2025.

**Backed by:** Reddit, Yahoo, Medium, Quora, Cloudflare, Akamai, Creative Commons

**Implementation:** A `<link rel="license">` header or `/.well-known/rsl.json` file
declaring whether and how AI systems can use your content for training and search.

**Why it matters:** As AI licensing becomes legally significant (EU AI Act, US
Copyright Office rulings), having explicit RSL terms protects your content rights
while enabling authorized AI use.

**Check for:**
- RSL implementation via HTTP header or `.well-known/rsl.json`
- Appropriate licensing terms: Allow (free to use), Restrict (no training),
  or License (usage requires agreement/payment)

---

## Platform-Specific Optimization

Each AI search platform has distinct citation behavior and source preferences.
Platform-specific optimization requires separate strategies.

### Google AI Overviews & AI Mode

**Citation behavior:**
- 92% of citations from top-10 ranking pages — traditional SEO remains foundational
- Prefers well-structured, passage-level content with clear answer formatting
- Favors content with Schema markup (Article, FAQ, HowTo — for healthcare/gov)
- AI Mode (launched May 2025) delivers zero organic links — only AI citations

**Optimization focus:**
- Maintain traditional SEO (page must rank top-10 first)
- Add question-based headings that mirror search queries
- Use definition patterns ("X is...") in key sections
- Implement Article and Organization schema
- Ensure content is available in raw HTML (no JS rendering requirement)

### ChatGPT Web Search

**Citation behavior:**
- Indexes Wikipedia (47.9% of citations), Reddit (11.3%), news sources
- Prefers content with explicit author credentials and publication dates
- Favors content from domains with established brand presence
- Real-time browsing (ChatGPT-User bot) — fresh content gets picked up quickly
- Less dependent on traditional ranking than Google AIO

**Optimization focus:**
- Build Wikipedia presence for brand and key topics
- Publish on Reddit (authentic community participation, not spam)
- Ensure OAI-SearchBot and ChatGPT-User are allowed in robots.txt
- Add explicit publication and last-updated dates
- Author bylines with credentials and professional profiles

### Perplexity

**Citation behavior:**
- Reddit (46.7% of citations), Wikipedia as primary sources
- Prefers community-validated content and expert-authored articles
- Strong preference for content with clear source citations
- Fast indexing — new content often cited within days
- Particularly strong for research queries and technical topics

**Optimization focus:**
- Build authentic Reddit presence in relevant subreddits
- Cite primary sources prominently throughout content
- Use academic/research citation formats for data claims
- Allow PerplexityBot in robots.txt
- Publish original research or data studies — Perplexity cites unique data heavily

### Claude (Anthropic)

**Citation behavior:**
- Prefers authoritative primary sources and well-structured reference content
- Strong preference for content with explicit factual attribution
- Favors structured data and entity clarity (clear Organization/Person schema)
- Values content accuracy over freshness for non-time-sensitive topics
- Wikipedia and institutional domains (.gov, .edu) highly trusted

**Optimization focus:**
- Focus on factual accuracy and clear attribution in every claim
- Implement Organization and Person schema with sameAs links to Wikipedia/LinkedIn
- Write in clear, direct prose — avoid hedging and vague qualifiers
- Allow ClaudeBot and anthropic-ai in robots.txt
- Build Wikipedia presence for brand credibility

### Bing Copilot (Microsoft)

**Citation behavior:**
- Primarily indexes from Bing search index — Bing SEO is the prerequisite
- Prefers authoritative news and institutional sources
- Benefits from IndexNow protocol for fast indexing
- Bing Webmaster Tools submission accelerates discovery

**Optimization focus:**
- Submit sitemap to Bing Webmaster Tools
- Implement IndexNow for instant notification on content updates
- Ensure Bing can crawl and index the site (Bingbot not blocked)
- Optimize Bing-specific metadata (Open Graph tags, structured data)

---

## Output

Generate `GEO-ANALYSIS.md` with the following structure:

### 1. GEO Readiness Score: XX/100

Breakdown:
- Citability: XX/25
- Structural Readability: XX/20
- Authority & Brand Signals: XX/20
- Technical Accessibility: XX/20
- Multi-Modal Content: XX/15

### 2. Platform Scores

| Platform | Score | Top Gap | Priority Action |
|----------|-------|---------|----------------|
| Google AI Overviews | XX/100 | [gap] | [action] |
| ChatGPT | XX/100 | [gap] | [action] |
| Perplexity | XX/100 | [gap] | [action] |
| Claude | XX/100 | [gap] | [action] |
| Bing Copilot | XX/100 | [gap] | [action] |

### 3. AI Crawler Access Status

For each known crawler: Allowed / Blocked / Not specified in robots.txt

### 4. llms.txt Status

Present / Missing / Incomplete — with specific recommendations

### 5. Brand Mention Analysis

Presence on: Wikipedia / Reddit / YouTube / LinkedIn / Wikidata / Google Knowledge Panel

### 6. Passage-Level Citability Analysis

Identify 3 highest-citability passages and 3 lowest-citability passages with
specific rewrite recommendations for the low-scoring ones.

### 7. Server-Side Rendering Check

Is key content available in raw HTML? What content requires JS execution?

### 8. RSL 1.0 Status

Present / Missing — with implementation recommendation

### 9. Top 5 Highest-Impact Actions

Ordered by expected impact on AI citation rate, with effort estimate.

### 10. Specific Content Reformatting Suggestions

Identify specific sections, paragraphs, or headings that can be reformatted
for higher AI citability, with before/after examples where possible.

---

## Quick Wins (Low Effort, High Impact)

1. Add "What is [topic]?" definition in first 60 words of relevant sections
2. Restructure key sections to 134–167 word self-contained answer blocks
3. Convert narrative headings to question-based H2/H3 headings
4. Add specific statistics with named sources (not "studies show...")
5. Add visible publication and last-updated dates to all content
6. Implement Person schema with sameAs links for all authors
7. Allow OAI-SearchBot, PerplexityBot, ClaudeBot in robots.txt

## Medium Effort (1–2 weeks)

1. Create `/llms.txt` with structured site map and key facts
2. Write detailed author bios with credentials + Wikipedia/LinkedIn links
3. Audit all pages for SSR — ensure zero key content requires JS execution
4. Build Reddit presence in 2–3 relevant subreddits (authentic participation)
5. Add comparison tables with specific, named data points
6. Restructure FAQ sections with direct answer-first format
7. Implement RSL 1.0 licensing terms

## High Impact (1–3 months)

1. Create original research or surveys with unique data (most citable content type)
2. Build Wikipedia presence for brand and key personnel
3. Establish YouTube channel with transcript-heavy content
4. Implement comprehensive entity linking (sameAs: Wikipedia, LinkedIn, Wikidata)
5. Develop unique tools, calculators, or interactive resources
6. Submit brand to Wikidata for structured entity recognition
7. Develop content cluster strategy focused on topical authority
