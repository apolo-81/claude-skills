---
name: market-proposal
description: >
  Professional marketing service proposals for clients. Triggers: "client
  proposal", "propuesta para cliente", "marketing proposal", "agency proposal",
  "pricing proposal", "oferta comercial", "presentación de servicios",
  "service proposal", "presupuesto para cliente", "quiero ganar un cliente".
  Produces CLIENT-PROPOSAL.md.
---

# Client Proposal Generator for Marketing Services

## Skill Purpose

Genera una propuesta de marketing que vende, no solo describe. El documento debe hacer que el cliente sienta que fue escrito solo para él — con su contexto, su lenguaje, y sus números. Una propuesta bien construida cierra a 2-3x la tasa de una propuesta genérica.

Si `/market audit` fue corrido previamente para este cliente, extraer findings automáticamente para la Situation Analysis. Propuestas respaldadas en datos propios del cliente cierran a mayor tasa porque demuestran que ya conoces el negocio.

## How to Execute

### Step 1: Gather Proposal Inputs

Ask only what's missing — infer from context:

**About the Client:**
1. Client name and company
2. Industry and business model
3. Current marketing situation (what they're doing, what's working)
4. Primary pain points and goals (revenue, leads, brand, growth)
5. Budget range (if known)
6. Decision timeline and key stakeholders

**About the Services:**
1. Services being proposed (SEO, paid ads, content, social, email, full-stack)
2. Engagement model (retainer, project, performance-based)
3. Relevant case studies or results in this industry

### Step 2: Discovery Call Questions (if not done yet)

Provide these 10 questions for the discovery call:

**Business understanding:**
1. "Walk me through your business model. How do you make money?"
2. "Who is your ideal customer? Describe them in detail."
3. "What does your sales process look like from first touch to closed deal?"

**Current marketing:**
4. "What marketing are you doing today, and what's working or not working?"
5. "What's your current monthly marketing spend and the return?"
6. "What tools and platforms are you using?"

**Goals and expectations:**
7. "If we're wildly successful, what does that look like in 6 months? 12 months?"
8. "What specific numbers are you trying to hit — revenue, leads, traffic?"
9. "What's the lifetime value of a customer for you?" — Critical for ROI math

**Decision and process:**
10. "Who else is involved in this decision, and what's your timeline?"

### Step 3: Build the Proposal Document

#### Section 1: Executive Summary (1 page max)

Lead with the client's situation — not your services. The client must feel understood before they read about solutions. If they don't feel understood in the first paragraph, they stop reading.

```
[Client Name] is at an inflection point. With [current situation — e.g., strong
product-market fit but inconsistent lead generation], there's a significant opportunity
to [desired outcome — e.g., scale customer acquisition to support growth targets].

Based on our analysis of [what you reviewed], we've identified [X] key areas where
strategic improvements could drive [specific result — e.g., a 40-60% increase in
qualified leads within 6 months].

This proposal outlines a [timeframe] engagement focused on [primary service areas],
designed to [primary outcome]. We recommend beginning with [first phase] to establish
baselines and quick wins, then scaling based on performance data.
```

#### Section 2: Situation Analysis (2-3 pages)

Frame everything as opportunity, not failure — the client should feel understood, not criticized.

Structure:
1. **Current State Overview** — What they're doing now and performance signals
2. **Opportunities Identified** — Specific areas with improvement potential (with data)
3. **Competitive Landscape** — How they compare (from `/market competitors` if available)
4. **Key Challenges** — Obstacles to address
5. **Market Context** — Industry trends and benchmarks

Good framing: "Your website converts at approximately 1.8%, which is below the industry benchmark of 3.2%. We see a clear path to close this gap through targeted CRO initiatives."
Bad framing: "Your website has a terrible conversion rate."

#### Section 3: Strategy and Approach (2-3 pages)

Be specific enough to demonstrate expertise — not so detailed they can execute without you.

- **Phase 1: Foundation** (Month 1-2) — Audits, setup, baselines, quick wins
- **Phase 2: Growth** (Month 3-4) — Core campaign execution and optimization
- **Phase 3: Scale** (Month 5-6) — Expand what works, cut what doesn't

For each phase: specific activities, expected outcomes, how success is measured.

#### Section 4: Scope of Work (1-2 pages)

Define exactly what's included — and what isn't. Ambiguity creates scope creep, which kills client relationships.

**Explicitly include:** Specific deliverables with quantities (e.g., "8 blog posts/month, 1,500-2,000 words each"), meeting cadence, response time commitments, reporting frequency.

**Explicitly exclude:** Items outside scope (ad spend, software subscriptions, stock photos), additional costs the client pays directly, client responsibilities and SLAs.

#### Section 5: Timeline Visual (1 page)

```
Month 1    | Month 2    | Month 3    | Month 4    | Month 5    | Month 6
-----------|------------|------------|------------|------------|----------
FOUNDATION | FOUNDATION | GROWTH     | GROWTH     | SCALE      | SCALE
Audit &    | Quick wins | Campaign   | Optimize   | Expand     | Full
Setup      | & baselines| Launch     | & iterate  | winners    | throttle
```

Key milestones: Week 2 (audit + strategy complete), Week 4 (first campaigns live), Month 2 (first performance report), Month 6 (comprehensive review).

#### Section 6: Investment — Three-Tier Pricing

**Why three tiers with anchoring:** Presenting the highest tier first sets the client's reference point. The middle tier feels reasonable by comparison — and that's where most clients land. Without anchoring, clients anchor on zero and every number feels expensive. See [`references/proposal-templates.md`](references/proposal-templates.md) for pricing by industry and tier construction guidance.

Always present the highest tier first. Mark the middle tier "Recommended."

| Component | Growth | Accelerate (Recommended) | Dominate |
|---|---|---|---|
| Strategy & Planning | Quarterly review | Monthly strategy | Weekly strategy |
| Content Creation | 4 pieces/month | 8 pieces/month | 16 pieces/month |
| Social Media | 3 platforms | 5 platforms | All platforms |
| Paid Ads Management | Up to $5K spend | Up to $15K spend | Up to $50K spend |
| SEO | Basic on-page | Full SEO program | Full SEO + link building |
| Email Marketing | — | Monthly newsletter | Full automation |
| Reporting | Monthly | Bi-weekly | Weekly dashboard |
| **Monthly Investment** | **$X,XXX** | **$X,XXX** | **$X,XXX** |

#### Section 7: ROI Projection

**Why ROI projections close deals:** Skeptical clients aren't buying services — they're buying outcomes. Showing the math transforms the conversation from "this costs $X" to "this generates $Y." It makes the investment logical, not emotional.

```
Current State:
- Monthly website traffic: [X]
- Current conversion rate: [X%]
- Current leads/month: [X]
- Close rate: [X%] | Average deal value: $[X]
- Current monthly revenue from marketing: $[X]

Projected State (6 months):
- Traffic increase: +[X%] → [new total]
- Conversion rate improvement: [X%] → [new rate]
- Projected revenue increase: $[X]/month
- 6-month projected ROI: [X]x

Investment: $[total 6-month cost]
Projected Return: $[projected revenue increase × 6 months]
ROI: [X]x return on investment
```

Be conservative — use ranges. Add: "Results depend on market conditions, client participation, and execution quality." Under-promise and over-deliver.

**Why "cost of not acting" matters:** Include a line showing what the client loses per month by staying at current performance. This transforms "should I spend this money?" into "can I afford not to?"

#### Section 8: Case Studies (1-2 pages)

Include 2-3 results from similar clients. Anonymize if needed. Use this structure:

```
Client: [Industry + company type]
Challenge: [1-2 sentences about their situation]
Solution: [What you did]
Results:
- [Specific metric: e.g., "Increased organic traffic 287% in 6 months"]
- [Specific metric: e.g., "Reduced cost per lead from $45 to $12"]
- [Specific metric: e.g., "Generated $180K in new revenue"]
```

#### Section 9: Next Steps (0.5 page)

Make the path forward frictionless. Every extra step between reading and signing costs conversions.

```
Ready to move forward? Here's what happens next:

1. Sign this proposal (e-signature link)
2. We schedule a kickoff call within 48 hours
3. You receive our onboarding questionnaire and access request form
4. We begin the Foundation phase immediately

Questions? Contact [Name] at [email] or [phone].
This proposal is valid until [date — 30 days from today].
```

### Step 4: Follow-Up Sequence After Sending

| Day | Action |
|---|---|
| 0 | Send proposal. Subject: "Your Marketing Growth Plan — [Client Name]" |
| 2 | "Wanted to make sure you received it — happy to walk through it on a call." |
| 5 | Value-add: share a relevant insight, softly reference the proposal |
| 7 | "I'd love your thoughts. Available [specific times] this week." |
| 14 | "Checking in — if timing isn't right, happy to reconnect when it makes sense." |
| 21 | Breakup email: "I'll close this proposal on [expiration]. If things change, my door is always open." |

### Step 5: Objection Handling

See [`references/proposal-templates.md`](references/proposal-templates.md) for full objection scripts. Key responses:

- **"Too expensive"** — Reframe as investment, show ROI math, offer smaller starting scope
- **"We can do this in-house"** — Highlight opportunity cost, speed-to-results, fully-loaded in-house cost
- **"We tried this before"** — Ask what specifically failed, differentiate your approach, offer pilot
- **"We need to think about it"** — Set specific follow-up date, offer to address specific concerns
- **"Can you guarantee results?"** — Share historical results, offer performance component, explain why guarantees misalign incentives

## Output Format

Generate `CLIENT-PROPOSAL.md` in the project root:

```markdown
# Marketing Services Proposal

**Prepared for:** [Client Name / Company]
**Prepared by:** [Your Name / Agency]
**Date:** [Date]
**Valid until:** [Date + 30 days]

---

## Table of Contents
1. Executive Summary
2. Situation Analysis
3. Strategy & Approach
4. Scope of Work
5. Timeline
6. Investment
7. ROI Projection
8. Case Studies
9. Next Steps

---

## 1. Executive Summary
[2-3 paragraph client-specific summary — client situation first, solutions second]

## 2. Situation Analysis
[Current state, opportunities, competitive landscape, challenges]

## 3. Strategy & Approach
[Phase 1, 2, 3 with specific activities and measurable outcomes]

## 4. Scope of Work
[Deliverables with quantities, explicit exclusions, client responsibilities]

## 5. Timeline
[Visual Gantt-style timeline with milestones]

## 6. Investment
[Three-tier pricing table — highest tier first, middle marked "Recommended"]

## 7. ROI Projection
[Current state → projected state math + cost of not acting]

## 8. Case Studies
[2-3 relevant results in similar industries]

## 9. Next Steps
[Clear 4-step path forward with CTA and expiration date]

---

## Appendix
- Terms & Conditions
- Detailed Deliverable Descriptions
- Tool Stack Overview
```

## Key Principles

- The proposal is a sales document, not a statement of work. It must SELL, not just describe.
- Lead with the client's problems and goals — make them feel understood before presenting solutions.
- Every price needs context. Never present cost without anchoring it to the ROI it will generate.
- Mirror the client's language from discovery call notes. Use their exact words for problems and goals.
- Keep it under 15 pages. Executives skim — use bold, headers, and tables to make key info scannable.
- Always include a specific, time-bound next step. Ambiguity is where deals die.
