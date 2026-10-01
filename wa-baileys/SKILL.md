---
name: wa-baileys
description: >
  WhatsApp con Baileys 7 (WhiskeySockets) en Node: sesión y QR, reconexión, JID de México, recibos de entrega,
  límites anti-bloqueo, envíos a grupos, pruebas y recuperación de sesiones. Destilado de incidentes reales en
  wa-group-poster, wa-outreach, ghl-broadcaster y barberpro.
  Usar cuando: "Baileys", "WhatsApp bot", "enviar WhatsApp desde Node", "QR de WhatsApp", "sesión invalidada 401",
  "error 405", "NACK 479", "reach-out time-lock", "mensajes a grupos", "programar publicaciones en grupos",
  "número mexicano 521", "recibos de entrega". Triggers: "WhatsApp Web socket", "multi-device API".
  Do NOT use for: WhatsApp Business Cloud API oficial, Evolution API, ni redactar el copy de campañas.
---

# WhatsApp con Baileys 7

Fuente: incidentes reales documentados en la memoria del usuario (verificados hasta 2026-08-28). **Confirma la versión** en
`package.json` (`7.0.0-rc*` en los proyectos activos) antes de asumir comportamientos; un salto de versión mayor cambia cosas.

## 1. Ciclo de vida de la sesión

- **Registra los listeners antes de conectar.** `on('connected')` después de `connect()`/`startAll()` pierde el evento si la
  conexión es rápida (race real detectada en code review).
- **`sock.logout()` reconecta solo.** Para desvincular de verdad: desactiva la reconexión (`maxReconnectAttempts = 0`), cierra el
  socket y limpia la carpeta de sesión. No confíes en `logout()`.
- **`405` casi siempre es la revisión de WhatsApp Web caducada, no un rate-limit.** Señal: llega a ~2 s incluso en el primer intento
  tras arrancar limpio y nunca se emite un QR. `fetchLatestBaileysVersion()` **no lanza** si falla la red: devuelve la versión del
  paquete con `isLatest: false`. Acepta solo `isLatest === true`; si no, usa la última buena guardada (`data/wa-web-version.json`).
  Un `405` sobre credenciales ya vinculadas no debe borrar la sesión a la primera: revalida la versión y reintenta antes.
- **`401`/sesión invalidada**: WhatsApp cerró la sesión. No borres: mueve `data/wa-session` a `data/wa-session.dead-AAAA-MM-DD`,
  arranca con carpeta nueva y espera que el humano escanee el QR (ningún agente puede). Revisa si hubo un time-lock antes (§3).
- **Tras un bump de versión mayor** (6.x a 7.x) las sesiones Signal por dispositivo pueden quedar huérfanas (`session-<lid>.13.json`
  vs `session-<lid>_1.13.json`) y siguen dando **NACK 479** aunque el código sea correcto. No sigas parchando: respalda
  `data/wa-session/`, logout completo y re-vincula con QR nuevo. `sock.fetchAccountReachoutTimelock()` con `isActive:false` descarta
  un bloqueo de cuenta.
- Mantén el servicio como unidad `systemctl --user` con autostart si debe sobrevivir reinicios; el QR se ve en el journal o en la UI.

## 2. Números y JID (México)

- Un móvil mexicano en WhatsApp es **`521` + 10 dígitos** (13), no `52` + 10. Enviar a `52XXXXXXXXXX@s.whatsapp.net` puede reportar
  éxito y no llegar nunca. **Resuelve siempre** con `sock.onWhatsApp(phone)` y usa `result[0].jid`.
- Normaliza el teléfono a dígitos antes de resolver; guarda el JID canónico, no el que escribió el usuario.
- Existen JID de tipo PN y LID; si archivas o cruzas chats, compara ambas formas.

## 3. Límites y anti-bloqueo (lo que sí está medido)

- **El bloqueo real es el reach-out time-lock nativo de WhatsApp** (mecanismo de plataforma, issue WhiskeySockets/Baileys#2441): limita
  los mensajes 1:1 a desconocidos sin reciprocidad **sin importar qué tan humano parezca el patrón de envío**. Se cae al acercarse al
  volumen: en wa-outreach cayó dos veces en 5 días con 48 y 50 envíos en el día.
- **Un tope diario fijo y bajo gana a una rampa agresiva.** Hoy: 25/día fijo para cold outreach. Acelerar la rampa "por comportamiento
  sano" provocó el segundo bloqueo. Mide primero, sube después.
- Grupos conocidos son otro régimen: wa-group-poster opera con 120 mensajes/día (35 grupos x 3 campañas) sin incidentes en 14 días,
  con jitter, retardo entre grupos, bloqueo nocturno y cooldown global de 2 h.
- Spintax `{a|b}` plano, validado (llaves balanceadas, sin alternativas vacías ni anidación), cada variante dentro del límite de
  longitud. Filtra las autorespuestas antes de contestar (`looksLikeAutoReply`) y detecta bucles de cierre.
- **No prometas lo que Baileys no hace:** programar Estados con mención oculta a grupos no tiene API (investigación 2026-05; retomar
  oct-2026). `statusJidList` acepta contactos individuales, no grupos.

## 4. Recibos y estados

- **Grupos:** los acuses llegan por `message-receipt.update`, no por `messages.update` (ese sirve para 1:1). Con solo
  `messages.update`, 877 envíos marcaban 0 entregas. Cada participante acusa por separado.
- Estados útiles: `accepted` (SERVER_ACK), `delivered` (DELIVERY_ACK), `read`. Que un mensaje llegue a `accepted` y nunca a `delivered`
  con 479 es sesión corrupta (§1), no un bloqueo.
- **`Media upload failed on all hosts` = el mensaje NO salió.** Trátalo como pendiente y reintenta. Solo un timeout **posterior** al
  envío es ambiguo: marca `uncertain` y exige resolución manual de ese grupo para no duplicar anuncios.
- Recuperación por causa: fallo de red previo al envío = reintento automático (3 veces con backoff) sin cortar el lote.

## 5. Pruebas

- **Nunca pruebes entrega contra el número de la propia cuenta** (self-chat): salta el mecanismo de privacidad (tctoken/reach-out) y
  se queda en `accepted` aunque llegue. Verifica `creds.json -> me.id / me.lid` y usa un número externo para validar ACK.
- Un endpoint de prueba debe aceptar un solo número individual (nunca grupos), pedir confirmación y estar bloqueado mientras el
  worker envía.
- Verifica un envío real con `deliveryStatus: 'delivered'`, no solo `'accepted'`.

## 6. Persistencia y servidor

- `better-sqlite3`: **`db.prepare()` dentro de una transaction activa lanza error**. Prepara los statements antes de abrirla.
- Scheduler serial con lease en SQLite para no duplicar el envío si dos procesos arrancan.
- Respalda la carpeta de sesión antes de cualquier limpieza; nunca la guardes en git (ver `.env` y `.gitignore`).
- El transporte de cola a escala (BullMQ, Redis) vive en la skill `background-jobs`; la API HTTP en `express-api`.

## Skills relacionadas
`background-jobs` (colas y anti-ban a escala), `express-api` (API y auth), `deployment` (systemd, VPS).
