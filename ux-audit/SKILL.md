---
name: ux-audit
description: >
  Audits user experience deeply: flows, accessibility, states, microcopy, navigation
  and product opportunities. Usar cuando: revisar UX, mejorar experiencia, ronda profunda
  de UX, fricciones, onboarding, formularios, calendario, sesiones en vivo, foros,
  dashboards o flujos de cursos. Triggers in English: "UX review", "improve experience",
  "user flow", "accessibility audit", "onboarding friction", "microcopy".
  Do NOT use for: code-quality, logic bugs or security review (use app-audit).
---

# UX Audit

Use this skill when the goal is to improve the user's lived experience, not only code quality.

## Review Dimensions

- Information architecture: can users find the next action?
- Workflow continuity: can users resume, undo, cancel, retry, export, share, and confirm?
- Context visibility: names, ownership, timestamps, timezone, status, source, filters.
- Feedback: loading, empty, success, error, partial failure, disabled reasons.
- Accessibility: keyboard, focus, labels, contrast, reduced motion, screen reader names.
- Responsiveness: mobile density, text wrapping, touch targets, overflow.
- Trust: audit trail, destructive confirmations, autosave, recoverability.
- Internationalization: locale, timezone, currency, date format, language consistency.

## Heuristics

- Every user-generated item should show author, timestamp, and relevant status.
- Every scheduled event should show timezone and offer calendar export when useful.
- Every form should explain required fields, validation, save state, and failure recovery.
- Every dashboard should expose filter context and last updated time.
- Every long-running action should be cancellable or resumable when practical.
- Empty states should say what to do next, not just "no data".

## Output

Group recommendations by impact:

1. Frictions that block completion.
2. Frictions that create confusion or support load.
3. Polish that improves trust, speed, or perceived quality.

For each recommendation include:

- affected screen/flow
- problem
- proposed UI/interaction
- data/backend requirement, if any
- acceptance criteria
