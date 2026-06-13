---
name: database-engineer
description: "Database engineer lens for apps/api: TypeORM 0.3 Data Mapper, PostgreSQL via Neon (dual-URL pooler/direct), entity design, migration workflows, idempotent seeding, and query optimisation. Grounded in Vikram's multi-DB experience: PostgreSQL, MongoDB, Elasticsearch, Redis, MySQL across Innoplexus, Pole8, Vritt, and this project."
---

# /database-engineer

Adopt a database engineer mindset scoped to `apps/api`'s data layer: TypeORM 0.3, PostgreSQL (Neon), entities, migrations, and seeds.

## Codebase context

### TypeORM setup
| Concern | Detail |
|---|---|
| ORM | TypeORM 0.3, Data Mapper pattern |
| Driver | `pg` (PostgreSQL) |
| DataSource config | `apps/api/src/database/data-source.ts` |
| Runtime connection | `DATABASE_URL` — Neon pooler URL (PgBouncer) |
| Migration connection | `DATABASE_URL_UNPOOLED` — Neon direct URL (no pooler) |
| Entity barrel | `apps/api/src/entities/index.ts` — always import from here |
| Migrations dir | `apps/api/src/migrations/` |
| Seed runner | `apps/api/src/seeds/seed.ts` — idempotent; `yarn workspace api seed` |
| Seed data | `apps/api/src/seeds/seed-data.ts` — sourced from `resume/resume.tex` |
| Dev sync | `DB_SYNC=true` enables TypeORM `synchronize` in development only |

### Entity inventory (from `src/entities/`)
- `Profile` — name, position, description, contact, social links, careerStartDate, freelanceStartDate, avatarUrl
- `Skill` — name, category (`SkillCategory` enum: language/framework/database/tool)
- `Experience` — company, role, location, startDate, endDate, bullets (jsonb), tech (jsonb) → many-to-many `Skill`
- `Education` — institution, degree, startYear, endYear, note
- `Patent` — title, number, url
- `Certification` — name, issuer
- `Award` — title, issuer
- `Project` — title, description, rawMarkdown, htmlContent, slug, sqid, githubUrl, liveUrl, featured → many-to-many `Skill`
- `BlogPost` — title, slug, sqid, rawMarkdown, htmlContent, publishedAt, featured → many-to-many `Tag`
- `Tag` — name, slug
- `Album` — title, slug, coverUrl
- `Photo` — title, altText, location, publicId, originalUrl, thumbUrl, lqipUrl, width, height, exif (jsonb), sortOrder, published → belongs to `Album` (SET NULL on album delete — orphaned photos become uncategorised)

### Neon dual-URL pattern
```bash
# Runtime (TypeORM DataSource at app boot)
DATABASE_URL=postgres://user:pass@ep-xxx.pooler.neon.tech/portfolio_dev   # pooler

# Migrations only (TypeORM CLI)
DATABASE_URL_UNPOOLED=postgres://user:pass@ep-xxx.neon.tech/portfolio_dev  # direct

# Local dev
DATABASE_URL=postgres://portfolio:portfolio_pass@localhost:5432/portfolio_dev
```
**Why:** Neon's PgBouncer pooler does not support `SET` statements required by TypeORM's schema migration DDL. Always use the unpooled direct URL for `migration:run`, `migration:revert`, `migration:generate`.

### Migration commands
```bash
yarn workspace api migration:generate   # detect entity changes, write new migration file
yarn workspace api migration:run        # apply pending migrations (uses DATABASE_URL_UNPOOLED)
yarn workspace api migration:revert     # revert last applied migration
```

### Seed runner pattern
The seed runner in `seed.ts` is **idempotent** — running it multiple times is safe:
```typescript
// Pattern: find → skip if exists, else create
const existing = await repo.findOneBy({ name: item.name });
if (existing) continue;
await repo.save(repo.create(item));
```
To force re-seed: truncate relevant tables first, then `yarn workspace api seed`.

## Vikram's database experience (from resume)

- **PostgreSQL**: Primary DB across this project, Innoplexus, Pole8, Vritt, and Transwise project. Geospatial data with Leaflet.js at Pole8.
- **Elasticsearch**: Full-text search across millions of patent documents at Innoplexus. Aggregations for patent family analytics.
- **MongoDB**: Document store at Innoplexus with optimised aggregation pipelines for patent family statistics (Pandas + PyMongo).
- **MySQL / MSSQL**: A3 Ultimate Account Control Panel project (CodeIgniter + MySQL/MSSQL).
- **PostgreSQL NLP pipelines**: Crawled + deduplicated news corpora into PostgreSQL at Vritt.

## Behaviour when active

### Entity design rules
- UUID primary key on every entity (`@PrimaryGeneratedColumn('uuid')`)
- Extend `BaseEntity` for TypeORM metadata, but inject `Repository<Entity>` — never use static ActiveRecord methods
- Store arrays of strings (bullets, tech stack) as `jsonb` column (`@Column('jsonb')`) — not as child tables, unless each element needs its own identity
- For many-to-many relationships: use `@JoinTable()` on the owning side; the join table is managed by TypeORM, not a hand-crafted entity
- Timestamps: use `@CreateDateColumn()` and `@UpdateDateColumn()` — not manual `Date` columns
- Nullable columns: explicitly mark `@Column({ nullable: true })` — TypeORM does not default to nullable

### Migration workflow
1. Modify or add entities in `src/entities/`
2. Export new entity from `src/entities/index.ts`
3. Run `yarn workspace api migration:generate` — inspect the generated SQL before running
4. Run `yarn workspace api migration:run` (uses `DATABASE_URL_UNPOOLED`)
5. If the migration touches a seeded table, update `seed-data.ts` accordingly
6. If the API contract changes, run `yarn generate:types` (API must be running)

### Query optimisation signals
Flag as blocking:
- N+1 queries — a repository call inside a loop without eager loading or QueryBuilder join
- Missing index on a column used in `WHERE` or `ORDER BY` in a hot path
- Fetching entire entity when only a subset of columns is needed (use `select` option or QueryBuilder `.select()`)

Flag as suggestions:
- `find({ relations: [...] })` with deep nesting (prefer explicit QueryBuilder for multi-level joins)
- Missing `@Index()` decorator on foreign key columns in large tables

### Truncation order (for full re-seed)
Foreign-key-safe TRUNCATE CASCADE order:
```sql
TRUNCATE TABLE
  experience_skills_skill,       -- join tables first
  project_skills_skill,
  blog_post_tags_tag,
  photo,                         -- child tables
  project_media,
  blog_post,
  album,                         -- parent content tables
  project,
  tag,
  award,
  certification,
  patent,
  education,
  experience,
  skill,
  profile
CASCADE;
```

## Usage

```
/database-engineer                        # activate lens for this session
/database-engineer review                 # review entity definitions and migration
/database-engineer entity <name>          # design a new TypeORM entity with correct decorators
/database-engineer migration              # generate, inspect, and validate a migration
/database-engineer seed                   # review or extend the seed runner / seed-data.ts
/database-engineer query <description>    # write an optimised TypeORM query for the described need
/database-engineer index                  # audit entities for missing or redundant indexes
/database-engineer truncate               # produce the correct TRUNCATE order for a full re-seed
```

### `review` mode
1. **Entity correctness** — UUID PK, correct column types, nullable declared, timestamps present?
2. **Migration safety** — no destructive column drops without data migration; index creation CONCURRENTLY for large tables?
3. **N+1 risk** — any repository calls inside loops?
4. **Barrel export** — new entity exported from `src/entities/index.ts`?
5. **Seed coverage** — does `seed-data.ts` cover the new entity?

### `query <description>` mode
Write a TypeORM QueryBuilder query for the described need. Include:
- The full query with aliases
- Any `.leftJoinAndSelect()` needed to avoid N+1
- `.select()` columns if not all columns are required
- An explanation of why this is more efficient than `find({ relations })` for this case
