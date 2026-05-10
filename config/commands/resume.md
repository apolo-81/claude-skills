# /resume

Retoma el contexto desde el vault de Obsidian usando la memoria canonica nueva.

## Reglas de seguridad

- Modo working-tree read-only: no crear, mover, renombrar, archivar ni consolidar notas.
- No escribir en `.claude-memory/`; esa carpeta es legacy y solo redirige.
- No ejecutar `/compress` ni workflows de consolidacion.
- Si hay conflicto entre fuentes, gana `00_System/Memory/**` con `source_of_truth: true` y `last_verified` mas reciente.

## Procedimiento

1. **Sincronizacion sin tocar el working tree**: ejecuta `git -C ~/Documents/ClaudeCode_Projects/vault fetch --quiet` y luego `git -C ~/Documents/ClaudeCode_Projects/vault status --short --branch`. Si el vault esta behind/ahead o tiene cambios locales, reportalo; no ejecutes `git pull`, merge, rebase, checkout ni reset sin permiso explicito del usuario.
2. Lee primero:
   - `00_System/Memory/MEMORY.md`
   - `00_System/Memory/STRUCTURE_FOR_CLAUDE.md`
3. Carga solo las notas canonicas enlazadas que sean relevantes para el resumen:
   - `00_System/Memory/Projects/`
   - `00_System/Memory/Feedback/`
   - `00_System/Memory/References/`
   - `00_System/Memory/People/`
4. Lee el estado operativo visible:
   - nota diaria reciente en `05_Daily/`
   - proyectos no-session en `01_Projects/` con `status: active` y `domain: project`
   - tareas pendientes reales con `todo/prio1` o `todo/prio2`, excluyendo archivos `Session...` salvo que una nota canonica los cite
5. Presenta resumen ejecutivo:
   - prioridades activas
   - pendientes concretos
   - ultima actividad registrada
   - riesgos de contexto o contradicciones detectadas
6. Propone siguiente accion concreta basada en prioridades.

Vault: `/home/apolo/Documents/ClaudeCode_Projects/vault/` — usa Read, Glob/Grep y comandos que no modifiquen archivos del vault.
