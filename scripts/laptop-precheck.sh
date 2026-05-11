#!/usr/bin/env bash
# laptop-precheck.sh — Verifica y actualiza el setup de Claude en la laptop
# de forma segura antes de correr /resume. NO descarta cambios sin confirmar.
#
# Uso en la laptop:
#   bash <(curl -fsSL https://raw.githubusercontent.com/apolo-81/claude-skills/main/scripts/laptop-precheck.sh)
# o, si ya tienes el repo:
#   bash ~/.claude/skills/scripts/laptop-precheck.sh

set -uo pipefail

G='\033[0;32m'; Y='\033[1;33m'; R='\033[0;31m'; B='\033[0;34m'; N='\033[0m'; BO='\033[1m'
ok()   { echo -e "  ${G}✓${N} $1"; }
miss() { echo -e "  ${R}✗${N} $1"; }
warn() { echo -e "  ${Y}⚠${N} $1"; }
info() { echo -e "  ${B}ℹ${N} $1"; }
step() { echo; echo -e "${BO}${B}── $1 ──${N}"; }
ask()  { local r; read -rp "$(echo -e "  ${Y}?${N} $1 [s/N]: ")" r; [[ "$r" =~ ^[sSyY]$ ]]; }

VAULT="$HOME/Documents/ClaudeCode_Projects/vault"
SKILLS="$HOME/.claude/skills"

inspect_repo() {
  local path="$1" name="$2"
  if [ ! -d "$path/.git" ]; then
    miss "$name no existe en $path"
    return 2
  fi

  git -C "$path" fetch origin --quiet 2>/dev/null || { warn "$name: fetch falló (SSH?)"; return 3; }

  local local_sha remote_sha ahead behind dirty
  local_sha=$(git -C "$path" rev-parse HEAD 2>/dev/null)
  remote_sha=$(git -C "$path" rev-parse origin/main 2>/dev/null)
  ahead=$(git -C "$path" rev-list --count origin/main..HEAD 2>/dev/null || echo 0)
  behind=$(git -C "$path" rev-list --count HEAD..origin/main 2>/dev/null || echo 0)
  dirty=$(git -C "$path" status --porcelain | wc -l)

  echo
  info "$name → $path"
  info "  local  ${local_sha:0:7}   remoto ${remote_sha:0:7}"
  info "  ahead=$ahead  behind=$behind  uncommitted=$dirty"

  if [ "$dirty" -gt 0 ]; then
    warn "Hay $dirty archivo(s) sin commit:"
    git -C "$path" status --short | head -20 | sed 's/^/    /'
  fi
  if [ "$ahead" -gt 0 ]; then
    warn "$ahead commit(s) locales no pusheados:"
    git -C "$path" log origin/main..HEAD --oneline | head -10 | sed 's/^/    /'
  fi

  if [ "$ahead" -eq 0 ] && [ "$behind" -eq 0 ] && [ "$dirty" -eq 0 ]; then
    ok "$name limpio y sincronizado"
    return 0
  fi
  if [ "$ahead" -eq 0 ] && [ "$dirty" -eq 0 ] && [ "$behind" -gt 0 ]; then
    return 10   # safe to fast-forward
  fi
  return 20     # needs decision
}

resolve_repo() {
  local path="$1" name="$2" code="$3"
  case "$code" in
    10)
      info "$name puede actualizarse sin riesgo (fast-forward)."
      if ask "¿Hacer git pull --ff-only?"; then
        git -C "$path" pull --ff-only origin main && ok "$name actualizado"
      fi
      ;;
    20)
      warn "$name tiene cambios locales O commits no pusheados."
      echo "    Opciones:"
      echo "      1) Pushear primero (git push) y luego pull — preserva tu trabajo"
      echo "      2) Stash local + pull + stash pop — preserva uncommitted"
      echo "      3) Reset duro a origin/main — DESCARTA todo lo local"
      echo "      4) No tocar (revisar manualmente)"
      read -rp "    > " choice
      case "$choice" in
        1) git -C "$path" push origin HEAD:main && git -C "$path" pull --ff-only origin main ;;
        2) git -C "$path" stash push -u -m "laptop-precheck-$(date +%s)" \
           && git -C "$path" pull --ff-only origin main \
           && git -C "$path" stash pop ;;
        3) ask "¿Confirmar reset --hard? Esto borra cambios locales" \
           && git -C "$path" reset --hard origin/main ;;
        *) info "Saltado. Revisa manualmente antes de /resume" ;;
      esac
      ;;
  esac
}

step "1. Inspección read-only"
inspect_repo "$SKILLS" "claude-skills"; SK=$?
inspect_repo "$VAULT" "vault";        VL=$?

step "2. Resolución (con confirmación)"
[ "$SK" -ge 10 ] && resolve_repo "$SKILLS" "claude-skills" "$SK"
[ "$VL" -ge 10 ] && resolve_repo "$VAULT" "vault" "$VL"

step "3. Sync de config a ~/.claude/"
if [ -d "$SKILLS/config" ]; then
  if ask "¿Copiar agents/commands/hooks/settings desde claude-skills a ~/.claude/?"; then
    mkdir -p "$HOME/.claude/agents" "$HOME/.claude/commands" "$HOME/.claude/hooks" "$HOME/.local/bin"
    cp -f "$SKILLS/config/agents/"*   "$HOME/.claude/agents/"   2>/dev/null && ok "agents"
    cp -f "$SKILLS/config/commands/"* "$HOME/.claude/commands/" 2>/dev/null && ok "commands"
    cp -f "$SKILLS/config/hooks/"*    "$HOME/.claude/hooks/"    2>/dev/null && ok "hooks"
    chmod +x "$HOME/.claude/hooks/"*.sh 2>/dev/null

    # settings.json: NO sobrescribir si el local tiene cambios útiles
    if [ -f "$HOME/.claude/settings.json" ] && ! diff -q "$HOME/.claude/settings.json" "$SKILLS/config/settings.json" >/dev/null 2>&1; then
      warn "settings.json local difiere del repo:"
      diff "$HOME/.claude/settings.json" "$SKILLS/config/settings.json" | head -20 | sed 's/^/    /'
      if ask "¿Sobrescribir con la versión del repo?"; then
        cp -f "$SKILLS/config/settings.json" "$HOME/.claude/settings.json" && ok "settings.json"
      fi
    else
      cp -f "$SKILLS/config/settings.json" "$HOME/.claude/settings.json" 2>/dev/null && ok "settings.json"
    fi

    if [ -f "$SKILLS/config/bin/skill-toggle" ]; then
      cp -f "$SKILLS/config/bin/skill-toggle" "$HOME/.local/bin/skill-toggle"
      chmod +x "$HOME/.local/bin/skill-toggle" && ok "skill-toggle → ~/.local/bin"
    fi
  fi
fi

step "4. Memory symlink"
MEMORY_SOURCE="$VAULT/00_System/Memory"
MEMORY_LINK="$HOME/.claude/projects/-home-apolo-Documents/memory"
if [ -L "$MEMORY_LINK" ] && [ "$(readlink "$MEMORY_LINK")" = "$MEMORY_SOURCE" ]; then
  ok "Symlink correcto: $MEMORY_LINK → $MEMORY_SOURCE"
elif [ -d "$MEMORY_SOURCE" ]; then
  mkdir -p "$(dirname "$MEMORY_LINK")"
  ln -sfn "$MEMORY_SOURCE" "$MEMORY_LINK" && ok "Symlink creado/actualizado"
else
  miss "$MEMORY_SOURCE no existe — vault desactualizado o no clonado"
fi

step "5. Verificación final"
n_active=$(find "$SKILLS" -maxdepth 2 -name "SKILL.md" 2>/dev/null | wc -l)
[ "$n_active" -ge 25 ] && ok "$n_active skills activas (esperado ~27)" || warn "$n_active skills activas (esperado ~27)"
command -v skill-toggle >/dev/null && ok "skill-toggle en PATH" || warn "skill-toggle NO en PATH — reabre terminal o añade ~/.local/bin al PATH"
[ -f "$HOME/.claude/hooks/compact-claude-md.sh" ] && ok "hook compact-claude-md.sh" || warn "hook ausente"
[ -f "$HOME/.claude/settings.json" ] && ok "settings.json" || miss "settings.json"

echo
echo -e "${G}${BO}Pre-check completado.${N}"
info "Ahora puedes lanzar: ${BO}claude${N} y ejecutar ${BO}/resume${N}"
info "/resume es read-only — no modifica nada del vault."
