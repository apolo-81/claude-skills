---
name: market-funnel
description: >
  Sales funnel analysis and optimization from visit to purchase. Triggers:
  "funnel analysis", "CRO", "sales funnel", "conversion rate optimization",
  "customer journey", "drop-off analysis", "embudo de ventas",
  "por qué no compran mis visitantes", "optimize my checkout",
  "why am I losing customers", "signup friction", "onboarding drop-off",
  "optimizar conversiones", "pricing page performance".
---

# Sales Funnel Analysis & Optimization

Map the complete conversion path from first visit to purchase, identify every drop-off point, quantify friction, and deliver specific optimizations ranked by revenue impact. Every recommendation comes with an estimated lift and implementation effort so the user can act immediately.

## Invocation

Run as `/market funnel <url>`. Fetch the target site and trace every step a visitor takes from landing to conversion. Analyze each step for friction, clarity, and effectiveness. Write the complete analysis to `FUNNEL-ANALYSIS.md`.

---

## Phase 1: Funnel Discovery and Mapping

### 1.1 Identify the Funnel Type

Detect which funnel type the site uses. The full reference table with all types, typical steps, and key metrics is in `references/funnel-frameworks.md`. The main types to recognize:

- **Lead Gen**: Services, agencies, B2B — Landing → Form → Thank you → Nurture → Call
- **SaaS Trial**: Homepage → Pricing → Signup → Onboarding → Upgrade
- **SaaS Demo**: Homepage → Features → Demo request → Sales call → Close
- **E-commerce**: Product page → Cart → Checkout → Upsell → Thank you
- **Webinar**: Opt-in → Confirmation → Reminder → Live → Offer → Checkout
- **Application**: Info page → Form → Review → Interview → Accept

### 1.2 Map Every Funnel Step

For each page in the funnel, document:

```
STEP [#]: [Page Name]
  URL: [url]
  Page Type: [landing/product/pricing/cart/checkout/form/thank-you]
  Primary Action: [what the user should do on this page]
  Next Step: [where the user should go next]
  Exit Points: [where users might leave instead]
  Friction Elements: [anything that slows or confuses]
  Trust Elements: [anything that builds confidence]
  Estimated Load Time: [fast/moderate/slow based on page complexity]
```

### 1.3 Visual Funnel Map

Create an ASCII funnel map showing the conversion flow with estimated rates at each step. Adjust conversion percentages to match what you observe or what the user provides:

```
VISITOR JOURNEY MAP
===================

Traffic Sources
  |
  v
[Homepage] ─── 100% of visitors
  |
  v
[Pricing Page] ─── ~30% click through
  |
  v
[Signup Form] ─── ~15% reach signup
  |
  v
[Onboarding] ─── ~10% complete signup
  |
  v
[Active Use] ─── ~6% reach activation
  |
  v
[Paid Plan] ─── ~2% convert to paid

Overall: 2% visitor-to-paid conversion
```

---

## Phase 2: Page-by-Page Analysis

### 2.1 Page Scoring Framework

Score each funnel page on 5 dimensions (0-10 each). The page score is the average of all five:

| Dimension | Score | What to Evaluate |
|-----------|-------|-----------------|
| Clarity | 0-10 | Is the page's purpose immediately obvious? |
| Continuity | 0-10 | Does it logically continue from the previous step? |
| Motivation | 0-10 | Does it give enough reason to take the next action? |
| Friction | 0-10 | How easy is it to complete the desired action? (10 = frictionless) |
| Trust | 0-10 | Are trust signals appropriate for this commitment level? |

Score interpretation: 8-10 = optimized; 6-7 = functional; 4-5 = priority improvement; 0-3 = critical fix.

### 2.2 Common Drop-Off Patterns and Fixes

The most common drop-off causes, signals, and fixes by funnel stage are documented in `references/funnel-frameworks.md`. Key stages to analyze:

- Homepage to next step (value proposition, CTA clarity, page speed, mobile)
- Pricing page (price shock, too many options, missing social proof, unanswered objections)
- Signup/registration (field count, premature account requirement, missing social login)
- Checkout/purchase (surprise costs, forced registration, payment options, missing guarantee)

### 2.3 Lead Magnet Effectiveness

If the funnel includes a lead magnet, score it on:

| Criteria | Score (0-10) |
|----------|-------------|
| Relevance — directly addresses the target audience's main pain | |
| Specificity — concrete deliverable, not a vague "free guide" | |
| Perceived value — would someone pay $20+ for this? | |
| Quick win — can the user get value within 10 minutes? | |
| Product alignment — does it naturally lead to wanting the paid product? | |
| Opt-in friction — is the form simple? (10 = email only) | |

**Lead magnet types ranked by conversion rate:**
1. Templates and tools (immediate, tangible value)
2. Checklists and cheat sheets (quick win, easy to consume)
3. Case studies with numbers (credibility building)
4. Video training or workshops (high perceived value)
5. Ebooks and guides (good for authority, lower conversion)
6. Quizzes and assessments (interactive, high engagement)
7. Free trials and demos (highest buyer intent)

---

## Phase 3: Funnel Metrics and Revenue Impact

### 3.1 Key Funnel Metrics

Calculate or estimate these metrics. Ask the user for traffic and revenue numbers if not inferable from the site:

```
FUNNEL METRICS
==============

Traffic:
  Monthly Visitors: [estimated or user-provided]
  Traffic Sources: [organic %, paid %, referral %, direct %, social %]

Conversion:
  Visitor → Lead:       [X]% (benchmark: 2-5%)
  Lead → MQL:           [X]% (benchmark: 15-30%)
  MQL → Opportunity:    [X]% (benchmark: 30-50%)
  Opportunity → Customer: [X]% (benchmark: 20-40%)
  Overall Visitor → Customer: [X]% (benchmark: 0.5-3%)

Revenue:
  Average Order Value (AOV): $[X]
  Customer Lifetime Value (LTV): $[X]
  Customer Acquisition Cost (CAC): $[X]
  LTV:CAC Ratio: [X]:1 (healthy target: 3:1 or higher)
  Revenue Per Visitor (RPV): $[X]
```

Benchmarks by funnel type are in `references/funnel-frameworks.md`.

### 3.2 Revenue Per Visitor: The Master Metric

RPV (Revenue Per Visitor) is the single most important metric for funnel optimization because it collapses all variables — traffic, conversion rate, and order value — into one number that is directly comparable across time periods, traffic sources, and optimization scenarios.

**Why RPV matters for communicating recommendations:** When you tell a stakeholder "this change might improve conversion by 0.5%," it sounds trivial. When you say "this change adds $0.12 per visitor, which equals $6,000/month on current traffic," the decision becomes obvious. Always translate recommendations into RPV and annual revenue impact.

```
RPV = Monthly Revenue / Monthly Visitors

Example calculation:
  Current:
    10,000 visitors/month × 2% conversion × $100 AOV = $20,000/month
    RPV = $2.00 per visitor

  After improving conversion from 2% to 2.5%:
    10,000 × 2.5% × $100 = $25,000/month
    RPV = $2.50 per visitor
    Monthly lift = $5,000 | Annual lift = $60,000

  After improving AOV from $100 to $115:
    10,000 × 2% × $115 = $23,000/month
    Monthly lift = $3,000 | Annual lift = $36,000
```

Use this framework to calculate the revenue impact of every recommendation. Lift percentage estimates for common optimizations are in `references/funnel-frameworks.md`.

**Presenting multiple scenarios:** Show three scenarios — conservative (bottom of expected lift range), base case (midpoint), and aggressive (top of range). This gives the user a realistic picture without overpromising.

---

## Phase 4: Optimization Recommendations

### 4.1 Prioritization Matrix

Rank every recommendation using this framework:

| Priority | Impact | Effort | Timeline |
|----------|--------|--------|----------|
| P1 — Do Now | >10% lift | <1 day | This week |
| P2 — Plan | >10% lift | 1-5 days | This month |
| P3 — Schedule | 5-10% lift | <1 day | This month |
| P4 — Backlog | 5-10% lift | 5+ days | This quarter |
| P5 — Nice to Have | <5% lift | Any | When resources allow |

### 4.2 Stage-Specific Optimizations

**Top of Funnel (Awareness → Interest):**
- Headline A/B testing (expected lift: 10-30%)
- Social proof placement above fold (expected lift: 5-15%)
- Page speed optimization (expected lift: 5-20%)
- Exit-intent popup with lead magnet (recovers 2-5% of exiting visitors)

**Middle of Funnel (Interest → Consideration):**
- Case study and testimonial pages (expected lift: 10-20%)
- Feature comparison or "vs" pages (expected lift: 5-15%)
- Interactive product demos (expected lift: 15-30%)
- Retargeting email sequences (expected lift: 10-25%)

**Bottom of Funnel (Consideration → Purchase):**
- Pricing page redesign (expected lift: 10-25%)
- Checkout friction reduction (expected lift: 5-15% per friction point removed)
- Risk reversal (guarantees, free trials) (expected lift: 10-20%)
- Urgency and scarcity elements (expected lift: 5-15%)
- Cart abandonment email sequence (recovers 5-15% of abandoned carts)

**Post-Purchase (Retention → Expansion):**
- Onboarding email sequence (10-20% reduction in churn)
- Upsell/cross-sell on thank-you page (5-15% AOV lift)
- Referral program (5-15% new customer acquisition)
- NPS survey at 30 days (identifies at-risk customers before they churn)

### 4.3 Pricing Page Deep Audit

Pricing pages are typically the highest-leverage optimization point in any SaaS or service funnel. Use the full checklist from `references/funnel-frameworks.md`. Key elements:

- Headline frames value, not cost
- Maximum 3 plans (or 3 + enterprise)
- One plan highlighted as "Most Popular"
- Annual pricing shown first with savings highlighted
- Social proof adjacent to pricing
- FAQ addressing top 5 objections
- Money-back guarantee or free trial prominently displayed
- CTA buttons use action language, not generic "Subscribe"

### 4.4 Checkout and Signup Friction Audit

Run the full friction audit documented in `references/funnel-frameworks.md`. Core measurements:
- Count total form fields (target: 3-5 for lead gen, 5-8 for checkout)
- Count total steps (target: 1-3 maximum)
- Presence of progress indicators on multi-step forms
- Mobile usability of all form inputs
- Quality of inline validation and error messages

---

## Phase 5: Nurture Integration and Traffic Alignment

### 5.1 Funnel-to-Email Mapping

For each funnel stage, recommend the appropriate email sequence. The complete mapping table is in `references/funnel-frameworks.md`.

### 5.2 Traffic Source Alignment

Different traffic sources arrive with different intent and trust levels. Matching source to entry point is one of the highest-leverage optimizations requiring zero design work — it is purely a routing and campaign targeting change.

The complete traffic source alignment table is in `references/funnel-frameworks.md`. The core principle: send high-intent branded searchers directly to the pricing or signup page; send cold social traffic to a lead magnet or educational landing page first.

---

## Output Format: FUNNEL-ANALYSIS.md

Write the complete analysis to `FUNNEL-ANALYSIS.md`:

```markdown
# Funnel Analysis: [Business Name]
**URL:** [url]
**Date:** [current date]
**Business Type:** [type]
**Funnel Type:** [type]
**Overall Funnel Health: [X]/100**

---

## Executive Summary
[3-4 paragraphs: funnel type identified, current performance assessment,
biggest bottleneck, top 3 recommendations with revenue impact]

---

## Funnel Map
[ASCII visualization with estimated conversion rates at each step]

---

## Page-by-Page Analysis

### Step 1: [Page Name]
**Score: [X]/10**
[Scores by dimension, friction points identified, trust elements present,
specific recommendations with estimated lift]

### Step 2: [Page Name]
[Continue for each step]

---

## Funnel Metrics
[Current metrics vs benchmarks, with gaps highlighted]

## Revenue Impact Analysis

### Current State
[RPV calculation, monthly/annual revenue estimate]

### Scenario A: Priority 1 Fixes Only
[Conservative, base, and aggressive lift estimates]

### Scenario B: Full Optimization Roadmap
[Conservative, base, and aggressive lift estimates]

---

## Optimization Recommendations

### Priority 1 — Do Now (This Week)
[Specific actions, expected lift, implementation notes]

### Priority 2 — Plan (This Month)
[Specific actions, expected lift, implementation notes]

### Priority 3 — Strategic (This Quarter)
[Specific actions, expected lift, implementation notes]

---

## Pricing Page Assessment
[Full checklist with scores and specific recommendations]

## Lead Magnet Assessment
[Scoring and improvement recommendations if applicable]

## Email Nurture Integration
[Funnel-stage-to-sequence mapping]

## Traffic Source Alignment
[Which sources to send where and why]

## Next Steps
1. [Most critical immediate action]
2. [Second priority]
3. [Third priority]
```

---

## Terminal Summary

Display after saving the file:

```
=== FUNNEL ANALYSIS COMPLETE ===

Business: [name]
Funnel Type: [type]
Steps Analyzed: [count]
Funnel Health: [X]/100

Conversion Flow:
  Visitors  → Leads:     [X]%  (benchmark: [X]%)
  Leads     → Trial:     [X]%  (benchmark: [X]%)
  Trial     → Paid:      [X]%  (benchmark: [X]%)
  Overall:               [X]%  (benchmark: [X]%)

Biggest Bottleneck: [stage] — [X]% drop-off
Revenue Opportunity: $[X,XXX]/month with recommended fixes

Top 3 Fixes:
  1. [fix] — est. [X]% lift — [effort estimate]
  2. [fix] — est. [X]% lift — [effort estimate]
  3. [fix] — est. [X]% lift — [effort estimate]

Full analysis saved to: FUNNEL-ANALYSIS.md
```

---

## Cross-Skill Integration

- If `MARKETING-AUDIT.md` exists, reference conversion scores already captured
- If `COPY-SUGGESTIONS.md` exists, apply copy improvements to identified friction pages
- If `EMAIL-SEQUENCES.md` exists, verify alignment with funnel stages
- If `COMPETITOR-REPORT.md` exists, compare funnel effectiveness against competitors
- Suggest follow-up: `/market copy` for page-specific copy, `/market emails` for nurture sequences, `/market landing` for CRO deep dive on a specific page
