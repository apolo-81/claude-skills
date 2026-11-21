# Efectos que requieren una persona a cámara

Solo para cuando te grabas hablando. Necesitan recorte de la persona, rastreo de cara o de mano y transcripción (`npx -y hyperframes@0.9.72 transcribe`). **No verificado en este equipo** (Radeon 680M, sin PyTorch). Recortes y gradación: `/media-use`.

| Efecto | Mecánica | Bloque más cercano (tipo) |
|---|---|---|
| Camcorder | visor de grabación con acercamientos digitales y marcas de enfoque en la cara | `camcorder-hud` (B 16:9) |
| Clones | copias de la persona en filas escalonadas detrás | — |
| Orbit | tarjetas que giran alrededor de la cabeza, por delante y por detrás | `carousel-orbit-1…5` |
| Ring | anillo de texto que gira sobre la cabeza | — |
| Sandwich | palabra gigante detrás y serif delante | `caption-parallax-layers` (C) |
| Scribble | contorno a mano que «hierve» | `hw-boil` (C) |
| Vertigo | dolly zoom con la cara fija | `camera-dolly-zoom` (B 16:9) |
| Glass-tag | etiqueta que sigue la punta del dedo | — |
| Feed, Breakout, Labels sobre la cabeza | elementos alrededor de la persona recortada | `caption-parallax-layers` (C), `freeze-frame-dressing` (B 16:9) |

**No usar con clientes**:

- **Clippings**: recortes de noticias. Si son inventados, es desinformación.
- **Banknote**: retrato en billete; imita moneda.
- **Sello de veredicto**: sello tipo «APROBADO». En educación es una promesa de resultado; solo se permiten estados como «ENTREGADO», «LISTO» o «PAGADO».
