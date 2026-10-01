# VPS + Coolify / Docker Compose + Caddy

Para productos de **un solo origen** (cookies, CSRF, Origin), con Postgres y roles (`CREATE ROLE`/`BYPASSRLS` para RLS). Vercel Hobby no
admite uso comercial y Render + Vercel rompe el modelo de un origen, así que Jornada y Despacho Contable van a VPS.

## Dos rutas probadas
- **Coolify ya instalado** (Hetzner prestado, 2026-09): apps desde el repo privado, Postgres 17 propio, TLS real con Let's Encrypt vía
  `sslip.io` (`<ip-con-guiones>.sslip.io`) sin comprar dominio. Panel HTTPS en `coolify.<ip>.sslip.io`; liga a loopback los puertos
  directos del panel y de realtime.
- **Docker Compose manual**: VPS Ubuntu 24.04 + Compose + Caddy (TLS automático), unidad/temporizador systemd en tu PC para bajar
  respaldos. Recomendado: Hostinger KVM 1 o DigitalOcean de 2 GB.

## Hábitos
- **Un VPS prestado y compartido no es tuyo**: no rotes credenciales ajenas ni cambies el acceso SSH global.
- Respaldo cifrado en volumen persistente (`/app/backups`), copia diaria a tu PC, clave **fuera del repo** (`~/.config/<app>/backup-key`),
  y restauración aislada **probada** en un contenedor.
- Retira variables sensibles de ejemplo del entorno (`PLATFORM_OWNER_PASSWORD`) y entrega la contraseña inicial por un canal seguro.
- Correo: Resend por SMTP funciona en modo prueba sin dominio, pero solo entrega al correo del dueño de la cuenta hasta verificar un dominio.
- CI en GitHub Actions con Postgres real, no solo la BD embebida (PGlite) de las pruebas locales.
- Antes de comprar un dominio, whois y búsqueda en IMPI (clases 9 y 42) para evitar confusión de marca.
