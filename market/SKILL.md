---
name: market
description: >
  Orquestador lean de marketing, SEO, copy, landing CRO, emails, launch, propuestas,
  competencia e identidad visual. Usar cuando: marketing, auditoria de marketing,
  analiza mi sitio, copy, email marketing, funnel, propuesta comercial, lanzamiento,
  voz de marca, identidad visual, paleta de colores, landing page o conversion.
---

# AI Marketing Suite

This is the only marketing skill that should stay active by default. Specialized `market-*` skills are kept as on-demand reference files to reduce Claude's base context.

## Commands

| Command | Output | On-demand source |
| --- | --- | --- |
| `/market audit <url>` | `MARKETING-AUDIT.md` | `../market-audit/SKILL.md.off` |
| `/market quick <url>` | Short terminal scorecard | this file |
| `/market copy <url>` | `COPY-SUGGESTIONS.md` | `../market-copy/SKILL.md.off` |
| `/market emails <topic/url>` | `EMAIL-SEQUENCES.md` | `../market-emails/SKILL.md.off` |
| `/market social <topic/url>` | `SOCIAL-CALENDAR.md` | `../market-social/SKILL.md.off` |
| `/market ads <url>` | `AD-CAMPAIGNS.md` | `../market-ads/SKILL.md.off` |
| `/market funnel <url>` | `FUNNEL-ANALYSIS.md` | `../market-funnel/SKILL.md.off` |
| `/market competitors <url>` | `COMPETITOR-REPORT.md` | `../market-competitors/SKILL.md.off` |
| `/market landing <url>` | `LANDING-CRO.md` | `../market-landing/SKILL.md.off` |
| `/market launch <product>` | `LAUNCH-PLAYBOOK.md` | `../market-launch/SKILL.md.off` |
| `/market proposal <client>` | `CLIENT-PROPOSAL.md` | `../market-proposal/SKILL.md.off` |
| `/market report <url>` | `MARKETING-REPORT.md` | `../market-report/SKILL.md.off` |
| `/market report-pdf <url>` | `MARKETING-REPORT.pdf` | `../market-report-pdf/SKILL.md.off` |
| `/market seo <url>` | `SEO-AUDIT.md` | `../seo-core/SKILL.md.off` |
| `/market brand <url>` | `BRAND-VOICE.md` | `../market-brand/SKILL.md.off` |
| `/market visual-identity <business/url>` | `VISUAL-IDENTITY.md` + `tokens.json` | `../market-visual-identity/SKILL.md.off` |

## Routing

1. Identify the requested command or infer it from the user intent.
2. For `quick`, use the quick snapshot below and do not load extra files.
3. For every other command, read only the matching on-demand source from the table.
4. If the source points to a disabled skill, treat it as a reference document, not as an instruction to reactivate the whole group.
5. If multiple outputs are requested, load only the needed sources.

## Quick Snapshot

Use when the user asks for a fast marketing read, "quick", or a first impression.

Fetch the homepage if a URL is provided. Keep output under 30 lines:

1. Business type and likely target user.
2. Score 0-100 with one-line rationale.
3. Top 3 conversion blockers.
4. Top 3 quick wins.
5. One highest-leverage next action.

Score with these weights:

| Category | Weight |
| --- | ---: |
| Message clarity | 25% |
| CTA and conversion path | 20% |
| Trust and proof | 15% |
| Offer strength | 15% |
| SEO/findability basics | 15% |
| Mobile/readability | 10% |

## Shared Rules

- Use evidence from the URL, files, screenshots, analytics, or user-provided context.
- Mark assumptions explicitly when evidence is missing.
- Give concrete changes, not generic marketing advice.
- Prefer prioritized action lists over broad theory.
- If writing copy, produce ready-to-use text.
- If estimating impact, state confidence and what data would validate it.
