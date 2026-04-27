---
name: market-funnel
description: >
  Análisis y optimización del embudo de ventas de visita a compra.
  Usar cuando: "embudo de ventas", "funnel analysis", "CRO", "por qué no compran",
  "dónde pierdo clientes", "optimizar checkout", "signup friction",
  "onboarding drop-off", "optimizar conversiones".
---

# Sales Funnel Analysis & Optimization

Map the complete conversion path, identify drop-off points, quantify friction, and deliver optimizations ranked by revenue impact. Write analysis to `FUNNEL-ANALYSIS.md`.

## Invocation

Run as `/market funnel <url>`. Fetch the target site and trace every step from landing to conversion.

---

## Phase 1: Funnel Discovery and Mapping

### 1.1 Identify Funnel Type

Full reference table with types, steps, and key metrics: `references/funnel-frameworks.md`. Main types:

- **Lead Gen**: Landing -> Form -> Thank you -> Nurture -> Call
- **SaaS Trial**: Homepage -> Pricing -> Signup -> Onboarding -> Upgrade
- **SaaS Demo**: Homepage -> Features -> Demo request -> Sales call -> Close
- **E-commerce**: Product page -> Cart -> Checkout -> Upsell -> Thank you
- **Webinar**: Opt-in -> Confirmation -> Reminder -> Live -> Offer -> Checkout
- **Application**: Info page -> Form -> Review -> Interview -> Accept

### 1.2 Map Every Funnel Step

For each page document:

```
STEP [#]: [Page Name]
  URL: [url]
  Page Type: [landing/product/pricing/cart/checkout/form/thank-you]
  Primary Action: [what user should do]
  Next Step: [where user should go]
  Exit Points: [where users might leave]
  Friction Elements: [anything that slows/confuses]
  Trust Elements: [anything that builds confidence]
  Estimated Load Time: [fast/moderate/slow]
```

### 1.3 Visual Funnel Map

Create ASCII funnel map with estimated conversion rates at each step. Adjust percentages to match observations or user-provided data.

---

## Phase 2: Page-by-Page Analysis

### 2.1 Page Scoring Framework

Score each page on 5 dimensions (0-10 each). Page score = average.

| Dimension | What to Evaluate |
|-----------|-----------------|
| Clarity | Is page purpose immediately obvious? |
| Continuity | Does it logically continue from previous step? |
| Motivation | Enough reason to take next action? |
| Friction | How easy to complete desired action? (10 = frictionless) |
| Trust | Trust signals appropriate for commitment level? |

Score interpretation: 8-10 optimized; 6-7 functional; 4-5 priority fix; 0-3 critical.

### 2.2 Drop-Off Patterns

Common drop-off causes, signals, and fixes by stage: `references/funnel-frameworks.md`. Key stages to analyze:
- Homepage to next step (value proposition, CTA clarity, speed, mobile)
- Pricing page (price shock, too many options, missing social proof, unanswered objections)
- Signup/registration (field count, premature account requirement, missing social login)
- Checkout/purchase (surprise costs, forced registration, payment options, missing guarantee)

### 2.3 Lead Magnet Scoring

If funnel includes a lead magnet, score on (0-10 each): Relevance, Specificity, Perceived value, Quick win, Product alignment, Opt-in friction.

---

## Phase 3: Funnel Metrics and Revenue Impact

### 3.1 Key Funnel Metrics

Calculate or estimate. Ask user for traffic/revenue if not inferable:

```
Traffic: Monthly Visitors, Traffic Sources breakdown
Conversion: Visitor->Lead, Lead->MQL, MQL->Opportunity, Opportunity->Customer, Overall
Revenue: AOV, LTV, CAC, LTV:CAC Ratio (target 3:1+), RPV
```

Benchmarks by funnel type: `references/funnel-frameworks.md`.

### 3.2 Revenue Per Visitor (RPV)

RPV = Monthly Revenue / Monthly Visitors. The master metric for funnel optimization.

Always translate recommendations into RPV and annual revenue impact. Show three scenarios: conservative, base case, aggressive.

Lift estimates for common optimizations: `references/funnel-frameworks.md`.

---

## Phase 4: Optimization Recommendations

### 4.1 Prioritization Matrix

| Priority | Impact | Effort | Timeline |
|----------|--------|--------|----------|
| P1 — Do Now | >10% lift | <1 day | This week |
| P2 — Plan | >10% lift | 1-5 days | This month |
| P3 — Schedule | 5-10% lift | <1 day | This month |
| P4 — Backlog | 5-10% lift | 5+ days | This quarter |
| P5 — Nice to Have | <5% lift | Any | When resources allow |

### 4.2 Stage-Specific Optimizations

**Top of Funnel:** Headline A/B testing (10-30%), social proof above fold (5-15%), page speed (5-20%), exit-intent popup (2-5% of exiting visitors).

**Middle of Funnel:** Case studies (10-20%), comparison/"vs" pages (5-15%), interactive demos (15-30%), retargeting emails (10-25%).

**Bottom of Funnel:** Pricing page redesign (10-25%), checkout friction reduction (5-15% per friction point), risk reversal (10-20%), urgency elements (5-15%), cart abandonment emails (5-15% of carts).

**Post-Purchase:** Onboarding emails (10-20% churn reduction), upsell on thank-you page (5-15% AOV lift), referral program (5-15% new acquisition), NPS at 30 days.

### 4.3 Pricing Page Deep Audit

Use full checklist from `references/funnel-frameworks.md`. Key elements: value-framing headline, max 3 plans, highlighted "Most Popular", annual pricing first, social proof near pricing, FAQ for top objections, guarantee, action-language CTAs.

### 4.4 Checkout/Signup Friction Audit

Full friction audit: `references/funnel-frameworks.md`. Core: count fields (3-5 lead gen, 5-8 checkout), count steps (1-3 max), progress indicators, mobile usability, inline validation quality.

---

## Phase 5: Nurture Integration and Traffic Alignment

### 5.1 Funnel-to-Email Mapping

For each funnel stage, recommend appropriate email sequence. Complete mapping: `references/funnel-frameworks.md`.

### 5.2 Traffic Source Alignment

Match source to entry point based on intent/trust level. Complete table: `references/funnel-frameworks.md`. Core principle: high-intent branded search -> pricing/signup; cold social -> lead magnet/educational page.

---

## Output Format

Formato de salida: ver `references/output-template.md`.

---

## Cross-Skill Integration

- If `MARKETING-AUDIT.md` exists, reference conversion scores already captured
- If `COPY-SUGGESTIONS.md` exists, apply copy improvements to friction pages
- If `EMAIL-SEQUENCES.md` exists, verify alignment with funnel stages
- If `COMPETITOR-REPORT.md` exists, compare funnel effectiveness against competitors
- Suggest follow-up: `/market copy` for page-specific copy, `/market emails` for nurture sequences, `/market landing` for CRO deep dive on specific page
