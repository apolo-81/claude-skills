#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"

echo "== Claude skills audit =="
echo "root: $ROOT"
echo

python3 - "$ROOT" <<'PY'
from pathlib import Path
import json
import re
import sys

root = Path(sys.argv[1])
active = sorted(root.glob("*/SKILL.md"))
inactive = sorted(root.glob("*/SKILL.md.off"))

def words(path: Path) -> int:
    return len(re.findall(r"\S+", path.read_text(errors="ignore")))

active_words = sum(words(p) for p in active)

print(f"active_skills: {len(active)}")
print(f"inactive_skills: {len(inactive)}")
print(f"active_words_approx: {active_words}")
print()

print("largest_active:")
for path in sorted(active, key=words, reverse=True)[:10]:
    print(f"  {path.parent.name:28s} {words(path):5d} words")
print()

json_files = [root / "config/settings.json", root / "config/claude.json.template"]
for path in json_files:
    try:
        json.loads(path.read_text())
        print(f"json_ok: {path.relative_to(root)}")
    except Exception as exc:
        print(f"json_error: {path.relative_to(root)}: {exc}")
print()

checks = {
    "legacy_memory_path": {
        "pattern": re.compile(r"55\. Archive|00_Inbox|autoMemoryDirectory.*\.claude-memory|MEMORY_SOURCE=.*\.claude-memory"),
        "scope": "all",
    },
    "realistic_vapid_key": {
        "pattern": re.compile(r"(Public|Private) Key:\s+[A-Za-z0-9_-]{30,}|VAPID_PRIVATE_KEY=[A-Za-z0-9_-]{30,}"),
        "scope": "all",
    },
    "chinese_placeholders_active": {
        "pattern": re.compile(r"[\u4e00-\u9fff]|\{项目"),
        "scope": "active",
    },
    "internal_reasoning_request_active": {
        "pattern": re.compile(r"pondering|chain-of-thought|thinking process|pensamiento interno", re.I),
        "scope": "active",
    },
    "create_react_app_active": {
        "pattern": re.compile(r"create-react-app"),
        "scope": "active",
    },
}

for label, config in checks.items():
    pattern = config["pattern"]
    hits = []
    files = active if config["scope"] == "active" else [
        p for p in root.rglob("*")
        if p.is_file() and ".git" not in p.parts
    ]
    for path in files:
        rel_path = path.relative_to(root)
        if rel_path == Path("scripts/audit-skills.sh"):
            continue
        text = path.read_text(errors="ignore")
        for i, line in enumerate(text.splitlines(), 1):
            if pattern.search(line):
                if label == "legacy_memory_path" and "Check stale paths" in line:
                    continue
                hits.append((rel_path, i, line[:160]))
                break
    status = "ok" if not hits else "warn"
    print(f"{status}: {label} ({len(hits)} hits)")
    for rel, line_no, snippet in hits[:12]:
        print(f"  {rel}:{line_no}: {snippet}")
    if len(hits) > 12:
        print(f"  ... {len(hits) - 12} more")
    print()

skill_toggle = root / "config/bin/skill-toggle"
print("skill_toggle_present:", skill_toggle.exists())
print("skill_toggle_executable:", skill_toggle.exists() and skill_toggle.stat().st_mode & 0o111 != 0)
PY

echo
echo "== git status =="
git -C "$ROOT" status --short
