---
name: mysql-better-sqlite
description: >
  Connects Node.js/Express apps to MySQL (via mysql2/promise) and SQLite (via
  better-sqlite3) with patterns for connection pooling, prepared statements,
  transactions, migrations, JSON columns, foreign keys and safe schema evolution.
  Covers debugging connectivity locally before blaming infra. Stack: mysql2 +
  better-sqlite3 + Express / Next.js Route Handlers. Usar cuando: "mysql", "mysql2",
  "better-sqlite3", "SQLite", "AULA", "lms-core MySQL", "validar localmente con mysql2",
  "conexión a MySQL", "pool de conexiones MySQL", "prepared statement", "$transaction
  mysql", "FOREIGN KEY constraint", "JSON column MySQL", "migraciones manuales sin ORM",
  "ER_NOT_SUPPORTED_AUTH_MODE", "ECONNREFUSED MySQL", "SQLite WAL mode", "db.prepare()".
  Triggers in English: "mysql2 connection pool", "better-sqlite3 transaction",
  "prepared statement", "SQLite WAL", "MySQL foreign key error", "auth method MySQL",
  "JSON column query", "schema migration without Prisma". Do NOT use for: PostgreSQL
  (use prisma-orm or supabase-stack), Prisma-managed schemas (use prisma-orm),
  ORM-style abstractions over SQL (use prisma-orm).
---

# MySQL + better-sqlite3

Direct SQL patterns for Node.js apps where Prisma is overkill or unavailable. AULA UC Logos and `lms-core` production run on MySQL (`mysql2/promise`); local dev tools and small Express APIs use `better-sqlite3`.

## Stack

- **MySQL prod:** `mysql2/promise` v3.x with pool
- **SQLite dev/embedded:** `better-sqlite3` v11.x (synchronous, fast)
- **Migrations:** manual SQL files in `migrations/<timestamp>_<name>.sql` + boot-time runner
- **No ORM by choice** — keep SQL readable, leverage `AUTO_MIGRATE_ON_STARTUP + ensureColumns` pattern from AULA

## Connection Setup

### MySQL (`mysql2/promise`)

```ts
// db/mysql.ts
import mysql from 'mysql2/promise'

export const pool = mysql.createPool({
  host:     process.env.MYSQL_HOST,
  port:     Number(process.env.MYSQL_PORT ?? 3306),
  user:     process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,        // avoid Date object pitfalls
  decimalNumbers: true,
  timezone: 'Z',            // store UTC, format on edge
})
```

Always use `?` placeholders — **never concatenate user input into the SQL string**. Both `pool.execute()` and `pool.query()` accept parameters; `execute()` is preferred because it caches the prepared statement:
```ts
const [rows] = await pool.execute(
  'SELECT id, email FROM users WHERE tenant_id = ? AND active = ?',
  [tenantId, 1]
)
```

### SQLite (`better-sqlite3`)

```ts
import Database from 'better-sqlite3'

export const db = new Database('data.db')
db.pragma('journal_mode = WAL')         // reads don't block writes
db.pragma('synchronous = NORMAL')       // good balance
db.pragma('foreign_keys = ON')          // off by default!
```

Synchronous = no `await`. Compose statements once, reuse:
```ts
const getUser = db.prepare('SELECT * FROM users WHERE id = ?')
getUser.get(42)                         // single row
getUser.all()                           // all rows  (works with iteration too)
```

## Transactions

### MySQL
```ts
const conn = await pool.getConnection()
try {
  await conn.beginTransaction()
  await conn.execute('UPDATE accounts SET balance = balance - ? WHERE id = ?', [100, 1])
  await conn.execute('UPDATE accounts SET balance = balance + ? WHERE id = ?', [100, 2])
  await conn.commit()
} catch (err) {
  await conn.rollback()
  throw err
} finally {
  conn.release()
}
```

### SQLite — `transaction()` wrapper
```ts
const transfer = db.transaction((from: number, to: number, amount: number) => {
  db.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ?').run(amount, from)
  db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(amount, to)
})
transfer(1, 2, 100)
```

**Gotcha (Baileys quirks memory):** `db.prepare()` inside a `transaction()` callback is prohibited when statements are defined outside. Prepare statements upfront, reference them inside.

## Migrations Without an ORM

### AULA pattern — boot-time auto-migrate

```ts
// db/migrate.ts
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export async function runMigrations(pool: mysql.Pool) {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id   VARCHAR(255) PRIMARY KEY,
      ran_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  const dir = join(process.cwd(), 'migrations')
  const files = readdirSync(dir).filter(f => f.endsWith('.sql')).sort()

  for (const file of files) {
    const [rows] = await pool.execute('SELECT 1 FROM _migrations WHERE id = ?', [file])
    if ((rows as any[]).length) continue

    const sql = readFileSync(join(dir, file), 'utf8')
    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()
      // split on semicolons (naive — keep each migration single-statement-ish)
      for (const stmt of sql.split(/;\s*$/m).filter(s => s.trim())) {
        await conn.execute(stmt)
      }
      await conn.execute('INSERT INTO _migrations (id) VALUES (?)', [file])
      await conn.commit()
    } catch (err) {
      await conn.rollback()
      throw err
    } finally {
      conn.release()
    }
  }
}
```

Set `AUTO_MIGRATE_ON_STARTUP=true` env var to run at boot. App becomes self-healing.

### `ensureColumns` pattern (defensive)

Useful when migrations may have skipped:
```ts
async function ensureColumn(pool, table, column, ddl) {
  const [cols] = await pool.execute(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  )
  if (!(cols as any[]).length) {
    await pool.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${ddl}`)
  }
}
```

## JSON Columns

### MySQL 8+
```sql
ALTER TABLE users ADD COLUMN preferences JSON NULL;
```
```ts
await pool.execute(
  'UPDATE users SET preferences = ? WHERE id = ?',
  [JSON.stringify({ theme: 'dark' }), userId]
)

const [rows] = await pool.execute(
  `SELECT id, JSON_EXTRACT(preferences, '$.theme') AS theme FROM users`
)
```

### SQLite — text + `json()` functions
```sql
SELECT id, json_extract(preferences, '$.theme') AS theme FROM users;
```

## Debugging Connectivity Locally First

Memory rule: **validar localmente con mysql2 antes de debuggear infra**.

Minimal connectivity check script:
```ts
// scripts/db-ping.ts
import { pool } from '../db/mysql'

const [rows] = await pool.execute('SELECT 1 + 1 AS ok')
console.log(rows)
await pool.end()
```

If this works locally with the same creds: problem is infra (firewall, IP allowlist, Render VPC, hostname resolution). If it fails: it's auth/network at the developer's level.

## Common Errors

| Error | Cause | Fix |
|---|---|---|
| `ER_NOT_SUPPORTED_AUTH_MODE` | MySQL 8 + old client | `mysql2` ≥3.0 OR `ALTER USER ... IDENTIFIED WITH mysql_native_password` |
| `ECONNREFUSED 127.0.0.1:3306` | MySQL not listening / wrong port | Check `bind-address` in `my.cnf`, port forwarding |
| `Too many connections` | Pool too big × workers | Lower `connectionLimit`, use single pool per process |
| `Foreign key constraint fails` | Parent row missing | `SET FOREIGN_KEY_CHECKS=0` only in migrations, never runtime |
| `SQLITE_BUSY` | Concurrent writes without WAL | `pragma('journal_mode = WAL')` |
| Date returns as `Date` then back as string mismatch | mysql2 default | Use `dateStrings: true` |

## Dates and Timezone

- **Always store UTC in DB.** Use `TIMESTAMP` in MySQL or ISO string in SQLite.
- `dateStrings: true` in mysql2 returns `'2026-05-15 14:30:00'` (no Date conversion).
- Format on edge with `dayjs` / `Intl.DateTimeFormat`, never inside queries.

## Workflow Checklist

```
New table / column:
- [ ] Write migration SQL in migrations/<ts>_<name>.sql
- [ ] Use prepared statements (?) — never string concat
- [ ] Add FK with ON DELETE / ON UPDATE explicit
- [ ] Index foreign keys + columns used in WHERE
- [ ] Run db-ping.ts locally first if errors
- [ ] If AUTO_MIGRATE_ON_STARTUP: redeploy reaplica
```

## Related Skills

- `prisma-orm` — PostgreSQL with Prisma (preferred when starting fresh)
- `supabase-stack` — PostgreSQL with RLS via Supabase
- `multi-tenant-patterns` — `tenant_id` scoping for MySQL/SQLite
- `express-api` — Express + mysql2 + Zod pattern
- `deployment` / `render-deployment` — host MySQL (PlanetScale, Railway, Render add-on). Note: Render Managed Postgres uses `pg`, not `mysql2`.
