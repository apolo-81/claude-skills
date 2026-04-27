# Example Output — Raíces Clínica Dental

Smoke-test reference for what a complete `market-visual-identity` run produces.

**Full outputs:** `/home/apolo/Documents/raices-clinica-dental/VISUAL-IDENTITY.md` + `tokens.json`

---

## Intake (Step 1)

| Field | Value |
|---|---|
| Brand | Raíces Clínica Dental |
| Sector | Odontología |
| Values | Confianza, modernidad, accesibilidad, familiaridad |
| Audience | Familias clase media 25–50 años CDMX |
| Tone | Semi-formal |

---

## Chosen Palette Option (Step 3)

**Option B — Moderna / Diferenciadora** — Verde Teal Clínico `#0D9E8C`

Justification: Odontología mexicana usa azul cielo casi universalmente. Teal verde-azul mantiene la psicología de salud/higiene del azul pero se diferencia. Componente verde aporta calidez subconsciente — ideal para familias con niños.

---

## Expanded Palette (Step 4) — Key shades

| Role | Token | HEX |
|---|---|---|
| Primary base | primary-500 | `#0D9E8C` |
| Primary accessible text | primary-700 | `#08675B` |
| Primary darkest | primary-900 | `#032823` |
| Secondary (analogous +30°) | secondary-500 | `#2B8AC4` |
| Accent (split-complement) | accent-500 | `#B45309` (ámbar profundo) |
| Accent dark-mode | accent-400 | `#D97706` |
| Neutral page bg | neutral-50 | `#F8FAFC` (cool — hue 174° is in 60–270°) |
| Neutral text | neutral-900 | `#0F172A` |

---

## WCAG Validation (Step 5)

| # | Combo | Ratio | Status | Action |
|---|---|---|---|---|
| 1 | White on primary-500 | 3.13:1 | ⚠ AA large only | Use primary-700 for normal text → 6.03:1 ✅ |
| 2 | Black on primary-500 | 6.70:1 | ✅ AA | Valid for labels |
| 3 | primary-900 on neutral-50 | 13.3:1 | ✅ AAA | Main body text |
| 4 | accent-500 on white | 4.57:1 | ✅ AA | CTAs approved |
| 5 | accent-500 on primary-900 | 3.04:1 | ⚠ AA large only | Dark mode: use accent-400 → 4.64:1 ✅ |

Critical documentation pattern: when a shade fails AA, name the specific alternative shade + new ratio. Do NOT change the 500 base.

---

## Typography (Step 6)

**Profile matched:** 3 — Cálida/Amigable (semi-formal + healthcare + families)

**Pair:** Raleway (heading 500/700) + Lato (body 400/700)

**Scale:** Major Third (1.25) — text-heavy profile fits medical content

| Token | px | rem |
|---|---|---|
| xs | 12 | 0.75 |
| sm | 13 | 0.813 |
| base | 16 | 1 |
| lg | 20 | 1.25 |
| xl | 25 | 1.563 |
| 2xl | 31 | 1.953 |
| 3xl | 39 | 2.441 |
| 4xl | 49 | 3.052 |

**Note:** The scale has 8 tokens (xs → 4xl). No `md` token.

---

## Critical Decisions — Patterns to Mimic

1. **Validation gate before expansion (Step 3→4):** User chose Option B before the 11-shade scale + tokens were generated. Don't produce 33 shades upfront — ask first.
2. **`text-on-brand` uses black, not white:** primary-500 at L≈0.285 fails white-text AA. Documented in `tokens.json` with a `_note` field.
3. **Specific alternative shade for WCAG failures:** Not "use a darker shade" — name it: "primary-700 → 6.03:1".
4. **Accent chosen as split-complementary (150°), not direct complement:** Teal's direct complement is red-magenta, which is forbidden in dental sector (blood/pain association). Ámbar at ~30° hue (150° from teal 174°) avoids this.
5. **Cool neutrals because hue 174° is in the 60–270° range** (per Step 4.4 rule).
6. **Output in Spanish** — matched user's input language.

---

## Token Architecture Decisions

- **22 semantic tokens minimum** — `text-on-brand` and `border-strong` are non-negotiable (critical for implementation).
- **Dark mode overrides 6 tokens**: bg-page, bg-surface, bg-surface-raised, text-primary, text-secondary, border-default, plus action-default/hover swap for accent.
- **CSS block uses CSS vars referencing primitives** for theme-switchability via `[data-theme="dark"]`.
