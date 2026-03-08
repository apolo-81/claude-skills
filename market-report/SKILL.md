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
| Quick reference during an engagement | This skill (Markdown) |
| First impression for a prospect — polished visual report | `market-report-pdf` |

**Rule:** Markdown for working documents; PDF for client-facing deliverables.

## How to Execute

### Step 1: Collect All Available Data

Check for existing audit output files in the project directory:

- `MARKETING-AUDIT.md` — from `/market audit`
- `LANDING-CRO.md` — from `/market landing`
- `SEO-AUDIT.md` — from `/market seo`
- `BRAND-VOICE.md` — from `/market brand`
- `COMPETITOR-ANALYSIS.md` — from `/market competitors`
- `FUNNEL-ANALYSIS.md` — from `/market funnel`
- `AD-AUDIT.md` — from `/market ads`
- `SOCIAL-AUDIT.md` — from `/market social`
- `EMAIL-AUDIT.md` — from `/market emails`

If no previous data exists, offer three paths:
1. Run a quick audit first (`/market audit <url>`) — recommended for the best report
2. Generate based on a provided URL (analyze directly)
3. Create a report template to fill in manually

### Step 2: Calculate the Marketing Scorecard

Score 6 categories (each 0-100), weighted to produce an overall score.

**Overall Score Formula:**
```
Overall = (Website × 0.25) + (SEO × 0.20) + (Content × 0.15) + (Social × 0.15) + (Email × 0.15) + (Paid × 0.10)
```

See [`references/report-template.md`](references/report-template.md) for the full scoring rubric and factor-by-factor criteria for each category.

**Score Interpretation:**
| Score | Rating | Meaning |
|---|---|---|
| 85-100 | Excellent | Marketing is a competitive advantage. Optimize and scale. |
| 70-84 | Good | Solid foundation with clear improvement opportunities. |
| 55-69 | Average | Functional but leaving significant revenue on the table. |
| 40-54 | Below Average | Multiple areas need attention. Significant opportunity cost. |
| 0-39 | Critical | Marketing is actively hurting growth. Immediate action required. |

### Step 3: Write Category Deep-Dives

For each of the 6 categories, provide:
1. **Score and Rating** — X/100 with interpretation sentence
2. **Key Findings** — 3-5 specific observations with evidence (not vague impressions)
3. **What's Working** — Positive elements to preserve and build on
4. **Gaps and Issues** — Problems with severity ratings (Critical / High / Medium / Low)
5. **Recommendations** — Specific, actionable improvements ranked by impact
6. **Revenue Impact Estimate** — Financial impact of implementing recommendations

**Why quantifying revenue impact matters:** "$32,000/month in unrealized revenue" is more compelling than "you're leaving money on the table." Quantified impact creates urgency and justifies the engagement.

**Revenue Impact Framework:**
```
Impact = Δ Traffic × Δ Conversion Rate × Average Deal Value × Confidence Factor

Example:
- Current monthly traffic: 10,000
- SEO improvements: +30% traffic → +3,000 visits
- Current conversion: 2%, CRO improvement to 3% → +1% × 13,000 = 130 extra conversions
- Average deal value: $500
- Monthly impact: $65,000 × 0.5 confidence = $32,500/month conservative estimate
```

### Step 4: Competitive Comparison (if data available)

If competitor data exists from `/market competitors`:

**Competitive Positioning Matrix:**
| Factor | Client | Competitor 1 | Competitor 2 | Competitor 3 |
|---|---|---|---|---|
| Website Quality | X/10 | X/10 | X/10 | X/10 |
| SEO Visibility | X/10 | X/10 | X/10 | X/10 |
| Content Quality | X/10 | X/10 | X/10 | X/10 |
| Social Presence | X/10 | X/10 | X/10 | X/10 |

Follow with: competitive advantages, competitive gaps, untapped opportunities.

### Step 5: SEO Snapshot

Quick-scan health checklist:
```
- Title Tags: [Optimized / Needs Work / Missing]
- Meta Descriptions: [Optimized / Needs Work / Missing]
- H1 Tags: [Proper / Issues / Missing]
- Image Alt Text: [Complete / Partial / Missing]
- Page Speed: [Fast (<2s) / Moderate (2-4s) / Slow (>4s)]
- Mobile-Friendly: [Yes / Partially / No]
- Schema Markup: [Present / Partial / Missing]
- Robots.txt: [Configured / Issues / Missing]
- Sitemap: [Present / Issues / Missing]
- HTTPS: [Yes / No]
- Core Web Vitals: [Pass / Needs Work / Fail]
```

### Step 6: Conversion Optimization Summary

- Primary conversion paths (how visitors become customers)
- Funnel leaks (where potential customers drop off, with % estimates)
- CRO quick wins (changes implementable within a week)
- A/B test recommendations with hypotheses
- Benchmark comparison (current rates vs industry standards)

### Step 7: Build the Prioritized Action Plan

Organize all recommendations into three tiers:

**Quick Wins (This Week)** — High impact, low effort, implementable in 1-5 days:
```
- [ ] [Action]: [Specific description]
  - Impact: HIGH / MEDIUM / LOW
  - Effort: [Hours]
  - Expected Result: [Specific outcome]
  - Revenue Impact: [$X/month estimated]
```

**Medium-Term (This Month)** — Moderate impact, 1-4 weeks to implement

**Strategic (This Quarter)** — High impact, foundational changes requiring planning

### Step 8: 30-60-90 Day Roadmap

**Days 1-30: Foundation & Quick Wins**
- Week 1: Implement all quick wins
- Week 2: Set up tracking and analytics baseline
- Week 3: Begin medium-term improvements
- Week 4: First performance review and adjustment

**Days 31-60: Growth & Optimization**
- Weeks 5-6: Launch core campaign improvements
- Week 7: A/B testing program begins
- Week 8: Content strategy implementation

**Days 61-90: Scale & Expand**
- Weeks 9-10: Scale what's working, cut what isn't
- Week 11: Expand to new channels or campaigns
- Week 12: Comprehensive review, update strategy for next quarter

## Output Format

Generate `MARKETING-REPORT.md` in the project root:

```markdown
# Marketing Report: [Company / Domain]

**Prepared by:** [Agent / Agency Name]
**Date:** [Date]
**Data Sources:** [List which audits were used]

---

## Executive Summary

### Overall Marketing Score: [X/100] — [Rating]

[2-3 paragraphs: current state assessment, top 3 findings, estimated revenue
impact of implementing recommendations, recommended first steps]

### Score Breakdown
| Category | Score | Weight | Weighted | Rating |
|---|---|---|---|---|
| Website & Conversion | X/100 | 25% | X | [Rating] |
| SEO & Organic | X/100 | 20% | X | [Rating] |
| Content & Messaging | X/100 | 15% | X | [Rating] |
| Social Media | X/100 | 15% | X | [Rating] |
| Email & Automation | X/100 | 15% | X | [Rating] |
| Paid Advertising | X/100 | 10% | X | [Rating] |
| **Overall** | **X/100** | | | **[Rating]** |

### Top 3 Priority Actions
1. [Most impactful recommendation with revenue estimate]
2. [Second most impactful]
3. [Third most impactful]

---

## Detailed Findings

### 1. Website & Conversion — [X/100]
[Score, findings, what's working, gaps, recommendations, revenue impact]

### 2. SEO & Organic — [X/100]
[Deep-dive]

### 3. Content & Messaging — [X/100]
[Deep-dive]

### 4. Social Media — [X/100]
[Deep-dive]

### 5. Email & Automation — [X/100]
[Deep-dive]

### 6. Paid Advertising — [X/100]
[Deep-dive]

---

## Competitive Comparison
[Matrix and narrative analysis]

---

## SEO Health Snapshot
[Checklist format]

---

## Conversion Optimization Summary
[Funnel analysis, leaks, CRO quick wins, A/B test recommendations]

---

## Revenue Impact Summary
| Recommendation | Est. Monthly Impact | Confidence | Priority |
|---|---|---|---|
| [Rec 1] | $X,XXX | High/Med/Low | 1 |
| [Rec 2] | $X,XXX | High/Med/Low | 2 |
| **Total Estimated Impact** | **$XX,XXX/month** | | |

---

## Prioritized Action Plan

### Quick Wins (This Week)
- [ ] [Action with impact, effort, expected result, revenue impact]

### Medium-Term (This Month)
- [ ] [Action items]

### Strategic (This Quarter)
- [ ] [Action items]

---

## 30-60-90 Day Roadmap
[Week-by-week implementation plan]

---

## Appendix
### Methodology & Scoring
### Tools Used
### Data Sources
### Glossary
```

## Key Principles

- Lead with insights and opportunities, not criticism. Frame everything as growth potential.
- Quantify everything possible — "$32,000/month in unrealized revenue" beats "you're leaving money on the table."
- Make the action plan specific enough that a junior marketer could execute it without ambiguity.
- Use consistent formatting: tables for data, checkboxes for action items, clear visual hierarchy.
- Reference specific findings from previous skill outputs when available — specificity builds trust.
- The report tells a story: here's where you are → here's where you could be → here's how to get there → here's what it's worth.
- A well-crafted report is itself a sales tool — it can open the door to a full client engagement.
