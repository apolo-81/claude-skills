# Design System for Auditoriums

## Typography

| Element | Auditorium (100+ people) | Small room (<30) | Keynote (stage) |
|---------|--------------------------|-------------------|-----------------|
| Title | 40-44 pt | 36 pt | 60 pt+ |
| Subtitle | 32-36 pt | 28-32 pt | 44 pt |
| Body | 28-32 pt | 24 pt | 36-48 pt |
| Footnotes/sources | 20-24 pt | 18 pt | 24 pt |
| Chart labels | 24 pt+ | 18 pt+ | 32 pt+ |
| **Absolute minimum** | **24 pt** | **18 pt** | **28 pt** |

**Font rules:**
- **Maximum 2 font families** (1 heading + 1 body). Never 3+.
- **Maximum 3 font sizes per slide** to maintain hierarchy.
- **Weight: Regular, Medium, or Bold only.** NEVER use Light, Thin, or Hairline — they wash out on projection.
- **Recommended fonts:** Inter, Montserrat, Helvetica, Calibri, Verdana (all designed for screen readability).
- **Line spacing:** 1.3x-1.5x font size for body text. Headings: 1.1x.
- **Line length:** 50-70 characters max per line.

**Kawasaki 10/20/30 Rule:** 10 slides, 20 minutes, 30pt minimum font — useful as a sanity check even when not strictly followed.

---

## Color and Contrast for Projection

**Projectors degrade color.** Blacks become gray, thin text washes out, reds disappear under ambient light. Design for worst-case projection.

| Parameter | Standard |
|-----------|----------|
| **Contrast ratio (body text)** | 7:1 minimum (WCAG AAA) |
| **Contrast ratio (large text 18pt+)** | 4.5:1 minimum |
| **Palette size** | 3-4 colors total (60-30-10 rule) |
| **60% dominant** | Background color |
| **30% secondary** | Body text and content |
| **10% accent** | Emphasis, CTA, key data |

### Venue-Based Background Selection

| Venue Condition | Recommended Background | Reasoning |
|-----------------|----------------------|-----------|
| Ambient light (hotels, conference halls) | **Light** (warm beige #F5F0EB or light gray #F3F4F6) | Dark text survives ambient light |
| Controlled lighting (theaters, dedicated rooms) | **Dark** (navy #1E293B or charcoal #1F2937) | Colors pop, cinematic impact |
| Unknown venue | **Light** | Safe default |

### Projection-Safe Palettes

**Light background:**
- Background: `#F5F0EB` (warm beige) or `#FFFFFF`
- Text: `#1F2937` (dark ink)
- Accent: `#2563EB` (blue)
- Emphasis: `#DC2626` (red, use sparingly)

**Dark background:**
- Background: `#1E293B` (navy) or `#111827`
- Text: `#F9FAFB` (near-white)
- Accent: `#60A5FA` (light blue)
- Emphasis: `#FBBF24` (amber)

### Forbidden Combinations

- Red/green together (color blindness — affects 8% of males)
- Orange/blue adjacent (visual vibration)
- Red text on any background (washes out first under glare)
- Never use color alone to convey meaning — always pair with labels, patterns, or symbols

---

## Layout and Grid

| Parameter | Value |
|-----------|-------|
| **Canvas** | 16:9 (1920 x 1080 px) |
| **Title safe area** | Inner 80% (text never closer than 96px from edge) |
| **Action safe area** | Inner 90% (visuals never closer than 48px from edge) |
| **Grid** | 12 columns, 24-32px gutters |
| **Spacing increments** | 4 / 8 / 16 / 24 / 32 / 48 px |
| **Border radius** | 6-8px on cards, charts, images |
| **Image padding** | 8px minimum around charts/images |

---

## Slide Density

| Presentation Type | Max Words/Slide | Bullet Points | Ideas |
|-------------------|-----------------|---------------|-------|
| TED / Keynote | 0-10 | 0 (image-only OK) | 1 |
| Business / Consulting | 15-30 | 3-5 max, 6 words each | 1 |
| Academic / Technical | 30-40 | Prefer diagrams over bullets | 1 |
| Pitch Deck | 10-20 | 2-4 max | 1 |

**The Billboard Test (Duarte/Reynolds):** If someone in the back row cannot grasp the slide's point in 3 seconds, it has too much content.

**White space:** 40-60% of each slide must be empty. White space is not wasted — it directs attention and signals confidence.

---

## Images and Data Visualization

**Images:**
- Minimum 1920px wide for full-bleed backgrounds (3840px for 4K venues)
- 150 DPI minimum, 300 DPI recommended for print handouts
- Use Rule of Thirds for subject placement
- One powerful image > multiple small images
- NO stock cliches: no handshakes, lightbulbs, puzzle pieces, generic "diverse team"

**Charts and data visualization:**
- Every chart title must be a **declarative statement** ("Sales dropped 17% in Q3" not "Q3 Sales")
- Maximize **data-ink ratio** (Tufte): remove gridlines, reduce axis ticks, eliminate chartjunk
- Maximum 5-6 data series per chart
- All chart text minimum 24pt for auditoriums
- Label data directly on the chart when possible (avoid separate legends)
- Color-blind safe: use blue/orange or blue/red pairings, never red/green
