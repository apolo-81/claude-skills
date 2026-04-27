# WCAG 2.1 Contrast Rules

## How to Use

Load this file in **Step 5: Accessibility Validation** of the market-visual-identity skill.
Use it to validate every proposed color combination before finalizing the palette.
Cross-reference the pre-calculated table for common brand colors, then apply the formula
for any custom color not listed. Fix any failing combination using the guide in this file.

---

## WCAG 2.1 Contrast Thresholds

| Level | Normal text | Large text (≥18pt or ≥14pt bold) | UI components |
|-------|-------------|----------------------------------|---------------|
| AA    | 4.5:1       | 3:1                              | 3:1           |
| AAA   | 7:1         | 4.5:1                            | N/A           |

**Notes:**
- Logos and logotypes are exempt from contrast requirements.
- Placeholder text must meet the same ratio as regular text (4.5:1 AA).
- Focus indicators require a minimum 3:1 contrast against adjacent colors.

---

## Relative Luminance Formula (WCAG 2.1)

### Step 1 — Normalize RGB channels

Divide each channel (R, G, B) by 255 to get a value in [0, 1].

### Step 2 — Linearize each channel

```
if channel ≤ 0.04045:  linear = channel / 12.92
if channel >  0.04045:  linear = ((channel + 0.055) / 1.055) ^ 2.4
```

### Step 3 — Calculate relative luminance

```
L = 0.2126 × R_linear + 0.7152 × G_linear + 0.0722 × B_linear
```

### Step 4 — Calculate contrast ratio

```
Ratio = (L1 + 0.05) / (L2 + 0.05)   where L1 ≥ L2
```

### Worked Example: #1A56DB vs #FFFFFF

| Step | #1A56DB | #FFFFFF |
|------|---------|---------|
| Normalize | R=0.102, G=0.337, B=0.859 | R=1, G=1, B=1 |
| Linearize | R=0.010, G=0.095, B=0.714 | R=1, G=1, B=1 |
| Luminance | L = 0.2126×0.010 + 0.7152×0.095 + 0.0722×0.714 = **0.144** | L = **1.000** |
| Ratio | (1.000 + 0.05) / (0.144 + 0.05) = 1.050 / 0.194 = **≈ 5.4:1** |

Result: ≈ 5.4:1 — passes AA (4.5:1) for normal text. Commonly cited as ≈ 6.6:1 depending on precise channel values — always calculate with exact hex values.

---

## Pre-calculated: Common Brand Colors vs White/Black

| Color | Hex | vs White (#FFF) | vs Black (#000) |
|-------|-----|-----------------|-----------------|
| Azul marino | #003566 | 13.2:1 ✅ AAA | 1.6:1 ❌ |
| Azul medio | #1A56DB | 4.7:1 ✅ AA | 4.4:1 ✅ AA |
| Índigo | #4F46E5 | 5.5:1 ✅ AA | 3.8:1 ✅ AA large |
| Verde | #27AE60 | 3.8:1 ⚠ large only | 5.5:1 ✅ AA |
| Naranja | #E65100 | 3.1:1 ⚠ large only | 6.8:1 ✅ AA |
| Rojo | #D62828 | 4.8:1 ✅ AA | 4.3:1 ✅ AA large |
| Amarillo | #F4C430 | 1.7:1 ❌ | 12.4:1 ✅ AAA |
| Lavanda | #7B68EE | 3.1:1 ⚠ large only | 6.8:1 ✅ AA |
| Dorado | #C9A84C | 2.1:1 ❌ | 9.8:1 ✅ AAA |
| Rosa | #E91E8C | 3.4:1 ⚠ large only | 6.1:1 ✅ AA |

**Legend:** ✅ passes | ⚠ large text / UI components only | ❌ fails all levels

---

## How to Fix a Failing Combination

**Para texto blanco sobre un fondo:**
- Necesitas que la luminancia del fondo sea L < 0.18.
- Regla práctica: usar shade 600+ en tu escala de color.

**Para texto negro sobre un fondo:**
- Necesitas que la luminancia del fondo sea L > 0.30.
- Regla práctica: usar shade 200 o más claro.

### 3-step fix process

1. Identify whether the foreground is white or black.
2. Shift the background shade darker (for white text) or lighter (for black text) until the ratio passes.
3. Recalculate with the formula above to confirm. Never guess — compute the exact ratio.

---

## Mandatory Combinations to Validate

Claude must check all 5 of these in every palette before delivery:

| # | Combination | Minimum required |
|---|-------------|-----------------|
| 1 | Texto blanco (#FFF) sobre primario-500 | AA (4.5:1) |
| 2 | Texto negro (#000) sobre primario-500 | AA (4.5:1) |
| 3 | Primario-700 sobre neutro-50 | AAA ideal, AA mínimo |
| 4 | Acento-500 sobre blanco (#FFF) — CTAs | AA (4.5:1) |
| 5 | Acento-500 sobre primario-900 — dark mode | AA (4.5:1) |

If any combination fails, adjust the shade and document the corrected value before proceeding.

---

## Quick Heuristics

1. **Very dark colors** (L < 0.05, e.g. shades 800–950) → white text always passes AA.
2. **Very light colors** (L > 0.60, e.g. shades 50–200) → black text always passes AA.
3. **Mid-range colors** (0.05 ≤ L ≤ 0.60) → calculate both white and black; pick the one that passes AAA if possible.
4. **Golden rule:** use shade 700+ for any text color placed on a white or light background.
