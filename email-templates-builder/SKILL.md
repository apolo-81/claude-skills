---
name: email-templates-builder
description: >
  Templates HTML de email transaccional y envío desde web app. Stack: React Email + Resend.
  Para secuencias de email marketing usar `market-emails`.
  Usar cuando: "email transaccional", "React Email", "Resend", "template de email",
  "email de bienvenida HTML", "email de reset", "factura por email", "MJML", "Nodemailer".
---

# Email Templates Builder

Stack principal: **React Email + Resend** dentro de Next.js App Router.

**Regla:** Si el proyecto es Next.js, usar React Email + Resend siempre.

| Stack | Cuando |
|-------|--------|
| **React Email + Resend** | Apps Next.js, emails transaccionales |
| **MJML** | Newsletters, marketing masivo, agencias |
| **HTML puro (tables)** | Clientes corporativos Outlook-heavy |

---

## 1. Setup

```bash
npm install react-email @react-email/components resend
npx react-email dev  # Preview con hot reload en localhost:3000
```

Estructura:
```
emails/          # welcome.tsx, verify-account.tsx, password-reset.tsx, etc.
app/api/send-email/route.ts
lib/resend.ts    # singleton: new Resend(process.env.RESEND_API_KEY)
```

Ver `references/templates.tsx` para los 7 templates completos.

### API Route y cliente

```typescript
// lib/resend.ts
import { Resend } from 'resend';
export const resend = new Resend(process.env.RESEND_API_KEY);

// app/api/send-email/route.ts
const { data, error } = await resend.emails.send({
  from: 'Tu App <hola@tudominio.com>',
  to, subject: 'Bienvenido',
  react: WelcomeEmail({ name }),
});
```

**Dominio verificado en Resend:** Settings > Domains > Add Domain > registros DNS (SPF, DKIM).

---

## 2. Componentes React Email

### Estructura base

```tsx
<Html lang="es" dir="ltr">
  <Head />
  <Preview>Preheader 50-100 chars</Preview>
  <Tailwind>
    <Body className="bg-gray-100 font-sans">
      <Container className="mx-auto py-8 max-w-[600px]">
        {/* contenido */}
      </Container>
    </Body>
  </Tailwind>
</Html>
```

### Reglas criticas

| Componente | Regla |
|------------|-------|
| `<Preview>` | Siempre incluir, max 100 chars |
| `<Container>` | Siempre `max-w-[600px]` |
| `<Button>` | Usar para CTAs (genera VML para Outlook). Nunca `<a>` directo |
| `<Img>` | URL absoluta (hosted), nunca base64. Siempre `alt` |
| `<Row>/<Column>` | Para multi-columna (genera tables) |

### CSS

- Con `<Tailwind>` wrapper (recomendado) o inline styles
- **NO usar:** CSS Grid, Flexbox, position absolute/fixed, transform, animation, calc(), variables CSS

---

## 3. Templates disponibles

Ver codigo completo en `references/templates.tsx`:
1. **WelcomeEmail** — Bienvenida + CTA onboarding
2. **VerifyAccountEmail** — Link confirmacion (24h)
3. **PasswordResetEmail** — Link temporal (1h)
4. **OrderConfirmationEmail** — Items + total
5. **InvoiceEmail** — Tabla conceptos + IVA
6. **NotificationEmail** — Generica configurable
7. **NewsletterEmail** — Header + articulos + unsubscribe

---

## 4. Compatibilidad

Ver `references/compatibility-guide.md` para tabla completa.

Reglas: inline styles para propiedades criticas, max 600px, imagenes con width/height, `<Button>` de React Email, fuentes sistema con fallback. Testar en Gmail (web+app), Apple Mail, Outlook 2019/365.

---

## 5. Dark Mode

```tsx
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

Gmail ignora `prefers-color-scheme`. Apple Mail y Outlook 365 si lo soportan.

---

## 6. Deliverability

- **SPF/DKIM:** Resend configura al verificar dominio
- **DMARC:** Empezar con `p=none`, luego `p=quarantine`, luego `p=reject`
- Ratio texto/imagen: minimo 60% texto
- Evitar: "GRATIS", "URGENTE", "100%", "OFERTA LIMITADA"
- Unsubscribe link obligatorio en marketing (CAN-SPAM, GDPR)
- Dominio nuevo: 50 emails/dia, duplicar cada semana

```dns
_dmarc.tudominio.com TXT "v=DMARC1; p=none; rua=mailto:dmarc@tudominio.com"
```

---

## 7. Integracion con n8n

**Pattern 1 — n8n llama a tu API Route:**
n8n HTTP Request > POST tuapp.com/api/send-email con Bearer token. Proteger con secret compartido.

**Pattern 2 — n8n directo a Resend API:**
n8n HTTP Request > POST api.resend.com/emails. No permite templates React Email (sin render).

**Pattern 3 — Resend Broadcasts:**
Triggear broadcast via API desde n8n para newsletters con Resend Audiences.

---

## Referencias

- `references/templates.tsx` — 7 templates completos
- `references/compatibility-guide.md` — Tabla cross-client completa
