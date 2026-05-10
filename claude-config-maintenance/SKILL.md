---
name: claude-config-maintenance
description: >
  Mantenimiento de Claude Code local: skills, comandos custom, hooks, settings,
  memoria Obsidian, /resume, /compress, skill-toggle y restauracion desde repo.
  Usar cuando: auditar skills de Claude, reducir contexto, revisar vault/memoria,
  comandos resume/compress, restauracion, laptop-setup o configuracion de Claude.
---

# Claude Config Maintenance

Use this skill for local Claude Code configuration, memory, commands, hooks, skills, and restore scripts.

## Safety Rules

- Treat `~/.claude/skills` as a git repo.
- Check `git status` before broad edits.
- Do not overwrite user changes.
- Keep active skills lean; move bulky examples to references or `.off`.
- Keep memory paths aligned with `~/Documents/ClaudeCode_Projects/vault/00_System/Memory`.
- Do not restore `.claude-memory` as active memory.

## Audit Checklist

1. Count active and disabled skills.
2. Estimate active `SKILL.md` word load.
3. Find duplicate/overlapping skills.
4. Check stale paths: `.claude-memory`, `55. Archive`, `00_Inbox`.
5. Check custom commands under both:
   - `~/.claude/commands/`
   - `~/.claude/skills/config/commands/`
6. Check `config/settings.json` against active `~/.claude/settings.json`.
7. Check `laptop-setup.sh` restore behavior.
8. Check `skill-toggle` groups against real skill dirs.
9. Run `scripts/audit-skills.sh` when present.

## Recommended Structure

- Active skills: frequent, high-signal, short.
- Disabled skills: specialized or bulky, available on demand.
- `references/`: long snippets, templates, checklists.
- `docs/`: structure and maintenance docs.
- `scripts/`: local audits and maintenance helpers.
- `config/`: commands, settings, hooks, agents, installable local bin scripts.

## Output

Report:

- critical restore/memory risks
- context reduction opportunities
- broken commands or group mappings
- stale/sensitive content
- exact files to update
- verification commands
