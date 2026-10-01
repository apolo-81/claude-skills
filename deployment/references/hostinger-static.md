# Hostinger: sitios estáticos de clientes

Dos modos, mismo proyecto:

## Revisión en subcarpeta (`qro26.shop/<cliente>/`)
1. `VITE_BASE_PATH=/<cliente>/ npm run build`. Sin esto los assets dan 404.
2. Router: `createWebHistory(import.meta.env.BASE_URL)`.
3. ZIP de `dist/` extraído en `public_html/<cliente>/`. `.htaccess` con `RewriteBase /<cliente>/`.
4. Comprueba por URL directa una imagen y un script. Los ZIP a cPanel a veces llegan **solo con lo que está en la raíz**, sin carpetas.

## Producción en raíz
`base: '/'`, `dist/` completo, y CD con GitHub Actions: build + prerender + FTPS (`SamKirkland/FTP-Deploy-Action`).
- Secret `FTP_SERVER` **sin** `ftp://` (solo la IP o el host).
- El prerender debe terminar con `process.exit(0)` o el job se cuelga (procesos huérfanos).
- En `ubuntu-24.04` Playwright necesita el fix de AppArmor.

## La regla SPA que esconde errores
```apache
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [L]
```
En un sitio **multipágina estático** devuelve el home con 200 para cualquier ruta inexistente: una imagen ausente no da 404, da HTML. Úsala
solo en SPA reales, y verifica el tipo MIME de los assets tras cada subida (AMMI llegó sin imágenes y sin un solo error visible).
