# Claude Skills Structure

This document explains the structure Claude should expect after the 2026-05 cleanup.

## Core Principle

Keep the skill registry small. Active `SKILL.md` files should contain routing rules, decision trees, and short patterns. Bulky examples, templates, or rarely used workflows should live in references or disabled `SKILL.md.off` files.

## Important Paths

- `~/.claude/skills/`: repo root and active local skill source.
- `~/.claude/skills/config/commands/`: backed-up custom commands.
- `~/.claude/skills/config/settings.json`: backed-up Claude Code settings.
- `~/.claude/skills/config/bin/skill-toggle`: backed-up skill group manager.
- `~/.local/bin/skill-toggle`: installed command used by `/skills`.
- `~/Documents/ClaudeCode_Projects/vault/00_System/Memory`: canonical memory directory.

## Active Vs Disabled Skills

- Active skill: `<skill>/SKILL.md`
- Disabled/on-demand skill: `<skill>/SKILL.md.off`

Disabled files are still useful references. Do not delete them unless the user explicitly asks.

## Default Active Profile

The default active profile is:

- `market`
- `app-audit`
- `ux-audit`
- `claude-config-maintenance`
- `auth-patterns`
- `background-jobs`
- `deployment`
- `error-monitoring`
- `express-api`
- `form-handling`
- `ghl-integration`
- `landing-page-builder`
- `performance-next`
- `prisma-orm`
- `saas-boilerplate`
- `supabase-stack`
- `testing-patterns`
- `ui-designer`
- `wa-baileys`
- `web-animations`
- `webhook-integration`

Restore it with:

```bash
skill-toggle profile lean
```

Then run `/reload-plugins` in Claude Code.

## Marketing Suite

Only `market/SKILL.md` should stay active by default.

Specialized marketing skills are disabled and loaded as on-demand references by the market orchestrator:

- `market-audit/SKILL.md.off`
- `market-copy/SKILL.md.off`
- `market-emails/SKILL.md.off`
- `market-landing/SKILL.md.off`
- `market-competitors/SKILL.md.off`
- `market-brand/SKILL.md.off`
- `market-visual-identity/SKILL.md.off`
- and the remaining `market-*` command references

Do not activate the whole `market` group unless the user is doing an extended marketing sprint and accepts the context cost.

## Memory And Resume

`/resume` is read-only and must use:

- `00_System/Memory/MEMORY.md`
- `00_System/Memory/STRUCTURE_FOR_CLAUDE.md`
- linked canonical notes under `00_System/Memory/**`

`/compress` may write session notes and update canonical memory, but must not write new memory to `.claude-memory`.

## Guardrails For Future Changes

- Keep active `SKILL.md` files under roughly 1,200 words unless there is a strong reason.
- Prefer `references/` for copy-paste code and long templates.
- Avoid instructions that ask Claude to expose hidden reasoning.
- Avoid real-looking secrets in examples.
- Keep `config/settings.json` and active `~/.claude/settings.json` aligned.
- Update this document when adding/removing groups or changing the default active profile.
