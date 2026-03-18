---
name: market-emails
description: >
  Ready-to-send email sequences for any business. Triggers: "email sequences",
  "email marketing", "welcome email", "drip campaign", "nurture campaign",
  "email automation", "cart abandonment", "onboarding emails", "cold outreach",
  "email de bienvenida", "secuencia de onboarding", "newsletter setup",
  "quiero hacer email marketing", "customer retention emails".
---

# Email Sequence Generation

Generate complete, ready-to-send email sequences with subject lines, body copy, timing, and segmentation strategy. Output all sequences to `EMAIL-SEQUENCES.md`.

## Invocation

Run as `/market emails <topic/url>`. If URL provided, fetch to understand business/product/audience/voice. If topic, work from description.

---

## Phase 1: Context Gathering

### 1.1 Business Understanding

Establish before writing:

| Context Element | How to Determine |
|----------------|-----------------|
| Business type | Fetch URL or ask user |
| Target audience | Infer from site copy or ask |
| Product/service | Fetch product and pricing pages |
| Price point | Check pricing page |
| Primary CTA | Identify main conversion action |
| Lead magnet | Check for downloads, free trials, demos |
| Voice and tone | Analyze existing copy and social media |

### 1.2 Sequence Type Selection

Select appropriate sequence(s) based on business context. Generate at least 2 types unless user specifies one:

| Sequence Type | When to Use | Email Count | Goal |
|--------------|-------------|-------------|------|
| Welcome | New subscriber or lead magnet download | 5-7 | Build trust, deliver value, introduce product |
| Nurture | Warm leads not yet ready to buy | 6-8 | Educate, build authority, overcome objections |
| Launch | New product or feature release | 8-12 | Build anticipation, drive purchases |
| Re-engagement | Inactive subscribers (30-90 days) | 3-4 | Win back attention or clean list |
| Onboarding | New trial users or new customers | 5-7 | Drive activation, reduce churn |
| Cart Abandonment | E-commerce abandoned checkout | 3-4 | Recover lost revenue |
| Cold Outreach | B2B prospecting | 3-5 | Book meetings, start conversations |

---

## Phase 2: Email Frameworks

### 2.1 Core Rule: One Email, One Job

Every email: ONE main idea, ONE CTA, ONE desired action. Multiple asks split attention and kill click-through rates.

### 2.2 Structural Frameworks

**Value-Before-Ask (welcome/nurture):** 3:1 value-to-ask ratio. Emails 1-2 pure value, Email 3 value + soft mention, Email 4 case study, Email 5 direct ask.

**Story-Driven (nurture, sophisticated audiences):** Hook (story/observation, 2-3 sentences) -> Bridge (connect to reader) -> Lesson (actionable insight) -> CTA (1 sentence + link).

**Problem-Agitate-Solution (launch/cart abandonment):** Problem -> Agitate consequences -> Solution with mechanism -> CTA with urgency.

### 2.3 Subject Line Rules

- Under 50 chars (40 ideal) for mobile
- Front-load important words
- Odd numbers outperform even
- Avoid spam triggers in excess
- Personalize with first name in 20-30% of emails
- Always write preview text (preheader) alongside every subject line
- Write 2 subject line variants per email for A/B testing

Full subject line formulas: `references/email-benchmarks.md`

### 2.4 Send Timing

Cadence and timing benchmarks: `references/email-benchmarks.md`. Welcome sequences: 1-3 days apart. Cold outreach: space further.

---

## Phase 3: Sequence Templates

### 3.1 Welcome Sequence (5-7 Emails)

| Email | Day | Purpose | Subject Template | CTA |
|-------|-----|---------|-----------------|-----|
| 1 | 0 | Deliver + introduce | "Your [lead magnet] is ready" | Download/access resource |
| 2 | 1 | Story + value | "Why I built [product]" | Read story / reply with challenge |
| 3 | 3 | Educate + authority | "[N] [topic] mistakes that cost you [outcome]" | Read guide / watch video |
| 4 | 5 | Social proof + soft pitch | "How [customer] achieved [result]" | See stories / start trial |
| 5 | 7 | Direct pitch + objections | "Is [product] right for you?" | Start trial / book demo |
| 6 | 10 | Urgency + final push (optional) | "Your exclusive offer expires in 48h" | Claim offer |
| 7 | 14 | Transition to ongoing (optional) | "What's next for you and [brand]" | Choose email preferences |

For each email, write full body copy following the framework indicated by sequence position.

### 3.2 Cold Outreach Sequence (3-5 Emails)

| Email | Day | Purpose | Key Rule |
|-------|-----|---------|----------|
| 1 | 1 | Relevance + value | 3-4 sentences max, specific research about their company |
| 2 | 4 | Follow-up + social proof | Reference Email 1, share matching case study |
| 3 | 8 | Breakup + value drop | Acknowledge busy, offer no-strings resource |
| 4 | 14 | New angle (optional) | Different value prop, reference trigger event |
| 5 | 21 | Final close (optional) | Graceful, respectful, leave door open |

### 3.3 Cart Abandonment Sequence (3-4 Emails)

| Email | Timing | Purpose | Key Rule |
|-------|--------|---------|----------|
| 1 | 1 hour | Reminder | Show abandoned product(s) with image, no discount yet |
| 2 | 24 hours | Objection handling | Address top purchase objections, include review, no discount |
| 3 | 72 hours | Incentive | Time-limited discount with explicit expiration |
| 4 | 7 days | Last chance (optional) | Cart will be cleared, final discount chance |

---

## Phase 4: Segmentation and Personalization

Recommend segments based on business type:

| Segment Basis | Examples | How to Use |
|--------------|---------|------------|
| Behavior | Page visits, clicks, downloads, purchases | Trigger relevant follow-up sequences |
| Engagement | Open rate, click rate, recency | Separate engaged vs dormant |
| Source | Organic, paid, referral, social | Tailor welcome sequence to channel |
| Stage | Lead, trial, customer, churned | Different sequences per lifecycle stage |
| Interest | Topic preferences, content consumed | Personalize content recommendations |
| Value | Purchase amount, plan tier, LTV | Prioritize high-value for personal outreach |

A/B testing priorities and sample size guidelines: `references/email-benchmarks.md`.

---

## Phase 5: Metrics and Compliance

Load industry benchmarks from `references/email-benchmarks.md` and include relevant industry row. Include compliance section (CAN-SPAM, GDPR, CASL) from that reference, adapted to user's likely audience geography.

---

## Output Format

Formato de salida: ver `references/output-template.md`.

---

## Cross-Skill Integration

- If `BRAND-VOICE.md` exists, match all copy to documented voice
- If `FUNNEL-ANALYSIS.md` exists, align sequences to identified funnel stages
- If `COPY-SUGGESTIONS.md` exists, reuse value propositions and CTA language
- If `MARKETING-AUDIT.md` exists, reference conversion and content scores
- Suggest follow-up: `/market copy` for website copy, `/market funnel` for conversion path analysis
