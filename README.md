# Portfolio CMS — Monorepo

A full-stack Portfolio & CMS platform built as a Yarn Workspaces + Lerna monorepo.

| App / Package | Tech | Dev URL |
|---|---|---|
| `apps/web` | Next.js 16 · React 19 · Tailwind v4 | `http://localhost:3000` |
| `apps/api` | NestJS 10 · TypeORM · Swagger · AdminJS | `http://localhost:3001/v1` |
| `packages/utils` | Shared utilities (slugify, date helpers, LaTeX) | — |
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
yarn workspace api create-admin    # interactive prompt — creates the first admin user
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
| `DB_SSL` | | `true` enables SSL for the DB connection. Always on in production; set to `true` locally only when using a cloud DB (e.g. Neon). Leave unset for local Docker Postgres. |
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
Admin panel: `http://localhost:3001/admin` (AdminJS — requires admin account)

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/v1/health` | `GET` | Public | Health check — returns status, version, timestamp |
| `/v1/auth/login` | `POST` | Public | Login — returns RS256 JWT access token |
| `/v1/auth/me` | `GET` | 🔒 JWT | Returns the authenticated admin user |
| `/v1/resume` | `GET` | Public | Full resume payload (profile, skills, experience, etc.) |

### Database entities

All entities use `uuid` primary keys and extend TypeORM's `BaseEntity` (Active Record pattern).

| Entity | Table | Notable fields |
|---|---|---|
| `ResumeProfile` | `resume_profile` | headline, summary, contact info |
| `Skill` | `skill` | name, category, proficiency level |
| `ExperienceEntry` | `experience_entry` | company, role, start/end date, highlights |
| `EducationEntry` | `education_entry` | institution, degree, field, dates |
| `Patent` | `patent` | title, patent number, status |
| `Certification` | `certification` | name, issuer, issue/expiry dates |
| `Award` | `award` | title, issuer, year |
| `BlogPost` | `blog_post` | title, slug, content, tags (M2M) |
| `Tag` | `tag` | name (shared across blog posts) |
| `Project` | `project` | title, slug, description, tags, media, videos |
| `ProjectMedia` | `project_media` | image URL, alt, sort order |
| `ProjectVideo` | `project_video` | video URL, provider, sort order |
| `Album` | `album` | title, slug, description, cover photo |
| `Photo` | `photo` | title, slug, image URL, album (M2O) |

---

## Slug & Public ID generation

### Slugs — `nanoid` + `slugify`

Every content entity that needs a URL-friendly identifier (blog posts, projects, albums, photos) uses the `generateSlug` helper.

```ts
import { generateSlug, slugify } from 'src/common/slug.util';

// Derive a collision-resistant slug from a title
const slug = generateSlug('My First Blog Post');
// → 'my-first-blog-post-V1StGXR8'

// Or just normalise text (no random suffix)
const plain = slugify('Ångström Units');
// → 'angstrom-units'
```

`slugify` is also exported from `@portfolio-cms/utils` for use on the Next.js frontend.

### Public IDs — `sqids`

Internal UUIDs are kept as primary keys in the database. For public-facing URLs the `SqidsService` encodes a UUID into a short, opaque string and decodes it back, so internal database IDs are never exposed.

```ts
// Injected by NestJS DI (SqidsModule is global)
constructor(private readonly sqids: SqidsService) {}

const publicId = this.sqids.encode('550e8400-e29b-41d4-a716-446655440000');
// → 'kHfge3' (example — 6 chars minimum)

const uuid = this.sqids.decode('kHfge3');
// → '550e8400-e29b-41d4-a716-446655440000'
```

`SqidsModule` is registered as `@Global()` in `AppModule`, so `SqidsService` can be constructor-injected into any feature module without additional imports.

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
│   │   └── src/
│   │       ├── admin/              # AdminJS panel (admin.module.ts)
│   │       ├── admin-user/         # AdminUser entity, service, module
│   │       ├── auth/               # JWT RS256 auth (login, guards, strategies)
│   │       ├── common/
│   │       │   ├── middleware/     # no-index.middleware.ts
│   │       │   ├── slug.util.ts    # slugify() + generateSlug() — uses nanoid
│   │       │   ├── sqids.service.ts# encode/decode UUIDs ↔ short public IDs
│   │       │   └── sqids.module.ts # @Global() NestJS module
│   │       ├── database/           # TypeORM DataSource (Neon dual-URL)
│   │       ├── entities/           # All TypeORM entities (extend BaseEntity)
│   │       │   ├── resume-profile.entity.ts
│   │       │   ├── skill.entity.ts
│   │       │   ├── experience-entry.entity.ts
│   │       │   ├── education-entry.entity.ts
│   │       │   ├── patent.entity.ts
│   │       │   ├── certification.entity.ts
│   │       │   ├── award.entity.ts
│   │       │   ├── blog-post.entity.ts
│   │       │   ├── tag.entity.ts
│   │       │   ├── project.entity.ts
│   │       │   ├── project-media.entity.ts
│   │       │   ├── project-video.entity.ts
│   │       │   ├── album.entity.ts
│   │       │   ├── photo.entity.ts
│   │       │   └── index.ts
│   │       ├── migrations/         # TypeORM migration files
│   │       ├── resume/             # Resume feature module (controller, service, DTOs)
│   │       ├── seeds/              # Idempotent seed script + seed data
│   │       ├── app.module.ts       # Root module (registers SqidsModule globally)
│   │       └── main.ts             # CORS, global prefix (v1), Swagger, ValidationPipe
│   └── web/                        # Next.js 16 frontend
│       ├── public/                 # Icons, manifests, profile photo
│       └── src/app/
│           ├── layout.tsx          # Root layout — fonts, ThemeProvider, SEO metadata
│           ├── page.tsx            # Portfolio landing page
│           ├── globals.css         # Tailwind v4 @theme + design tokens
│           ├── manifest.ts         # Web app manifest (Next.js App Router)
│           └── robots.ts           # robots.txt (Next.js App Router)
├── packages/
│   ├── utils/                      # Shared utilities
│   │   └── src/
│   │       ├── slug.ts             # slugify() — dep-free, used by web & api
│   │       ├── date.ts             # calculateDuration, yearsOfExperience, etc.
│   │       ├── latex.ts            # LaTeX resume generator
│   │       └── index.ts            # Barrel export
│   ├── types/                      # Shared TypeScript interfaces
│   ├── eslint-config/              # Shared ESLint configs (base, next, nestjs)
│   └── oat-ui/                     # Shared component library (stub)
├── docs/
│   ├── PRD-portfolio-cms-platform.md
│   └── EPICS-AND-STORIES.md
├── docker-compose.yml
├── lerna.json
└── package.json                    # Workspace root
```

---

## Roadmap

See [`docs/EPICS-AND-STORIES.md`](docs/EPICS-AND-STORIES.md) for the full implementation plan.

| Epic | Status |
|---|---|
| EPIC 1 — Foundation & Infrastructure | ✅ Complete |
| EPIC 2 — Authentication & Authorization | ✅ Complete (JWT RS256, guards, AdminJS) |
| EPIC 3 — Admin CMS (AdminJS) | ✅ Complete (all entities registered, BaseEntity pattern) |
| EPIC 4 — Dynamic Resume System | 🔄 In progress |
| EPIC 5 — Blog Engine | 🔜 Planned |
| EPIC 6 — Projects Showcase | 🔜 Planned |
| EPIC 7 — Photography Gallery | 🔜 Planned |
| EPIC 8 — Media & Cloudinary Pipeline | 🔜 Planned |
| EPIC 9 — SEO, Performance & Analytics | 🔜 Planned |
| EPIC 10 — Testing & Hardening | 🔜 Planned |
