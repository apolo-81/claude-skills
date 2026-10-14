#!/bin/bash
# compact-claude-md.sh — PostToolUse (Edit|Write)
# Avisa a Claude cuando un CLAUDE.md pasa de 200 líneas. NO lo reescribe.
#
# 2026-10-14: antes llamaba a `claude -p` y sobrescribía el archivo con la versión compactada, sin
# revisión ni respaldo (websites/vision-consulting/CLAUDE.md tenía 561 líneas y se habría reescrito
# en la siguiente edición). Ahora inyecta un aviso en el contexto de Claude, una vez por archivo y
# sesión, para que proponga la compactación al usuario.

INPUT=$(cat)
TOOL_NAME=$(jq -r '.tool_name // ""' <<<"$INPUT" 2>/dev/null)
FILE=$(jq -r '.tool_input.file_path // ""' <<<"$INPUT" 2>/dev/null)
SESSION=$(jq -r '.session_id // "nosession"' <<<"$INPUT" 2>/dev/null)

[[ "$TOOL_NAME" == "Edit" || "$TOOL_NAME" == "Write" ]] || exit 0
[[ "$(basename "$FILE")" == "CLAUDE.md" ]] || exit 0
[[ "$FILE" == *node_modules* || "$FILE" == *plugins/cache* ]] && exit 0
[ -f "$FILE" ] || exit 0

LIMIT=200
LINES=$(wc -l < "$FILE")
[ "$LINES" -gt "$LIMIT" ] || exit 0

# Un aviso por archivo y sesión
MARK_DIR="${XDG_RUNTIME_DIR:-/tmp}/claude-md-warn"
mkdir -p "$MARK_DIR"
MARK="$MARK_DIR/${SESSION}_$(printf '%s' "$FILE" | md5sum | cut -c1-12)"
[ -e "$MARK" ] && exit 0
touch "$MARK"

MSG="Aviso: $FILE tiene $LINES líneas (límite $LIMIT). Claude Code lo carga entero en cada sesión. Propón al usuario compactarlo (quitar lo derivable del código, changelogs y tareas resueltas; conservar comandos no obvios, gotchas y reglas que romperían el sistema). No lo reescribas sin su aprobación."
jq -n --arg msg "$MSG" '{hookSpecificOutput: {hookEventName: "PostToolUse", additionalContext: $msg}}'
exit 0
