/**
 * Email Templates — React Email + Resend
 * Stack: Next.js App Router + TypeScript
 *
 * Uso: importar el componente en la API route y pasarlo a resend.emails.send({ react: Template(props) })
 * Preview: npx react-email dev (levanta en localhost:3000)
 */

import {
  Html, Head, Body, Container, Section, Row, Column,
  Text, Heading, Button, Link, Img, Hr, Preview, Tailwind,
} from '@react-email/components';

// ─────────────────────────────────────────────
// ESTILOS BASE COMPARTIDOS
// ─────────────────────────────────────────────
const base = {
  body: { backgroundColor: '#f3f4f6', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  container: { backgroundColor: '#ffffff', borderRadius: '8px', margin: '0 auto', padding: '40px', maxWidth: '600px' },
  h1: { color: '#111827', fontSize: '24px', fontWeight: '700', margin: '0 0 16px' },
  text: { color: '#374151', fontSize: '16px', lineHeight: '24px', margin: '0 0 16px' },
  small: { color: '#6b7280', fontSize: '13px', lineHeight: '20px' },
  hr: { borderColor: '#e5e7eb', margin: '24px 0' },
  footer: { color: '#9ca3af', fontSize: '12px', lineHeight: '18px', textAlign: 'center' as const },
  button: { backgroundColor: '#4f46e5', borderRadius: '6px', color: '#ffffff', display: 'inline-block', fontSize: '16px', fontWeight: '600', padding: '12px 28px', textDecoration: 'none' },
  badge: { backgroundColor: '#f3f4f6', borderRadius: '6px', color: '#374151', display: 'inline-block', fontSize: '14px', fontFamily: 'monospace', letterSpacing: '4px', padding: '12px 24px' },
};

// ─────────────────────────────────────────────
// 1. WELCOME EMAIL
// ─────────────────────────────────────────────
interface WelcomeEmailProps {
  name: string;
  appName: string;
  appUrl: string;
  logoUrl?: string;
}

export function WelcomeEmail({ name, appName, appUrl, logoUrl }: WelcomeEmailProps) {
  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>Bienvenido a {appName}, {name}. Tu cuenta está lista.</Preview>
      <Body style={base.body}>
        <Container style={{ ...base.container, padding: '0' }}>
          {/* Header */}
          <Section style={{ backgroundColor: '#4f46e5', borderRadius: '8px 8px 0 0', padding: '32px 40px', textAlign: 'center' }}>
            {logoUrl ? (
              <Img src={logoUrl} width={120} height={40} alt={appName} style={{ margin: '0 auto' }} />
            ) : (
              <Text style={{ color: '#ffffff', fontSize: '24px', fontWeight: '700', margin: '0' }}>{appName}</Text>
            )}
          </Section>
          {/* Body */}
          <Section style={{ padding: '40px' }}>
            <Heading style={base.h1}>Hola, {name} 👋</Heading>
            <Text style={base.text}>
              Tu cuenta en {appName} está lista. Nos alegra tenerte aquí.
            </Text>
            <Text style={base.text}>
              Empieza explorando todo lo que puedes hacer desde tu dashboard.
            </Text>
            <Section style={{ textAlign: 'center', margin: '32px 0' }}>
              <Button href={`${appUrl}/dashboard`} style={base.button}>
                Ir a mi dashboard
              </Button>
            </Section>
            <Hr style={base.hr} />
            <Text style={base.small}>
              Si no creaste esta cuenta, ignora este email o{' '}
              <Link href={`${appUrl}/support`} style={{ color: '#4f46e5' }}>contacta soporte</Link>.
            </Text>
          </Section>
          {/* Footer */}
          <Section style={{ backgroundColor: '#f9fafb', borderRadius: '0 0 8px 8px', padding: '24px 40px' }}>
            <Text style={base.footer}>
              {appName} · <Link href={`${appUrl}/unsubscribe`} style={{ color: '#9ca3af' }}>Cancelar suscripción</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ─────────────────────────────────────────────
// 2. VERIFY ACCOUNT EMAIL
// ─────────────────────────────────────────────
interface VerifyAccountEmailProps {
  name: string;
  appName: string;
  verifyUrl: string;
  expiresInHours?: number;
}

export function VerifyAccountEmail({ name, appName, verifyUrl, expiresInHours = 24 }: VerifyAccountEmailProps) {
  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>Confirma tu email para activar tu cuenta en {appName}.</Preview>
      <Body style={base.body}>
        <Container style={base.container}>
          <Heading style={base.h1}>Confirma tu email</Heading>
          <Text style={base.text}>Hola {name},</Text>
          <Text style={base.text}>
            Para activar tu cuenta en {appName}, confirma que esta dirección de email es tuya.
          </Text>
          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Button href={verifyUrl} style={base.button}>
              Confirmar mi email
            </Button>
          </Section>
          <Text style={base.small}>
            Este enlace expira en {expiresInHours} horas. Si no funciona, copia y pega esta URL en tu navegador:
          </Text>
          <Text style={{ ...base.small, wordBreak: 'break-all' }}>
            <Link href={verifyUrl} style={{ color: '#4f46e5' }}>{verifyUrl}</Link>
          </Text>
          <Hr style={base.hr} />
          <Text style={base.small}>
            Si no creaste una cuenta en {appName}, ignora este email. Tu dirección no será usada.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// ─────────────────────────────────────────────
// 3. PASSWORD RESET EMAIL
// ─────────────────────────────────────────────
interface PasswordResetEmailProps {
  name: string;
  appName: string;
  resetUrl: string;
  expiresInMinutes?: number;
  requestedFromIp?: string;
}

export function PasswordResetEmail({ name, appName, resetUrl, expiresInMinutes = 60, requestedFromIp }: PasswordResetEmailProps) {
  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>Solicitud de cambio de contraseña para tu cuenta en {appName}.</Preview>
      <Body style={base.body}>
        <Container style={base.container}>
          <Heading style={base.h1}>Cambiar contraseña</Heading>
          <Text style={base.text}>Hola {name},</Text>
          <Text style={base.text}>
            Recibimos una solicitud para cambiar la contraseña de tu cuenta. Si fuiste tú, haz clic en el botón.
          </Text>
          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Button href={resetUrl} style={{ ...base.button, backgroundColor: '#dc2626' }}>
              Cambiar mi contraseña
            </Button>
          </Section>
          <Text style={base.small}>
            Este enlace expira en {expiresInMinutes} minutos por seguridad.
          </Text>
          {requestedFromIp && (
            <Text style={base.small}>Solicitud realizada desde IP: {requestedFromIp}</Text>
          )}
          <Hr style={base.hr} />
          <Text style={base.small}>
            Si no solicitaste este cambio, ignora este email. Tu contraseña actual sigue siendo la misma.
            Si crees que alguien accedió a tu cuenta,{' '}
            <Link href="#" style={{ color: '#4f46e5' }}>contacta soporte inmediatamente</Link>.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// ─────────────────────────────────────────────
// 4. ORDER CONFIRMATION EMAIL
// ─────────────────────────────────────────────
interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

interface OrderConfirmationEmailProps {
  customerName: string;
  appName: string;
  orderNumber: string;
  orderDate: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency?: string;
  trackingUrl?: string;
  shippingAddress?: string;
}

export function OrderConfirmationEmail({
  customerName, appName, orderNumber, orderDate, items,
  subtotal, tax, shipping, total, currency = 'EUR',
  trackingUrl, shippingAddress,
}: OrderConfirmationEmailProps) {
  const fmt = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(n);

  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>Pedido #{orderNumber} confirmado. Total: {fmt(total)}.</Preview>
      <Body style={base.body}>
        <Container style={base.container}>
          <Heading style={base.h1}>Pedido confirmado</Heading>
          <Text style={base.text}>Hola {customerName},</Text>
          <Text style={base.text}>
            Hemos recibido tu pedido y está siendo procesado. Te notificaremos cuando sea enviado.
          </Text>

          {/* Order meta */}
          <Section style={{ backgroundColor: '#f9fafb', borderRadius: '6px', padding: '16px', margin: '0 0 24px' }}>
            <Text style={{ ...base.small, margin: '0 0 4px' }}><strong>Pedido:</strong> #{orderNumber}</Text>
            <Text style={{ ...base.small, margin: '0 0 4px' }}><strong>Fecha:</strong> {orderDate}</Text>
            {shippingAddress && (
              <Text style={{ ...base.small, margin: '0' }}><strong>Envío a:</strong> {shippingAddress}</Text>
            )}
          </Section>

          {/* Items */}
          {items.map((item, i) => (
            <Row key={i} style={{ borderBottom: '1px solid #e5e7eb', padding: '12px 0' }}>
              <Column>
                <Text style={{ ...base.text, margin: '0', fontWeight: '500' }}>{item.name}</Text>
                <Text style={{ ...base.small, margin: '0' }}>Cantidad: {item.quantity}</Text>
              </Column>
              <Column style={{ textAlign: 'right' }}>
                <Text style={{ ...base.text, margin: '0' }}>{fmt(item.unitPrice * item.quantity)}</Text>
              </Column>
            </Row>
          ))}

          {/* Totals */}
          <Section style={{ margin: '16px 0' }}>
            <Row>
              <Column><Text style={{ ...base.small, margin: '4px 0' }}>Subtotal</Text></Column>
              <Column style={{ textAlign: 'right' }}><Text style={{ ...base.small, margin: '4px 0' }}>{fmt(subtotal)}</Text></Column>
            </Row>
            <Row>
              <Column><Text style={{ ...base.small, margin: '4px 0' }}>IVA</Text></Column>
              <Column style={{ textAlign: 'right' }}><Text style={{ ...base.small, margin: '4px 0' }}>{fmt(tax)}</Text></Column>
            </Row>
            <Row>
              <Column><Text style={{ ...base.small, margin: '4px 0' }}>Envío</Text></Column>
              <Column style={{ textAlign: 'right' }}><Text style={{ ...base.small, margin: '4px 0' }}>{shipping === 0 ? 'Gratis' : fmt(shipping)}</Text></Column>
            </Row>
            <Hr style={base.hr} />
            <Row>
              <Column><Text style={{ ...base.text, margin: '0', fontWeight: '700' }}>Total</Text></Column>
              <Column style={{ textAlign: 'right' }}><Text style={{ ...base.text, margin: '0', fontWeight: '700' }}>{fmt(total)}</Text></Column>
            </Row>
          </Section>

          {trackingUrl && (
            <Section style={{ textAlign: 'center', margin: '24px 0' }}>
              <Button href={trackingUrl} style={base.button}>Seguir mi pedido</Button>
            </Section>
          )}

          <Hr style={base.hr} />
          <Text style={base.small}>
            ¿Preguntas sobre tu pedido? Responde a este email o visita nuestro{' '}
            <Link href="#" style={{ color: '#4f46e5' }}>centro de ayuda</Link>.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// ─────────────────────────────────────────────
// 5. INVOICE EMAIL
// ─────────────────────────────────────────────
interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceEmailProps {
  customerName: string;
  customerEmail: string;
  companyName: string;
  companyAddress?: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  items: InvoiceLineItem[];
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  currency?: string;
  paymentUrl?: string;
  notes?: string;
}

export function InvoiceEmail({
  customerName, customerEmail, companyName, companyAddress,
  invoiceNumber, invoiceDate, dueDate, items,
  subtotal, taxRate, tax, total, currency = 'EUR',
  paymentUrl, notes,
}: InvoiceEmailProps) {
  const fmt = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(n);

  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>Factura #{invoiceNumber} de {companyName} por {fmt(total)} — vence el {dueDate}.</Preview>
      <Body style={base.body}>
        <Container style={base.container}>
          {/* Header */}
          <Row>
            <Column>
              <Heading style={{ ...base.h1, margin: '0' }}>Factura</Heading>
              <Text style={{ ...base.small, margin: '4px 0 0' }}>#{invoiceNumber}</Text>
            </Column>
            <Column style={{ textAlign: 'right' }}>
              <Text style={{ ...base.text, margin: '0', fontWeight: '700' }}>{companyName}</Text>
              {companyAddress && <Text style={{ ...base.small, margin: '0' }}>{companyAddress}</Text>}
            </Column>
          </Row>

          <Hr style={base.hr} />

          {/* Meta */}
          <Row>
            <Column>
              <Text style={{ ...base.small, margin: '0 0 4px' }}><strong>Para:</strong></Text>
              <Text style={{ ...base.text, margin: '0' }}>{customerName}</Text>
              <Text style={{ ...base.small, margin: '0' }}>{customerEmail}</Text>
            </Column>
            <Column style={{ textAlign: 'right' }}>
              <Text style={{ ...base.small, margin: '0 0 4px' }}>Fecha: {invoiceDate}</Text>
              <Text style={{ ...base.small, margin: '0', color: '#dc2626', fontWeight: '600' }}>Vence: {dueDate}</Text>
            </Column>
          </Row>

          <Hr style={base.hr} />

          {/* Items header */}
          <Row style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: '8px', marginBottom: '8px' }}>
            <Column style={{ width: '50%' }}><Text style={{ ...base.small, margin: '0', fontWeight: '600' }}>Descripción</Text></Column>
            <Column style={{ textAlign: 'center' }}><Text style={{ ...base.small, margin: '0', fontWeight: '600' }}>Cant.</Text></Column>
            <Column style={{ textAlign: 'right' }}><Text style={{ ...base.small, margin: '0', fontWeight: '600' }}>Precio</Text></Column>
            <Column style={{ textAlign: 'right' }}><Text style={{ ...base.small, margin: '0', fontWeight: '600' }}>Total</Text></Column>
          </Row>

          {/* Items */}
          {items.map((item, i) => (
            <Row key={i} style={{ borderBottom: '1px solid #f3f4f6', padding: '10px 0' }}>
              <Column style={{ width: '50%' }}><Text style={{ ...base.text, margin: '0' }}>{item.description}</Text></Column>
              <Column style={{ textAlign: 'center' }}><Text style={{ ...base.text, margin: '0' }}>{item.quantity}</Text></Column>
              <Column style={{ textAlign: 'right' }}><Text style={{ ...base.text, margin: '0' }}>{fmt(item.unitPrice)}</Text></Column>
              <Column style={{ textAlign: 'right' }}><Text style={{ ...base.text, margin: '0' }}>{fmt(item.quantity * item.unitPrice)}</Text></Column>
            </Row>
          ))}

          {/* Totals */}
          <Section style={{ margin: '16px 0', maxWidth: '250px', marginLeft: 'auto' }}>
            <Row><Column><Text style={{ ...base.small, margin: '4px 0' }}>Subtotal</Text></Column><Column style={{ textAlign: 'right' }}><Text style={{ ...base.small, margin: '4px 0' }}>{fmt(subtotal)}</Text></Column></Row>
            <Row><Column><Text style={{ ...base.small, margin: '4px 0' }}>IVA ({taxRate}%)</Text></Column><Column style={{ textAlign: 'right' }}><Text style={{ ...base.small, margin: '4px 0' }}>{fmt(tax)}</Text></Column></Row>
            <Hr style={{ ...base.hr, margin: '8px 0' }} />
            <Row><Column><Text style={{ ...base.text, margin: '0', fontWeight: '700' }}>Total</Text></Column><Column style={{ textAlign: 'right' }}><Text style={{ ...base.text, margin: '0', fontWeight: '700', fontSize: '20px' }}>{fmt(total)}</Text></Column></Row>
          </Section>

          {paymentUrl && (
            <Section style={{ textAlign: 'center', margin: '32px 0' }}>
              <Button href={paymentUrl} style={base.button}>Pagar ahora</Button>
            </Section>
          )}

          {notes && (
            <>
              <Hr style={base.hr} />
              <Text style={{ ...base.small, fontStyle: 'italic' }}>{notes}</Text>
            </>
          )}
        </Container>
      </Body>
    </Html>
  );
}

// ─────────────────────────────────────────────
// 6. NOTIFICATION EMAIL
// ─────────────────────────────────────────────
type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface NotificationEmailProps {
  recipientName: string;
  appName: string;
  type: NotificationType;
  title: string;
  message: string;
  ctaLabel?: string;
  ctaUrl?: string;
  appUrl: string;
}

export function NotificationEmail({
  recipientName, appName, type, title, message, ctaLabel, ctaUrl, appUrl,
}: NotificationEmailProps) {
  const typeConfig: Record<NotificationType, { color: string; bg: string; icon: string }> = {
    info:    { color: '#1d4ed8', bg: '#dbeafe', icon: 'ℹ️' },
    success: { color: '#15803d', bg: '#dcfce7', icon: '✅' },
    warning: { color: '#b45309', bg: '#fef3c7', icon: '⚠️' },
    error:   { color: '#b91c1c', bg: '#fee2e2', icon: '🚨' },
  };
  const config = typeConfig[type];

  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>{title} — {appName}</Preview>
      <Body style={base.body}>
        <Container style={base.container}>
          {/* Notification banner */}
          <Section style={{ backgroundColor: config.bg, borderLeft: `4px solid ${config.color}`, borderRadius: '4px', padding: '16px', marginBottom: '24px' }}>
            <Text style={{ ...base.text, margin: '0', color: config.color, fontWeight: '600' }}>
              {config.icon} {title}
            </Text>
          </Section>

          <Text style={base.text}>Hola {recipientName},</Text>
          <Text style={base.text}>{message}</Text>

          {ctaLabel && ctaUrl && (
            <Section style={{ textAlign: 'center', margin: '32px 0' }}>
              <Button href={ctaUrl} style={{ ...base.button, backgroundColor: config.color }}>
                {ctaLabel}
              </Button>
            </Section>
          )}

          <Hr style={base.hr} />
          <Text style={base.footer}>
            {appName} · <Link href={`${appUrl}/settings/notifications`} style={{ color: '#9ca3af' }}>Gestionar notificaciones</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// ─────────────────────────────────────────────
// 7. NEWSLETTER BASE
// ─────────────────────────────────────────────
interface NewsletterArticle {
  title: string;
  excerpt: string;
  url: string;
  imageUrl?: string;
}

interface NewsletterEmailProps {
  publicationName: string;
  issueNumber?: number;
  issueDate: string;
  previewText: string;
  introText: string;
  articles: NewsletterArticle[];
  unsubscribeUrl: string;
  webVersionUrl?: string;
  logoUrl?: string;
  accentColor?: string;
}

export function NewsletterEmail({
  publicationName, issueNumber, issueDate, previewText, introText,
  articles, unsubscribeUrl, webVersionUrl, logoUrl, accentColor = '#4f46e5',
}: NewsletterEmailProps) {
  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={base.body}>
        <Container style={{ ...base.container, padding: '0' }}>
          {/* Header */}
          <Section style={{ backgroundColor: accentColor, borderRadius: '8px 8px 0 0', padding: '24px 40px', textAlign: 'center' }}>
            {logoUrl ? (
              <Img src={logoUrl} width={140} height={40} alt={publicationName} style={{ margin: '0 auto 8px' }} />
            ) : (
              <Text style={{ color: '#ffffff', fontSize: '22px', fontWeight: '700', margin: '0 0 4px' }}>{publicationName}</Text>
            )}
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: '0' }}>
              {issueNumber ? `#${issueNumber} · ` : ''}{issueDate}
            </Text>
          </Section>

          {/* Web version */}
          {webVersionUrl && (
            <Section style={{ backgroundColor: '#f9fafb', padding: '8px 40px', textAlign: 'center' }}>
              <Text style={{ ...base.small, margin: '0' }}>
                ¿Problemas para ver esto?{' '}
                <Link href={webVersionUrl} style={{ color: accentColor }}>Ver versión web</Link>
              </Text>
            </Section>
          )}

          {/* Intro */}
          <Section style={{ padding: '32px 40px 0' }}>
            <Text style={base.text}>{introText}</Text>
            <Hr style={base.hr} />
          </Section>

          {/* Articles */}
          {articles.map((article, i) => (
            <Section key={i} style={{ padding: '0 40px 24px' }}>
              {article.imageUrl && (
                <Img src={article.imageUrl} width={520} alt={article.title} style={{ borderRadius: '6px', marginBottom: '16px', width: '100%' }} />
              )}
              <Heading style={{ ...base.h1, fontSize: '20px', margin: '0 0 8px' }}>{article.title}</Heading>
              <Text style={{ ...base.text, margin: '0 0 12px' }}>{article.excerpt}</Text>
              <Link href={article.url} style={{ color: accentColor, fontWeight: '600', fontSize: '14px' }}>
                Leer más →
              </Link>
              {i < articles.length - 1 && <Hr style={base.hr} />}
            </Section>
          ))}

          {/* Footer */}
          <Section style={{ backgroundColor: '#f9fafb', borderRadius: '0 0 8px 8px', padding: '24px 40px', marginTop: '24px' }}>
            <Text style={base.footer}>
              Recibiste este email porque estás suscrito a {publicationName}.<br />
              <Link href={unsubscribeUrl} style={{ color: '#9ca3af' }}>Cancelar suscripción</Link>
              {' · '}
              <Link href="#" style={{ color: '#9ca3af' }}>Actualizar preferencias</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ─────────────────────────────────────────────
// EJEMPLO DE USO EN API ROUTE
// ─────────────────────────────────────────────
/*
// app/api/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { resend } from '@/lib/resend';
import { WelcomeEmail } from '@/emails/templates';

export async function POST(req: NextRequest) {
  const { type, to, ...data } = await req.json();

  const templates: Record<string, (props: any) => JSX.Element> = {
    welcome: WelcomeEmail,
    verify: VerifyAccountEmail,
    'password-reset': PasswordResetEmail,
    'order-confirmation': OrderConfirmationEmail,
    invoice: InvoiceEmail,
    notification: NotificationEmail,
    newsletter: NewsletterEmail,
  };

  const Template = templates[type];
  if (!Template) return NextResponse.json({ error: 'Unknown template' }, { status: 400 });

  const { data: result, error } = await resend.emails.send({
    from: process.env.FROM_EMAIL ?? 'noreply@tudominio.com',
    to,
    subject: data.subject,
    react: Template(data),
  });

  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json({ id: result?.id });
}
*/
