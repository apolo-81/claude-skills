---
name: vue-sites
description: >
  Sitios de clientes en Vue 3 + Vite + SCSS (landing o multipágina estática): estructura de componentes, tokens SCSS, imágenes
  AVIF/WebP, carga progresiva, prerender con Playwright, SEO y legales MX, despliegue a Hostinger en subcarpeta o raíz, CI con FTPS.
  Destilado de ADMANMEX, UNICL, SEMECPRO, ACMI, Rancho el Sueño y Agave.
  Usar cuando: "sitio en Vue", "landing Vue 3", "Vite + SCSS", "prerender", "deploy a Hostinger", "VITE_BASE_PATH",
  "subcarpeta qro26.shop", ".htaccess SPA", "aviso de privacidad", "widget de WhatsApp", "sitio para cliente en 5 días".
  Do NOT use for: apps con auth y base de datos (React/Next.js: auth-patterns, supabase-stack), ni para Next.js.
---

# Sitios Vue 3 para clientes

Patrón de los 6 sitios activos (`clients/{admanmex,unicl,semecpro,acmi,rancho-el-sueno,agave}`). Confirma las versiones en
`package.json` (Vite 5 en la mayoría, 8 en Rancho el Sueño). Entrega por defecto: **5 días hábiles** (diferenciador de Apolo Tek).

## 1. Estructura

```
src/
  components/
    app/AppHeader.vue          # fijo, glass, indicador de nav, menú móvil animado
    sections/*.vue             # una sección por componente (Home.vue de 1228 a 46 líneas en UNICL)
    ImageOptimized.vue         # <picture> AVIF/WebP + width/height + fetchpriority
    LazyMount.vue              # IntersectionObserver; rootMargin configurable
    WhatsappWidget.vue         # botón flotante, pulso, tooltip CSS
  composables/useSite.js       # singleton: sección activa, modal legal, whatsappUrl, scrollToSection
  assets/styles/custom.scss    # tokens (colores, tipografía, espaciado) y mixins
scripts/prerender.mjs          # Playwright sobre `vite preview`
```
Vue 3 con Options API (SFC `<script>`) en ADMANMEX y sin TypeScript en Rancho el Sueño; confírmalo en cada proyecto. Router: `createWebHistory(import.meta.env.BASE_URL)`;
en una landing de una página se puede omitir el router y navegar por scroll con `aria-current="section"`.

## 2. Diseño y rendimiento

- **Tokens en SCSS** (`custom.scss`) y paleta verificada en el código, no en la nota del cliente: la paleta documentada de UNICL
  estaba desactualizada. Lee `_variables.scss` antes de describirla.
- **Contraste con cálculo, no a ojo** (WCAG 2.x, luminancia relativa) cuando haya video de fondo. Pon el umbral en un comentario CSS.
- Video de fondo: comprimido (14 MB a 1.7 MB en UNICL), con `poster` (webp borroso de 3.7 KB), overlay degradado y `reduced-motion`
  que deja solo el poster. Para scroll con video a otro nivel ver la skill `scroll-craft` (apagada por defecto).
- `content-visibility: auto` en secciones bajo el pliegue, `LazyMount` para componentes pesados, `defineAsyncComponent`.
- `manualChunks` en Vite (vendor-vue / vendor-ui / vendor) y `cssCodeSplit: true`; imágenes con `sharp` en build.
- Tap targets >= 44 px, `lang="es-MX"`, un solo `h1`.
- Animaciones: patrones de `wordRevealItem`, `AnimatedSection` con `useInView` y parallax en hero (feedback `uclogos_animations`).

## 3. SEO y legales México

- `sitemap.xml`, `robots.txt`, `og-image.png` en `public/` (se copia a `dist/`), canonical y OG desde `VITE_SITE_ORIGIN`.
- Páginas `/aviso-de-privacidad` y `/terminos-y-condiciones` con copy LFPDPPP; prerenderizadas (SSG) con Playwright.
- **Contenido institucional**: no inventes. Copy inventado choca con el marco real del cliente; pide documentos institucionales.
- WhatsApp como canal de conversión: el formulario puede abrir `wa.me/52...` con los datos consolidados mientras no haya backend.

## 4. Prerender con Playwright (y el cuelgue en CI)

`scripts/prerender.mjs` levanta `vite preview`, renderiza las rutas y **falla si no completa todas** (3/3). Obligatorio al final del
script, o el job de GitHub Actions se cuelga horas aunque el archivo ya esté guardado (procesos huérfanos con las tuberías abiertas):

```js
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
```
En `ubuntu-24.04` Playwright necesita el fix de AppArmor; ver el workflow del proyecto de referencia (`dr-alfredo-pediatra`).

## 5. Despliegue

- **Subcarpeta de revisión** (`qro26.shop/<cliente>/`): `VITE_BASE_PATH=/<cliente>/ npm run build`, ZIP, extraer en `public_html/<cliente>`,
  `.htaccess` con `RewriteBase /<cliente>/`. Los 404 de assets casi siempre son un `base` mal puesto.
- **Raíz de dominio** (Hostinger o Firebase Hosting en ACMI): `base: '/'`, `dist/` completo.
- **La regla SPA `RewriteRule ^ index.html` oculta despliegues a medias**: cualquier archivo ausente devuelve el home con 200 en vez de
  404. Tras subir, abre una imagen y un asset por URL directa y comprueba el tipo MIME.
- **CI/CD a Hostinger**: GitHub Actions compila, prerenderiza y sube `dist/` por FTPS (`SamKirkland/FTP-Deploy-Action`). El secret
  `FTP_SERVER` va **sin protocolo** (`156.67.75.109`, no `ftp://...`) o falla con `getaddrinfo ENOTFOUND`.
- Guarda los paquetes en `deploy/` dentro del repo y excluye del commit lo que no sea código (`/marketing/`, `reports/`).

## Skills relacionadas
`deployment` (referencias por plataforma), `seo-core`, `performance-next` (CWV, aplica también a Vue), `web-animations`, `scroll-craft`.
