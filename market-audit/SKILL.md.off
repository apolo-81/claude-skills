---
name: market-audit
description: >
  Auditoría completa de marketing con 5 subagentes paralelos. Evalúa y puntúa
  copy, SEO, funnel, social y competidores en una sola pasada.
  Usar cuando: "auditoría de marketing", "analiza mi sitio completo",
  "qué está mal con mi marketing", "audit this URL". Genera MARKETING-AUDIT.md.
---

# Marketing Audit Orchestrator

Full marketing audit engine for `/market audit <url>`. Launch 5 parallel subagents, aggregate results, produce unified `MARKETING-AUDIT.md`.

---

## Phase 1: Discovery (Pre-Analysis)

### 1.1 Fetch the Target URL

Use `WebFetch` to retrieve homepage and up to 5 key interior pages (pricing, about, product/features, blog, contact). Store raw content for subagents.

### 1.2 Detect Business Type

| Business Type | Detection Signals | Analysis Focus |
|---------------|-------------------|----------------|
| **SaaS/Software** | Free trial CTA, pricing tiers, feature pages, "login", API docs | Trial-to-paid, onboarding, feature differentiation, churn |
| **E-commerce** | Product listings, cart, checkout, categories, reviews | Product pages, cart abandonment, upsells, reviews, AOV |
| **Agency/Services** | Case studies, portfolio, "work with us", testimonials, contact forms | Trust signals, case studies, positioning, lead qualification |
| **Local Business** | Address, phone, hours, "near me", Google Maps | Local SEO, Google Business Profile, reviews, NAP consistency |
| **Creator/Course** | Lead magnets, email capture, course listings, community links | Email capture rate, funnel design, testimonials, content quality |
| **Marketplace** | Two-sided messaging, buyer/seller flows, listing pages | Supply/demand balance, trust mechanisms, network effects |

### 1.3 Map Key Pages

Identify: Homepage, primary landing pages, pricing, product/feature pages, about/team, blog/content hub, contact/signup/trial. Pass page map to every subagent.

---

## Phase 2: Parallel Subagent Execution

Launch all 5 simultaneously. Each receives: business type, page map, fetched content.

### Subagent 1: market-content
**Focus:** Content quality, messaging clarity, copy effectiveness
- Headline clarity (5-second test), value proposition strength, body copy persuasion, social proof quality, content depth, brand voice consistency
- **Scores:** Content & Messaging (0-100)

### Subagent 2: market-conversion
**Focus:** CRO, funnels, landing pages, signup flows
- CTA effectiveness, form friction, visual hierarchy, trust signals near conversion, mobile experience, signup/checkout flow, pricing page
- **Scores:** Conversion Optimization (0-100)

### Subagent 3: market-competitive
**Focus:** Competitive positioning, market landscape
- Positioning clarity, competitor awareness signals, category definition, pricing relative to competitors, feature differentiation, review/reputation presence
- **Scores:** Competitive Positioning (0-100)

### Subagent 4: market-technical
**Focus:** Technical SEO, site architecture, page speed
- Title tags, meta descriptions, header hierarchy, URL structure, internal linking, image optimization, mobile responsiveness, load speed, schema markup, sitemap/robots.txt, Core Web Vitals, accessibility basics
- **Scores:** SEO & Discoverability (0-100)

### Subagent 5: market-strategy
**Focus:** Overall strategy, pricing, growth opportunities
- Business model clarity, pricing strategy, growth loops, retention signals, expansion revenue, market timing, brand trust signals
- **Scores:** Brand & Trust (0-100), Growth & Strategy (0-100)

---

## Phase 3: Synthesis

### 3.1 Composite Score

```
Marketing Score = (
    Content_Score      × 0.25 +
    Conversion_Score   × 0.20 +
    SEO_Score          × 0.20 +
    Competitive_Score  × 0.15 +
    Brand_Score        × 0.10 +
    Growth_Score       × 0.10
)
```

| Score | Grade | Meaning |
|-------|-------|---------|
| 85-100 | A | Excellent — minor optimizations only |
| 70-84 | B | Good — clear opportunities |
| 55-69 | C | Average — significant gaps |
| 40-54 | D | Below average — major overhaul needed |
| 0-39 | F | Critical — fundamental issues |

### 3.2 Aggregate Recommendations

Classify by effort and timeline:

**Quick Wins** (< 1 week): Copy changes, missing meta descriptions, trust signals near CTAs, broken links, urgency/social proof additions.

**Strategic** (1-4 weeks): Pricing page redesign, comparison pages, lead magnets, email sequences, A/B test designs.

**Long-Term** (1-3 months): Content strategy overhaul, SEO content gap campaign, funnel redesign, brand repositioning, new growth channels.

### 3.3 Revenue Impact Estimates

For each recommendation:
```
Monthly Traffic × Conversion Rate Improvement × Average Deal Value = Est. Monthly Lift
```

| Impact Level | Monthly Lift | Confidence |
|-------------|-------------|------------|
| High | >$5,000/mo or >20% improvement | Clear evidence from audit |
| Medium | $1,000-$5,000/mo or 5-20% | Industry benchmarks |
| Low | <$1,000/mo or <5% | Incremental optimization |

### 3.4 Competitor Comparison Table

If competitors identified, create comparison table scoring: Headline Clarity, Value Prop Strength, Trust Signals, CTA Effectiveness, Pricing Clarity, Content Depth (each X/10).

---

## Output Format

Formato de salida: ver `references/output-template.md`.

---

## Error Handling

- URL unreachable: report error, suggest checking URL
- Subagent failure: continue with remaining, note gap in report
- Site behind auth: note what was accessible, recommend manual review for gated content
- Minimal content (single page): adapt analysis, note limited scope

## Cross-Skill Integration

- If `COMPETITOR-REPORT.md` exists, incorporate into competitive section
- If `BRAND-VOICE.md` exists, contextualize content/copy analysis
- Reference any other available analyses in executive summary
- Suggest follow-up: `/market copy`, `/market funnel`, `/market competitors`
