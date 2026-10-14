# /resume

Retoma el contexto de trabajo desde el vault, cargando **lo mínimo**. Argumento opcional: un
proyecto (`/resume jornada`). Vault: `/home/apolo/Documents/Projects/vault` (abajo, `$V`).

## Modo read-only

Solo leer: no crear, editar, mover ni archivar notas, no ejecutar `/compress`, no escribir en
`.claude-memory/`. Reglas de precedencia en `$V/CLAUDE.md` §2 (gana la canónica con
`source_of_truth: true`; entre dos, la de `last_verified` más reciente).

## 1. Sincronizar sin tocar nada

`git -C $V fetch --quiet` y `git -C $V status --short --branch`. Si está behind/ahead o hay
cambios locales, reportarlo. **No** `pull`/`merge`/`rebase`/`checkout`/`reset` sin permiso.

## 2. Elegir el modo

- **Con proyecto** — si hay argumento, o si el directorio actual es un repo con `CLAUDE.local.md`
  o con una ruta que aparece en `$V/00_System/Memory/MEMORY.md`.
- **Panorama** — en cualquier otro caso.

## 3a. Modo proyecto

1. De la canónica, leer **solo** `## Retomar` y `## Estado` (Read con offset/limit o extrayendo
   las secciones). No cargar la nota entera.
2. De la nota operativa, solo los pendientes abiertos: `grep -n '^- \[ \]'`.
3. La última nota de sesión que cita `## Retomar`, solo si el Estado no basta para la tarea.
4. **Verificar contra el repo** lo que se pueda en segundos: `git log -1`, rama, cambios sin
   commitear. Si contradice a la canónica, gana el repo y se reporta como riesgo.
5. Gotchas: solo si la siguiente acción toca deploy, migraciones, datos o integraciones.

## 3b. Modo panorama

Sin abrir notas completas:
- `grep` del frontmatter de `$V/01_Projects/*.md` (`status`, `updated`, `review_date`) para listar
  proyectos activos, los dormidos con `review_date` vencido y los activos sin tocar >30 días.
- `grep -rn '#todo/prio1' $V/01_Projects/*.md` para las prioridades.
- `python3 -I $V/00_System/lint_vault.py --quiet` solo para contar riesgos de contexto (no detallar).

## 4. Presentar

Resumen ejecutivo corto: dónde quedó, pendientes con su bloqueo, riesgos o contradicciones, y
**una** siguiente acción concreta.

## Gotchas al leer

- Verificar en disco cualquier path antes de usarlo. Paths bajo `88. Proyectos`, `44. Web Apps`,
  `55. Archive`, `77. Proyectos`, `33. WebSites` son históricos.
- Hay tres dialectos de frontmatter en `00_System/Memory/` (plano, anidado `metadata:`, nativo
  `name`/`description`/`metadata.type`): al filtrar, contemplar los tres.
- `Projects/_historial/` no es estado actual: solo para trazabilidad.
