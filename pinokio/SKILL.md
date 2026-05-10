---
name: pinokio
description: >
  Discover, launch, use, and when explicitly requested create/debug Pinokio apps
  and launchers with pterm-first runtime control.
---

# Pinokio

Use this skill for Pinokio app discovery, launching, runtime control, API calls, file upload, and launcher development.

## Load References Only As Needed

- Runtime/search/launch/API details: `references/runtime-control.md`
- Launcher creation/debugging: `references/launcher-development.md`

Do not load both references unless the task needs both.

## Default Flow

1. Resolve `pterm`. Do not assume it is on `PATH`.
2. Search installed apps with `pterm search` using 2-4 high-signal terms.
3. Prefer relevant apps already `ready=true`, then `running=true`, then offline.
4. Launch with `pterm run <ref-or-path>`.
5. Poll `pterm status` until `state=online` and `ready=true`.
6. Use `ready_url` for API automation when caller-usable; otherwise use `external_ready_urls` when present.
7. Use `pterm open` only when the user explicitly wants to view or manually interact with the UI.

## pterm Resolution

If `pterm` is not executable, resolve in this order:

1. `~/.pinokio/config.json` -> `home`, then `<home>/bin/npm/bin/pterm` or `<home>/bin/pterm`.
2. `GET http://127.0.0.1:42000/pinokio/path/pterm`.
3. If loopback is unreachable and config has `access`, retry the request against `<protocol>://<host>:<port>`.
4. `which pterm` / `where pterm`.

Only report `pterm` unavailable after all checks fail.

## Remote Apps

When search/status returns a `ref` like `pinokio://<host>:<port>/<scope>/<id>`, use the `ref` for launch/status/open operations.

For remote path-based tasks:

- do not pass local filesystem paths directly to the remote app
- run `pterm upload <ref> <file...>`
- use the returned remote paths only for that target

## Launcher Development

Use only when the user asks to create, modify, debug, review, or document a launcher.

Required:

1. Resolve `PINOKIO_HOME`.
2. Confirm target under `PINOKIO_HOME/api` or `PINOKIO_HOME/plugin`.
3. Load `references/launcher-development.md`.
4. Compare with `/home/apolo/pinokio/prototype/system/examples`.
5. Check logs before fixing broken launchers.
6. Verify through `pterm run` and `pterm status`.

## Guardrails

- Do not run update commands from this skill.
- Do not switch to repo-local CLIs when a Pinokio-managed interface is the source of truth.
- Ask before registry download if no installed app is suitable.
- Ask once when multiple candidates are plausible and the top result is not clearly better.
