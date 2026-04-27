# Email Compatibility Guide

Referencia rápida de soporte CSS por cliente, workarounds para Outlook, dark mode patterns e inline style cheat sheet.

---

## Tabla de soporte CSS por cliente (2026)

| Propiedad CSS | Gmail Web | Gmail Android | Apple Mail | Outlook 2019 | Outlook 365 | Yahoo Mail |
|---|---|---|---|---|---|---|
| `display: block/inline` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `display: flex` | ✅ | ✅ | ✅ | ❌ | Parcial | ✅ |
| `display: grid` | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `padding` | ✅ | ✅ | ✅ | Parcial | ✅ | ✅ |
| `margin` | ✅ | ✅ | ✅ | Parcial | ✅ | ✅ |
| `border-radius` | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| `box-shadow` | ✅ | ✅ | ✅ | ❌ | Parcial | ✅ |
| `background-image` | ✅ | ✅ | ✅ | Parcial | ✅ | ✅ |
| `background-color` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `@media queries` | Parcial | ❌ | ✅ | ✅ | ✅ | ✅ |
| `@font-face` | ❌ | ❌ | ✅ | ❌ | Parcial | ❌ |
| Google Fonts `<link>` | ❌ | ❌ | ✅ | ❌ | ✅ | Parcial |
| `position: relative/absolute` | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `transform` | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `animation/@keyframes` | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `max-width` | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| `min-width` | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| `calc()` | ✅ | Parcial | ✅ | ❌ | ✅ | ✅ |
| CSS variables `--var` | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `overflow: hidden` | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| `white-space: nowrap` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `text-overflow: ellipsis` | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| `vertical-align` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `color-scheme` meta | ❌ | ❌ | ✅ | Parcial | ✅ | ❌ |
| `prefers-color-scheme` | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ |
| SVG inline | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `<video>` | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |

**Leyenda:** ✅ Soportado | ❌ No soportado | Parcial = soporte inconsistente

**Recurso:** https://www.caniemail.com — equivalente a Can I Use pero para email clients.

---

## Workarounds para Outlook

Outlook 2016-2021 usa el motor de renderizado de Microsoft Word. Reglas fundamentales:

### 1. Layouts: siempre tables

```html
<!-- INCORRECTO para Outlook -->
<div style="display: flex; gap: 16px;">
  <div style="flex: 1;">Columna 1</div>
  <div style="flex: 1;">Columna 2</div>
</div>

<!-- CORRECTO: table-based -->
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td width="50%" style="padding-right: 8px;">Columna 1</td>
    <td width="50%" style="padding-left: 8px;">Columna 2</td>
  </tr>
</table>
```

React Email hace esto automáticamente con `<Row>` y `<Column>`.

### 2. Botones con VML (para Outlook)

Outlook no renderiza correctamente botones CSS puros. La solución es VML (Vector Markup Language):

```html
<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:w="urn:schemas-microsoft-com:office:word"
  href="https://tuapp.com/action"
  style="height:44px;v-text-anchor:middle;width:200px;"
  arcsize="10%"
  strokecolor="#4f46e5"
  fillcolor="#4f46e5">
  <w:anchorlock/>
  <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">
    Texto del botón
  </center>
</v:roundrect>
<![endif]-->
<!--[if !mso]><!-->
<a href="https://tuapp.com/action" style="background-color:#4f46e5;border-radius:4px;color:#ffffff;display:inline-block;font-size:16px;font-weight:bold;padding:12px 24px;text-decoration:none;">
  Texto del botón
</a>
<!--<![endif]-->
```

El componente `<Button>` de React Email genera este VML automáticamente.

### 3. Imágenes en Outlook

```html
<!-- Siempre incluir width y height como atributos, no solo CSS -->
<img src="https://..." width="600" height="300" alt="descripción"
     style="display:block;width:100%;max-width:600px;" />
```

Sin `width`/`height` como atributos HTML, Outlook muestra imágenes a tamaño original.

### 4. Padding en celdas, no en divs

```html
<!-- Outlook ignora padding en <div> a veces -->
<div style="padding: 20px;">Contenido</div>

<!-- Usar padding en <td> -->
<td style="padding: 20px;">Contenido</td>
```

### 5. Fuentes en Outlook

```html
<!-- Outlook no descarga @font-face externas -->
<!-- Siempre incluir fallback system fonts -->
<td style="font-family: 'Tu Fuente Custom', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
```

### 6. Conditional comments para Outlook

```html
<!--[if gte mso 9]>
  <!-- Solo visible en Outlook 2007+ -->
<![endif]-->

<!--[if !mso]><!-->
  <!-- Visible en todos menos Outlook -->
<!--<![endif]-->

<!--[if mso 16]>
  <!-- Solo Outlook 2016 -->
<![endif]-->
```

### 7. Spacing: margin vs padding en Outlook

Outlook soporta `padding` en `<td>` pero puede ignorar `margin`. Usar siempre `padding` en celdas de tabla para spacing.

---

## Dark Mode Patterns

### Patrón 1: Meta tags (mínimo requerido)

```tsx
// En el <Head> del template
<Head>
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
</Head>
```

Sin estos meta tags, algunos clientes (Apple Mail) intentan invertir los colores automáticamente, causando que logos negros se vean en fondos negros.

### Patrón 2: CSS dark mode overrides

```tsx
<Head>
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <style>{`
    /* Apple Mail y Outlook 365 */
    @media (prefers-color-scheme: dark) {
      .email-body {
        background-color: #1f2937 !important;
      }
      .email-container {
        background-color: #111827 !important;
        border: 1px solid #374151 !important;
      }
      .email-text {
        color: #f9fafb !important;
      }
      .email-muted {
        color: #9ca3af !important;
      }
      .email-hr {
        border-color: #374151 !important;
      }
    }
  `}</style>
</Head>

<Body className="email-body" style={{ backgroundColor: '#f3f4f6' }}>
  <Container className="email-container" style={{ backgroundColor: '#ffffff' }}>
    <Text className="email-text" style={{ color: '#111827' }}>
      Texto que adapta al dark mode
    </Text>
  </Container>
</Body>
```

### Patrón 3: Imágenes dark-mode-aware

```tsx
// Técnica: dos imágenes, mostrar/ocultar con CSS
<Head>
  <style>{`
    .logo-light { display: block !important; }
    .logo-dark  { display: none !important; }
    @media (prefers-color-scheme: dark) {
      .logo-light { display: none !important; }
      .logo-dark  { display: block !important; }
    }
  `}</style>
</Head>

<Img className="logo-light" src="https://tuapp.com/logo-dark.png"  width={120} alt="Logo" />
<Img className="logo-dark"  src="https://tuapp.com/logo-light.png" width={120} alt="Logo" style={{ display: 'none' }} />
```

### Soporte de dark mode por cliente

| Cliente | Soporta dark mode CSS |
|---|---|
| Apple Mail (macOS/iOS) | ✅ Pleno soporte |
| Outlook 365 (Windows) | ✅ Con `color-scheme` |
| Outlook 2016-2021 | ❌ Fuerza sus propios colores |
| Gmail Web | ❌ (auto-adjust limitado) |
| Gmail App Android/iOS | Parcial (invierte automático) |
| Yahoo Mail | ❌ |
| Thunderbird | ✅ |

---

## Inline Style Cheat Sheet

Propiedades CSS seguras para usar como inline styles en todos los clientes:

### Tipografía

```css
/* Fuentes */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
font-size: 16px;           /* px siempre, no rem/em en emails */
font-weight: 400;          /* o 700 para bold */
font-style: italic;
line-height: 24px;         /* px o número sin unidad: 1.5 */
text-align: left;          /* left | center | right */
text-decoration: none;     /* para links */
color: #374151;
letter-spacing: 0.5px;
text-transform: uppercase;
```

### Box model

```css
/* Usar en <td>, no en <div> para Outlook */
padding: 16px;
padding-top: 16px;
padding-right: 24px;
padding-bottom: 16px;
padding-left: 24px;
margin: 0 auto;            /* centra containers */
width: 600px;
max-width: 600px;
```

### Colores y fondos

```css
background-color: #f9fafb;
color: #111827;
border: 1px solid #e5e7eb;
border-bottom: 1px solid #e5e7eb;
border-radius: 6px;        /* No funciona en Outlook */
```

### Display y layout (safe)

```css
display: block;
display: inline-block;
display: none;             /* Funciona en algunos clientes */
vertical-align: top;       /* Crítico en layouts multi-columna */
```

### Imágenes

```css
/* Siempre en <img> */
display: block;
width: 100%;
max-width: 600px;
border: 0;
outline: none;
```

### Propiedades NO SEGURAS (evitar)

```css
/* NUNCA usar en inline styles de emails */
display: flex;
display: grid;
position: absolute;
position: fixed;
transform: ...;
animation: ...;
var(--custom-property);
calc();                    /* limitado en Outlook */
gap: ...;
```

---

## Testing Checklist

Antes de enviar un email a producción:

- [ ] Testeado en Gmail Web (Chrome)
- [ ] Testeado en Gmail App (Android o iOS)
- [ ] Testeado en Apple Mail (macOS)
- [ ] Testeado en Outlook 2019 o 365 (si el cliente tiene usuarios corporativos)
- [ ] Preview text visible y correcto en bandeja de entrada
- [ ] Imágenes con alt text
- [ ] Links funcionan y redirigen correctamente
- [ ] Botón CTA principal funciona en móvil (mínimo 44x44px tap target)
- [ ] Unsubscribe link presente en marketing emails
- [ ] SPF y DKIM configurados en el dominio remitente
- [ ] Subject line sin palabras de spam

### Herramientas de testing

- **Mail Tester** (https://www.mail-tester.com) — Score de deliverability gratuito
- **Litmus** (litmus.com) — Screenshots en 90+ clientes de email (de pago)
- **Email on Acid** (emailonacid.com) — Alternativa a Litmus
- **Resend Dev Mode** — Envía a tu propio email para preview rápido
- **React Email preview** (`npx react-email dev`) — Preview local con hot reload
