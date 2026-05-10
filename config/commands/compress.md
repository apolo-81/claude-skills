# /compress

Comprime la sesion actual y persiste conocimiento en el vault de Obsidian sin romper la memoria canonica.

## Regla principal

`/compress` SI puede modificar el vault. Debe escribir solo en:

- `01_Projects/` para bitacoras de trabajo de proyectos activos.
- `02_Areas/` para tooling, Claude Code, vault, sistemas personales o mantenimiento.
- `04_Archive/` para proyectos archivados/cancelados.
- `00_System/Memory/` solo para consolidar conocimiento durable.

No escribir sesiones en `03_Resources/`. `03_Resources/` es para referencias, clippings y sintesis consultables, no bitacoras.

Nunca escribir memoria nueva en `.claude-memory/`; esa carpeta es legacy y solo redirige.

## Antes de escribir

1. Lee primero:
   - `00_System/Memory/MEMORY.md`
   - `00_System/Memory/STRUCTURE_FOR_CLAUDE.md`
2. Revisa `git -C /home/apolo/Documents/ClaudeCode_Projects/vault status --short --branch`.
3. Si hay cambios locales no relacionados, no los reviertas ni los sobrescribas. Trabaja alrededor de ellos.
4. Si el vault esta behind/ahead, reportalo; no ejecutes `git pull`, merge, rebase, checkout ni reset sin permiso explicito del usuario.

## Que extraer de la conversacion

Extrae solo informacion util:

- Decisiones tomadas.
- Cambios implementados.
- Bugs, gotchas o patrones aprendidos.
- Tareas abiertas reales.
- Paths, commits, deploys o comandos relevantes.
- Riesgos, bloqueos o follow-ups.

No guardes transcripcion, ruido conversacional ni pensamientos internos.

## Seguridad

Antes de escribir, redacta secretos:

- API keys, tokens, passwords, cookies, JWTs, private keys.
- Webhook secrets, x-api-key, bearer tokens, access tokens.
- Valores `.env` sensibles.

En notas, guardar solo la ubicacion del secreto: password manager, proveedor, entorno de deploy, panel admin, etc. Nunca el valor.

## Nota de sesion

Crea una nota de sesion historica con nombre descriptivo:

`Session - YYYY-MM-DD <Proyecto o Area> <Tema corto>.md`

Frontmatter recomendado:

```yaml
---
title: "Session - YYYY-MM-DD <Proyecto> <Tema>"
tags: [session, trabajo]
created: YYYY-MM-DD
status: closed
domain: session
type: session
project_id: <slug-opcional>
source_of_truth: false
memory_updated: false
---
```

Reglas:

- Usar `status: closed`, no `active`.
- No poner `todo/prio1`, `todo/prio2` o `todo/prio3` en frontmatter.
- Si hay pendientes reales, poner prioridad en la linea de tarea: `#todo/prio1`, `#todo/prio2`.
- Si no hay pendientes, escribir `_(sin pendientes abiertos)_`.
- Incluir links a notas canonicas relevantes en `00_System/Memory/Projects/` cuando aplique.

Estructura de la nota:

```md
## Resumen
-

## Cambios / decisiones
-

## Insights durables
-

## Tareas abiertas
- [ ] ... #todo/prio2

## Links
-
```

## Consolidacion en memoria canonica

Ademas de la nota de sesion, actualiza `00_System/Memory/` solo si hay conocimiento durable:

- Estado actual de un proyecto, paths, deploys o commits importantes -> `00_System/Memory/Projects/<project>.md`.
- Preferencias del usuario o reglas de trabajo -> `00_System/Memory/Feedback/`.
- Cambios de estructura del vault o herramientas -> `00_System/Memory/References/` o `STRUCTURE_FOR_CLAUDE.md`.
- Nuevo proyecto o cambio importante de keywords -> `00_System/Memory/MEMORY.md`.

Al actualizar memoria canonica:

- Mantener `source_of_truth: true`.
- Actualizar `last_verified: YYYY-MM-DD`.
- Cambiar `memory_updated: true` en la nota de sesion.
- Si una nota historica contradice la memoria canonica, dejar la memoria canonica como estado vigente.

## Validacion antes de responder

1. Revisa que los archivos modificados no contengan secretos obvios.
2. Revisa que no escribiste en `.claude-memory/`.
3. Revisa que la sesion no quedo con `status: active` ni tags `todo/prio*` en frontmatter.
4. Ejecuta `git -C /home/apolo/Documents/ClaudeCode_Projects/vault status --short` y resume los archivos tocados.

Al terminar, muestra este recordatorio exacto como ultima linea de tu respuesta:

> Sesion guardada. Si terminaste de trabajar, ejecuta `/compact` para liberar contexto.
