# /resume

Retoma el contexto de trabajo desde el vault de Obsidian.

## Modo read-only

- No crear, editar, mover, renombrar, archivar ni consolidar notas. Solo Read, Glob y Grep.
- No ejecutar `/compress` ni ningún workflow de consolidación.
- No escribir en `.claude-memory/` (legacy, solo redirect).

## Fuente de verdad

Leer `/home/apolo/Documents/Projects/vault/CLAUDE.md` primero: define el orden de carga (§1) y
quién gana ante un conflicto (§2). Este comando no repite esas reglas; si algo aquí lo
contradice, gana el contrato.

En corto: gana la nota de `00_System/Memory/**` con `source_of_truth: true`, y entre dos
canónicas que se contradicen, la de `last_verified` más reciente.

## Procedimiento

1. **Sincronizar sin tocar el working tree**: `git -C ~/Documents/Projects/vault fetch --quiet`
   y luego `git -C ~/Documents/Projects/vault status --short --branch`. Si está behind/ahead o
   hay cambios locales, reportarlo. **No** ejecutar `pull`, `merge`, `rebase`, `checkout` ni
   `reset` sin permiso explícito del usuario.
2. Leer `00_System/Memory/MEMORY.md` — el índice. Cada línea es un hook de recall; **no cargar
   todo el vault**.
3. Cargar solo las canónicas relevantes que el índice enlace: `Memory/Projects/`,
   `Memory/Feedback/`, `Memory/References/`, `Memory/People/`.
4. Leer el estado operativo:
   - notas de `01_Projects/` (raíz, no `_sessions/`) con `status: active`;
   - sus pendientes con `todo/prio1` / `todo/prio2` — la nota operativa es el **dueño único** de
     los pendientes, así que no hace falta buscarlos en otro lado;
   - proyectos `dormido` cuyo `review_date` ya venció (esos sí reclaman atención);
   - notas de `_sessions/` **solo** si una canónica las cita o hace falta trazabilidad.
5. Presentar el resumen ejecutivo: prioridades activas, pendientes concretos con su bloqueo,
   última actividad registrada, y contradicciones o riesgos de contexto detectados.
6. Proponer una siguiente acción concreta.

## Gotchas al leer

- **Verificar en disco** cualquier path antes de usarlo en un comando. Los paths bajo
  `/home/apolo/Documents/88. Proyectos`, `/44. Web Apps`, `/55. Archive`, `/77. Proyectos` y
  `/33. WebSites` son históricos y ya no existen.
- Las canónicas de `00_System/Memory/` pueden usar **frontmatter anidado**
  (`metadata: {status, domain, …}`): al filtrar por campos, contemplar ambos dialectos o esas
  notas quedan invisibles.
- `05_Daily/` ya no existe (eliminada 2026-07-26); sus notas históricas están en `04_Archive/`.
- El estado de un proyecto vive en su canónica + su nota operativa. Si una nota de sesión
  contradice a la canónica, gana la canónica.

Vault: `/home/apolo/Documents/Projects/vault/`
