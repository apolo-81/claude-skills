---
name: hyperframes-fx-catalog
description: Catálogo de efectos de video para HyperFrames adaptados al trabajo de Apolo (UNICL, Jornada, Apolo Tek, AMPLIFICA, clientes, WhatsApp Status). Usar cuando se pida un video con "efecto", "algo más vistoso/profesional", un tablero, checklist, ticket, chat de WhatsApp, titular cinético, transición, antes/después, mockup de teléfono, o al planear un video con /hyperframes y falten ideas visuales. No sustituye a /hyperframes: aporta la receta visual y los bloques del catálogo a fijar.
---

# Catálogo de efectos (HyperFrames)

Origen: 65 efectos del paquete VFX de AI Andy (creatorgrowth.com), analizados cuadro por cuadro y reducidos a lo que sirve sin una persona hablando a cámara. Aquí van **recetas adaptadas**, no sus prompts. Esta skill va ENCIMA de `/hyperframes` (cárgala primero): sus reglas de movimiento, `check` y `snapshot --review` mandan.

## Cómo usarla

1. Elige el efecto por objetivo en la tabla de abajo y lee su ficha en `references/catalog.md` (busca el nombre con grep; no cargues todo).
2. Fija el bloque del catálogo que nombra la ficha (`npx hyperframes catalog --query "<nombre>" --json`; son puntos de partida, no piezas listas: se reescriben con el contenido real).
3. Arma el prompt con el esqueleto: ruta · especificación (duración, 1080×1920 para WhatsApp Status) · beats con tiempos · copy entre comillas · técnica (bloque fijado) · negativos.
4. Cierra con `check`, `snapshot --review` y revisa el cuadro 0 (miniatura) y el cierre (≥ 2 s de lectura).

## Reglas de la casa

- **Marca**: UNICL = azul #1A56DB, navy #0A1628/#0F2B5B, dorado #C8963E/#F0D478, coral #E8614A; Playfair Display (titulares) + Inter. Otras marcas: pedir/leer su paleta, no inventarla.
- **Un efecto fuerte por video** (máx. 2 en 15 s); el resto sobrio. Más efectos = más barato, no más profesional.
- **Datos reales**: cifras, reseñas, likes, noticias, avatares y precios salen del cliente. Nunca inventar testimonios, notas de prensa, métricas ni «likes».
- **Promesas**: sin «garantizado», «aprobado» ni sellos de resultado en educación (CENEVAL/SEP). Usar «inscripciones abiertas», «asesoría», «pregunta por tu diagnóstico».
- **No imitar** billetes, documentos oficiales ni marcas ajenas (WhatsApp, Google, Instagram) más allá de un mockup genérico.
- **Los bloques del catálogo son 1920×1080 nativos** (verificado con `split-flap-board`: en un lienzo 1080×1920 las celdas se cortan y el panel no rellena). Para vertical hay que reescribir el tamaño del escenario/celdas en el archivo copiado a `compositions/` (es fuente editable) o recomponer; escalar el host no basta.
- **Zona segura** de WhatsApp Status: texto clave dentro de 120–960 px laterales y 250–1650 px verticales; centrar en el lienzo (no en la zona de TikTok).
- **Audio**: música local (sintetizada) o del catálogo de HeyGen si hay sesión; ≥ 2 s de lectura en el cierre y el CTA con WhatsApp del cliente.

## Implementación de referencia

`clients/unicl/plan-ceneval-12-semanas/video-v2/` (17.4 s, 1080×1920): Stack + Splitflap + Glass-tasks + transición «objeto → mundo» + música/sfx sintetizados (`tools/build.py` genera HTML, escenas y audio). Copiar su estructura (root + 1 sub-composición por escena, fondo y marca persistentes en el root).

## Elegir por objetivo

| Quiero… | Efecto (ficha) |
|---|---|
| Contar semanas / etapas / horarios | Splitflap · Rail · Clock |
| Mostrar progreso o lo que incluye | Glass-tasks · Streak · Labels · Receipt |
| Cotización / lista con total | Receipt · Tiers |
| Mostrar mi canal (WhatsApp) | Peel · Memo · Call · Queue |
| CTA «escribe X» | Comments · Search |
| Titular que pega | Stack · Shatter · Neon · Gravity · Glyph · Ink |
| Cambiar de sección con estilo | Iris · Match-cut · Doors · Rip · Zoom-through · Rabbit-hole |
| Antes / después, elegir opciones | Before-After · Proofs · Purge |
| Enseñar app / web / sistema | Phone · Interface · Layers · Editor · Crop · Dropzone |
| Señalar un detalle en captura | Markup · Markup-doodle |
| Look de marca / editorial | Collage · Double-exposure · Projector · Halftone · Swatch · Nightfall |
| Tecnología / código | ASCII · Terminal (Prompt) · Keycaps |
| Sólo si me grabo hablando | ver «Requiere persona» al final del catálogo |
