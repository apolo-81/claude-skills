---
name: market-launch
description: >
  Product/service launch playbook with week-by-week timeline. Triggers:
  "launch plan", "go-to-market", "GTM", "product launch", "launch strategy",
  "voy a lanzar", "estrategia de lanzamiento", "launch playbook",
  "pre-launch checklist", "lanzamiento de producto", "launch campaign",
  "cómo lanzo mi producto". Produces LAUNCH-PLAYBOOK.md.
---

# Product/Service Launch Playbook Generator

## Skill Purpose

Genera un playbook de lanzamiento táctico y personalizado: timeline semana a semana, templates de email listos para copiar, posts por canal, coordinación de partners, métricas en tiempo real y plan post-lanzamiento. El output es copy que se puede usar de inmediato, no frameworks que hay que rellenar.

Si el usuario ya corrió `/market audit` o `/market brand`, pull findings de esos reportes para informar el positioning y mensajes del lanzamiento.

## How to Execute

### Step 1: Gather Launch Context

Ask only what's missing — infer what you can from context:

1. **What are you launching?** (product, service, feature, course, event)
2. **Target audience?** (demographics, pain points, list size)
3. **Primary goal?** (revenue target, signups, downloads, awareness)
4. **Launch date?** (work backwards from here to size the timeline)
5. **Channels available?** (email list size, social following, ad budget, partnerships)
6. **Price point?** (if applicable)
7. **Existing customers/users?** (for beta, testimonials, case studies)
8. **Budget level?** (bootstrapped / moderate / well-funded)

### Step 2: Select Launch Type

| Launch Type | Best For | Primary Channel | Timeline Needed |
|---|---|---|---|
| Product Hunt | SaaS, dev tools, consumer apps | Product Hunt + X/Twitter | 4-6 weeks |
| Email List | Course, info product, SaaS | Email sequences | 6-8 weeks |
| Social-First | Consumer product, personal brand | Twitter/X, LinkedIn, Instagram | 4-6 weeks |
| Paid Ads | E-commerce, proven product | Meta / Google Ads | 2-4 weeks prep |
| Community | Niche tools, developer products | Reddit, Discord, Slack | 6-8 weeks |
| Partner | B2B, enterprise, marketplace | Partner channels | 8-12 weeks |
| Hybrid | High-stakes launch | Multi-channel coordinated | 8-12 weeks |

### Step 3: Build the Timeline

Generate the full week-by-week plan. For the complete task list per phase, see [`references/launch-frameworks.md`](references/launch-frameworks.md).

**Why a 2-4 week pre-launch phase matters:** Audiences that have seen the product coming convert at 3-5x the rate of cold audiences on launch day. The pre-launch phase exists to warm people up before asking them to buy. Skipping it means launching to silence.

**Phase overview:**
- **Weeks 1-2 — Foundation:** Positioning, landing page, analytics, email sequences drafted, beta tester list
- **Weeks 3-4 — Audience Building:** Content seeding, community engagement, beta onboarding, partner outreach
- **Weeks 5-6 — Pre-Launch Intensification:** Pre-launch email sequence, launch assets finalized, partners briefed, urgency mechanism set
- **Week 7 — Launch Week:** Day-by-day execution (Soft Mon → Public Tue → Social proof Wed → Objection handling Thu → Urgency close Fri-Sun)
- **Week 8 — Post-Launch:** Survey, retrospective, onboarding optimization, ongoing marketing engine

**Compressed timeline (less than 8 weeks):** Combine phases, prioritize email + community over paid ads, cut audience-building to 1 week of intense outreach. See minimum viable launch below.

**Minimum viable launch (bootstrapped, short timeline):**
- Week 1: Landing page + positioning statement
- Week 2: 10-20 personal outreach messages to target users
- Week 3: 3-email pre-launch sequence
- Launch day: Email + 3-5 community posts + personal social thread

### Step 4: Email Sequence

Generate complete, product-specific email copy — not placeholders. See [`references/launch-frameworks.md`](references/launch-frameworks.md) for full email templates.

**Why 7 emails instead of 1:** A single launch email converts 1-3% of the list. A 7-email sequence converts 5-15%. Research shows 60-70% of launch revenue comes from Days 3-7, not Day 1. The follow-up sequence is where the money is.

**Pre-launch sequence (Weeks 5-6):**
- Email 1 — The Teaser (2 weeks before): Build anticipation without full reveal. Primes the audience for multiple touchpoints before asking to buy.
- Email 2 — The Reveal (1 week before): Product screenshots/video, beta results, launch date + early bird offer
- Email 3 — Social Proof (3 days before): 2-3 beta tester results with specific numbers. Answers "does it work?" before launch day.

**Launch sequence (Week 7):**
- Email 4 — The Launch (Day 1): Clear offer, early bird pricing, direct CTA
- Email 5 — Social Proof Follow-Up (Day 3): First customer reactions, FOMO trigger
- Email 6 — Objection Handler (Day 4): Address top 3-5 objections, guarantee/risk reversal
- Email 7 — Urgency Close (Day 5-7): Deadline reminder, final testimonial, single CTA

### Step 5: Social Media Content

Generate platform-specific posts for launch week. Full templates in [`references/launch-frameworks.md`](references/launch-frameworks.md).

**Why the warm audience is the critical asset:** Social posts to a cold audience get 0.1-0.5% engagement. Posts to a pre-warmed audience that has seen the product coming get 2-8%. Build the audience first; then publish the launch content.

Key principles per platform:
- **Twitter/X:** Lead with the launch story as a thread (problem → solution → results → offer)
- **LinkedIn:** Lead with personal insight and problem relatability before the product
- **Instagram:** Lead image = result/outcome, not product screenshot

### Step 6: Partner and Influencer Coordination

Give partners everything they need to promote without effort:
- Free product access
- Swipe copy for email, social, and blog (ready to paste)
- Branded graphics
- Unique affiliate/referral link
- Commission structure or reciprocal promotion plan
- Launch day schedule with specific time asks

Outreach timeline: initial contact Week 3 → confirmation + swipe copy Week 5 → launch-day coordination Week 7.

### Step 7: Launch Metrics

Track these in real-time during launch week. Full benchmark table in [`references/launch-frameworks.md`](references/launch-frameworks.md).

Key live metrics:
- Website traffic by source (which channels are driving)
- Conversion rate on landing/checkout page (2-5% cold, 10-30% warm list)
- Email open rates (30-50% for engaged list on launch day)
- Revenue and AOV vs. target
- Cost per acquisition (if running paid)

### Step 8: Common Launch Mistakes

Top 5 most costly:
1. **Launching to nobody** — Build audience before the product is ready. Sequence matters.
2. **No urgency mechanism** — Without a deadline, people bookmark and forget. Use early bird pricing, limited spots, or bonus expiration.
3. **No follow-up sequence** — Single launch email converts 1-3%; 7-email sequence converts 5-15%
4. **Forgetting mobile** — Test every email, page, and checkout on mobile before launch
5. **No post-launch plan** — The launch opens the marketing engine; what follows determines the business outcome

## Output Format

Generate `LAUNCH-PLAYBOOK.md` in the project root:

```markdown
# Launch Playbook: [Product Name]

**Launch Date:** [Date]
**Launch Type:** [Type]
**Primary Goal:** [Specific target — e.g., "$15,000 in Week 1 revenue"]
**Audience:** [Description + list size]
**Budget:** [Level + allocation]

---

## Executive Summary
[2-3 sentences: what's launching, who it's for, the approach, and the single most
important success factor for this specific launch]

---

## Timeline

### Weeks 1-2: Foundation
- [ ] [Task with owner and deadline]

### Weeks 3-4: Audience Building
- [ ] ...

### Weeks 5-6: Pre-Launch
- [ ] ...

### Week 7: Launch Week
**Monday:** [Specific tasks]
**Tuesday:** [Specific tasks]
**Wednesday:** [Specific tasks]
**Thursday:** [Specific tasks]
**Friday-Sunday:** [Urgency close]

### Week 8: Post-Launch
- [ ] ...

---

## Email Sequences

### Pre-Launch (Weeks 5-6)

**Email 1 — The Teaser**
Subject: [Subject line]
[Complete email body — personalized to the product]

**Email 2 — The Reveal**
Subject: [Subject line]
[Complete email body]

**Email 3 — Social Proof**
Subject: [Subject line]
[Complete email body]

### Launch Week

**Email 4 — The Launch**
**Email 5 — Social Proof Follow-Up**
**Email 6 — Objection Handler**
**Email 7 — Urgency Close**

---

## Social Media Content

### Launch Day Thread (Twitter/X)
[Posts 1-7, ready to publish]

### LinkedIn Launch Post
[Complete post]

### Instagram Caption
[Complete caption + hashtags]

---

## Partner Coordination
[Outreach timeline, swipe copy, commission structure]

---

## Launch Day Checklist
[Hour-by-hour from 6 AM to end of day]

---

## Metrics Dashboard
[Metrics table with targets and benchmarks for this specific launch]

---

## Budget Allocation
[Dollar amounts based on stated budget]

---

## Post-Launch Plan
[Week 8 activities, retrospective framework, ongoing engine]
```

## Key Principles

- Personalize every template — generic copy is useless and the client will sense it immediately.
- Work backwards from the launch date. If they have 3 weeks, give a 3-week plan, not an 8-week plan they can't use.
- Lead with the minimum viable launch for bootstrapped users — make launching feel achievable.
- Include copy they can paste immediately, not frameworks they have to fill in.
- If previous skill outputs exist (market audit, brand voice, landing CRO), pull from those findings to inform messaging and positioning.
- The launch event is the climax. The buildup and the follow-through drive the majority of results.
