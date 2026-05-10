# UI Implementation Brief Template

Use this to convert design tokens and a PRD into implementation instructions. Replace placeholders before using it.

## Product Context

`{project_prd}`

## Design System

`{design_system}`

## Target Stack

- Framework:
- Styling:
- Component library:
- Icon library:
- Data source:

## Required Screens

| Screen | Route/component | Primary action | Required states |
| --- | --- | --- | --- |
| | | | empty, loading, error, success |

## Component Requirements

- Use exact token values from the design system.
- Include hover, active, focus-visible, disabled, loading, empty, error, and success states where relevant.
- Use lucide-react icons when an icon is needed.
- Keep fixed-format controls stable with explicit dimensions or responsive constraints.
- Ensure text never overflows buttons, tabs, cards, or table cells.
- Respect reduced-motion preferences.

## Responsive Requirements

- Mobile:
- Tablet:
- Desktop:

## Acceptance Checklist

- [ ] Matches existing app conventions.
- [ ] Uses exact colors, typography, spacing, and radius values.
- [ ] Keyboard navigation works.
- [ ] Focus states are visible.
- [ ] Empty/loading/error/success states are implemented.
- [ ] Mobile and desktop layouts are verified.
- [ ] No decorative UI obscures real product information.
