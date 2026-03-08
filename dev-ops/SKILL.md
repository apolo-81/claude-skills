---
name: dev-ops
description: CI/CD, monorepos (Nx/Turborepo/Bazel), GitHub Actions, GitLab CI, git workflows avanzados, secrets, shell scripting.
---

# dev-ops

Skill consolidada para CI/CD, monorepos y operaciones de desarrollo.

## Cuándo usar

- Configurar pipelines CI/CD (GitHub Actions, GitLab CI)
- Gestionar monorepos con Nx, Turborepo o Bazel
- Git workflows avanzados (rebase, bisect, worktrees, reflog)
- Secrets management en pipelines
- Shell scripting defensivo
- Build optimization y caching

## Sub-dominios cubiertos

### GitHub Actions
- Workflow templates para test/build/deploy
- Matrix builds (múltiples OS/versiones)
- Reusable workflows (`workflow_call`)
- Actions caching (actions/cache)
- Environments y protection rules
- OIDC para autenticación sin secrets estáticos

### GitLab CI
- Multi-stage pipelines (build → test → deploy)
- Distributed runners y caching
- Includes y templates
- Environments y deployment tracking

### Monorepos
- **Turborepo:** pipeline config, remote caching (Vercel), `turbo run` con filtros
- **Nx:** project boundaries, affected commands, executors, generators
- **Bazel:** BUILD files, remote execution, hermeticidad
- **pnpm workspaces:** linking, hoisting, catalogs

### Secrets Management
- GitHub Secrets + OIDC con AWS/GCP/Azure
- HashiCorp Vault: dynamic secrets, policies
- AWS Secrets Manager + Parameter Store
- Rotación automática de secrets

### Git Workflows
- Rebase interactivo y squash
- Cherry-pick y bisect para debugging
- Worktrees para trabajo paralelo
- Reflog para recuperar trabajo perdido
- Conventional commits y semantic versioning
- Git hooks (pre-commit, commit-msg)

### Shell Scripting
- `set -euo pipefail` y traps
- ShellCheck para linting estático
- Bats para testing de scripts
- Manejo de errores y logging robusto
- Portabilidad bash vs sh

### Deployment Pipeline Design
- Environments: dev → staging → prod
- Approval gates y manual deployments
- Blue/green y canary deployments
- Rollback automático
- GitOps con ArgoCD/Flux

## Guías rápidas

**Al crear un pipeline GitHub Actions:** Define trigger → jobs con needs para dependencias → cache de dependencias → artifacts para compartir entre jobs → environment para prod

**Al optimizar monorepo Turborepo:** Define pipeline en turbo.json → identifica qué tareas dependen de qué → activa remote caching → usa `--filter` para builds afectados

**Al usar git avanzado:** `git bisect` para encontrar commit que introduce bug → `git worktree add` para trabajar en 2 branches simultáneamente → `git reflog` para recuperar commits perdidos
