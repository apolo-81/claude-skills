#!/bin/bash
# laptop-setup.sh — Asistente interactivo para configurar la laptop
# Detecta qué está instalado y guía paso a paso lo que falta.
#
# Prerequisitos mínimos antes de correr este script:
#   sudo apt install -y git curl
#   git clone git@github.com:apolo-81/vault-obsidian.git ~/Documents/ClaudeCode_Projects/vault
#   bash ~/Documents/ClaudeCode_Projects/vault/03_Resources/laptop-setup.sh

set -uo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
GRAY='\033[0;90m'
BOLD='\033[1m'
NC='\033[0m'

ok()    { echo -e "  ${GREEN}✓${NC} $1"; }
miss()  { echo -e "  ${RED}✗${NC} $1"; }
warn()  { echo -e "  ${YELLOW}⚠${NC} $1"; }
info()  { echo -e "  ${BLUE}ℹ${NC} $1"; }
note()  { echo -e "  ${GRAY}$1${NC}"; }

ask() {
  local r
  read -rp "$(echo -e "  ${YELLOW}?${NC} $1 [s/N]: ")" r
  [[ "$r" =~ ^[sSyY]$ ]]
}

pause() {
  read -rp "$(echo -e "  ${BLUE}↵${NC} ${1:-Presiona Enter para continuar}...")" _
}

step() {
  echo
  echo -e "${BOLD}${BLUE}══════════════════════════════════════════════════${NC}"
  echo -e "${BOLD}${BLUE}  $1${NC}"
  echo -e "${BOLD}${BLUE}══════════════════════════════════════════════════${NC}"
}

has() { command -v "$1" &>/dev/null; }

VAULT="$HOME/Documents/ClaudeCode_Projects/vault"
BASE="$HOME/Documents/ClaudeCode_Projects"
SKILLS="$HOME/.claude/skills"

# ═══════════════════════════════════════════════════════════════
# Paso 1 — Sistema base
# ═══════════════════════════════════════════════════════════════
step "1/9  Dependencias del sistema"

NEED_APT=()
for pkg in git curl build-essential python3 python3-pip; do
  if dpkg -s "$pkg" &>/dev/null; then ok "$pkg"; else miss "$pkg"; NEED_APT+=("$pkg"); fi
done

if [ ${#NEED_APT[@]} -gt 0 ]; then
  echo
  warn "Faltan: ${NEED_APT[*]}"
  if ask "¿Instalar con apt ahora?"; then
    sudo apt update && sudo apt install -y "${NEED_APT[@]}"
  fi
fi

# ═══════════════════════════════════════════════════════════════
# Paso 2 — Node.js (nvm + LTS)
# ═══════════════════════════════════════════════════════════════
step "2/9  Node.js"

if [ -d "$HOME/.nvm" ]; then
  ok "nvm instalado"
  export NVM_DIR="$HOME/.nvm"
  # shellcheck source=/dev/null
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
else
  miss "nvm"
  if ask "¿Instalar nvm + Node LTS?"; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    # shellcheck source=/dev/null
    . "$NVM_DIR/nvm.sh"
    nvm install --lts
    nvm use --lts
  fi
fi

if has node; then ok "node $(node --version)"; else miss "node"; fi
if has npm;  then ok "npm $(npm --version)";   else miss "npm";  fi

# ═══════════════════════════════════════════════════════════════
# Paso 3 — uv / uvx (para MCPs Python)
# ═══════════════════════════════════════════════════════════════
step "3/9  uv (runtime para MCPs Python)"

if has uv && has uvx; then
  ok "uv  $(uv --version  | awk '{print $2}')"
  ok "uvx $(uvx --version | awk '{print $2}')"
else
  miss "uv/uvx"
  if ask "¿Instalar uv (installer oficial)?"; then
    curl -LsSf https://astral.sh/uv/install.sh | sh
    # añadir al PATH del shell actual
    export PATH="$HOME/.local/bin:$PATH"
    if has uv; then ok "uv instalado — recuerda reabrir terminal después"; fi
  fi
fi

# ═══════════════════════════════════════════════════════════════
# Paso 4 — Claude Code
# ═══════════════════════════════════════════════════════════════
step "4/9  Claude Code CLI"

if has claude; then
  ok "claude $(claude --version 2>/dev/null || echo instalado)"
else
  miss "claude"
  if has npm && ask "¿Instalar Claude Code (npm global)?"; then
    npm install -g @anthropic-ai/claude-code
  fi
fi

# ═══════════════════════════════════════════════════════════════
# Paso 5 — Git config + SSH a GitHub
# ═══════════════════════════════════════════════════════════════
step "5/9  Git + SSH a GitHub"

if [ -n "$(git config --global user.email || true)" ]; then
  ok "git configurado: $(git config --global user.name) <$(git config --global user.email)>"
else
  miss "git user.name / user.email"
  if ask "¿Configurar git con mnoehde@gmail.com / Apolo?"; then
    git config --global user.name "Apolo"
    git config --global user.email "mnoehde@gmail.com"
    git config --global init.defaultBranch main
  fi
fi

# Detectar cualquier llave SSH existente (ed25519, rsa, ecdsa)
SSH_KEY=""
for cand in id_ed25519_laptop id_ed25519 id_rsa id_ecdsa; do
  if [ -f "$HOME/.ssh/$cand" ]; then
    SSH_KEY="$HOME/.ssh/$cand"
    break
  fi
done

if [ -n "$SSH_KEY" ]; then
  ok "Llave SSH encontrada: $SSH_KEY"
else
  miss "Llave SSH"
  if ask "¿Generar llave SSH ed25519 para esta laptop?"; then
    ssh-keygen -t ed25519 -C "laptop-$(hostname)" -f "$HOME/.ssh/id_ed25519_laptop" -N ""
    SSH_KEY="$HOME/.ssh/id_ed25519_laptop"
  fi
fi

# Asegurar que ssh-agent esté corriendo y la llave esté cargada
if [ -n "$SSH_KEY" ]; then
  if ! pgrep -u "$USER" ssh-agent &>/dev/null; then
    eval "$(ssh-agent -s)" &>/dev/null
    info "ssh-agent iniciado"
  fi
  if ! ssh-add -l 2>/dev/null | grep -qF "$(ssh-keygen -lf "$SSH_KEY" | awk '{print $2}')"; then
    ssh-add "$SSH_KEY" 2>/dev/null && ok "Llave agregada al agente"
  else
    ok "Llave ya cargada en ssh-agent"
  fi
fi

# Probar conexión con GitHub
SSH_TEST_OUTPUT=$(ssh -T -o StrictHostKeyChecking=accept-new -o BatchMode=yes git@github.com 2>&1 || true)
if echo "$SSH_TEST_OUTPUT" | grep -q "successfully authenticated"; then
  GH_USER=$(echo "$SSH_TEST_OUTPUT" | grep -oP 'Hi \K[^!]+')
  ok "SSH a GitHub funciona — autenticado como ${GH_USER:-?}"
else
  warn "SSH a GitHub no autentica todavía"
  if [ -n "$SSH_KEY" ] && [ -f "${SSH_KEY}.pub" ]; then
    echo
    info "Copia esta llave pública y agrégala en https://github.com/settings/keys :"
    echo
    cat "${SSH_KEY}.pub"
    echo
    if ask "¿Esperar y reintentar después de agregarla?"; then
      pause "Agrega la llave en GitHub y luego presiona Enter"
      if ssh -T -o BatchMode=yes git@github.com 2>&1 | grep -q "successfully authenticated"; then
        ok "Ahora sí autentica"
      else
        warn "Sigue sin autenticar — verifica que copiaste la llave completa"
      fi
    fi
  fi
fi

# ═══════════════════════════════════════════════════════════════
# Paso 6 — Vault + Claude config (skills, agents, hooks, marketplaces)
# ═══════════════════════════════════════════════════════════════
step "6/9  Vault + Claude config"

# Helper: asegurar que un repo esté en main y sincronizado con origin/main
# Maneja casos donde el clone vino con otra rama default (master, etc.)
sync_repo_to_main() {
  local repo_path="$1"
  local repo_name="$2"
  [ ! -d "$repo_path/.git" ] && return

  git -C "$repo_path" fetch origin --quiet 2>/dev/null

  local local_sha remote_sha
  local_sha=$(git -C "$repo_path" rev-parse HEAD 2>/dev/null)
  remote_sha=$(git -C "$repo_path" rev-parse origin/main 2>/dev/null)

  if [ "$local_sha" = "$remote_sha" ]; then
    ok "$repo_name sincronizado con origin/main"
    return
  fi

  warn "$repo_name desincronizado — local $((${#local_sha} > 7 ? 7 : 0))${local_sha:0:7} vs origin/main ${remote_sha:0:7}"
  if ask "¿Forzar sync con origin/main? (descarta cualquier cambio local en este clone)"; then
    git -C "$repo_path" checkout main 2>/dev/null || git -C "$repo_path" checkout -b main origin/main
    git -C "$repo_path" reset --hard origin/main --quiet
    ok "$repo_name → origin/main ($(git -C "$repo_path" rev-parse --short HEAD))"
  fi
}

if [ -d "$VAULT/.git" ]; then
  ok "Vault presente en $VAULT"
  sync_repo_to_main "$VAULT" "Vault"
else
  miss "Vault"
  if ask "¿Clonar vault?"; then
    mkdir -p "$BASE"
    git clone git@github.com:apolo-81/vault-obsidian.git "$VAULT"
  fi
fi

if [ -d "$SKILLS/.git" ]; then
  ok "claude-skills presente"
  sync_repo_to_main "$SKILLS" "claude-skills"
else
  miss "claude-skills"
  if ask "¿Clonar claude-skills?"; then
    git clone -b main git@github.com:apolo-81/claude-skills.git "$SKILLS"
  fi
fi

if [ -d "$SKILLS/config" ]; then
  if ask "¿Sincronizar agents/commands/hooks/settings desde claude-skills?"; then
    mkdir -p "$HOME/.claude/agents" "$HOME/.claude/commands" "$HOME/.claude/hooks"
    cp "$SKILLS/config/agents/"*        "$HOME/.claude/agents/" 2>/dev/null
    cp "$SKILLS/config/commands/"*      "$HOME/.claude/commands/" 2>/dev/null
    cp "$SKILLS/config/hooks/"*         "$HOME/.claude/hooks/" 2>/dev/null
    chmod +x "$HOME/.claude/hooks/"*.sh 2>/dev/null
    cp "$SKILLS/config/statusline-command.sh" "$HOME/.claude/" 2>/dev/null
    chmod +x "$HOME/.claude/statusline-command.sh" 2>/dev/null
    cp "$SKILLS/config/settings.json"   "$HOME/.claude/settings.json"
    ok "Config de Claude Code instalada"

    # Marketplaces locales
    MKTDIR="$HOME/.claude/plugins/marketplaces"
    mkdir -p "$MKTDIR"
    cp -rn "$SKILLS/marketplaces/"* "$MKTDIR/" 2>/dev/null && ok "Marketplaces locales copiados"
  fi
fi

# ═══════════════════════════════════════════════════════════════
# Paso 7 — MCPs globales (~/.claude.json) + memory symlink
# ═══════════════════════════════════════════════════════════════
step "7/9  MCPs globales + memoria"

if [ -f "$HOME/.claude.json" ] && grep -q "mcpServers" "$HOME/.claude.json"; then
  ok "~/.claude.json ya tiene MCPs"
else
  miss "~/.claude.json"
  if ask "¿Crear ~/.claude.json con MCPs (jcodemunch + obsidian; github opcional)?"; then
    GH_TOKEN=""
    echo
    info "El MCP de GitHub permite a Claude Code consultar la REST API de GitHub:"
    note "  - listar/crear issues y PRs"
    note "  - buscar código en repos"
    note "  - leer comentarios de PRs"
    note "  NO es necesario para git clone/push/pull (eso ya lo hace SSH)"
    note "  El PAT (Personal Access Token) se genera en:"
    note "    https://github.com/settings/tokens → Generate new token (classic)"
    note "    Permisos: repo, read:org, read:user"
    echo
    if ask "¿Quieres habilitar el MCP de GitHub ahora?"; then
      read -rp "  Pega tu PAT (empieza con ghp_... o gho_...): " GH_TOKEN
    else
      info "Saltado — puedes agregarlo después editando ~/.claude.json"
    fi
    [ -z "$GH_TOKEN" ] && GH_TOKEN="REPLACE_WITH_YOUR_TOKEN"

    cat > "$HOME/.claude.json" <<EOF
{
  "mcpServers": {
    "jcodemunch": {
      "type": "stdio",
      "command": "uvx",
      "args": ["jcodemunch-mcp"],
      "env": {}
    },
    "obsidian": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "mcp-obsidian", "$VAULT"],
      "env": {}
    },
    "github": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "$GH_TOKEN"
      }
    }
  }
}
EOF
    ok "~/.claude.json creado"
  fi
fi

MEMORY_SOURCE="$VAULT/.claude-memory"
MEMORY_LINK="$HOME/.claude/projects/-home-apolo-Documents/memory"
if [ -L "$MEMORY_LINK" ]; then
  ok "Memory symlink ya existe"
else
  miss "Memory symlink"
  if ask "¿Crear symlink de memoria a $MEMORY_SOURCE?"; then
    mkdir -p "$MEMORY_SOURCE"
    mkdir -p "$(dirname "$MEMORY_LINK")"
    ln -sf "$MEMORY_SOURCE" "$MEMORY_LINK"
    ok "Symlink creado"
  fi
fi

# ═══════════════════════════════════════════════════════════════
# Paso 8 — Proyectos (clone interactivo)
# ═══════════════════════════════════════════════════════════════
step "8/9  Proyectos"

declare -A REPOS=(
  # destino → github
  ["clients/uc-logos/website"]="uclogos.mx"
  ["clients/uc-logos/aula"]="aula-uclogos"
  ["clients/uc-logos/crm"]="crm.uclogos.mx"
  ["clients/ainco/ainco-learning/backend"]="ainco_learning"
  ["clients/ainco/ainco-web"]="ainco-web"
  ["clients/ammi/ammi-web"]="ammi-web"
  ["clients/ammi/pan-del-rey"]="ammi-pan-del-rey"
  ["clients/rumbo-protegido/website"]="rumbo-protegido-web"
  ["clients/rumbo-protegido/crm"]="rumbo-protegido-crm"
  ["clients/rumbo-protegido/calculadora"]="calculadora-pensiones"
  ["products/wa-group-poster"]="wa-group-poster"
  ["products/ghl-broadcaster"]="ghl-wa-broadcaster"
  ["products/wa-outreach"]="wa-outreach"
  ["products/pulse-reach-v2"]="pulse-reach-v2"
  ["products/whatsapp-saas"]="whatsapp-saas"
  ["tools/wa-checker"]="wa-checker"
  ["tools/prospector-local"]="prospector-local"
  ["apps/astro-reader"]="astro-reader"
  ["apps/dental-lead-manager"]="dental-lead-manager"
  ["apps/amplifica"]="amplifica"
  ["apps/amplifica-site"]="amplifica.site"
  ["apps/tarjeta-digital-mlm"]="tarjeta-digital-mlm"
  ["apps/focus-me"]="focusME"
  ["websites/conversaciones-familiares"]="web-conversaciones-familiares"
  ["websites/iglesia-global-online"]="web-iglesia-global-online"
  ["websites/inmobiliaria-queretaro"]="web-inmobiliaria-queretaro"
  ["websites/vision-consulting"]="web-vision-consulting"
  ["websites/web-landings"]="web-landings"
)

CLONE_MODE="prompt"
echo
info "Modo de clonación:"
echo "    1) Clonar TODOS los proyectos automáticamente"
echo "    2) Preguntarme uno por uno"
echo "    3) Saltar (ya los tengo o los clonaré después)"
read -rp "  > " CHOICE
case "$CHOICE" in
  1) CLONE_MODE="all" ;;
  2) CLONE_MODE="prompt" ;;
  *) CLONE_MODE="skip" ;;
esac

if [ "$CLONE_MODE" != "skip" ]; then
  for path in "${!REPOS[@]}"; do
    target="$BASE/$path"
    repo="${REPOS[$path]}"
    if [ -d "$target/.git" ]; then
      ok "$path"
      continue
    fi
    if [ "$CLONE_MODE" = "all" ] || ask "Clonar $repo → $path?"; then
      mkdir -p "$(dirname "$target")"
      git clone "git@github.com:apolo-81/$repo.git" "$target" 2>&1 | tail -1
    fi
  done

  # Submódulos especiales (monorepos con remotes distintos en subcarpetas)
  if [ -d "$BASE/clients/ainco/ainco-learning" ] && [ ! -d "$BASE/clients/ainco/ainco-learning/frontend/.git" ]; then
    if ask "Clonar ainco-learning/frontend (repo separado)?"; then
      git clone "git@github.com:apolo-81/-ainco_learning-frontend.git" \
        "$BASE/clients/ainco/ainco-learning/frontend"
    fi
  fi
  if [ -d "$BASE/clients/uc-logos/aula" ] && [ ! -d "$BASE/clients/uc-logos/aula/backend/.git" ]; then
    if ask "Clonar aula-uclogos backend + frontend (sub-repos)?"; then
      git clone git@github.com:apolo-81/aula-uclogos-backend.git  "$BASE/clients/uc-logos/aula/backend"
      git clone git@github.com:apolo-81/aula-uclogos-frontend.git "$BASE/clients/uc-logos/aula/frontend"
    fi
  fi
fi

# sync-all.sh
if [ -f "$HOME/Documents/sync-all.sh" ]; then
  ok "sync-all.sh ya está en ~/Documents"
else
  if [ -f "$VAULT/03_Resources/sync-all.sh" ]; then
    cp "$VAULT/03_Resources/sync-all.sh" "$HOME/Documents/sync-all.sh"
    chmod +x "$HOME/Documents/sync-all.sh"
    ok "sync-all.sh copiado a ~/Documents"
  fi
fi

# ═══════════════════════════════════════════════════════════════
# Paso 9 — Obsidian
# ═══════════════════════════════════════════════════════════════
step "9/9  Obsidian"

if has obsidian || [ -d "/var/lib/flatpak/app/md.obsidian.Obsidian" ] || ls /usr/share/applications/obsidian* &>/dev/null; then
  ok "Obsidian instalado"
else
  miss "Obsidian"
  echo
  info "Opciones para instalar Obsidian en Debian:"
  echo "    1) Descargar .deb de obsidian.md y luego: sudo apt install ./Obsidian-*.deb"
  echo "    2) Flatpak: sudo apt install flatpak && flatpak install flathub md.obsidian.Obsidian"
  echo
  note "Después de instalar:"
  note "  - Open folder as vault → $VAULT"
  note "  - Settings → Community plugins → activar 'Git'"
  note "  - El plugin Git ya viene con su config (auto-commit/push 10min, pull on boot)"
fi

# ═══════════════════════════════════════════════════════════════
# Verificación final
# ═══════════════════════════════════════════════════════════════
step "Verificación final"

[ -d "$VAULT/.git" ]                                  && ok "Vault"        || miss "Vault"
[ -d "$SKILLS/.git" ]                                 && ok "claude-skills" || miss "claude-skills"
[ -L "$HOME/.claude/projects/-home-apolo-Documents/memory" ] && ok "Memory symlink" || miss "Memory symlink"
[ -f "$HOME/.claude/settings.json" ]                  && ok "settings.json" || miss "settings.json"
[ -f "$HOME/.claude.json" ]                          && ok "~/.claude.json (MCPs)" || miss "~/.claude.json"

n_skills=$(ls "$SKILLS" 2>/dev/null | grep -Ev '^(config|marketplaces|README\.md|\.git.*)$' | wc -l)
if [ "$n_skills" -ge 48 ]; then
  ok "$n_skills skills"
elif [ "$n_skills" -ge 40 ]; then
  warn "$n_skills skills (esperaba ~48 — corre: git -C $SKILLS fetch && git -C $SKILLS reset --hard origin/main)"
else
  miss "Solo $n_skills skills — clone incompleto"
fi

echo
echo -e "${GREEN}${BOLD}═══ Setup completado ═══${NC}"
echo
note "Próximos pasos:"
note "  1. Si instalaste nvm/uv en este script, abre una nueva terminal para refrescar el PATH"
note "  2. Lanza Claude Code: claude"
note "  3. /resume — debe cargar tu contexto"
note "  4. Abre Obsidian → activa el plugin Git en Community Plugins"
echo
