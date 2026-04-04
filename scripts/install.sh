#!/usr/bin/env bash
# install.sh — Restaurar configuración de Claude Code desde este repo
# Uso: bash scripts/install.sh
# Requisitos: Claude Code instalado, ccpm disponible

set -e

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CLAUDE_DIR="$HOME/.claude"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  Claude Code — Restore Setup${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

# ─── 1. Skills personalizadas ─────────────────────────────────────────────
echo -e "${YELLOW}[1/5] Instalando skills personalizadas...${NC}"
mkdir -p "$CLAUDE_DIR/skills"

SKILLS=(
  auth-patterns background-jobs chatbot-widget cms-integration
  data-viz-dashboard deployment email-templates-builder error-monitoring
  express-api form-handling ghl-integration landing-page-builder
  market market-ads market-audit market-brand market-competitors
  market-copy market-emails market-funnel market-landing market-launch
  market-proposal market-report market-report-pdf market-social
  n8n-ai-agents n8n-to-api pdf-generation performance-next prisma-orm
  pro-presentations pwa-patterns saas-boilerplate seo-assets
  seo-content-onpage seo-core seo-international seo-strategy
  supabase-stack testing-patterns ui-designer web-animations
  webhook-integration
)

for skill in "${SKILLS[@]}"; do
  if [ -d "$REPO_DIR/$skill" ]; then
    cp -r "$REPO_DIR/$skill" "$CLAUDE_DIR/skills/"
    echo -e "  ${GREEN}✓${NC} $skill"
  fi
done

# ─── 2. Plugins del marketplace ───────────────────────────────────────────
echo ""
echo -e "${YELLOW}[2/5] Instalando plugins del marketplace...${NC}"

# Verificar ccpm
if ! command -v ccpm &>/dev/null; then
  echo "  Instalando ccpm..."
  npm install -g @daymade/ccpm
fi

# Marketplaces registrados
echo "  Registrando marketplaces..."
# Los marketplaces se restauran con settings.json — ccpm los detecta automáticamente

# Plugins oficiales de Anthropic (claude-plugins-official)
OFFICIAL_PLUGINS=(context7 ralph-loop commit-commands playground superpowers playwright plugin-dev code-review feature-dev)
for p in "${OFFICIAL_PLUGINS[@]}"; do
  echo -e "  Instalando ${p}..."
  ccpm install "${p}@claude-plugins-official" --force 2>/dev/null || echo -e "  ${YELLOW}⚠${NC} ${p} — instalar manualmente"
done

# Plugins de daymade-skills
DAYMADE_PLUGINS=(claude-code-history-files-finder competitors-analysis deep-research pdf-creator ppt-creator skill-reviewer skills-search)
for p in "${DAYMADE_PLUGINS[@]}"; do
  echo -e "  Instalando ${p}..."
  ccpm install "${p}@daymade-skills" --force 2>/dev/null || echo -e "  ${YELLOW}⚠${NC} ${p} — instalar manualmente"
done

# Otros plugins
ccpm install "debugging-toolkit@claude-code-workflows" --force 2>/dev/null || true
ccpm install "codex@openai-codex" --force 2>/dev/null || true

# ─── 3. Configuración principal ───────────────────────────────────────────
echo ""
echo -e "${YELLOW}[3/5] Restaurando configuración...${NC}"

# CLAUDE.md global
cp "$REPO_DIR/config/CLAUDE.md" "$CLAUDE_DIR/CLAUDE.md"
echo -e "  ${GREEN}✓${NC} CLAUDE.md"

# settings.json — merge manual recomendado, no sobreescribir ciegamente
if [ ! -f "$CLAUDE_DIR/settings.json" ]; then
  cp "$REPO_DIR/config/settings.json" "$CLAUDE_DIR/settings.json"
  echo -e "  ${GREEN}✓${NC} settings.json (nuevo)"
else
  echo -e "  ${YELLOW}⚠${NC} settings.json ya existe — revisar manualmente: $REPO_DIR/config/settings.json"
fi

# Statusline
cp "$REPO_DIR/config/statusline-command.sh" "$CLAUDE_DIR/statusline-command.sh"
chmod +x "$CLAUDE_DIR/statusline-command.sh"
echo -e "  ${GREEN}✓${NC} statusline-command.sh"

# ─── 4. Agents y Commands personalizados ─────────────────────────────────
echo ""
echo -e "${YELLOW}[4/5] Restaurando agents y commands...${NC}"

mkdir -p "$CLAUDE_DIR/agents" "$CLAUDE_DIR/commands"
cp "$REPO_DIR/config/agents/"*.md "$CLAUDE_DIR/agents/" 2>/dev/null && echo -e "  ${GREEN}✓${NC} agents (4)"
cp "$REPO_DIR/config/commands/"*.md "$CLAUDE_DIR/commands/" 2>/dev/null && echo -e "  ${GREEN}✓${NC} commands (3)"

# ─── 5. Scripts ───────────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[5/5] Instalando scripts...${NC}"

mkdir -p "$HOME/.local/bin"
cp "$REPO_DIR/scripts/skill-toggle" "$HOME/.local/bin/skill-toggle"
chmod +x "$HOME/.local/bin/skill-toggle"
echo -e "  ${GREEN}✓${NC} skill-toggle → ~/.local/bin/"

# Verificar PATH
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
  echo -e "  ${YELLOW}⚠${NC} Agrega ~/.local/bin al PATH en tu .bashrc/.zshrc:"
  echo "     export PATH=\"\$HOME/.local/bin:\$PATH\""
fi

# ─── Configurar grupos OFF por defecto ───────────────────────────────────
echo ""
echo -e "${YELLOW}Configurando grupos toggleables (audit y n8n → OFF por defecto)...${NC}"
skill-toggle audit off 2>/dev/null || echo "  (ejecutar manualmente: skill-toggle audit off)"
skill-toggle n8n off 2>/dev/null || echo "  (ejecutar manualmente: skill-toggle n8n off)"

# ─── Resumen ─────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}  ✓ Restauración completada${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""
echo "Próximos pasos:"
echo "  1. Reiniciar Claude Code (o /reload-plugins)"
echo "  2. Verificar settings.json si ya existía (no se sobreescribió)"
echo "  3. Configurar MCP servers (obsidian, supabase, openspace) si aplica"
echo ""
echo "Grupos toggleables:"
echo "  skill-toggle audit on   → Activar SEO + Market audit"
echo "  skill-toggle n8n on     → Activar N8N/Automatización"
echo ""
