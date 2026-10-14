# /compress

Comprime la sesión actual y persiste en el vault lo que una sesión futura necesita para retomar.
Vault: `/home/apolo/Documents/Projects/vault` (abajo, `$V`).

## 0. Contrato primero

Leer `$V/CLAUDE.md` (no se auto-carga fuera del vault). Ese archivo es la fuente de verdad: forma
de la canónica y sus presupuestos (§4), dónde va cada cosa (§3), frontmatter y `status` (§5),
dialectos (§6). **Este comando no repite esas reglas; si algo de aquí lo contradice, gana el
contrato y este archivo tiene un bug: reportarlo.**

## 1. Situarse

1. `git -C $V status --short --branch`. Cambios ajenos a esta sesión: trabajar alrededor, no
   revertir. Behind/ahead: reportarlo; **no** `pull`/`merge`/`rebase`/`checkout`/`reset` sin permiso.
2. **Detectar el proyecto**, en este orden:
   - `CLAUDE.local.md` en la raíz del repo de trabajo (`git rev-parse --show-toplevel`): trae la
     ruta de la canónica.
   - Si no hay puente: buscar la ruta del repo relativa a `~/Documents/Projects/` entre los paths
     en backticks de `$V/00_System/Memory/MEMORY.md`.
   - Sesión de sistema/tooling sin proyecto: no hay canónica de proyecto (pasar al punto 3.1).
3. Leer la canónica del proyecto y su nota operativa (`canonical_path` apunta de una a otra).

## 2. Qué extraer de la conversación

Solo lo que vale en una sesión futura: decisiones y **su porqué**, cambios reales (paths, commits,
deploys **verificados en el repo**, no recordados), bugs y gotchas, pendientes reales con su
bloqueo, y correcciones del usuario a cómo trabajo (→ `Memory/Feedback/`). Nada de transcripción
ni razonamiento interno.

**Seguridad:** el hook de sync publica el vault en GitHub al terminar el turno. Nunca escribir
valores de API keys, tokens, passwords, cookies, JWT, private keys ni `.env`; solo **dónde** viven.

## 3. Escribir, en orden

1. **Nota de sesión** — `01_Projects/_sessions/` (proyecto) o `02_Areas/_sessions/` (sistema),
   `session_YYYY-MM-DD_<tema-kebab>.md`, `status: completed`, secciones `## Resumen`,
   `## Cambios / decisiones`, `## Insights durables`, `## Links`. **Sin pendientes ni tags
   `todo/prio*`**: los pendientes tienen un solo dueño (paso 2).
2. **Nota operativa** (`01_Projects/<Proyecto>.md`) — pendientes nuevos y cerrados, `updated: <hoy>`.
   Si el proyecto no tiene, crearla (contrato §5) en vez de dejar pendientes en la canónica.
3. **Canónica** (`00_System/Memory/Projects/project_<slug>.md`):
   - `## Retomar`: si falta, **crearla ahora** con lo verificado en el repo (`package.json`,
     docs, remote). Si existe, actualizar lo que cambió (deploy, comandos, última sesión).
   - `## Estado`: reescribir para que diga cómo está **hoy**, dentro del presupuesto. La narrativa
     de lo hecho va a la bitácora o a la nota de sesión, no aquí.
   - Gotchas nuevos a su sección (nunca se podan). Entrada nueva arriba en `## Bitácora`.
   - **Rotación:** si la bitácora pasa de 5 entradas, mover las más viejas **tal cual** al final de
     `Projects/_historial/historial_<slug>.md` (crearlo con el frontmatter de §4 si no existe).
     Verificar que no se perdió texto (cada línea del original está en canónica o historial).
   - `last_verified: <hoy>`, conteo del comentario-puntero contra el disco
     (`ls <carpeta>/_sessions | grep -ic <término>`), sin aplanar frontmatter anidado ni nativo.
4. **Memoria transversal** — feedback del usuario o referencia técnica nueva, en `Memory/Feedback/`
   o `Memory/References/`, más **una línea** en `MEMORY.md` (≤150 caracteres, solo hook; nunca
   estado de proyecto).
5. **Puente del repo** — si el proyecto tiene canónica con `## Retomar` y su repo no tiene
   `CLAUDE.local.md`: comprobar primero `git check-ignore -q CLAUDE.local.md` dentro del repo (si
   NO está ignorado, no crearlo: el hook lo commitearía; avisar). Si está ignorado, crearlo con la
   plantilla de `reference_vault_obsidian` § Puentes.

## 4. Validar (mecánico, no de memoria)

```bash
python3 -I $V/00_System/lint_vault.py --quiet
```
Las notas tocadas en esta sesión deben quedar **sin hallazgos nuevos**: en particular 3 (wikilinks
rotos), 7 (sesión con prio), 12–13 (índice) y 14–16 (presupuestos, `## Retomar`, tamaño de
`MEMORY.md`). Los hallazgos viejos de otras notas no bloquean; mencionarlos si son pocos.
Además: `grep` de patrones de secretos sobre los archivos escritos.

## 5. Commit con mensaje útil

Hacer commit **solo de los archivos que tocó esta sesión** (`git -C $V add <archivos>`), con mensaje
`vault: <título de la nota de sesión>`. Así el historial sirve para buscar; el hook de sync solo
empuja (ya no encuentra cambios que commitear con `chore: sync sesión`).

## 6. Responder

Resumen breve: notas tocadas, tamaño de la canónica antes → después si cambió, hallazgos del
linter que quedaron. Terminar con esta línea exacta:

> Sesion guardada. Si terminaste de trabajar, ejecuta `/compact` para liberar contexto.
