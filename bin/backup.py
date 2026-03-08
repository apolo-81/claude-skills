#!/usr/bin/env python3
"""
backup.py — Captura el estado actual de plugins y MCPs de Claude Code
Uso: python3 bin/backup.py [--commit]
"""
import json
import os
import subprocess
import sys
from datetime import date
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent
BACKUP_DIR = REPO_ROOT / "backup"
PLUGINS_FILE = BACKUP_DIR / "plugins.json"
MCP_FILE = BACKUP_DIR / "mcp-servers.json"
INSTALLED_PLUGINS = Path.home() / ".claude" / "plugins" / "installed_plugins.json"
CLAUDE_JSON = Path.home() / ".claude.json"

GREEN = "\033[0;32m"
YELLOW = "\033[1;33m"
NC = "\033[0m"


def load_installed_plugins():
    if not INSTALLED_PLUGINS.exists():
        print("ERROR: ~/.claude/plugins/installed_plugins.json no encontrado")
        sys.exit(1)
    with open(INSTALLED_PLUGINS) as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError as e:
            print(f"ERROR: ~/.claude/plugins/installed_plugins.json tiene JSON inválido: {e}")
            sys.exit(1)
    return data.get("plugins", {})


def deduplicate_plugins(plugins_dict):
    """Un plugin instalado desde múltiples marketplaces → elige el primero alfabéticamente."""
    seen = {}
    for key in sorted(plugins_dict.keys()):
        parts = key.split("@", 1)
        if len(parts) != 2:
            continue  # ignorar claves con formato inesperado
        name, marketplace = parts
        if name not in seen:
            seen[name] = marketplace
    return [{"name": n, "marketplace": m} for n, m in sorted(seen.items())]


def load_mcp_servers():
    if not CLAUDE_JSON.exists():
        return {}
    with open(CLAUDE_JSON) as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError as e:
            print(f"ADVERTENCIA: ~/.claude.json tiene JSON inválido: {e}")
            return {}
    return data.get("mcpServers", {})


def redact_secrets(mcp_servers):
    """Reemplaza valores de env con $VAR_NAME."""
    result = {}
    for name, cfg in mcp_servers.items():
        new_cfg = dict(cfg)
        if "env" in new_cfg:
            new_env = {}
            for k, v in new_cfg["env"].items():
                new_env[k] = f"${k}"
            new_cfg["env"] = new_env
        result[name] = new_cfg
    return result


def write_plugins_json(plugins):
    current = {}
    if PLUGINS_FILE.exists():
        try:
            with open(PLUGINS_FILE) as f:
                current = json.load(f)
        except json.JSONDecodeError:
            current = {}  # archivo corrupto → sobreescribir

    new_data = {
        "generated": str(date.today()),
        "description": "Claude Code plugins — generado por bin/backup.py",
        "plugins": plugins,
    }

    if current.get("plugins") == plugins:
        print(f"  {YELLOW}SIN CAMBIOS{NC}  backup/plugins.json")
        return False

    with open(PLUGINS_FILE, "w") as f:
        json.dump(new_data, f, indent=2)
        f.write("\n")
    print(f"  {GREEN}ACTUALIZADO{NC}  backup/plugins.json ({len(plugins)} plugins)")
    return True


def write_mcp_json(mcp_servers):
    redacted = redact_secrets(mcp_servers)
    current = {}
    if MCP_FILE.exists():
        try:
            with open(MCP_FILE) as f:
                current = json.load(f)
        except json.JSONDecodeError:
            current = {}

    new_data = {
        "generated": str(date.today()),
        "description": "MCP servers — generado por bin/backup.py. Los valores $VAR se leen de ~/.env",
        "mcpServers": redacted,
    }

    if current.get("mcpServers") == redacted:
        print(f"  {YELLOW}SIN CAMBIOS{NC}  backup/mcp-servers.json")
        return False

    with open(MCP_FILE, "w") as f:
        json.dump(new_data, f, indent=2)
        f.write("\n")
    print(f"  {GREEN}ACTUALIZADO{NC}  backup/mcp-servers.json ({len(redacted)} MCPs)")
    return True


def git_commit():
    result = subprocess.run(
        ["git", "diff", "--quiet", "backup/"],
        cwd=REPO_ROOT,
        capture_output=True,
    )
    if result.returncode == 0:
        print("  Sin cambios para commitear.")
        return
    subprocess.run(["git", "add", "backup/"], cwd=REPO_ROOT, check=True)
    subprocess.run(
        ["git", "commit", "-m", f"chore: update plugin/mcp backup {date.today()}"],
        cwd=REPO_ROOT,
        check=True,
    )
    try:
        subprocess.run(["git", "push"], cwd=REPO_ROOT, check=True)
        print(f"  {GREEN}Commit y push exitoso{NC}")
    except subprocess.CalledProcessError:
        print(f"  {YELLOW}Commit exitoso, pero push falló (verifica la conexión){NC}")


def main():
    do_commit = "--commit" in sys.argv

    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    print("Generando backup de Claude Code...")
    print()

    raw_plugins = load_installed_plugins()
    plugins = deduplicate_plugins(raw_plugins)
    mcp_servers = load_mcp_servers()

    changed = False
    changed |= write_plugins_json(plugins)
    changed |= write_mcp_json(mcp_servers)

    print()
    if do_commit and changed:
        git_commit()
    elif do_commit:
        print("Nada que commitear.")
    else:
        print("Tip: usa --commit para hacer git commit+push automáticamente")


if __name__ == "__main__":
    main()
