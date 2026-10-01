---
name: ui-designer
description: >
  Extrae design systems de imágenes de referencia y genera prompts listos para implementar.
  Workflow: imagen → tokens de diseño → PRD → componentes React.
  Usar cuando: "diseño de UI", "design system", "design tokens", "mockup", "UI kit",
  "reproducir este diseño", "quiero algo parecido a X", "Figma", "wireframe",
  "palette de colores", "tipografía del sistema", "me gusta este diseño".
---

# UI Designer

Extract design systems from reference UI images and convert into implementation-ready prompts. Workflow: design system docs > PRD > implementation prompt > React components.

## Workflow

### Step 1: Gather Inputs

- **Reference images**: folder or individual screenshots
- **Project idea file**: product concept (or extract from conversation)
- **Existing PRD** (optional): skip Step 3 if provided

**1 image:** Extract tokens precisely, note inferred vs visible, ask 2-3 clarifying questions.
**Multiple images:** Cross-reference patterns, prioritize consistent values, flag inconsistencies.

### Step 2: Extract Design System

Use Task tool with `assets/design-system.md` template. Attach reference images.

**Extract exhaustively:**

| Category | What to extract |
|----------|----------------|
| Colors | Primary/secondary/accent, backgrounds (page/surface/elevated/overlay), text colors, borders, semantic (success/warning/error/info), dark mode |
| Typography | Families (heading/body/mono), type scale (px/rem), weights, line heights, letter spacing, named styles h1-h6/body/caption/label |
| Spacing | Base unit, full scale used, component padding, section margins |
| Borders & Shape | Radius values (none/sm/md/lg/full + px), border width/style, shadow system (name + CSS), focus ring |
| Components | Buttons (sizes/variants/states), cards, inputs, navigation, badges, icons (library/size) |
| Animation | Default transition duration/easing, hover style |

**Always use specific values** (hex, px, rem) — never "blue" or "medium".

Save to: `documents/designs/{image_dir_name}_design_system.md`

Ver `references/design-system-example.md` para ejemplo de output bien documentado.

### Step 3: Generate MVP PRD (if not provided)

Use Task tool with `assets/app-overview-generator.md`. Replace `{项目背景}` with project concept.

Interact with user to refine. Ask focused questions. Prioritize: core use case, primary action, must-have vs nice-to-have.

Save as variable for Step 4 (optionally to `documents/prd/`).

### Step 4: Compose Final UI Implementation Prompt

Combine design system + PRD using `assets/vibe-design-template.md`:
- `{项目设计指南}` > Design system from Step 2
- `{项目MVP PRD}` > PRD from Step 3

Include: exact hex values, Tailwind class equivalents, component states (default/hover/active/focus/disabled), specific patterns ("cards use shadow-sm with hover:shadow-md transition").

Save to: `documents/ux-design/{idea_file_name}_design_prompt_{timestamp}.md`

### Step 5: Verify React Environment

Check for existing React project. If none:
```bash
npx create-react-app my-app && cd my-app
npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p
npm install lucide-react
```

### Step 6: Implement UI

Use final prompt to create multiple variations (3 mobile, 2 web). Organize: `[solution-name]/pages/[page-name].jsx`. Aggregate in showcase page.

## Template Assets

| Asset | Purpose |
|-------|---------|
| `assets/design-system.md` | Template for extracting visual patterns (colors, typography, components, spacing, shadows, animations) |
| `assets/app-overview-generator.md` | Collaborative PRD generation (elevator pitch, problem, audience, features, UX) |
| `assets/vibe-design-template.md` | Final prompt combining design system + PRD for implementation |

## Key Rules

- Read ALL images before starting analysis
- Look for repeated values (repetition = design system)
- Capture both explicit styles and implicit principles (density, hierarchy)
- Distinguish UI chrome from content areas
- Dark mode is first-class, not afterthought
- Document hover and focus states
- Single image: use best-practice defaults for missing values, mark `[inferred]`
- Multiple images: primary screen = anchor, secondary = fill gaps
- Final prompt quality directly impacts implementation fidelity

---

## Referencias

- `references/design-system-example.md` — Example of well-documented design system output
