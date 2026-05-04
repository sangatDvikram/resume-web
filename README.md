# Portfolio CMS — Monorepo

A full-stack Portfolio & CMS platform built as a Yarn Workspaces + Lerna monorepo.

| App / Package | Tech | Dev URL |
|---|---|---|
| `apps/web` | Next.js 16 · React 19 · Tailwind v4 | `http://localhost:3000` |
| `apps/api` | NestJS 10 · TypeORM · Swagger | `http://localhost:3001/v1` |
| `packages/types` | Shared TypeScript interfaces | — |
| `packages/eslint-config` | Shared ESLint configs | — |
| `packages/oat-ui` | Shared component library (stub) | — |

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | 20 LTS |
| Yarn | 1.22.x (Classic) |
| Docker + Docker Compose | any recent version (for local Postgres) |

---

## Getting started

```sh
# 1. Clone the repo
git clone <repo-url>
cd resume-web

# 2. Install all workspace dependencies
yarn install

# 3. Copy env files and fill in values
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# 4. Start local Postgres (requires Docker)
docker compose up -d

# 5a. Run everything in parallel
yarn dev

# 5b. Or run each app individually
yarn web   # Next.js  → http://localhost:3000
yarn api   # NestJS   → http://localhost:3001/v1
```

---

## Available scripts (root)

| Script | Description |
|---|---|
| `yarn dev` | Start all apps in parallel (via Lerna) |
| `yarn build` | Production build for all apps |
| `yarn test` | Run all test suites |
| `yarn lint` | Lint all workspaces |
| `yarn web` | Start only the Next.js dev server |
| `yarn api` | Start only the NestJS dev server (watch mode) |

### API-specific scripts (`apps/api`)

```sh
yarn workspace api test          # Unit tests (Jest)
yarn workspace api test:e2e      # End-to-end tests
yarn workspace api test:cov      # Coverage report
yarn workspace api migration:generate -- src/migrations/MigrationName
yarn workspace api migration:run
yarn workspace api migration:revert
```

---

## Environment variables

### `apps/api/.env`

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | ✅ | `development` / `production` |
| `PORT` | | API port (default `3001`) |
| `FRONTEND_URL` | ✅ | Next.js origin — added to CORS whitelist |
| `DATABASE_URL` | ✅ | Neon **pooler** connection string (runtime) |
| `DATABASE_URL_UNPOOLED` | ✅ | Neon **direct** connection string (migrations only) |
| `DB_POOL_MAX` | | Max PgBouncer pool size (default `10`) |
| `DB_SYNC` | | `true` enables TypeORM auto-sync in dev only |
| `JWT_PRIVATE_KEY` | ✅ | RS256 private key (PEM) |
| `JWT_PUBLIC_KEY` | ✅ | RS256 public key (PEM) |
| `JWT_ACCESS_TTL` | | Access token TTL in seconds (default `86400` = 1 day) |
| `REVALIDATE_SECRET` | ✅ | Shared secret for Next.js ISR revalidation |
| `NEXT_REVALIDATE_URL` | ✅ | Next.js `/api/revalidate` endpoint |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary API secret |

### `apps/web/.env.local`

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | ✅ | Canonical site URL — used for OG tags and sitemap |
| `NEXT_PUBLIC_API_URL` | ✅ | NestJS API base URL (no trailing slash) |
| `REVALIDATE_SECRET` | ✅ | Must match value in `apps/api/.env` |
| `JWT_PUBLIC_KEY` | ✅ | RS256 public key for verifying access tokens server-side |

> **Neon dual-URL pattern:** `DATABASE_URL` targets the PgBouncer pooler endpoint (`-pooler` suffix) for all runtime queries. `DATABASE_URL_UNPOOLED` targets the direct endpoint and is used **only** by the TypeORM migration CLI — DDL statements are incompatible with PgBouncer transaction mode.

---

## Generating a JWT RS256 key pair

```sh
# Private key
openssl genrsa -out private.pem 2048

# Public key (derived from private)
openssl rsa -in private.pem -pubout -out public.pem
```

Paste the full PEM content (including header/footer lines) into the respective env vars.

---

## API overview

Base path: `/v1`
Interactive docs: `http://localhost:3001/v1/docs` (Swagger / OpenAPI 3.1)

| Endpoint | Method | Description |
|---|---|---|
| `/v1/health` | `GET` | Health check — returns status, version, timestamp |

Additional endpoints will be added in subsequent EPICs (auth, resume, blog, projects, gallery, upload).

---

## Database (local Docker)

`docker-compose.yml` starts a PostgreSQL 16 instance:

```
Host:     localhost
Port:     5432
Database: portfolio_dev
User:     portfolio
Password: dev_password
```

These credentials match the defaults in `apps/api/.env.example`.

---

## CI / CD

| Workflow | Trigger | Jobs |
|---|---|---|
| `.github/workflows/ci.yml` | PR → `main`, push → `main` | Lint (ESLint + TS), unit tests, build checks |
| `.github/workflows/deploy.yml` | Push → `main` | Migrate DB → deploy API (Railway) → deploy Web (Vercel) |

---

## Project structure

```
resume-web/
├── apps/
│   ├── api/                  # NestJS 10 backend
│   │   ├── src/
│   │   │   ├── database/     # TypeORM DataSource (Neon dual-URL)
│   │   │   ├── app.controller.ts
│   │   │   ├── app.service.ts
│   │   │   └── main.ts       # CORS, global prefix (v1), Swagger, ValidationPipe
│   │   └── test/             # e2e tests
│   └── web/                  # Next.js 16 frontend
│       ├── public/           # Icons, manifests, profile photo
│       └── src/app/
│           ├── layout.tsx    # Root layout — fonts, ThemeProvider, SEO metadata
│           ├── page.tsx      # Portfolio landing page
│           ├── globals.css   # Tailwind v4 @theme + design tokens
│           ├── manifest.ts   # Web app manifest (Next.js App Router)
│           └── robots.ts     # robots.txt (Next.js App Router)
├── packages/
│   ├── types/                # Shared TypeScript interfaces
│   ├── eslint-config/        # Shared ESLint configs (base, next, nestjs)
│   └── oat-ui/               # Shared component library (stub)
├── docs/
│   ├── PRD-portfolio-cms-platform.md
│   └── EPICS-AND-STORIES.md
├── docker-compose.yml
├── lerna.json
└── package.json              # Workspace root
```

---

## Roadmap

See [`docs/EPICS-AND-STORIES.md`](docs/EPICS-AND-STORIES.md) for the full implementation plan.

| Epic | Status |
|---|---|
| EPIC 1 — Foundation & Infrastructure | ✅ Complete |
| EPIC 2 — Authentication & Authorization | 🔜 Next |
| EPIC 3 — Admin CMS (AdminJS) | 🔜 Planned |
| EPIC 4 — Dynamic Resume System | 🔜 Planned |
| EPIC 5 — Blog Engine | 🔜 Planned |
| EPIC 6 — Projects Showcase | 🔜 Planned |
| EPIC 7 — Photography Gallery | 🔜 Planned |
| EPIC 8 — Media & Cloudinary Pipeline | 🔜 Planned |
| EPIC 9 — SEO, Performance & Analytics | 🔜 Planned |
| EPIC 10 — Testing & Hardening | 🔜 Planned |
