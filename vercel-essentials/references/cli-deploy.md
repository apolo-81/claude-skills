# Vercel CLI + Deploy + CI/CD

El CLI (`vercel` o `vc`). `vercel <command> -h` para flags completos.

## Project Linking (causa #1 de fallos raros)

Los comandos deben correrse desde el directorio que contiene `.vercel/` (o un subdirectorio).

| Archivo | Lo crea | Cuándo |
|---------|---------|--------|
| `.vercel/project.json` | `vercel link` | Un solo proyecto. OK en monorepo si hay UN solo proyecto. |
| `.vercel/repo.json` | `vercel link --repo` | Repo con varios proyectos. Siempre que algún proyecto esté en subdir (`apps/web`). |

- Correr desde un subdir del proyecto (`apps/web/`) evita el prompt "¿qué proyecto?".
- **Cuando algo falla, revisá `.vercel/` primero** — ¿`project.json` o `repo.json`? Y `vercel whoami` (linkear en el team equivocado es clásico; cambiar con `vercel teams switch`).
- Muchos comandos auto-ejecutan `vercel link` si no existe `.vercel/`, creando `project.json` (puede estar mal en monorepo). Linkeá explícito primero.

## Quick start

```bash
npm i -g vercel
vercel login
vercel link              # single  | vercel link --repo  para monorepo
vercel pull              # baja config + env vars
vercel dev               # desarrollo local
vercel deploy            # preview  | vercel --prod  para producción
```

## Deploy

```bash
vercel                   # preview (auto en cada push a rama no-prod con Git integration)
vercel --prod            # producción
vercel --prod --force    # fuerza deploy nuevo (sin caché)

# Build local + deploy del output (no rebuild remoto)
vercel build             # usa env de development por defecto
vercel build --prod      # usa env de producción
vercel deploy --prebuilt --prod
```

**`--prebuilt` cuándo**: CI propio donde controlás el build, querés caché de build a nivel CI, o correr tests entre build y deploy.

## Promote & Rollback

```bash
vercel promote <url-o-id>   # INSTANTÁNEO: re-apunta alias prod sin rebuild (preview ya validado)
vercel rollback             # vuelve a la producción anterior
vercel rollback <url-o-id>  # a un deploy específico
```

`promote` vs `deploy --prod`: promote no reconstruye, solo mueve el alias. Úsalo cuando un preview fue validado.

## Inspect / logs

```bash
vercel inspect <url>     # build info, functions, metadata
vercel ls                # deploys recientes
vercel logs <url>        # logs  | --follow para seguir
vercel curl <url>        # accede a preview protegido SIN desactivar deployment protection
```

## CI/CD

### El patrón estándar

```bash
vercel pull --yes --environment=production
vercel build --prod
vercel deploy --prebuilt --prod
```

Monorepo multi-proyecto: correr `vercel link --repo --yes` antes.

### Variables que necesita TODO pipeline

```bash
VERCEL_TOKEN=<token>          # personal o de team
VERCEL_ORG_ID=<org-id>        # de .vercel/project.json
VERCEL_PROJECT_ID=<id>        # de .vercel/project.json
```

Como secrets del CI. Nunca commiteados.

### Jobs separados de build y deploy

Usá `--standalone` para que los artefactos sean autocontenidos y pasen entre jobs:

```yaml
jobs:
  build:
    steps:
      - run: vercel pull --yes --environment=production
      - run: vercel build --prod --standalone
      - uses: actions/upload-artifact@v4
        with: { name: vercel-build, path: .vercel/output }
  deploy:
    needs: build
    steps:
      - uses: actions/download-artifact@v4
        with: { name: vercel-build, path: .vercel/output }
      - run: vercel deploy --prebuilt --prod
```

Sin `--standalone` el deploy falla: los artefactos referencian archivos fuera de `.vercel/output/`.

### GitHub Actions (mínimo)

```yaml
name: Deploy to Vercel
on: { push: { branches: [main] } }
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install -g vercel
      - run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      - run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      - run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

Capturar la URL: `URL=$(vercel deploy --prod)` (stdout = URL, stderr = progreso).

## Anti-patterns

- Tipo de link equivocado en monorepo → usar `vercel link --repo`.
- Dejar que comandos auto-linkeen en monorepo → crea `project.json` (puede ser incorrecto).
- Linkear en el team equivocado → `vercel whoami` / `vercel teams switch`.
- Olvidar `--yes` en CI (prompts interactivos cuelgan).
- `vercel deploy` tras `vercel build` sin `--prebuilt` → ignora el build.
- Hardcodear token en `--token` → usar `VERCEL_TOKEN` env (no se filtra en process listing).
- Desactivar deployment protection para ver un preview → usar `vercel curl`.
- Comando inexistente en el CLI → fallback `vercel api`.
