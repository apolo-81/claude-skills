---
name: ui-designer
description: >
  Extrae design systems de imagenes de referencia y los convierte en especificaciones
  implementables para React/Next.js. Usar cuando: diseno de UI, design system,
  design tokens, mockup, UI kit, reproducir este diseno, Figma, wireframe,
  paleta de colores, tipografia o redisenar una interfaz.
---

# UI Designer

Use this skill to convert reference screens, product ideas, or rough UI notes into implementation-ready frontend direction.

## Workflow

1. Gather inputs:
   - reference images or screenshots
   - product/app goal
   - existing PRD, if any
   - target stack, if known
2. Extract the design system with `assets/design-system.md`.
3. If the product scope is unclear, use `assets/app-overview-generator.md` to draft a concise MVP PRD.
4. Compose the implementation brief with `assets/vibe-design-template.md`.
5. Implement inside the existing app stack when a repo exists. If no app exists, prefer Next.js/Vite React with Tailwind and lucide-react rather than Create React App.
6. Verify responsive layout, text fitting, interaction states, and accessibility before delivery.

## Extraction Checklist

| Category | What to capture |
| --- | --- |
| Color | Exact hex values, roles, contrast, backgrounds, borders, semantic colors |
| Typography | Font families, scale, line-height, weights, letter spacing |
| Spacing | Base unit, page rhythm, component padding, section gaps |
| Shape | Radius, border width, focus rings, shadows |
| Components | Buttons, inputs, cards, nav, tabs, tables, modals, badges |
| States | Hover, active, focus, disabled, loading, empty, error, success |
| Motion | Durations, easing, reduced-motion behavior |
| Density | Information density, scan paths, mobile/desktop differences |

Use concrete values. Avoid vague language like "modern blue" or "medium spacing".

## Implementation Rules

- Match the existing project conventions before introducing new UI patterns.
- Use lucide-react icons when available.
- Do not use Create React App.
- Avoid nested cards and decorative gradients/orbs unless already part of the product language.
- Make text fit inside controls across mobile and desktop.
- Include empty, loading, error, and success states when the workflow needs them.
- Document inferred values as `[inferred]` when they are not visible in the reference.

## Assets

| Asset | Purpose |
| --- | --- |
| `assets/design-system.md` | Design-token extraction template |
| `assets/app-overview-generator.md` | Lean MVP PRD template |
| `assets/vibe-design-template.md` | Implementation brief template |
| `references/design-system-example.md` | Example of a documented design-system output |
