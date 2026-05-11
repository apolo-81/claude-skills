---
name: brevo-marketing
description: >
  Brevo (ex-Sendinblue) para email marketing transaccional y nurture: API v3,
  listas y contactos, automations workflow, templates, double opt-in y proxy PHP
  para hosting compartido sin CORS. Usar cuando: "Brevo", "Sendinblue", "email nurture",
  "lista de suscriptores", "automation Brevo", "double opt-in", "transactional email",
  "drip campaign", "sib-api", "doubleOptin", "brevo-subscribe", "templateId".
  Do NOT use for: emails transaccionales puntuales (usar Resend en Next.js),
  notificaciones in-app, SMS sin email asociado.
---

# Brevo Marketing

Stack confirmado en AMPLIFICA: PHP proxy + interceptor JS + listas + automation D0→D10.

## Cuándo usar Brevo vs Resend

| Necesidad | Servicio |
|-----------|----------|
| Listas, segmentación, automations, double opt-in | **Brevo** |
| Email transaccional 1:1 desde Next.js (welcome, password reset, recibo) | **Resend** |
| Drip/nurture multi-touch con condiciones | **Brevo automations** |
| Newsletter masivo programado | **Brevo campañas** |

Brevo free: 300 emails/día, contactos ilimitados.

## Autenticación

API v3, header `api-key: xkeysib-...`. Una key por proyecto.

```bash
curl -X GET https://api.brevo.com/v3/account \
  -H "api-key: $BREVO_API_KEY" -H "accept: application/json"
```

## Crear contacto + asignar a lista (server-side)

`POST https://api.brevo.com/v3/contacts`

```json
{
  "email": "user@example.com",
  "attributes": { "FIRSTNAME": "Apolo", "SOURCE": "amplifica-fundadores" },
  "listIds": [3],
  "updateEnabled": true
}
```

`updateEnabled: true` permite re-suscribir sin error 400 si ya existe.

Para double opt-in usar endpoint `/v3/contacts/doubleOptinConfirmation` con `templateId` (template de confirmación) y `redirectionUrl`.

## Proxy PHP — hosting compartido sin CORS

Patrón AMPLIFICA: form HTML estático llama a `brevo-subscribe.php` en mismo dominio. PHP llama a Brevo API server-side.

**Gotcha crítico**: en hosting cPanel/Hostinger, IPv6 falla con `Could not resolve host: api.brevo.com`. Forzar IPv4:

```php
curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
```

Ver `references/brevo-subscribe.php` para implementación completa con CORS, rate limit, validación email.

## Interceptor JS — capturar submits y disparar Brevo + WA

Patrón AMPLIFICA: IIFE que envuelve fetch original, detecta submits a `/brevo-subscribe.php`, dispara webhook secundario WA en paralelo con `Promise.allSettled`.

```js
(function() {
  const origFetch = window.fetch;
  window.fetch = async function(url, opts) {
    if (typeof url === 'string' && url.includes('brevo-subscribe.php')) {
      const body = opts?.body;
      const [brevoRes, waRes] = await Promise.allSettled([
        origFetch(url, opts),
        origFetch('/wa-notify.php', { method: 'POST', body })
      ]);
      return brevoRes.status === 'fulfilled' ? brevoRes.value : Promise.reject(brevoRes.reason);
    }
    return origFetch(url, opts);
  };
})();
```

`Promise.allSettled` asegura que falla de WA no rompe submit a Brevo.

## Automations (workflow)

Trigger principal: `Contact added to list`. Acciones encadenadas con `Wait X days` entre cada email.

Patrón AMPLIFICA nurture (lista 3 = Fundadores):
- D0: bienvenida + 1 cupo
- D2: caso de éxito
- D4: objeción común
- D7: testimonio video
- D10: cierre con scarcity

Templates en Brevo Editor con bloques drag-drop. Variables: `{{ contact.FIRSTNAME }}`, `{{ params.code }}` (params se pasan desde API si automation se dispara manual).

## Templates transaccionales

`POST https://api.brevo.com/v3/smtp/email` con `templateId` y `params`:

```json
{
  "to": [{ "email": "user@example.com", "name": "Apolo" }],
  "templateId": 12,
  "params": { "code": "ABC123", "expires_in": "30 minutos" }
}
```

## Webhooks entrantes (eventos)

Brevo dispara webhooks: `delivered`, `opened`, `click`, `unsubscribe`, `hardBounce`. Configurar en Settings > Webhooks. Verificar con IP allowlist (Brevo no firma HMAC).

## Errores comunes

| Error | Causa | Fix |
|-------|-------|-----|
| `400 Contact already exist` | sin `updateEnabled: true` | añadir flag |
| `403 unauthorised IP` | IP no en allowlist | añadir IP en Brevo > Security |
| `Could not resolve host` (CURL) | IPv6 broken en host | `CURLOPT_IPRESOLVE_V4` |
| Contact creado pero no en lista | `listIds` omitido | mandar array de ints |
| Doble suscripción al re-enviar | sin double opt-in | usar `doubleOptinConfirmation` |

## Verificación post-deploy

```bash
# Test contacto
curl -X POST https://api.brevo.com/v3/contacts \
  -H "api-key: $BREVO_API_KEY" -H "content-type: application/json" \
  -d '{"email":"test@example.com","listIds":[3],"updateEnabled":true}'

# Confirmar en lista
curl -X GET "https://api.brevo.com/v3/contacts/lists/3/contacts?limit=10" \
  -H "api-key: $BREVO_API_KEY"
```

## Referencias

- Brevo API docs: https://developers.brevo.com/reference
- AMPLIFICA setup confirmado 2026-05-07: lista id 3, commit ffa49e9
