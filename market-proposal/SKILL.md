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

Genera una propuesta de marketing que vende, no solo describe. El documento debe hacer que el cliente sienta que fue escrito solo para el. Si `/market audit` fue corrido previamente, extraer findings automaticamente para la Situation Analysis.

## How to Execute

### Step 1: Gather Proposal Inputs

Ask only what's missing — infer from context:

**About the Client:**
1. Client name and company
2. Industry and business model
3. Current marketing situation
4. Primary pain points and goals
5. Budget range (if known)
6. Decision timeline and key stakeholders

**About the Services:**
1. Services being proposed
2. Engagement model (retainer, project, performance-based)
3. Relevant case studies

### Step 2: Discovery Call Questions

10 questions grouped by purpose:

**Business understanding:** (1) Business model and revenue, (2) Ideal customer profile, (3) Sales process from first touch to close.

**Current marketing:** (4) What's working/not working, (5) Current spend and return, (6) Tools and platforms.

**Goals:** (7) Success vision at 6/12 months, (8) Specific target numbers, (9) Customer lifetime value.

**Decision:** (10) Who's involved and timeline?

### Step 3: Build the Proposal Document

#### Section 1: Executive Summary (1 page max)

Lead with client's situation, not your services. Formula: Sentence 1 = name their specific situation. Sentence 2 = opportunity identified with data. Sentence 3 = recommended approach and why.

Detailed executive summary writing guide: `references/proposal-templates.md`.

#### Section 2: Situation Analysis (2-3 pages)

Frame everything as opportunity, not failure. Structure:
1. **Current State Overview** — performance signals
2. **Opportunities Identified** — with data
3. **Competitive Landscape** — from `/market competitors` if available
4. **Key Challenges**
5. **Market Context** — industry trends and benchmarks

#### Section 3: Strategy and Approach (2-3 pages)

- **Phase 1: Foundation** (Month 1-2) — Audits, setup, baselines, quick wins
- **Phase 2: Growth** (Month 3-4) — Core campaign execution and optimization
- **Phase 3: Scale** (Month 5-6) — Expand what works, cut what doesn't

For each phase: specific activities, expected outcomes, success metrics.

#### Section 4: Scope of Work (1-2 pages)

**Explicitly include:** Specific deliverables with quantities, meeting cadence, response time, reporting frequency.

**Explicitly exclude:** Ad spend, software subscriptions, stock photos, additional costs, client responsibilities and SLAs.

#### Section 5: Timeline Visual (1 page)

```
Month 1    | Month 2    | Month 3    | Month 4    | Month 5    | Month 6
FOUNDATION | FOUNDATION | GROWTH     | GROWTH     | SCALE      | SCALE
```

Key milestones: Week 2 (audit complete), Week 4 (first campaigns live), Month 2 (first report), Month 6 (comprehensive review).

#### Section 6: Investment — Three-Tier Pricing

Present highest tier first. Mark middle tier "Recommended." Pricing psychology, tier construction, and industry pricing ranges: `references/proposal-templates.md` and `references/pricing-strategy.md`.

| Component | Growth | Accelerate (Recommended) | Dominate |
|---|---|---|---|
| Strategy & Planning | Quarterly review | Monthly strategy | Weekly strategy |
| Content Creation | 4 pieces/month | 8 pieces/month | 16 pieces/month |
| Reporting | Monthly | Bi-weekly | Weekly dashboard |
| **Monthly Investment** | **$X,XXX** | **$X,XXX** | **$X,XXX** |

#### Section 7: ROI Projection

ROI calculation formulas and confidence factors: `references/proposal-templates.md`.

Include: current state metrics, projected state, 6-month ROI, and cost of not acting.

Be conservative — use ranges. Add disclaimer: "Results depend on market conditions, client participation, and execution quality."

#### Section 8: Case Studies (1-2 pages)

2-3 results from similar clients. Structure: Client (industry + type) -> Challenge -> Solution -> Results (3 specific metrics).

#### Section 9: Next Steps (0.5 page)

```
1. Sign this proposal (e-signature link)
2. Kickoff call within 48 hours
3. Onboarding questionnaire and access request form
4. Foundation phase begins immediately

Questions? Contact [Name] at [email] or [phone].
Valid until [date — 30 days from today].
```

### Step 4: Follow-Up Sequence

| Day | Action |
|---|---|
| 0 | Send proposal |
| 2 | Check receipt, offer walkthrough call |
| 5 | Value-add insight, soft reference proposal |
| 7 | Specific availability for discussion |
| 14 | Checking in — open to reconnect later |
| 21 | Breakup: closing proposal on expiration |

### Step 5: Objection Handling

Full objection response scripts: `references/objections.md`. Key objections: "Too expensive", "We can do this in-house", "We tried this before", "We need to think about it", "Can you guarantee results?"

## Output Format

Formato de salida: ver `references/output-template.md`.

## Key Principles

- Lead with client's problems and goals — make them feel understood first
- Every price needs ROI context
- Mirror client's exact language from discovery
- Keep under 15 pages — use bold, headers, tables for scannability
- Always include specific, time-bound next step
