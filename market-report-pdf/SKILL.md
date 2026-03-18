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

| Format | Best For |
|---|---|
| **PDF** (this skill) | Client presentations, email attachments, sales collateral, first impressions |
| **Markdown** (`market-report`) | Internal use, iterative editing, version control |

## Recommended Workflow

For the best PDF, run these first (the PDF skill pulls their output automatically):
1. `/market audit <url>` 2. `/market competitors <url>` 3. `/market seo <url>` 4. `/market landing <url>` 5. `/market report-pdf <url>`

---

## How to Execute

### Step 1: Collect All Available Data

Check for: `MARKETING-AUDIT.md`, `LANDING-CRO.md`, `SEO-AUDIT.md`, `BRAND-VOICE.md`, `COMPETITOR-ANALYSIS.md`, `FUNNEL-ANALYSIS.md`, `SOCIAL-AUDIT.md`, `EMAIL-AUDIT.md`, `AD-AUDIT.md`

If none exist: 1) Recommend `/market audit <url>` first, 2) If user insists, analyze URL directly, 3) Run `python3 scripts/analyze_page.py <url>` for baseline data.

### Step 2: Build the JSON Data Structure

The `scripts/generate_pdf_report.py` script requires JSON input. See `references/json-field-guide.md` for scoring criteria and writing guidance.

**Required fields:** `url`, `date`, `brand_name`, `overall_score`, `executive_summary`, `categories`, `findings`, `quick_wins`, `medium_term`, `strategic`

**Optional:** `competitors` (omitting skips competitive landscape page)

JSON structure: ver `references/json-structure.md`.

**Field constraints:**
- `overall_score`: integer 0-100 (not string — breaks gauge)
- `categories`: exactly 6 entries; `score` integer 0-100, `weight` string like `"25%"`
- `findings`: 1-10 entries; `severity` one of: `Critical`, `High`, `Medium`, `Low`
- `quick_wins`, `medium_term`, `strategic`: string arrays, 1-10 items each
- `competitors`: 0-3 entries; each needs `name`, `positioning`, `pricing`, `social_proof`, `content`

### Step 3: Write and Validate JSON

```bash
cat > /tmp/report_data.json << 'JSONEOF'
{ ... assembled JSON data ... }
JSONEOF
python3 -c "import json; json.load(open('/tmp/report_data.json')); print('JSON valid')"
```

### Step 4: Check Dependencies

```bash
python3 -c "import reportlab" 2>/dev/null || pip3 install reportlab
```

### Step 5: Generate the PDF

```bash
python3 scripts/generate_pdf_report.py /tmp/report_data.json "MARKETING-REPORT-<domain>.pdf"
```

Domain naming: `example.com` -> `MARKETING-REPORT-example-com.pdf`

Demo mode (no args): `python3 scripts/generate_pdf_report.py` -> `MARKETING-REPORT-sample.pdf`

### Step 6: Verify and Clean Up

```bash
ls -la "MARKETING-REPORT-<domain>.pdf"
rm /tmp/report_data.json
```

Report file path and size. Expected: 200KB-500KB, 5-7 pages.

---

## PDF Report Structure

| Page | Content |
|---|---|
| 1 - Cover | Title, URL, date, score gauge (circular), grade letter (A+ to F), executive summary |
| 2 - Score Breakdown | Horizontal bar chart (6 categories, color-coded), score table with weights |
| 3 - Key Findings | Findings table with severity labels (Critical=red, High=orange, Medium=yellow, Low=blue) |
| 4 - Action Plan | Quick Wins / Medium-Term / Strategic sections |
| 5 - Competitive Landscape | Client vs up to 3 competitors (if `competitors` provided) |
| Final - Methodology | Scoring methodology, category weights, measurement criteria |

## Score-to-Color Reference

| Score | Color | Hex |
|---|---|---|
| 80-100 | Green | #00C853 |
| 60-79 | Blue | #2D5BFF |
| 40-59 | Amber | #FFB300 |
| 0-39 | Red | #FF1744 |

## Troubleshooting

| Issue | Solution |
|---|---|
| `ModuleNotFoundError: reportlab` | `pip3 install reportlab` |
| PDF only 1 page | JSON parsing error - run validation |
| Competitor table missing | Each competitor needs all 5 fields |
| Score gauge not rendering | `overall_score` must be integer |
| Empty PDF | Check all required fields present |

## Key Principles

- Validate JSON before generating. Corrupted JSON = useless PDF.
- Round all scores to whole numbers.
- Executive summary: 2-4 sentences max.
- Every score must be justifiable with evidence.
- For prospects, make opportunities compelling and action plan achievable.
