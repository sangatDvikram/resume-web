---
name: nest-module-scaffold
description: Scaffolds a complete new NestJS resource module in apps/api of this portfolio-cms monorepo — entity, migration, module, controller, service, DTOs, and Jest spec, all wired into app.module.ts and the entities barrel. Use this whenever the user wants to add a new resource, feature, or entity to the API — phrases like "add a testimonials feature", "scaffold a new module for X", "I need CRUD for a new entity Y", "add a new resource to the API", or "create an endpoint for Z" all qualify, even if the user never says the word "scaffold". Mirrors the exact conventions of the existing gallery/ and blog/ modules rather than a generic NestJS template, so trigger this instead of hand-rolling files from scratch or using `nest generate`.
---

# NestJS Module Scaffold

Generates a new resource module for `apps/api` that looks like it was written by the same person who wrote `gallery/` and `blog/` — same file layout, same naming, same quirks. Don't use `nest generate` or a generic NestJS tutorial pattern; this repo has specific conventions (no response envelope, per-service inline ISR revalidation, direct entity imports rather than the barrel, etc.) that a generic scaffold will get wrong.

`references/templates.md` has full copy-paste-ready code for every file type below, lifted verbatim from the gallery and blog modules. Read it before writing files — don't reconstruct the patterns from memory or general NestJS knowledge.

## 1. Gather the shape of the resource

Before writing anything, nail down:

- **Resource name** (singular entity, plural route) — e.g. `Testimonial` / `testimonials`.
- **Fields** and their types/constraints (required vs optional, string length limits, enums, etc.).
- **Relations** — does it belong to another entity (like `Photo` → `Album`), or is it standalone (like `BlogPost`)?
- **Public vs admin surface** — which routes are publicly readable (published-only) vs which need `@UseGuards(JwtAuthGuard)`? Almost every resource in this repo has both.
- **Pagination** — small, bounded collections (like blog posts, projects) just `find()` everything; larger/unbounded collections (like gallery photos) need the cursor pattern.
- **Does it need ISR revalidation?** If the resource is rendered on the public Next.js site, it needs a cache tag and the `revalidate()` call after mutations. If it's admin-only data with no public page, skip this.

If the user hasn't specified these, ask — don't guess at fields or relations, since a wrong entity shape means a wrong migration means a schema you'll have to hand-fix later. It's fine to infer obvious things (e.g. `published: boolean` and `sortOrder: number` are almost always present) without asking.

## 2. Build the files in this order

Order matters because later files import earlier ones.

1. **Entity** (`apps/api/src/entities/<name>.entity.ts`) — see `references/templates.md#entity`.
2. **Barrel export** — add one line to `apps/api/src/entities/index.ts` under the right feature-domain banner (or a new banner if this is a new domain). Feature modules import entities directly from the entity file, not the barrel — the barrel is for seeds/AdminJS.
3. **Migration** — write it by hand in `apps/api/src/migrations/`, don't rely on `migration:generate` picking up entity changes correctly for a brand-new table (it can produce spurious diffs against existing tables). Follow `references/templates.md#migration` for the raw-SQL style, `PK_`/`UQ_`/`FK_`/`IDX_` constraint naming, and the up/down mirror-in-reverse-order convention. Filename: `<unix-ms-timestamp>-<PascalCaseName>.ts`, matching an existing migration's numbering scheme (check the latest file in `apps/api/src/migrations/` for the next timestamp).
4. **DTOs** (`apps/api/src/<module>/dto/<name>.dto.ts`) — `Create<Entity>Dto` / `Update<Entity>Dto` as classes with `class-validator` decorators, plus plain `interface`s for response shapes (`<Entity>Dto`, `<Entity>SummaryDto`/`<Entity>DetailDto` if the list/detail shapes differ). See `references/templates.md#dto`.
5. **Service** (`<module>.service.ts`) — `@InjectRepository` per entity touched, method names `findAll`/`findAllPublished`/`findBySlug`/`create`/`update`/`remove` (prefer `remove` over `delete<Entity>` — it's the majority convention). Include the inline `revalidate()` method only if this resource has a public-facing page. See `references/templates.md#service`.
6. **Controller** (`<module>.controller.ts`) — public GETs first (no guard), admin routes after (`@UseGuards(JwtAuthGuard)`), static sub-paths declared before `:id`/`:slug` params to avoid route shadowing. No `@ApiTags`/`@ApiOperation` — Swagger tags live centrally in `main.ts`. See `references/templates.md#controller`.
7. **Module** (`<module>.module.ts`) — `TypeOrmModule.forFeature([...entities])`, single-item `providers`/`controllers`, `exports: [XxxService]` (seeds and other modules may need it later even if nothing consumes it yet). See `references/templates.md#module`.
8. **Spec** (`<module>.service.spec.ts`) — `mockRepo()` factory of `jest.fn()` stubs per repo method used, wired via `getRepositoryToken(Entity)`, `ConfigService.get` mocked to return `undefined` so `revalidate()` short-circuits instead of making a real network call in tests. Nested `describe(methodName)` blocks. See `references/templates.md#spec`.

## 3. Wire it up

- **`apps/api/src/app.module.ts`** — add the import line and append `XxxModule` to the `imports` array under the `// ── Feature modules ──` banner. Order roughly follows creation/dependency order; appending at the end is safe unless the new module depends on one not yet imported.
- **`apps/api/src/main.ts`** — add a `.addTag('<resource>', '...')` line to the `DocumentBuilder` chain so the resource shows up grouped correctly in `/v1/docs`.
- **AdminJS registration** (`apps/api/src/admin/admin.module.ts`) is a separate, more opinionated step (resource config, custom components, ISR after-hooks) — don't attempt to wire it automatically unless asked. Flag to the user that CMS/admin visibility is a follow-up step.

## 4. Run and verify

After writing all files:

```bash
yarn workspace api migration:run
yarn workspace api test --testPathPattern=<module-name>
```

Migrations need `DATABASE_URL_UNPOOLED` set (direct connection — PgBouncer transaction mode can't run DDL). If the DB isn't reachable in this environment, tell the user the migration is written but unapplied rather than silently skipping it.

Don't report the scaffold as done until the new module's Jest spec passes — a scaffold that doesn't compile or test-pass isn't a working scaffold, it's a rough draft with extra steps.

## Things that will bite you if skipped

- Forgetting the barrel export — AdminJS setup and seed scripts import from `entities/index.ts`, so a missing export silently breaks those later, not now.
- Using the entity barrel inside the new `*.module.ts` instead of a direct `../entities/<name>.entity` import — inconsistent with every existing module.
- Adding a response envelope (`{data, meta}`) — this codebase's API contract doc mentions one, but no module actually implements it. Match the code, not the doc: return raw arrays/DTOs, and use the inline `{ items, nextCursor, total }` shape only for cursor-paginated lists.
- Skipping `@Param('id', ParseUUIDPipe)` on admin routes — every existing admin mutation validates the UUID shape before hitting the service.
- Declaring `:id`/`:slug` routes before static sibling routes like `tags` or `admin/albums` — NestJS matches routes in declaration order, so this creates dead routes.
