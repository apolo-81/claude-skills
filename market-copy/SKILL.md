---
name: market-copy
description: >
  Copywriting analysis and generation for websites. Triggers: "analyze my copy",
  "rewrite my homepage", "improve my website text", "my copy doesn't convert",
  "write better headlines", "fix my value proposition", "write copy for my
  landing page", "optimize my CTA text", "review my product page copy",
  "about page copy", "PAS", "AIDA", "swipe file", "copy scoring".
---

# Copywriting Analysis & Generation

Fetch target page(s), analyze existing copy, score it, produce terminal output and `COPY-SUGGESTIONS.md`.

## Invocation

Run as `/market copy <url>`. Fetch the target URL for analysis.

---

## Phase 1: Copy Discovery

### 1.1 Fetch and Parse

Extract: H1, subheadline, hero copy, all H2/H3, body paragraphs, CTA button text (every instance), navigation labels, footer copy, meta title/description, social proof elements.

### 1.2 Detect Page Type

| Page Type | Primary Goal | Copy Priority |
|-----------|-------------|---------------|
| **Homepage** | Communicate value prop, route visitors | Headline clarity, navigation, CTA hierarchy |
| **Landing Page** | Single conversion action | Headline-CTA alignment, objection handling, urgency |
| **Pricing Page** | Drive plan selection | Plan naming, feature framing, anchoring, FAQ |
| **About Page** | Build trust and connection | Story, mission, team credibility |
| **Product Page** | Demonstrate value | Feature-to-benefit translation, social proof |
| **Feature Page** | Explain capability | Problem-solution framing, use cases |
| **Blog Post** | Educate and capture leads | Headline hook, intro engagement, CTA placement |
| **Contact/Demo** | Capture lead info | Form headline, friction reduction, trust signals |

### 1.3 Voice and Tone Analysis

Rate each 1-5: **Formality** (Casual-Formal), **Emotion** (Neutral-Passionate), **Complexity** (Simple-Technical), **Humor** (Serious-Playful), **Authority** (Peer-Expert).

Document voice profile and calibrate all generated copy to match. Flag if tone is clearly ineffective.

---

## Phase 2: Copy Analysis

### 2.1 Headline Analysis

**5-Second Test:** Would a new visitor understand what this company does and who it serves within 5 seconds?

**Headline Scoring (0-10 each):** Clarity, Specificity, Relevance, Differentiation, Emotion.

### 2.2 Headline Generation

Generate 5-10 alternatives using PAS, AIDA, Before-After-Bridge, and 4U (Useful, Ultra-specific, Unique, Urgent) frameworks. Rank by estimated effectiveness.

### 2.3 Full Copy Scoring Rubric

| Dimension | Score | What It Measures |
|-----------|-------|------------------|
| **Clarity** | 0-10 | Can a 12-year-old understand what you do? |
| **Persuasion** | 0-10 | Does copy move reader toward action? Handles objections? |
| **Specificity** | 0-10 | Concrete numbers, outcomes, timeframes vs vague claims |
| **Emotion** | 0-10 | Connects with pain, desires, identity, aspirations? |
| **Action** | 0-10 | CTAs clear, compelling, strategically placed? |

**Total Copy Score: X/50** (multiply by 2 for 0-100 scale)

### 2.4 Value Proposition Canvas

```
TARGET CUSTOMER: [Who specifically is this for?]
PROBLEM: [What painful problem do they have?]
SOLUTION: [How does this product solve it?]
UNIQUE MECHANISM: [What is the unique approach/technology/method?]
KEY BENEFIT: [What is the #1 outcome the customer gets?]
PROOF: [What evidence supports the claims?]
```

If any element is weak or missing, it is the highest-priority copy fix.

---

## Phase 3: Copy Generation

### 3.1 Page-Specific Copy Structure

Use structure from `references/page-structures.md` based on detected page type.

### 3.2 CTA Optimization

Analyze every CTA. Best practices:
- First person: "Start My Free Trial" not "Start Your Free Trial"
- Include value: "Get My Report" not "Submit"
- Reduce risk: "Try Free for 14 Days" not "Buy Now"
- Be specific: "Download the 2026 Marketing Guide" not "Download"

**CTA Placement Audit:**
- [ ] CTA above the fold (required)
- [ ] CTA after each major content section (recommended)
- [ ] Sticky/floating CTA on long pages (recommended for long-form)
- [ ] CTA repeated at bottom (required)

### 3.3 Before/After Examples

For every recommendation, provide concrete before/after. Generate at least 5 pairs covering:
1. Primary headline
2. Subheadline
3. Primary CTA
4. One body copy paragraph
5. Meta description

### 3.4 Swipe File

Generate ready-to-use alternatives:
- 10 headline alternatives ranked by effectiveness
- 5 subheadline alternatives
- 5 CTA button text alternatives
- 3 meta description alternatives
- 3 social proof framing alternatives
- 3 pricing page headline alternatives (if applicable)

---

## Output Format

Formato de salida: ver `references/output-template.md`.

---

## Cross-Skill Integration

- If `BRAND-VOICE.md` exists, use voice guidelines to calibrate all generated copy
- If `MARKETING-AUDIT.md` exists, reference Content & Messaging score
- If `COMPETITOR-REPORT.md` exists, use competitor messaging to sharpen differentiation
- Suggest follow-up: `/market landing` for conversion-focused analysis, `/market brand` for formal voice guidelines
