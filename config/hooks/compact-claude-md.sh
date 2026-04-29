#!/bin/bash
# compact-claude-md.sh
# PostToolUse hook: auto-compacts CLAUDE.md files that exceed 200 lines.
# Reads JSON from stdin (Claude Code hook format).
# Loop prevention: only triggers if current line count > 200.

# Read JSON payload from stdin (use || true so malformed JSON doesn't abort)
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // ""' 2>/dev/null || echo "")
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""' 2>/dev/null || echo "")

# Only handle Edit and Write tools
if [[ "$TOOL_NAME" != "Edit" && "$TOOL_NAME" != "Write" ]]; then
  exit 0
fi

# Only handle CLAUDE.md files — skip node_modules and plugin cache
if [[ "$FILE" != *"CLAUDE.md"* ]] || \
   [[ "$FILE" == *"node_modules"* ]] || \
   [[ "$FILE" == *"plugins/cache"* ]]; then
  exit 0
fi

# File must exist and be readable
if [ ! -f "$FILE" ]; then
  exit 0
fi

# Count lines — only act if over threshold (loop prevention)
LINE_COUNT=$(wc -l < "$FILE")

if [ "$LINE_COUNT" -le 200 ]; then
  exit 0
fi

echo "⚠️  CLAUDE.md tiene $LINE_COUNT líneas (>200) — auto-compactando..." >&2

# Write content to temp file to avoid shell expansion issues
TMPFILE=$(mktemp)
cat "$FILE" > "$TMPFILE"

COMPACTED=$(claude -p "Compacta el siguiente CLAUDE.md a menos de 200 líneas.

ELIMINAR (contenido derivable o no-esencial):
- Design system: colores, fuentes, clases CSS (está en los archivos CSS)
- Variantes de animación (está en animations.js o similar)
- Datos de negocio ya presentes en archivos del proyecto (programs.js, blog.json, etc.)
- Secciones de tareas resueltas o pendientes (changelog → git history)
- Métricas de proyecto: marketing score, performance data histórica, audit scores
- Troubleshooting genérico (está en docs de la herramienta)
- Opciones de deploy no usadas actualmente
- Fixes históricos y changelogs
- Opciones de infraestructura futuras no activas
- Ejemplos de código completos cuando el patrón es evidente en el código

CONSERVAR (siempre):
- Comandos no-obvios o que requieren contexto especial
- Patrones arquitectónicos críticos no-derivables del código
- Reglas que romperían el sistema si se violan (deploy constraints, library gotchas)
- Integraciones externas con IDs/keys hardcoded
- Variables de entorno no-obvias o compartidas entre proyectos
- Gotchas de base de datos, librerías o deploy
- Credenciales de test de producción

Devuelve SOLO el contenido del archivo. Sin explicaciones, sin markdown adicional, sin bloques de código envolventes.

$(cat "$TMPFILE")" 2>/dev/null || true

rm -f "$TMPFILE"

if [ -n "${COMPACTED// }" ]; then
  echo "$COMPACTED" > "$FILE"
  NEW_COUNT=$(wc -l < "$FILE")
  echo "✅ Compactado: $LINE_COUNT → $NEW_COUNT líneas — $FILE" >&2
else
  echo "❌ Auto-compact falló (respuesta vacía) — archivo sin cambios" >&2
fi
