---
name: market-visual-identity
description: >
  Generates a complete corporate visual identity: psychologically-justified color palette
  by sector, 50→950 shade scale, WCAG AA/AAA validation, typography pair with modular scale,
  3-level design tokens (W3C format), and guidelines in VISUAL-IDENTITY.md.
  Use when user requests: "identidad visual", "paleta de colores", "brand colors",
  "design system", "tipografía corporativa", "imagen de marca", "design tokens",
  "brand identity", "corporate branding", "visual identity", "branding visual",
  "colores corporativos".
  Do NOT use for: single-color picks, mood boards, or pure logo design (use ui-designer instead).
  Output language: match the user's input language.
  Command: /market visual-identity
---

# Visual Identity Generator

Generate a complete, professionally justified corporate visual identity based on the business context. Output: `VISUAL-IDENTITY.md` + `tokens.json`.

For color psychology data, typography pairs, WCAG rules, token architecture, and output templates, load the corresponding reference files as needed in each step.

## Step 1: Intake — Gather Business Context

Collect the following fields before proceeding:

**Required:**
- Brand name
- Sector / Industry
- 3–5 brand values (e.g., "innovation, trust, accessibility")
- Target audience (age range, profile, B2B or B2C)
- Communication tone: formal / semi-formal / casual

**Optional:**
- Competitor URLs (activates Step 2)
- Colors to avoid or keep

**Rules:**
- If the user gave a free-text description, extract the required fields from it — do not ask again for information already provided.
- If one or more required fields are missing, ask for all of them in a single message (do not ask field by field).

---

## Step 2: Competitor Research (conditional)

Only execute this step if competitor URLs were provided in Step 1. If no URLs were given, skip directly to Step 3.

For each URL provided:
- Use WebFetch to load the page
- Extract dominant colors from CSS and inline styles: background colors, text colors, CTA button colors, header/nav colors
- Note typography family if visible in HTML `<link>` or `<style>` tags
- Record findings as "occupied visual territory"

After analyzing all URLs, write a summary:
> "These competitors use [colors/typography] — your identity will differentiate by [direction]."

---

## Step 3: Sector Analysis → 3 Palette Options

Load: `references/color-psychology.md`

1. Match the user's sector to the closest entry in the sector color map.
2. Read its psychological justification and "colors to avoid."
3. Generate 3 distinct palette directions:

**Option A — Autoridad / Confiable**
- Dominant approach for this sector; lowest perceived risk
- Best for: established brands, regulated industries
- Deliver: primary color HEX + descriptive name (e.g., "Azul Justicia") + 2-line psychological justification + suggested secondary tone

**Option B — Moderna / Diferenciadora**
- Shifts away from sector norm; higher saturation or unexpected hue
- Best for: new market entrants, younger audiences
- Same fields as Option A

**Option C — Emocional / Bold**
- Highest affective charge; emotional pole of color psychology for this sector
- Best for: B2C brands, lifestyle, consumer goods
- Same fields as Option A

Ask the user to choose one option before proceeding. If they request a variation of any option, generate the variation and confirm the choice before continuing to Step 4.

---

## Step 4: Expand Chosen Palette

### 4.1 Primary — Full Shade Scale (50→950)
Generate 11 shades by adjusting HSL lightness (L) while keeping H and S close to base:
- **L targets for 50–400:** approximately [97, 93, 85, 72, 55] — light → mid (mix with white)
- **Shade 500:** the base color chosen in Step 3 (keep exact HSL)
- **L targets for 600–950:** approximately [38, 28, 18, 10, 4] — mid → dark (mix with black)
- Slightly reduce saturation (S) at extremes (50 and 950) to avoid oversaturated washes.

### 4.2 Secondary Color
- Hue: ±30° shift from primary (analogous)
- Generate key shades: 100, 500, 700

### 4.3 Accent Color
- Hue: 180° complementary — or ±150° split-complementary if the direct complement visually clashes with the sector
- Generate key shades: 400, 500, 600

### 4.4 Neutrals
- Warm neutrals if primary hue is 0–60° or 270–360° (reds, oranges, magentas, purples)
- Cool neutrals if primary hue is 60–270° (yellow-greens, greens, teals, blues)
- Full scale: 50→950

### 4.5 60-30-10 Rule Application
- 60% — neutral-50 or primary-50: page background
- 30% — primary-500 or secondary-500: headers, nav, section fills
- 10% — accent-500: CTAs, highlights, interactive elements

---

## Step 5: WCAG Validation

Load: `references/wcag-rules.md`

Calculate the contrast ratio for exactly these 5 combinations using the relative luminance formula:

| # | Foreground | Background | Use case |
|---|---|---|---|
| 1 | White `#FFFFFF` | primary-500 | Light text on brand |
| 2 | Black `#000000` | primary-500 | Dark text on brand |
| 3 | primary-900 | neutral-50 | Body text on page bg |
| 4 | accent-500 | White `#FFFFFF` | CTA on light background |
| 5 | accent-500 | primary-900 | CTA in dark mode |

**Rating scale:**
- ✅ AAA — ratio ≥ 7:1
- ✅ AA — ratio ≥ 4.5:1
- ✅ AA large — ratio ≥ 3:1 (for text ≥18px or bold ≥14px)
- ⚠ Fails AA — ratio < 3:1

**If a combination fails AA:**
- Find the nearest shade of that color that passes
- Document: original shade + contrast ratio + recommended accessible shade + new ratio
- Do NOT change the base 500 color

---

## Step 6: Typography

Load: `references/typography-pairs.md`

1. Match the user's communication tone (formal / semi-formal / casual) and sector to the appropriate personality profile in the reference file.
2. Select the best-fit pair from that profile. Default to Pair A unless context clearly favors B or C (justify the choice in one sentence).
3. Choose modular scale:
   - Default: Perfect Fourth (1.333)
   - Text-heavy / blog: Major Third (1.25)
   - Landing pages: Perfect Fifth (1.5)
   - Luxury / editorial: Golden Ratio (1.618)
4. Calculate full scale from 16px base × chosen ratio (8 tokens):

| Token | Multiplier | px | rem |
|---|---|---|---|
| xs | base ÷ ratio² | — | — |
| sm | base ÷ ratio | — | — |
| base | 1× | 16px | 1rem |
| lg | 1× ratio | — | — |
| xl | 1× ratio² | — | — |
| 2xl | 1× ratio³ | — | — |
| 3xl | 1× ratio⁴ | — | — |
| 4xl | 1× ratio⁵ | — | — |

5. Write the Google Fonts import HTML `<link>` tags for both fonts in the pair.

---

## Step 7: Design Tokens

Load: `references/token-architecture.md`

Generate `tokens.json` following the 3-level architecture:

**Level 1 — Primitives**
All raw HEX values:
- primary: all 11 shades (50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950)
- secondary: shades 100, 500, 700
- accent: shades 400, 500, 600
- neutral: all 11 shades (50→950)

**Level 2 — Semantic tokens (22 required)**
All role-based tokens referencing primitives. Include typography tokens (font families, scale, weights, line heights).

**Level 3 — Dark mode overrides**
At minimum: bg-page, bg-surface, bg-surface-raised, text-primary, text-secondary, border-default

**CSS section**
Include a pre-written CSS custom properties string (`:root { ... }` + `[data-theme="dark"] { ... }`) ready to paste into `globals.css`.

---

## Step 8: Generate Output Files

Load: `references/output-template.md`

Fill both templates completely using all values generated in Steps 3–7. Replace every `[PLACEHOLDER]` — none should remain in the final output.

**File 1: VISUAL-IDENTITY.md**
- Save to the current working directory, or to a user-specified path if one was provided
- If no project directory is available or specified: output as a fenced code block

**File 2: tokens.json**
- Save to the same directory as VISUAL-IDENTITY.md
- If no project directory: output as a fenced code block

---

## Cross-Skill Integration

After completing the output, suggest:
- **`/market brand`** — Define brand voice and tone (messaging, copywriting guidelines)
- **`/market copy`** — Write copy using the defined visual identity as context
- **`/ui-designer`** — Implement UI components using the generated design tokens
- **`/pro-presentations`** — Downstream skill for pitch decks / keynotes. Once `tokens.json` exists, pro-presentations consumes the palette and typography automatically (see its Step 4 integration).
- **`/market competitors`** — Deep competitive analysis if only basic research was done in Step 2

---

## References

- `references/color-psychology.md` — 32 sectors with palette + psychology + examples
- `references/typography-pairs.md` — 7 personality profiles with Google Font pairs
- `references/wcag-rules.md` — WCAG 2.1 luminance formula + thresholds + fix guide
- `references/token-architecture.md` — 3-level architecture + 22 required semantic tokens
- `references/output-template.md` — VISUAL-IDENTITY.md + tokens.json templates
- `examples/raices-clinica-dental.md` — Complete reference example (dental clinic, semi-formal tone, teal palette, WCAG AA compliance)

---

## Quality Checklist (self-review before delivering)

Before presenting the final output, verify:
- [ ] Every color has a descriptive name (not just a hex)
- [ ] Every color choice has a 2+ line psychological justification tied to the sector
- [ ] All 5 WCAG combinations are calculated with actual ratios (not estimated)
- [ ] tokens.json has all 22 required semantic tokens
- [ ] No [PLACEHOLDER] remains in VISUAL-IDENTITY.md or tokens.json
- [ ] Typography includes Google Fonts import HTML
- [ ] The scale table has all 8 size tokens (xs to 4xl) with px and rem values
- [ ] The sector matched in color-psychology.md is the correct/closest one
