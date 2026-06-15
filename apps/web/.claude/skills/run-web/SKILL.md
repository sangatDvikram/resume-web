---
name: run-web
description: Run, start, build, test, or smoke-test the Next.js portfolio web app (apps/web). Use when asked to start the frontend, check if the web app works, verify pages, run the dev server, or screenshot the UI.
---

# run-web

Next.js 16 (App Router, React 19, Tailwind CSS v4) portfolio frontend on port 3000. Server Components by default; client-only code in `*Client.tsx` files. The API must be running on port 3001 for data to load. Smoke-tested via `curl`. The driver is `.claude/skills/run-web/smoke.sh`.

All paths below are relative to `apps/web/`.

---

## Prerequisites

- Node.js ≥ 20 (`node --version`)
- `.env` in `apps/web/` — copy from `.env.example`. The existing `.env` on disk already has working values.
- API running on `http://localhost:3001` (see `apps/api/.claude/skills/run-api/SKILL.md`)

---

## Build

```bash
# From apps/web/
node_modules/.bin/next build
```

Build requires the API to be running first (ISR pre-generation fetches live data). Takes ~30–60 s.

---

## Run (agent path)

### 1. Start the dev server in background

```bash
# From apps/web/
node_modules/.bin/next dev --turbopack &
WEB_PID=$!
sleep 15   # wait for Turbopack compile + initial route compilation
```

Ready signal: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` returns `200`.

Note: first request to an unvisited route triggers Turbopack compilation (2–6 s). Subsequent hits are fast.

### 2. Run smoke tests

```bash
bash .claude/skills/run-web/smoke.sh
```

Expected output (all PASS):
```
=== Web smoke test: http://localhost:3000 ===
  PASS  homepage (HTTP 200)
  PASS  blog index (HTTP 200)
  PASS  projects index (HTTP 200)
  PASS  gallery (HTTP 200)
  PASS  resume page (HTTP 200)
  PASS  robots.txt (HTTP 200)
  PASS  revalidate 401 (HTTP 405)
  PASS  revalidate POST bad secret (401)

Results: 8 passed, 0 failed
```

### 3. Check page content

```bash
# Homepage contains the user's name
curl -s http://localhost:3000/ | grep -o '<title>[^<]*</title>'
# → <title>Vikram Sangat — Senior Software Engineer</title>
```

### 4. Stop

```bash
kill $WEB_PID
```

---

## Run (human path)

```bash
# From apps/web/ — opens browser at http://localhost:3000
node_modules/.bin/next dev --turbopack
```

Or from repo root:
```bash
yarn web
```

---

## Routes

| Route | Rendering | Notes |
|---|---|---|
| `/` | ISR (60s) | Homepage with resume summary |
| `/blog` | ISR (60s) | Blog post list |
| `/blog/[slug]` | SSG + on-demand | Per-post detail |
| `/projects` | ISR (60s) | Projects list |
| `/projects/[slug]` | SSG + on-demand | Per-project detail |
| `/gallery` | SSR | Dynamic; always fresh |
| `/resume` | Static | PDF-style resume view |
| `/api/revalidate` | POST only | ISR trigger; requires `REVALIDATE_SECRET` |
| `/robots.txt` | Static | Returns 200 |

**Not implemented:** `/sitemap.xml` returns 404.

---

## Gotchas

- **API must be running.** Every server-rendered page fetches from `http://localhost:3001`. With API down, pages return empty shells or 500 errors.
- **First route compile.** Turbopack compiles each route on first request (~2–6 s). The dev server logs `○ Compiling /projects ...` — wait for it.
- **`/api/revalidate` is POST-only.** `GET` returns 405 (Method Not Allowed), not 401.
- **Sitemap returns 404.** Not yet implemented — don't test for it.
- **`next build` needs live API.** ISR pre-generation calls the API at build time. Build will fail or warn if API is down.
- **`--turbopack` flag.** The `dev` script uses Turbopack. The standard `next dev` (without it) also works but is slower.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `curl: (7) Failed to connect to localhost port 3000` | Dev server not started or still compiling — wait the 15 s |
| Pages return empty data | API not running on port 3001 — start it first |
| First page load returns 500 | API DB connection timed out — retry once |
| `next build` fails with fetch errors | Start the API before running `next build` |
| `/gallery` returns 500 | Transient Neon connection error — retry |
