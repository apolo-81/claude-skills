# Plugin Consolidation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace ~50 skills de plugins claude-code-workflows con 4 skills custom compactas, luego desinstalar los plugins originales.

**Architecture:** Crear 4 SKILL.md en ~/.claude/skills/ que consolidan múltiples skills por dominio. Cada skill usa progressive disclosure — description corta en el SKILL.md, referencias en subdirectorios. Luego desinstalar plugins via `claude plugin remove`.

**Tech Stack:** Bash, Claude Code plugin system, GitHub (apolo-81/claude-skills)

---

### Task 1: Crear dev-backend

**Files:**
- Create: `~/.claude/skills/dev-backend/SKILL.md`

Cubre: microservices, CQRS, event sourcing, sagas, Temporal, API design, arquitecturas limpias.

**Trigger:** diseñar APIs, microservices, event sourcing, CQRS, sagas, Temporal workflows, arquitectura backend

---

### Task 2: Crear dev-frontend

**Files:**
- Create: `~/.claude/skills/dev-frontend/SKILL.md`

Cubre: React, Next.js, React Native, TypeScript avanzado, Tailwind, diseño de sistemas, responsive, a11y, Node.js.

**Trigger:** componentes React, Next.js App Router, React Native, TypeScript types, estado global, Node.js APIs

---

### Task 3: Crear dev-ops

**Files:**
- Create: `~/.claude/skills/dev-ops/SKILL.md`

Cubre: GitHub Actions, GitLab CI, monorepos (Nx/Turborepo/Bazel), git avanzado, secrets, pipelines.

**Trigger:** CI/CD, pipelines, monorepos, git workflows avanzados, Nx, Turborepo, Bazel, shell scripting

---

### Task 4: Crear dev-tools

**Files:**
- Create: `~/.claude/skills/dev-tools/SKILL.md`

Cubre: debugging sistemático, auth (JWT/OAuth2/RBAC), error handling, SQL optimization, E2E testing, code review.

**Trigger:** debugging, autenticación, manejo de errores, optimizar queries SQL, tests E2E, code review

---

### Task 5: Desinstalar plugins con skills (dominio A/B/D)

Desinstalar: backend-development, developer-essentials, ui-design, frontend-mobile-development,
javascript-typescript, cicd-automation, shell-scripting, conductor, agent-teams, reverse-engineering,
documentation-generation, database-design, data-engineering, business-analytics, quantitative-trading,
payment-processing, python-development, security-scanning, startup-business-analyst,
machine-learning-ops, llm-application-dev

---

### Task 6: Desinstalar plugins no usados / redundantes

Desinstalar: huggingface-skills, qodo-skills, jvm-languages, functional-programming,
security-compliance, content-marketing, customer-sales-automation,
seo-analysis-monitoring, seo-content-creation, seo-technical-optimization,
code-review-ai, comprehensive-review, full-stack-orchestration, distributed-debugging,
error-debugging, error-diagnostics, deployment-validation, codebase-cleanup, multi-platform-apps

---

### Task 7: Actualizar skill-toggle y subir al repo

- Actualizar GROUPS en bin/skill-toggle: añadir grupo `my` con las 4 nuevas skills
- Copiar 4 skills al repo
- git commit + push
