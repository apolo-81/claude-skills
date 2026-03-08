#!/usr/bin/env python3
"""
restore.py — Instala plugins y configura MCPs de Claude Code desde el backup
Uso: python3 bin/restore.py [--dry-run]
"""
import json
import os
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent
BACKUP_DIR = REPO_ROOT / "backup"
PLUGINS_FILE = BACKUP_DIR / "plugins.json"
MCP_FILE = BACKUP_DIR / "mcp-servers.json"
CLAUDE_JSON = Path.home() / ".claude.json"
INSTALLED_PLUGINS = Path.home() / ".claude" / "plugins" / "installed_plugins.json"

GREEN = "\033[0;32m"
RED = "\033[0;31m"
YELLOW = "\033[1;33m"
BLUE = "\033[0;34m"
NC = "\033[0m"


def get_installed_plugins():
    if not INSTALLED_PLUGINS.exists():
        return set()
    try:
        with open(INSTALLED_PLUGINS) as f:
            data = json.load(f)
    except json.JSONDecodeError:
        return set()
    plugins = data.get("plugins", {})
    return {key.split("@")[0] for key in plugins.keys() if "@" in key}


def load_backup_plugins():
    if not PLUGINS_FILE.exists():
        print(f"{RED}ERROR:{NC} backup/plugins.json no encontrado")
        sys.exit(1)
    try:
        with open(PLUGINS_FILE) as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"{RED}ERROR:{NC} backup/plugins.json tiene JSON inválido: {e}")
        sys.exit(1)
    return data.get("plugins", [])


def load_backup_mcps():
    if not MCP_FILE.exists():
        return {}
    try:
        with open(MCP_FILE) as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"{YELLOW}ADVERTENCIA:{NC} backup/mcp-servers.json tiene JSON inválido: {e}")
        return {}
    return data.get("mcpServers", {})


def load_env_vars():
    """Carga ~/.env si existe para resolver $VAR en MCP configs."""
    env_file = Path.home() / ".env"
    env_vars = {}
    if env_file.exists():
        with open(env_file) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, _, v = line.partition("=")
                    env_vars[k.strip()] = v.strip()
    return env_vars


def resolve_env_vars(mcp_servers, env_vars):
    """Reemplaza $VAR_NAME con valores reales del .env o del entorno."""
    result = {}
    for name, cfg in mcp_servers.items():
        new_cfg = dict(cfg)
        if "env" in new_cfg:
            new_env = {}
            for k, v in new_cfg["env"].items():
                if isinstance(v, str) and v.startswith("$"):
                    var_name = v[1:]
                    resolved = env_vars.get(var_name) or os.environ.get(var_name, "")
                    if not resolved:
                        print(f"  {YELLOW}ADVERTENCIA:{NC} {var_name} no configurada para MCP '{name}'")
                    new_env[k] = resolved
                else:
                    new_env[k] = v
            new_cfg["env"] = new_env
        result[name] = new_cfg
    return result


def install_plugin(name, marketplace, dry_run=False):
    if dry_run:
        print(f"  {BLUE}DRY-RUN{NC}  claude plugin install {name}@{marketplace}")
        return True
    result = subprocess.run(
        ["claude", "plugin", "install", f"{name}@{marketplace}"],
        capture_output=True,
        text=True,
    )
    if result.returncode == 0:
        print(f"  {GREEN}✓{NC} {name}@{marketplace}")
        return True
    else:
        err = (result.stderr or result.stdout).strip()[:80]
        print(f"  {RED}✗{NC} {name}@{marketplace} — {err}")
        return False


def configure_mcps(mcp_servers, dry_run=False):
    if not mcp_servers:
        return

    print(f"\n{BLUE}Configurando MCP servers...{NC}")

    if not CLAUDE_JSON.exists():
        current = {}
    else:
        try:
            with open(CLAUDE_JSON) as f:
                current = json.load(f)
        except json.JSONDecodeError:
            current = {}

    current_mcps = current.get("mcpServers", {})
    added = []

    for name, cfg in mcp_servers.items():
        if name in current_mcps:
            print(f"  {YELLOW}YA EXISTE{NC}  {name}")
        else:
            if dry_run:
                print(f"  {BLUE}DRY-RUN{NC}  Añadir MCP: {name}")
            else:
                current_mcps[name] = cfg
                added.append(name)
                print(f"  {GREEN}✓{NC} {name}")

    if added and not dry_run:
        current["mcpServers"] = current_mcps
        with open(CLAUDE_JSON, "w") as f:
            json.dump(current, f, indent=2)
            f.write("\n")


def print_summary(installed_count, already_count, errors):
    print(f"\n{'='*50}")
    print(f"  {GREEN}Instalados:{NC}     {installed_count}")
    print(f"  {YELLOW}Ya existían:{NC}   {already_count}")
    if errors:
        print(f"  {RED}Errores:{NC}       {len(errors)}")
        for e in errors:
            print(f"    - {e}")
    print(f"{'='*50}")


def main():
    dry_run = "--dry-run" in sys.argv

    if dry_run:
        print(f"{YELLOW}MODO DRY-RUN — no se instalará nada{NC}\n")

    backup_plugins = load_backup_plugins()
    installed = get_installed_plugins()
    env_vars = load_env_vars()
    backup_mcps = load_backup_mcps()

    to_install = [p for p in backup_plugins if p["name"] not in installed]
    already_installed = [p for p in backup_plugins if p["name"] in installed]

    print(f"Plugins en backup:    {len(backup_plugins)}")
    print(f"Ya instalados:        {len(already_installed)}")
    print(f"A instalar:           {len(to_install)}")
    print()

    errors = []
    if not to_install:
        print(f"{GREEN}Todo ya está instalado.{NC}")
    else:
        print(f"{BLUE}Instalando {len(to_install)} plugins...{NC}")
        for i, plugin in enumerate(to_install, 1):
            print(f"[{i}/{len(to_install)}] ", end="")
            ok = install_plugin(plugin["name"], plugin["marketplace"], dry_run)
            if not ok:
                errors.append(plugin["name"])

        print_summary(len(to_install) - len(errors), len(already_installed), errors)

    resolved_mcps = resolve_env_vars(backup_mcps, env_vars)
    configure_mcps(resolved_mcps, dry_run)

    print(f"\n{GREEN}Restore completo.{NC}")
    if not (Path.home() / ".env").exists():
        print(f"\n{YELLOW}Tip:{NC} Crea ~/.env con tus tokens (ver backup/env.example)")


if __name__ == "__main__":
    main()
