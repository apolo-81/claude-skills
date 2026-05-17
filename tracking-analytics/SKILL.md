---
name: tracking-analytics
description: >
  Tracking de conversiones y comportamiento en sitios y funnels: Google Analytics 4
  (GA4) con eventos ecommerce, Meta Pixel con eventos estándar (PageView, Lead,
  Purchase, InitiateCheckout), Google Business Profile (GBP) y dataLayer para GTM.
  Cubre setup inicial, eventos server-side (Conversions API + Measurement Protocol),
  deduplicación cliente/servidor, consent mode y debugging con extensiones.
  Usar cuando: "GA4", "Google Analytics", "Meta Pixel", "Facebook Pixel", "fbq",
  "gtag", "dataLayer", "GTM", "Google Tag Manager", "evento de conversión",
  "Purchase event", "Lead event", "tracking de funnel", "Conversions API", "CAPI",
  "Measurement Protocol", "consent mode", "GBP", "Google Business Profile",
  "deduplicación pixel", "event_id".
  Triggers in English: "GA4 ecommerce", "Meta Pixel events", "Facebook Conversions API",
  "Google Tag Manager", "dataLayer push", "consent mode v2", "track Purchase event",
  "track Lead event", "Measurement Protocol GA4", "server-side tracking".
  Do NOT use for: SEO técnico (usar seo-core), email tracking (usar brevo-marketing o
  email-templates-builder), product analytics tipo Mixpanel/PostHog (otro stack).
---

# Tracking & Analytics

Stack confirmado: AMPLIFICA (GA4 `G-ZD60GVQNN5` + Meta Pixel + GBP), AstroLectura (GA4 ecommerce + Pixel Purchase), infoproduct-funnel (LOW2HIGH con tracking en cada step).

## Cuándo usar qué

| Necesidad | Herramienta |
|---|---|
| Tráfico, sesiones, audiencias, embudos | GA4 |
| Optimización de ads Meta, lookalikes, retargeting | Meta Pixel |
| Conversiones a prueba de adblockers | CAPI server-side |
| Múltiples tags sin tocar código | GTM (opcional) |
| Reseñas locales, mapas, "negocio cerca de mí" | GBP |

## GA4 — setup base

```html
<!-- En <head>, una sola vez -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX', { send_page_view: true });
</script>
```

### Eventos ecommerce estándar

```js
// Vista de producto
gtag('event', 'view_item', {
  currency: 'MXN',
  value: 199,
  items: [{ item_id: 'tarot-front', item_name: 'Lectura Tarot', price: 199, quantity: 1 }]
});

// Checkout iniciado
gtag('event', 'begin_checkout', { currency: 'MXN', value: 199, items: [...] });

// Compra (dispara en thank-you, no en webhook)
gtag('event', 'purchase', {
  transaction_id: 'cs_test_abc123',  // Stripe session id
  currency: 'MXN',
  value: 199,
  items: [...]
});
```

**Gotcha**: `transaction_id` debe ser único e idéntico al usado en Pixel — esto deduplica conversiones si también disparas server-side.

## Meta Pixel — setup base

```html
<script>
  !function(f,b,e,v,n,t,s){...}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'PIXEL_ID');
  fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" src="https://www.facebook.com/tr?id=PIXEL_ID&ev=PageView&noscript=1"/></noscript>
```

### Eventos estándar

```js
fbq('track', 'ViewContent', { content_ids: ['tarot-front'], content_type: 'product', value: 199, currency: 'MXN' });
fbq('track', 'Lead', { content_name: 'whatsapp-cta' });
fbq('track', 'InitiateCheckout', { value: 199, currency: 'MXN' });
fbq('track', 'Purchase', { value: 199, currency: 'MXN' }, { eventID: 'cs_test_abc123' });
```

`eventID` (mismo valor que `transaction_id` GA4 / `event_id` CAPI) → deduplicación con server-side.

## CAPI server-side (Conversions API)

Para conversiones críticas (Purchase, Lead) duplica el evento browser con server-side. Survive adblockers/iOS 14.5.

```js
// Next.js route handler / Express endpoint
import crypto from 'crypto';
const hash = (s) => crypto.createHash('sha256').update(s.trim().toLowerCase()).digest('hex');

await fetch(`https://graph.facebook.com/v18.0/${PIXEL_ID}/events?access_token=${CAPI_TOKEN}`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    data: [{
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_id: stripeSessionId,  // ← mismo eventID que Pixel browser
      action_source: 'website',
      event_source_url: 'https://astrolectura.com/thank-you',
      user_data: {
        em: [hash(email)],
        ph: [hash(phoneE164)],
        client_ip_address: ip,
        client_user_agent: ua,
        fbp: cookies.get('_fbp')?.value,
        fbc: cookies.get('_fbc')?.value,
      },
      custom_data: { currency: 'MXN', value: 199 },
    }],
  }),
});
```

**Hashing obligatorio** en email/phone (Meta lo rechaza en plano). Phone debe ser E.164 (`+5215512345678`) **antes** del hash.

## Measurement Protocol GA4 (server-side)

Equivalente CAPI para GA4. Útil para Purchase confirmados por webhook Stripe (no por thank-you que puede no cargar):

```js
await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${GA4_ID}&api_secret=${GA4_SECRET}`, {
  method: 'POST',
  body: JSON.stringify({
    client_id: gaClientId,  // ← extraer de cookie _ga
    events: [{
      name: 'purchase',
      params: { transaction_id: sessionId, currency: 'MXN', value: 199, items: [...] }
    }],
  }),
});
```

`client_id` debe ser el mismo que generó el browser — extrae de cookie `_ga` (formato `GA1.2.<client_id>.<timestamp>`).

## dataLayer + GTM (opcional)

Si tienes GTM, todo va por dataLayer y Tag Manager despacha:

```js
window.dataLayer.push({
  event: 'purchase',
  ecommerce: { transaction_id: sessionId, value: 199, currency: 'MXN', items: [...] }
});
```

Ventaja: marketing puede agregar Pixel, LinkedIn Insight, TikTok Pixel etc. sin tocar código.

## Consent Mode v2 (GDPR / LFPDPPP)

Para EU/UK obligatorio. En MX no obligatorio aún, pero recomendado si vas a captar leads en LATAM expandido.

```js
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
});
// Después de aceptar banner:
gtag('consent', 'update', { ad_storage: 'granted', analytics_storage: 'granted', /* ... */ });
```

## Google Business Profile

Sin SDK — todo se hace en el panel. Lo que sí trackeas:

- **UTM en website link del GBP**: `?utm_source=gbp&utm_medium=organic&utm_campaign=local`
- **Llamadas y direcciones**: GBP Insights (no exporta a GA4 directo; sí a Looker Studio con conector oficial).
- **Reviews**: API Business Profile v1 para responder programáticamente.

## Debugging

| Herramienta | Para qué |
|---|---|
| GA4 DebugView | Tiempo real con `debug_mode: true` o extensión Chrome "GA Debugger" |
| Meta Pixel Helper | Extensión Chrome — valida eventos, hashing, deduplicación |
| Test Events (Meta Events Manager) | Confirma CAPI server-side antes de prod |
| Real-Time GA4 | Ver visitantes y eventos en vivo |
| `fbq.disablePushState = false` | Detecta SPA route changes |

### Verificar deduplicación CAPI ↔ Pixel

En Meta Events Manager → Diagnostics, debe aparecer:
- "Event Match Quality" alto (>7)
- "Deduplicated events" >0 (si bajo: revisar que `eventID` cliente = `event_id` server)

## Variables de entorno típicas

```bash
NEXT_PUBLIC_GA4_ID=G-ZD60GVQNN5         # OK público
NEXT_PUBLIC_META_PIXEL_ID=1234567890    # OK público
META_CAPI_TOKEN=EAA...                  # ⚠️ server-only
GA4_API_SECRET=xxx                      # ⚠️ server-only
```

**Recordatorio**: cualquier var con `NEXT_PUBLIC_` queda en bundle del cliente. Tokens CAPI / API secrets **nunca** con ese prefijo.

## Anti-patrones

- ❌ Disparar `Purchase` en cada render del thank-you (duplica). Usa `useEffect` con guard o `sessionStorage`.
- ❌ Hashear email después de normalizar mal (`Apolo@X.com` vs `apolo@x.com`).
- ❌ Confiar solo en pixel browser para Purchase (adblockers comen ~30%).
- ❌ Olvidar el evento `Purchase` cuando un upsell se cobra después del checkout principal.

## Referencias

- GA4 Measurement Protocol: https://developers.google.com/analytics/devguides/collection/protocol/ga4
- Meta CAPI: https://developers.facebook.com/docs/marketing-api/conversions-api
- Standard events Meta: https://www.facebook.com/business/help/402791146561655
- GA4 ecommerce events: https://developers.google.com/tag-platform/gtagjs/reference/events

## Related Skills

- `infoproduct-funnel` — dónde se aplica este tracking en value ladders.
- `stripe-checkout-onetime` — fuente de `transaction_id` / `event_id` para deduplicación.
- `landing-page-builder` — dónde insertar los snippets.
- `brevo-marketing` — para tracking de email opens/clicks (Brevo lo maneja internamente).
