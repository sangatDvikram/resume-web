# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Portfolio CMS** — a personal portfolio platform for Vikram Sangat. Yarn Workspaces + Lerna monorepo with:
- `apps/api` — NestJS 10 REST API (PostgreSQL via TypeORM, AdminJS CMS)
- `apps/web` — Next.js 16 frontend (App Router, React 19, Tailwind CSS v4)
- `packages/oat-ui` — Shared React component library (`@portfolio-cms/oat-ui`)
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
# From apps/api or via yarn workspace api <script>
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

Before running `generate:types`, the API must be running locally so the OpenAPI export script can reach it.

## Architecture

### API (NestJS)

**Entry point:** `apps/api/src/main.ts` — bootstraps the app with AdminJS (async ESM import workaround), CORS, global `ValidationPipe`, and Swagger at `/v1/docs`.

**Module structure:** Standard NestJS feature modules — `AuthModule`, `ResumeModule`, `BlogModule`, `ProjectsModule`, `GalleryModule`, `UploadModule`. All are registered in `AppModule`. AdminJS lives in a separate `AdminJsModule` (`src/admin/admin.module.ts`) that is awaited before `NestFactory.create()` and passed via `AppModule.withAdmin()`.

**Database:** PostgreSQL via TypeORM 0.3 (Data Mapper pattern — `Repository<Entity>`, never `ActiveRecord` query methods). All entities extend `BaseEntity` but repositories are injected via `@InjectRepository`. Entity classes live in `src/entities/`; import from the barrel `src/entities/index.ts`. Migrations are in `src/migrations/`. For Neon Postgres: `DATABASE_URL` (pooler) is used at runtime; `DATABASE_URL_UNPOOLED` (direct) is required for CLI migrations.

**Auth:** RS256 JWT (access token `1d`, refresh token `30d` in HTTP-only cookie). Three Passport strategies: `LocalStrategy` (login), `JwtStrategy` (API access), `JwtRefreshStrategy` (token refresh). Admin panel uses a separate session-based auth via AdminJS's `authenticate` callback.

**AdminJS (CMS):** `src/admin/admin.module.ts`. AdminJS v7 is ESM-only in a CommonJS NestJS app — all AdminJS/adminjs/remark/rehype imports use the `new Function('m', 'return import(m)')` trick to bypass TypeScript's CJS transpilation. AdminJS after-hooks call the Next.js revalidation endpoint on every mutation to trigger ISR.

**ESM-only packages:** `adminjs`, `@adminjs/*`, `unified`, `remark-*`, `rehype-*` are all ESM-only. Always use the `esmImport` pattern (`new Function('m', 'return import(m)')`) when importing them — never a regular `import` statement.

**Upload:** Cloudinary via `UploadService`. File type is validated by magic bytes (not Content-Type header) before upload. Images go to `portfolio/blog`; gallery photos go to `portfolio/gallery`. LQIP (blurred placeholder) and thumbnail URLs are constructed via Cloudinary URL transformation parameters at upload time.

**IDs:** Internal primary keys are UUIDs. `SqidsService` (`src/common/sqids.service.ts`) encodes UUIDs into short URL-safe IDs by splitting the 128-bit UUID into four 32-bit integers.

**Slug generation:** `src/common/slug.util.ts` — auto-generated from title on create; not updated on edit.

**Markdown:** `src/common/markdown.util.ts` — `renderMarkdown()` runs the unified/remark/rehype pipeline with a strict custom sanitize schema (no `<script>`, `<style>`, `<iframe>`). Blog posts and project descriptions store both `rawMarkdown` (source) and `htmlContent` (rendered, sanitized) in the DB.

### Web (Next.js)

**Key note:** `apps/web/AGENTS.md` states this uses a Next.js version with breaking changes — read `node_modules/next/dist/docs/` before writing any Next.js code.

**Routing:** App Router only. All pages are Server Components by default; client-only code is isolated in `*Client.tsx` files (e.g. `GalleryClient.tsx`, `AlbumClient.tsx`, `ProjectsClient.tsx`).

**Data fetching:** All API calls go through `apps/web/src/lib/api.ts`. Functions use `fetch` with `next: { tags: [...], revalidate: N }` for ISR (Incremental Static Regeneration). Cache tags: `resume`, `blog`, `blog-<slug>`, `projects`, `project-<slug>`, `gallery`, `album-<slug>`.

**On-demand revalidation:** `apps/web/src/app/api/revalidate/route.ts` — `POST /api/revalidate` with `{ tags, secret }`. Called by the NestJS API after every content mutation. Both apps must share the same `REVALIDATE_SECRET`. Uses `revalidateTag(tag, { expire: 0 })` for immediate expiration.

**API URL resolution:** `getApiBase()` in `api.ts` prefers `API_INTERNAL_URL` (Railway/Docker internal) → `NEXT_PUBLIC_API_URL` → `localhost:3001`. The internal URL bypasses the public internet and must never be exposed to browser bundles.

**Styling:** Tailwind CSS v4 with `@tailwindcss/postcss`. The `@portfolio-cms/oat-ui` package is transpiled by Next.js (`transpilePackages` in `next.config.ts`). Theme is managed by `@teispace/next-themes`.

**Security headers:** Configured in `next.config.ts` — CSP, HSTS, X-Frame-Options, etc. applied to all routes.

### Shared Packages

**`@portfolio-cms/oat-ui`:** Pure React component library with no runtime dependencies (only peer deps: React 18/19). Components are prefixed `Oat*`. Built with `tsc` to `dist/`. Next.js transpiles the source directly via `transpilePackages`.

**`@portfolio-cms/types`:** Generated from the API's OpenAPI spec — do not edit manually. Regenerate with `yarn generate:types`.

## Environment Variables

Both apps require `.env.local` or `.env` files. Key variables:

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

**Web (`apps/web/.env`):**
- `NEXT_PUBLIC_API_URL` — Public API base URL (exposed to browser)
- `API_INTERNAL_URL` — Internal API URL (server-side only, Railway/Docker)
- `REVALIDATE_SECRET` — Must match the API's value
- `NEXT_PUBLIC_SITE_URL` — Used for `metadataBase`

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`): lint + TypeScript check → API unit tests → Next.js build check → NestJS build check. All jobs build shared packages first (`types`, `utils`, `oat-ui`).

Deploy (`.github/workflows/deploy.yml`): migrations → Railway API deploy → Vercel web deploy on merge to `main`.
