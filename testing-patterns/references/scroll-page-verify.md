# Verificar páginas con scroll (scrollytelling, sticky, video scrub)

Una página con scroll no tiene un estado: cada posición es otro frame y los fallos viven entre los dos que miraste.
Extraído de `scroll-craft/references/verify.md` (nateherk, MIT), sin depender de su motor.
Su `shoot.mjs` completo (`~/.claude/skills/scroll-craft/scripts/`) **solo funciona con markup `data-sc-*`**; aquí van los principios reutilizables.

## Setup que ahorra una pasada

- **Sirve la página** (`http://localhost`), nunca `file://`: bloquea el fetch de Blob y la página cae a posters en silencio, sin probar nada.
- **Chrome real, no Chromium de Playwright**: Chromium viene sin decoder h264, los clips no pintan y el run "pasa" contra posters.
  Con `playwright-core`: `chromium.launch({ executablePath: '/usr/bin/google-chrome' })` (o Brave).
- **Confirma que el puerto sirve TU build** antes de confiar en el reporte: si algo ya ocupaba el puerto, el servidor de fondo falló
  con `EADDRINUSE` en un log que nadie lee y el arnés fotografía otro sitio. `curl -s :PORT | grep -o "<title>.*</title>"` y un
  `curl -w "%{http_code}"` a un asset conocido (un 404 es el tell más rápido).

## Qué recorrer

Fotografía por **sección/acto** (≈6 posiciones cada una), no uniforme por documento: el muestreo uniforme mueve todas las
posiciones al cambiar cualquier altura y los hallazgos aparecen y desaparecen. Hazlo en tres contextos:
desktop (1440×900), móvil (390×844) y `reducedMotion: 'reduce'`. Une los frames en una hoja de contacto y **mírala**:
una carpeta de PNG no se revisa lado a lado.

## Qué detectar

| Hallazgo | Cómo |
|---|---|
| **Scroll muerto** | Posiciones consecutivas donde nada cambió (ni opacidad, ni transform, ni `currentTime`, ni rail). El lector gira la rueda y no recibe nada: acorta el tramo o agrega un cue |
| **Clip congelado** | Stage visible, el usuario scrollea y el `currentTime` no se mueve (incluye entrada y salida del sticky, no solo el pin). Cada frame individual se ve correcto |
| **Elementos que nunca llegan a opacidad 1** | Ventana de cue demasiado estrecha. Para texto partido por líneas, mide el span interno, no el contenedor |
| **Rail que no desborda** | Mide `scrollWidth - innerWidth`; un carrusel horizontal de 1368 px en viewport de 1440 px recorre 0 y todo "pasa" |
| **Errores de consola / requests fallidos** | Un 404 en un clip degrada a poster y se ve bien |
| **Contraste** | Ver abajo |

### Contraste sobre la página compuesta (no sobre el video fuente)

1. Oculta el texto (`visibility:hidden`), re-fotografía el mismo frame y muestrea el fondo real bajo cada línea.
2. **La dirección se elige por línea**: texto claro falla contra el parche más claro; texto oscuro sobre fondo claro, contra el más oscuro.
   Evaluar todo contra el más claro es la lectura más permisiva y deja pasar páginas high-key que fallan.
3. Recorta el rect al viewport (lo que ya salió por arriba no está detrás de nada visible).
4. Oculta también el chrome fijo: una barra fija pinta *delante* de lo que pasa por debajo.
5. **El scrim debe ser hermano del texto, nunca hijo ni `::before` del bloque**: `visibility:hidden` oculta los pseudo-elementos y el
   test califica contra el video crudo. Tell: refuerzas el scrim y el número no cambia ni en el segundo decimal → deja de ajustar y revisa qué se está componiendo.
6. Umbrales: <3:1 falla, 3–4.5 delgado (aceptable en texto grande, no en un caption de 16 px). Texto con opacidad <0.85 suele quedar fuera: revísalo a ojo.
7. Un fade-out que cae entre dos muestras deja un titular a medias: acorta la rampa, no subas el muestreo.

## Lo que ningún arnés dice (mirar la hoja de contacto)

Si la composición es buena (texto sobre la zona más cargada, sujeto cortado), si el movimiento es parejo (lurches, reversas, pausas)
y si la página significa algo.

## Pasadas manuales

- **Reduced motion:** debe ser comprensible *y alcanzable*. Un rail con `transform:none` queda en su primera pantalla y el contenido
  pasado el pliegue desaparece sin que nada lo reporte. Verifica que sigue habiendo scroll nativo.
- **Teclado:** el orden de foco coincide con el visual, el anillo se ve sobre cada fondo y nada enfocable queda a opacidad 0.
  En un stage `sticky` el control ocupa una sola posición de viewport durante todo el tramo: al enfocarlo, lleva el scroll al
  progreso donde su cue ya está abierto (no basta `scrollIntoView`).
- **Móvil real:** pinned con `100svh` (la barra de URL no causa salto), copy sin chocar con la barra fija, targets táctiles
  grandes. Headless no reproduce decoder iOS, Low Power Mode ni touch; ver `web-animations/references/scroll-scrub-video.md` §3
  y `scrub-device-diag.html`.

## Fallos que se miden pero no se ven

| Síntoma | Causa |
|---|---|
| Titular de hero en 6 líneas en móvil | `max-width` en `ch` sobre el **contenedor**: `ch` usa el font-size del contenedor, no del h1. Baja un escalón la tipografía del hero bajo ~700 px |
| Texto centrado desplazado a la izquierda | `inset-inline` declarado después de `left:50%` (el shorthand resetea `left`) |
| Sticky que nunca se fija, en silencio | Una regla del autor pone `position` en el stage |
| Titular de un acto pintado sobre la sección siguiente | Cues congelados en su último valor al salir de rango |
| Wipe `clip-path` que come ascendentes/descendentes | `line-height < 1`: `clip-path` es relativo al border box |
| Imagen 3× más alta de lo esperado | Se sobreescribió `width` en CSS pero `height` sigue resolviendo del atributo HTML: sobreescribe ambos o ninguno |
| Sección invertida con su tinta vieja | Se redefinió una variable de color en el subárbol sin reasignar `color` |
| Pin con `span ≤ 1` (cues saltan de 0 a 1) | 1 px de recorrido: el mínimo útil de un pin es ~1.2 viewports |
