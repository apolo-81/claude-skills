---
name: app-audit
description: >
  Audits applications broadly: code bugs, logic flaws, data issues, basic security,
  functional consistency, missing tests and product opportunities. Usar cuando:
  audita esta app, revisa errores de logica, busca inconsistencias, code review profundo,
  hallazgos, mejoras funcionales, oportunidades de implementacion. Triggers in English:
  "audit this app", "deep code review", "find bugs", "logic errors", "code quality".
  Do NOT use for: pure UX/flow/accessibility reviews (use ux-audit).
---

# App Audit

Use this skill for broad application audits, not just syntax review.

## Review Order

1. Identify stack, entrypoints, package scripts, tests, and data layer.
2. Map main user roles and critical workflows.
3. Review implementation by risk:
   - auth and permissions
   - data validation and persistence
   - business rules
   - async jobs/webhooks/integrations
   - error handling and empty states
   - timezone/date/currency handling
   - exports/imports and external calendar/payment/email flows
4. Run available checks when safe: typecheck, lint, tests, build.
5. Produce findings first, ordered by severity.

## Finding Format

For each finding include:

- severity: critical/high/medium/low
- file and line when available
- observed problem
- user impact
- recommended fix
- verification or test to add

## What To Look For

- UI says one thing, backend does another.
- Data shown without ownership/role checks.
- Missing names/metadata for user-generated content.
- Date/time without timezone or locale.
- Events without ICS/Google Calendar export when scheduling is core.
- Silent failures or swallowed errors.
- Race conditions in status transitions.
- Duplicate source of truth.
- Hardcoded assumptions about language, currency, country, or tenant.
- Reports/exports that omit filters or context.

## Output

Lead with findings. Then include:

- quick health score
- missing tests
- recommended implementation plan
- UX/product opportunities if relevant
