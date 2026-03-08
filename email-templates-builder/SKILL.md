---
name: email-templates-builder
description: >
  Use when building HTML email templates, coding responsive emails, implementing
  email designs, or sending transactional/marketing emails from a web app. Trigger
  for: "email template", "HTML email", "responsive email", "transactional email",
  "email de bienvenida en código", "implementar email", "React Email", "MJML",
  "Resend", "Nodemailer", "email de confirmación", "receipt email", "password reset
  email", "invoice email", "notification email", coding email sequences from copy.
---

# Email Templates Builder

Stack principal: **React Email + Resend** dentro de proyectos Next.js App Router.
Referencias con código completo en `references/templates.tsx` y `references/compatibility-guide.md`.

---

## 1. El problema del email HTML

Email HTML no es web HTML. Tres razones críticas:

**Outlook usa Word Rendering Engine** — No entiende Flexbox, Grid, ni CSS moderno. Todo debe ser table-based para Outlook 2016-2021. Outlook 365 mejora pero sigue con limitaciones.

**Gmail elimina `<head>` y `<style>`** — Cualquier CSS en `<style>` o `<link>` es eliminado. Solo inline styles funcionan de forma garantizada. Media queries también son removidas en Gmail app Android.

**Dark mode invierte colores** — Apple Mail y algunos clientes invierten automáticamente imágenes y colores si no se especifica `color-scheme`. Un logo negro se vuelve blanco (o invisible).

### Stack recomendado 2026

| Stack | Cuándo usar | Pros | Contras |
|-------|-------------|------|---------|
| **React Email + Resend** | Apps Next.js, emails transaccionales | DX excelente, preview en vivo, TypeScript | Requiere Node.js para render |
| **MJML** | Newsletters, marketing masivo, agencias | Altísima compatibilidad, probado | XML verbose, menos flexible |
| **HTML puro (tables)** | Clientes corporativos Outlook-heavy | Máxima compatibilidad | Tedioso de mantener, sin DX |

**Regla:** Si el proyecto es Next.js → React Email + Resend siempre.

---

## 2. Setup React Email + Resend

### Instalación

```bash
npm install react-email @react-email/components resend
```

### Estructura de carpetas

```
project/
├── emails/
│   ├── welcome.tsx
│   ├── verify-account.tsx
│   ├── password-reset.tsx
│   ├── order-confirmation.tsx
│   ├── invoice.tsx
│   ├── notification.tsx
│   └── newsletter.tsx
├── app/
│   └── api/
│       └── send-email/
│           └── route.ts
└── lib/
    └── resend.ts
```

### Preview en desarrollo

```bash
npx react-email dev
# Abre en http://localhost:3000 con hot reload
```

### Cliente Resend singleton

```typescript
// lib/resend.ts
import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);
```

### API Route para envío

```typescript
// app/api/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { resend } from '@/lib/resend';
import { WelcomeEmail } from '@/emails/welcome';

export async function POST(req: NextRequest) {
  const { to, name } = await req.json();

  const { data, error } = await resend.emails.send({
    from: 'Tu App <hola@tudominio.com>',
    to,
    subject: 'Bienvenido a Tu App',
    react: WelcomeEmail({ name }),
  });

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({ data });
}
```

### Variables de entorno

```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
```

**Dominio verificado en Resend:** Settings → Domains → Add Domain → añadir registros DNS (SPF, DKIM). Sin dominio verificado solo puedes enviar desde `onboarding@resend.dev` (solo para testing).

---

## 3. Componentes React Email

### Estructura base de cualquier email

```tsx
import {
  Html, Head, Body, Container, Section, Row, Column,
  Text, Heading, Button, Link, Img, Hr, Preview, Tailwind
} from '@react-email/components';

export default function BaseEmail() {
  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>Texto del preheader (50-100 chars)</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto py-8 max-w-[600px]">
            {/* contenido */}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
```

### Componentes críticos y su uso correcto

**`<Preview>`** — El preheader text que aparece en la bandeja de entrada antes de abrir el email. Siempre incluirlo, máximo 100 caracteres. No se muestra en el cuerpo del email.

**`<Container>`** — Wrapper central con max-width. Siempre usar `max-w-[600px]` o `maxWidth: '600px'`.

**`<Button>`** — Genera código cross-client compatible con VML para Outlook. Nunca uses `<a>` directo para CTAs principales.

```tsx
<Button
  href="https://tuapp.com/action"
  className="bg-blue-600 text-white px-6 py-3 rounded"
>
  Confirmar email
</Button>
```

**`<Img>`** — Siempre URL absoluta (hosted), nunca base64. Incluir `alt` siempre.

```tsx
<Img
  src="https://tuapp.com/logo.png"
  width={150}
  height={40}
  alt="Logo Tu App"
/>
```

**`<Row>` y `<Column>`** — Para layouts multi-columna. Genera tables internamente.

### CSS en React Email

```tsx
// CON Tailwind wrapper (recomendado para proyectos que ya usan Tailwind)
<Tailwind config={{ theme: { extend: { colors: { brand: '#6366f1' } } } }}>
  <Text className="text-gray-700 text-base leading-6">Texto</Text>
</Tailwind>

// CON inline styles (máxima compatibilidad)
<Text style={{ color: '#374151', fontSize: '16px', lineHeight: '24px' }}>
  Texto
</Text>
```

**NO usar en emails:** CSS Grid, Flexbox, `position: absolute/fixed`, `transform`, `animation`, `@keyframes`, `calc()`, variables CSS.

---

## 4. Templates

Ver código completo en `references/templates.tsx`.

Resumen de los 7 templates disponibles:

1. **WelcomeEmail** — Bienvenida post-registro con CTA a onboarding
2. **VerifyAccountEmail** — Verificación de cuenta con link de confirmación (expira en 24h)
3. **PasswordResetEmail** — Reset de contraseña con link temporal (expira en 1h)
4. **OrderConfirmationEmail** — Confirmación de pedido con líneas de items y total
5. **InvoiceEmail** — Factura con tabla de conceptos, subtotal, IVA y total
6. **NotificationEmail** — Notificación genérica configurable (tipo, título, mensaje, CTA opcional)
7. **NewsletterEmail** — Newsletter base con header, artículos y footer con unsubscribe

---

## 5. Compatibilidad Cross-Client

Ver tabla completa en `references/compatibility-guide.md`.

### Reglas de oro

- **Inline styles siempre** para propiedades críticas (color, font-size, margin, padding)
- **Max width 600px** para el container principal
- **Imágenes con width/height explícitos** siempre
- **Botones con `<Button>` de React Email**, no `<a>` puro
- **Fuentes del sistema o Google Fonts con fallback:** `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- **Testar en:** Gmail (web + app), Apple Mail, Outlook 2019/365

---

## 6. Dark Mode en Emails

```tsx
// En el <Head> del email
<Head>
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <style>{`
    @media (prefers-color-scheme: dark) {
      .email-body { background-color: #1f2937 !important; }
      .email-container { background-color: #111827 !important; }
      .email-text { color: #f9fafb !important; }
    }
  `}</style>
</Head>
```

**Limitación:** Gmail ignora `@media (prefers-color-scheme)`. Apple Mail y Outlook 365 sí lo soportan.

**Estrategia práctica:** Diseña con colores que se vean bien en ambos modos, o acepta que en Gmail no habrá dark mode. Usa `!important` en las overrides de dark mode.

---

## 7. Deliverability

### SPF, DKIM, DMARC

- **SPF:** Registro TXT en DNS que autoriza qué servidores pueden enviar desde tu dominio. Resend lo configura automáticamente al verificar dominio.
- **DKIM:** Firma criptográfica en cada email. Resend genera las claves y las añades como CNAME en tu DNS.
- **DMARC:** Política que indica qué hacer si SPF/DKIM fallan. Empieza con `p=none` para monitorear, luego `p=quarantine`, luego `p=reject`.

```dns
# DMARC mínimo para empezar
_dmarc.tudominio.com TXT "v=DMARC1; p=none; rua=mailto:dmarc@tudominio.com"
```

### Evitar spam

- Ratio texto/imagen: al menos 60% texto, máximo 40% imágenes
- Evitar trigger words: "GRATIS", "GRÁTIS", "URGENTE", "100%", "OFERTA LIMITADA"
- Unsubscribe link obligatorio en marketing emails (requerido por CAN-SPAM, GDPR)
- List-Unsubscribe header: Resend lo añade automáticamente si incluyes `headers`

### Warm-up de dominio

Si el dominio es nuevo: empieza con 50 emails/día → duplica cada semana hasta alcanzar volumen deseado. No envíes 10,000 emails el primer día desde un dominio nuevo.

---

## 8. Integración con n8n

### Pattern 1: n8n llama a tu API Route

```
n8n Trigger → HTTP Request Node
  Method: POST
  URL: https://tuapp.com/api/send-email
  Headers: { Authorization: Bearer ${SECRET} }
  Body: { to: "{{$json.email}}", name: "{{$json.name}}" }
```

Proteger la API route con un secret compartido:

```typescript
// app/api/send-email/route.ts
const authHeader = req.headers.get('authorization');
if (authHeader !== `Bearer ${process.env.EMAIL_API_SECRET}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Pattern 2: n8n con node HTTP Request a Resend directamente

```
n8n HTTP Request Node:
  Method: POST
  URL: https://api.resend.com/emails
  Headers: { Authorization: Bearer re_xxxx, Content-Type: application/json }
  Body: {
    "from": "hola@tudominio.com",
    "to": ["{{$json.email}}"],
    "subject": "Tu asunto",
    "html": "<p>Contenido HTML</p>"
  }
```

Limitación: no puedes usar templates React Email desde n8n directamente (sin render). Usa Pattern 1 si necesitas los templates tipados.

### Pattern 3: Resend Broadcasts para newsletters desde n8n

Si usas Resend Audiences, puedes triggear un broadcast via API desde n8n sin gestionar la lista manualmente.
