---
name: pro-presentations
description: >
  Crea presentaciones profesionales de alto impacto (keynotes, pitch decks, propuestas comerciales).
  Usar cuando: "presentacion profesional", "pitch deck", "crear slides", "deck para cliente",
  "investor deck", "presentacion para auditorio", "consulting deck", "TED-style",
  "propuesta visual", "slide deck", "presentacion impactante".
---

# Pro Presentations

Metodología basada en Nancy Duarte, Garr Reynolds, Michael Alley, Edward Tufte, Barbara Minto y estándares McKinsey/BCG.

## Related Skills

- **`ppt-creator`** — If available, use for PPTX export and chart generation via `chartkit.py`. This skill handles strategy, design, and content; ppt-creator handles file conversion.

## Quick Start

1. **Intake** — Ask the 8 Key Questions (or apply defaults)
2. **Select narrative framework** — Match presentation type to structure
3. **Build outline** — Assertion-evidence headlines, 1 idea per slide
4. **Apply Design System** — See `references/design-system.md` for typography, color, layout specs
5. **Apply Anti-AI Rules** — Break sameness, vary structure, add STAR moments
6. **Speaker notes** — 45-60 seconds per slide with transitions
7. **Score with Rubric** — Must reach 80/100 before delivery
8. **Package deliverables** — slides.md, notes.md, refs.md, assets/

For a complete slide example with notes, see `examples/sample-slides.md`.

---

## 1. Intake — 8 Key Questions

Ask before starting. If no response after 2 prompts, use **defaults** and note assumptions in speaker notes.

| # | Question | Default |
|---|----------|---------|
| 1 | **Audience**: Who, expertise level, what they care about? | General professional audience |
| 2 | **Venue**: Room size, lighting control, projector type? | Large auditorium, ambient light, 1080p projector |
| 3 | **Duration** and max slide count? | 20 min, 15 slides |
| 4 | **Objective**: What action should the audience take after? | Understand and accept the proposition |
| 5 | **Tone**: Formal/casual, inspirational/analytical? | Professional, clear, confident |
| 6 | **Data available**: Tables, CSV, metrics, case studies? | None; use placeholder + required fields list |
| 7 | **Brand**: Colors, fonts, logo, style guide? | Neutral professional theme |
| 8 | **Deliverable format**: Markdown, PPTX, both? | slides.md (Marp/Reveal.js compatible) |

---

## 2. Narrative Framework Selection

Select the framework that matches the presentation type. Do NOT default to generic bullet-point structure.

| Type | Framework | Slides | Duration | Structure |
|------|-----------|--------|----------|-----------|
| **Keynote / Conference** | Duarte Sparkline | 15-25 | 15-20 min | Oscillate: what is <-> what could be. Build to STAR moment. End with transformed future. |
| **Business / Consulting** | SCQA + Pyramid Principle | 12-15 | 15-20 min | Situation -> Complication -> Question -> Answer. Lead with conclusion, support with MECE arguments. |
| **Pitch Deck (Investors)** | Sequoia Format | 10-12 | 10-15 min | Purpose -> Problem -> Solution -> Why Now -> Market -> Competition -> Product -> Model -> Traction -> Team -> Ask |
| **Academic / Technical** | Assertion-Evidence (Alley) | 12-18 | 15-20 min | Each slide: sentence assertion headline + visual evidence (chart/diagram/image). No bullet points. |
| **TED-style** | TED 4-Step | 20-40 | 18 min max | Make them care (0-3min) -> Explain idea (3-8) -> Show evidence (8-15) -> Show impact (15-18). One idea only. |
| **Pecha Kucha** | 20x20 Fixed | 20 | 6:40 fixed | 20 slides, 20 seconds each. Image-dominant, minimal text. |

### Narrative Principles (All Types)

- **The audience is the hero, the presenter is the mentor** (Duarte)
- **Restrain, Reduce, Emphasize** — remove everything that does not serve the message (Reynolds)
- **Slides are not documents** — provide a separate handout for detailed reference
- **Every slide answers one question**: "What is the one thing the audience should remember from this?"
- **Build a STAR moment**: a deliberately unforgettable element — dramatic statistic, powerful visual, personal story, live demo, or provocative question

---

## 3. Slide Headline Rules

**MANDATORY: All slide headlines must be assertion sentences, not topic labels.**

This is the single highest-impact rule from presentation research (Alley, Minto, McKinsey).

| BAD (topic label) | GOOD (assertion sentence) |
|--------------------|---------------------------|
| "Revenue Analysis" | "Revenue grew 15% YoY, outpacing market by 3x" |
| "Market Overview" | "The $4.2B market is shifting toward AI-native solutions" |
| "Team" | "Our team combines 40 years of domain expertise with AI research" |
| "Next Steps" | "Three actions in 30 days will capture 80% of the opportunity" |
| "Challenges" | "Legacy infrastructure costs us $2M annually in lost productivity" |

**Test**: A senior executive flipping through only the headlines should understand the complete argument without reading any body content.

---

## 4. Design System for Auditoriums

Full specifications in `references/design-system.md`. Key rules:

**Typography:** Titles 40-44pt, body 28-32pt, absolute minimum 24pt. Max 2 font families. Weight: Regular/Medium/Bold only — never Light/Thin (they wash out on projection). Recommended: Inter, Montserrat, Helvetica, Calibri, Verdana.

**Color:** Contrast ratio 7:1 minimum (WCAG AAA) for projected content. 60-30-10 rule (background/content/accent). Light background for unknown venues. See `references/design-system.md` for projection-safe palettes and forbidden combinations.

**Layout:** 16:9 canvas (1920x1080). Title safe area: inner 80%. 12-column grid, spacing increments 4/8/16/24/32/48px. White space: 40-60% of each slide empty.

**Density:** Max 30 words/slide (business), 10 words (keynotes). **Billboard Test**: readable in 3 seconds from the back row.

**Charts:** Declarative titles ("Sales dropped 17%" not "Q3 Sales"). Maximize data-ink ratio (Tufte). All chart text 24pt+ for auditoriums. Blue/orange pairings (never red/green).

---

## 5. Anti-AI Rules (Breaking the Sameness Problem)

AI presentations fail because they are predictable, generic, and emotionally empty.

### 5.1 Structure Variation (MANDATORY)

**Never use the same layout for 3+ consecutive slides.** Rotate between:

| Layout Type | When to Use |
|-------------|-------------|
| **Full-bleed image** | Emotional impact, scene-setting |
| **Single big number** | Key statistic, surprise data |
| **Assertion + evidence** | Core arguments (headline + chart/diagram) |
| **Comparison (A vs B)** | Before/after, us vs. them |
| **Quote** | Authority, testimony |
| **Diagram/process** | Workflows, architecture |
| **Blank/breathing** | Transition, emphasis |

**Pattern-breaking rule:** After every 3-4 "normal" slides, insert a full-bleed image, big-number slide, or breathing slide.

### 5.2 Content Authenticity

- **Headlines as assertions** — never topic labels (see Section 3)
- **Specific over generic** — "$2.3M saved in 6 months" not "significant cost savings"
- **Real data or honest placeholders** — never fabricate statistics. Use `[DATA NEEDED: description]`
- **Personal stories > generic examples** — one real anecdote beats three hypothetical scenarios
- **Transitions are sentences** — each slide connects to the next via narrative bridge in speaker notes

### 5.3 The STAR Moment

Every presentation must have at least one **S**omething **T**hey'll **A**lways **R**emember (Duarte):

- A **shocking statistic** on a dedicated full slide
- An **evocative visual** that triggers emotional response
- A **repeatable sound bite** the audience will quote later
- A **memorable dramatization** (demo, prop, live example)
- An **emotive story** with conflict and resolution

Place at 70-80% through the presentation (just before or at the narrative climax).

### 5.4 Anti-Pattern Checklist

Before delivery, verify NONE of these are present:

- Three or more consecutive slides with identical layout
- Generic stock photography (handshakes, lightbulbs, puzzle pieces)
- Topic-label headlines instead of assertion sentences
- Bullet points as primary content on more than 40% of slides
- No STAR moment anywhere in the deck
- Slides that work as independent islands (no narrative flow)
- Fabricated statistics or unsourced data claims
- Animations that serve decoration, not communication

---

## 6. Speaker Notes

Generate notes for every slide. Structure:

```
[SLIDE N — estimated 45-60 seconds]

OPENING: Hook or transition from previous slide (1 sentence)
ASSERTION: State the headline claim in natural speech (1-2 sentences)
EVIDENCE: Explain the visual/data/story that supports it (2-3 sentences)
TRANSITION: Bridge to the next slide (1 sentence)

[Click cues: "Click to reveal chart" / "Advance animation"]
[Pause markers: "PAUSE 2 seconds for emphasis"]
```

**Rules:**
- 50-75 words per slide in notes (max 100 — beyond that is scripting)
- Bullet points, never full paragraphs
- Include key statistics you will say aloud but are NOT on the slide
- For the STAR moment slide, write the exact words to deliver

See `examples/sample-slides.md` for complete examples with notes.

---

## 7. Quality Rubric (100 points, threshold 80)

Score each criterion 0-10. **Do not deliver if total < 80.** If < 80, identify the 3 lowest-scoring items, improve, and re-score (max 2 iterations).

| # | Criterion | What 10/10 Looks Like |
|---|-----------|----------------------|
| 1 | **Goal clarity and CTA** | Audience, objective, and desired action are crystal clear. CTA is specific and actionable. |
| 2 | **Narrative structure** | Follows the selected framework with coherent arc and tension. |
| 3 | **Assertion-evidence headlines** | Every headline is a complete sentence. Executive can understand argument from headlines alone. |
| 4 | **Evidence quality** | Data is sourced, credible, and calibrated. No fabricated stats. Placeholders are explicit. |
| 5 | **Data visualization** | Charts match the question asked. Labels complete. Declarative titles. Color-blind safe. |
| 6 | **Typography and legibility** | Meets auditorium minimums. Max 2 fonts, 3 sizes. No Light/Thin weights. |
| 7 | **Contrast and accessibility** | 7:1 ratio (AAA). No color-only encoding. Palette survives projection. |
| 8 | **White space and density** | 40-60% empty. Billboard test passes. Max word counts respected. |
| 9 | **Anti-AI rules fulfilled** | Structure varies. STAR moment present. No 3+ identical layouts. No stock cliches. |
| 10 | **Speaker notes and transitions** | 45-60 sec per slide. OPENING-ASSERTION-EVIDENCE-TRANSITION structure. Pause markers included. |

---

## 8. Deliverables

All saved to `/output/`:

| File | Content |
|------|---------|
| `slides.md` | Marp/Reveal.js compatible. Assertion headlines, content, `![alt](image)` placeholders, `<!-- notes -->` blocks. |
| `notes.md` | Full speaker notes with timing, transitions, click cues, delivery outline. |
| `refs.md` | All citations, data sources, and image attributions. |
| `assets/*.png` | Generated charts (if data provided and matplotlib/pandas available). |
| `presentation.pptx` | PPTX export if python-pptx available. Otherwise, include conversion instructions. |

For the Marp header template and complete slide examples, see `examples/sample-slides.md`.

---

## References

- `references/design-system.md` — Full typography, color palettes, grid, density, and data visualization specs
- `references/technical-specs.md` — Resolution, aspect ratios, DPI, file formats, accessibility checklist, common mistakes, modern trends
- `examples/sample-slides.md` — 6 complete example slides in Marp format demonstrating layout variation, assertion headlines, STAR moment, and speaker notes
