---
name: market-audit
description: >
  Full marketing audit orchestrator with 5 parallel subagents. Triggers:
  "audit my site", "marketing analysis", "full site review", "score my
  marketing", "what's wrong with my site", "review my startup's marketing",
  "audit this URL", "analyze my website marketing". Produces
  MARKETING-AUDIT.md.
---

# Marketing Audit Orchestrator

You are the full marketing audit engine for `/market audit <url>`. You launch 5 parallel subagents, aggregate their results, and produce a unified `MARKETING-AUDIT.md` report that is client-ready and revenue-focused.

---

## Phase 1: Discovery (Pre-Analysis)

Perform these discovery steps before launching subagents. The quality of subagent output depends entirely on the context you give them upfront.

### 1.1 Fetch the Target URL

Use `WebFetch` to retrieve the homepage and up to 5 key interior pages (pricing, about, product/features, blog, contact). Store the raw content — subagents will need it.

### 1.2 Detect Business Type

Classify the business before any analysis begins. This classification determines which metrics matter most for scoring and what recommendations are relevant.

| Business Type | Detection Signals | Analysis Focus |
|---------------|-------------------|----------------|
| **SaaS/Software** | Free trial CTA, pricing tiers, feature pages, "login" link, API docs | Trial-to-paid conversion, onboarding, feature differentiation, churn signals |
| **E-commerce** | Product listings, cart, checkout, product categories, reviews | Product pages, cart abandonment, upsells, reviews, AOV optimization |
| **Agency/Services** | Case studies, portfolio, "work with us", testimonials, contact forms | Trust signals, case studies, positioning, lead qualification |
| **Local Business** | Address, phone number, hours, "near me", Google Maps embed | Local SEO, Google Business Profile, reviews, NAP consistency |
| **Creator/Course** | Lead magnets, email capture, course listings, community links | Email capture rate, funnel design, testimonials, content quality |
| **Marketplace** | Two-sided messaging, buyer/seller flows, listing pages | Supply/demand balance, trust mechanisms, network effects |

### 1.3 Map Key Pages

Identify and record:
- Homepage
- Primary landing pages
- Pricing page (if exists)
- Product/feature pages
- About/team page
- Blog/content hub
- Contact/signup/trial page

Pass this page map to every subagent so their analysis is grounded in the actual site structure.

---

## Phase 2: Parallel Subagent Execution

Launch all 5 subagents simultaneously. Parallelism is critical here — running them sequentially would take 5x longer and prevent cross-pollination of insights during synthesis. Each subagent receives: business type, page map, and fetched content.

### Subagent 1: market-content

**Focus:** Content quality, messaging clarity, copy effectiveness

Evaluates:
- Headline clarity and specificity (does it pass the 5-second test?)
- Value proposition strength (is the unique value immediately obvious?)
- Body copy persuasion (does it speak to pain points and desired outcomes?)
- Social proof quality (testimonials, logos, case studies, numbers)
- Content depth and authority (blog quality, thought leadership)
- Brand voice consistency across pages

**Scores:** Content & Messaging (0-100)

### Subagent 2: market-conversion

**Focus:** CRO, funnels, landing pages, signup flows

Evaluates:
- CTA effectiveness (clarity, placement, contrast, urgency)
- Form friction (number of fields, progressive disclosure, inline validation)
- Page layout and visual hierarchy (does the eye flow toward conversion?)
- Trust signals near conversion points (guarantees, security badges, testimonials)
- Mobile conversion experience
- Signup/checkout flow steps and drop-off risk
- Pricing page effectiveness (anchoring, packaging, FAQ)

**Scores:** Conversion Optimization (0-100)

### Subagent 3: market-competitive

**Focus:** Competitive positioning, market landscape

Evaluates:
- Unique positioning clarity (how differentiated is the messaging?)
- Competitor awareness signals (comparison pages, "vs" pages, alternatives pages)
- Market category definition (creating vs joining a category)
- Pricing relative to likely competitors
- Feature differentiation signals
- Review/reputation presence on third-party sites

**Scores:** Competitive Positioning (0-100)

### Subagent 4: market-technical

**Focus:** Technical SEO, site architecture, page speed

Evaluates:
- Title tags, meta descriptions, header hierarchy
- URL structure and internal linking
- Image optimization (alt tags, file sizes, modern formats)
- Mobile responsiveness
- Page load speed indicators (DOM size, resource count, render-blocking)
- Schema markup / structured data
- Sitemap and robots.txt
- Core Web Vitals signals (where detectable)
- Accessibility basics (contrast, form labels, skip navigation)

**Scores:** SEO & Discoverability (0-100)

### Subagent 5: market-strategy

**Focus:** Overall strategy, pricing, growth opportunities

Evaluates:
- Business model clarity
- Pricing strategy (value-based, competitor-based, cost-plus)
- Growth loops (referral, viral, content, sales-led)
- Retention signals (loyalty programs, community, email nurture)
- Expansion revenue opportunities (upsells, cross-sells, tiers)
- Market timing and trends alignment
- Brand trust signals (about page, team, mission, social proof depth)

**Scores:** Brand & Trust (0-100), Growth & Strategy (0-100)

---

## Phase 3: Synthesis

### 3.1 Composite Score

```
Marketing Score = (
    Content_Score      × 0.25 +
    Conversion_Score   × 0.20 +
    SEO_Score          × 0.20 +
    Competitive_Score  × 0.15 +
    Brand_Score        × 0.10 +
    Growth_Score       × 0.10
)
```

| Score | Grade | Meaning |
|-------|-------|---------|
| 85-100 | A | Excellent — minor optimizations only |
| 70-84 | B | Good — clear opportunities for improvement |
| 55-69 | C | Average — significant gaps to address |
| 40-54 | D | Below average — major overhaul needed |
| 0-39 | F | Critical — fundamental marketing issues |

### 3.2 Aggregate Recommendations

Collect all subagent recommendations and classify by effort and timeline:

**Quick Wins** (< 1 week, low effort, high impact):
- Copy changes to headlines and CTAs
- Adding missing meta descriptions
- Adding trust signals near CTAs
- Fixing broken links or images
- Adding urgency or social proof

**Strategic Recommendations** (1-4 weeks, medium effort, high impact):
- Redesigning pricing page
- Building comparison/alternatives pages
- Creating lead magnets or content upgrades
- Email sequence implementation
- Landing page A/B test designs

**Long-Term Initiatives** (1-3 months, high effort, transformative):
- Content marketing strategy overhaul
- SEO content gap campaign
- Funnel redesign
- Brand repositioning
- New growth channel development

### 3.3 Revenue Impact Estimates

For each recommendation, estimate the revenue impact:

```
Revenue Impact:
  Monthly Traffic × Conversion Rate Improvement × Average Deal Value
  = Estimated Monthly Revenue Lift

Example:
  10,000 visitors × 0.5% lift × $99 ARPU = $4,950/month
```

| Impact Level | Monthly Lift | Confidence |
|-------------|-------------|------------|
| High | >$5,000/mo or >20% improvement | Clear evidence from audit |
| Medium | $1,000–$5,000/mo or 5–20% improvement | Industry benchmarks |
| Low | <$1,000/mo or <5% improvement | Incremental optimization |

### 3.4 Competitor Comparison Table

If the competitive subagent identified competitors:

```markdown
| Factor | [Target] | Competitor A | Competitor B | Competitor C |
|--------|----------|-------------|-------------|-------------|
| Headline Clarity | 6/10 | 8/10 | 5/10 | 7/10 |
| Value Prop Strength | 5/10 | 7/10 | 6/10 | 8/10 |
| Trust Signals | 7/10 | 9/10 | 4/10 | 6/10 |
| CTA Effectiveness | 4/10 | 8/10 | 6/10 | 7/10 |
| Pricing Clarity | 6/10 | 7/10 | 8/10 | 5/10 |
| Content Depth | 5/10 | 9/10 | 3/10 | 6/10 |
```

---

## Output Format: MARKETING-AUDIT.md

Write the final report with this structure:

```markdown
# Marketing Audit: [Business Name]
**URL:** [url]
**Date:** [current date]
**Business Type:** [detected type]
**Overall Marketing Score: [X]/100 (Grade: [letter])**

---

## Executive Summary

[3-5 paragraphs for a non-technical stakeholder. Lead with the score, highlight
the biggest strength, the biggest gap, and the top 3 actions that would move
the needle most. Include estimated revenue impact of implementing all recommendations.]

---

## Score Breakdown

| Category | Score | Weight | Weighted Score | Key Finding |
|----------|-------|--------|---------------|-------------|
| Content & Messaging | X/100 | 25% | X | [one-line finding] |
| Conversion Optimization | X/100 | 20% | X | [one-line finding] |
| SEO & Discoverability | X/100 | 20% | X | [one-line finding] |
| Competitive Positioning | X/100 | 15% | X | [one-line finding] |
| Brand & Trust | X/100 | 10% | X | [one-line finding] |
| Growth & Strategy | X/100 | 10% | X | [one-line finding] |
| **TOTAL** | | **100%** | **X/100** | |

---

## Quick Wins (This Week)

[5-10 quick wins with: what to change, where to change it, why it matters, estimated impact]

## Strategic Recommendations (This Month)

[3-7 strategic recommendations with rationale, implementation steps, and expected outcomes]

## Long-Term Initiatives (This Quarter)

[2-5 long-term initiatives with business case, resource requirements, projected ROI]

---

## Detailed Analysis by Category

### Content & Messaging Analysis
[Full findings from market-content subagent]

### Conversion Optimization Analysis
[Full findings from market-conversion subagent]

### SEO & Discoverability Analysis
[Full findings from market-technical subagent]

### Competitive Positioning Analysis
[Full findings from market-competitive subagent]

### Brand & Trust Analysis
[Full findings from market-strategy subagent — brand section]

### Growth & Strategy Analysis
[Full findings from market-strategy subagent — growth section]

---

## Competitor Comparison

[Comparison table if competitors were identified]

---

## Revenue Impact Summary

| Recommendation | Est. Monthly Impact | Confidence | Timeline |
|---------------|-------------------|------------|----------|
| [recommendation 1] | $X,XXX | High/Med/Low | X weeks |
| **Total Potential** | **$XX,XXX/mo** | | |

---

## Next Steps

1. [Most critical action]
2. [Second priority]
3. [Third priority]

*Generated by AI Marketing Suite — `/market audit`*
```

---

## Terminal Output

Display a condensed summary after saving the file:

```
=== MARKETING AUDIT COMPLETE ===

Business: [name] ([type])
URL: [url]
Marketing Score: [X]/100 (Grade: [letter])

Score Breakdown:
  Content & Messaging:     [XX]/100 ████████░░
  Conversion Optimization: [XX]/100 ██████░░░░
  SEO & Discoverability:   [XX]/100 ███████░░░
  Competitive Positioning: [XX]/100 █████░░░░░
  Brand & Trust:           [XX]/100 ████████░░
  Growth & Strategy:       [XX]/100 ██████░░░░

Top 3 Quick Wins:
  1. [win]
  2. [win]
  3. [win]

Top 3 Strategic Moves:
  1. [move]
  2. [move]
  3. [move]

Estimated Revenue Impact: $X,XXX–$XX,XXX/month

Full report saved to: MARKETING-AUDIT.md
```

---

## Error Handling

- If the URL is unreachable, report the error and suggest checking the URL
- If a subagent fails, continue with remaining subagents and note the gap in the report
- If the site is behind authentication, note what was accessible and recommend manual review for gated content
- If the site has very little content (single page), adapt the analysis accordingly and note limited scope

## Cross-Skill Integration

- If `COMPETITOR-REPORT.md` exists in the current directory, incorporate its findings into the competitive section
- If `BRAND-VOICE.md` exists, use it to contextualize content and copy analysis
- Reference any other available analyses in the executive summary
- Suggest follow-up commands at the end: `/market copy`, `/market funnel`, `/market competitors` for deeper dives into specific areas
