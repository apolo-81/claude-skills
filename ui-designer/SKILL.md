---
name: ui-designer
description: >
  Extract design systems from reference UI images and generate implementation-ready
  prompts. Triggers: "diseño de UI", "design system", "design tokens", "UI mockup",
  "reproducir este diseño", "quiero algo parecido a X app", "UX/UI", "color palette",
  "typography system", "referencia visual", "UI kit", "figma", "wireframe",
  "dashboard design", "me gusta este diseño", "componentes visuales".
---

# UI Designer

## Overview

This skill systematically extracts design systems from reference UI images and converts them into implementation-ready prompts. The workflow produces: design system documentation → PRD → final implementation prompt → React components.

**Use this skill for any task involving visual design references, design consistency, or UI implementation from mockups.**

## When to Use

- User provides UI screenshots, mockups, or design references (even a single image)
- Need to match the aesthetic of an existing product ("make it look like Notion", "similar to Linear")
- Want to extract color palettes, typography, spacing, or component styles
- Building MVP UI that should match reference aesthetics
- Creating design tokens or a design system from visual examples
- Generating multiple UI variations following consistent design principles
- User mentions wanting a "premium", "minimal", "modern", or any specific aesthetic

## Workflow

### Step 1: Gather Inputs

Request from user (or infer from context):
- **Reference images**: Path to folder with UI screenshots, or individual images attached to the conversation
- **Project idea file**: Document describing the product concept and goals (or extract from conversation)
- **Existing PRD** (optional): If PRD already exists, skip Step 3

**When only 1 reference image is provided**: Extract design tokens as precisely as possible from that single source. Note which design decisions are inferred vs. explicitly visible, and ask the user 2-3 clarifying questions to fill critical gaps (e.g., dark mode preference, brand color confidence).

**When multiple images are provided**: Cross-reference patterns across screens. Prioritize values that appear consistently. Flag inconsistencies and ask the user to confirm the canonical value.

### Step 2: Extract Design System from Images

**Use Task tool with general-purpose subagent**, providing:

**Prompt template** from `assets/design-system.md`

**What to extract — be exhaustive and specific:**

#### Color System
- Primary, secondary, accent, functional colors (exact hex/HSL values)
- Background layers (page, surface, elevated, overlay)
- Text colors (primary, secondary, muted, inverse, on-primary)
- Border/divider colors
- Semantic colors (success, warning, error, info) with their backgrounds
- Dark mode variants if present

#### Typography System
- Font families (headings, body, monospace, UI labels)
- Type scale: all visible sizes in px/rem
- Font weights used (not all weights, only those visible in the design)
- Line heights per text style
- Letter spacing for display text or uppercase labels
- Named text styles: h1-h6, body-lg, body-sm, caption, overline, label

#### Spacing System
- Base unit (4px, 8px, or other)
- Full scale used: 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px
- Component internal padding patterns
- Section/page-level margin patterns

#### Border & Shape System
- Border radius values (none, sm, md, lg, full — with px values)
- Border width and style patterns
- Shadow system: all visible box-shadow values (name + CSS value)
- Outline/ring styles for focus states

#### Component Styles
- Buttons: sizes, variants (primary, secondary, ghost, destructive), states (hover, active, disabled)
- Cards: padding, border, shadow, hover behavior
- Inputs: height, border, padding, placeholder style, focus ring
- Navigation: structure, active state, hover state
- Badges/tags: sizes, color variants
- Icons: library style (outlined, filled, sharp), size conventions

#### Animation Tokens
- Default transition duration and easing
- Hover transition style
- Any spring/bounce effects visible

**Attach reference images** to the subagent context.

**Output**: Complete design system markdown following the template format

**Save to**: `documents/designs/{image_dir_name}_design_system.md`

#### Example of a Well-Documented Design System

```markdown
## Colors
- Primary: #6366F1 (Indigo 500)
- Primary hover: #4F46E5 (Indigo 600)
- Primary text: #FFFFFF
- Background page: #F8FAFC
- Background surface: #FFFFFF
- Background elevated: #FFFFFF + shadow-md
- Border default: #E2E8F0
- Text primary: #0F172A
- Text secondary: #475569
- Text muted: #94A3B8

## Typography
- Font family: "Inter", system-ui, sans-serif
- h1: 36px / 700 / line-height 1.2
- h2: 28px / 600 / line-height 1.3
- body-lg: 16px / 400 / line-height 1.6
- body-sm: 14px / 400 / line-height 1.5
- label: 12px / 500 / uppercase / tracking 0.05em

## Spacing
Base unit: 4px
Scale: 4, 8, 12, 16, 20, 24, 32, 48, 64

## Shadows
- shadow-sm: 0 1px 2px rgba(0,0,0,0.05)
- shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1)
- shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1)

## Border Radius
- sm: 4px (badges, small elements)
- md: 8px (inputs, buttons)
- lg: 12px (cards)
- xl: 16px (modals, panels)
- full: 9999px (pills, avatars)

## Animation Tokens
- transition-default: 150ms ease-out
- transition-emphasis: 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)
```

### Step 3: Generate MVP PRD (if not provided)

**Use Task tool with general-purpose subagent**, providing:

**Prompt template** from `assets/app-overview-generator.md`:
- Replace `{项目背景}` with content from project idea file
- The template guides through: elevator pitch, problem statement, target audience, USP, features list, UX/UI considerations

**Interact with user** to refine and clarify product requirements. Ask focused questions — do not overwhelm. Prioritize: core use case, primary user action, must-have vs. nice-to-have features.

**Output**: Structured PRD markdown

**Save as variable** for Step 4 (optionally save to `documents/prd/`)

### Step 4: Compose Final UI Implementation Prompt

Combine design system and PRD using `assets/vibe-design-template.md`:

**Substitutions:**
- `{项目设计指南}` → Design system from Step 2
- `{项目MVP PRD}` → PRD from Step 3 or provided PRD file

**The resulting prompt must produce maximum fidelity to the reference design.** To achieve this:
- Include the exact color hex values — do not leave as generic descriptions
- Specify Tailwind class equivalents for each design token where possible
- Name components explicitly: "the primary button uses bg-indigo-500 hover:bg-indigo-600 rounded-lg px-4 py-2 text-sm font-medium text-white"
- Include states: default, hover, active, focus, disabled
- Reference specific patterns: "cards use shadow-sm with hover:shadow-md transition"

**Save to**: `documents/ux-design/{idea_file_name}_design_prompt_{timestamp}.md`

### Step 5: Verify React Environment

Check for existing React project:
```bash
find . -name "package.json" -exec grep -l "react" {} \;
```

If none found, inform user and provide setup:
```bash
npx create-react-app my-app
cd my-app
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install lucide-react
```

### Step 6: Implement UI

Use the final composed prompt from Step 4 to implement UI in React project.

The prompt instructs to:
- Create multiple design variations (3 for mobile, 2 for web)
- Organize as separate components: `[solution-name]/pages/[page-name].jsx`
- Aggregate all variations in showcase page

## Template Assets

### assets/design-system.md

Template for extracting visual design patterns. Includes sections for:
- Color palette (primary, secondary, accent, functional, backgrounds, dark mode)
- Typography (font families, weights, complete text styles)
- Component styles (buttons, cards, inputs, icons, badges)
- Spacing system (base unit + full scale)
- Shadows and border radius system
- Animation tokens (durations, easing curves)

Use this template when analyzing reference images to ensure comprehensive design system coverage.

### assets/app-overview-generator.md

Template for collaborative PRD generation. Guides through:
- Elevator pitch
- Problem statement and target audience
- Unique selling proposition
- Platform targets
- Feature list with user stories
- UX/UI considerations per screen

Designed for interactive refinement with user to clarify requirements.

### assets/vibe-design-template.md

Final implementation prompt template combining design system and PRD. Includes:
- Aesthetic principles (minimalism, whitespace, color theory, typography hierarchy)
- Practical requirements (Tailwind CSS, Lucide icons, responsive design)
- Task specifications (multiple variations, component organization)

This template produces prompts ready for UI implementation without further modification.

## Best Practices

### Image Analysis

- Read ALL images before starting analysis — patterns emerge from the full set
- Look for repeated values (spacing, colors) — repetition = design system, not coincidence
- Note both explicit styles (colors, fonts) and implicit principles (density, hierarchy, breathing room)
- Distinguish UI chrome (navigations, sidebars) from content areas — they often use different styles
- Capture dark mode if present; treat it as a first-class citizen, not an afterthought

### Design System Extraction

- Always use specific values (hex codes, px sizes, rem values) — never "blue" or "medium"
- Document every visible shadow: name it, write the full CSS value
- Name text styles descriptively: `heading-display`, `body-default`, `label-uppercase`
- Note which fonts are web-safe vs. require Google Fonts / local import
- Document hover and focus states — these are often distinctive parts of a design system

### Single Image vs. Multiple Images

**Single image**: Extract what is visible. Use best-practice defaults for what is missing (8px base unit, 4/8/16/24/32 spacing scale). Mark inferred values clearly with `[inferred]`. Ask user 2-3 targeted questions.

**Multiple images**: Identify the primary screen (usually dashboard or home) as the design system anchor. Use secondary screens to fill in gaps and confirm patterns. Flag any inconsistencies between screens.

### PRD Generation

- Engage user interactively to clarify ambiguities
- Suggest features based on problem understanding
- Ensure MVP scope is realistic
- Document UX considerations per screen/interaction

### Output Quality

- Save design system with descriptive filename (based on image dir name)
- Save final prompt with timestamp for version tracking
- Keep all outputs in `documents/` directory for easy reference
- Preserve intermediate outputs for iteration
- The final prompt is the most important deliverable — invest time in its quality

## Example Usage

**User provides:**
- `reference-images/saas-dashboard/` (5 screenshots)
- `ideas/project-management-app.md` (project concept)

**Execute workflow:**

1. Read 5 images from `reference-images/saas-dashboard/`
2. Use Task tool → design-system.md template → analyze all images systematically
3. Save to `documents/designs/saas-dashboard_design_system.md`
4. Use Task tool → app-overview-generator.md with project concept
5. Refine PRD through user interaction (2-3 focused questions)
6. Combine design system + PRD using vibe-design-template.md
7. Save to `documents/ux-design/project-management-app_design_prompt_20260306_153000.md`
8. Check React environment, inform user if setup needed
9. Implement UI using final prompt

## Notes

- This is a **high freedom** workflow — adapt steps based on context
- Templates provide structure but encourage thoughtful analysis over rote filling
- User interaction during PRD generation is critical for quality
- Final prompt quality directly impacts UI implementation fidelity
- Preserve all intermediate outputs for iteration and refinement
- When in doubt, extract more detail than seems necessary — it is easier to ignore extra tokens than to re-analyze images
