# JSON Structure for PDF Report

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
