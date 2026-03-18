---
name: market-report
description: >
  Markdown marketing report for internal use. Triggers: "marketing report",
  "reporte de marketing", "generar reporte", "informe de marketing",
  "marketing assessment", "scorecard de marketing", "marketing summary",
  "compile my marketing data", "reporte de auditoría". Produces
  MARKETING-REPORT.md.
---

# Marketing Report Generator (Markdown Format)

## When to Use This vs. market-report-pdf

| Situation | Use |
|---|---|
| Internal review, iterative editing, version control | This skill (Markdown) |
| Client presentation, email attachment, sales deliverable | `market-report-pdf` |

---

## How to Execute

### Step 1: Collect All Available Data

Check for existing files:
`MARKETING-AUDIT.md`, `LANDING-CRO.md`, `SEO-AUDIT.md`, `BRAND-VOICE.md`, `COMPETITOR-ANALYSIS.md`, `FUNNEL-ANALYSIS.md`, `AD-AUDIT.md`, `SOCIAL-AUDIT.md`, `EMAIL-AUDIT.md`

If none exist, offer: 1) Run `/market audit <url>` first (recommended), 2) Analyze URL directly, 3) Create template to fill manually.

### Step 2: Calculate the Marketing Scorecard

Score 6 categories (0-100), weighted:

```
Overall = (Website × 0.25) + (SEO × 0.20) + (Content × 0.15) + (Social × 0.15) + (Email × 0.15) + (Paid × 0.10)
```

See `references/scoring-rubric.md` for factor-by-factor criteria.

**Score Interpretation:**
| Score | Rating | Meaning |
|---|---|---|
| 85-100 | Excellent | Competitive advantage. Optimize and scale. |
| 70-84 | Good | Solid foundation, clear improvement opportunities. |
| 55-69 | Average | Functional but leaving revenue on the table. |
| 40-54 | Below Average | Multiple areas need attention. |
| 0-39 | Critical | Actively hurting growth. Immediate action required. |

### Step 3: Write Category Deep-Dives

For each of the 6 categories:
1. **Score and Rating** — X/100 with interpretation
2. **Key Findings** — 3-5 specific observations with evidence
3. **What's Working** — Positive elements to preserve
4. **Gaps and Issues** — Problems with severity (Critical/High/Medium/Low)
5. **Recommendations** — Specific actions ranked by impact
6. **Revenue Impact Estimate** — Quantified financial impact

**Revenue Impact Formula:**
```
Impact = Delta_Traffic × Delta_Conversion_Rate × Avg_Deal_Value × Confidence_Factor
```

### Step 4: Competitive Comparison (if data available)

If competitor data exists from `/market competitors`, build the positioning matrix:

| Factor | Client | Comp 1 | Comp 2 | Comp 3 |
|---|---|---|---|---|
| Website Quality | X/10 | X/10 | X/10 | X/10 |
| SEO Visibility | X/10 | X/10 | X/10 | X/10 |
| Content Quality | X/10 | X/10 | X/10 | X/10 |
| Social Presence | X/10 | X/10 | X/10 | X/10 |

Follow with: advantages, gaps, untapped opportunities.

### Step 5: SEO Snapshot

Quick-scan checklist: Title Tags, Meta Descriptions, H1 Tags, Image Alt Text, Page Speed, Mobile-Friendly, Schema Markup, Robots.txt, Sitemap, HTTPS, Core Web Vitals. Rate each: Optimized / Needs Work / Missing.

### Step 6: Conversion Optimization Summary

- Primary conversion paths
- Funnel leaks with % estimates
- CRO quick wins (implementable within a week)
- A/B test recommendations with hypotheses
- Benchmark comparison vs industry standards

### Step 7: Build the Prioritized Action Plan

Three tiers:
- **Quick Wins (This Week)** — High impact, low effort, 1-5 days. Include: action, impact rating, effort hours, expected result, revenue impact estimate.
- **Medium-Term (This Month)** — Moderate impact, 1-4 weeks
- **Strategic (This Quarter)** — Foundational changes requiring planning

### Step 8: 30-60-90 Day Roadmap

- **Days 1-30:** Quick wins, tracking/analytics baseline, begin medium-term improvements, first review
- **Days 31-60:** Core campaign improvements, A/B testing program, content strategy
- **Days 61-90:** Scale winners, expand channels, comprehensive review

## Output Format

Formato de salida: ver `references/output-template.md`.

## Key Principles

- Lead with insights and opportunities, not criticism.
- Quantify everything — "$32K/month unrealized revenue" beats "leaving money on the table."
- Action plan specific enough for a junior marketer to execute.
- Reference specific findings from previous skill outputs when available.
