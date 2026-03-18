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

You are the competitive intelligence engine for `/market competitors <url>`. Fetch the target site, identify competitors across three tiers, analyze each, and produce COMPETITOR-REPORT.md.

For all detailed frameworks (analysis matrices, positioning maps, pricing tables, feature grids, SWOT templates, steal-worthy tactic templates, alternative page structures, monitoring checklists), load: `references/competitive-analysis-frameworks.md`

Formato de salida: ver `references/output-template.md`.

---

## Phase 1: Competitor Identification

### Three Tiers

Identify:
- 3-5 **direct** competitors (same product, same audience, same market)
- 2-3 **indirect** competitors (different product, same problem)
- 1-2 **aspirational** competitors (market leaders to benchmark against)

### Discovery Methods

Use multiple methods in parallel: keyword search, site analysis, review platforms, social/community research. Load `references/competitive-analysis-frameworks.md` for specific approaches.

If `scripts/competitor_scanner.py` available:
```
python scripts/competitor_scanner.py --url [competitor-url] --output json
```
Otherwise use `WebFetch` to collect data from each competitor's site.

---

## Phase 2: Competitor Analysis

For each competitor, analyze six dimensions. Load `references/competitive-analysis-frameworks.md` for full templates.

### 2.1 Messaging Analysis
Capture: headline, subheadline, value prop, target audience, key differentiator, tone, social proof strategy. Plot on a positioning map.

### 2.2 Pricing Comparison
Build pricing matrix from references. Assess: transparency, model, anchoring tactics, value communication before price reveal.

### 2.3 Feature Comparison Matrix
Use Full/Partial/No/Beta rating system. Flag: target advantages (moats), target gaps (vulnerabilities), unique-to-one features (differentiators).

### 2.4 SEO and Content Gap Analysis
Identify topics competitors rank for that target does not — content opportunities with proven demand. Load references for content comparison table.

### 2.5 Social Media Presence
Compare: followers, posting frequency, engagement rates, top content types. Low engagement relative to followers signals content problems.

### 2.6 Review Mining
Analyze G2, Capterra, Trustpilot, Reddit. Build the Review Intelligence Matrix from references.

---

## Phase 3: SWOT Analysis

**Per-Competitor SWOT:** Use template from references. "Opportunities" and "Threats" written from target brand's perspective.

**Aggregate SWOT for Target:** Synthesize all individual SWOTs into directional guidance for the target brand.

---

## Phase 4: Strategic Recommendations

Load `references/competitive-analysis-frameworks.md` for templates.

### 4.1 Steal-Worthy Tactics
5-10 tactics from competitors worth adapting. Each: why it works, implementation steps, effort/impact rating. Focus on proven, adaptable, and underutilized tactics.

### 4.2 Messaging Differentiation Strategy
Recommend differentiation across: category, audience, feature, philosophy, customer experience. For each viable angle: positioning statement, headline, proof points, website manifestation.

### 4.3 Alternative Page Strategy
"[Competitor] Alternative" pages for each major competitor. Target bottom-of-funnel searchers. See references for page structure.

### 4.4 Switching Narrative Development
Per major competitor: why customers leave, switcher testimonial story template, switching offer.

---

## Phase 5: Monitoring Plan

Recommend ongoing monitoring cadence using checklist and competitive response playbook from references.

---

## Cross-Skill Integration

- If `MARKETING-AUDIT.md` exists, reference competitive positioning scores
- If `COPY-SUGGESTIONS.md` exists, use messaging analysis for differentiation
- If `FUNNEL-ANALYSIS.md` exists, compare funnel effectiveness against competitors
- If `AD-CAMPAIGNS.md` exists, use for comparison ad angles
- Suggest follow-up: `/market copy` for differentiated messaging, `/market ads` for competitive campaigns, `/market brand` for voice differentiation
