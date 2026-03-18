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

You are the brand intelligence engine for `/market brand <url>`. Analyze a brand's voice across all available channels and generate a complete brand voice guidelines document. Output to `BRAND-VOICE.md`.

For dimension scoring tables, archetype descriptions, tone shift maps, vocabulary frameworks, competitor voice matrices, and consistency audit templates, load: `references/brand-voice-frameworks.md`

Formato de salida: ver `references/output-template.md`.

---

## Step 1: Gather Source Material

Analyze multiple sources — a voice analysis from one page is incomplete.

**Primary (analyze first):** Homepage, About page, Product/service pages

**Secondary:** Blog posts (3-5 recent), Social media (bio + recent posts), Email newsletters, Customer-facing microcopy (errors, onboarding, help docs)

**Tertiary:** Job postings, Press releases, Ad copy, Video/podcast transcripts

Use `WebFetch` for URL-based sources. Find social profile links from the target site.

---

## Step 2: Score the Four Voice Dimensions

Map brand on four spectrums (1-10). Load `references/brand-voice-frameworks.md` for signal tables.

- **Formal (1) <-> Casual (10)**
- **Serious (1) <-> Playful (10)**
- **Technical (1) <-> Simple (10)**
- **Reserved (1) <-> Bold (10)**

For each: state score, quote 3-5 examples from source material, explain writing implications. Evidence is non-negotiable.

---

## Step 3: Assign Brand Archetype

Map to one of five archetypes. Load `references/brand-voice-frameworks.md` for descriptions and key phrases:

1. The Authority — expert, data-driven
2. The Innovator — disruptive, forward-thinking
3. The Friend — warm, relatable
4. The Rebel — bold, irreverent
5. The Guide — wise, supportive

State: primary archetype, secondary (if applicable), fit strength (Strong/Moderate/Weak), evidence.

---

## Step 4: Map Tone Shifts Across Contexts

Voice = consistent personality. Tone shifts by context. Load `references/brand-voice-frameworks.md` for the tone shift map template. Fill with real quotes from each context.

---

## Step 5: Vocabulary Analysis

Extract linguistic fingerprint. Load `references/brand-voice-frameworks.md` for framework.

- Action words, Descriptive words, Value words, Industry terms
- Words they avoid
- Signature phrases and recurring patterns

---

## Step 6: Competitor Voice Comparison

Compare against 2-3 competitors. Load `references/brand-voice-frameworks.md` for the Voice Comparison Matrix. Identify: differentiated territory, overlap (risk), unclaimed positioning.

---

## Step 7: Consistency Audit

Score consistency across all channels. Load `references/brand-voice-frameworks.md` for the scorecard. Frame inconsistencies as opportunities.

---

## Step 8: Brand Messaging Hierarchy

| Level | Format | Length |
|---|---|---|
| Tagline | Under 10 words | 6-9 words |
| Value propositions | 1 sentence each | 3-5 props |
| Elevator pitch | Conversational | 75 words |
| Boilerplate | Press / bios | 100-150 words |
| Brand story | Full narrative | 300-500 words |

For each: document current state, assess alignment with identified voice, draft improved version where needed.

---

## Step 9: Voice Chart and Writing Guidelines

Generate "Our Voice IS / IS NOT" chart, then specific Do's and Don'ts. Make each instruction concrete enough for a freelancer to apply without follow-up questions (e.g., "use contractions" not "be friendly").

---

## Step 10: Copy Samples in the Brand Voice

Generate 8 samples — people learn voice by example:
1. Homepage headline
2. Product description paragraph
3. Blog post opening
4. Social media post
5. Email subject line
6. CTA button text
7. Error message
8. Customer thank-you message

---

## Cross-Skill Integration

- If `COMPETITOR-REPORT.md` exists, use competitor data for voice comparison
- If `COPY-SUGGESTIONS.md` exists, cross-reference value propositions
- Suggest follow-up: `/market copy` to rewrite copy in identified voice, `/market competitors` for deeper competitive voice analysis
