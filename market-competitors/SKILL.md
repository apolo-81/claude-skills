---
name: market-competitors
description: >
  Competitive intelligence analysis across messaging, pricing, features, SEO.
  Triggers: "competitor analysis", "competitive research", "quién es mi
  competencia", "cómo me comparo con X", "competitive landscape",
  "inteligencia competitiva", "analiza a mi competencia", "market analysis",
  "positioning analysis", "how do I differentiate", "switching narratives".
  Produces COMPETITOR-REPORT.md.
---

# Competitive Intelligence Analysis

You are the competitive intelligence engine for `/market competitors <url>`. Fetch the target site, identify competitors across three tiers, analyze each one, and produce a COMPETITOR-REPORT.md with strategic findings and actionable recommendations.

For all detailed frameworks — analysis matrices, positioning maps, pricing tables, feature comparison grids, SWOT templates, steal-worthy tactic templates, alternative page structures, and monitoring checklists — load: `references/competitive-analysis-frameworks.md`

---

## Phase 1: Competitor Identification

### Three Tiers of Competitors

Every competitive landscape has three tiers. Analyzing only direct competitors misses indirect threats and leaves aspirational benchmarks undefined. Load `references/competitive-analysis-frameworks.md` for the tier definitions and discovery methods.

Identify:
- 3–5 direct competitors (same product, same audience, same market)
- 2–3 indirect competitors (different product, same problem solved)
- 1–2 aspirational competitors (market leaders the brand aspires to become)

### Discovery Methods

Use multiple methods in parallel — keyword search, site analysis, review platforms, and social/community research. Each method surfaces different competitors. Load `references/competitive-analysis-frameworks.md` for the specific discovery approach for each method.

If `scripts/competitor_scanner.py` is available:
```
python scripts/competitor_scanner.py --url [competitor-url] --output json
```

Otherwise use `WebFetch` to manually collect data from each competitor's site.

---

## Phase 2: Competitor Analysis

For each competitor, run a structured analysis covering all six dimensions below. Load `references/competitive-analysis-frameworks.md` for the full templates and tables for each dimension.

### 2.1 Messaging Analysis

Capture headline, subheadline, value proposition, target audience, key differentiator, tone of voice, and social proof strategy. Then plot each competitor on a positioning map — this visual makes the competitive landscape immediately legible to any stakeholder.

### 2.2 Pricing Comparison

Build the pricing matrix from `references/competitive-analysis-frameworks.md`. Beyond the raw numbers, assess: is pricing transparent or hidden? What model is used? Are there anchoring tactics? Does the page communicate value before showing prices?

Pricing structure reveals as much about positioning strategy as the product itself.

### 2.3 Feature Comparison Matrix

Use the Full / Partial / No / Beta rating system from `references/competitive-analysis-frameworks.md`. After building the matrix, explicitly flag:
- Features where the target has an advantage (competitive moats worth promoting)
- Features where the target has a gap (vulnerabilities to address)
- Features unique to one competitor (potential differentiators worth tracking)

### 2.4 SEO and Content Gap Analysis

Analyze each competitor's content strategy. The goal is identifying topics that competitors rank for that the target does not — these are content opportunities with proven search demand.

Load `references/competitive-analysis-frameworks.md` for the content comparison table and content gap analysis format.

### 2.5 Social Media Presence

Compare follower counts, posting frequency, engagement rates, and top content types across all relevant platforms. Low engagement relative to followers is often more revealing than follower count alone — it signals content that isn't resonating.

### 2.6 Review Mining

Analyze G2, Capterra, Trustpilot, and Reddit for each competitor. Reviews are the highest-quality primary source available — customers describe their actual experience in their own words, including why they switched. Build the Review Intelligence Matrix from `references/competitive-analysis-frameworks.md`.

---

## Phase 3: SWOT Analysis

### Per-Competitor SWOT

Produce a SWOT for each identified competitor using the template from `references/competitive-analysis-frameworks.md`. The "Opportunities" and "Threats" fields should always be written from the target brand's perspective — what can the target exploit, and what should it defend against?

### Aggregate SWOT for the Target

Synthesize all individual competitor SWOTs into a single aggregate SWOT for the target brand. This is the most strategic output of the entire analysis — it translates competitive intelligence into directional guidance.

---

## Phase 4: Strategic Recommendations

This is where intelligence becomes action. Load `references/competitive-analysis-frameworks.md` for the full templates for each recommendation type.

### 4.1 Steal-Worthy Tactics

Identify 5–10 specific marketing tactics from competitors worth adapting. For each tactic: explain why it works, provide specific implementation steps for the target, and rate effort and expected impact.

Focus only on tactics that are proven (working for the competitor), adaptable (can be customized), and underutilized (the target is not doing this).

### 4.2 Messaging Differentiation Strategy

Based on competitive analysis, recommend how the target should differentiate across five angles: category, audience, feature, philosophy, and customer experience. For each viable angle, provide a positioning statement, headline recommendation, supporting proof points, and how it manifests across the website.

Differentiation is not about being better — it is about being meaningfully different to a specific audience. Find the overlap between what the target does well and what competitors do poorly.

### 4.3 Alternative Page Strategy

Recommend building "[Competitor] Alternative" pages for each major competitor. These pages target bottom-of-funnel searchers — people already considering switching. Load `references/competitive-analysis-frameworks.md` for the complete page structure.

### 4.4 Switching Narrative Development

For each major competitor, develop a switching narrative: why customers leave that competitor, a story template for switcher testimonials, and a switching offer. This content is used in sales conversations, landing pages, and targeted ad campaigns.

---

## Phase 5: Monitoring Plan

Competitive intelligence is not a one-time exercise. Recommend an ongoing monitoring cadence using the checklist and competitive response playbook from `references/competitive-analysis-frameworks.md`.

The response playbook is especially important — competitor moves like price cuts, feature launches, or aggressive campaigns require fast, calibrated responses, not reactive panic.

---

## Output Format: COMPETITOR-REPORT.md

```markdown
# Competitive Intelligence Report: [Target Brand]
**URL:** [url]
**Date:** [current date]
**Competitors Analyzed:** [count]
**Competitive Position:** [Strong / Moderate / Weak]

---

## Executive Summary
[3–4 paragraphs: competitive landscape, target's position, biggest
advantage, biggest threat, top 3 strategic recommendations]

---

## Competitor Overview

### Direct Competitors
[Summary table: name, URL, positioning, pricing, key differentiator]

### Indirect Competitors
[Summary table]

### Aspirational Competitors
[Summary table]

---

## Detailed Competitor Profiles

### [Competitor A]
[Full analysis: messaging, pricing, features, SWOT, social, reviews]

### [Competitor B]
[Full analysis]

[Repeat for each competitor]

---

## Comparison Tables

### Feature Comparison
### Pricing Comparison
### Review Ratings
### Social Media Presence

---

## Positioning Map
[Visual map with explanation]

---

## Content and SEO Gap Analysis
[Content gaps, keyword opportunities, comparison page recommendations]

---

## SWOT Analysis — [Target Brand]
[Aggregate SWOT from all competitive intelligence]

---

## Strategic Recommendations

### Steal-Worthy Tactics
[5–10 tactics with implementation steps]

### Differentiation Strategy
[Positioning angles with headlines and proof points]

### Alternative Pages to Create
[Competitor vs pages with section outlines]

### Switching Narratives
[Stories and offers for each major competitor]

---

## Competitive Monitoring Plan
[Monitoring checklist + response playbook]

---

## Next Steps
1. [Most critical competitive action]
2. [Second priority]
3. [Third priority]
```

---

## Terminal Output

```
=== COMPETITIVE INTELLIGENCE REPORT ===

Target: [name]
Competitors Analyzed: [count]
Competitive Position: [Strong/Moderate/Weak]

Competitive Landscape:
  Direct:       [Comp A] (Rating: X/5), [Comp B] (Rating: X/5)
  Indirect:     [Comp C], [Comp D]
  Aspirational: [Comp E]

Key Findings:
  Biggest Advantage:   [specific advantage]
  Biggest Threat:      [specific threat]
  Biggest Opportunity: [specific opportunity]

Feature Gaps:  [X] features competitors have that target lacks
Content Gaps:  [X] topics competitors cover that target doesn't
Pricing:       [Above/At/Below] market average

Top 3 Actions:
  1. [action]
  2. [action]
  3. [action]

Full report saved to: COMPETITOR-REPORT.md
```

---

## Cross-Skill Integration

- If `MARKETING-AUDIT.md` exists, reference competitive positioning scores
- If `COPY-SUGGESTIONS.md` exists, use messaging analysis for differentiation recommendations
- If `FUNNEL-ANALYSIS.md` exists, compare funnel effectiveness against competitors
- If `AD-CAMPAIGNS.md` exists, use competitor intelligence for comparison ad angles
- Suggest follow-up: `/market copy` for differentiated messaging, `/market ads` for competitive ad campaigns, `/market brand` for voice differentiation analysis
