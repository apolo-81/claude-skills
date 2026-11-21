# Catálogo de efectos: fichas

Lee **una** ficha (`grep -n "### <Nombre>"`). Formato de cada una:

- **Mecánica**: qué pasa en pantalla, sin rótulos del paquete original.
- **Úsalo**: en qué trabajo tuyo sirve.
- **Bloque**: verificado con `catalog --json` el 2026-11-20. `C` = component (sin tamaño, se adapta); `B 16:9` = block 1920×1080 (recomponer para vertical); `B 9:16` = block vertical nativo; «a medida» = no hay bloque que lo haga.
- **Receta**: tiempos para 1080×1920 y 30 fps.
- **Mín.**: duración mínima con lectura (0.5 s + 0.3 s por palabra; ver `motion.md`, Holds).
- **Ojo**: riesgos.

Las reglas generales de movimiento, transiciones, zona segura y lectura están en la skill oficial; aquí no se repiten.

Índice:

- A. Números y progreso: Splitflap, Clock, Rail, Checklist, Streak, Labels, Receipt, Tiers
- B. Canal (WhatsApp): Chat, Memo, Call, Queue
- C. CTA: Comments, Search
- D. Titulares: Stack, Impacto
- E. Transiciones: Carry, Pill-to-card, Iris, Match-cut, Rip, Zoom-through
- F. Antes y después: Before-After, Proofs, Purge
- G. Sistemas: Phone, Interface, Layers, Editor, Markup
- H. Look: Collage, Editorial, Swatch
- I. Tecnología: ASCII, Terminal, Keycaps
- J. Subtítulos con voz: Captions

---

## A. Números, etapas y progreso

### Splitflap
**Mecánica**: tablero de salidas; cada celda voltea pasando por caracteres intermedios hasta la frase; un subtítulo corto debajo.
**Úsalo**: «12 SEMANAS → 7 ÁREAS → 180 REACTIVOS» (UNICL); «ENTRADA / SALIDA» (Jornada); horarios de un curso.
**Bloque**: `split-flap-board` (B 16:9). Comprobado en el código: **un texto por instancia**, centrado, tambor que siempre arranca en la posición 0, geometría fija a 1920 (`cw = (1920 − 240 − …)/cellCount`) y alfabeto sin `Á`. Sirve para una sola palabra en horizontal. Para vertical o para varias frases seguidas, usa el tablero a medida de `/home/apolo/Documents/Projects/clients/unicl/plan-ceneval-12-semanas/audit-opus/video-v3/tools/build.py`.
**Receta (a medida, vertical)**:
- 2 filas × 9 celdas de 88 × 132 px con 6 px de separación (840 px de ancho, 78 % del lienzo); Space Mono 700 a 100 px; texto **centrado** por fila.
- Cada celda llega a su destino con **≤ 6 volteos** (≤ 3 si va a espacio), saltando antes en silencio; 0.05 s por volteo y 0.035 s de desfase entre celdas. Así se asienta en unos 0.65 s y no se ven caracteres basura.
- Cambio de frase cada 2.2–2.6 s; el subtítulo entra 0.25 s después del volteo, con Inter 700 a 46 px y 2–4 palabras.

**Mín.**: por fase, unos 0.65 s de volteo más 0.5 s + 0.3 s × (palabras del tablero + del subtítulo). Tres fases con subtítulo ≈ 7.5–8 s.
**Ojo**:
- Las letras viven en `attr(data-char)` + `::before`, y GSAP convierte `" "` en `0` al animar `attr`: usa `~` y ocúltalo por CSS.
- Mete `Á` en el tambor si hay acentos.
- **`check` no ve este texto** (`line_unread` no salta): la lectura se comprueba con la tabla de `SPEC.md`.
- Clics del sonido con `click-soft` en 3 tomas, a ≤ −12 dB respecto de los golpes.

### Clock
**Mecánica**: una aguja recorre una esfera cuyos segmentos son etapas; al llegar a cada una, se ilumina su etiqueta.
**Úsalo**: ruta de 12 semanas como reloj de 12 horas (una semana por hora); fases de un proyecto.
**Bloque**: a medida (SVG: arcos con `stroke-dashoffset` y aguja con `rotation`, lineal).
**Receta**: esfera de 720 px centrada en y = 860; 12 marcas; la aguja avanza 30° cada 0.25 s y se detiene en 3 hitos reales (diagnóstico, áreas, simulacros) con etiqueta Inter 700 a 44 px durante 1.2 s cada una.
**Mín.**: unos 4.5 s.
**Ojo**: los hitos salen del plan real; nada de «semana 12: aprobado».

### Rail
**Mecánica**: índice lateral; el paso activo se resalta mientras la escena central cambia.
**Úsalo**: temario por semanas; proceso cotizar → pagar → entregar.
**Bloque**: a medida (`lt-*` solo como estilo de tarjeta).
**Receta**: en vertical **no** va a la derecha (colisiona con el carril de TikTok y queda estrecho). Usa una franja horizontal arriba (y 300–420) con 4–6 pasos de 32 px; el activo pasa a oro en 0.15 s mientras la escena de abajo cambia.
**Mín.**: unos 1.5 s por paso.

### Checklist
**Mecánica**: tarjeta con 4–5 filas que pasan de en cola a resaltada y a palomita; barra segmentada y contador `n/N`; al final, una píldora «listo».
**Úsalo**: requisitos de registro, onboarding de Jornada, «qué incluye» un paquete.
**Bloque**: a medida, más `success-check` (C) si quieres la palomita animada. `marker-checklist-card` (C) solo si el look es **papel, plumón y Courier con 3 filas** fijas; no es una tarjeta de vidrio.
**Receta (v3)**:
- tarjeta **blanca opaca** de 900 × 740 px; rótulo Inter 700 a 30 px en azul; título Playfair 700 a 58 px; filas de 112 px con texto Inter 700 a 46 px al 38 % de opacidad hasta marcarse;
- marcar cada 0.53 s: resalte 0.2 s antes; palomita coral `back.out(1.7)` solo en escala; tramo de barra 0.3 s `power3.out`;
- contador en una píldora navy de 260 × 70 px a la derecha de la barra.

**Mín.**: 0.4 s de entrada + 0.53 s × N + 1.1 s de «listo». Con 4 filas ≈ 3.6 s (la lectura completa de unas 20 palabras pediría 6.5 s; está aceptado porque es una tarjeta informativa que se lee fila a fila).
**Ojo**: vidrio solo si la marca lo usa (`spec.md`, BANNED). Los documentos son los de la guía vigente y **distinguen mayores y menores de edad** (ACREDITA-BACH: mayores 4 documentos, menores 6). Cita la línea de la guía en `SPEC.md`.

### Streak
**Mecánica**: cuadrícula que se enciende por filas mientras sube un contador grande.
**Úsalo**: semanas completadas, asistencia en Jornada. **Solo con datos reales.**
**Bloque**: `count-up` (C), `number-wheel` (C); la cuadrícula, a medida. `mk-progress-stat` es B 16:9.
**Receta**: cuadrícula de 12 × 7 celdas de 56 px; se enciende una fila cada 0.12 s con degradado coral → oro; el contador sube de 0 a N en 1.6 s `expo.out`; etiqueta de 3 palabras.
**Mín.**: unos 3 s.

### Labels
**Mecánica**: fichas numeradas con título y subtítulo que caen y se apilan, cada una de un color.
**Úsalo**: servicios de Apolo Tek, pasos de un método.
**Bloque**: `notification-stack` (C), `spring-stack-shuffle` (C). `lt-color-block` es B 16:9.
**Receta**: 4–5 fichas de 860 × 150 px; caen con resorte de amortiguamiento 0.8 cada 0.25 s; salen juntas hacia arriba en 0.25 s `power3.in`.
**Ojo**: los «01 / 02» numerados están en la lista BANNED: úsalos solo si los pasos son secuenciales de verdad.

### Receipt
**Mecánica**: una impresora saca un ticket con ítems, TOTAL que cuenta hasta su valor y código de barras.
**Úsalo**: cotización visual, resumen de paquete.
**Bloque**: a medida; `count-up` (C) para el total.
**Receta**: ticket de 640 px de ancho que sale 0.9 s `power2.out` con borde dentado; 3–5 ítems en mono de 40 px cada 0.2 s; TOTAL Inter 900 a 72 px que cuenta en 0.8 s.
**Ojo**: precios exactos y vigentes, sin IVA ni descuentos inventados.

### Tiers
**Mecánica**: tabla de niveles; las fichas caen en su fila al nombrarlas; contador `n/N`.
**Úsalo**: priorizar áreas o recomendar planes, **con criterio real**.
**Bloque**: a medida.
**Receta**: 4 filas de 200 px a todo el ancho útil; cada ficha cae 0.35 s con resorte 0.8, una cada 0.6 s.

---

## B. Canal de ventas (WhatsApp)

### Chat
**Mecánica**: conversación en un teléfono: entra la pregunta, aparece «escribiendo…», llega la respuesta con botones rápidos.
**Úsalo**: «Hola, quiero informes» → respuesta → botones Planes / Horarios / Ubicación.
**Bloque**: **`message-thread-reveal` (B 9:16 nativo, el primero que hay que probar)**; `chat-thread`, `chat-message` y `typing-indicator` (C). `torn-paper-rip` (C) es un **rasgado** horizontal con *slots* `from`/`to`, no un despegue de página.
**Receta**: encabezado con el nombre del negocio; entrada 0–1.5 s; «escribiendo…» 1.5–2.3 s; respuesta 2.3 s; botones a 3 s; CTA con el número a 4 s.
**Mín.**: unos 5.5 s.
**Ojo**: verde genérico, **sin logotipo de WhatsApp**, sin conversaciones de personas reales.

### Memo
**Mecánica**: barra de grabación con onda y contador que termina en una burbuja de audio con doble palomita.
**Úsalo**: «te mandamos un audio con tu diagnóstico».
**Bloque**: a medida; `success-check` (C).
**Receta**: onda determinista (función de `t`, nunca `Math.random` sin semilla); contador de 0:00 a 0:05 en 1.5 s; se contrae en burbuja en 0.35 s.

### Call
**Mecánica**: un banner tipo llamada cae desde arriba con dos botones y se resuelve a un estado.
**Úsalo**: «pedido nuevo», «recordatorio de turno».
**Bloque**: `native-notification-pop` (C), `notification-stack` (C). `liquid-glass-notification` es B 16:9 **WebGPU** (no probado en este equipo).
**Receta**: banner de 920 × 200 px que cae 0.45 s `expo.out` hasta y = 320; a 1.6 s se encoge a una píldora con el estado.

### Queue
**Mecánica**: tarjetas que vuelan a una notificación de «programado», con barra que se llena y palomita.
**Úsalo**: WA Group Poster («8 publicaciones programadas»).
**Bloque**: **`notification-cascade` (B 9:16 nativo)**, `success-check` (C).

---

## C. CTA y búsqueda

### Comments
**Mecánica**: la palabra clave cae a una caja de comentario, se teclea y se publica; llega la respuesta del negocio.
**Úsalo**: «Escribe CENEVAL por WhatsApp y te mandamos el temario».
**Bloque**: `yt-comment-card` (B 16:9; imita YouTube, así que tómalo solo como referencia); `typewriter`.
**Ojo**: sin likes ni usuarios inventados.

### Search
**Mecánica**: barra de búsqueda con teclado; se teclea la consulta, Enter, y la pantalla resuelve en un resultado.
**Úsalo**: Google Ads («preparatoria abierta Querétaro» → tu anuncio).
**Bloque**: **`ai-chat-reveal` (B 9:16 nativo)**, `typewriter`, `streaming-text` (C).
**Ojo**: `story.md` §3: no abras el video tecleando; úsalo como paso a los 2 s o más. Genérico, sin marcas de buscadores ni posiciones que no tengas.

---

## D. Titulares

### Stack
**Mecánica**: cada palabra llega de una dirección distinta, mezclando sans grueso y serif itálica, y se traba en un bloque apilado.
**Úsalo**: gancho de 2–3 líneas.
**Bloque**: **a medida** (ver `/home/apolo/Documents/Projects/clients/unicl/plan-ceneval-12-semanas/audit-opus/video-v3/compositions/s1.html`). `caption-kinetic-slam` (C) **no** sirve: muestra una palabra a la vez al centro, guiada por transcripción, en Anton desde Google Fonts y a 1920. `kinetic-center-build` y `kinetic-type-swap` (C) solo como inspiración.
**Receta (v3)**:
- **las palabras clave ya están en el cuadro 0** (miniatura: «CENEVAL en 12 semanas»);
- los conectores entran desde 3–4 direcciones (±280 px, ±7°, desenfoque 14 → 0) en 0.42 s `power4.out`, 0.1 s entre una y otra;
- sans Inter 900 a 150 px (hasta 7 letras por línea en 1080); serif Playfair 700 itálica a 76–80 px.

**Mín.**: 0.5 s + 0.3 s × palabras desde que el bloque está completo.
**Ojo**: con 150 px, «CENEVAL» pasa del borde derecho de TikTok (aviso aceptado para Status).

### Impacto
Shatter, Neon, Gravity, Glyph e Ink.
**Mecánica**: palabra que se rompe en esquirlas · letras de neón que parpadean · palabra que cae letra por letra y rebota · video dentro de letras gigantes · corte cómic con rayas radiales.
**Úsalo**: **un** golpe de énfasis por video, con dato real (oferta, «Últimos lugares» si es verdad).
**Bloque**: `texture-mask-text`, `svg-mask-reveal`, `halftone-dissolve` (C). `vfx-shatter` es B 16:9 **WebGL** (no probado aquí). `caption-neon-glow` y `caption-neon-accent` (C) llevan glow, que está en la lista BANNED.
**Receta (Glyph)**: palabra al 80 % del ancho con imagen o video dentro (máscara); empuje a través de la letra en 0.6 s `power3.in` hasta la escena siguiente.
**Ojo**: Gravity y Shatter compiten con la lectura en 15 s.

---

## E. Transiciones (todas con causa; tabla base en `motion.md`)

### Carry
**Mecánica**: el dato del gancho viaja y se vuelve el protagonista de la escena siguiente.
**Úsalo**: el «12» del titular cae al tablero (v3, 2.33–2.8 s).
**Bloque**: a medida.
**Receta**:
- calcula en Python el desplazamiento entre las dos posiciones (sin medir el DOM en tiempo de ejecución);
- el resto de palabras sale una por una (0.2 s, desenfoque 8 px, 0.025 s entre ellas) mientras el dato se mueve 0.42 s `power3.inOut` y escala a la medida destino;
- la escena siguiente arranca 0.2 s antes (hosts solapados en pistas distintas) y el dato cambia de tipo de letra con un desenfoque de 0.1 s.

### Pill-to-card
**Mecánica**: la píldora de estado crece hasta ser la tarjeta del cierre («object becomes the world»).
**Úsalo**: «4/4 · listo» → tarjeta de CTA (v3, 13.95–14.6 s).
**Bloque**: a medida (`clip-path: inset(...)`; nunca `left`/`top`, que `check` marca como error).
**Receta**:
1. La píldora pasa a oro en 0.15 s (el tono de esa esquina de la tarjeta final).
2. La escena del cierre empieza con la tarjeta recortada al rectángulo de la píldora y la abre en 0.65 s `power3.inOut`.
3. **El contenido entra mientras crece, empezando por lo que queda en la zona ya descubierta** (la píldora de WhatsApp a +0.12 s, el titular a +0.32 s).
4. La tarjeta de origen se desenfoca 15 px y se desvanece en 0.3 s.

**Ojo**: si el contenido entra al terminar el crecimiento, la tarjeta queda vacía (defecto de v2, 13.6–14.0 s).

### Iris
**Mecánica**: el plano se cierra en círculo hacia una tarjeta de capítulo; la frase aparece palabra por palabra.
**Úsalo**: separar partes («Parte 2 · Las 7 áreas»).
**Bloque**: `iris-reveal` (C, con `clip-path`). `sdf-iris` es B 16:9 con shader.
**Receta**: iris de 0.5 s hacia un **color sólido de marca con grano del 5 %** (no mesh: `spec.md`, BANNED); rótulo de 30 px y frase Playfair revelada por palabra cada 0.07 s; reposo ≥ 1.2 s.

### Match-cut
**Mecánica**: ráfaga de 5 estilos de página con la misma palabra fija al centro.
**Úsalo**: «una marca, cinco estilos» (portafolio de Apolo Tek).
**Bloque**: `type-match-cut`, `match-cut` (C).
**Receta**: 5 pantallas de 0.6–0.7 s; corte en el cuadro más rápido; la palabra no se mueve ni un píxel.

### Rip
**Mecánica**: una hoja con pregunta y veredicto se rasga y deja ver la escena siguiente.
**Bloque**: `torn-paper-rip` (C; rasgado horizontal con *slots*).
**Receta**: rasgado de 0.7 s izquierda → derecha; la hoja de origen se levanta con una sombra que crece.

### Zoom-through
Ver «Zoom through a button» en `motion.md`; no se repite aquí.

---

## F. Antes / después y elección

### Before-After
**Mecánica**: una barra de luz barre y separa «antes» de «después»; al final queda todo en «después».
**Bloque**: `comparison-split`, `grade-split-reveal` (C).
**Receta**: la misma pieza dos veces; barrido de 1.6 s `power2.inOut`; etiquetas de 36 px.
**Ojo**: no compares contra un competidor con nombre (`story.md` §2).

### Proofs
**Mecánica**: hoja de contactos; se tachan las opciones descartadas y se encierra la elegida con un sello.
**Bloque**: `hw-boil`, `marker-highlight` (C); hoja a medida. `freeze-frame-dressing` es B 16:9.
**Receta**: 6–9 opciones reales en vertical (no 12); un tachón cada 0.25 s con boil a 12 fps; sello «ELEGIDA».

### Purge
**Mecánica**: bandeja con varias herramientas que tiemblan y se eliminan hasta que queda una.
**Úsalo**: «Excel + WhatsApp + papel → Jornada».
**Bloque**: a medida; `success-check` (C).
**Receta**: 4–5 íconos **genéricos** (sin logotipos), uno fuera cada 0.6 s; queda el producto con la etiqueta «Lo que se queda».

---

## G. Enseñar un sistema o una app

### Phone
**Bloque**: `device-frame-stage`, `multi-device-splay`, `parallax-device-dive` (C). `vfx-iphone-device` es B 16:9.
**Receta**: teléfono al 60 % del alto, sube 0.5 s `expo.out` y rota 8°; la pantalla cambia con un deslizamiento a los 2 s; empuje a través de la pantalla a los 4 s. Usa **capturas reales** (`capture`), nunca pantallas dibujadas.

### Interface
**Mecánica**: la app se arma sola: barra de progreso, paneles con checks, contador circular, interruptor que se enciende.
**Bloque**: `conic-progress-ring` (C). `liquid-glass-widgets` e `ios26-liquid-glass` son B 16:9 **WebGPU** y vidrio (BANNED salvo marca).
**Receta**: 3 widgets **opacos** sobre la captura real desenfocada; uno cada 0.3 s.

### Layers
**Bloque**: `camera-rig-depth-stack` (C). `exploded-stack` es B 16:9 **three.js**.
**Receta**: 4 capas etiquetadas, cada una resaltada 1 s.

### Editor
Editor, Crop y Dropzone.
**Bloque**: `agent-cursor`, `browser-device-stage`, `cursor-annotate` (C).
**Receta**: un cursor con etiqueta hace 3 acciones; rebote del clic de 0.12 s (`motion.md`: match cut en el rebote del clic).

### Markup
**Mecánica**: aro dibujado a mano, flecha y nota sobre una captura; los trazos «hierven» a 12 fps.
**Bloque**: `marker-highlight`, `cursor-annotate`, `vox-annotate`, `hw-arrow`, `hw-boil`, `hw-underline` (C).
**Receta**: aro de 0.6 s alrededor del elemento real; nota manuscrita de 3 palabras como máximo; se borra a los 3 s.

---

## H. Look de marca y editorial

### Collage
**Bloque**: `paper-collage-reveal`, `torn-paper-rip`, `grain-overlay` (C).
**Receta**: 3–4 hojas rasgadas que aterrizan a 4 fps (stop-motion) con la foto real del cliente como sticker.
**Ojo**: papel crema + serif + etiquetas mono está en la lista BANNED: úsalo solo si la marca es editorial.

### Editorial
Double-exposure, Projector, Halftone y Nightfall.
**Bloque**: `halftone-dissolve` (C). `halftone-field` y `organic-light-leak-overlay` son B 16:9. La gradación de material filmado se hace con el **comando** `npx -y hyperframes@0.9.72 media-treatment` (`/media-use`), no con filtros CSS.
**Úsalo**: marcas con historia (pediatría, rancho, agave).

### Swatch
**Mecánica**: una lupa lee colores reales de la foto y los deja en una paleta; luego se regradúa la foto.
**Bloque**: a medida + `media-treatment` (comando).
**Ojo**: hex medidos de la foto, no inventados.

---

## I. Tecnología

### ASCII
**Bloque**: `ascii-trail-reveal`, `ascii-render-pass` (C).

### Terminal
**Bloque**: `terminal-simulator`, `code-terminal-run` (C).

### Keycaps
**Bloque**: a medida (teclas 3D en CSS).

**Ojo** (para los tres): `claude-exchange` y `chatgpt-exchange` imitan productos con marca; no los uses en piezas de clientes.

---

## J. Subtítulos (solo si hay voz)

### Captions
**Bloque**: `caption-pill-karaoke`, `caption-highlight`, `caption-gradient-fill`, `caption-kinetic-slam` (C; `caption-kinetic-slam` está maquetado a 1920; los demás no se revisaron).
**Receta**: la oficial (`captions.md`); 2–4 palabras por línea en la franja inferior de la zona segura.
