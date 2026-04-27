# Output Templates — market-visual-identity

## How to use

Load this file in Step 8. Fill every [PLACEHOLDER] with values generated in Steps 3–7.
No placeholder must remain in the final output delivered to the user.

---

## Template 1: VISUAL-IDENTITY.md

```markdown
# Identidad Visual — [NOMBRE DE MARCA]

**Generado:** [FECHA]
**Sector:** [SECTOR]
**Tono:** [TONO PRINCIPAL], [TONO SECUNDARIO], [TONO TERCIARIO]

---

## 1. Dirección Visual

[LÍNEA 1: qué comunica esta identidad a primera vista]
[LÍNEA 2: emoción o estado mental que evoca en el usuario objetivo]
[LÍNEA 3: cómo se diferencia visualmente de competidores directos]

---

## 2. Paleta de Color

### Color Primario — [NOMBRE DEL COLOR]

| Propiedad | Valor |
|-----------|-------|
| HEX | [#XXXXXX] |
| RGB | [R, G, B] |
| HSL | [H°, S%, L%] |

**Justificación:**
[LÍNEA 1: por qué este color encaja con el sector y tono]
[LÍNEA 2: referencia a psicología del color aplicada]
[LÍNEA 3: connotación cultural relevante para el mercado objetivo]

| Token | HEX | Uso sugerido |
|-------|-----|--------------|
| primary-50 | [#XXXXXX] | Fondos muy claros, hover states sutiles |
| primary-100 | [#XXXXXX] | Fondos de secciones alternadas |
| primary-200 | [#XXXXXX] | Bordes y separadores |
| primary-300 | [#XXXXXX] | Íconos decorativos, ilustraciones |
| primary-400 | [#XXXXXX] | Estados disabled |
| primary-500 | [#XXXXXX] | Color base — botones principales, links |
| primary-600 | [#XXXXXX] | Hover de botones principales |
| primary-700 | [#XXXXXX] | Active/pressed states |
| primary-800 | [#XXXXXX] | Texto sobre fondos claros |
| primary-900 | [#XXXXXX] | Encabezados, texto de alta jerarquía |
| primary-950 | [#XXXXXX] | Dark mode — fondo de superficie |

---

### Color Secundario — [NOMBRE DEL COLOR]

| Propiedad | Valor |
|-----------|-------|
| HEX | [#XXXXXX] |
| RGB | [R, G, B] |
| HSL | [H°, S%, L%] |

**Justificación:**
[LÍNEA 1: relación armónica con el primario]
[LÍNEA 2: rol funcional en la UI]
[LÍNEA 3: contextos de uso principales]

| Token | HEX | Uso sugerido |
|-------|-----|--------------|
| secondary-100 | [#XXXXXX] | Fondos de cards secundarias |
| secondary-500 | [#XXXXXX] | Color base — elementos de soporte |
| secondary-900 | [#XXXXXX] | Texto secundario de alta jerarquía |

---

### Color Acento — [NOMBRE DEL COLOR]

| Propiedad | Valor |
|-----------|-------|
| HEX | [#XXXXXX] |
| RGB | [R, G, B] |
| HSL | [H°, S%, L%] |

**Justificación:**
[LÍNEA 1: por qué genera contraste sin romper la armonía]
[LÍNEA 2: efecto psicológico en el usuario]
[LÍNEA 3: elementos específicos donde se aplica]

| Token | HEX | Uso sugerido |
|-------|-----|--------------|
| accent-100 | [#XXXXXX] | Fondos de badges y chips |
| accent-500 | [#XXXXXX] | Color base — CTAs de alta prioridad |
| accent-900 | [#XXXXXX] | Texto sobre fondo de acento claro |

> **Regla:** máx 10% de la UI. Un CTA visible por pantalla. Nunca competir con el primario.

---

### Neutrales

| Token | HEX | Uso sugerido |
|-------|-----|--------------|
| neutral-0 | #FFFFFF | Fondo base, superficies de cards |
| neutral-50 | [#XXXXXX] | Fondo de página en light mode |
| neutral-100 | [#XXXXXX] | Fondo de inputs, hover de filas |
| neutral-200 | [#XXXXXX] | Bordes de inputs, dividers |
| neutral-300 | [#XXXXXX] | Placeholder text, íconos inactivos |
| neutral-400 | [#XXXXXX] | Texto deshabilitado |
| neutral-500 | [#XXXXXX] | Texto de apoyo, labels secundarios |
| neutral-600 | [#XXXXXX] | Texto de cuerpo |
| neutral-700 | [#XXXXXX] | Texto de cuerpo con énfasis |
| neutral-800 | [#XXXXXX] | Encabezados en light mode |
| neutral-900 | [#XXXXXX] | Encabezados máxima jerarquía |
| neutral-950 | [#XXXXXX] | Fondo dark mode |

---

## 3. Contraste WCAG

| Combinación | Ratio | Nivel | Uso recomendado |
|-------------|-------|-------|-----------------|
| [COLOR TEXTO 1] sobre [COLOR FONDO 1] | [X.X]:1 | [AA/AAA] | [Uso principal — ej. texto de cuerpo] |
| [COLOR TEXTO 2] sobre [COLOR FONDO 2] | [X.X]:1 | [AA/AAA] | [Uso secundario — ej. texto sobre primario] |
| [COLOR TEXTO 3] sobre [COLOR FONDO 3] | [X.X]:1 | [AA/AAA] | [Botones principales] |
| [COLOR TEXTO 4] sobre [COLOR FONDO 4] | [X.X]:1 | [AA/AAA] | [CTAs de acento] |
| [COLOR TEXTO 5] sobre [COLOR FONDO 5] | [X.X]:1 | [AA/AAA] | [Modo oscuro — texto principal] |

---

## 4. Tipografía

### Fuente de Encabezados

| Propiedad | Valor |
|-----------|-------|
| Familia | [NOMBRE FUENTE] |
| Pesos | [400, 600, 700] |
| Personalidad | [ADJETIVOS: ej. moderna, geométrica, confiable] |
| Google Fonts | [URL completa de Google Fonts] |
| HTML import | `<link href="[URL]" rel="stylesheet">` |

### Fuente de Cuerpo

| Propiedad | Valor |
|-----------|-------|
| Familia | [NOMBRE FUENTE] |
| Pesos | [400, 500] |
| Personalidad | [ADJETIVOS: ej. legible, neutra, amigable] |
| Google Fonts | [URL completa de Google Fonts] |
| HTML import | `<link href="[URL]" rel="stylesheet">` |

### Escala Modular ([RATIO] — [NOMBRE ESCALA])

| Token | px | rem | Uso |
|-------|----|-----|-----|
| text-xs | [X]px | [X]rem | Labels, captions, notas legales |
| text-sm | [X]px | [X]rem | Texto auxiliar, metadata |
| text-base | [X]px | [X]rem | Cuerpo principal |
| text-lg | [X]px | [X]rem | Cuerpo con énfasis, subtítulos pequeños |
| text-xl | [X]px | [X]rem | Subtítulos de sección |
| text-2xl | [X]px | [X]rem | Títulos de cards, encabezados h3 |
| text-3xl | [X]px | [X]rem | Encabezados h2 |
| text-4xl | [X]px | [X]rem | Hero h1, encabezados de página |

---

## 5. Regla 60-30-10

| Proporción | Token | HEX | Dónde aplicar |
|------------|-------|-----|---------------|
| 60% | neutral-50 / neutral-0 | [#XXXXXX] | Fondos, espacios en blanco, superficies |
| 30% | primary-[SHADE] | [#XXXXXX] | Encabezados, navegación, secciones clave |
| 10% | accent-500 | [#XXXXXX] | CTAs, badges, highlights, íconos de énfasis |

---

## 6. Do's & Don'ts

### Do's
1. Usar `primary-500` como color dominante en elementos interactivos de [NOMBRE].
2. Mantener `neutral-0` o `neutral-50` como fondo base para maximizar legibilidad.
3. Reservar `accent-500` únicamente para el CTA más importante de cada pantalla.
4. Combinar `[FUENTE HEADING]` para títulos y `[FUENTE BODY]` para cuerpo — nunca intercambiarlas.

### Don'ts
1. No usar más de 3 colores distintos en un mismo componente de [NOMBRE].
2. No colocar texto `neutral-500` o más claro sobre fondos blancos en párrafos largos.
3. No repetir el acento en más de un elemento visible simultáneamente en la UI de [NOMBRE].
4. No usar pesos menores a 400 en texto de cuerpo ni menores a 600 en encabezados primarios.

---

## 7. Próximos pasos

- **Voz de marca:** `/market brand` — tono, mensajes clave, guía de escritura para [NOMBRE].
- **Copy:** `/market copy` — headlines, taglines y copy de conversión alineados a esta identidad.
- **Implementación UI:** `/ui-designer` — componentes, layouts y sistema de diseño completo.
```

---

## Template 2: tokens.json

```json
{
  "$schema": "https://design-tokens.org/schema/2.0/tokens.json",
  "$metadata": {
    "brand": "[NOMBRE DE MARCA]",
    "sector": "[SECTOR]",
    "generated": "[FECHA ISO 8601]",
    "version": "1.0.0"
  },
  "primitives": {
    "color": {
      "primary": {
        "50":  { "$value": "[#XXXXXX]", "$type": "color" },
        "100": { "$value": "[#XXXXXX]", "$type": "color" },
        "200": { "$value": "[#XXXXXX]", "$type": "color" },
        "300": { "$value": "[#XXXXXX]", "$type": "color" },
        "400": { "$value": "[#XXXXXX]", "$type": "color" },
        "500": { "$value": "[#XXXXXX]", "$type": "color" },
        "600": { "$value": "[#XXXXXX]", "$type": "color" },
        "700": { "$value": "[#XXXXXX]", "$type": "color" },
        "800": { "$value": "[#XXXXXX]", "$type": "color" },
        "900": { "$value": "[#XXXXXX]", "$type": "color" },
        "950": { "$value": "[#XXXXXX]", "$type": "color" }
      },
      "secondary": {
        "100": { "$value": "[#XXXXXX]", "$type": "color" },
        "500": { "$value": "[#XXXXXX]", "$type": "color" },
        "900": { "$value": "[#XXXXXX]", "$type": "color" }
      },
      "accent": {
        "100": { "$value": "[#XXXXXX]", "$type": "color" },
        "500": { "$value": "[#XXXXXX]", "$type": "color" },
        "900": { "$value": "[#XXXXXX]", "$type": "color" }
      },
      "neutral": {
        "0":   { "$value": "#FFFFFF",   "$type": "color" },
        "50":  { "$value": "[#XXXXXX]", "$type": "color" },
        "100": { "$value": "[#XXXXXX]", "$type": "color" },
        "200": { "$value": "[#XXXXXX]", "$type": "color" },
        "300": { "$value": "[#XXXXXX]", "$type": "color" },
        "400": { "$value": "[#XXXXXX]", "$type": "color" },
        "500": { "$value": "[#XXXXXX]", "$type": "color" },
        "600": { "$value": "[#XXXXXX]", "$type": "color" },
        "700": { "$value": "[#XXXXXX]", "$type": "color" },
        "800": { "$value": "[#XXXXXX]", "$type": "color" },
        "900": { "$value": "[#XXXXXX]", "$type": "color" },
        "950": { "$value": "[#XXXXXX]", "$type": "color" }
      }
    }
  },
  "semantic": {
    "color": {
      "bg-base":          { "$value": "{primitives.color.neutral.0}",    "$type": "color", "$description": "Fondo base de página" },
      "bg-subtle":        { "$value": "{primitives.color.neutral.50}",   "$type": "color", "$description": "Fondo alternado de secciones" },
      "bg-surface":       { "$value": "{primitives.color.neutral.100}",  "$type": "color", "$description": "Fondo de cards e inputs" },
      "border-default":   { "$value": "{primitives.color.neutral.200}",  "$type": "color", "$description": "Bordes de inputs y dividers" },
      "border-strong":    { "$value": "{primitives.color.neutral.300}",  "$type": "color", "$description": "Bordes de énfasis" },
      "text-muted":       { "$value": "{primitives.color.neutral.400}",  "$type": "color", "$description": "Texto deshabilitado, placeholders" },
      "text-subtle":      { "$value": "{primitives.color.neutral.500}",  "$type": "color", "$description": "Texto de apoyo y labels" },
      "text-body":        { "$value": "{primitives.color.neutral.700}",  "$type": "color", "$description": "Texto de cuerpo principal" },
      "text-heading":     { "$value": "{primitives.color.neutral.900}",  "$type": "color", "$description": "Encabezados en light mode" },
      "brand-default":    { "$value": "{primitives.color.primary.500}",  "$type": "color", "$description": "Color de marca base" },
      "brand-hover":      { "$value": "{primitives.color.primary.600}",  "$type": "color", "$description": "Hover de elementos de marca" },
      "brand-active":     { "$value": "{primitives.color.primary.700}",  "$type": "color", "$description": "Active/pressed de elementos de marca" },
      "brand-subtle":     { "$value": "{primitives.color.primary.50}",   "$type": "color", "$description": "Fondo de destacados sutiles" },
      "secondary-default":{ "$value": "{primitives.color.secondary.500}","$type": "color", "$description": "Color secundario base" },
      "secondary-subtle": { "$value": "{primitives.color.secondary.100}","$type": "color", "$description": "Fondo de elementos secundarios" },
      "cta-default":      { "$value": "{primitives.color.accent.500}",   "$type": "color", "$description": "CTA de mayor prioridad" },
      "cta-subtle":       { "$value": "{primitives.color.accent.100}",   "$type": "color", "$description": "Fondo de badges de acento" },
      "status-success":   { "$value": "#16A34A",                         "$type": "color", "$description": "Estados de éxito" },
      "status-warning":   { "$value": "#D97706",                         "$type": "color", "$description": "Estados de advertencia" },
      "status-error":     { "$value": "#DC2626",                         "$type": "color", "$description": "Estados de error" }
    },
    "typography": {
      "font-heading": { "$value": "[NOMBRE FUENTE HEADING]", "$type": "fontFamily" },
      "font-body":    { "$value": "[NOMBRE FUENTE BODY]",    "$type": "fontFamily" },
      "scale-base":   { "$value": "16",                     "$type": "number",     "$description": "Base en px" },
      "scale-ratio":  { "$value": "[RATIO]",                "$type": "number",     "$description": "Minor Third=1.2 / Major Third=1.25 / Perfect Fourth=1.333" },
      "weight-regular":   { "$value": "400", "$type": "fontWeight" },
      "weight-medium":    { "$value": "500", "$type": "fontWeight" },
      "weight-semibold":  { "$value": "600", "$type": "fontWeight" },
      "weight-bold":      { "$value": "700", "$type": "fontWeight" },
      "size-xs":   { "$value": "[X]px",  "$type": "dimension" },
      "size-sm":   { "$value": "[X]px",  "$type": "dimension" },
      "size-base": { "$value": "16px",   "$type": "dimension" },
      "size-lg":   { "$value": "[X]px",  "$type": "dimension" },
      "size-xl":   { "$value": "[X]px",  "$type": "dimension" },
      "size-2xl":  { "$value": "[X]px",  "$type": "dimension" },
      "size-3xl":  { "$value": "[X]px",  "$type": "dimension" },
      "size-4xl":  { "$value": "[X]px",  "$type": "dimension" }
    }
  },
  "dark": {
    "bg-base":      { "$value": "{primitives.color.neutral.950}", "$type": "color" },
    "bg-subtle":    { "$value": "{primitives.color.primary.950}", "$type": "color" },
    "bg-surface":   { "$value": "{primitives.color.neutral.900}", "$type": "color" },
    "text-body":    { "$value": "{primitives.color.neutral.200}", "$type": "color" },
    "text-heading": { "$value": "{primitives.color.neutral.50}",  "$type": "color" },
    "brand-default":{ "$value": "{primitives.color.primary.400}", "$type": "color" }
  },
  "css": {
    "$description": "Pegar en globals.css. Agregar class='dark' al <html> para dark mode.",
    "light": ":root { --color-bg-base: [#XXXXXX]; --color-bg-subtle: [#XXXXXX]; --color-bg-surface: [#XXXXXX]; --color-border-default: [#XXXXXX]; --color-border-strong: [#XXXXXX]; --color-text-muted: [#XXXXXX]; --color-text-subtle: [#XXXXXX]; --color-text-body: [#XXXXXX]; --color-text-heading: [#XXXXXX]; --color-brand: [#XXXXXX]; --color-brand-hover: [#XXXXXX]; --color-brand-active: [#XXXXXX]; --color-brand-subtle: [#XXXXXX]; --color-secondary: [#XXXXXX]; --color-secondary-subtle: [#XXXXXX]; --color-cta: [#XXXXXX]; --color-cta-subtle: [#XXXXXX]; --color-success: #16A34A; --color-warning: #D97706; --color-error: #DC2626; --font-heading: '[NOMBRE FUENTE HEADING]', sans-serif; --font-body: '[NOMBRE FUENTE BODY]', sans-serif; }",
    "dark": ".dark { --color-bg-base: [#XXXXXX]; --color-bg-subtle: [#XXXXXX]; --color-bg-surface: [#XXXXXX]; --color-text-body: [#XXXXXX]; --color-text-heading: [#XXXXXX]; --color-brand: [#XXXXXX]; }"
  }
}
```
