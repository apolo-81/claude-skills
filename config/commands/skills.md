Gestiona grupos de skills con `skill-toggle`. El argumento determina la accion:

- Sin argumento -> ejecuta `skill-toggle status` y muestra estado actual de todos los grupos principales.
- `status <grupo|skill>` -> ejecuta `skill-toggle status <grupo|skill>`.
- `on <grupo|skill>` -> ejecuta `skill-toggle <grupo|skill> on`; informa cuantas quedaron activas y recuerda hacer `/reload-plugins`.
- `off <grupo|skill>` -> ejecuta `skill-toggle <grupo|skill> off`; informa cuantas quedaron activas y cuantas inactivas.
- `lean` -> ejecuta `skill-toggle profile lean`; deja activo el perfil recomendado de bajo contexto y recuerda hacer `/reload-plugins`.

Grupos disponibles: `default`, `maintenance`, `market`, `dev`, `design`, `content`, `ai`, `n8n`, `seo`, `pinokio`, `all`.

Notas:
- `default` es el perfil recomendado de bajo contexto.
- `all` existe solo para tareas puntuales; no dejarlo activo por defecto.
- Despues de cambiar skills, ejecutar `/reload-plugins` para que Claude recargue el registry.
