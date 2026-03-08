# Content SEO Frameworks Reference

## On-Page SEO Checklist — Full Criteria

### Title Tag Criteria

| Criteria | Best Practice | Check |
|---|---|---|
| Exists | Every page must have a unique title tag | Pass/Fail |
| Length | 50-60 characters (displays fully in SERPs) | Pass/Needs Work/Fail |
| Primary keyword | Contains the primary target keyword | Pass/Needs Work/Fail |
| Keyword position | Primary keyword appears near the beginning | Pass/Needs Work/Fail |
| Brand name | Includes brand name (typically at the end, separated by pipe or dash) | Pass/Needs Work/Fail |
| Uniqueness | Different from all other pages on the site | Pass/Fail |
| Compelling | Would a searcher want to click this? | Pass/Needs Work/Fail |

**Common title tag mistakes:**
- Too long (truncated in search results at ~600px, roughly 55-60 characters)
- Missing primary keyword
- Keyword stuffing ("Best SEO Tool | Top SEO Tool | SEO Software | SEO Platform")
- Using the same title across multiple pages (duplicate title penalty)
- Generic titles ("Home", "Welcome", "Page 1", "Untitled")
- Missing brand name on non-homepage pages

**Title tag formula that works:**
```
[Primary Keyword — Action/Benefit] | [Brand Name]

Examples:
"Content SEO Audit: Rank Higher in 30 Days | MarketPro"
"Email Marketing for E-commerce Stores | Klaviyo"
"How to Run Facebook Ads That Actually Convert | [Agency]"
```

---

### Meta Description Criteria

| Criteria | Best Practice | Check |
|---|---|---|
| Exists | Every page should have a meta description | Pass/Fail |
| Length | 150-160 characters | Pass/Needs Work/Fail |
| Primary keyword | Naturally includes the target keyword | Pass/Needs Work/Fail |
| Call to action | Includes a reason to click | Pass/Needs Work/Fail |
| Unique | Different from all other pages | Pass/Fail |
| Compelling | Acts as ad copy for the search result | Pass/Needs Work/Fail |
| Specificity | Contains specific numbers, details, or benefits | Pass/Needs Work/Fail |

**Meta description formula:**
```
[What the page covers] + [Specific benefit or differentiator] + [CTA]

Examples:
"Learn how to run a complete content SEO audit in 4 steps. Includes a checklist, scoring rubric, and real examples. Download the free template."
"Compare the top 10 email marketing platforms for e-commerce. See pricing, features, and real user reviews to find the best fit for your store."
```

---

### Heading Hierarchy Criteria

| Criteria | Best Practice | Check |
|---|---|---|
| H1 exists | Exactly one H1 per page | Pass/Fail |
| H1 contains keyword | Primary keyword appears in the H1 | Pass/Needs Work/Fail |
| H1 differs from title | H1 and title tag are related but not identical | Pass/Needs Work/Fail |
| Logical hierarchy | H2 under H1, H3 under H2 (no skipping levels) | Pass/Needs Work/Fail |
| Descriptive subheadings | H2s and H3s clearly describe what follows | Pass/Needs Work/Fail |
| Keywords in subheadings | Secondary keywords appear naturally in H2s/H3s | Pass/Needs Work/Fail |
| Not overused | Headers used for structure, not to style decorative text | Pass/Needs Work/Fail |

**Heading structure template:**
```
H1: [Primary Keyword + Main Topic]
  H2: [Subtopic 1 — secondary keyword or related phrase]
    H3: [Sub-subtopic — more specific]
    H3: [Sub-subtopic]
  H2: [Subtopic 2]
    H3: [Sub-subtopic]
  H2: [Subtopic 3 — often a "how to" or FAQ section]
  H2: [Conclusion or Next Steps]
```

---

### Image Optimization Criteria

| Criteria | Best Practice | Check |
|---|---|---|
| Alt text present | Every image has a descriptive alt text | Pass/Needs Work/Fail |
| Alt text quality | Describes the image and includes keywords naturally | Pass/Needs Work/Fail |
| File names | Descriptive filenames (not IMG_001.jpg, not photo.png) | Pass/Needs Work/Fail |
| File size | Optimized for web (WebP preferred, compressed) | Pass/Needs Work/Fail |
| Lazy loading | Below-fold images use `loading="lazy"` | Pass/Needs Work/Fail |
| Responsive images | Uses `srcset` or `<picture>` element for different sizes | Pass/Needs Work/Fail |
| Decorative images | Decorative images have `alt=""` (not missing alt) | Pass/Needs Work/Fail |

**Alt text writing guide:**
```
Bad:  alt="image1"
Bad:  alt="photo"
Bad:  alt="keyword keyword keyword SEO text"
Good: alt="Marketing funnel diagram showing the 5 stages from awareness to loyalty"
Good: alt="Screenshot of Google Analytics dashboard showing 42% increase in organic traffic"

For decorative images: alt=""
For logos: alt="[Brand Name] logo"
```

**File size benchmarks:**
- Hero images: under 200KB (ideally under 100KB)
- Blog images: under 100KB
- Icons and small graphics: under 20KB
- Use WebP format: 25-35% smaller than JPEG at equivalent quality

---

### Internal Linking Criteria

| Criteria | Best Practice | Check |
|---|---|---|
| Internal links present | Page links to other relevant pages on the site | Pass/Needs Work/Fail |
| Anchor text | Descriptive anchor text (not "click here", "read more") | Pass/Needs Work/Fail |
| Deep linking | Links go to specific relevant pages, not just homepage | Pass/Needs Work/Fail |
| Relevant context | Links are contextually relevant to surrounding content | Pass/Needs Work/Fail |
| Reasonable count | 3-10 internal links per 1,000 words | Pass/Needs Work/Fail |
| Broken links | No broken internal links (404s) | Pass/Fail |

**Internal linking strategy by page type:**
- **Homepage:** Link to top service/product pages, top blog posts, contact
- **Blog posts:** Link to 3-5 related posts + 1-2 conversion pages (product/service relevant to the topic)
- **Service pages:** Link to relevant blog posts (educate) + related services + case studies
- **Product pages:** Link to related products + reviews + relevant guides

---

### URL Structure Criteria

| Criteria | Best Practice | Check |
|---|---|---|
| Readable | URL is human-readable and descriptive | Pass/Needs Work/Fail |
| Keywords | URL contains relevant keywords | Pass/Needs Work/Fail |
| Length | Under 75 characters (ideally under 60) | Pass/Needs Work/Fail |
| Hyphens | Words separated by hyphens (not underscores) | Pass/Fail |
| Lowercase | All lowercase characters | Pass/Fail |
| No parameters | Clean URLs without unnecessary `?id=123&ref=456` | Pass/Needs Work/Fail |
| Trailing slashes | Consistent use (always or never) | Pass/Needs Work/Fail |

---

## Schema Markup Reference Table

| Schema Type | Applicable To | Key Properties | Implementation Priority |
|---|---|---|---|
| `Organization` | Homepage, About page | name, url, logo, contactPoint, sameAs (social profiles) | High — every site |
| `LocalBusiness` | Local businesses | name, address, phone, hours, geo | Critical for local |
| `Product` | Product pages | name, description, price, availability, aggregateRating | Critical for e-commerce |
| `Article` | Blog posts, news | headline, author, datePublished, image | High for content sites |
| `FAQ` | FAQ sections, FAQ-style content | mainEntity (Question + acceptedAnswer) | High — rich result eligible |
| `HowTo` | Tutorial content | name, step, tool, supply | High — rich result eligible |
| `Review/AggregateRating` | Reviews, testimonials | ratingValue, reviewCount, bestRating | High for trust |
| `BreadcrumbList` | All pages with breadcrumbs | item (each breadcrumb level) | Medium — navigational |
| `WebSite` | Homepage | name, url, potentialAction (SearchAction) | Medium — sitelinks search |
| `Event` | Event pages | name, startDate, endDate, location, offers | Critical for events |
| `VideoObject` | Pages with video | name, description, thumbnailUrl, uploadDate | High if video is key |
| `SoftwareApplication` | SaaS, app pages | name, operatingSystem, applicationCategory, price | High for SaaS |
| `Course` | Online courses | name, description, provider, offers | High for education |
| `JobPosting` | Jobs pages | title, description, datePosted, employmentType | Critical for jobs |

**Implementation guidance:**
- Use JSON-LD format (Google's preferred format — inject in `<head>` or `<body>`)
- Validate with [Google's Rich Results Test](https://search.google.com/test/rich-results)
- Do not mark up content that isn't visible on the page
- Keep schema data consistent with on-page content
- Multiple schema types can coexist on one page

**JSON-LD template (FAQ):**
```json
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How long does SEO take to work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "SEO typically shows initial results within 3-6 months, with significant impact in 6-12 months. Factors include competition, domain age, content quality, and link building."
      }
    }
  ]
}
</script>
```

---

## Featured Snippet Optimization Checklist

### Paragraph Snippets (definition/answer queries)

Target queries: "what is X", "what does X mean", "how does X work", "why does X happen"

```
Optimization approach:
1. Include the target query as an H2 or H3
2. Immediately follow with a 40-60 word direct answer (no preamble)
3. The answer should be a single cohesive paragraph
4. Use the target keyword in the first sentence of the answer

Example:
H2: What is search intent in SEO?
[Answer]: Search intent is the primary reason a user performs a specific search query.
Google categorizes intent into four types: informational (learning something), commercial
(comparing options), transactional (buying something), and navigational (finding a specific
page). Matching content format to search intent is one of the strongest ranking signals.
[Word count: 52 — ideal for paragraph snippet]
```

### List Snippets (how-to, step-by-step, ranked lists)

Target queries: "how to X", "steps to X", "best X for Y", "X tips"

```
Optimization approach:
1. Include the target query as an H2 or H3
2. Use a numbered list (ordered) or bulleted list immediately after the heading
3. Keep each list item concise (under 15 words)
4. 5-10 items is the ideal range for list snippets
5. Each item should be able to stand alone without context

Example:
H2: How to write a title tag for SEO
1. Start with the primary keyword (first 3 words if possible)
2. Keep the total length between 50-60 characters
3. Include the brand name at the end, separated by a pipe or dash
4. Make it compelling enough that searchers want to click
5. Ensure it's unique — no duplicate titles across the site
```

### Table Snippets (comparison, data)

Target queries: "X vs Y", "X pricing", "X comparison", "X rates"

```
Optimization approach:
1. Include the target query in an H2
2. Use proper HTML <table> with <th> headers (not images of tables)
3. Keep tables to 3-5 columns and 5-10 rows (Google shows limited rows)
4. First column should be the item being compared
5. Column headers should be clear and specific

Example:
H2: Core Web Vitals benchmarks

| Metric | Good | Needs Work | Poor |
|--------|------|------------|------|
| LCP    | Under 2.5s | 2.5-4s | Over 4s |
| INP    | Under 200ms | 200-500ms | Over 500ms |
| CLS    | Under 0.1 | 0.1-0.25 | Over 0.25 |
```

---

## Keyword Research Framework

### Search Intent Mapping

Before selecting keywords, map them to intent. This determines content format:

| Keyword Pattern | Likely Intent | Best Content Format |
|---|---|---|
| "what is [topic]" | Informational | Definition article, guide |
| "how to [do X]" | Informational | Tutorial, step-by-step guide |
| "best [product/tool]" | Commercial | Comparison article, roundup |
| "[X] vs [Y]" | Commercial | Comparison page |
| "[X] review" | Commercial | In-depth review |
| "buy [product]" | Transactional | Product page |
| "[product] price/cost" | Transactional | Pricing page |
| "[brand name]" | Navigational | Homepage |
| "[tool] login" | Navigational | Login page |

### Keyword Priority Scoring

Score each candidate keyword across these dimensions:

```
Priority Score = (Search Volume Score × 2) + (Competition Score × 2) + (Business Value Score × 3) + Intent Alignment Score

Search Volume Score: High (3) = 1,000+ monthly, Medium (2) = 100-999, Low (1) = under 100
Competition Score: Low KD (3) = under 30, Medium KD (2) = 30-60, High KD (1) = over 60
Business Value Score: High (3) = direct revenue, Medium (2) = lead gen, Low (1) = awareness only
Intent Alignment: Perfect (3) = content format matches exactly, Partial (2), Poor (1)

Maximum score: (3×2) + (3×2) + (3×3) + 3 = 6+6+9+3 = 24
Prioritize keywords scoring 18+
```

### Long-Tail Keyword Discovery Methods

1. **Google Autocomplete:** Type the seed keyword and note all suggestions
2. **People Also Ask:** Run the primary keyword search and capture all PAA questions
3. **Related Searches:** Bottom of the SERP — underused goldmine for long-tail
4. **Competitor gap analysis:** Keywords competitors rank for that the target site doesn't
5. **Internal search:** If the site has internal search, what are users looking for?
6. **Support tickets and sales calls:** What language do actual customers use?

### Secondary Keyword Integration

For a 1,500-word piece targeting one primary keyword, integrate:
- 5-7 secondary keywords (naturally, not forced)
- 3-5 long-tail variations
- 2-3 People Also Ask questions as H2/H3 headings
- 1-2 LSI terms (semantically related concepts)

**Target density:**
- Primary keyword: 1-2% (about 15-30 occurrences in 1,500 words — but prioritize natural usage)
- Secondary keywords: mention 2-5 times each
- Never stuff — if it reads awkward, it's too many

---

## Content Gap Analysis Template

### Step-by-Step Process

1. **Define the topic cluster:** What is the main topic this site covers?
2. **List all existing content:** Every page, blog post, guide, tool on the site
3. **Map to topic subtopics:** Which subtopics does existing content cover?
4. **Identify competitor content:** What do the top 3 competitors publish that this site doesn't?
5. **Check Google's suggestions:** PAA, related searches, autocomplete for the core topic
6. **Score gaps by priority:** Search volume × business value × achievability

### Gap Analysis Output Format

```markdown
## Content Gap Analysis: [Domain] vs. [Competitor 1], [Competitor 2]

### High Priority Gaps (Publish First)

| Missing Topic | Competitor Ranking | Search Volume Est. | Content Type | Priority |
|---|---|---|---|---|
| [Topic 1] | Competitor A (position 2) | High | How-to guide | 1 |
| [Topic 2] | Competitors A+B | Medium | Comparison page | 2 |

### Medium Priority Gaps

| Missing Topic | Competitor Ranking | Search Volume Est. | Content Type | Priority |
|---|---|---|---|---|
| [Topic 3] | Competitor B (position 5) | Medium | FAQ page | 3 |

### Low Priority / Future Content

| Missing Topic | Why Lower Priority |
|---|---|
| [Topic 4] | Very low search volume, low business value |
```

### Content Update Prioritization

Existing content that's close to ranking (positions 5-20) is often higher priority than new content:

```
Update priority score = (Current Position - 1) × Traffic potential × Effort to update

Pages in positions 5-10: High update priority — small improvements can move to position 1-3
Pages in positions 11-20: Medium priority — more work needed but still faster than creating new
Pages below position 20: Evaluate whether to update or create new targeting a different angle
```

---

## Core Web Vitals Fix Guide

### LCP (Largest Contentful Paint) — Target: Under 2.5s

The LCP element is usually the hero image, a large heading, or a video thumbnail.

**Common fixes:**
1. **Preload the LCP image:** `<link rel="preload" as="image" href="hero.webp" fetchpriority="high">`
2. **Eliminate render-blocking resources:** Move non-critical JS to `defer` or `async`
3. **Use a CDN:** Reduces Time to First Byte significantly
4. **Compress and convert images to WebP:** Often 30-50% smaller
5. **Optimize server response time:** Cache HTML at edge, reduce server processing

### INP (Interaction to Next Paint) — Target: Under 200ms (replaced FID)

**Common fixes:**
1. **Reduce JavaScript execution time:** Identify and break up long tasks (over 50ms)
2. **Use `setTimeout` to yield to the browser:** `setTimeout(() => { heavyWork() }, 0)`
3. **Defer non-critical third-party scripts:** Tag managers, chat widgets, analytics
4. **Use web workers for heavy computation**

### CLS (Cumulative Layout Shift) — Target: Under 0.1

**Common fixes:**
1. **Set explicit width and height on images:** `<img width="800" height="600" ...>`
2. **Reserve space for ads and embeds:** Use aspect-ratio CSS
3. **Avoid inserting content above existing content:** No late-loading banners at top
4. **Use CSS `aspect-ratio` for responsive media:** `aspect-ratio: 16 / 9`
5. **Use `font-display: optional` to prevent font-swap shifts**
