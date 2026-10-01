---
name: deployment
description: >
  Dónde y cómo desplegar según el tipo de proyecto: Vercel (Next.js/React), Hostinger (sitios Vue estáticos, ZIP o FTPS),
  Render (APIs Express, plan gratis), VPS Hetzner/Hostinger con Coolify o Docker Compose + Caddy (apps multi-tenant con Postgres),
  Firebase Hosting; Railway solo como legado. Variables de entorno, dominios, health checks, CI/CD y rollback.
  Usar cuando: "deploy", "subir a producción", "Vercel", "Hostinger", "Render", "Coolify", "VPS", "Docker Compose", "Caddy",
  "sslip.io", "dominio custom", "variables de entorno", "health check", "GitHub Actions deploy", "FTP", "rollback".
  Do NOT use for: Vercel a profundidad (CLI avanzado, monorepo, OIDC: vercel-essentials).
---

# Deployment: elige la plataforma primero

| Proyecto | Plataforma | Léelo |
|---|---|---|
| Next.js / React con auth o BD (CRM, AULA frontend) | **Vercel** (CD por Git) | `references/railway-vercel.md` §2, §5-7 y la skill `vercel-essentials` |
| Sitio Vue/estático de cliente | **Hostinger** (subcarpeta de revisión o raíz) con ZIP o FTPS | `references/hostinger-static.md` |
| API Express + MySQL/SQLite (lms-core backend, AINCO) | **Render** (free: duerme, sin shell) | `references/render-mysql.md` |
| Producto multi-tenant con Postgres, mismo origen, RLS (Jornada, Despacho Contable) | **VPS + Coolify** o Docker Compose + Caddy | `references/vps-coolify.md` |
| Web con Firebase Hosting (ACMI) | `firebase deploy` | `firebase deploy --only hosting`; recupera código con sourcemaps si no hay repo |
| Servicios Node con volumen persistente de pago | Railway (legado, ya no se usa) | `references/railway-vercel.md` §3-4 |

## Reglas que valen en cualquier plataforma

1. **Variables de entorno**: `.env.example` en el repo sin valores; nada de secretos en `VITE_*` (se publican en el bundle); valida al
   arranque con zod. Los `.env.*` y sus respaldos se filtran igual: ignóralos todos.
2. **Health check que toque la BD**, no `HEAD /`. Una API con la base inaccesible no debe aparecer como viva.
3. **Verifica el despliegue, no el comando**: abre el sitio real, un asset por URL directa, y la API (`/api/health`). Un deploy "exitoso"
   puede estar sirviendo el último bueno.
4. **Identidad de commit**: en Vercel, si el committer no está vinculado a GitHub (`git config user.email`), el deploy se bloquea con
   `COMMIT_AUTHOR_REQUIRED` y el síntoma engaña (`UNKNOWN`). Usa `apolo-81@users.noreply.github.com` o verifica el correo en GitHub.
5. **Rollback antes de tocar**: guarda el ZIP/imagen anterior y la forma de volver (Vercel: redeploy; Coolify: redeploy del commit
   previo; Hostinger: ZIP anterior).
6. **Entregables y paquetes** dentro de la carpeta del proyecto (`deploy/`), no sueltos en `~/Documents`.
7. Dominio: A/CNAME en el registrador (GoDaddy) hacia la plataforma; Vercel emite el certificado con `vercel certs issue` si no sale solo.

## Costos y límites a recordar
Vercel Hobby no admite uso comercial. Render free duerme y no da shell. Un VPS prestado y compartido exige no rotar credenciales
ajenas ni tocar el SSH global.
