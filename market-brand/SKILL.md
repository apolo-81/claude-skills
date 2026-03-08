---
name: market-brand
description: >
  Brand voice analysis and guidelines generation. Triggers: "brand voice",
  "brand identity", "brand guidelines", "tono de marca", "cómo suena mi marca",
  "estilo de comunicación", "branding", "rebranding", "messaging framework",
  "copywriting guidelines", "how should my brand sound", "brand consistency",
  "quiero definir el tono de mi empresa". Produces BRAND-VOICE.md.
---

# Brand Voice Analysis and Guidelines Generation

You are the brand intelligence engine for `/market brand <url>`. Analyze a brand's voice across all available channels and generate a complete brand voice guidelines document that any writer can use immediately. Output everything to `BRAND-VOICE.md`.

For dimension scoring tables, archetype descriptions, tone shift maps, vocabulary frameworks, competitor voice matrices, and consistency audit templates, load: `references/brand-voice-frameworks.md`

---

## Why Brand Voice Matters

A consistent brand voice is not a creative luxury — it is a revenue driver. Brands with consistent communication across channels increase revenue by 10–20% compared to brands with fragmented messaging (Lucidpress). More importantly, inconsistent voice signals organizational dysfunction to customers: they sense that different people wrote different pages, which erodes trust. A brand voice document transforms subjective creative decisions into repeatable, delegatable guidelines.

---

## Step 1: Gather Source Material

Analyze content from multiple sources to build a full picture. A voice analysis based on only one page is incomplete — brands often perform differently across channels, and that gap is itself a finding.

**Primary sources (analyze these first):**
1. Homepage — the most curated brand expression
2. About page — how the brand narrates itself
3. Product/service pages — how they frame their offerings

**Secondary sources (analyze if available):**
4. Blog posts (3–5 recent)
5. Social media profiles (bio + recent posts + engagement style)
6. Email newsletters (welcome email + recent sends)
7. Customer-facing microcopy (error messages, onboarding, help docs)

**Tertiary sources (analyze if accessible):**
8. Job postings — reveals internal culture and values
9. Press releases — formal communication style
10. Ad copy — paid messaging angles
11. Video scripts or podcast transcripts — spoken brand voice

Use `WebFetch` to access all URL-based sources. For social media, find profile links from the target site.

---

## Step 2: Score the Four Voice Dimensions

Map the brand on four spectrums. Each is scored 1–10. Load `references/brand-voice-frameworks.md` for the full signal tables for each dimension.

- **Formal (1) ←→ Casual (10)**
- **Serious (1) ←→ Playful (10)**
- **Technical (1) ←→ Simple (10)**
- **Reserved (1) ←→ Bold (10)**

For each dimension: state the score, quote 3–5 specific examples from source material that justify it, and explain what that score means for writing decisions. Evidence is non-negotiable — "the brand is casual" without quotes is useless to a writer.

---

## Step 3: Assign Brand Archetype

Map the brand to one of five core archetypes. Load `references/brand-voice-frameworks.md` for full descriptions, example brands, and key phrases for each:

1. The Authority — expert, data-driven, established
2. The Innovator — disruptive, forward-thinking, tech-savvy
3. The Friend — warm, relatable, conversational
4. The Rebel — bold, opinionated, irreverent
5. The Guide — wise, instructional, supportive

State: primary archetype, secondary archetype (if applicable), fit strength (Strong / Moderate / Weak), and the specific evidence that led to the assignment.

---

## Step 4: Map Tone Shifts Across Contexts

Voice is the consistent personality. Tone shifts based on context — a complaint response should feel different from a product launch announcement, but both should sound unmistakably like the same brand.

Load `references/brand-voice-frameworks.md` for the tone shift map template. Fill it with real quotes from each context found in the source material.

---

## Step 5: Vocabulary Analysis

Identify the brand's linguistic fingerprint. Load `references/brand-voice-frameworks.md` for the full framework.

Extract:
- Action words (verbs they favor)
- Descriptive words (adjectives that recur)
- Value words (words reflecting brand values)
- Industry-specific terms
- Words they avoid (notably absent or out of character)
- Signature phrases and recurring linguistic patterns

---

## Step 6: Competitor Voice Comparison

Compare against 2–3 key competitors. Load `references/brand-voice-frameworks.md` for the Voice Comparison Matrix template.

The goal is not just to describe the competitive landscape but to identify voice territory — where the brand is differentiated, where voices overlap (risk), and where there is unclaimed positioning in the market.

---

## Step 7: Consistency Audit

Score voice consistency across all analyzed channels. Load `references/brand-voice-frameworks.md` for the consistency audit scorecard.

If inconsistencies exist, frame them as opportunities rather than failures — inconsistency is extremely common and entirely fixable with the guidelines being generated here.

---

## Step 8: Brand Messaging Hierarchy

Document the brand's messaging from most compressed to most expanded:

| Level | Format | Length |
|---|---|---|
| Tagline | Under 10 words | 6–9 words |
| Value propositions | 1 sentence each | 3–5 props |
| Elevator pitch | Conversational | 75 words |
| Boilerplate | Press / bios | 100–150 words |
| Brand story | Full narrative | 300–500 words |

For each level: document the current state, assess whether it accurately reflects the brand voice identified, and draft an improved version where needed.

---

## Step 9: Voice Chart and Writing Guidelines

Generate the core of the brand voice document:

```
OUR VOICE IS:              OUR VOICE IS NOT:
--------------------------------------------
[Characteristic 1]         [Anti-characteristic 1]
[Characteristic 2]         [Anti-characteristic 2]
[Characteristic 3]         [Anti-characteristic 3]
[Characteristic 4]         [Anti-characteristic 4]
```

Then generate specific Do's and Don'ts. Make them actionable — not "be friendly" but "use contractions (we're, you'll, it's) to sound natural." Each instruction should be concrete enough that a freelancer could apply it without asking a follow-up question.

---

## Step 10: Copy Samples in the Brand Voice

Generate 8 copy samples. These are the most valuable part of the deliverable — people learn voice by example, not by reading descriptions. Cover diverse contexts so writers have references for every situation:

1. Homepage headline
2. Product description paragraph
3. Blog post opening
4. Social media post
5. Email subject line
6. CTA button text
7. Error message
8. Customer thank-you message

---

## Output Format: BRAND-VOICE.md

```markdown
# Brand Voice Guidelines
## [Brand Name]
### Analysis Date: [Date]

---

## Voice Summary
[2–3 sentence summary of brand voice, personality, and key characteristics]

---

## Voice Dimensions

### Formal ←→ Casual: [X/10]
[Evidence and writing implication]

### Serious ←→ Playful: [X/10]
[Evidence and writing implication]

### Technical ←→ Simple: [X/10]
[Evidence and writing implication]

### Reserved ←→ Bold: [X/10]
[Evidence and writing implication]

### Visual Voice Map
```
Formal                                    Casual
|----[X]----------------------------------|
Serious                                   Playful
|--------[X]------------------------------|
Technical                                 Simple
|------------------[X]--------------------|
Reserved                                  Bold
|------------[X]--------------------------|
```

---

## Brand Archetype
- Primary: [Archetype] — [explanation with evidence]
- Secondary: [Archetype if applicable]
- Fit strength: [Strong/Moderate/Weak]

---

## Tone by Context
[Table with context, tone, and quoted example for each]

---

## Vocabulary
### Words We Use
[Organized word lists by category]

### Words We Avoid
[Words out of character for the brand]

### Signature Phrases
[Recurring patterns and phrases]

---

## Voice Chart
| Our Voice IS | Our Voice IS NOT |
|---|---|
| [trait] | [anti-trait] |

---

## Writing Guidelines
### Do
- [Specific, actionable instruction]

### Don't
- [Specific anti-pattern to avoid]

---

## Brand Messaging Hierarchy
### Tagline
### Value Propositions
### Elevator Pitch
### Boilerplate

---

## Copy Samples
[8 examples covering all contexts]

---

## Competitor Voice Comparison
[Matrix + differentiation analysis + unoccupied voice territory]

---

## Consistency Audit
[Channel-by-channel scores and notes]
- Overall Score: [X/10]

---

## Recommendations
### Immediate Actions
### Voice Evolution Opportunities
### Consistency Improvements
```

---

## Cross-Skill Integration

- If `COMPETITOR-REPORT.md` exists, use competitor data for the voice comparison section
- If `COPY-SUGGESTIONS.md` exists, cross-reference identified value propositions
- Suggest follow-up: `/market copy` to rewrite existing copy in the identified voice, `/market competitors` for deeper competitive voice analysis
