# CMS Headless — Comparación Detallada y Decisión Matrix

## Tabla de comparación

| Feature | Sanity | Contentful | Strapi | Directus | TinaCMS |
|---|---|---|---|---|---|
| **Modelo de pricing** | Free + por uso | Free + por contenido | Open source | Open source / Cloud | Free + por usuario |
| **Free tier** | 3 usuarios, 2 datasets, 500k API req/mes | 5 tipos de contenido, 25k records | Ilimitado (self-hosted) | Ilimitado (self-hosted) | 2 usuarios |
| **Precio aprox. producción** | $99/mes (Growth) | $300/mes (Basic) | ~$15-50/mes hosting | ~$15-50/mes hosting | $29/mes |
| **Self-hosted** | No | No | Sí | Sí | No (Git-based) |
| **API** | GROQ, GraphQL | REST, GraphQL | REST, GraphQL | REST, GraphQL | GraphQL |
| **TypeScript** | Excelente | Bueno | Bueno | Bueno | Excelente |
| **Live Preview** | Nativo (Visual Editing) | Limitado | Manual | Manual | Nativo (inline) |
| **Multilingual i18n** | Plugin (sanity-plugin-internationalized-array) | Nativo | Plugin | Nativo | No |
| **Real-time collab** | Sí (múltiples editores simultáneos) | No | No | No | No |
| **Webhooks** | Sí, con firma HMAC | Sí | Sí | Sí | No (Git-based) |
| **Image CDN** | Sí (Sanity CDN con transformaciones) | Sí (Imgix) | Con provider (Cloudinary) | Sí | No |
| **Rich text** | Portable Text (muy flexible) | Rich Text API | Blocks (flexible) | WYSIWYG | MDX |
| **Schema** | Código TypeScript | UI + migrations | UI + código | UI | Código TypeScript |
| **Curva de aprendizaje** | Media (GROQ, schemas en código) | Baja (UI intuitiva) | Baja (UI intuitiva) | Baja | Media |
| **Comunidad** | Grande | Grande | Muy grande | Media | Media |
| **Next.js support oficial** | Excelente (next-sanity) | Bueno | Bueno | Bueno | Excelente |
| **Custom studio UI** | Total (React components) | Limitado | Limitado | Limitado | Limitado |
| **Audit log** | Plan pagado | Plan pagado | Sí (open source) | Sí (open source) | Git history |

---

## Decisión matrix por tipo de proyecto

### Blog personal o de marca
**Recomendación: Sanity (free tier alcanza)**
- Razón: Schema flexible, excelente DX, free tier generoso para 1 usuario
- Alternativa si contenido es estático: MDX + Git (sin CMS)

### Sitio de empresa con cliente editando contenido
**Recomendación: Sanity**
- Razón: Studio customizable, live preview, el cliente puede editar con UI amigable
- El dev controla el schema en código, no hay sorpresas
- Setup: monorepo con `/studio` en la misma carpeta del proyecto Next.js

### E-commerce con productos administrables
**Recomendación: Sanity + Shopify (para pagos) o Strapi (todo en uno)**
- Sanity: schema de productos custom, integraciones flexibles
- Strapi: si quieres controlar todo (DB, API, media) sin depender de Shopify

### Plataforma con múltiples idiomas (i18n)
**Recomendación: Contentful o Directus**
- Contentful: i18n nativo, UI intuitiva para equipos de traducción
- Directus: self-hosted, i18n nativo, más barato en escala

### Agencia con múltiples clientes / whitelabel
**Recomendación: Sanity**
- Razón: Un proyecto de Studio se puede configurar para múltiples datasets (uno por cliente)
- Alternativa: Strapi (self-hosted = control total, puedes instalar una instancia por cliente)

### Startup con equipo técnico, necesita API flexible
**Recomendación: Strapi o Directus**
- Control total de la DB y los datos
- REST + GraphQL out of the box
- Deploy en Railway, Render, o VPS propio

### MVP / Prototipo rápido
**Recomendación: Sanity (free tier) o TinaCMS**
- Sanity: funcional en < 1 hora
- TinaCMS: si el contenido es Git-based y quieres edición inline

### Internal tool / Dashboard de datos
**No usar CMS headless**
- Usar directamente Supabase + interfaz custom o Airtable

---

## Cuándo NO usar CMS headless

| Situación | Alternativa |
|---|---|
| Solo el dev edita el contenido | MDX + archivos en el repo |
| Landing page estática | JSON/YAML local o simplemente código |
| Datos estructurados de negocio | Base de datos directa (Supabase, PlanetScale) |
| Blog con < 10 posts y raramente actualizado | MDX con next-mdx-remote |
| Presupuesto muy bajo y cliente técnico | Netlify CMS (deprecado) o TinaCMS |

---

## Sanity vs Contentful — Análisis profundo

### Elige Sanity cuando:
- Eres freelancer o agencia y quieres controlar el schema en código
- Necesitas live preview nativo y visual editing
- El proyecto requiere schema personalizado y complejo
- Necesitas real-time collaboration entre editores
- Quieres Portable Text (más flexible que Contentful Rich Text)
- El presupuesto es ajustado (free tier generoso)

### Elige Contentful cuando:
- El cliente es una empresa grande con equipo de contenido no técnico
- Necesitas i18n robusto out-of-the-box con workflows de traducción
- Hay un equipo de contenido grande (> 5 personas) ya familiarizado con Contentful
- El cliente ya tiene cuenta y datos en Contentful

---

## Strapi vs Directus — Análisis

### Elige Strapi cuando:
- Necesitas self-hosted con API REST y GraphQL
- El equipo conoce Node.js y quiere customizar con plugins
- Quieres un CMS tradicional con panel admin + API
- El presupuesto para hosting es bajo (Railway ~$5/mes)

### Elige Directus cuando:
- Tienes una base de datos existente y quieres una API y admin encima
- Necesitas i18n nativo sin plugins
- Prefieres TypeScript nativo (Directus está en TS, Strapi en JS+TS)
- Quieres un dashboard de datos además del CMS

---

## Costos estimados para proyectos reales

### Proyecto pequeño (blog/sitio empresa, 1 cliente)
- **Sanity Free** + **Vercel Free/Pro**: $0-20/mes
- **TinaCMS Free**: $0/mes
- **Strapi en Railway**: $5-15/mes hosting

### Proyecto mediano (e-commerce, equipo de 3-5 personas)
- **Sanity Growth**: $99/mes
- **Contentful Basic**: $300/mes
- **Strapi en Railway Pro**: $20-40/mes (hosting)
- **Directus Cloud**: $89/mes

### Proyecto grande (plataforma, equipo grande, múltiples idiomas)
- **Sanity Enterprise**: Precio custom (~$1000+/mes)
- **Contentful Enterprise**: Precio custom (~$2000+/mes)
- **Strapi Enterprise**: $499+/mes (soporte + licencia)
- **Directus Enterprise**: Precio custom

---

## Checklist antes de elegir CMS

```
[ ] ¿Cuántos usuarios necesitan acceder al CMS?
[ ] ¿El cliente necesita editar contenido sin ayuda técnica?
[ ] ¿Necesitas múltiples idiomas?
[ ] ¿Necesitas preview de borradores en el sitio?
[ ] ¿Tienes control sobre el hosting o prefieres managed?
[ ] ¿Cuántos tipos de contenido necesitas?
[ ] ¿Necesitas relaciones complejas entre contenidos?
[ ] ¿El contenido cambia frecuentemente o raramente?
[ ] ¿Cuál es el presupuesto mensual para el CMS?
[ ] ¿El equipo ya conoce algún CMS específico?
```
