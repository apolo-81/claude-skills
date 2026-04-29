Gestiona grupos de skills. El argumento determina la acción:

- Sin argumento → ejecuta `skill-toggle status` y muestra estado actual de todos los grupos
- `on <grupo>` → ejecuta `skill-toggle <grupo> on`; informa cuántas quedaron activas y recuerda hacer `/reload-plugins`
- `off <grupo>` → ejecuta `skill-toggle <grupo> off`; informa cuántas quedaron activas y cuántas inactivas

Grupos disponibles: `seo`, `market`, `dev`, `ai`, `design`, `web`, `all`
