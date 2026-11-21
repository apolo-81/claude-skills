---
name: hyperframes-fx-catalog
description: Recetas de efectos para videos hechos con HyperFrames en el trabajo de Apolo (UNICL, Jornada, Apolo Tek, AMPLIFICA, clientes; WhatsApp Status 9:16), con el bloque del catálogo que de verdad sirve y las reglas de marca y de promesas. Usar cuando un video de HyperFrames necesite un tablero split-flap, checklist que se marca, ticket o cotización, chat tipo WhatsApp, titular cinético, transición con causa, antes/después o mockup de teléfono, o cuando se pida «más vistoso/profesional». Va encima de /hyperframes, no lo sustituye. No usar para animación web (React/CSS: web-animations) ni para Remotion.
---

# Catálogo de efectos (HyperFrames)

Recetas propias, escritas a partir de 65 efectos de un paquete de terceros (creatorgrowth.com/resource/vfx) observados cuadro por cuadro. No contiene sus prompts. Uso privado: no publicar ni compartir.

**Manda `/hyperframes`.** Cárgalo primero: su contrato, `motion.md`, `story.md`, `spec.md`, `sound.md`, `review.md` y `types/vertical.md` son la regla. Aquí solo va lo que la oficial no cubre.

## En este equipo (comprobado el 2026-11-20)

- CLI: `export HYPERFRAMES_NO_TELEMETRY=1` y `npx -y hyperframes@0.9.72 <cmd>`. El plugin pide la 0.9.74, que no existe en npm. No ejecutes `events` ni `auth`.
- Proyecto nuevo: `cd ~ && npx -y hyperframes@0.9.72 init <ruta-absoluta> --skip-skills`.
- GPU Radeon 680M: los bloques con etiqueta `webgl`, `webgpu` o `html-in-canvas` no están probados aquí. Haz un `snapshot` antes de diseñar alrededor de uno; si falla, usa CSS o SVG.

## Flujo (orden obligatorio)

1. **Una idea y su número**: qué debe recordar quien lo ve y el dato real que viaja por el video (`story.md` §1).
2. **`SPEC.md`** con la plantilla de `spec.md`. Añade una **tabla de lectura**: cada línea de texto, su número de palabras y su tiempo mínimo (0.5 s + 0.3 s por palabra; el cierre, ≥ 2 s). Súmala antes de construir: si no cabe en la duración, recorta palabras; nunca reduzcas la letra.
3. **Efecto**: elige en la tabla de abajo y lee **solo esa ficha** (`grep -n "### <Nombre>" references/catalog.md`). Usa un efecto protagonista por video, como mucho dos en 15 s.
4. **Bloque**: `npx -y hyperframes@0.9.72 catalog --query "<n>" --json` y lee `type` y `dimensions`:
   - `component` no trae tamaño y se adapta;
   - `block` 1920×1080 se recompone para 9:16 (escalar el host no basta);
   - hay bloques **9:16 nativos**: `message-thread-reveal`, `notification-cascade`, `ai-chat-reveal`, `share-sheet-carousel`, `notes-reveal` (1080×1920) y `flowchart-vertical` (1440×2560). Los que imitan una marca (`instagram-follow`, `spotify-card`…) no se usan.

   `npx -y hyperframes@0.9.72 add <n>` copia el código fuente a `compositions/`, donde se reescribe con el contenido real. Si la ficha dice «a medida», no hay bloque que haga eso.
5. **Construir**: root más una sub-composición por escena (referencia: `/home/apolo/Documents/Projects/clients/unicl/plan-ceneval-12-semanas/audit-opus/video-v3/`, generado por su `tools/build.py`).
6. **Verificar**: `check`, `snapshot --review` y fotogramas del MP4 en el cuadro 0, en cada costura y en el cierre. Escribe `REVIEW.md`.
   - **`check` no ve el texto que vive en `::before`/`attr()`** (split-flap): esas lecturas se comprueban con la tabla del paso 2.
   - Audio con `npx -y hyperframes@0.9.72 audio <mp4> --json` y `ffmpeg -af ebur128`.

## Reglas de la casa

- **Marca UNICL**: azul #1A56DB, navy #0A1628/#0F2B5B, oro #C8963E/#F0D478, coral #E8614A; Playfair Display 700 e Inter 400/700/900 (pesos empaquetados; los demás se descargan). El oro se raciona (palabra clave, progreso, cierre) y el escudo aterriza una vez, en el cierre, nunca fijo en una esquina. Otras marcas: lee su paleta (`look.md`), no la inventes.
- **Navy de marca sí; vacío oscuro, no**: el protagonista ocupa ≥ 40 % del ancho o del alto. Vidrio, mesh, neón, brillos y esferas están en la lista BANNED de `spec.md`: úsalos solo si la marca los usa, y dilo en `SPEC.md`.
- **Datos reales con fuente**: cada cifra o documento lleva su fuente (página o línea de la guía, o el material del cliente) en `SPEC.md`. Nada de testimonios, likes, notas de prensa ni métricas inventadas.
- **Promesas** (educación, CENEVAL/SEP): nunca «aprobado», «garantizado», sellos ni porcentajes de éxito. En videos de UNICL el cierre lleva siempre «UNICL no emite la acreditación ni garantiza resultados.».
- **No imitar** documentos oficiales, billetes ni marcas ajenas (WhatsApp, Google, Instagram): mockup genérico, sin logotipos.
- **WhatsApp Status**: aplica la zona segura de `types/vertical.md`. Status no tiene el carril derecho de TikTok, así que los avisos `outside_safe_zone` que solo citen «TikTok/Shorts (right edge)» se aceptan y se anotan en `REVIEW.md`. Cualquier otro aviso se corrige.
- **Audio** (excepción local a `sound.md` §3: no hay sesión de HeyGen): SFX de `~/.claude/plugins/marketplaces/hyperframes/skills/media-use/audio/assets/sfx/` (licencia Pixabay), rotando 2–3 tomas. La cama puede sintetizarse con numpy, con filtro paso alto a 120 Hz, < 15 % de la energía bajo 150 Hz y sin tonos como SFX. Mezcla entre −18 y −20 LUFS para Status (−16/−14 para Reels o TikTok) y true peak ≤ −1 dBTP.

## Elegir por objetivo

| Quiero… | Ficha |
|---|---|
| Contar semanas, etapas u horarios | Splitflap · Rail · Clock |
| Progreso o lo que incluye | Checklist · Streak · Labels · Receipt |
| Cotización o lista con total | Receipt · Tiers |
| Mostrar mi canal (WhatsApp) | Chat · Memo · Call · Queue |
| CTA «escribe X» | Comments · Search |
| Titular que pega | Stack · Impacto (Shatter/Neon/Gravity/Glyph/Ink) |
| Cambiar de escena con causa | Carry (el número viaja) · Pill-to-card · Iris · Match-cut · Rip · Zoom-through |
| Antes/después, elegir | Before-After · Proofs · Purge |
| Enseñar app, web o sistema | Phone · Interface · Layers · Editor · Markup |
| Look de marca o editorial | Collage · Editorial (Double-exposure/Projector/Halftone/Nightfall) · Swatch |
| Tecnología o código | ASCII · Terminal · Keycaps |
| Con persona a cámara | `references/catalog-persona.md` |
