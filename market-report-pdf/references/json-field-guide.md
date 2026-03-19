# PDF Report JSON Field Guide

## Required Fields Checklist

All of these are required. Missing any will produce an incomplete or broken PDF.

| Field | Type | Required | Notes |
|---|---|---|---|
| `url` | string | Yes | Full URL including protocol |
| `date` | string | Yes | Format: "March 6, 2026" |
| `brand_name` | string | Yes | Used in competitor table headers |
| `overall_score` | integer 0-100 | Yes | Must be a number, not a string |
| `executive_summary` | string | Yes | 2-4 sentences only |
| `categories` | object | Yes | Exactly 6 categories |
| `findings` | array | Yes | 5-10 findings, ordered by severity |
| `quick_wins` | array | Yes | 3-5 items |
| `medium_term` | array | Yes | 3-5 items |
| `strategic` | array | Yes | 3-5 items |
| `competitors` | array | No | Omit entirely if no competitor data |

---

## Category Scoring Guide

### `overall_score` Calculation
```
overall_score = round(
  (content_score × 0.25) +
  (conversion_score × 0.20) +
  (seo_score × 0.20) +
  (competitive_score × 0.15) +
  (brand_score × 0.10) +
  (growth_score × 0.10)
)
```

### Category Scoring Criteria

**Content & Messaging (weight 25%)**
- 80+: Clear, benefit-driven headlines; specific value proposition; consistent brand voice across pages
- 60-79: Adequate messaging but generic; value prop requires effort to understand
- 40-59: Vague or feature-focused copy; inconsistent voice; headlines that don't convert
- <40: No clear value proposition; confusing messaging; content that repels target audience

**Conversion Optimization (weight 20%)**
- 80+: Multiple social proof types; optimized forms; clear CTAs above fold; objection handling present
- 60-79: Some elements present; one type of social proof; CTA visible but not compelling
- 40-59: Missing key elements; CTA buried; no testimonials on key pages
- <40: Critical conversion elements missing; broken flows; trust signals absent

**SEO & Discoverability (weight 20%)**
- 80+: Fully optimized title tags/meta; proper H1-H6; schema markup; fast load; internal linking
- 60-79: Mostly present with gaps; some missing meta descriptions; schema incomplete
- 40-59: Major issues; missing meta on key pages; technical SEO problems
- <40: Critical issues blocking crawl/index; no schema; missing title tags

**Competitive Positioning (weight 15%)**
- 80+: Clear differentiation; comparison pages exist; pricing transparent; unique angle evident
- 60-79: Some differentiation; pricing available but not clearly positioned
- 40-59: No clear positioning vs competitors; pricing unclear; generic "we're the best" messaging
- <40: Impossible to understand why to choose this company over alternatives

**Brand & Trust (weight 10%)**
- 80+: Modern design; trust badges on checkout/signup; SSL; clear contact info; professional imagery
- 60-79: Adequate design; some trust signals; mostly professional
- 40-59: Dated design; missing trust signals on key pages; inconsistent visual identity
- <40: Unprofessional appearance; no visible trust signals; would make a prospect hesitate

**Growth & Strategy (weight 10%)**
- 80+: Multi-channel strategy evident; email capture; retargeting; content marketing; active acquisition
- 60-79: Some channels active; email capture exists; some content
- 40-59: Single channel; minimal email; no apparent growth strategy
- <40: No visible growth infrastructure; relying entirely on word-of-mouth

---

## Writing Effective Findings

**Good findings:**
- Specific: "Homepage headline reads 'Welcome to Our Platform' with no value proposition"
- Quantified: "Missing meta descriptions on 11 of 15 indexed pages"
- Benchmarked: "Page load time is 4.8 seconds (benchmark: under 2.5s)"
- Evidenced: "No testimonials found on homepage, pricing page, or checkout page"

**Bad findings:**
- Vague: "Headlines need improvement"
- Generic: "SEO could be better"
- Unactionable: "The website needs work"

**Severity guide:**
- `Critical` — Directly losing revenue or customers right now. Fix within 48 hours.
- `High` — Significant impact on growth. Fix within 1-2 weeks.
- `Medium` — Meaningful improvement opportunity. Fix within 1 month.
- `Low` — Nice-to-have. Fix when resources allow.

Order findings from Critical → High → Medium → Low. Include 5-10 total.

---

## Writing Effective Action Items

**Quick wins** — must be completable in under one week by a non-expert:

Good: "Rewrite the homepage headline from 'Welcome to Our Platform' to '[Specific benefit]-focused headline targeting [specific audience]'"

Bad: "Improve the homepage headline" (too vague to act on)

**Medium-term** — 1-3 months, may require design/dev resources:
Example: "Add a testimonials section to the pricing page with 3-5 customer reviews including company name, photo, and specific result achieved"

**Strategic** — 3-6 months, requires planning and sustained investment:
Example: "Build a content cluster around [primary keyword topic]: 1 pillar page (3,000+ words) + 8 cluster articles (1,500+ words each), published over 3 months"

---

## Color Scheme Reference

The PDF uses these colors automatically based on score:

| Score | Color | Hex |
|---|---|---|
| 80-100 | Green (Strong) | #00C853 |
| 60-79 | Blue (Solid) | #2D5BFF |
| 40-59 | Amber (Attention) | #FFB300 |
| 0-39 | Red (Critical) | #FF1744 |

Primary headers: Dark Navy `#1B2A4A`
Accent: Blue `#2D5BFF`
Highlight: Orange `#FF6B35`
Body text: Dark Gray `#2C3E50`
