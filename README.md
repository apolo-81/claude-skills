# Claude Skills

Local Claude Code skills and configuration backup for Apolo's machines.

## Source Of Truth

- Local path: `~/.claude/skills`
- Remote: `git@github.com:apolo-81/claude-skills.git`
- Active Claude config backup: `config/`
- Skill group manager: `config/bin/skill-toggle`

`laptop-setup.sh` restores commands, hooks, settings, marketplaces, and `skill-toggle` from this repo.

## Active Profile

The default profile is intentionally lean: keep only high-frequency skills active and leave specialized skills as `SKILL.md.off`.

Run:

```bash
skill-toggle status
skill-toggle profile lean
skill-toggle market on
skill-toggle market off
```

After changing active skills, run `/reload-plugins` in Claude Code.

## Current Default Groups

- `default`: recommended low-context profile.
- `maintenance`: app/UX/config audits and Claude setup maintenance.
- `market`: marketing suite, mostly on-demand through `market/SKILL.md`.
- `dev`: backend/product implementation patterns.
- `design`: UI, animation, presentations, visual identity.
- `content`: CMS, PDFs, email templates, dashboards, PWA.
- `ai`: chatbot and n8n AI patterns.
- `seo`: SEO suite.
- `pinokio`: runtime and launcher development.

## Memory Contract

Claude memory now lives in:

`/home/apolo/Documents/ClaudeCode_Projects/vault/00_System/Memory`

Do not restore or write new memory to `.claude-memory`. It is legacy only.

## Maintenance

Run the audit before committing structural changes:

```bash
bash scripts/audit-skills.sh
```

The audit reports active counts, approximate active word load, stale memory paths, risky examples, and command/config consistency.
