# Catálogo de efectos — fichas

Leyenda: **Se ve** = lo observado en el video de referencia · **Úsalo** = caso de tu trabajo · **Bloques** = nombres del catálogo de HyperFrames (`catalog --query`) a fijar; si dice «a medida» no hay bloque equivalente y se construye con tokens de marca · **Receta** = prompt base (cambia lo que va en [corchetes]) · **Ojo** = riesgo.
Todas las recetas asumen 1080×1920, 30 fps y el esqueleto de SKILL.md; añade siempre «sin narración» o «sin audio» según corresponda.

---

## A. Números, etapas y progreso

### Splitflap
**Se ve**: tablero de aeropuerto de 8 celdas; las letras voltean pasando por caracteres intermedios hasta formar cada frase; contador 01/03…03/03 y un subtítulo mínimo.
**Úsalo**: «12 SEMANAS → 7 ÁREAS → 180 REACTIVOS» (UNICL), «HORARIO / ENTRADA / SALIDA» (Jornada), días y horas de un curso.
**Bloques**: `split-flap-board`.
**Receta**: «Tablero split-flap oscuro centrado, 8 celdas. Beat 1 (0–2 s): voltea a "[12 SEMANAS]". Beat 2 (2–4 s): "[7 ÁREAS]". Beat 3 (4–6 s): "[180 PREGUNTAS]". Cada volteo pasa por letras intermedias y cae con un clic; contador 01/03. Debajo, una línea Inter pequeña: "[subtítulo]". Fondo navy con viñeta.»
**Ojo**: en 1080×1920 el bloque oficial (1920×1080 nativo, 12 celdas por defecto) se corta: probado, hay que reducir `cellCount` (≤ 6 por fila) y reescribir tamaños en `compositions/split-flap-board.html`, o apilar dos tableros; mayúsculas, sin acentos.

### Glass-tasks (checklist que se marca)
**Se ve**: tarjeta de vidrio con 5 tareas; estado en cola → trabajando → hecho con palomita, barra segmentada y contador 0/5 → 5/5, píldora final.
**Úsalo**: requisitos de registro (CURP, INE, certificado de secundaria, carta de autenticidad…), onboarding de Jornada, «qué incluye» de un paquete.
**Bloques**: `marker-checklist-card`, `success-check`, `micro-transitions`, `conic-progress-ring`, `mk-progress-stat`.
**Receta**: «Tarjeta glass centrada "[Título]" con [5] filas: [lista]. Cada fila pasa de gris a "en proceso" y a palomita [coral] a 0.9 s de la anterior, solapadas; barra segmentada arriba y contador [0/5→5/5]. Al terminar, píldora "[Listo]" y la tarjeta se queda quieta.»
**Ojo**: los ítems son los reales del trámite; verifica contra la guía oficial antes de publicar.

### Rail (índice lateral que sigue el hilo)
**Se ve**: panel oscuro a la derecha con 12 pasos; el activo se resalta mientras avanza el relato; botón de cierre.
**Úsalo**: temario de 12 semanas mientras se muestran las áreas; pasos de un proceso (cotizar → pagar → entregar).
**Bloques**: a medida (`lt-*` para el estilo de tarjeta; `count-up` para el contador).
**Receta**: «Panel vertical a la derecha (x 700–1000) con "[Título]" y [12] pasos en Inter 28 px; el paso activo se ilumina en [coral] y el panel hace scroll suave. Escenas del centro cambian con cada paso.»

### Streak (cuadrícula de constancia)
**Se ve**: pared de cuadritos estilo GitHub que se llena de naranja, contador gigante «DAYS IN A ROW» subiendo 0→365.
**Úsalo**: semanas de estudio completadas, días de asistencia en Jornada, publicaciones del mes. **Solo con datos reales.**
**Bloques**: `count-up`, `number-wheel`, `mk-progress-stat`; la cuadrícula a medida.
**Receta**: «Cuadrícula [12×7] de celdas redondeadas que se enciende por filas con un degradado [coral→dorado] mientras el contador sube de 0 a [N] con ease-out; etiqueta pequeña "[semanas completadas]".»

### Labels (fichas numeradas que se apilan)
**Se ve**: fichas "01 Idea / THE SPARK", "02 Script"… aterrizan una sobre otra, cada una de color distinto, y se van volando.
**Úsalo**: servicios de Apolo Tek (Diseño · Desarrollo · Hosting · Soporte), pasos del método.
**Bloques**: `notification-stack`, `spring-stack-shuffle`, `lt-color-block`.
**Receta**: «[5] fichas redondeadas con número, título y subtítulo, colores de la paleta de marca, caen apiladas centradas con overshoot suave, 0.25 s entre cada una; salen en bloque hacia arriba.»

### Receipt (ticket de cotización)
**Se ve**: una impresora genera un ticket con título, ítems numerados con «OK», línea TOTAL, código de barras y «THANK YOU».
**Úsalo**: cotización visual («Sitio web · Hosting · Soporte → TOTAL $X»), resumen de paquete.
**Bloques**: a medida (`number-wheel` / `count-up` para el total).
**Receta**: «Impresora [oscura] arriba; sale un ticket de papel dentado con "[Cliente] — Cotización", ítems [01–05] con precio, línea TOTAL "[$X]" que cuenta hasta su valor, código de barras y "Gracias". Fuente monoespaciada.»
**Ojo**: precios exactos y vigentes; sin IVA/descuentos inventados.

### Tiers (tabla S/A/B/C)
**Se ve**: panel glass con filas S/A/B/C; fichas caen en su fila al nombrarlas, contador «3/3 ranked».
**Úsalo**: priorizar áreas del examen, recomendar planes (básico/pro), ranking de tareas.
**Bloques**: a medida.
**Receta**: «Tabla de 4 niveles (colores de marca); [3] fichas "[…]" caen en su fila una por una con rebote ligero; contador arriba "[n]/[3]".»
**Ojo**: el ranking debe tener criterio real, no decorativo.

---

## B. Canal de ventas (WhatsApp)

### Peel (el video llega a un chat)
**Se ve**: una página se despega y el clip queda dentro de un chat tipo WhatsApp; aparece «typing…», llega la respuesta y botones de respuesta rápida.
**Úsalo**: mostrar cómo responde el negocio («Hola, quiero informes» → respuesta en 5 s + botones Planes/Horarios/Ubicación).
**Bloques**: `chat-thread`, `chat-message`, `typing-indicator`, `thread-message-stack`, `torn-paper-rip` (para el despegue).
**Receta**: «Pantalla de chat [verde genérico, sin logotipo] con encabezado "[Negocio]". Beat 1 (0–2 s): burbuja entrante "[pregunta]". Beat 2 (2–3 s): typing. Beat 3 (3–6 s): respuesta "[texto]" y 3 botones de respuesta rápida. Beat 4: CTA "[Escríbenos]" + número.»
**Ojo**: mockup genérico; no usar el logotipo de WhatsApp ni simular conversaciones reales de personas.

### Memo (nota de voz enviada)
**Se ve**: barra de grabación con onda en vivo y contador 0:00→0:05; termina como burbuja de audio «Delivered ✓✓».
**Úsalo**: «Te mandamos un audio con tu diagnóstico», recordatorios, bot de voz.
**Bloques**: a medida (`success-check`).
**Receta**: «Barra de grabación arriba con punto rojo, onda animada determinista y contador; al llegar a [0:05] se contrae en burbuja de audio con doble palomita.»

### Call (notificación-llamada)
**Se ve**: píldora tipo llamada entrante cae desde arriba con botones rojo/verde, se declina y queda «declined».
**Úsalo**: «cliente llamando / pedido nuevo / recordatorio de turno».
**Bloques**: `liquid-glass-notification`, `native-notification-pop`, `notification-stack`.
**Receta**: «Banner de vidrio cae desde arriba: "[Título] — [subtítulo]" con dos botones; a los 2 s se resuelve a "[estado]" y se encoge a píldora.»

### Queue (programado)
**Se ve**: tarjetas verticales vuelan a una notificación «Scheduling 8 Shorts» con barra de miniaturas que se llena y check verde.
**Úsalo**: WA Group Poster / publicaciones programadas («8 publicaciones programadas»).
**Bloques**: `notification-cascade`, `notification-stack`, `success-check`.
**Receta**: «[8] tarjetas con las piezas reales vuelan a una cápsula "Programando [8] publicaciones · [lunes–viernes 9:00]"; la barra se llena y termina en check verde.»

---

## C. CTA y búsqueda

### Comments (palabra clave → comentario)
**Se ve**: caja de comentario; la palabra clave vuela en 3D, cae a la caja, se «teclea» y se publica; llega la respuesta del creador.
**Úsalo**: «Escribe CENEVAL por WhatsApp y te mandamos el temario».
**Bloques**: `yt-comment-card`, `typewriter`.
**Receta**: «Caja de comentario glass; la palabra "[CENEVAL]" en letras 3D cae sobre ella, se teclea y se publica con botón [coral]; respuesta debajo: "[Te lo mandamos por mensaje]". CTA final con número.»
**Ojo**: sin likes ni usuarios inventados; la respuesta es del propio negocio.

### Search (barra de búsqueda + teclado)
**Se ve**: barra de búsqueda glass; teclado iOS teclea «zoom in on my face» con sugerencias; Enter y se ejecuta.
**Úsalo**: Google Ads («preparatoria abierta Querétaro» → tu anuncio), «¿cómo registro mi checador?».
**Bloques**: `ai-chat-reveal`, `typewriter`, `streaming-text`.
**Receta**: «Teclado y barra de búsqueda genéricos; se teclea "[consulta]" con sugerencias; Enter; la pantalla resuelve a una tarjeta de resultado con el nombre del negocio, "[anuncio]" y botón.»
**Ojo**: genérico, sin marcas de buscadores; no mostrar posiciones que no se tengan.

---

## D. Titulares y tipografía

### Stack (titular cinético sans + serif)
**Se ve**: cada palabra llega de una dirección distinta, mezclando sans grueso blanco y serif cursiva coral, y se traba en un bloque apilado; el bloque entero sale al cambiar la frase.
**Úsalo**: gancho de 2–3 frases («Prepara tu examen / CENEVAL / en 12 semanas»), subtítulos de narración.
**Bloques**: `caption-kinetic-slam`, `kinetic-type-swap`, `kinetic-center-build`, `variable-axis-type`.
**Receta**: «Titular en bloque centrado: palabras clave en Inter 800 mayúsculas blanco, conectores en Playfair cursiva [dorado]; entran desde 4 direcciones con blur de movimiento (6–12 px) y se alinean; hold 0.5 s + 0.3 s por palabra; salida de bloque en 0.2 s.»

### Shatter / Neon / Gravity / Glyph / Ink (titulares de impacto)
**Se ve**: Shatter: palabra 3D blanca que se rompe en esquirlas · Neon: letras de neón azul/rosa que parpadean sobre fondo oscuro · Gravity: palabra gigante cae letra por letra y rebota · Glyph: video dentro de letras gigantes y la cámara vuela a través · Ink: corte cómic con rayas radiales y palabra golpeando en banda negra.
**Úsalo**: un solo golpe de énfasis por video (ofertas, «ÚLTIMOS LUGARES» real, nombre de marca).
**Bloques**: `vfx-shatter`, `caption-neon-glow`, `caption-neon-accent`, `texture-mask-text`, `svg-mask-reveal`, `halftone-dissolve`.
**Receta (ejemplo Glyph)**: «Pantalla [coral] con kicker "CAP. 02 · [tema]"; palabra "[SEMANAS]" a 60–90 % del ancho con el video/foto reproduciéndose dentro de las letras; la cámara avanza a través de la letra y aterriza en la siguiente escena.»
**Ojo**: usar uno; Gravity y Shatter compiten con la legibilidad en 15 s.

---

## E. Transiciones y cambios de sección

### Iris + tarjeta de capítulo
**Se ve**: el clip se cierra en iris hacia un degradado granulado naranja-rosa-morado; «PART TWO» y texto serif cursivo aparecen palabra por palabra.
**Úsalo**: separar bloques («Parte 2 · Las 7 áreas»), marcar capítulos.
**Bloques**: `iris-reveal`, `sdf-iris`, `mesh-gradient-bg`, `mesh-gradient`, `grain-overlay`.
**Receta**: «Iris que se cierra en 0.5 s desde [el centro] hacia un fondo mesh [navy→azul→dorado] con grano; kicker "[PARTE 2]" Inter 28 px espaciado ancho y frase en Playfair cursiva revelada por palabra (0.1 s). Hold ≥ 1.2 s.»

### Match-cut (ráfaga de estilos con una palabra fija)
**Se ve**: 5 diseños de página muy distintos (periódico, póster suizo, terminal, afiche vintage, revista) en ~0.7 s cada uno con la MISMA palabra al centro.
**Úsalo**: «una marca, cinco estilos» (portafolio Apolo Tek con el logo del cliente fijo), pitch de rediseño.
**Bloques**: `type-match-cut`, `match-cut`.
**Receta**: «Ráfaga de 5 pantallas de 0.7 s con estilos [periódico / póster / terminal / retro / editorial]; el nombre "[Cliente]" queda en el mismo punto central en todas y cambia de tipografía y color; corte en el pico del movimiento.»

### Doors / Rip / Zoom-through / Rabbit-hole / Portal
**Se ve**: Doors: póster tipográfico que se abre como dos puertas · Rip: hoja de libreta con pregunta→veredicto que se rasga · Zoom-through: empuje hacia un elemento que abre la siguiente toma · Rabbit-hole: pantallas anidadas en espiral con indicador DEPTH · Portal: marco brillante que se agranda hacia la cámara.
**Úsalo**: una sola transición «con causa» entre escenas (el elemento que sale es el que entra).
**Bloques**: `torn-paper-rip`, `iris-reveal`, `cinematic-zoom`, `whip-pan`, `cross-warp-morph`, `camera-dolly-zoom`.
**Receta (Rip)**: «Hoja de libreta cae con "¿[Pregunta]?", polaroid con clip, dos casillas; se marca ✓ "[Respuesta]" y se tacha la otra; la hoja se rasga por el centro revelando la siguiente escena.»

---

## F. Antes / después y elección

### Before-After
**Se ve**: barra de luz vertical barre; izquierda «RAW» plano, derecha «GRADED» terminado; termina todo en «after».
**Úsalo**: rediseño de sitio/flyer del cliente, foto sin/con retoque, proceso manual vs Jornada.
**Bloques**: `comparison-split`, `grade-split-reveal`.
**Receta**: «Misma pieza dos veces: izquierda "[ANTES]" ([captura vieja]), derecha "[DESPUÉS]" ([nueva]); barra de luz barre de izquierda a derecha en 1.6 s y termina cubriendo todo con "DESPUÉS".»

### Proofs (hoja de contactos y «KEEPER»)
**Se ve**: hoja «SELECTS» con 12 cuadros de película; lápiz graso tacha 11 y encierra uno con sello «KEEPER».
**Úsalo**: presentar propuestas de logo/diseño al cliente y elegir una.
**Bloques**: `freeze-frame-dressing`, `hw-boil`, `marker-highlight`; hoja a medida.
**Receta**: «Hoja de contactos oscura con [12] opciones reales; trazos rojos tachan las descartadas (boil a 12 fps) y se encierra "[la elegida]" con sello "ELEGIDA".»

### Purge (de varias herramientas a una)
**Se ve**: bandeja «EDIT MODE · 5 apps»; los íconos tiemblan y se eliminan uno a uno hasta «WHAT STAYS · 1 skill».
**Úsalo**: «Excel + WhatsApp + papel → Jornada»; «5 apps → una».
**Bloques**: a medida (`micro-transitions`, `success-check`).
**Receta**: «Bandeja con [5] íconos de herramientas genéricas; tiemblan y se tachan de uno en uno cada 0.7 s; queda el ícono de "[Producto]" con la etiqueta "Lo que se queda".»

---

## G. Enseñar un sistema o una app

### Phone
**Se ve**: teléfono 3D que gira junto a la persona; la pantalla cambia de app a pantalla negra con texto que se apila.
**Úsalo**: Jornada (pantalla de registro, foto+GPS), sitio web del cliente, chat de WhatsApp.
**Bloques**: `device-frame-stage`, `multi-device-splay`, `parallax-device-dive`, `vfx-iphone-device`.
**Receta**: «Teléfono centrado sube desde abajo, rota 12° y muestra [captura 1]; a 2 s la pantalla cambia a [captura 2] con un deslizamiento; a 4 s la cámara se empuja a través de la pantalla hacia [escena].»

### Interface (la app se construye sola) · Glass-hud · Glass-switches
**Se ve**: barra de prompt con progreso 0→100 %, paneles de vidrio con checks, contadores circulares, chips y un interruptor «Auto-apply» que se enciende.
**Úsalo**: dashboard de Jornada armándose, panel de «qué incluye» donde las áreas se iluminan al mencionarse.
**Bloques**: `liquid-glass-widgets`, `liquid-glass-notification`, `ios26-liquid-glass`, `conic-progress-ring`.
**Receta**: «Fondo [captura desenfocada]; entran [3] widgets de vidrio: contador circular "[22→24]", chips "[Mat · Lengua · Inglés…]" que se encienden al nombrarlos, y un interruptor que pasa a verde; sin cubrir el texto principal.»

### Layers
**Se ve**: el cuadro se separa en capas 3D de vidrio en perspectiva y una se resalta con borde coral y título.
**Úsalo**: explicar la arquitectura de un producto (frontend / API / base de datos / hosting).
**Bloques**: `exploded-stack`, `camera-rig-depth-stack`.
**Receta**: «Captura de la app se divide en [4] capas con etiqueta ([UI · API · Datos · Hosting]); se resalta cada una 1 s con borde [coral] y el título "[…]"; al final se colapsan.»

### Editor · Crop · Dropzone
**Se ve**: pull-back para mostrar el clip dentro de un editor con timeline · cursor arrastra una caja de recorte con dimensiones · zona «Drop a take here» recibe un archivo que se vuelve reproductor.
**Úsalo**: demo de UI con cursor animado (subir archivo, recortar, registrar) y «así se ve por dentro».
**Bloques**: `agent-cursor`, `browser-device-stage`, `cursor-annotate`.
**Receta**: «Pull-back: la pantalla se encoge y aparece dentro de [navegador] con [timeline/panel]; un cursor con etiqueta "[Tú]" realiza [3] acciones con clic y rebote; resultado final con check.»

### Markup / Markup-doodle (anotación a mano)
**Se ve**: aro rojo dibujado a mano (con bucle y sobrepaso), nota manuscrita con flecha, check y subrayado doble; trazos «hierven» a 12 fps; luego se borra.
**Úsalo**: señalar el botón/campo exacto en una captura, resaltar un precio o un dato en un flyer.
**Bloques**: `marker-highlight`, `cursor-annotate`, `vox-annotate`, `hw-arrow`, `hw-boil`, `hw-underline`.
**Receta**: «Sobre la captura, un aro rojo se dibuja en 0.6 s alrededor de [elemento]; nota manuscrita "[texto]" con flecha curva y check; trazos con boil a 12 fps y sin glow; a los 3 s todo se borra.»

---

## H. Look de marca y editorial

### Collage / Rip papel
**Se ve**: hojas rasgadas en stop-motion a 4 fps (columna de periódico, hoja rosa, número grande) sobre papel granulado; palabras recortadas pegadas en distintas tipografías.
**Úsalo**: portada de campaña con foto real del cliente (estética riso).
**Bloques**: `paper-collage-reveal`, `torn-paper-rip`, `grain-overlay`.
**Receta**: «Fondo papel con grano [teal]; [4] hojas rasgadas aterrizan una a una (4 fps de jitter, sombras reales); la foto de "[cliente]" recortada como sticker con borde blanco; 3 palabras recortadas pegadas "[…]".»

### Double-exposure · Projector · Halftone · Nightfall
**Se ve**: retrato B/N tinta con otra toma dentro y título serif («PLATE N° 2») · tira de película con perforaciones, «PROJ 24 FPS» · pantalla de puntos coral que emerge de negro · una línea baja por el cuadro y todo pasa a noche.
**Úsalo**: marcas premium o con historia (pediatría, rancho, agave): «nuestra historia», antes/después de día a noche en un local.
**Bloques**: `halftone-dissolve`, `halftone-field`, `organic-light-leak-overlay`, `grain-overlay`.
**Receta (Projector)**: «Foto/video del cliente dentro de tira de película vertical con perforaciones, números de fotograma y gate-weave ligero; tono cálido; corta a imagen limpia a los [5] s.»

### Swatch (paleta desde la foto)
**Se ve**: lupa con hex lee 4 colores del cuadro (pared, lienzo, camisa, piel), cada uno cae a una bandeja «PALETTE»; un interruptor GRADE re-gradúa todo con esa paleta.
**Úsalo**: presentar la identidad visual de un cliente a partir de su local/producto.
**Bloques**: a medida + gradación (`/media-use`: `media-treatment`).
**Receta**: «Lupa recorre [4] puntos de la foto "[cliente]"; cada toque suelta una muestra con su hex real a la bandeja; interruptor GRADE y toda la foto se regradúa con esa paleta; al final aparece el logo.»

---

## I. Tecnología

### ASCII · Prompt/Terminal · Keycaps
**Se ve**: barra de luz convierte el cuadro en retrato ASCII cian con una línea de terminal tecleando · app de chat que teclea lo que se dice · teclas 3D que llueven.
**Úsalo**: contenido para desarrolladores (Apolo Tek), «cómo se hizo», demo de bot.
**Bloques**: `ascii-trail-reveal`, `ascii-render-pass`, `terminal-simulator`, `code-terminal-run`, `ai-chat-reveal`, `claude-exchange`.
**Receta**: «Barra de luz barre y la [foto del producto] pasa a render ASCII [cian sobre navy]; abajo una línea de terminal teclea "[comando]"; vuelve a color.»

---

## J. Subtítulos con voz (si hay narración)

### Pop / Screenplay
**Se ve**: Pop: frases en minúsculas a la altura del pecho, cada palabra salta con overshoot y parpadea coral→blanco, una palabra-sticker · Screenplay: página de guion con el texto resaltado en verde al decirse.
**Úsalo**: testimonios o instrucciones locutadas; lectura guiada.
**Bloques**: `caption-pill-karaoke`, `caption-highlight`, `caption-gradient-fill`.
**Receta**: «Subtítulos con las palabras exactas del audio, 2–4 palabras por línea, salto con overshoot 0.7 de amortiguamiento y resalte [dorado] en la palabra activa; la palabra "[clave]" como sticker grande.»

---

## Requiere persona (sólo si te grabas hablando a cámara)

Necesitan recorte de la persona, rastreo de cara o de mano y transcripción (`hyperframes transcribe`); no verificado en este equipo (GPU Radeon 680M, sin PyTorch). Referencia rápida de qué hace cada uno y su bloque más cercano:

| Efecto | Qué hace | Bloque cercano |
|---|---|---|
| Camcorder | visor REC con punch-in y brackets de cara | `camcorder-hud` |
| Clones | 10 copias detrás en filas escalonadas | — |
| Orbit | tarjetas giran alrededor de la cabeza (detrás/delante) | `carousel-orbit-*` |
| Ring | anillo de texto girando sobre la cabeza | — |
| Sandwich | palabra gigante detrás + serif delante | `caption-parallax-layers` |
| Scribble | contorno de neón que «hierve» | `hw-boil` |
| Vertigo | dolly zoom con la cara fija | `camera-dolly-zoom` |
| Glass-tag | etiqueta que sigue la punta del dedo | — |
| Labels sobre cabeza, Feed, Neon detrás, Breakout, Clippings, Banknote, Double-exposure con retrato | elementos alrededor de la persona recortada | `caption-parallax-layers`, `freeze-frame-dressing` |

**Ojo con Clippings** (noticias inventadas) y **Banknote** (billete): no usar con clientes por riesgo de desinformación o imitación de moneda.
