---
name: market
description: >
  AI Marketing Suite orchestrator for all marketing tasks. Triggers:
  "marketing audit", "analyze my site", "copy analysis", "email sequences",
  "social media calendar", "ad campaigns", "sales funnel", "competitive
  intelligence", "landing page CRO", "product launch", "client proposal",
  "brand voice", "marketing report", "marketing strategy", "review my funnel",
  "write copy for my homepage", "audit my competitor".
---

# AI Marketing Suite -- Main Orchestrator

## Quick Start

```
/market audit <url>       -> Full marketing audit with score (flagship)
/market quick <url>       -> 60-second snapshot, no subagents
/market copy <url>        -> Analyze and rewrite website copy
/market landing <url>     -> Landing page CRO teardown
/market competitors <url> -> Competitive intelligence report
```

## Command Reference

| Command | Output |
|---------|--------|
| `/market audit <url>` | MARKETING-AUDIT.md |
| `/market quick <url>` | Terminal output |
| `/market copy <url>` | COPY-SUGGESTIONS.md |
| `/market emails <topic/url>` | EMAIL-SEQUENCES.md |
| `/market social <topic/url>` | SOCIAL-CALENDAR.md |
| `/market ads <url>` | AD-CAMPAIGNS.md |
| `/market funnel <url>` | FUNNEL-ANALYSIS.md |
| `/market competitors <url>` | COMPETITOR-REPORT.md |
| `/market landing <url>` | LANDING-CRO.md |
| `/market launch <product>` | LAUNCH-PLAYBOOK.md |
| `/market proposal <client>` | CLIENT-PROPOSAL.md |
| `/market report <url>` | MARKETING-REPORT.md |
| `/market report-pdf <url>` | MARKETING-REPORT.pdf |
| `/market seo <url>` | SEO-AUDIT.md |
| `/market brand <url>` | BRAND-VOICE.md |

## Routing Logic

### Full Marketing Audit (`/market audit <url>`)

Flagship command. Launches **5 parallel subagents:**
1. **market-content** -> Content quality, messaging, copy
2. **market-conversion** -> CRO, funnels, landing pages, signup flows
3. **market-competitive** -> Competitive positioning, market landscape
4. **market-technical** -> Technical SEO, site architecture, page speed
5. **market-strategy** -> Overall strategy, pricing, growth opportunities

**Scoring (Marketing Score 0-100):**

| Category | Weight |
|----------|--------|
| Content & Messaging | 25% |
| Conversion Optimization | 20% |
| SEO & Discoverability | 20% |
| Competitive Positioning | 15% |
| Brand & Trust | 10% |
| Growth & Strategy | 10% |

**Composite Marketing Score** = Weighted average of all 6 categories.

### Quick Snapshot (`/market quick <url>`)

Fast 60-second assessment. NO subagents. Fetch homepage with WebFetch, evaluate: headline clarity, CTA strength, value proposition, trust signals, mobile readiness. Output quick scorecard with top 3 wins and top 3 fixes. Keep under 30 lines.

### Individual Commands

Route `/market <command>` to `skills/market-<command>/SKILL.md`.

## Business Context Detection

Detect before any analysis -- shapes the entire focus:

| Type | Detection Signals | Focus |
|------|-------------------|-------|
| **SaaS** | Free trial, pricing tiers, login, API docs | Trial-to-paid, onboarding, churn |
| **E-commerce** | Product listings, cart, checkout | Product pages, cart abandonment, AOV |
| **Agency/Services** | Case studies, portfolio, "work with us" | Trust, positioning, lead qualification |
| **Local Business** | Address, phone, hours, maps | Local SEO, GBP, reviews, NAP |
| **Creator/Course** | Lead magnets, email capture, courses | Capture rate, funnel, content quality |
| **Marketplace** | Two-sided messaging, buyer/seller flows | Supply/demand, trust, network effects |

## Output Standards

1. **Actionable over theoretical** -- specific enough to implement today
2. **Prioritized** -- rank by impact (High/Medium/Low) and effort
3. **Revenue-focused** -- connect every suggestion to business outcome
4. **Example-driven** -- before/after copy examples, not just advice
5. **Client-ready** -- presentable without editing

## File Output

Save to markdown in current directory. Include URL, date, and overall score at top. Use clear headers, tables, and executive summary in all client-facing reports.

## Cross-Skill Integration

- `/market audit` calls all subagents for comprehensive analysis
- `/market proposal` references audit results if `MARKETING-AUDIT.md` exists
- `/market report` and `/market report-pdf` compile all available analysis data
- `/market copy` uses `BRAND-VOICE.md` if available
- `/market emails` deepens sequences when `FUNNEL-ANALYSIS.md` exists
- Always incorporate findings from existing files in working directory
