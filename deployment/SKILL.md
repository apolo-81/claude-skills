---
name: deployment
description: >
  Deploy de apps a Railway (Node.js/Express/SQLite) y Vercel (Next.js).
  Configuración de variables de entorno, dominios, Dockerfile, CI/CD y monitoreo.
  Usar cuando: "deploy", "Railway", "Vercel", "subir a producción", "variables de entorno",
  "Dockerfile", "dominio custom", "Railway deploy", "Vercel deploy", "env vars producción",
  "build command", "start command", "health check", "zero-downtime deploy".
---

# Deployment — Railway + Vercel

Stack principal: **Railway** para Node.js/Express/SQLite · **Vercel** para Next.js

---

## 1. Decision Tree

```
¿Es un Next.js frontend/fullstack?
├── SÍ → Vercel (deploy automático desde GitHub)
└── NO (Node.js / Express / backend / worker)
    ├── ¿Necesita volumen persistente (SQLite)?  → Railway
    ├── ¿Stateless con DB externa?               → Railway o Fly.io
    └── ¿Docker container específico?            → Railway (soporta Dockerfile)
```

---

## 2. Vercel — Next.js

### Setup inicial
```bash
npm install -g vercel
vercel login
vercel --prod  # deploy manual

# O conectar repo GitHub en vercel.com (recomendado)
# Push a main → auto-deploy
```

### vercel.json (opcional)
```json
{
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm ci",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

### Variables de entorno
```bash
# CLI
vercel env add DATABASE_URL production
vercel env add AUTH_SECRET production

# O en vercel.com → Project → Settings → Environment Variables
```

### Build command con Prisma
```json
// package.json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "next build"
  }
}
```

### Vercel + Neon (PostgreSQL serverless)
```env
# Connection pooling para serverless
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/db?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://user:pass@ep-xxx.neon.tech/db  # para migraciones
```

---

## 3. Railway — Node.js / Express

### Setup inicial
```bash
npm install -g @railway/cli
railway login
railway init          # crear proyecto nuevo
railway up            # deploy manual
```

### railway.toml (configuración del proyecto)
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "node src/index.js"
healthcheckPath = "/health"
healthcheckTimeout = 30
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
```

### Variables de entorno en Railway
```bash
# CLI
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=your-secret
railway variables set PORT=3000

# O en railway.app → Project → Variables
```

**Variables que Railway inyecta automáticamente:**
- `PORT` — puerto asignado (siempre usar `process.env.PORT`)
- `RAILWAY_ENVIRONMENT` — `production` / `staging`
- `RAILWAY_STATIC_URL` — URL pública del servicio

### Health check endpoint (requerido)
```javascript
// src/index.js
app.get('/health', (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV, ts: Date.now() })
})
```

---

## 4. Dockerfile (Railway — control total)

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Instalar dependencias primero (cache layer)
COPY package*.json ./
RUN npm ci --only=production

# Copiar código
COPY . .

# Puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/index.js"]
```

### Para SQLite con volumen persistente en Railway
```dockerfile
# Crear directorio de datos
RUN mkdir -p /app/data
VOLUME ["/app/data"]

CMD ["node", "src/index.js"]
```

```bash
# En Railway: Settings → Volumes → Mount path: /app/data
```

---

## 5. Variables de entorno — Buenas prácticas

### .env.example (siempre en repo, sin valores reales)
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=./data/db.sqlite
# Para PostgreSQL: postgresql://user:pass@host:5432/db

# Auth
JWT_SECRET=              # min 32 chars — generar con: openssl rand -hex 32
JWT_REFRESH_SECRET=      # diferente al anterior

# WhatsApp / Baileys
WA_SESSION_DIR=./data/wa-sessions

# GHL OAuth
GHL_CLIENT_ID=
GHL_CLIENT_SECRET=
GHL_REDIRECT_URI=https://yourapp.railway.app/oauth/callback

# Resend
RESEND_API_KEY=
```

### Validar env vars al arranque
```javascript
// src/lib/env.js
const required = ['JWT_SECRET', 'DATABASE_URL', 'GHL_CLIENT_ID']

for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌ Missing required env var: ${key}`)
    process.exit(1)
  }
}

console.log('✅ Environment validated')
```

---

## 6. Prisma en producción

### Build command Railway
```bash
npx prisma migrate deploy && node src/index.js
```

### O en railway.toml
```toml
[build]
buildCommand = "npm ci && npx prisma generate"

[deploy]
startCommand = "npx prisma migrate deploy && node src/index.js"
```

---

## 7. Dominios custom

### Vercel
```bash
vercel domains add myapp.com
# Agregar CNAME en DNS: @ → cname.vercel-dns.com
```

### Railway
```bash
# En railway.app → Settings → Networking → Custom Domain
# Agregar CNAME: app → yourapp.railway.app
```

---

## 8. CI/CD con GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm test
      - name: Deploy to Railway
        uses: bervproject/railway-deploy@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
          service: your-service-name
```

---

## 9. Monitoreo post-deploy

```bash
# Railway logs en tiempo real
railway logs --tail

# Vercel logs
vercel logs your-deployment-url

# Estado del servicio
railway status
```

### Checklist post-deploy
- [ ] Health check responde (`/health` → `{ ok: true }`)
- [ ] Variables de entorno configuradas
- [ ] Migraciones de DB aplicadas
- [ ] Dominio custom apunta correctamente
- [ ] HTTPS activo (Railway y Vercel lo hacen automático)
- [ ] Logs sin errores en los primeros 5 minutos

---

## 10. Rollback

```bash
# Vercel — redeployar versión anterior desde dashboard
# o CLI:
vercel rollback

# Railway — desde railway.app → Deployments → redeploy commit anterior
```

---

## Costos de referencia (2026)

| Plataforma | Plan | Costo | Límites |
|---|---|---|---|
| Vercel | Hobby | $0 | 100GB bandwidth, funciones serverless |
| Vercel | Pro | $20/mes | Más bandwidth, team collaboration |
| Railway | Starter | $5 crédito gratis | ~$0.000463/vCPU/min |
| Railway | Pro | $20/mes | Sin límite de proyectos, más recursos |
