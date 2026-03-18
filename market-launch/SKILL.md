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

Genera un playbook de lanzamiento táctico y personalizado: timeline semana a semana, templates de email listos para copiar, posts por canal, coordinación de partners, métricas en tiempo real y plan post-lanzamiento. Output es copy listo para usar, no frameworks vacíos.

Si el usuario ya corrió `/market audit` o `/market brand`, pull findings para informar positioning y mensajes.

Formato de salida: ver `references/output-template.md`.

---

## Step 1: Gather Launch Context

Ask only what's missing -- infer from context:

1. **What** are you launching? (product, service, feature, course, event)
2. **Target audience?** (demographics, pain points, list size)
3. **Primary goal?** (revenue target, signups, downloads, awareness)
4. **Launch date?** (work backwards to size timeline)
5. **Channels available?** (email list size, social following, ad budget, partnerships)
6. **Price point?**
7. **Existing customers/users?** (for beta, testimonials)
8. **Budget level?** (bootstrapped / moderate / well-funded)

## Step 2: Select Launch Type

| Launch Type | Best For | Primary Channel | Timeline |
|---|---|---|---|
| Product Hunt | SaaS, dev tools, consumer apps | Product Hunt + X | 4-6 weeks |
| Email List | Course, info product, SaaS | Email sequences | 6-8 weeks |
| Social-First | Consumer product, personal brand | Twitter/X, LinkedIn, IG | 4-6 weeks |
| Paid Ads | E-commerce, proven product | Meta / Google Ads | 2-4 weeks |
| Community | Niche tools, developer products | Reddit, Discord, Slack | 6-8 weeks |
| Partner | B2B, enterprise, marketplace | Partner channels | 8-12 weeks |
| Hybrid | High-stakes launch | Multi-channel coordinated | 8-12 weeks |

## Step 3: Build the Timeline

Full task lists per phase: see `references/launch-frameworks.md`.

**Phases:**
- **Weeks 1-2 -- Foundation:** Positioning, landing page, analytics, email drafts, beta list
- **Weeks 3-4 -- Audience Building:** Content seeding, community engagement, beta onboarding, partner outreach
- **Weeks 5-6 -- Pre-Launch:** Email sequence, assets finalized, partners briefed, urgency mechanism
- **Week 7 -- Launch Week:** Soft Mon -> Public Tue -> Social proof Wed -> Objections Thu -> Urgency close Fri-Sun
- **Week 8 -- Post-Launch:** Survey, retrospective, onboarding optimization

**Compressed timeline (<8 weeks):** Combine phases, prioritize email + community, cut audience-building to 1 week.

**Minimum viable launch (bootstrapped):**
- Week 1: Landing page + positioning
- Week 2: 10-20 personal outreach messages
- Week 3: 3-email pre-launch sequence
- Launch day: Email + 3-5 community posts + personal social thread

## Step 4: Email Sequence

Generate complete, product-specific email copy -- not placeholders. Full templates: `references/launch-frameworks.md`.

**Pre-launch (Weeks 5-6):**
- Email 1 -- Teaser (2 weeks before): Build anticipation
- Email 2 -- Reveal (1 week before): Screenshots/video, beta results, early bird
- Email 3 -- Social Proof (3 days before): Beta tester results with numbers

**Launch (Week 7):**
- Email 4 -- Launch (Day 1): Clear offer, early bird, direct CTA
- Email 5 -- Social Proof Follow-Up (Day 3): First reactions, FOMO
- Email 6 -- Objection Handler (Day 4): Top 3-5 objections, guarantee
- Email 7 -- Urgency Close (Day 5-7): Deadline, final testimonial, single CTA

## Step 5: Social Media Content

Platform-specific posts for launch week. Full templates: `references/social-templates.md`.

Per platform:
- **Twitter/X:** Launch story as thread (problem -> solution -> results -> offer)
- **LinkedIn:** Personal insight + problem relatability before product
- **Instagram:** Lead image = result/outcome, not product screenshot

## Step 6: Partner and Influencer Coordination

Provide partners: free product access, swipe copy (email/social/blog), branded graphics, unique referral link, commission structure, launch-day schedule.

Timeline: initial contact Week 3 -> confirmation + swipe copy Week 5 -> launch-day coordination Week 7.

## Step 7: Launch Metrics

Track in real-time during launch week. Full benchmarks: `references/metrics-framework.md`.

Key live metrics: website traffic by source, landing/checkout conversion rate, email open rates, revenue + AOV vs target, CPA (if paid).

## Step 8: Common Launch Mistakes

1. **Launching to nobody** -- Build audience before product is ready
2. **No urgency mechanism** -- Use early bird, limited spots, or bonus expiration
3. **No follow-up sequence** -- Single email: 1-3%; 7-email sequence: 5-15%
4. **Forgetting mobile** -- Test every email/page/checkout on mobile
5. **No post-launch plan** -- Launch opens the engine; what follows determines outcome

## Key Principles

- Personalize every template -- generic copy is immediately obvious.
- Work backwards from launch date. 3 weeks available = 3-week plan.
- Lead with minimum viable launch for bootstrapped users.
- Include paste-ready copy, not frameworks to fill in.
- Pull from previous skill outputs (audit, brand voice) when available.
