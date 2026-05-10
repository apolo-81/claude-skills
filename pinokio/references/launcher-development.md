# Pinokio Launcher Development

Use this reference only when the task is to create, modify, debug, review, or document a Pinokio launcher project. For normal app discovery, launching, API calls, uploads, and multi-machine runtime control, use the main `pinokio/SKILL.md` flow first.

## Required Workflow

1. Resolve `PINOKIO_HOME` before creating or editing launcher files.
2. Determine launcher type:
   - App launcher -> `PINOKIO_HOME/api/<unique_name>`.
   - Plugin launcher -> `PINOKIO_HOME/plugin/<unique_name>`.
3. Inspect the closest example in `/home/apolo/pinokio/prototype/system/examples`.
4. Check `/home/apolo/pinokio/prototype/PINOKIO.md` when an API shape is uncertain.
5. For fixes, inspect the launcher's `logs/` folder before changing files.
6. Keep app code and launcher files separated:
   - app source in `app/` when cloning/building a third-party app
   - launcher scripts in the launcher root
7. Verify by running the launcher through Pinokio/pterm, not just by static inspection.

## Resolve PINOKIO_HOME

Resolve in this order:

1. `~/.pinokio/config.json` -> `home`
2. `GET http://127.0.0.1:42000/pinokio/home` -> `path`
3. If loopback is unreachable and `access` exists in config, retry against `<protocol>://<host>:<port>/pinokio/home`
4. `PINOKIO_HOME` environment variable

If none yields a valid absolute path, ask the user. Do not silently use the current workspace as a launcher destination.

## Server URL Capture Pattern

When a script needs to expose a web URL, mirror the example pattern from `/home/apolo/pinokio/prototype/system/examples/mochi/start.js`:

```javascript
on: [{
  event: "/(http:\\/\\/[0-9.:]+)/",
  done: true
}]
```

Then set the local variable using the captured match:

```javascript
{
  method: "local.set",
  params: {
    url: "{{input.event[1]}}"
  }
}
```

Prefer a generic URL regex unless the app emits a known structured message.

## Script Practices

- Use Pinokio APIs before lower-level shell work when an API exists.
- Use relative `path` values in `shell.run`; do not hardcode absolute local paths.
- Use `{{which('command')}}` for Pinokio-provided binaries instead of assuming `PATH`.
- Use `venv` for Python apps.
- Launch server apps with `daemon: true`.
- Bind to `127.0.0.1` or localhost when possible.
- Avoid fixed ports unless the app requires them; use Pinokio port helpers where appropriate.
- Put downloaded repos, models, generated files, caches, and virtualenvs in `.gitignore`.
- Do not change the Pinokio script schema `version` unless the user explicitly requests a schema migration.

## Files Expected In A Launcher

- `pinokio.js` or menu entrypoint
- `install.js` when installation is non-trivial
- `start.js` or equivalent runtime script
- `README.md` with what it runs, install/run behavior, supported platforms, ports, and troubleshooting
- `.gitignore` for generated/downloaded artifacts

## Debugging Checklist

1. Read latest logs.
2. Confirm target path is under `PINOKIO_HOME/api` or `PINOKIO_HOME/plugin`.
3. Compare script structure with the closest example.
4. Verify install/start selectors and `daemon` usage.
5. Confirm URL capture populates `local.url` through `local.set`.
6. Run via `pterm run` and verify readiness through `pterm status`.
