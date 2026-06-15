---
name: run-api
description: Run, start, build, test, or smoke-test the NestJS portfolio API (apps/api). Use when asked to start the API, check if the API works, verify endpoints, run the server, or screenshot/test the backend.
---

# run-api

NestJS 10 REST API on port 3001. Backed by Neon PostgreSQL (cloud, no local DB needed). Smoke-tested via `curl`. The driver is `.claude/skills/run-api/smoke.sh`.

All paths below are relative to `apps/api/`.

---

## Prerequisites

- Node.js ≥ 20 (`node --version`)
- Yarn (`yarn --version`)
- `.env` present in `apps/api/` — copy from `.env.example` and fill in real Neon DB URL + JWT keys. The existing `.env` on disk already has working Neon credentials; do NOT overwrite it.

No local database or Docker required — the `.env` points to Neon cloud.

---

## Build

```bash
# From apps/api/
npx nest build
```

Build takes ~5 s. Output goes to `dist/`. Build has no stdout on success (exit 0 = done).

---

## Run (agent path)

### 1. Start the API in background

```bash
# From apps/api/
node dist/main.js &
API_PID=$!
sleep 12   # wait for DB connection (~2–3 s) + AdminJS bundle (~8 s)
```

Bootstrap sequence:
1. Early HTTP server binds `:3001` immediately (returns `{"status":"starting"}` at `/v1/health`)
2. TypeORM connects to Neon (~2–3 s, SSL handshake)
3. AdminJS bundles its frontend (~8 s in prod mode, logs "Finish bundling: N files")
4. NestJS fully starts → logs `Nest application successfully started`

Ready signal: `curl -s http://localhost:3001/v1/health` returns `{"status":"ok",...}`.

### 2. Run smoke tests

```bash
bash .claude/skills/run-api/smoke.sh
```

Expected output (all PASS):
```
=== API smoke test: http://localhost:3001 ===
  PASS  health (200)
  PASS  resume (200)
  PASS  blog list (200)
  PASS  projects list (200)
  PASS  gallery albums (200)
  PASS  blog tags (200)
  PASS  auth 401 (401)

Results: 7 passed, 0 failed
```

### 3. Stop

```bash
kill $API_PID
```

---

## Run (human path)

```bash
# From apps/api/
yarn start:dev   # watch mode — restarts on file changes
```

Or from repo root:
```bash
yarn api
```

---

## Test

```bash
# From apps/api/
yarn test                                        # all Jest unit tests
yarn test --testPathPattern=blog                # single file
yarn test:cov                                   # coverage (80% threshold)
```

---

## Key endpoints

| Route | Auth | Notes |
|---|---|---|
| `GET /v1/health` | No | `{"status":"ok","version":"..."}` |
| `GET /v1/resume/:slug` | No | Full resume DTO. Default slug: `default` |
| `GET /v1/blog` | No | List of published posts (array, not paginated envelope) |
| `GET /v1/projects` | No | List of published projects |
| `GET /v1/gallery/albums` | No | All public albums |
| `POST /v1/auth/login` | No | `{email, password}` → `{accessToken, expiresIn}` |
| `GET /v1/auth/me` | Bearer | Returns 401 without token |

Swagger UI (dev only): `http://localhost:3001/v1/docs`

---

## Gotchas

- **Bootstrap takes ~12 s.** AdminJS bundles its own frontend bundle on every cold start. Do not curl before the "Finish bundling" log line — you'll hit the early server which returns 503 for non-`/v1/health` routes.
- **Neon SSL warning.** Node prints a `SECURITY WARNING: The SSL modes 'prefer', 'require'…` deprecation notice on every start. This is harmless — from `pg-connection-string`; not from our code.
- **`LegacyRouteConverter` WARN.** NestJS 10 logs a warning about `/v1/admin/*` wildcard route. Harmless — auto-converted by the framework.
- **`nest build` has no success output.** Exit 0 = success. Any compiler error prints to stderr.
- **No docker needed.** DB is Neon cloud. Don't spin up a local Postgres.
- **DB_SYNC=true.** The `.env` enables TypeORM auto-sync in development. Never set this in production.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `curl: (7) Failed to connect to localhost port 3001` | API not started or still booting — wait the full 12 s |
| `{"status":"booting"}` from health | AdminJS still bundling — wait a few more seconds |
| `Error: connect ECONNREFUSED` in API logs | Neon DB unreachable — check `DATABASE_URL` in `.env` |
| `nest build` exits with TS errors | Check `packages/types/src/api.d.ts` exists — run `yarn generate:types` if missing |
| Gallery albums returns 500 | Transient Neon connection; retry once |
