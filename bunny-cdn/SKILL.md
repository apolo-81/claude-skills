---
name: bunny-cdn
description: >
  Bunny.net CDN y Stream para hosting de assets, video y archivos privados:
  Storage Zone (upload via FTP/API), Pull Zone, signed URLs, Bunny Stream para
  video con HLS/DRM, proxy desde backend para no exponer API keys. Usar cuando:
  "Bunny", "bunny.net", "Bunny Stream", "Bunny Storage", "Pull Zone", "Storage Zone",
  "signed URL Bunny", "video streaming HLS", "subir archivo a CDN", "AccessKey Bunny",
  "video privado", "DRM video", "Bunny CDN".
  Do NOT use for: imágenes públicas estáticas servidas por Vercel/Next.js Image
  (usar Next.js Image optimization), assets pequeños sin CDN (usar Supabase Storage).
---

# Bunny CDN

Stack confirmado en AULA UC LOGOS: Bunny Stream para video del LMS, proxy via backend Express.

## Componentes Bunny

| Producto | Para qué |
|----------|----------|
| **Storage Zone** | Archivos crudos (imágenes, PDFs, video raw) |
| **Pull Zone** | CDN frente a Storage Zone u origen externo |
| **Stream** | Hosting de video con transcodificación HLS automática |
| **Edge Storage Regions** | Réplica geográfica (LA, NY, SG, etc.) |

## Regla crítica — NUNCA exponer API key al cliente

Bunny `AccessKey` da control total de la zona. **Jamás** ponerlo en `VITE_*` o `NEXT_PUBLIC_*` — termina en el bundle JS.

Patrón AULA: backend Express recibe pedido autenticado, llama a Bunny, devuelve signed URL al cliente.

```
Cliente JWT → Backend Express → Bunny API → signed URL → Cliente reproduce
```

## Storage Zone — upload via API

`PUT https://storage.bunnycdn.com/{storageZoneName}/{path}` con header `AccessKey: ...`.

```js
import fetch from 'node-fetch';
import fs from 'fs';

await fetch(`https://storage.bunnycdn.com/${ZONE}/uploads/${filename}`, {
  method: 'PUT',
  headers: { 'AccessKey': process.env.BUNNY_STORAGE_KEY, 'content-type': 'application/octet-stream' },
  body: fs.createReadStream(localPath)
});
```

Region prefix: para zonas en LA usar `la.storage.bunnycdn.com`, NY `ny.storage.bunnycdn.com`, etc. La consola muestra el hostname correcto.

## Pull Zone — servir vía CDN

URL: `https://{pullzone}.b-cdn.net/path/to/file`. Configurar Pull Zone para apuntar a Storage Zone o a origen externo.

Token authentication para archivos privados: activar en Pull Zone > Security > URL Token Authentication. Generar URL firmada:

```js
import crypto from 'crypto';

function signBunnyUrl(path, expiresInSec = 3600) {
  const expires = Math.floor(Date.now() / 1000) + expiresInSec;
  const token = crypto
    .createHash('sha256')
    .update(process.env.BUNNY_TOKEN_KEY + path + expires)
    .digest('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return `https://${PULLZONE}.b-cdn.net${path}?token=${token}&expires=${expires}`;
}
```

## Bunny Stream — video LMS

Usar cuando: video con transcodificación HLS, thumbnails automáticos, analytics, DRM opcional.

Crear video:
```bash
POST https://video.bunnycdn.com/library/{libraryId}/videos
Headers: AccessKey: $BUNNY_STREAM_KEY
Body: {"title": "Lección 1"}
```

Response: `guid`. Upload binario:
```bash
PUT https://video.bunnycdn.com/library/{libraryId}/videos/{guid}
Body: <raw binary>
```

Playback URL HLS: `https://vz-{libraryId}-{region}.b-cdn.net/{guid}/playlist.m3u8`.

Embed iframe (más fácil): `https://iframe.mediadelivery.net/embed/{libraryId}/{guid}`.

## Token authentication en Stream

En Library > Settings > Token Authentication, activar y generar URL firmada igual que Pull Zone, pero ruta es `/{guid}/playlist.m3u8`.

AULA patrón: backend devuelve URL firmada por `videoId` solo si usuario tiene enrollment activo.

## Player en el cliente

React + HLS.js:
```jsx
import Hls from 'hls.js';

useEffect(() => {
  if (Hls.isSupported() && videoRef.current) {
    const hls = new Hls();
    hls.loadSource(signedUrl);
    hls.attachMedia(videoRef.current);
    return () => hls.destroy();
  }
}, [signedUrl]);
```

Safari soporta HLS nativo: `<video src={signedUrl} />` funciona sin Hls.js.

## Errores comunes

| Error | Causa | Fix |
|-------|-------|-----|
| `401 Unauthorized` en upload | Storage Key incorrecta o región equivocada | usar hostname regional correcto |
| `403 Forbidden` en playback | token expirado o path mal firmado | verificar `expires` y path exacto |
| Video se sube pero no reproduce | falta espera de transcodificación | poll `GET /videos/{guid}` hasta `status: 4` (finished) |
| CORS al fetch signed URL desde JS | Pull Zone sin CORS habilitado | activar CORS en Pull Zone > Headers |
| API key en bundle cliente | uso de `VITE_BUNNY_*` | mover a backend, exponer solo signed URL |

## Environment variables

```bash
BUNNY_STORAGE_KEY=...           # AccessKey de Storage Zone (server-only)
BUNNY_STORAGE_ZONE=mi-zona
BUNNY_PULLZONE=mi-pullzone      # subdominio b-cdn.net
BUNNY_TOKEN_KEY=...             # solo si activaste URL Token Auth
BUNNY_STREAM_KEY=...            # AccessKey de Stream Library
BUNNY_STREAM_LIBRARY_ID=12345
```

## Verificación

```bash
# Upload test
curl -X PUT "https://storage.bunnycdn.com/$BUNNY_STORAGE_ZONE/test.txt" \
  -H "AccessKey: $BUNNY_STORAGE_KEY" --data "hello"

# Confirmar via CDN
curl "https://$BUNNY_PULLZONE.b-cdn.net/test.txt"

# Status video Stream
curl "https://video.bunnycdn.com/library/$BUNNY_STREAM_LIBRARY_ID/videos/$GUID" \
  -H "AccessKey: $BUNNY_STREAM_KEY"
```

## Referencias

- Bunny docs: https://docs.bunny.net
- AULA: video LMS servido vía backend proxy (no `VITE_BUNNY_*`)
