# Video controlado por scroll (scrub)

Un clip pre-renderizado que avanza con la rueda: el scroll escribe el `currentTime`.
Extraído de la skill `scroll-craft` (nateherk, MIT; desactivada por defecto, `skill-toggle scroll on`).
Aquí solo va lo genérico, sin depender de su motor `data-sc-*`.

## 1. Codificar para scrubbing, no para reproducción

Un encode web normal pone un keyframe cada 2-5 s. Al hacer seek a un tiempo arbitrario el decoder
camina desde el keyframe anterior, así que el clip reproduce bien pero **se arrastra bajo la rueda**.
Solución: GOP denso (más peso, a cambio de respuesta).

```bash
bash ~/.claude/skills/web-animations/scripts/encode-scrub.sh in.mp4 out.mp4            # desktop 1080p, -g 8, crf 20
bash ~/.claude/skills/web-animations/scripts/encode-scrub.sh in.mp4 out-m.mp4 mobile   # móvil 720p, -g 4, crf 24
bash ~/.claude/skills/web-animations/scripts/encode-scrub.sh in.mp4 out.mp4 desktop 23 # crf manual (grano, humo, partículas)
```

- Quita el audio (`-an`): nunca se reproduce y es riesgo de autoplay policy.
- Exige un **ffmpeg completo**: un ffmpeg recortado (p. ej. el que trae Remotion) falla con
  `No option name near ...` en cualquier cadena de filtros y parece un error de sintaxis. El script
  cuenta filtros (>200) y busca uno bueno; override con `SCROLLCRAFT_FFMPEG`.
- Si el video viene de **Remotion**, renderiza primero y pasa el MP4 por este script; no ajustes el GOP en Remotion.
- Clips de móvil **en vertical (9:16) desde el master**. Un clip landscape en viewport portrait con
  `object-fit: cover` decodifica el cuadro completo y tira tres cuartas partes: se ve blando y se traba.
- Máximo ~2 clips scrub por página: es lo más pesado de la página y el tercero ya no sorprende.

## 2. Reglas de implementación (si lo escribes tú)

- **Nunca escribas `currentTime` 1:1 desde `scroll`.** Los wheel events llegan a ritmo irregular y el clip
  tartamudea. El scroll fija un *target*; un loop `requestAnimationFrame` camina hacia él
  (lerp ≈ 0.18 por frame; en reduced-motion, 1.0 = sin suavizado).
- **Deadband:** ignora escrituras menores a ~8 ms en desktop / ~20 ms en móvil (cuestan un seek y no se ven).
- **Coalesce seeks:** no encoles un seek mientras el anterior no resolvió (`seeking`), o un flick rápido congela el clip.
  Si `seeking` queda pegado >700 ms, reemite el seek.
- **Cargar como Blob** (`fetch → URL.createObjectURL`) permite seek sin depender de HTTP range requests.
- **Poster visible hasta que se pintó un frame real**, no solo `loadedmetadata`: en iOS un video mudo con
  seek pero sin `play()` previo queda en blanco.
- **Mapea el clip a TODA la vida visible del stage**, no solo al tramo "pinned". Un stage sticky está en pantalla
  un viewport *antes* y otro *después* del pin; si el clip usa el progreso del pin, queda congelado en el
  primer frame al entrar y en el último al salir, y el lector ve una foto fija deslizándose. Es el bug más
  caro y es invisible en capturas individuales.
- **`prefers-reduced-motion`:** no descargues el clip; deja el poster y el contenido visible.

## 3. iOS (lo que Chrome headless no reproduce)

- iOS no pinta un `<video muted playsinline>` que nunca se reprodujo: hay que "primar" con un `play()`/`pause()`.
- Primar **por clip** al `loadedmetadata`, y reintentar en `touchstart`, `touchend`, `pointerdown`, `click`, `scroll`.
  `touchend` importa: está en los eventos de activación del spec y `touchstart` no (Low Power Mode).
- Un prime de un solo disparo se gasta en el primer clip aún sin fuente (el hero, mientras descarga):
  síntoma exacto = "el primero congelado y los demás bien".
- iOS puede dejar `play()` pendiente o `seeking` en true para siempre: libera el flag con timer y reemite el seek.
- Reveal con timeout (~2.5 s), nunca solo en `seeked` (un clip ya en t=0 nunca hace seek).
- Para aislar el fallo en un teléfono real: `references/scrub-device-diag.html` (misma carpeta). Edita el array
  `TESTS`, súbela junto al sitio y una captura del teléfono dice si falla el blob, el archivo, el decoder o el ciclo de vida.
  Despliégala en la **primera** ronda de bug móvil, no en la cuarta.
- Ante "uno funciona y otro no en el mismo dispositivo", no es diferencia de plataforma: lista qué difiere entre ambos casos.

Verificación de la página resultante: ver `testing-patterns/references/scroll-page-verify.md`.
