---
name: vercel-essentials
description: >
  Vercel a profundidad — CLI avanzado, CI/CD, env vars y patrones Next.js App Router (Next 16).
  Reemplaza al plugin oficial de Vercel (43 skills) condensado a lo esencial. Complementa a `deployment`
  (que cubre el deploy básico). Usar cuando: "vercel link", "monorepo vercel", "vercel build --prebuilt",
  "vercel promote", "vercel rollback", "CI/CD vercel", "GitHub Actions vercel", "VERCEL_TOKEN",
  "vercel env pull", "OIDC token", "VERCEL_OIDC_TOKEN", "project.json vs repo.json", "App Router",
  "server component async", "cookies() headers() params async", "middleware proxy.ts", "revalidateTag",
  "next/router next/navigation", "getServerSideProps migrar", "next 16 breaking changes".
  Do NOT use for: deploy básico a Vercel (usar `deployment`), Railway, Express puro, ni AI SDK/Workflow/shadcn
  del plugin (esos quedaron fuera del recorte — reactivar el plugin oficial si se necesitan).
---

# Vercel Essentials

Condensado del plugin oficial de Vercel a las 3 áreas que uso: **CLI+Deploy avanzado**, **env vars** y **Next.js App Router**. El deploy básico (`vercel --prod`, `vercel env add`, dominios) ya vive en la skill `deployment` — esto es el nivel profundo.

## Cuándo abrir cada referencia

- **CLI, linking, monorepo, promote/rollback, CI/CD** → `references/cli-deploy.md`
- **`.env` jerarquía, `vercel env pull/add`, OIDC, bootstrap** → `references/env-vars.md`
- **App Router, Server Components/Actions, caché, breaking changes Next 16** → `references/nextjs.md`

## Cheat sheet (lo más usado)

```bash
# Linking — la causa #1 de fallos raros
vercel link            # single project → .vercel/project.json
vercel link --repo     # monorepo (varios proyectos) → .vercel/repo.json
vercel whoami          # ¿team correcto? linkear en el team equivocado es error común

# Deploy
vercel                 # preview
vercel --prod          # producción
vercel promote <url>   # instantáneo: re-apunta el alias prod sin rebuild (preview ya validado)
vercel rollback        # vuelve a la producción anterior

# Env vars
vercel env pull .env.local --yes                       # baja secrets (gitignored)
vercel env pull .env.local --environment=production
echo "val" | vercel env add KEY production             # add no interactivo
vercel env run -- npm run dev                           # corre con envs sin escribir archivo
```

## Reglas de oro (gotchas que muerden)

1. **`project.json` vs `repo.json`**: en monorepo con varios proyectos usá `vercel link --repo`. Si algo se rompe, mirá `.vercel/` primero.
2. **CI: nunca `--token` en flag** (se filtra en el listado de procesos) → usá `VERCEL_TOKEN` env var. Siempre `--yes`. `--scope` si el token ve varios teams.
3. **CI determinista**: `vercel pull --environment=production` → `vercel build --prod` → `vercel deploy --prebuilt --prod`. Separar build/deploy en jobs distintos requiere `vercel build --prod --standalone`.
4. **`NEXT_PUBLIC_` / `VITE_` se hornea en el bundle del browser** → nunca secrets ahí (ver tu memo `feedback_dev_workflow`).
5. **Next.js 16**: `cookies()`, `headers()`, `params`, `searchParams` son **async** (necesitan `await`). `middleware.ts` → `proxy.ts`. `revalidateTag(tag)` → `revalidateTag(tag, "max")`.
6. **`vercel deploy` tras `vercel build` sin `--prebuilt`** ignora el build local.
7. **OIDC local caduca ~12h** → `vercel env pull .env.local --yes` al inicio de cada sesión de dev evita fallos de auth a mitad de camino.
