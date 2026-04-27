# Technical Specifications

## Resolution and Format

| Parameter | Standard |
|-----------|----------|
| Resolution | Design at 1920x1080 (scale to 3840x2160 for 4K venues) |
| Aspect ratio | 16:9 (use 4:3 only for confirmed legacy projectors) |
| Image resolution | Full-bleed: 1920px+ wide. Half-slide: 1024px+ wide. 150 DPI minimum. |
| File format | PPTX primary. PDF backup always. Font embedding for cross-platform. |
| Font embedding | TrueType/OpenType only. Use system fonts (Arial, Calibri) if cross-platform needed. |
| Margins | Title safe: 10% from each edge. Action safe: 5% from each edge. |

## Slides-Per-Minute Reference

| Format | Slides/Min | Time/Slide |
|--------|------------|------------|
| TED-style keynote | 1.5-3 | 20-40 sec |
| Business presentation | 0.5-1 | 1-2 min |
| Data-heavy review | 0.3-0.5 | 2-4 min |
| Pitch deck | 0.8-1.2 | 50-75 sec |
| Pecha Kucha | 3 | 20 sec (fixed) |

**Time allocation:** 10-15% introduction, 70-75% body, 10-15% conclusion + Q&A buffer.

## Accessibility Checklist

Before final delivery, verify:

- Color contrast 7:1 for body text, 4.5:1 for large text (use a contrast checker)
- No color-only information encoding (always pair with labels/patterns/symbols)
- Alt text on every image, chart, and diagram
- Logical reading order set (not just visual stacking)
- Tables have header rows defined
- All fonts embedded or system fonts used
- PDF backup created for guaranteed rendering
- Color-blind simulation tested (8% of males affected — red/green most common)

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Wall of text (30+ words) | One idea per slide. Move details to speaker notes or handout. |
| Topic-label headlines | Rewrite as assertion sentences. |
| Reading slides to audience | Slides support the speaker, they do not replace the speaker. Notes are prompts, not scripts. |
| Thin/light fonts | Regular or Medium weight minimum. Bold for emphasis. |
| Red text on any background | Red washes out first under ambient light. Use dark blue or black. |
| Inconsistent formatting | Lock to 2 fonts, 3 sizes, 3-4 colors. Apply consistently across every slide. |
| Cluttered charts | Declarative title + maximize data-ink ratio + remove gridlines + label directly. |
| Gratuitous animations | Remove any animation that draws attention to itself. Motion must serve communication. |
| Centered everything | Use Rule of Thirds. Off-center placement creates visual interest. |
| No PDF backup | Always carry PDF on separate USB. Mac PowerPoint does not embed fonts reliably. |

## Modern Trends (2024-2026)

Use **timeless** principles as foundation. Layer **trends** selectively:

| Timeless (Always Safe) | Trending (Use Judiciously) |
|------------------------|---------------------------|
| Clean typography hierarchy | Kinetic typography |
| Ample white space | Glassmorphism (frosted glass) |
| High-quality photography | Bento grid layouts |
| Consistent color palette | 3D / isometric illustrations |
| Purposeful animation | Dark mode by default |
| One idea per slide | Non-linear navigation |
| Assertion-evidence format | AI-generated imagery |
| 16:9 aspect ratio | Bold oversized typography (60-100pt+) |

**Sustainability rule:** If a design choice will look dated in 2 years, isolate it to accent elements — not the foundation.

---

## pptxgenjs Code-Generation Rules (CRITICAL — Prevents Overflow)

These rules apply whenever generating PPTX files programmatically with pptxgenjs. Violations cause text and shapes to overflow or be cut off entirely.

### Layout Constants — Choose Correctly

| Constant | Width | Height | When to Use |
|----------|-------|--------|-------------|
| `LAYOUT_WIDE` | 13.33" | 7.5" | **Standard 16:9 — use this by default** |
| `LAYOUT_16x9` | 10" | 5.625" | Compact 16:9 — only when all coordinates stay within 10"×5.625" |
| `LAYOUT_4x3` | 10" | 7.5" | Legacy 4:3 projectors only |

**MANDATORY RULE:** For any standard 16:9 presentation matching typical PPTX files, always set:
```javascript
pptx.layout = 'LAYOUT_WIDE';  // 13.33" × 7.5"
```
Never use `LAYOUT_16x9` unless you explicitly verify every coordinate is within its 10"×5.625" canvas. The mismatch between layout size and coordinate values is the #1 cause of content being rendered outside the visible slide area.

### Coordinate Safety Rules

Before placing any element, verify these constraints (values in inches):

| Layout | Max X | Max Y | Safe content area |
|--------|-------|-------|-------------------|
| LAYOUT_WIDE | 13.33 | 7.5 | x: 0.3–12.8, y: 0.3–6.8 |
| LAYOUT_16x9 | 10.0 | 5.625 | x: 0.3–9.5, y: 0.3–5.1 |

**For every `addText()` and `addShape()` call, verify:**
- `x + w ≤ slide width`
- `y + h ≤ slide height`
- Leave at least 0.3" margin from all edges
- Reserve bottom 0.5" for branding bars: `y ≤ (slide_height − 0.5)` for main content

### Anti-Overflow Text Settings

**Always include `shrinkText: true` as a safety net on every `addText()` call:**

```javascript
// Safe text helper — use this pattern for all slides
function txt(slide, text, opts) {
  slide.addText(text, { shrinkText: true, ...opts });
}
```

Additional safe-text practices:
- **Set explicit `w` and `h`** on every text box — never rely on auto-sizing
- **Keep font sizes within auditorium minimums**: 40-44pt titles, 28-32pt body, 24pt minimum
- **Test text length**: if a string may exceed box bounds, reduce font size before relying on `shrinkText`
- **Multi-line text**: account for line breaks — a 3-line text at 32pt needs h ≥ 1.5" per line (≈0.5"/line at 32pt)

### Element Coordinate Checklist

Before finalizing the generate script, run this mental check for each slide:

```
For each element on the slide:
  [ ] x ≥ 0.3 (left margin)
  [ ] x + w ≤ slide_width − 0.3 (right margin)
  [ ] y ≥ 0 (top of slide)
  [ ] y + h ≤ slide_height − 0.3 (bottom margin, or 0.5 for branding bar)
  [ ] Text box has shrinkText: true
  [ ] Font size ≥ 24pt for any visible text
```

### Common pptxgenjs Errors

| Error | Cause | Fix |
|-------|-------|-----|
| Content invisible / cut off | Used `LAYOUT_16x9` but coordinates exceed 10"×5.625" | Switch to `LAYOUT_WIDE` and recalculate all coordinates |
| Text overflows box | Box too small for text at given font size | Add `shrinkText: true` and/or increase `h` |
| Image stretches wrong | Wrong `w`/`h` ratio for image source | Use source aspect ratio to calculate dimensions |
| Text misaligned vertically | Missing `valign` property | Add `valign: 'top'` or `'middle'` explicitly |
| Logo too large/small | Hardcoded inches without checking source dimensions | Use `sizing: { type: 'contain', w, h }` for images |
