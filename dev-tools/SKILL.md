---
name: dev-tools
description: Debugging sistemático, auth (JWT/OAuth2/RBAC), error handling, SQL optimization, E2E testing, code review excellence.
---

# dev-tools

Skill consolidada para herramientas y patrones transversales de desarrollo.

## Cuándo usar

- Depurar bugs complejos de forma sistemática
- Implementar autenticación y autorización
- Diseñar manejo de errores robusto
- Optimizar queries SQL lentas
- Escribir o debuggear tests E2E
- Hacer o recibir code reviews efectivos

## Sub-dominios cubiertos

### Debugging Sistemático
- Hipótesis → evidencia → confirmación
- `git bisect` para localizar regresiones
- Profiling: CPU (flame graphs), memoria (heap dumps), red
- Debugging remoto (Node.js inspector, Python debugpy)
- Logging estructurado (correlation IDs, trace context)
- Root cause analysis (5 Whys, fishbone)

### Auth Patterns
- **JWT:** estructura, firma (RS256 vs HS256), refresh tokens, revocación
- **OAuth2:** Authorization Code + PKCE, Client Credentials, Device Flow
- **Session:** cookie segura, CSRF protection, SameSite
- **RBAC:** roles, permissions, policy evaluation
- **OIDC:** id_token, userinfo, discovery endpoint
- Implementación en Node.js (Passport.js, better-auth), Python (FastAPI)

### Error Handling
- Result types vs excepciones (cuándo usar cada uno)
- Error boundaries en React
- Typed errors en TypeScript (`instanceof` + discriminated unions)
- Graceful degradation y fallbacks
- Circuit breaker pattern
- Retry con exponential backoff + jitter

### SQL Optimization
- EXPLAIN ANALYZE: seq scan vs index scan
- Indexing: B-tree, GIN, GiST, covering indexes
- N+1 query detection y solución (DataLoader, JOINs, eager loading)
- Partitioning para tablas grandes
- Connection pooling (PgBouncer)
- Query rewriting con CTEs y window functions

### E2E Testing
- **Playwright:** page object model, fixtures, network mocking
- **Cypress:** intercepts, custom commands, retries
- Flaky test estrategias: waitForResponse vs sleep
- Visual regression testing
- Parallelización en CI

### Code Review
- Checklist: correctness → security → performance → readability
- Feedback constructivo (qué + por qué + sugerencia)
- PR sizes: < 400 líneas idealmente
- Review de seguridad: inyección, autenticación, exposición de datos
- Architectural review vs nitpicking

## Guías rápidas

**Al debuggear un bug difícil:** Reproduce de forma mínima → añade logging → forma hipótesis → verifica → si no, usa bisect para localizar el commit → perfila si es performance

**Al implementar auth:** Elige OAuth2 + PKCE para apps públicas → Client Credentials para M2M → siempre HTTPS → rota secrets regularmente → audita intentos fallidos

**Al optimizar una query lenta:** Ejecuta EXPLAIN ANALYZE → identifica seq scans en tablas grandes → añade índice adecuado → verifica con EXPLAIN ANALYZE de nuevo → mide mejora real
