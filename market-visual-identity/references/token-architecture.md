# Token Architecture Reference

## How to use

Read this file during Step 7 (Design Token Generation) of market-visual-identity. Use the 3-level architecture below as the structural template for every token output. Fill in actual brand values extracted in earlier steps — never use placeholder colors here. Always emit all 20 required tokens from the checklist before adding optional ones.

---

## 3-Level Architecture (W3C Design Tokens Format)

### Level 1 — Primitives

Raw color values. No semantic meaning. Full scales for primary and neutral; key shades only for secondary and accent.

```json
{
  "color": {
    "primary": {
      "50":  { "value": "#EFF6FF", "type": "color" },
      "100": { "value": "#DBEAFE", "type": "color" },
      "200": { "value": "#BFDBFE", "type": "color" },
      "300": { "value": "#93C5FD", "type": "color" },
      "400": { "value": "#60A5FA", "type": "color" },
      "500": { "value": "#3B82F6", "type": "color", "$description": "Base brand color" },
      "600": { "value": "#2563EB", "type": "color" },
      "700": { "value": "#1D4ED8", "type": "color" },
      "800": { "value": "#1E40AF", "type": "color" },
      "900": { "value": "#1E3A8A", "type": "color" },
      "950": { "value": "#172554", "type": "color" }
    },
    "secondary": {
      "100": { "value": "#F3F4F6", "type": "color" },
      "300": { "value": "#D1D5DB", "type": "color" },
      "500": { "value": "#6B7280", "type": "color", "$description": "Base brand color" },
      "700": { "value": "#374151", "type": "color" },
      "900": { "value": "#111827", "type": "color" }
    },
    "accent": {
      "100": { "value": "#FEF3C7", "type": "color" },
      "300": { "value": "#FCD34D", "type": "color" },
      "500": { "value": "#F59E0B", "type": "color", "$description": "Base brand color" },
      "700": { "value": "#B45309", "type": "color" },
      "900": { "value": "#78350F", "type": "color" }
    },
    "neutral": {
      "50":  { "value": "#FAFAFA", "type": "color" },
      "100": { "value": "#F4F4F5", "type": "color" },
      "200": { "value": "#E4E4E7", "type": "color" },
      "300": { "value": "#D4D4D8", "type": "color" },
      "400": { "value": "#A1A1AA", "type": "color" },
      "500": { "value": "#71717A", "type": "color" },
      "600": { "value": "#52525B", "type": "color" },
      "700": { "value": "#3F3F46", "type": "color" },
      "800": { "value": "#27272A", "type": "color" },
      "900": { "value": "#18181B", "type": "color" },
      "950": { "value": "#09090B", "type": "color" }
    }
  }
}
```

---

### Level 2 — Semantic Tokens

Reference primitives by alias. These are the tokens consumed by components.

```json
{
  "color": {
    "brand-primary":       { "value": "{color.primary.500}", "type": "color" },
    "brand-primary-hover": { "value": "{color.primary.600}", "type": "color" },
    "brand-secondary":     { "value": "{color.secondary.500}", "type": "color" },
    "brand-accent":        { "value": "{color.accent.500}", "type": "color" },

    "bg-page":             { "value": "{color.neutral.50}", "type": "color" },
    "bg-surface":          { "value": "#FFFFFF", "type": "color" },
    "bg-surface-raised":   { "value": "{color.neutral.100}", "type": "color" },
    "bg-surface-overlay":  { "value": "{color.neutral.200}", "type": "color" },

    "text-primary":        { "value": "{color.neutral.900}", "type": "color" },
    "text-secondary":      { "value": "{color.neutral.600}", "type": "color" },
    "text-disabled":       { "value": "{color.neutral.400}", "type": "color" },
    "text-inverse":        { "value": "#FFFFFF", "type": "color" },
    "text-on-brand":       { "value": "#FFFFFF", "type": "color" },

    "border-default":      { "value": "{color.neutral.200}", "type": "color" },
    "border-strong":       { "value": "{color.neutral.400}", "type": "color" },
    "border-brand":        { "value": "{color.primary.500}", "type": "color" },

    "action-primary":      { "value": "{color.primary.500}", "type": "color" },
    "action-primary-hover":{ "value": "{color.primary.600}", "type": "color" },

    "status-success":      { "value": "#16A34A", "type": "color" },
    "status-warning":      { "value": "#D97706", "type": "color" },
    "status-error":        { "value": "#DC2626", "type": "color" },
    "status-info":         { "value": "{color.primary.500}", "type": "color" }
  },
  "typography": {
    "font-heading":    { "value": "Inter, sans-serif", "type": "fontFamily" },
    "font-body":       { "value": "Inter, sans-serif", "type": "fontFamily" },
    "font-mono":       { "value": "JetBrains Mono, monospace", "type": "fontFamily" },
    "scale-base":      { "value": "16px", "type": "dimension" },
    "scale-ratio":     { "value": "1.25", "type": "number" },
    "weight-regular":  { "value": "400", "type": "fontWeight" },
    "weight-medium":   { "value": "500", "type": "fontWeight" },
    "weight-semibold": { "value": "600", "type": "fontWeight" },
    "weight-bold":     { "value": "700", "type": "fontWeight" }
  }
}
```

---

### Level 3 — Dark Mode Overrides

Only tokens whose value changes in dark mode. Do not repeat tokens that stay the same.

```json
{
  "color": {
    "bg-page":           { "value": "{color.neutral.950}", "type": "color" },
    "bg-surface":        { "value": "{color.neutral.900}", "type": "color" },
    "bg-surface-raised": { "value": "{color.neutral.800}", "type": "color" },
    "text-primary":      { "value": "{color.neutral.50}", "type": "color" },
    "text-secondary":    { "value": "{color.neutral.400}", "type": "color" },
    "border-default":    { "value": "{color.neutral.700}", "type": "color" }
  }
}
```

---

## Naming Convention

Format: `category-property-variant-state`

| Category   | Example tokens                                   | Notes                            |
|------------|--------------------------------------------------|----------------------------------|
| color      | `color.bg-page`, `color.text-primary`            | Never use color name in semantic |
| typography | `typography.font-heading`, `typography.scale-base` | Scale in px, ratio as number   |
| spacing    | `spacing.xs`, `spacing.md`, `spacing.2xl`        | T-shirt sizes or multipliers     |
| shadow     | `shadow.sm`, `shadow.card`, `shadow.overlay`     | Named by elevation/purpose       |
| radius     | `radius.sm`, `radius.card`, `radius.full`        | Named by shape/purpose           |

Rules:
- Always kebab-case. Never camelCase or snake_case.
- Never put a color name (blue, red, green) in a semantic token name.
- States are always a suffix: `-hover`, `-active`, `-disabled`, `-focus`.
- Variants come before state: `action-primary-hover`, not `action-hover-primary`.

---

## Minimal Required Token Set (checklist)

Before delivering Step 7 output, verify all 22 tokens are present:

**Brand (4)**
- [ ] `color.brand-primary`
- [ ] `color.brand-primary-hover`
- [ ] `color.brand-secondary`
- [ ] `color.brand-accent`

**Backgrounds (4)**
- [ ] `color.bg-page`
- [ ] `color.bg-surface`
- [ ] `color.bg-surface-raised`
- [ ] `color.bg-surface-overlay`

**Text (5)**
- [ ] `color.text-primary`
- [ ] `color.text-secondary`
- [ ] `color.text-disabled`
- [ ] `color.text-inverse`
- [ ] `color.text-on-brand`

**Borders (3)**
- [ ] `color.border-default`
- [ ] `color.border-strong`
- [ ] `color.border-brand`

**Actions (2)**
- [ ] `color.action-primary`
- [ ] `color.action-primary-hover`

**Status (4)**
- [ ] `color.status-success`
- [ ] `color.status-warning`
- [ ] `color.status-error`
- [ ] `color.status-info`

---

## Mapping to Tailwind CSS

### tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        brand: {
          primary:       'var(--color-brand-primary)',
          'primary-hover': 'var(--color-brand-primary-hover)',
          secondary:     'var(--color-brand-secondary)',
          accent:        'var(--color-brand-accent)',
        },
        bg: {
          page:           'var(--color-bg-page)',
          surface:        'var(--color-bg-surface)',
          'surface-raised':  'var(--color-bg-surface-raised)',
          'surface-overlay': 'var(--color-bg-surface-overlay)',
        },
        text: {
          primary:   'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          disabled:  'var(--color-text-disabled)',
          inverse:   'var(--color-text-inverse)',
          'on-brand': 'var(--color-text-on-brand)',
        },
        border: {
          default: 'var(--color-border-default)',
          strong:  'var(--color-border-strong)',
          brand:   'var(--color-border-brand)',
        },
        action: {
          primary:       'var(--color-action-primary)',
          'primary-hover': 'var(--color-action-primary-hover)',
        },
        status: {
          success: 'var(--color-status-success)',
          warning: 'var(--color-status-warning)',
          error:   'var(--color-status-error)',
          info:    'var(--color-status-info)',
        },
      },
      fontFamily: {
        heading: 'var(--typography-font-heading)',
        body:    'var(--typography-font-body)',
        mono:    'var(--typography-font-mono)',
      },
    },
  },
  plugins: [],
}
```

### globals.css

```css
:root {
  /* Brand */
  --color-brand-primary:        #3B82F6;
  --color-brand-primary-hover:  #2563EB;
  --color-brand-secondary:      #6B7280;
  --color-brand-accent:         #F59E0B;

  /* Backgrounds */
  --color-bg-page:              #FAFAFA;
  --color-bg-surface:           #FFFFFF;
  --color-bg-surface-raised:    #F4F4F5;
  --color-bg-surface-overlay:   #E4E4E7;

  /* Text */
  --color-text-primary:         #18181B;
  --color-text-secondary:       #52525B;
  --color-text-disabled:        #A1A1AA;
  --color-text-inverse:         #FFFFFF;
  --color-text-on-brand:        #FFFFFF;

  /* Borders */
  --color-border-default:       #E4E4E7;
  --color-border-strong:        #A1A1AA;
  --color-border-brand:         #3B82F6;

  /* Actions */
  --color-action-primary:       #3B82F6;
  --color-action-primary-hover: #2563EB;

  /* Status */
  --color-status-success:       #16A34A;
  --color-status-warning:       #D97706;
  --color-status-error:         #DC2626;
  --color-status-info:          #3B82F6;

  /* Typography */
  --typography-font-heading:    Inter, sans-serif;
  --typography-font-body:       Inter, sans-serif;
  --typography-font-mono:       'JetBrains Mono', monospace;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-page:           #09090B;
    --color-bg-surface:        #18181B;
    --color-bg-surface-raised: #27272A;
    --color-text-primary:      #FAFAFA;
    --color-text-secondary:    #A1A1AA;
    --color-border-default:    #3F3F46;
  }
}
```
