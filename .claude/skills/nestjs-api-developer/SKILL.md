---
name: nestjs-api-developer
description: "Senior NestJS API developer lens for apps/api. Covers NestJS 10 module structure, TypeORM Data Mapper pattern, RS256 JWT auth, AdminJS v7 ESM-only workaround, ISR revalidation after-hooks, Cloudinary uploads, SqidsService, Neon dual-URL Postgres, and container deployment (Railway primary, Fly.io secondary). Grounded in Vikram's Node.js/Express/Django backend experience at Innoplexus and DMart Labs."
---

# /nestjs-api-developer

Adopt a senior NestJS API developer mindset scoped to `apps/api` in this project.

## Codebase context

### Module structure
```
apps/api/src/
├── main.ts                  ← bootstrap: AdminJS async ESM import, CORS, ValidationPipe, Swagger at /v1/docs
├── app.module.ts            ← AppModule.withAdmin(adminModule) pattern
├── admin/
│   ├── admin.module.ts      ← AdminJS v7 config; ESM-only import workaround; ISR after-hooks
│   └── components/          ← Custom AdminJS React components (ComponentLoader)
│       ├── markdown-editor.tsx   ← CodeMirror 6 + Rehype split-pane preview
│       ├── media-uploader.tsx    ← Cloudinary multi-file upload + drag-and-drop sort
│       ├── photo-uploader.tsx    ← Gallery photo bulk upload with preview
│       ├── skill-picker.tsx      ← M2M skill selector (emits '__empty__' when cleared)
│       ├── tag-picker.tsx        ← M2M tag selector (same empty sentinel)
│       ├── video-manager.tsx     ← Project video URL manager
│       └── dashboard.tsx         ← Stats dashboard
├── auth/                    ← AuthModule: LocalStrategy, JwtStrategy, JwtRefreshStrategy
├── resume/                  ← ResumeModule: profile, skills, experience, education, etc.
├── blog/                    ← BlogModule: posts with rawMarkdown + htmlContent
├── projects/                ← ProjectsModule
├── gallery/                 ← GalleryModule: albums + photos
├── upload/                  ← UploadModule: Cloudinary, magic-byte validation
├── entities/
│   └── index.ts             ← barrel export — always import entities from here
├── common/
│   ├── sqids.service.ts     ← UUID → short URL-safe ID encoding
│   ├── slug.util.ts         ← auto-generate slug from title on create; never update on edit
│   └── markdown.util.ts     ← renderMarkdown(): unified/remark/rehype pipeline, strict sanitize schema
├── migrations/              ← TypeORM migrations (run via CLI, never synchronize in prod)
└── seeds/
    ├── seed.ts              ← idempotent seed runner (find → skip or create)
    └── seed-data.ts         ← canonical seed content sourced from resume.tex
```

### Critical patterns

**TypeORM Data Mapper (mandatory)**
- Always use `@InjectRepository(Entity)` — never `Entity.find()` (ActiveRecord is disabled)
- Entities extend `BaseEntity` but repositories are always injected
- Import all entities from `src/entities/index.ts` barrel

**ESM-only packages (AdminJS, unified, remark-*, rehype-*)**
```typescript
// CORRECT — bypasses TypeScript CJS transpilation
const { default: AdminJS } = await new Function('m', 'return import(m)')('adminjs');

// WRONG — TypeScript will transpile this to require() which breaks ESM-only packages
import AdminJS from 'adminjs';
```
Use the `new Function('m', 'return import(m)')` pattern for: `adminjs`, `@adminjs/*`, `unified`, `remark-*`, `rehype-*`.

**Auth**
- Three Passport strategies: `LocalStrategy` (POST /auth/login), `JwtStrategy` (@UseGuards(JwtAuthGuard)), `JwtRefreshStrategy` (refresh cookie)
- Access token: RS256, 1d TTL. Refresh token: RS256, 30d TTL in HTTP-only cookie
- Admin panel uses separate session-based auth via AdminJS `authenticate` callback
- RS256 keys: `JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY` with `\n`-encoded newlines in env

**M2M relations in AdminJS**
- The base TypeORM adapter silently ignores M2M join tables. `admin.module.ts` extends `TypeOrmResource` with custom `findOne` / `update` / `create` for `Project` (skills) and `BlogPost` (tags).
- `SkillPicker` / `TagPicker` components emit the sentinel `'__empty__'` when the user clears all selections — the `extractM2MIds` helper in `admin.module.ts` strips this and returns `[]`.
- If a new resource needs M2M management, extend `TypeOrmResource` the same way rather than relying on the default adapter.

**ISR revalidation after-hooks**
- Every AdminJS after-hook that mutates content must POST to `NEXT_REVALIDATE_URL` with `{ tags: string[], secret: REVALIDATE_SECRET }`
- Tags: `resume`, `blog`, `blog-<slug>`, `projects`, `project-<slug>`, `gallery`, `album-<slug>`
- Failure to revalidate = stale content served to users until the TTL expires

**SqidsService** (`src/common/sqids.service.ts`)
- Internal PKs are UUIDs. Encode to short URL-safe IDs by splitting 128-bit UUID into four 32-bit ints
- Expose Sqid IDs in API responses; never expose raw UUIDs in URLs

**Cloudinary / UploadService**
- Validate file type by magic bytes before upload — never trust Content-Type header
- Blog images → `portfolio/blog`; gallery photos → `portfolio/gallery`
- LQIP and thumbnail URLs are Cloudinary transformation parameters set at upload time

**Slug generation** (`src/common/slug.util.ts`)
- Auto-generated from title on create
- Never updated on edit — changing a slug breaks existing URLs/cache tags

**Markdown** (`src/common/markdown.util.ts`)
- `renderMarkdown()`: unified → remark → rehype pipeline
- Strict custom sanitize schema: no `<script>`, `<style>`, `<iframe>`
- Both `rawMarkdown` (source) and `htmlContent` (rendered) stored in DB

## Deployment context

| Target | Type | Config |
|---|---|---|
| **Railway** (primary) | Long-lived container | `railway.toml` at repo root; Dockerfile at repo root |
| **Fly.io** (secondary) | Long-lived container | `fly.toml` at repo root |
| **Vercel** (experimental) | Serverless function | `apps/api/vercel.json` + `apps/api/api/index.ts` handler |

**Node version:** Node 22 LTS (required by `locter@2.2.1`, an AdminJS transitive dep). All `package.json` files declare `"engines": { "node": ">=22" }`.

**Docker healthcheck** (`Dockerfile` runtime stage):
```dockerfile
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO /dev/null http://localhost:3001/v1/health || exit 1
```
`--start-period=30s` is the key: AdminJS compiles its React bundle and TypeORM opens its pool on first boot — failures during this window are not counted toward `--retries`.

**Railway config** (`railway.toml`):
- `dockerfilePath = "Dockerfile"` (repo root)
- `healthcheckPath = "/v1/health"`, `healthcheckTimeout = 60`
- `overlapSeconds = "30"` for zero-downtime deploys
- `watchPatterns` exclude `apps/web/**` — web-only changes don't retrigger API deploy

**Vercel serverless handler** (`apps/api/api/index.ts`):
- Wraps the NestJS app with `serverless-http` via `require('../dist/...')` pattern
- Uses `require()` not `import` to preserve NestJS decorator metadata (esbuild strips decorators otherwise)
- `apps/api/vercel.json` sets `includeFiles` to bundle AdminJS and Swagger static assets

## Vikram's backend experience (from resume)

- **DMart Labs** (2019–2021): Node.js framework library with unified HTTP/push/events API; RxJS observables.
- **Innoplexus** (2017–2019): RESTful APIs with Express and Django; Elasticsearch + MongoDB for full-text search across millions of patent documents; Python data pipelines with Pandas.
- **Pole8** (2017): Full-stack Django + PostgreSQL; REST backend for Android geospatial app.
- **Vritt** (2016–2017): Django NLP pipeline; Stanford NER, NLTK, Polyglot; Python crawlers with RSS/HTML ingestion; PostgreSQL.

## Behaviour when active

### Module creation checklist
When adding a new NestJS module:
1. Create feature module dir under `src/`
2. Add entity to `src/entities/` and export from barrel `src/entities/index.ts`
3. Register `TypeOrmModule.forFeature([Entity])` in the feature module
4. Add AdminJS resource config in `src/admin/admin.module.ts` with after-hooks for ISR
5. Register feature module in `AppModule`
6. Generate migration: `yarn workspace api migration:generate`
7. Update seed runner if the entity needs seed data
8. Regenerate types: `yarn generate:types` (API must be running)

### Code review signals
Flag as blocking:
- Direct `Entity.find()` / `Entity.save()` ActiveRecord calls (use injected repository)
- Regular `import` of ESM-only packages (use `new Function('m', 'return import(m)')`)
- Missing ISR revalidation call after a content mutation
- `DB_SYNC=true` or `synchronize: true` checked in for production use
- File type validated by Content-Type instead of magic bytes in upload handlers
- Slug updated on edit

Flag as suggestions:
- Repository method not using QueryBuilder when a complex join is needed
- AdminJS after-hook not wrapped in try/catch (revalidation failure should not crash the mutation)
- Missing `class-validator` decorators on DTOs

### Database migrations
- Always generate migrations with `yarn workspace api migration:generate` — never hand-write SQL
- Use `DATABASE_URL_UNPOOLED` for CLI migration commands (Neon direct connection)
- `DATABASE_URL` (pooler) for runtime only
- Never run `synchronize: true` in production

## Usage

```
/nestjs-api-developer                     # activate lens for this session
/nestjs-api-developer review              # review current file with NestJS/TypeORM lens
/nestjs-api-developer module <name>       # scaffold a new NestJS feature module end-to-end
/nestjs-api-developer entity <name>       # design or review a TypeORM entity
/nestjs-api-developer auth                # review auth flow (JWT strategies, guards, cookies)
/nestjs-api-developer admin               # review AdminJS config and ISR after-hooks
/nestjs-api-developer migration           # generate and validate a migration for recent entity changes
/nestjs-api-developer upload              # review Cloudinary upload + magic-byte validation
```

### `review` mode
1. **Repository pattern** — any ActiveRecord calls that should use injected repository?
2. **ESM imports** — any bare imports of ESM-only packages?
3. **ISR hooks** — every mutation path covered by an after-hook with correct tags?
4. **Auth guards** — every protected endpoint has `@UseGuards(JwtAuthGuard)`?
5. **Validation** — DTOs have `class-validator` decorators; `ValidationPipe` will reject bad input?
6. **Slug/Sqids** — slugs not mutated on edit; Sqids used in URL-facing responses?

### `module <name>` mode
Generate the full feature module scaffold:
- `<name>.module.ts` (imports TypeOrmModule.forFeature)
- `<name>.entity.ts` (extends BaseEntity, UUID PK, appropriate columns)
- `<name>.service.ts` (injected repository, CRUD methods)
- `<name>.controller.ts` (REST endpoints with guards and DTOs)
- `dto/create-<name>.dto.ts` and `dto/update-<name>.dto.ts`
- Checklist of manual steps (barrel export, AppModule registration, AdminJS resource, migration)
