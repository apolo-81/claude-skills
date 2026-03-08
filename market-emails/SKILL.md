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

Generate complete, ready-to-send email sequences with subject lines, body copy, timing, and segmentation strategy. Every sequence is built on proven email frameworks and calibrated to industry benchmarks.

## Invocation

Run as `/market emails <topic/url>`. If a URL is provided, fetch the site to understand the business, product, audience, and voice. If a topic is provided, work from the description. Output all sequences to `EMAIL-SEQUENCES.md` in the working directory.

---

## Phase 1: Context Gathering

### 1.1 Business Understanding

Establish these elements before writing a single word of copy:

| Context Element | How to Determine | Why It Matters |
|----------------|-----------------|----------------|
| Business type | Fetch URL or ask user | Determines sequence type and appropriate tone |
| Target audience | Infer from site copy or ask | Shapes language, pain points, and examples |
| Product/service | Fetch product and pricing pages | Drives value propositions in every email |
| Price point | Check pricing page | Higher price requires longer nurture before the ask |
| Primary CTA | Identify the main conversion action | Every email builds toward this single goal |
| Lead magnet | Check for downloads, free trials, demos | Sets the entry point for the welcome sequence |
| Voice and tone | Analyze existing copy and social media | Emails that mismatch brand voice feel like spam |

### 1.2 Sequence Type Selection

Select the appropriate sequence(s) based on business context. Generate at least 2 types unless the user specifies one:

| Sequence Type | When to Use | Email Count | Goal |
|--------------|-------------|-------------|------|
| Welcome | New subscriber or lead magnet download | 5-7 | Build trust, deliver value, introduce product |
| Nurture | Warm leads not yet ready to buy | 6-8 | Educate, build authority, overcome objections |
| Launch | New product or feature release | 8-12 | Build anticipation, drive purchases |
| Re-engagement | Inactive subscribers (30-90 days) | 3-4 | Win back attention or clean the list |
| Onboarding | New trial users or new customers | 5-7 | Drive activation, reduce churn, show value |
| Cart Abandonment | E-commerce abandoned checkout | 3-4 | Recover lost revenue |
| Cold Outreach | B2B prospecting | 3-5 | Book meetings, start conversations |

---

## Phase 2: Email Frameworks

### 2.1 Core Philosophy: One Email, One Job

Every email must have exactly ONE primary purpose: one main idea, one call-to-action, one desired reader action.

Multiple asks in a single email split the reader's attention and eliminate the clarity that drives clicks. The #1 cause of low click-through rates is emails that try to do too much at once.

### 2.2 Structural Frameworks

**Value-Before-Ask (use for welcome and nurture sequences):**
```
Email 1: Pure value — no ask
Email 2: Pure value — no ask
Email 3: Value + soft mention of product
Email 4: Value + case study showing product results
Email 5: Direct ask with urgency
```
Maintain a 3:1 value-to-ask ratio. Audiences tolerate pitches when they've already received genuine value.

**Story-Driven (use for nurture sequences and sophisticated audiences):**
```
Hook: Open with a story, observation, or surprising fact (2-3 sentences)
Bridge: Connect the story to the reader's situation (1-2 sentences)
Lesson: Extract the actionable insight (2-3 sentences)
CTA: Link the lesson to the next step (1 sentence + link)
```

**Problem-Agitate-Solution (use for launch emails and cart abandonment):**
```
Problem: "Are you struggling with [specific pain]?"
Agitate: "Every day you wait, [consequence]. Your competitors are already..."
Solution: "[Product] solves this by [mechanism]. Here's how..."
CTA: "Start your free trial and see the difference in 24 hours."
```

### 2.3 Subject Line Rules

Subject lines determine whether the email gets opened — they deserve as much attention as the body copy.

- Keep under 50 characters for mobile (40 is ideal)
- Front-load the most important words — inbox previews cut off at different lengths
- Use numbers when possible; odd numbers outperform even numbers
- Avoid spam triggers in excess: "free," "guarantee," "act now," "limited time"
- Personalize with first name in 20-30% of emails — not every one (feels mechanical)
- Write the preview text (preheader) alongside every subject line — it's effectively a second subject line
- Always write 2 subject line variants per email for A/B testing

For a full subject line formula reference, see: `references/email-benchmarks.md`

### 2.4 Send Timing

Cadence and timing benchmarks are documented in `references/email-benchmarks.md`. Key principle: for welcome sequences, emails spaced 1-3 days apart maintain momentum without overwhelming. For cold outreach, space emails further to avoid appearing desperate.

---

## Phase 3: Sequence Templates

### 3.1 Welcome Sequence (5-7 Emails)

The welcome sequence is the highest-ROI sequence in any email program. Open rates are 3-4x higher than regular campaigns because the subscriber just opted in and your brand is top of mind. Use this window to build relationship before selling.

```
Email 1 (Immediate): DELIVER + INTRODUCE
  Subject: "Your [lead magnet] is ready — plus a quick question"
  Body: Deliver the promised resource. Set expectations for future emails.
        Ask one engaging question to prompt a reply (replies signal to ESPs
        that you're a sender worth delivering).
  CTA: Download/access the lead magnet

Email 2 (Day 1): STORY + VALUE
  Subject: "Why I built [product] (the honest version)"
  Body: Founder story or origin story. Connect to the reader's problem.
        Demonstrate empathy and shared experience — not features.
  CTA: Read the full story / reply with your biggest challenge

Email 3 (Day 3): EDUCATE + AUTHORITY
  Subject: "[Number] [topic] mistakes that cost you [outcome]"
  Body: Educational content that solves a real problem without requiring
        the product. This email builds credibility for the pitch in Email 5.
  CTA: Read the full guide / watch the video

Email 4 (Day 5): SOCIAL PROOF + SOFT PITCH
  Subject: "How [customer name] achieved [specific result]"
  Body: Case study or testimonial with specific numbers and timeline.
        Natural transition to how the product helped. Proof before pitch.
  CTA: See more customer stories / start your trial

Email 5 (Day 7): DIRECT PITCH + OBJECTION HANDLING
  Subject: "Is [product] right for you? (honest assessment)"
  Body: Direct pitch. Address the top 3 objections explicitly.
        Include risk reversal: guarantee, trial period, or refund policy.
  CTA: Start your free trial / book a demo

Email 6 (Day 10, optional): URGENCY + FINAL PUSH
  Subject: "Your exclusive offer expires in 48 hours"
  Body: Limited-time incentive for new subscribers. Recap key benefits
        and social proof. Create genuine urgency — not manufactured scarcity.
  CTA: Claim your offer before it expires

Email 7 (Day 14, optional): TRANSITION TO ONGOING
  Subject: "What's next for you and [brand]"
  Body: Set expectations for future emails. Segment subscribers by asking
        what topics they care about most — this improves relevance for all
        future sends.
  CTA: Click to choose your email preferences
```

### 3.2 Cold Outreach Sequence (3-5 Emails)

```
Email 1 (Day 1): RELEVANCE + VALUE
  Subject: "[Mutual connection/trigger event] + quick question"
  Body: 3-4 sentences max. Lead with specific research about their company.
        Offer targeted value — not a generic pitch. Reference something real.
  CTA: "Would it make sense to chat for 15 minutes this week?"

Email 2 (Day 4): FOLLOW-UP + SOCIAL PROOF
  Subject: "Re: [original subject]"
  Body: 2-3 sentences. Reference Email 1. Share a case study result that
        directly matches their company's situation.
  CTA: "I put together a quick breakdown of how this could work for [company].
        Want me to send it over?"

Email 3 (Day 8): BREAKUP + VALUE DROP
  Subject: "Closing the loop on [topic]"
  Body: 2-3 sentences. Acknowledge they're busy. Offer a no-strings resource.
        Make it easy to say no — low-pressure close preserves the relationship.
  CTA: "Either way, here's [resource] — thought you'd find it useful."

Email 4 (Day 14, optional): NEW ANGLE
  Subject: "[New angle based on recent trigger event]"
  Body: Different value proposition from Email 1. Reference something new:
        job posting, funding news, product launch, industry shift.
  CTA: "Saw [trigger event] — this might be relevant now."

Email 5 (Day 21, optional): FINAL CLOSE
  Subject: "Not the right time?"
  Body: 1-2 sentences. Graceful, respectful close. Leave the door open.
  CTA: "If timing changes, here's my calendar: [link]"
```

### 3.3 Cart Abandonment Sequence (3-4 Emails)

Cart abandonment emails recover 5-15% of abandoned revenue — one of the highest-ROI automations in e-commerce. The sequence progressively increases urgency and incentive.

```
Email 1 (1 hour after abandonment): REMINDER
  Subject: "You left something behind"
  Body: Show the abandoned product(s) with image. Simple reminder —
        no discount yet. Address potential technical issues ("Did something
        go wrong at checkout?").
  CTA: "Complete your order"

Email 2 (24 hours): OBJECTION HANDLING
  Subject: "Still thinking about [product]?"
  Body: Address top purchase objections (shipping cost, returns policy,
        product quality). Include a customer review. No discount yet —
        answer the doubt first.
  CTA: "Complete your order — free shipping included"

Email 3 (72 hours): INCENTIVE
  Subject: "[Name], here's 10% off your cart"
  Body: Time-limited discount with explicit expiration. Restate key product
        benefits. The discount comes after two non-discount emails — it feels
        earned rather than expected.
  CTA: "Use code SAVE10 — expires in 24 hours"

Email 4 (7 days, optional): LAST CHANCE
  Subject: "Your cart is about to expire"
  Body: Final reminder. Cart will be cleared. Final chance for discount.
  CTA: "Save your cart before it's gone"
```

---

## Phase 4: Segmentation and Personalization

### 4.1 Why Segmentation Matters

Sending the same email to every subscriber is the fastest way to erode a list. Subscribers at different lifecycle stages have different needs, objections, and readiness levels. Segmentation ensures each subscriber receives content relevant to where they are in the journey — which directly drives open rates, click rates, and conversion.

Recommend segments based on the business type:

| Segment Basis | Examples | How to Use |
|--------------|---------|------------|
| Behavior | Page visits, clicks, downloads, purchases | Trigger relevant follow-up sequences |
| Engagement | Open rate, click rate, recency | Separate engaged vs dormant subscribers |
| Source | Organic, paid, referral, social | Tailor welcome sequence to acquisition channel |
| Stage | Lead, trial, customer, churned | Different sequences for each lifecycle stage |
| Interest | Topic preferences, content consumed | Personalize content recommendations |
| Value | Purchase amount, plan tier, LTV | Prioritize high-value segments for personal outreach |

### 4.2 A/B Testing Plan

For each sequence, suggest prioritized tests. Testing in this order maximizes learning per test:

1. Subject lines — biggest lever for open rate (test 2 per email)
2. CTA text and offer — biggest lever for click rate
3. Send timing — 10-20% variance depending on audience
4. Email length — short (under 200 words) vs long (500+ words)
5. Format — plain text vs HTML vs hybrid
6. With/without personalization
7. With/without images

See `references/email-benchmarks.md` for sample size requirements and statistical significance guidelines.

---

## Phase 5: Metrics and Compliance

Load industry benchmarks from `references/email-benchmarks.md` and include the relevant industry row in the output. Also include the full compliance section (CAN-SPAM, GDPR, CASL) from that reference file, adapted to the user's likely audience geography.

---

## Output Format: EMAIL-SEQUENCES.md

Write the complete output to `EMAIL-SEQUENCES.md`. Structure:

```markdown
# Email Sequences: [Business/Topic Name]
**Date:** [current date]
**Business Type:** [type]
**Target Audience:** [description]
**Sequences Generated:** [list]

---

## Sequence 1: [Sequence Type]

### Overview
- **Goal:** [primary goal]
- **Emails:** [count]
- **Duration:** [total days]
- **Expected Open Rate:** [benchmark from references]%
- **Expected Click Rate:** [benchmark from references]%

### Email 1: [Name]
**Send:** [timing]
**Subject Line:** [primary]
**Subject Line B (A/B test):** [alternative]
**Preview Text:** [preheader — always write this]

---

[Full email body copy here — ready to paste into an ESP]

---

**CTA:** [button text]
**CTA Link:** [destination]
**Goal:** [what this email should accomplish]
**Segmentation Notes:** [who receives this and any conditions]

[Repeat for each email in the sequence]

---

## Segmentation Strategy
[Recommended segments and trigger conditions]

## A/B Testing Plan
[Prioritized tests with expected impact]

## Metrics to Track
[KPIs with industry benchmarks from references/email-benchmarks.md]

## Compliance Checklist
[CAN-SPAM, GDPR, CASL — adapted to audience geography]

## Implementation Notes
[ESP recommendations, automation setup, tagging strategy]
```

---

## Terminal Summary

After writing EMAIL-SEQUENCES.md, display:

```
=== EMAIL SEQUENCES GENERATED ===

Business: [name]
Sequences: [list]
Total Emails: [count]

Sequence Overview:
  [Sequence type] ([N] emails, [N] days) — [goal]

Benchmark Targets ([Industry]):
  Open Rate: [X]%
  Click Rate: [X]%
  Conversion Rate: [X]%

Full sequences saved to: EMAIL-SEQUENCES.md
```

---

## Cross-Skill Integration

- If `BRAND-VOICE.md` exists, match all copy to the documented voice
- If `FUNNEL-ANALYSIS.md` exists, align sequences to the identified funnel stages
- If `COPY-SUGGESTIONS.md` exists, reuse value propositions and CTA language
- If `MARKETING-AUDIT.md` exists, reference conversion and content scores
- Suggest follow-up: `/market copy` for website copy, `/market funnel` for conversion path analysis
