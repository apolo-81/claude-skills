# Programmatic SEO Reference

## Data Source Assessment
- CSV/JSON: row count, column uniqueness, missing values, duplicates
- API: response structure, freshness, rate limits
- Per-record viability: 5-7 meaningful unique data points minimum
- Near-duplicates (>80% overlap): merge or noindex

## Template Quality
Every page must pass: "Would this page be worth publishing if no other similar pages existed?"

**Components:**
- Static: nav, footer, generic descriptions (shared)
- Dynamic: entity-specific data, specs, reviews, stats (must dominate)
- Conditional: shown/hidden based on data availability

**Content variation strategies:** Data depth, UGC integration, dynamic related
content, third-party data enrichment, supplementary editorial (top 10-20%).

## Uniqueness Requirements

| Page Type | Minimum Unique |
|-----------|---------------|
| Location pages | 40% |
| Integration/tool directories | 35% |
| Glossary/definition | 50% |
| Product pages with specs | 30% |
| Comparison pages | 45% |

## URL Patterns
`/[city]/[service]/`, `/tools/[tool-name]/`, `/integrations/[platform]/`,
`/glossary/[term]/`, `/vs/[competitor]/`, `/[a]-vs-[b]/`

## Quality Gates

| Metric | Threshold | Action |
|--------|-----------|--------|
| Unique content | <40% | Flag as thin — penalty risk |
| Unique content | <30% | HARD STOP — do not publish |
| Word count | <300 | Flag for review |
| Word count | <150 | Do not publish |
| Pages without review | 100+ | WARNING |
| Pages without approval | 500+ | HARD STOP |

## When NOT to Use Programmatic SEO
1. Data too thin (<5-7 unique data points per record)
2. Demand doesn't exist (validate keyword volume first)
3. Business can't support pages (no presence in claimed locations)
4. YMYL niche without expert review
5. Domain authority too low (DR <20, <5% indexation rate)
6. Can't maintain/update data automatically

## Scaled Content Abuse Policy (2024-2026)
Progressive rollout: batches of 50-100; monitor 2-4 weeks before expanding.
Human review: sample 5-10% before publishing. Never 500+ pages simultaneously.
30-40% genuinely unique content minimum between any two pages.

## Internal Linking Automation
Hub/spoke model, related items (3-5 by shared attributes), auto-generated
BreadcrumbList, cross-linking, varied anchor text, 3-5 links per 1,000 words.
