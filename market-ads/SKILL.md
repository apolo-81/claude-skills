---
name: market-ads
description: >
  Multi-platform ad campaign generation (Google, Meta, LinkedIn, TikTok).
  Triggers: "create ads", "ad copy", "Google Ads", "Meta Ads", "Facebook ads",
  "PPC", "SEM", "paid social", "performance marketing", "ad creative",
  "campaign structure", "targeting strategy", "ROAS", "budget allocation",
  "anuncios para mi producto", "quiero hacer ads". Produces AD-CAMPAIGNS.md.
---

# Ad Creative & Copy Generation

You are the advertising engine for `/market ads <url>`. Fetch the target site, understand the business and its offers, then generate a complete multi-platform campaign. Every output is ready for production or handoff to a media buyer. Write all results to `AD-CAMPAIGNS.md`.

For full platform specs (character limits, image sizes, video specs, CPA benchmarks, ROAS targets, budget tables by business type), load: `references/ad-platforms.md`

---

## Phase 1: Campaign Foundation

### 1.1 Business and Offer Analysis

Before writing any ad copy, establish the context that every headline and creative will draw from:

| Context Element | Source | Purpose |
|----------------|--------|---------|
| Product/Service | URL analysis | Core of all ad messaging |
| Price point | Pricing page | Determines funnel depth and ad strategy |
| Target audience | Site copy, user input | Audience targeting parameters |
| Unique selling proposition | Homepage, features | Primary ad differentiation |
| Conversion action | CTAs on site | What the ad should drive toward |
| Social proof | Testimonials, numbers | Trust elements for ad copy |
| Objections | FAQ, competitor mentions | Objection-handling ad angles |
| Competitors | Industry knowledge | Competitive positioning angles |

### 1.2 Campaign Objective Mapping

Match the business goal to a campaign objective before choosing platforms or formats. The objective determines bid strategy, ad format, and success metrics — getting this wrong wastes budget.

Load `references/ad-platforms.md` for the full objective-to-platform mapping table.

---

## Phase 2: Platform-Specific Ad Generation

Load `references/ad-platforms.md` for complete specs (character limits, image/video specs, format options) for each platform. Use those specs to constrain every piece of copy you generate.

### 2.1 Google Ads

Generate Responsive Search Ads with at least 10 headlines and 4 descriptions covering the angles listed in `references/ad-platforms.md`. Also generate keyword strategy: 10–15 high-intent keywords per ad group, 3–5 ad groups by theme, and a negative keywords list.

For Performance Max campaigns, generate asset groups organized by audience segment with image/video specs from the reference file.

### 2.2 Meta Ads (Facebook + Instagram)

For each ad concept generate:
- Primary text: 3 variations (short / medium / long)
- Headlines: 5 variations
- Descriptions: 3 variations
- CTA button selection
- Format recommendation (single image, carousel, video, collection)

Generate 5–10 copy angles per campaign. Cover these proven angles:

```
PAIN POINT:       "Tired of [frustration]? [Product] eliminates [pain] so
                   you can focus on [desired outcome]."

SOCIAL PROOF:     "[Number] [audience] already use [product] to [benefit].
                   See why [customer] calls it '[quote].'"

BEFORE/AFTER:     "Before [product]: [painful state]
                   After [product]: [desired state]
                   The difference? [Unique mechanism]."

OBJECTION:        "Think [product] is [objection]? [Counter with evidence].
                   Try it free for [trial] — no [risk]."

URGENCY:          "[Limited offer]. [Number] spots left this month."

CURIOSITY:        "The [industry] secret that [result] (most miss this)."

DIRECT BENEFIT:   "Get [outcome] in [timeframe]. No [objection]. Just [benefit]."

COMPARISON:       "Still using [old way]? [Product] gives you [advantage]."

TESTIMONIAL:      "'[Specific quote about specific result]' — [Name, title]"

HOW-TO:           "How to [outcome] in 3 steps: 1. [Step]  2. [Step]  3. [Result]"
```

### 2.3 LinkedIn Ads

Use for B2B targeting. Generate Sponsored Content (single image + carousel), plus one Message Ad. Use LinkedIn-specific angles: ROI-focused, professional development, industry insight, peer comparison. Load `references/ad-platforms.md` for character limits and targeting options.

### 2.4 TikTok Ads

Generate a 30-second script using the hook-problem-solution-proof-CTA structure from `references/ad-platforms.md`. The first 3 seconds are the entire battle — write the hook last, after the body, to make it as strong as possible.

### 2.5 Twitter/X Ads

Write 3 tweet-length ads (aim for 100–150 chars for best performance). Use conversational, hot-take framing. Include one thread-style option where the first tweet is the hook.

---

## Phase 3: Retargeting Funnel

Build a three-stage retargeting funnel. Budget split and audience definitions follow this structure — deviation wastes spend on the wrong audience at the wrong moment.

```
STAGE 1: AWARENESS (Cold Audience)
  Audience:  Lookalikes, interest-based, broad targeting
  Goal:      Introduce brand and value proposition
  Ad type:   Educational content, how-to videos, thought leadership
  Budget:    40% of total ad spend
  Metrics:   CPM, reach, video view rate, landing page views

STAGE 2: CONSIDERATION (Warm Audience)
  Audience:  Website visitors (7–30 days), video viewers (50%+),
             social engagers, email list
  Goal:      Build trust and handle objections
  Ad type:   Case studies, testimonials, demos, comparisons
  Budget:    35% of total ad spend
  Metrics:   CPC, CTR, landing page conversion rate

STAGE 3: CONVERSION (Hot Audience)
  Audience:  Cart abandoners, pricing page visitors, trial users
  Goal:      Drive the final conversion action
  Ad type:   Direct offer, urgency, guarantee, limited-time discount
  Budget:    25% of total ad spend
  Metrics:   CPA, ROAS, conversion rate
```

Generate 3–5 ad variations per stage following the naming convention in `references/ad-platforms.md`.

---

## Phase 4: Budget, ROAS, and Landing Page Alignment

Load `references/ad-platforms.md` for:
- Budget allocation percentages by business type (SaaS, e-commerce, local, etc.)
- ROAS benchmarks by industry (acceptable / good / excellent)
- CPA benchmarks by platform and conversion type

### Landing Page Alignment

Every ad needs a landing page check. Mismatched messaging between ad and page is the single most common cause of wasted ad spend.

Rate message match 1–10 for each ad. Flag any score below 7 with a specific fix.

Alignment checklist:
- Does the landing page headline match the ad headline?
- Does the page deliver on the ad's promise?
- Is the CTA on the page consistent with the ad CTA?
- Is the visual style consistent between ad and page?
- Is the page mobile-optimized?
- Does it load under 3 seconds?
- Is there one clear conversion action?

---

## Phase 5: Ad Variations and Testing

### Variation Requirements

Per ad concept generate:
- 5 headline variations (different angles, lengths, emotions)
- 3 primary text variations (short / medium / long)
- 3 CTA variations
- 3 visual concept descriptions (for designer handoff)

### Testing Priority Order

Test in this order — audiences have more impact than copy, copy has more impact than CTA text:

1. Audience (who you target)
2. Offer (free trial vs demo vs discount)
3. Creative concept (big idea and visual approach)
4. Headline (specific hook wording)
5. Body copy (supporting text)
6. CTA (button text)

**Testing rules:** One variable at a time. Run for at least 3–5 days or 1,000 impressions per variant. Kill underperformers at 2x the CPA target. Scale winners by 20% budget increments — not 2x overnight.

---

## Output Format: AD-CAMPAIGNS.md

```markdown
# Ad Campaigns: [Business Name]
**URL:** [url]
**Date:** [current date]
**Business Type:** [type]
**Primary Objective:** [objective]
**Recommended Platforms:** [platforms]

---

## Campaign Strategy Overview
[2–3 paragraphs: audience insight, angle choices, funnel strategy]

## Audience Targeting
[Detailed audience definitions for each platform]

## Campaign 1: [Platform Name]
### Ad Group 1: [Theme]
**Targeting:** [audience parameters]
**Budget:** [recommended daily/monthly]
**Objective:** [campaign objective]

#### Ad Variation 1
- **Headline:** [text]
- **Primary Text:** [text]
- **Description:** [text]
- **CTA:** [button text]
- **Visual:** [creative description for designer]
- **Landing Page:** [URL/page]

[Repeat for each variation, ad group, and platform]

## Retargeting Strategy
[Three-stage funnel with ad variations per stage]

## Budget Allocation
[Platform split + funnel stage split with dollar amounts]

## Testing Plan
[Prioritized A/B tests with hypothesis and success metric]

## Performance Benchmarks
[ROAS and CPA targets by platform, from reference file]

## Landing Page Alignment
[Message match scores and recommendations for each ad]

## Creative Brief for Designers
[Visual specs, brand notes, image/video requirements by platform]
```

---

## Terminal Output

```
=== AD CAMPAIGNS GENERATED ===

Business: [name]
Platforms: [list]
Total Ad Variations: [count]

Campaign Structure:
  Google Ads: [X] ad groups, [X] variations
  Meta Ads:   [X] ad sets, [X] variations
  LinkedIn:   [X] campaigns, [X] variations

Budget Recommendation: $[X,XXX]/month
Expected CPA: $[XX]–$[XX]
Target ROAS: [X]:1

Full campaigns saved to: AD-CAMPAIGNS.md
```

---

## Cross-Skill Integration

- If `COPY-SUGGESTIONS.md` exists, reuse value propositions and messaging angles
- If `COMPETITOR-REPORT.md` exists, use competitor positioning for comparison ads
- If `FUNNEL-ANALYSIS.md` exists, align ad funnel stages to the conversion path
- If `SOCIAL-CALENDAR.md` exists, identify top organic content to boost as Spark/paid ads
- Suggest follow-up: `/market funnel` for conversion path analysis, `/market landing` for page optimization
