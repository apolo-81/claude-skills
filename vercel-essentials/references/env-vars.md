# Vercel Environment Variables

## Jerarquía de archivos `.env`

Vercel y Next.js cargan en orden; los de abajo sobrescriben a los de arriba.

| Archivo | Propósito | ¿Git? |
|---------|-----------|-------|
| `.env` | Defaults para todos los entornos | Sí |
| `.env.local` | Overrides locales y secrets | **No** (gitignored) |
| `.env.development` | Defaults de development | Sí |
| `.env.development.local` | Override local de dev | **No** |
| `.env.production` | Defaults de production | Sí |
| `.env.production.local` | Override local de prod | **No** |
| `.env.test` | Defaults de test | Sí |
| `.env.test.local` | Override local de test | **No** |

**Load order (Next.js)**: `.env` → `.env.[environment]` → `.env.local` (se omite en test) → `.env.[environment].local` (mayor prioridad, se omite en test).

### Reglas críticas

- **Nunca commitear secrets** en `.env`, `.env.development`, `.env.production` → usar variantes `.local` o env vars de Vercel.
- `.env.local` siempre está gitignored por Next.js — ahí escribe `vercel env pull`.
- `NEXT_PUBLIC_*` (y `VITE_*` en Vite) se exponen en el bundle del browser → **jamás secrets ahí**. El resto son server-only (route handlers, Server Components, middleware/proxy). Ver tu memo `feedback_dev_workflow` y `feedback_env_files_safety`.

## `vercel env` CLI

```bash
# Pull
vercel env pull .env.local                          # entorno actual
vercel env pull .env.local --environment=production # prod (o preview / development)
vercel env pull .env.local --yes                    # sobrescribe sin preguntar

# Add  (environment es argumento POSICIONAL, no flag)
vercel env add MY_SECRET                             # interactivo
echo "valor" | vercel env add MY_SECRET production
echo "valor" | vercel env add MY_SECRET production preview development
vercel env add MY_SECRET --sensitive                # encriptado, no se muestra en logs

# List / Remove
vercel env ls            | vercel env ls production
vercel env rm MY_SECRET production   | vercel env rm MY_SECRET   # de todos los entornos
```

`vercel pull` también baja env vars junto con la config del proyecto.

### Correr con envs sin escribir archivo

```bash
vercel env run -- npm test
vercel env run -e preview -- next dev   # el separador -- es obligatorio
```

## Bootstrap (clone fresco / máquina nueva)

```bash
# 1) Link primero para que el pull apunte al proyecto correcto
vercel link --yes --project <name-o-id> --scope <team>
# 2) Pull
vercel env pull .env.local --yes
# 3) Verificar que existan las keys de .env.example
while IFS='=' read -r key _; do
  [[ -z "$key" || "$key" == \#* ]] && continue
  grep -q "^${key}=" .env.local || echo "Falta en .env.local: $key"
done < .env.example
```

Re-pull tras cambios de secrets o provisioning (Neon/Upstash añaden env vars): `vercel env pull .env.local --yes`.

## OIDC Token (auth keyless con servicios Vercel)

Vercel usa tokens **OIDC** (JWT corto) para auth sin llaves entre tu app y servicios Vercel (AI Gateway, storage…).

- **En deploys de Vercel**: `VERCEL_OIDC_TOKEN` se inyecta automático y se auto-refresca. Cero config.
- **Local**: `vercel env pull .env.local` provisiona un `VERCEL_OIDC_TOKEN` válido ~12h.
- **Expira** → re-correr `vercel env pull .env.local --yes`. Hacerlo al inicio de cada sesión de dev evita fallos de auth a mitad de camino.

```ts
import { getVercelOidcToken } from '@vercel/oidc'  // lee VERCEL_OIDC_TOKEN solo
// AI Gateway usa OIDC por defecto — sin manejo manual de token
```

> Nota: el OIDC de runtime (federación con AWS/GCP/Vault desde funciones) **no** reemplaza `VERCEL_TOKEN` para deploys del CLI en CI — esos siguen necesitando `VERCEL_TOKEN`.
