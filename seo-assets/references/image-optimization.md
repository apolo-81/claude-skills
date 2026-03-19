# Image Optimization Reference

## File Size Thresholds

| Category | Target | Warning | Critical |
|----------|--------|---------|----------|
| Thumbnails/icons | <30KB | >75KB | >150KB |
| Content images | <100KB | >200KB | >500KB |
| Hero/banner | <200KB | >350KB | >700KB |

## Format Selection (2026)
- New deployments: AVIF first, WebP fallback, JPEG final — use `<picture>`
- Modernization: JPEG/PNG to WebP (25-35% reduction)
- Icons/logos: SVG always
- Animated: convert GIFs >100KB to `<video autoplay loop muted playsinline>`

## LCP Image (Critical)
```html
<img src="hero.webp" fetchpriority="high" alt="..." width="1200" height="630">
```
- NEVER `loading="lazy"` on LCP image
- NEVER `decoding="async"` on LCP image
- Must be in initial HTML (not JS-loaded)

## Responsive Images
srcset with 2+ width descriptors; sizes matching breakpoints.

## Lazy Loading
`loading="lazy"` + `decoding="async"` on below-fold images only.
First 2-3 images: never lazy-load.

## CLS Prevention
Set width/height on all `<img>` elements. Alternative: CSS `aspect-ratio`.

## Images and AI Search Citability
- Write alt text for AI: name subject precisely, include context
- For charts: describe key finding, not just "chart"
- Add text summaries below infographics for AI systems
- Keep images in initial HTML — AI crawlers may not execute JS
