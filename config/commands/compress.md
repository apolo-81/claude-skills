# /compress

Comprime la sesión actual y persiste el conocimiento en el vault de Obsidian.

## Fuente de verdad: el contrato del vault

**Paso obligatorio antes de escribir nada**: leer `/home/apolo/Documents/Projects/vault/CLAUDE.md`.
Ese archivo es el contrato del vault (orden de carga, precedencia en conflictos, tabla "dónde
escribo qué", forma obligatoria de una canónica, vocabulario de `status`, dialectos de
frontmatter) y **gana sobre cualquier cosa que diga este comando**. No se auto-carga cuando la
sesión se abre desde un repo de proyecto, así que hay que leerlo explícitamente.

Este comando NO repite esas reglas: solo aporta lo que es propio del acto de comprimir. Si algo
de aquí contradice a `CLAUDE.md`, es un bug de este archivo — reportarlo.

Después del contrato, leer `00_System/Memory/MEMORY.md` (índice; cada línea es un hook de recall)
y solo las canónicas que la sesión realmente tocó.

## Antes de escribir

1. `git -C /home/apolo/Documents/Projects/vault status --short --branch`.
2. Si hay cambios locales ajenos a esta sesión, trabajar alrededor de ellos: no revertir ni
   sobrescribir.
3. Si el vault está behind/ahead, reportarlo. **No** ejecutar `pull`, `merge`, `rebase`,
   `checkout` ni `reset` sin permiso explícito del usuario.

## Qué extraer de la conversación

Solo lo que tendrá valor en una sesión futura:

- Decisiones tomadas y **por qué** (el porqué es lo que no se puede reconstruir del código).
- Cambios implementados, con paths, commits o deploys reales.
- Bugs, gotchas y patrones aprendidos.
- Tareas abiertas reales, bloqueos y de quién dependen.
- Correcciones del usuario a cómo trabajo → van a `Memory/Feedback/`.

No guardar transcripción, ruido conversacional ni razonamiento interno.

## Seguridad (crítico: el push es inmediato)

El hook `Stop` de Claude Code ejecuta `sync-all.sh` al terminar cada turno, que hace
**commit y push automáticos** del vault a GitHub. No hay ventana para "lo limpio después": lo que
se escriba queda publicado. Antes de escribir, redactar API keys, tokens, passwords, cookies,
JWTs, private keys, webhook secrets, `x-api-key`, bearer/access tokens y valores `.env`.

En la nota va **solo la ubicación** del secreto (password manager, panel del proveedor, env var
de la plataforma de deploy), nunca el valor.

## Qué escribir, en orden

### 1. Nota de sesión (siempre)

En `01_Projects/_sessions/` (trabajo de proyecto) o `02_Areas/_sessions/` (tooling, Claude Code,
vault, sistemas personales). Nombre: `session_YYYY-MM-DD_<tema-kebab>.md` — **convención única**,
sin excepciones ni formatos tolerados.

```yaml
---
title: "Session - YYYY-MM-DD <Proyecto> <Tema>"
tags: [<proyecto-o-area>, <tema>]
created: YYYY-MM-DD
status: completed
domain: session
---
```

- `status`: `completed` o `closed`. Nunca `active`.
- **Sin tags `todo/prio*` ni checkboxes `#todo/prio*` en ninguna parte de la nota.** Los
  pendientes tienen un dueño único: la nota operativa de `01_Projects/`, que es la que lee el
  Dataview `TASK` del Dashboard. Duplicarlos aquí hace que las dos listas se separen.
- Secciones: `## Resumen`, `## Cambios / decisiones`, `## Insights durables`, `## Links`.
- Enlazar la canónica del proyecto y las sesiones hermanas con `[[wikilinks]]`.

### 2. Nota operativa en `01_Projects/` (si la sesión tocó un proyecto)

- Actualizar/añadir los pendientes reales aquí — es su único dueño.
- `updated: <hoy>` en el frontmatter: alimenta las vistas "Última edición" y "Estancados" del
  Dashboard. **No confiar en `file.mtime`** (un clone/restore/sync lo resetea en masa).
- Si el proyecto quedó dormido: `status: dormido`, quitar los tags `todo/prio*`, y añadir
  `review_date:` salvo que la nota declare explícitamente que no debe reclamar atención.
- Vocabulario de `status`: el cerrado que define `CLAUDE.md` §5. `parked` y `latente` están
  prohibidos.

### 3. Canónica en `00_System/Memory/` (solo si hay conocimiento durable)

Respetar la forma del §4 del contrato — es donde más se rompen las canónicas:

- `## Estado` **se reescribe**, no se acumula. Es la única sección que responde "¿cómo está esto hoy?".
- Lo fechado se **anexa a `## Bitácora`** (`### YYYY-MM-DD — título`, más reciente arriba). Nunca
  una sección nueva por encima del `---`.
- Los gotchas suben a `## Gotchas vigentes`; lo que se poda es la narración, nunca un gotcha.
- `## Pendientes` es **solo un puntero** a la nota operativa.
- Un dato corregido se corrige en `## Estado` y se marca como histórico en la bitácora — no se
  deja contradiciendo.
- Actualizar el **conteo del comentario-puntero** de la canónica al añadir una sesión, y
  verificarlo contra el disco (`ls <carpeta>/_sessions | grep -ic <término>`).
- Mantener `source_of_truth: true` y refrescar `last_verified: <hoy>`.
- **No aplanar el frontmatter anidado** (`name`/`description`/`metadata:`) de las notas que
  genera la herramienta de memoria automática: lo reescribe así.

Destinos: estado/arquitectura/gotchas de proyecto → `Memory/Projects/project_<slug>.md`;
preferencias y correcciones del usuario → `Memory/Feedback/feedback_<slug>.md`; referencias
técnicas y de sistema → `Memory/References/reference_<slug>.md`; proyecto nuevo o cambio de
keywords → una línea en `MEMORY.md`.

### Prohibido

- Escribir memoria nueva en `.claude-memory/` (legacy, solo redirect).
- Escribir bitácoras en `03_Resources/` (es para clippings, síntesis y referencias consultables).
- Recrear `05_Daily/` (eliminada el 2026-07-26).
- Antes de declarar algo "pendiente de commitear/desplegar", **verificarlo en el repo**.

## Validación antes de responder

1. Ningún secreto en lo escrito.
2. Nada escrito en `.claude-memory/` ni en `03_Resources/`.
3. La nota de sesión: nombre en convención, `status` terminal, sin `todo/prio*`.
4. Si se tocó un proyecto: su nota operativa tiene `updated:` de hoy y es la única con pendientes.
5. Si se tocó una canónica: `last_verified` de hoy y el conteo del comentario-puntero cuadra con
   el disco.
6. `git -C /home/apolo/Documents/Projects/vault status --short` y resumir los archivos tocados.

Al terminar, mostrar esta línea exacta al final de la respuesta:

> Sesion guardada. Si terminaste de trabajar, ejecuta `/compact` para liberar contexto.
