---
name: calendar-master
description: >
  Manejo completo de calendarios en apps web: generación de archivos .ics (BEGIN:VCALENDAR)
  cliente y servidor, URLs de Google Calendar (calendar.google.com/calendar/render),
  embebido de cal.com (Cal Embed), Google Calendar API server-side (googleapis SDK),
  timezone handling (TZID, IANA), recurring events (RRULE), escape de caracteres
  obligatorio (coma, punto y coma, backslash), UID estable y MIME type
  text/calendar. Stack: Node.js + browser TypeScript + `ics` npm + googleapis SDK
  opcional. Usar cuando: "ICS", "archivo .ics", "VCALENDAR", "Google Calendar",
  "agregar al calendario", "Add to Calendar", "lib/calendar", "evento recurrente",
  "RRULE", "cal.com", "Cal embed", "googleapis calendar", "calendario AULA",
  "sesión en vivo .ics", "ICS download", "calendar invite", "timezone TZID",
  "escapeIcsText".
  Triggers in English: "generate ICS file", "VCALENDAR event", "Google Calendar URL",
  "add to calendar button", "calendar invite", "cal.com integration", "Google
  Calendar API", "recurring event RRULE", "ICS timezone", "calendar SDK",
  "downloadable .ics".
  Do NOT use for: scheduling internas tipo cron jobs (usar background-jobs),
  notificaciones tipo "recordatorio" sin calendario externo, UI de calendario
  visual tipo FullCalendar/shadcn Calendar component (eso es UI, no exportación).
---

# Calendar Master

Patrones canónicos vienen de `lib/calendar.ts` en AULA UC LOGOS — replicados en lms-core y candidatos a usar en uc-logos/crm, rumbo-protegido/crm, whatsapp-saas/apps/api.

## Cuándo usar qué

| Necesidad | Solución |
|---|---|
| Botón "Agregar a mi calendario" desde browser (no auth) | ICS download + Google Calendar URL |
| Generar `.ics` server-side y mandar por email | `ics` npm + Resend/Brevo attachment |
| Embed widget de booking de terceros | cal.com Embed |
| Sync bidireccional con Google Calendar del usuario | googleapis SDK + OAuth2 |
| Recordatorio recurrente (clase semanal) | ICS con RRULE |

## 1. ICS browser-side (descarga con un click)

Patrón AULA `lib/calendar.ts:51`. Construye un `Blob`, dispara descarga, limpia URL.

```ts
interface CalendarEvent {
  id: string;
  title: string;
  description?: string | null;
  start: string | Date;
  durationMinutes: number;
  timeZone?: string | null;
  url?: string | null;
}

const toGoogleDate = (date: Date) =>
  date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');

const escapeIcsText = (value: string) =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');

export function downloadIcsEvent(event: CalendarEvent) {
  const start = typeof event.start === 'string' ? new Date(event.start) : event.start;
  const end = new Date(start.getTime() + event.durationMinutes * 60 * 1000);
  const now = new Date();

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Tu App//Events//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@tu-dominio.com`,
    `DTSTAMP:${toGoogleDate(now)}`,
    `DTSTART:${toGoogleDate(start)}`,
    `DTEND:${toGoogleDate(end)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    event.description ? `DESCRIPTION:${escapeIcsText(event.description)}` : null,
    event.url ? `URL:${event.url}` : null,
    event.url ? `LOCATION:${escapeIcsText(event.url)}` : null,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.ics`;
  document.body.appendChild(link);
  link.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(link);
}
```

**Reglas críticas**:
- **Line endings**: `\r\n` obligatorio por RFC 5545. `\n` puede romper iCal.
- **UID estable**: mismo evento = mismo UID = update, no duplicar. Formato: `<id>@<dominio>`.
- **Escape de coma, punto y coma, backslash**: si tu título tiene `, ; \` y no lo escapas, el parser corta el evento ahí.
- **`DTSTAMP`**: cuándo se generó el .ics (no cuándo es el evento). Usa `new Date()`.
- **MIME type**: `text/calendar;charset=utf-8` — sin esto, algunos browsers abren como texto plano.

## 2. Google Calendar URL (sin descarga)

Funciona en cualquier device, abre app oficial de Google Cal:

```ts
export function buildGoogleCalendarUrl(event: CalendarEvent): string {
  const start = typeof event.start === 'string' ? new Date(event.start) : event.start;
  const end = new Date(start.getTime() + event.durationMinutes * 60 * 1000);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${toGoogleDate(start)}/${toGoogleDate(end)}`,
    details: event.description ?? '',
  });
  if (event.url) params.set('location', event.url);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
```

Combo recomendado en UI: mostrar ambos botones (ICS Download + Google Cal). Apple/Outlook → ICS. Android/Google users → URL.

## 3. ICS server-side con `ics` npm

Para generar y mandar por email (Resend/Brevo attachment):

```bash
npm install ics
```

```ts
import { createEvent } from 'ics';

const { error, value } = createEvent({
  start: [2026, 5, 20, 18, 0],          // [year, month, day, hour, minute]
  duration: { hours: 1, minutes: 30 },
  title: 'Sesión en vivo: Módulo 3',
  description: 'Acceso vía Zoom',
  location: 'https://zoom.us/j/123',
  url: 'https://aula.uclogos.mx/curso/3',
  organizer: { name: 'UC LOGOS', email: 'admisiones@uclogos.mx' },
  attendees: [{ name: 'Estudiante', email: 'user@example.com', rsvp: true }],
  status: 'CONFIRMED',
  busyStatus: 'BUSY',
  uid: `clase-${classId}@uclogos.mx`,
});

// Adjunto a Resend:
await resend.emails.send({
  to, from, subject, html,
  attachments: [{ filename: 'invitacion.ics', content: Buffer.from(value!).toString('base64') }],
});
```

`ics` package maneja escapado y line endings automáticamente.

## 4. Recurring events (RRULE)

Para clases semanales, el campo `recurrenceRule`:

```ts
createEvent({
  start: [2026, 5, 20, 18, 0],
  duration: { hours: 1 },
  title: 'Clase semanal Liderazgo',
  recurrenceRule: 'FREQ=WEEKLY;BYDAY=WE;COUNT=12',  // 12 miércoles
  // ...
});
```

| Patrón | RRULE |
|---|---|
| Cada lunes 10 semanas | `FREQ=WEEKLY;BYDAY=MO;COUNT=10` |
| Día 1 de cada mes hasta dic | `FREQ=MONTHLY;BYMONTHDAY=1;UNTIL=20261231T000000Z` |
| Cada martes y jueves | `FREQ=WEEKLY;BYDAY=TU,TH` |
| Cada 2 semanas indefinido | `FREQ=WEEKLY;INTERVAL=2` |

## 5. Timezone (TZID)

ICS sin timezone usa UTC. Para que el calendario del usuario muestre la hora correcta local:

```ts
const ics = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'BEGIN:VTIMEZONE',
  'TZID:America/Mexico_City',
  'END:VTIMEZONE',
  'BEGIN:VEVENT',
  `DTSTART;TZID=America/Mexico_City:20260520T180000`,
  `DTEND;TZID=America/Mexico_City:20260520T193000`,
  // ...
];
```

**LATAM**: `America/Mexico_City`, `America/Bogota`, `America/Lima`, `America/Argentina/Buenos_Aires`. Usar IDs IANA, no abreviaciones (`CST`, `EST` son ambiguos).

Patrón AULA: omite TZID y pone DESCRIPTION con texto plano "Hora mostrada: 18:00 hora CDMX" — más simple, menos elegante pero funciona.

## 6. cal.com Embed

Para booking en sitio público sin construir UI propia:

```html
<!-- Script en <head> -->
<script type="text/javascript">
  (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ["initNamespace", namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
  Cal("init", "30min", { origin: "https://cal.com" });
</script>

<!-- Botón inline -->
<button data-cal-link="tu-usuario/30min" data-cal-namespace="30min">
  Reservar 30 min
</button>
```

cal.com tiene API REST también (`api.cal.com/v2`) si necesitas crear/listar bookings programáticamente.

## 7. Google Calendar API (server-side sync)

Sin uso actual confirmado en tu stack, pero patrón estándar si lo necesitas:

```bash
npm install googleapis
```

```ts
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauth2Client.setCredentials({ access_token, refresh_token });

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

await calendar.events.insert({
  calendarId: 'primary',
  requestBody: {
    summary: 'Sesión Aula',
    start: { dateTime: '2026-05-20T18:00:00', timeZone: 'America/Mexico_City' },
    end: { dateTime: '2026-05-20T19:30:00', timeZone: 'America/Mexico_City' },
    attendees: [{ email: 'user@example.com' }],
    conferenceData: { createRequest: { requestId: 'meet-1', conferenceSolutionKey: { type: 'hangoutsMeet' } } },
  },
  conferenceDataVersion: 1,  // ← necesario para crear Meet link
});
```

**Scopes mínimos**: `https://www.googleapis.com/auth/calendar.events`. Para solo lectura: `.readonly`.

## 8. Variables de entorno típicas

```bash
# Solo si usas Google Calendar API
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://app.com/auth/google/callback

# cal.com API (opcional)
CALCOM_API_KEY=cal_live_...
```

ICS browser-side y Google Calendar URL: cero secrets, cero env vars.

## Anti-patrones

- ❌ Olvidar `escapeIcsText` en SUMMARY/DESCRIPTION → titulo con coma corta el evento.
- ❌ Line endings `\n` en vez de `\r\n` → iCal/Outlook ignoran o muestran mal.
- ❌ UID random cada vez → cada update crea evento duplicado en vez de actualizar.
- ❌ Asumir UTC sin TZID y publicar `DTSTART:20260520T180000Z` cuando quieres 6pm local → estudiante en CDMX ve "12pm" (UTC).
- ❌ MIME type `text/plain` o sin `charset=utf-8` → browser abre como texto plano.
- ❌ `RRULE` con `UNTIL` en formato local sin TZ → algunos parsers asumen UTC silenciosamente.
- ❌ En `ics` npm, pasar fecha como string ISO — espera array `[Y,M,D,H,m]` con mes **1-indexed** (no como `Date.getMonth()` que es 0-indexed).
- ❌ Mandar el ICS en email sin attachment (solo body) — clientes no lo reconocen.

## Verificación

```bash
# Validar ICS generado
cat invitacion.ics | grep -E "BEGIN:|END:|UID:|DTSTART|DTEND"

# Validar online: https://icalendar.org/validator.html

# Test recurring rule: https://www.textmagic.com/free-tools/rrule-generator
```

## Referencias

- RFC 5545 (iCalendar spec): https://www.rfc-editor.org/rfc/rfc5545
- `ics` npm: https://github.com/adamgibbons/ics
- Google Calendar URL params: https://github.com/InteractionDesignFoundation/add-event-to-calendar-docs/blob/main/services/google.md
- cal.com embed: https://cal.com/docs/embed
- googleapis SDK: https://developers.google.com/calendar/api/quickstart/nodejs

## Related Skills

- `email-templates-builder` — para enviar el `.ics` como adjunto en Resend.
- `auth-patterns` — OAuth2 con Google si vas a usar Calendar API.
- `landing-page-builder` — donde colocar el botón "Add to Calendar".
- `background-jobs` — recordatorios pre-evento son cron jobs, NO calendario.
