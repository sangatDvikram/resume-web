# Portfolio CMS — Monorepo

A full-stack Portfolio & CMS platform built as a Yarn Workspaces + Lerna monorepo.

| App / Package | Tech | Dev URL |
|---|---|---|
| `apps/api` | NestJS 10 · TypeORM · Swagger · AdminJS | `http://localhost:3001` |
| `apps/web` | Next.js 16 · React 19 · Tailwind v4 | `http://localhost:3000` |
| `apps/mcp` | MCP server · `@modelcontextprotocol/sdk` | `http://localhost:3002/mcp` |
| `packages/oat-ui` | Shared component library (`OatButton`, `OatCard`, …) | — |
| `packages/utils` | Shared utilities (slugify, date helpers, LaTeX) | — |
| `packages/types` | Shared TypeScript interfaces (generated from OpenAPI) | — |
| `packages/eslint-config` | Shared ESLint configs | — |

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | 22 LTS |
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

# 5. Run database migrations + seed
yarn workspace api migration:run
yarn workspace api seed

# 6a. Run everything in parallel
yarn dev

# 6b. Or run each app individually
yarn web   # Next.js  → http://localhost:3000
yarn api   # NestJS   → http://localhost:3001
yarn mcp   # MCP server → http://localhost:3002/mcp (set PORT=3002 in apps/mcp/.env)
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
| `yarn mcp` | Start only the MCP server (stdio mode unless PORT set) |
| `yarn generate:openapi` | Export OpenAPI spec → `docs/openapi.json` (API must be running) |
| `yarn generate:types` | `generate:openapi` → `openapi-typescript` → build `@portfolio-cms/types` |

### API-specific scripts (`apps/api`)

```sh
yarn workspace api test                    # Unit tests (Jest)
yarn workspace api test:cov                # Coverage report (80% threshold)
yarn workspace api test:e2e                # End-to-end tests
yarn workspace api migration:generate      # Generate new TypeORM migration from entity diff
yarn workspace api migration:run           # Apply pending migrations (use DATABASE_URL_UNPOOLED)
yarn workspace api migration:revert        # Revert last migration
yarn workspace api migration:show          # Show pending migrations
yarn workspace api seed                    # Idempotent seed (safe to run repeatedly)
yarn workspace api create-admin            # Interactive prompt — create first admin user
```

---

## Environment variables

### `apps/api/.env`

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | ✅ | `development` / `production` |
| `PORT` | | API port (default `3001`) |
| `FRONTEND_URL` | ✅ | Next.js origin — added to CORS whitelist |
| `API_EXTERNAL_URL` | | API's own public URL (required in production for AdminJS CORS) |
| `EXTRA_CORS_ORIGINS` | | Comma-separated extra CORS origins |
| `DATABASE_URL` | ✅ | Neon **pooler** connection string (runtime queries) |
| `DATABASE_URL_UNPOOLED` | ✅ | Neon **direct** connection string (migrations only — DDL incompatible with PgBouncer) |
| `DB_POOL_MAX` | | Max PgBouncer pool size (default `10`) |
| `DB_SSL` | | `true` enables SSL; always on in production; unset for local Docker Postgres |
| `DB_SYNC` | | `true` enables TypeORM auto-sync — dev only, never production |
| `DB_LOGGING` | | `true` logs all TypeORM queries — dev only |
| `ADMIN_EMAIL` | ✅ | Seed admin email (used when `admin_users` table is empty on boot) |
| `ADMIN_PASSWORD` | ✅ | Seed admin password |
| `SESSION_SECRET` | ✅ | Long random string for `express-session` (AdminJS) |
| `SESSION_COOKIE_NAME` | | Session cookie name (default `adminjs`) |
| `THROTTLE_TTL` | | Rate-limit window in seconds (default `60`) |
| `THROTTLE_LIMIT` | | Max requests per window (default `20`) |
| `JWT_PRIVATE_KEY` | ✅ | RS256 private key (PEM, newlines as `\n` in single-line env) |
| `JWT_PUBLIC_KEY` | ✅ | RS256 public key (PEM) |
| `JWT_EXPIRES_IN` | | Access token TTL (default `1d`) |
| `REVALIDATE_SECRET` | ✅ | Shared secret for Next.js ISR revalidation |
| `NEXT_REVALIDATE_URL` | ✅ | Next.js `/api/revalidate` endpoint URL |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary API secret |
| `SWAGGER_ENABLED` | | `true` enables Swagger UI at `/v1/docs` (disable in production) |

### `apps/web/.env.local`

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | ✅ | `development` / `production` |
| `NEXT_PUBLIC_API_URL` | ✅ | Public NestJS API base URL (no trailing slash) — exposed to browser |
| `API_INTERNAL_URL` | | Server-side-only API URL (Railway/Docker internal network) |
| `REVALIDATE_SECRET` | ✅ | Must match value in `apps/api/.env` |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Canonical site URL — used for OG tags, sitemap, `metadataBase` |
| `NEXT_PUBLIC_RESUME_SLUG` | | Profile slug to load (default `"default"`) |

### `apps/mcp/.env`

| Variable | Required | Description |
|---|---|---|
| `API_BASE_URL` | | NestJS API base URL (default `http://localhost:3001`) |
| `RESUME_SLUG` | | Profile slug to expose (default `"default"`) |
| `PORT` | | When set: HTTP/StreamableHTTP mode on this port. Unset: stdio mode for Claude Desktop |

> **Neon dual-URL pattern:** `DATABASE_URL` targets the PgBouncer pooler endpoint (`-pooler` suffix) for all runtime queries. `DATABASE_URL_UNPOOLED` targets the direct endpoint and is used **only** by the TypeORM migration CLI — DDL statements are incompatible with PgBouncer transaction mode.

---

## Generating a JWT RS256 key pair

```sh
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
```

Paste the full PEM content (including header/footer lines) into the respective env vars. In single-line env files replace newlines with `\n`.

---

## API overview

Base path: `/v1`
Interactive docs: `http://localhost:3001/v1/docs` (Swagger / OpenAPI 3.1 — enabled via `SWAGGER_ENABLED=true`)
Admin panel: `http://localhost:3001/admin` (AdminJS — requires admin account)
Health check: `http://localhost:3001/health`

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/health` | `GET` | Public | Health check — returns status, version, uptime |
| `/v1/auth/login` | `POST` | Public | Login — returns RS256 JWT access token + sets refresh cookie |
| `/v1/auth/refresh` | `POST` | Cookie | Refresh access token using HTTP-only refresh cookie |
| `/v1/auth/logout` | `POST` | Cookie | Clear refresh cookie |
| `/v1/auth/me` | `GET` | 🔒 JWT | Returns the authenticated admin user |
| `/v1/resume/:slug` | `GET` | Public | Full resume for named profile (slug default: `"default"`) |
| `/v1/resume/profile` | `PATCH` | 🔒 JWT | Update profile fields |
| `/v1/blog` | `GET` | Public | Paginated published blog posts |
| `/v1/blog/:slug` | `GET` | Public | Single blog post with rendered HTML |
| `/v1/blog` | `POST` | 🔒 JWT | Create blog post (slug + HTML auto-generated) |
| `/v1/blog/:id` | `PATCH` | 🔒 JWT | Update blog post (re-renders Markdown) |
| `/v1/blog/:id` | `DELETE` | 🔒 JWT | Delete blog post |
| `/v1/blog/tags` | `GET` | Public | All tags sorted alphabetically |
| `/v1/projects` | `GET` | Public | Paginated published projects |
| `/v1/projects/:slug` | `GET` | Public | Single project with media and videos |
| `/v1/gallery/albums` | `GET` | Public | All published albums |
| `/v1/gallery/albums/:slug` | `GET` | Public | Album detail with photos |
| `/v1/gallery/photos` | `GET` | Public | Cursor-paginated photos |
| `/v1/upload` | `POST` | 🔒 JWT/Session | Upload file → Cloudinary; returns `{ url, publicId, lqipUrl, width, height }` |

### Database entities

| Entity | Table | Notes |
|---|---|---|
| `AdminUser` | `admin_users` | bcrypt password; session auth for AdminJS |
| `ResumeProfile` | `resume_profile` | `slug` (unique, default `"default"`); name, position, description, contact, dates |
| `Skill` | `skills` | `SkillCategory` enum: language/framework/database/tool; global (not profile-scoped) |
| `ExperienceEntry` | `experience_entries` | FK → `profile_id`; bullets as `text[]`; M2M `Skill` |
| `EducationEntry` | `education_entries` | FK → `profile_id`; degree, university, duration string |
| `Patent` | `patents` | FK → `profile_id`; title, number (e.g. GB2572361A), URL |
| `Certification` | `certifications` | FK → `profile_id`; title, issuer |
| `Award` | `awards` | FK → `profile_id`; title, issuer |
| `Tag` | `tags` | M2M `BlogPost` |
| `BlogPost` | `blog_posts` | `rawMarkdown` + `htmlContent`; `published` flag |
| `Project` | `projects` | `rawMarkdown` + `htmlContent`; `featured` flag; M2M `Skill` |
| `ProjectMedia` | `project_media` | ordered carousel images; CASCADE on project delete |
| `ProjectVideo` | `project_videos` | `VideoSource` enum: youtube/vimeo/self_hosted |
| `Album` | `albums` | soft `coverId` FK to photos |
| `Photo` | `photos` | `originalUrl`, `thumbUrl`, `lqipUrl`, `exif` jsonb |

---

## Blog Engine

Blog posts are written in Markdown and stored in the database. On every create/update the API renders Markdown to sanitised HTML and caches the result in `htmlContent` — the frontend renders it directly without client-side processing.

### Markdown pipeline (`apps/api/src/common/markdown.util.ts`)

NestJS compiles as **CommonJS** but the Markdown ecosystem (`unified`, `remark-*`, `rehype-*`) is **ESM-only**. The pipeline bridges this with a dynamic import shim:

```ts
const esmImport = new Function('m', 'return import(m)') as (m: string) => Promise<any>;
```

Pipeline: `unified` → `remark-gfm` → `rehype-pretty-code` (Shiki syntax highlighting) → `rehype-sanitize` (strict allowlist — no `<script>`, `<style>`, `<iframe>`).

### ISR revalidation

Every mutation (API or AdminJS) fires `POST /api/revalidate` to Next.js, purging the relevant cache tag. Changes go live within 60 seconds — no redeployment required.

---

## Slug & Public ID generation

### Slugs — `nanoid` + `slugify`

```ts
import { generateSlug, slugify } from 'src/common/slug.util';

const slug = generateSlug('My First Blog Post');
// → 'my-first-blog-post-V1StGXR8'  (collision-resistant, never mutated after creation)

const plain = slugify('Ångström Units');
// → 'angstrom-units'
```

### Public IDs — `sqids`

Internal UUIDs stay as primary keys. `SqidsService` encodes them to short opaque strings for public URLs:

```ts
const publicId = this.sqids.encode('550e8400-e29b-41d4-a716-446655440000');
// → 'kHfge3'

const uuid = this.sqids.decode('kHfge3');
// → '550e8400-e29b-41d4-a716-446655440000'
```

`SqidsModule` is `@Global()` — inject `SqidsService` anywhere without additional imports.

---

## MCP Server (`apps/mcp`)

An [MCP](https://modelcontextprotocol.io) server that exposes portfolio resume data to AI agents (Claude, etc.).

**Production URL:** `https://resume-web-mcp-production.up.railway.app/mcp`
**Config:** `.mcp.json` at repo root wires both remote and local endpoints for Claude Code.

### Tools

| Tool | Description |
|---|---|
| `get_resume` | Full resume snapshot (all sections) |
| `get_profile` | Name, position, contact, career start, years of experience |
| `get_skills` | Skills grouped by category |
| `get_experience` | Work experience with bullets and tech stack |
| `get_education` | Education entries |
| `get_patents` | Patents |
| `get_certifications` | Certifications |
| `get_awards` | Awards |

### Transport modes

- **HTTP mode** (Railway / remote): set `PORT` env var → `StreamableHTTPServerTransport` in stateless mode (new transport per request). Endpoints: `/mcp`, `/health`.
- **Stdio mode** (Claude Desktop / local without PORT): `StdioServerTransport`.

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
│   ├── api/                        # NestJS 10 backend
│   │   ├── scripts/
│   │   │   ├── create-admin.ts     # Interactive admin user creation
│   │   │   └── export-openapi.ts   # Exports live OpenAPI spec → docs/openapi.json
│   │   └── src/
│   │       ├── admin/              # AdminJS panel (admin.module.ts + custom components)
│   │       │   └── components/     # markdown-editor, media-uploader, photo-uploader,
│   │       │                       # skill-picker, tag-picker, video-manager, dashboard
│   │       ├── admin-user/         # AdminUser entity, service, module
│   │       ├── auth/               # JWT RS256 auth (login, guards, strategies)
│   │       ├── blog/               # Blog CRUD, slug gen, tag upsert, ISR trigger
│   │       ├── common/
│   │       │   ├── markdown.util.ts    # Markdown→HTML (ESM dynamic import shim)
│   │       │   ├── slug.util.ts        # slugify() + generateSlug() (nanoid suffix)
│   │       │   ├── sqids.service.ts    # UUID ↔ short public ID
│   │       │   └── sqids.module.ts     # @Global() NestJS module
│   │       ├── database/               # TypeORM DataSource (Neon dual-URL)
│   │       ├── entities/               # All TypeORM entities + barrel index.ts
│   │       ├── gallery/                # Albums + photos CRUD, Cloudinary upload
│   │       ├── migrations/             # TypeORM migration files
│   │       ├── projects/               # Projects CRUD, media, videos
│   │       ├── resume/                 # Resume CRUD (profile-scoped sub-entities)
│   │       ├── seeds/                  # Idempotent seed script + seed data
│   │       ├── upload/                 # Magic-byte validation + Cloudinary upload
│   │       ├── app.module.ts
│   │       └── main.ts                 # Early healthcheck server + NestJS bootstrap
│   ├── mcp/                        # MCP server — exposes resume to AI agents
│   │   └── src/
│   │       └── index.ts            # Dual-mode: HTTP (Railway) or stdio (Claude Desktop)
│   └── web/                        # Next.js 16 frontend
│       └── src/app/
│           ├── api/revalidate/     # POST /api/revalidate — on-demand ISR
│           ├── blog/               # /blog index (ISR) + /blog/[slug] (SSG)
│           ├── gallery/            # /gallery index (SSR) + /gallery/[slug]
│           ├── projects/           # /projects index (ISR) + /projects/[slug] (SSG)
│           ├── resume/             # /resume (static + on-demand revalidate)
│           ├── components/         # Shared Next.js components
│           ├── lib/                # api.ts (fetch wrapper with cache tags)
│           ├── layout.tsx          # Root layout — fonts, ThemeProvider, SEO
│           ├── page.tsx            # Portfolio landing page (ISR 60s)
│           ├── globals.css         # Tailwind v4 @theme + design tokens
│           └── robots.ts           # robots.txt (Disallow: /admin)
├── packages/
│   ├── oat-ui/                     # Shared component library
│   │   └── src/                    # OatButton, OatCard, OatBadge, OatInput,
│   │                               # OatSelect, OatTextarea, OatSpinner,
│   │                               # OatTabs, OatModal, OatTable
│   ├── utils/                      # Shared utilities
│   │   └── src/
│   │       ├── date.ts             # calculateDuration, yearsOfExperience, formatNumberSuffix
│   │       ├── slug.ts             # slugify()
│   │       ├── latex.ts            # LaTeX resume generator
│   │       └── index.ts
│   ├── types/                      # Generated from OpenAPI spec (never edit manually)
│   └── eslint-config/              # Shared ESLint configs (base, next, nestjs)
├── docs/
│   ├── PRD-portfolio-cms-platform.md   # Product requirements (v1.1.0)
│   ├── EPICS-AND-STORIES.md            # All 11 EPICs + stories (all complete)
│   └── openapi.json                    # Exported OpenAPI spec (generated)
├── .mcp.json                       # MCP client config for Claude Code
├── docker-compose.yml
├── lerna.json
└── package.json                    # Workspace root
```

---

## Roadmap

All 11 EPICs complete. See [`docs/EPICS-AND-STORIES.md`](docs/EPICS-AND-STORIES.md) for full story breakdown.

| Epic | Status |
|---|---|
| EPIC 1 — Foundation & Infrastructure | ✅ Complete |
| EPIC 2 — Authentication & Authorization | ✅ Complete |
| EPIC 3 — Data Migration (`constants` → PostgreSQL) | ✅ Complete |
| EPIC 4 — Dynamic Resume System | ✅ Complete |
| EPIC 5 — Blog Engine | ✅ Complete |
| EPIC 6 — Multimedia Project Showcase | ✅ Complete |
| EPIC 7 — Photography Gallery | ✅ Complete |
| EPIC 8 — AdminJS Panel & Custom Components | ✅ Complete |
| EPIC 9 — OAT UI Component Library | ✅ Complete |
| EPIC 10 — Non-Functional Requirements & Quality | ✅ Complete |
| EPIC 11 — MCP Server (Model Context Protocol) | ✅ Complete |
