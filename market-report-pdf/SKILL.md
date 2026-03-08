---
name: market-report-pdf
description: >
  PDF marketing report with charts, score gauges, and visual tables. Triggers:
  "PDF report", "reporte PDF", "client-ready report", "polished report",
  "reporte con gráficos", "informe profesional", "deliverable para cliente",
  "reporte ejecutivo", "branded report", "reporte con visualizaciones".
  Produces MARKETING-REPORT-<domain>.pdf.
---

# PDF Marketing Report Generator

## When to Use PDF vs. Markdown

**Simple rule:** PDF for client-facing deliverables. Markdown for working documents.

Why it matters: A Markdown file signals "work in progress." A polished PDF signals "professional deliverable." For a first impression with a prospect, or when a client is presenting your work internally to their team, the PDF version creates the appropriate level of perceived value.

| Format | Best For |
|---|---|
| **PDF** (this skill) | Client presentations, email attachments, sales collateral, first impressions |
| **Markdown** (`market-report`) | Internal use, iterative editing, version control, working sessions |

## Recommended Workflow

For the best PDF report, run these skills first (the PDF skill pulls their output automatically):
1. `/market audit <url>` — Comprehensive audit data
2. `/market competitors <url>` — Competitor comparison data
3. `/market seo <url>` — Detailed SEO findings
4. `/market landing <url>` — CRO analysis
5. `/market report-pdf <url>` — Compile everything into the PDF

## How to Execute

### Step 1: Collect All Available Data

Check for these files in the project directory:
- `MARKETING-AUDIT.md`, `LANDING-CRO.md`, `SEO-AUDIT.md`, `BRAND-VOICE.md`
- `COMPETITOR-ANALYSIS.md`, `FUNNEL-ANALYSIS.md`, `SOCIAL-AUDIT.md`
- `EMAIL-AUDIT.md`, `AD-AUDIT.md`

If no previous data exists:
1. Recommend running `/market audit <url>` first for the best results
2. If the user insists, analyze the provided URL directly
3. Run `python3 scripts/analyze_page.py <url>` to gather automated baseline data

### Step 2: Build the JSON Data Structure

The `scripts/generate_pdf_report.py` script requires a JSON input with the structure below. Every field must match the types and constraints specified — a malformed JSON produces an empty or broken PDF.

**Required fields** (script will fail without these): `url`, `date`, `brand_name`, `overall_score`, `executive_summary`, `categories`, `findings`, `quick_wins`, `medium_term`, `strategic`

**Optional fields**: `competitors` (omitting it skips the competitive landscape page)

```json
{
  "url": "https://example.com",
  "date": "March 6, 2026",
  "brand_name": "Example Co",
  "overall_score": 62,
  "executive_summary": "A 2-4 sentence summary covering: current marketing health, top 1-2 findings, estimated revenue impact, and recommended first step. Keep tight — this appears on the cover page below the score gauge.",
  "categories": {
    "Content & Messaging":      { "score": 68, "weight": "25%" },
    "Conversion Optimization":  { "score": 52, "weight": "20%" },
    "SEO & Discoverability":    { "score": 74, "weight": "20%" },
    "Competitive Positioning":  { "score": 48, "weight": "15%" },
    "Brand & Trust":            { "score": 70, "weight": "10%" },
    "Growth & Strategy":        { "score": 55, "weight": "10%" }
  },
  "findings": [
    { "severity": "Critical", "finding": "Specific description of the most urgent issue" },
    { "severity": "High",     "finding": "Description of a high-priority finding" },
    { "severity": "Medium",   "finding": "Description of a medium-priority finding" },
    { "severity": "Low",      "finding": "Description of a lower-priority finding" }
  ],
  "quick_wins": [
    "Specific action item implementable within one week",
    "Second quick win",
    "Third quick win"
  ],
  "medium_term": [
    "Action item requiring 1-3 months",
    "Second medium-term item",
    "Third medium-term item"
  ],
  "strategic": [
    "Foundational change requiring 3-6 months",
    "Second strategic item",
    "Third strategic item"
  ],
  "competitors": [
    {
      "name": "Competitor A",
      "positioning": "Their market position description",
      "pricing": "Their pricing model",
      "social_proof": "Their trust signals",
      "content": "Their content approach"
    }
  ]
}
```

**Field constraints:**
- `overall_score`: integer 0-100 (not a string — a string breaks the gauge)
- `categories`: exactly 6 entries; `score` is integer 0-100, `weight` is string like `"25%"`
- `findings`: 1-10 entries; `severity` must be one of: `Critical`, `High`, `Medium`, `Low`
- `quick_wins`, `medium_term`, `strategic`: arrays of strings, 1-10 items each
- `competitors`: 0-3 entries; each must have all 4 fields (`name`, `positioning`, `pricing`, `social_proof`, `content`)

See [`references/json-field-guide.md`](references/json-field-guide.md) for scoring criteria per category and guidance on writing effective findings.

### Step 3: Write and Validate the JSON File

```bash
cat > /tmp/report_data.json << 'JSONEOF'
{
  ... assembled JSON data ...
}
JSONEOF

# Validate before generating — a bad JSON produces a useless PDF
python3 -c "import json; json.load(open('/tmp/report_data.json')); print('JSON valid')"
```

### Step 4: Check Dependencies

```bash
python3 -c "import reportlab" 2>/dev/null || pip3 install reportlab
```

`reportlab` is the only non-standard dependency. Uses Helvetica (built-in) — no custom fonts needed.

### Step 5: Generate the PDF

```bash
python3 scripts/generate_pdf_report.py /tmp/report_data.json "MARKETING-REPORT-<domain>.pdf"
```

Replace `<domain>` with the target domain using hyphens instead of dots:
- `example.com` → `MARKETING-REPORT-example-com.pdf`
- `myapp.io` → `MARKETING-REPORT-myapp-io.pdf`

**Demo mode** (no arguments) generates a sample report with placeholder data:
```bash
python3 scripts/generate_pdf_report.py
# Creates: MARKETING-REPORT-sample.pdf
```

### Step 6: Verify and Clean Up

```bash
ls -la "MARKETING-REPORT-<domain>.pdf"
rm /tmp/report_data.json
```

Report the file path and size to the user. Expected: 200KB-500KB, 5-7 pages.

## PDF Report Structure

| Page | Content |
|---|---|
| 1 — Cover | Title, URL, date, score gauge (circular), grade letter (A+ to F), executive summary |
| 2 — Score Breakdown | Horizontal bar chart (6 categories, color-coded), score table with weights |
| 3 — Key Findings | Findings table with severity labels (Critical=red, High=orange, Medium=yellow, Low=blue) |
| 4 — Action Plan | Quick Wins / Medium-Term / Strategic sections |
| 5 — Competitive Landscape | Client vs up to 3 competitors (if `competitors` provided) |
| Final — Methodology | Scoring methodology, category weights, measurement criteria |

## Score-to-Color Reference

| Score Range | Color | Hex | Meaning |
|---|---|---|---|
| 80-100 | Green | #00C853 | Strong performance |
| 60-79 | Blue | #2D5BFF | Solid with room to improve |
| 40-59 | Amber | #FFB300 | Needs attention |
| 0-39 | Red | #FF1744 | Critical issues |

## Troubleshooting

| Issue | Solution |
|---|---|
| `ModuleNotFoundError: No module named 'reportlab'` | `pip3 install reportlab` |
| PDF is only 1 page | JSON parsing error — run validation step |
| Competitor table missing | Ensure each competitor has `name`, `positioning`, `pricing`, `social_proof`, `content` |
| Score gauge not rendering | `overall_score` must be an integer (not a string) |
| Empty PDF | Check all required fields are present |

## Output

- **File:** `MARKETING-REPORT-<domain>.pdf`
- **Location:** Project root directory
- **Size:** Typically 200KB-500KB
- **Pages:** 5-7 depending on competitor data

## Key Principles

- The PDF is the most client-facing deliverable in the toolkit — quality of findings matters more than quantity.
- Validate JSON before generating. A corrupted JSON produces a useless PDF.
- Round all scores to whole numbers. Decimals imply false precision.
- Keep the executive summary to 2-4 sentences — clients skim cover pages.
- Every score must be justifiable. If a client asks "why did I get 52 in Conversion Optimization?", the findings must provide clear evidence.
- For prospects (not yet clients), the report is a sales tool — make opportunities compelling and the action plan achievable.
- Use PDF for first impressions; follow up with the Markdown report (`market-report`) for detailed working sessions.
