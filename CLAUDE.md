# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Portfolio CMS** — Vikram Sangat's personal portfolio platform. Single-owner, no multi-tenancy. Yarn Workspaces + Lerna monorepo:
- `apps/api` — NestJS 10 REST API (PostgreSQL via TypeORM, AdminJS CMS)
- `apps/web` — Next.js 16 frontend (App Router, React 19, Tailwind CSS v4)
- `packages/oat-ui` — Shared React component library (`@portfolio-cms/oat-ui`)
- `packages/utils` — Shared utilities: date helpers, slug, LaTeX resume generator (`@portfolio-cms/utils`)
- `packages/types` — Shared TypeScript types generated from OpenAPI spec
- `packages/eslint-config` — Shared ESLint configuration

## Commands

### Root (all workspaces)
```bash
yarn dev              # Run all apps in parallel (lerna)
yarn build            # Build all packages and apps
yarn lint             # Lint all workspaces
yarn test             # Run all tests
```

### Individual apps
```bash
yarn web              # Next.js dev server (localhost:3000, Turbopack)
yarn api              # NestJS dev server with watch (localhost:3001)
```

### API-specific
```bash
yarn workspace api test                    # Run all Jest unit tests
yarn workspace api test --testPathPattern=blog  # Run a single test file
yarn workspace api test:cov               # Coverage report (80% threshold)
yarn workspace api test:e2e               # E2E tests

yarn workspace api migration:generate     # Generate new TypeORM migration
yarn workspace api migration:run          # Apply pending migrations
yarn workspace api migration:revert       # Revert last migration
yarn workspace api seed                   # Seed the database (idempotent)
yarn workspace api create-admin           # Create an admin user interactively
```

### Type generation (API → Frontend types)
```bash
yarn generate:types   # export-openapi → openapi-typescript → build @portfolio-cms/types
```

API must be running before `generate:types` — the export script fetches the live OpenAPI spec.

---

## Architecture

### API (NestJS)

**Entry point:** `apps/api/src/main.ts` — bootstraps with AdminJS (async ESM import workaround), CORS, global `ValidationPipe`, Swagger at `/v1/docs`, and `express-session` middleware.

**Module structure:**

```
apps/api/src/
├── main.ts
├── app.module.ts              ← AppModule.withAdmin(adminModule) pattern
├── admin/
│   ├── admin.module.ts        ← AdminJS v7 config; ESM-only import workaround; ISR after-hooks
│   └── components/            ← Custom AdminJS React components (registered via ComponentLoader)
│       ├── markdown-editor.tsx   ← CodeMirror 6 + Rehype split-pane preview (debounced 300ms)
│       ├── media-uploader.tsx    ← Cloudinary multi-file upload + sortable drag-and-drop
│       ├── photo-uploader.tsx    ← Gallery photo bulk upload (drag-and-drop, preview)
│       ├── skill-picker.tsx      ← Multi-select skill M2M picker for projects/experience
│       ├── tag-picker.tsx        ← Multi-select tag M2M picker for blog posts
│       ├── video-manager.tsx     ← Project video URL manager (YouTube/Vimeo/self-hosted)
│       └── dashboard.tsx         ← Custom stats dashboard (posts/projects/photos/albums counts)
├── auth/                      ← LocalStrategy, JwtStrategy, JwtRefreshStrategy
├── resume/                    ← ResumeModule: profile, skills, experience, education, patents, etc.
├── blog/                      ← BlogModule: posts + tags
├── projects/                  ← ProjectsModule: projects + media + videos
├── gallery/                   ← GalleryModule: albums + photos
├── upload/                    ← UploadModule: Cloudinary, magic-byte validation
├── entities/
│   └── index.ts               ← Barrel — always import entities from here
├── common/
│   ├── sqids.service.ts       ← UUID → short URL-safe ID
│   ├── slug.util.ts           ← Auto-generated from title on create; never updated on edit
│   └── markdown.util.ts       ← renderMarkdown(): unified/remark/rehype, strict sanitize schema
├── migrations/
└── seeds/
    ├── seed.ts                ← Idempotent runner (find → skip or create)
    └── seed-data.ts           ← Canonical content sourced from resume/resume.tex
```

**Database:** PostgreSQL via TypeORM 0.3 (Data Mapper — `@InjectRepository`, never ActiveRecord). All entities extend `BaseEntity` but repositories are always injected. Import entities from `src/entities/index.ts` barrel. Migrations in `src/migrations/`. `DB_SYNC=true` enables `synchronize` in development only — never in production.

**Neon dual-URL:**
- `DATABASE_URL` — pooler (PgBouncer, transaction mode). Used at runtime. Disable named/prepared statements (`extra: { max: 10, ssl: { rejectUnauthorized: false } }`).
- `DATABASE_URL_UNPOOLED` — direct connection. Required for `migration:run` / `migration:generate` / `migration:revert` because PgBouncer transaction mode is incompatible with DDL.

**Auth:** RS256 JWT — access token 1d (Bearer header), refresh token 30d (HTTP-only cookie). Three Passport strategies: `LocalStrategy` (login), `JwtStrategy` (API access), `JwtRefreshStrategy` (refresh). Rate limit `/v1/auth/login` to 10 requests / IP / 15 min via `@nestjs/throttler`.

**AdminJS (CMS):** Mounted at `/admin`. AdminJS v7 is ESM-only in a CJS NestJS app — use `new Function('m', 'return import(m)')` for all AdminJS/remark/rehype imports. Session auth backed by `express-session` + `connect-pg-simple` (PostgreSQL session store — survives restarts). `/admin/**` must serve `X-Robots-Tag: noindex` and be excluded from `robots.txt`.

**ESM-only packages:** `adminjs`, `@adminjs/*`, `unified`, `remark-*`, `rehype-*`. Always `new Function('m', 'return import(m)')` — never a bare `import`.

**Upload:** Cloudinary via `UploadService`. Validate file type by magic bytes (not Content-Type). Blog images → `portfolio/blog`; gallery photos → `portfolio/gallery`. LQIP (`e_blur:2000,q_1,f_auto`) and thumbnail URLs are Cloudinary transformation parameters built at upload time, stored as `lqipUrl` and `thumbUrl`.

**IDs:** UUIDs internally. `SqidsService` (`src/common/sqids.service.ts`) encodes UUIDs into short URL-safe IDs — expose Sqids in URL-facing responses, never raw UUIDs.

**Slug generation:** Auto-generated from title on create (`src/common/slug.util.ts`). Never updated on edit — mutating a slug breaks existing URLs and cache tags.

**Markdown:** `renderMarkdown()` in `src/common/markdown.util.ts` — unified → remark-gfm → rehype-pretty-code (Shiki) → rehype-sanitize (strict schema: no `<script>`, `<style>`, `<iframe>`). Blog posts and project descriptions store both `rawMarkdown` and `htmlContent` in the DB.

**Standard response envelope** (all list endpoints):
```json
{ "data": [...], "meta": { "total": 42, "page": 1, "perPage": 20, "totalPages": 3, "nextCursor": "uuid-or-null" } }
```

**Error format** (RFC 7807):
```json
{ "type": "https://...", "title": "Validation Failed", "status": 422, "detail": "...", "instance": "/v1/blog" }
```

---

### Web (Next.js)

**Routing:** App Router only. All pages are Server Components by default; client-only code is isolated in `*Client.tsx` files (e.g. `GalleryClient.tsx`, `AlbumClient.tsx`, `ProjectsClient.tsx`). Keep client boundaries as deep in the tree as possible.

**Rendering strategy by route:**

| Route | Strategy | Notes |
|---|---|---|
| `/` | ISR (revalidate: 60s) | Resume data; cached shell |
| `/blog` | ISR (revalidate: 60s) | Invalidated via on-demand revalidation on publish |
| `/blog/[slug]` | SSG + on-demand revalidate | Pre-generated; re-generated on CMS save |
| `/projects` | ISR (revalidate: 60s) | Same as blog index |
| `/projects/[slug]` | SSG + on-demand revalidate | Same as blog posts |
| `/gallery` | SSR | Dynamic; no stale serving |
| `/resume` | Static (build-time) | On-demand revalidation from AdminJS after-hook |
| `/admin/**` | NestJS (AdminJS) | Session-authenticated; not part of Next.js |
| `/v1/docs` | NestJS (Swagger) | Development/staging only |

**Data fetching:** All API calls go through `apps/web/src/lib/api.ts` using `fetch` with `next: { tags, revalidate }`.

**Cache tags:** `resume`, `blog`, `blog-<slug>`, `projects`, `project-<slug>`, `gallery`, `album-<slug>`.

**On-demand ISR revalidation:** `apps/web/src/app/api/revalidate/route.ts` — `POST /api/revalidate` with `{ tags, secret }`. Called by NestJS after every content mutation. Uses `revalidateTag(tag, { expire: 0 })` for immediate expiration.

**Revalidation triggers:**

| Admin action | Tags invalidated |
|---|---|
| Publish/unpublish/save blog post | `blog`, `blog-<slug>` |
| Publish/unpublish/save project | `projects`, `project-<slug>` |
| Update resume entry | `resume` |
| Publish/unpublish album | `gallery`, `album-<slug>` |

**API URL resolution:** `getApiBase()` in `api.ts` — `API_INTERNAL_URL` (Railway/Docker server-side only) → `NEXT_PUBLIC_API_URL` → `localhost:3001`. Never expose `API_INTERNAL_URL` to browser bundles.

**Styling:** Tailwind CSS v4 with `@tailwindcss/postcss`. Config lives in CSS, not `tailwind.config.js`. `@tailwindcss/typography` provides `prose` classes for Markdown content.

**Security headers:** CSP, HSTS, X-Frame-Options configured in `next.config.ts` for all routes. `robots.txt` must include `Disallow: /admin`.

---

### Shared Packages

**`@portfolio-cms/oat-ui`:** Pure React component library, no runtime dependencies (peer deps only: React 18/19). Components prefixed `Oat*` (`OatButton`, `OatCard`, `OatBadge`, `OatInput`, `OatSelect`, `OatTextarea`, `OatSpinner`, `OatTabs/OatTabList/OatTab/OatTabPanel`, `OatModal`, `OatTable`). Built with `tsc`; Next.js transpiles the source directly via `transpilePackages`.

**`@portfolio-cms/utils`:** Pure TypeScript utilities with no framework dependencies. Exports date helpers (`calculateDuration`, `yearsOfExperience`, `yearsOfExperienceString`, `formatNumberSuffix`), `slugify`, and `generateLatexResume`. Built with `tsc`; consumed by both `apps/web` and `apps/api`.

**`@portfolio-cms/types`:** Generated from the API's OpenAPI spec — never edit manually. Regenerate with `yarn generate:types` (API must be running).

---

## API Contract (condensed)

All endpoints are prefixed `/v1/`. Protected endpoints require `Authorization: Bearer <token>`.

```
# Auth
POST  /v1/auth/login            { email, password } → { accessToken, expiresIn }
POST  /v1/auth/refresh          Cookie: refreshToken → { accessToken, expiresIn }
POST  /v1/auth/logout           → 204
GET   /v1/auth/me               Auth → AdminUser

# Resume (public read, auth write)
GET   /v1/resume                → Full ResumeDTO
PATCH /v1/resume/profile        Auth
POST  /v1/resume/experience     Auth
PATCH /v1/resume/experience/:id Auth
DELETE /v1/resume/experience/:id Auth
GET   /v1/resume/skills         → Skill[] grouped by category
POST  /v1/resume/skills         Auth
PATCH /v1/resume/skills/:id     Auth
DELETE /v1/resume/skills/:id    Auth
# (education, patents, certifications, awards follow same pattern)

# Blog
GET   /v1/blog                  → Paginated published posts
GET   /v1/blog/admin            Auth → All posts incl. drafts
GET   /v1/blog/:slug            → BlogPostDTO (published only)
POST  /v1/blog                  Auth
PATCH /v1/blog/:id              Auth
DELETE /v1/blog/:id             Auth
GET   /v1/blog/tags             → Tag[]
POST  /v1/blog/tags             Auth

# Projects
GET   /v1/projects              → Paginated published projects
GET   /v1/projects/admin        Auth → All
GET   /v1/projects/:slug        → ProjectDetailDTO
POST  /v1/projects              Auth
PATCH /v1/projects/:id          Auth
DELETE /v1/projects/:id         Auth
POST  /v1/projects/:id/media    Auth → Multipart upload
DELETE /v1/projects/:id/media/:mediaId Auth
PATCH /v1/projects/:id/media/reorder   Auth  { orderedIds: string[] }

# Gallery
GET   /v1/gallery/albums        → AlbumSummaryDTO[]
GET   /v1/gallery/albums/:slug  → AlbumDetailDTO with Photo[]
POST  /v1/gallery/albums        Auth
PATCH /v1/gallery/albums/:id    Auth
DELETE /v1/gallery/albums/:id   Auth
GET   /v1/gallery/photos        → Paginated PhotoDTO[] (cursor-based)
POST  /v1/gallery/photos        Auth → Bulk multipart upload
PATCH /v1/gallery/photos/:id    Auth
DELETE /v1/gallery/photos/:id   Auth
PATCH /v1/gallery/albums/:id/photos/reorder Auth  { orderedIds: string[] }

# Upload
POST  /v1/upload                Auth → Multipart → { url, publicId, lqipUrl, width, height, exif? }
```

Swagger UI: `/v1/docs` (development/staging only; disabled in production via `SWAGGER_ENABLED=false`).

---

## Entity Reference

Entities live in `apps/api/src/entities/` — always import from the barrel `index.ts`.

| Entity | Table | Notes |
|---|---|---|
| `AdminUser` | `admin_users` | bcrypt password; session auth for AdminJS |
| `Profile` | `resume_profile` | name, position, description, contact, dates |
| `Skill` | `skills` | `SkillCategory` enum: language/framework/database/tool |
| `Experience` | `experience_entries` | bullets as `jsonb`; many-to-many `Skill` |
| `Education` | `education_entries` | degree, university, duration string |
| `Patent` | `patents` | title, number (e.g. GB2572361A), url |
| `Certification` | `certifications` | title, issuer |
| `Award` | `awards` | title, issuer |
| `Tag` | `tags` | many-to-many `BlogPost` |
| `BlogPost` | `blog_posts` | rawMarkdown + htmlContent; `published` flag |
| `Project` | `projects` | rawMarkdown + htmlContent; `featured` flag |
| `ProjectMedia` | `project_media` | ordered carousel images; CASCADE on project delete |
| `ProjectVideo` | `project_videos` | `VideoSource` enum: youtube/vimeo/self_hosted |
| `Album` | `albums` | soft `coverId` FK to photos |
| `Photo` | `photos` | originalUrl, thumbUrl, lqipUrl, exif jsonb |

Key indexes: `BlogPost(published, publishedAt DESC)`, `Project(published, sortOrder)`, `Photo(album_id, sortOrder)`, `Skill(name, category)`.

---

## Environment Variables

**API (`apps/api/.env`):**
- `DATABASE_URL` — Postgres pooler URL (runtime)
- `DATABASE_URL_UNPOOLED` — Postgres direct URL (migrations only)
- `JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY` — RSA-2048 key pair (newlines as `\n`)
- `SESSION_SECRET` / `SESSION_COOKIE_NAME` — AdminJS session
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`
- `NEXT_REVALIDATE_URL` — Full URL to `POST /api/revalidate` on the web app
- `REVALIDATE_SECRET` — Shared secret for ISR revalidation
- `FRONTEND_URL` — Allowed CORS origin (defaults to `http://localhost:3000`)
- `DB_SYNC=true` — Enables `synchronize` in development (never in production)
- `SWAGGER_ENABLED=false` — Disables Swagger UI in production

**Web (`apps/web/.env`):**
- `NEXT_PUBLIC_API_URL` — Public API base URL (exposed to browser)
- `API_INTERNAL_URL` — Internal API URL (server-side only, Railway/Docker)
- `REVALIDATE_SECRET` — Must match the API's value
- `NEXT_PUBLIC_SITE_URL` — Used for `metadataBase`

---

## Non-Functional Requirements

- **Performance:** Lighthouse ≥ 90 on Performance, Accessibility, Best Practices, SEO (desktop + simulated 4G). API p95 ≤ 200ms for public GET endpoints under 100 concurrent users. Gallery FCP ≤ 1.5s, LCP ≤ 2.5s.
- **Testing:** All NestJS service methods must have Jest unit tests with ≥ 80% branch coverage.
- **TypeScript:** Strict mode across all apps and packages. No `any` without an ESLint disable comment.
- **Security:** HTTPS only. Magic-byte file validation (not Content-Type). `rehype-sanitize` on all user-supplied Markdown. `/admin/**` must set `X-Robots-Tag: noindex`. Accepted upload types: `.jpg .jpeg .png .webp .gif .mp4 .mov`.
- **SEO:** All public pages must include canonical URL, OG tags, Twitter Card tags, JSON-LD structured data.
- **Accessibility:** WCAG 2.1 AA — keyboard operable, ARIA-labelled, colour contrast 4.5:1 normal / 3:1 large text.
- **Zero-redeploy:** Content changes in AdminJS must appear on the live site within 60 seconds via ISR on-demand revalidation, with no CI/CD triggered.

---

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`): lint + TypeScript check → API unit tests → Next.js build check → NestJS build check. All jobs build shared packages first (`types`, `oat-ui`).

Deploy (`.github/workflows/deploy.yml`): `migration:run` (unpooled URL) → Railway API deploy → Vercel web deploy on merge to `main`. Migrations run before deploy — never skip.

---

## Project Skills

Invoke these with the Skill tool when the user types the slash command. All four are grounded in Vikram's resume and this codebase.

- **react-developer** (`.claude/skills/react-developer/SKILL.md`) — Senior React lens for `apps/web` and `packages/oat-ui`: Next.js 16 App Router, React 19 Server/Client Components, Tailwind CSS v4, ISR revalidation, OatUI. Trigger: `/react-developer`
- **web-ui-architect** (`.claude/skills/web-ui-architect/SKILL.md`) — Principal UI architect lens: monorepo governance, OatUI design system, ISR cache topology, CI/CD build order, dependency decisions. Trigger: `/web-ui-architect`
- **nestjs-api-developer** (`.claude/skills/nestjs-api-developer/SKILL.md`) — Senior NestJS lens for `apps/api`: TypeORM Data Mapper, RS256 JWT auth, AdminJS ESM workaround, ISR after-hooks, Cloudinary uploads, SqidsService. Trigger: `/nestjs-api-developer`
- **database-engineer** (`.claude/skills/database-engineer/SKILL.md`) — Database lens: TypeORM 0.3 entity design, Neon dual-URL pattern, migration workflow, idempotent seeding, query optimisation, N+1 detection. Trigger: `/database-engineer`

When the user types any of these slash commands, invoke the Skill tool with the matching skill name before doing anything else.
