#!/usr/bin/env bash
# install.sh — Instala las skills de Claude Code y el script skill-toggle
set -e

SKILLS_DIR="$HOME/.claude/skills"
BIN_DIR="$HOME/.local/bin"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Instalando Claude Skills...${NC}"

# Crear directorio de skills si no existe
mkdir -p "$SKILLS_DIR"
mkdir -p "$BIN_DIR"

# Copiar todas las skills
copied=0
skipped=0
for dir in "$SCRIPT_DIR"/*/; do
    skill=$(basename "$dir")
    # Saltar directorios que no son skills
    [[ "$skill" == "bin" ]] && continue
    [[ "$skill" == "backup" ]] && continue
    [[ "$skill" == "docs" ]] && continue
    [[ "$skill" == ".git" ]] && continue

    if [ -d "$SKILLS_DIR/$skill" ]; then
        echo -e "  ${YELLOW}EXISTS${NC}  $skill (se sobreescribe)"
    fi
    cp -r "$dir" "$SKILLS_DIR/$skill"
    ((copied++))
done

# Instalar skill-toggle
cp "$SCRIPT_DIR/bin/skill-toggle" "$BIN_DIR/skill-toggle"
chmod +x "$BIN_DIR/skill-toggle"

echo ""
echo -e "${GREEN}Instalacion completada:${NC}"
echo "  $copied skills copiadas a $SKILLS_DIR"
echo "  skill-toggle instalado en $BIN_DIR/skill-toggle"
echo ""
echo "Usa 'skill-toggle status' para ver el estado de las skills."
