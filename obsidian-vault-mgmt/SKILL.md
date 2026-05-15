---
name: obsidian-vault-mgmt
description: >
  Maintains an Obsidian vault used as a Second Brain (PARA method) for Claude memory:
  canonical notes in 00_System/Memory/, project notes in 01_Projects/, daily logs,
  clippings, resolving conflicts between canonical notes and session logs, preventing
  staleness, MEMORY.md as a load-once index, and the source_of_truth + last_verified
  frontmatter contract. Stack: Obsidian + Markdown + YAML frontmatter + Git.
  Usar cuando: "vault", "Obsidian", "MEMORY.md", "00_System/Memory", "memoria canónica",
  "PARA", "second brain", "01_Projects", "05_Daily", "nota stale", "consolidar sesión",
  "actualizar memoria de Claude", "frontmatter", "source_of_truth", "last_verified",
  "session note", "vault lint", "notas huérfanas". Triggers in English: "Obsidian vault",
  "PARA method", "second brain", "canonical memory", "stale notes", "MEMORY index",
  "consolidate session", "vault hygiene", "memory frontmatter". Do NOT use for: editing
  Claude Code settings/hooks (use claude-config-maintenance), code in the projects
  (use the project's relevant skill).
---

# Obsidian Vault Management

Maintains the vault at `~/Documents/ClaudeCode_Projects/vault/` that acts as Claude's persistent memory between sessions. Built on PARA + a custom canonical-memory layer under `00_System/Memory/`.

## Vault Structure (PARA + Memory)

```
vault/
├── 00_System/
│   ├── Memory/                ← canonical, source-of-truth notes
│   │   ├── MEMORY.md          ← INDEX (always loaded first by Claude)
│   │   ├── STRUCTURE_FOR_CLAUDE.md  ← loading protocol
│   │   ├── People/<user>.md
│   │   ├── Projects/<project>.md
│   │   ├── Feedback/<topic>.md
│   │   └── References/<resource>.md
│   └── Reports/               ← migration logs, audits
├── 01_Projects/               ← active project notes + session logs
├── 02_Areas/                  ← areas of responsibility
├── 03_Resources/              ← clippings, syntheses
├── 04_Archive/                ← closed / dormant
├── 05_Daily/                  ← YYYY-MM-DD.md (optional, light)
├── _Templates/                ← Templater
├── CLAUDE.md                  ← vault-wide protocol
└── Dashboard.md               ← dataview index
```

## The Loading Contract

Claude reads memory in this order. Every `/resume` command relies on this:

1. `00_System/Memory/MEMORY.md` (the index)
2. `00_System/Memory/STRUCTURE_FOR_CLAUDE.md` (the protocol)
3. Only the linked canonical notes relevant to current task
4. `05_Daily/` only if today's note has real content (ignore empty templates)
5. `01_Projects/` only when operational detail is needed
6. `Session...` notes are historical — never current state

## Frontmatter Contract for Canonical Notes

```yaml
---
title: "Project X"
tags: [trabajo, todo/prio1]
created: 2026-04-01
status: active                # active | closed | dormido
domain: project               # project | feedback | reference | people | memory
deadline: 2026-06-01          # ISO date, optional
type: protocol                # only for protocol notes
source_of_truth: true         # canonical notes ONLY
last_verified: 2026-05-15     # update when content re-confirmed
---
```

**Rule:** if two notes conflict, the one with `source_of_truth: true` wins; if both have it, the one with more recent `last_verified` wins.

## MEMORY.md as the Index

`MEMORY.md` is **not** a memory — it's a one-line-per-entry pointer file. Claude truncates after ~200 lines, so keep it tight:

```markdown
## Projects
- [Project X](Projects/project_x.md) — one-line hook describing what it covers
- [GHL Broadcaster](Projects/project_ghl_wa_broadcaster.md) — cubre: OAuth2 GHL, Baileys grupos WA...

## Feedback
- [Dev workflow](Feedback/feedback_dev_workflow.md) — cubre: español siempre, planes antes de ejecutar...
```

Pattern for the hook: `cubre: A, B, C` — comma-separated topics so future Claude can pattern-match without reading the file.

## Note Types (and What Belongs)

| Type | Folder | When to create | When to update |
|---|---|---|---|
| **Canonical project** | `00_System/Memory/Projects/` | Project becomes recurrent | When stack/deadline/status changes |
| **Operational project** | `01_Projects/` | Day-to-day tracking, prio1/prio2 todos | Continuously |
| **Session log** | `01_Projects/session-YYYY-MM-DD-<topic>.md` | At end of a working session | Never — close as historical |
| **Feedback** | `00_System/Memory/Feedback/` | User corrects approach or confirms non-obvious choice | Add new rules, never delete reasons |
| **Reference** | `00_System/Memory/References/` | External resource (vault path, repo, CLI tool) | When location/URL changes |
| **Daily** | `05_Daily/YYYY-MM-DD.md` | Optional, light context only | Same day |

## Workflow — End-of-Session Consolidation

When a session produces durable knowledge:

1. **Identify** what's new vs. what already exists.
2. **Update the canonical note** in `00_System/Memory/Projects/<project>.md` — modify `last_verified`, append to `## Hechos` section, never duplicate.
3. **If a new project** → create canonical + add line to `MEMORY.md`.
4. **Session log** stays in `01_Projects/` with `status: closed` and a link to the canonical it consolidates into.
5. **Don't write** the session log content into MEMORY.md — only the canonical hook line.

## Anti-Patterns (Things That Break Memory)

- ❌ **MEMORY.md grows past 200 lines.** Truncation hides recent entries.
- ❌ **Session note treated as active state.** It's a log; the canonical is the state.
- ❌ **Duplicate canonical notes for one project.** Pick one, link the other or archive.
- ❌ **`last_verified` never updated.** Memory rots. Touch it when you re-confirm.
- ❌ **Path references to old locations** (e.g. `/88. Proyectos/...`, `/55. Archive/...`). These are stale — verify on disk before trusting.
- ❌ **Secrets in vault.** Frontmatter / body never holds API keys, passwords. Use `.env` files outside the vault.
- ❌ **Writing to `.claude-memory/`.** Legacy. Always write to `00_System/Memory/**`.

## Stale Detection — Periodic Vault Lint

Run monthly:

```bash
# Notes touched > 60 days ago
find ~/Documents/ClaudeCode_Projects/vault/00_System/Memory -name "*.md" \
  -mtime +60 -exec ls -lt {} \;

# Notes without last_verified
grep -L "^last_verified:" ~/Documents/ClaudeCode_Projects/vault/00_System/Memory/**/*.md

# Orphan notes (in folders but not linked in MEMORY.md)
# manual: diff `ls Projects/` vs grep'd links in MEMORY.md
```

Action: re-verify, update `last_verified`, or archive to `04_Archive/`.

## Resolving Conflicts (the Algorithm)

```
Question: "Where does AULA UC Logos run?"

1. Read MEMORY.md → find [AULA UC LOGOS LMS](Projects/project_aula_lms.md)
2. Read that canonical note → check last_verified date
3. If last_verified < 30 days: trust it
4. If last_verified ≥ 30 days OR conflicts with current observation:
   - VERIFY on disk / via git / via curl
   - UPDATE the canonical note + bump last_verified
   - If a session note (Session...) says different: ignore it as historical
```

## What NOT to Save in Memory

(Mirrors the auto-memory rules in CLAUDE.md global)
- Code patterns derivable from project state
- Git history, who-changed-what (use `git log`)
- Fix recipes (the fix is in the code; context is in the commit message)
- Anything already in a CLAUDE.md
- Ephemeral session details

## Workflow Checklist — Add / Update Canonical Note

```
- [ ] Decide note type (project/feedback/reference/people)
- [ ] Path = 00_System/Memory/<type>/<topic>.md (kebab-case slug)
- [ ] Frontmatter: title, tags, created, status, domain, source_of_truth, last_verified
- [ ] Body: structured (## Hechos, ## Decisiones, ## Pendientes)
- [ ] Add ONE line in MEMORY.md under the right section
- [ ] Hook line uses "cubre: A, B, C" format
- [ ] Cross-link related canonicals with [[wiki-link]]
- [ ] Bump last_verified on existing notes you re-read today
```

## Related Skills

- `claude-config-maintenance` — sibling skill for Claude Code itself (settings, hooks)
- `resume` — the `/resume` slash command consumes this vault
- `compress` — uses vault as the destination for compressed memory
