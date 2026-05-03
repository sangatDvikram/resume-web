# Epic Estimates & User Stories
## Portfolio CMS Platform — PRD-001 v1.0.0

---

## Overview

| Metric | Value |
|---|---|
| Total EPICs | 10 |
| Total Stories | 55 |
| Total Story Points | 352 SP |
| Estimation Scale | Fibonacci (1, 2, 3, 5, 8, 13, 21) |
| Sprint Length | 2 weeks |
| Assumed Velocity | 25 SP / sprint (solo developer) |
| Estimated Duration | 15 sprints ≈ 30 weeks |

---

## Story Point Scale

| Points | Complexity | Typical Effort |
|--------|------------|----------------|
| 1 | Trivial config / env change | < 1 hour |
| 2 | Simple, well-understood task | 2–4 hours |
| 3 | Small feature, low uncertainty | 0.5–1 day |
| 5 | Medium feature, clear requirements | 1–2 days |
| 8 | Large feature, some unknowns | 3–5 days |
| 13 | Complex feature, significant unknowns | 1–2 weeks |
| 21 | Too large — must be split before sprint | > 2 weeks |

---

## EPIC 1 — Foundation: Monorepo & Infrastructure Setup

**Goal:** Establish the Yarn Workspace + Lerna monorepo, bootstrap both apps, wire up the local database,
and configure the CI/CD pipeline so all subsequent epics can build on a stable foundation.

**PRD References:** §4.1, §11.1, §11.2, §11.3, §11.4

**Total Story Points: 20**

| ID | Story | Acceptance Criteria | SP | Priority |
|----|-------|---------------------|----|----------|
| E1-S1 | **Scaffold Yarn + Lerna monorepo** — Initialise `portfolio-cms/` root with `package.json` (Yarn workspaces), `lerna.json` (`useWorkspaces: true`), and `.yarnrc.yml`. Create `apps/web`, `apps/api`, `packages/types`, `packages/oat-ui`, `packages/eslint-config` workspace folders. | `yarn workspaces list` lists all 5 packages; `lerna ls` confirms them. | 3 | P0 |
| E1-S2 | **Configure shared packages** — Set up `packages/types` (shared TS interfaces), `packages/eslint-config` (shared rules), and `packages/utils` (date helpers, LaTeX generator stubs). | Each package exports correctly; `apps/web` and `apps/api` can import from them with workspace aliases. | 2 | P0 |
| E1-S3 | **Bootstrap Next.js 15 app** — Create `apps/web` with Next.js 15 (App Router), Tailwind CSS, `next/font` (Lato + Roboto), `next/image`, and `next-themes`. Migrate global CSS custom properties from `src/index.css`. | `yarn workspace web dev` serves the app at `localhost:3000`; Tailwind classes and CSS variables render correctly. | 5 | P0 |
| E1-S4 | **Bootstrap NestJS 10 app** — Create `apps/api` with NestJS CLI, global `ValidationPipe`, CORS configuration, Swagger bootstrap (`/v1/docs`), and `@nestjs/config` for env loading. | `yarn workspace api start:dev` serves at `localhost:3001`; `GET /v1/docs` returns OpenAPI UI. | 5 | P0 |
| E1-S5 | **TypeORM DataSource + Docker Compose** — Configure TypeORM `DataSource` in `apps/api/src/database/data-source.ts`. Add `docker-compose.yml` at monorepo root with a `postgres:16` service. Set `synchronize: true` for development only. | `docker compose up -d` starts Postgres; `typeorm migration:run` succeeds; NestJS connects on start. | 3 | P0 |
| E1-S6 | **GitHub Actions CI/CD pipeline** — Create `.github/workflows/ci.yml`: lint (ESLint + tsc), Jest unit tests, `next build` check on PR. Create `.github/workflows/deploy.yml`: `typeorm migration:run` → Railway API deploy → Vercel production deploy on merge to `main`. | PRs trigger lint/test/build checks; merges to `main` deploy to staging then production. | 3 | P0 |
| E1-S7 | **Environment variable matrix** — Document and configure `.env.example` files for `apps/web` and `apps/api` matching §11.2. Add secrets to GitHub Actions and Railway/Vercel dashboards. | All required env vars listed in §11.2 are present in `.env.example`; CI pipeline passes without hardcoded secrets. | 1 | P0 |

---

## EPIC 2 — Authentication & Authorization

**Goal:** Implement a complete JWT RS256 auth system: AdminUser entity, login / refresh / logout endpoints,
rate limiting, and AdminJS session-based protection for all `/admin/**` routes.

**PRD References:** §9.4, §9.2.1, A-acceptance criteria (admin section)

**Total Story Points: 18**

| ID | Story | Acceptance Criteria | SP | Priority |
|----|-------|---------------------|----|----------|
| E2-S1 | **RS256 key pair + JwtModule** — Generate RSA-2048 key pair. Configure `@nestjs/jwt` with `privateKey` / `publicKey` from env. Set access token TTL to `1d` and refresh token TTL to `30d`. | `JwtModule.registerAsync()` signs and verifies tokens correctly in unit tests. | 2 | P0 |
| E2-S2 | **AdminUser entity + seed** — Define `AdminUser` TypeORM entity. Add a one-time seed that creates the admin user (`email` + `bcrypt`-hashed password) if no admin exists. | `GET /v1/auth/me` returns seeded admin; password stored as bcrypt hash. | 2 | P0 |
| E2-S3 | **Login endpoint + rate limiting** — Implement `LocalStrategy` (email/password), `POST /v1/auth/login` returning `{ accessToken, expiresIn }` and setting HTTP-only `Secure` refresh cookie. Apply `@nestjs/throttler` (10 req / 15 min per IP) to the login route. | Valid credentials return 200 + token; invalid return 401; 11th attempt within 15 min returns 429. | 5 | P0 |
| E2-S4 | **Refresh + logout endpoints** — Implement `POST /v1/auth/refresh` (validates refresh cookie, issues new access token) and `POST /v1/auth/logout` (clears cookie, returns 204). Implement `GET /v1/auth/me` (Bearer-protected). | Refresh returns new access token; logout clears cookie; `/me` returns 401 without valid Bearer. | 5 | P0 |
| E2-S5 | **AdminJS session authentication** — Configure AdminJS `authenticate` callback in `admin.module.ts` to validate email + bcrypt password against `AdminUser` entity. Set up `express-session` with `connect-pg-simple` store. Add `X-Robots-Tag: noindex` middleware for all `/admin/**` routes. Add `Disallow: /admin` to Next.js `robots.txt`. | `POST /admin/login` with valid credentials sets HTTP-only session cookie and redirects to `/admin`; invalid credentials show error; unauthenticated `/admin` redirects to `/admin/login`; `X-Robots-Tag: noindex` header present on all `/admin/**` responses. | 3 | P0 |
| E2-S6 | **AdminJS login UI customisation** — Override the default AdminJS login page branding: set logo, background colour, and welcome message via `AdminJS` constructor `branding` config. | Login page displays custom branding; authentication flow works end-to-end. | 1 | P1 |

---


## EPIC 3 — Data Migration: `constants/index.tsx` → PostgreSQL

**Goal:** Define all TypeORM entity classes, generate the initial DB migration, run an idempotent seed
that imports every value from `src/constants/index.tsx`, validate parity, and move shared utilities to
`packages/utils`.

**PRD References:** §8.2, §9.3, §13 (Appendix), Migration Phase 1–3

**Total Story Points: 21**

| ID | Story | Acceptance Criteria | SP | Priority |
|----|-------|---------------------|----|----------|
| E3-S1 | **Define all TypeORM entity classes** — Implement all 15 entities in `apps/api/src/entities/`: `AdminUser`, `ResumeProfile`, `Skill`, `ExperienceEntry`, `EducationEntry`, `Patent`, `Certification`, `Award`, `Tag`, `BlogPost`, `Project`, `ProjectMedia`, `ProjectVideo`, `Album`, `Photo`. Include `@Index` decorators per §9.3. | All entities importable; `typeorm migration:generate` produces a non-empty diff with all 15 tables. | 5 | P0 |
| E3-S2 | **Generate and apply initial TypeORM migration** — Run `typeorm migration:generate` from entity diff, review the generated SQL, commit to `apps/api/src/migrations/`, and apply via `typeorm migration:run`. | `psql` confirms all 15 tables + join tables exist; migration file committed to Git. | 2 | P0 |
| E3-S3 | **Write idempotent seed script** — Using `typeorm-extension`, create `apps/api/src/seeds/seed.ts` that reads every exported value from `src/constants/index.tsx` and upserts rows via TypeORM repositories: `ResumeProfile`, all `Skill` categories, `ExperienceEntry` + `ExperienceSkill`, `EducationEntry`, `Patent`, `Certification`, `Award`, `Project`, and `Photo` (into default "General" album). Seed uploads the 6 existing Unsplash photo URLs to Cloudinary via the SDK and stores the returned `publicId`, `url`, `lqipUrl`, `width`, and `height` fields in the `Photo` entity. | Running `yarn seed` twice produces identical DB state. All 6 experience entries, 4 skill categories, 3 projects, 6 photos present in Cloudinary and DB. | 8 | P0 |
| E3-S4 | **Side-by-side validation** — Render static React app and new Next.js API-driven resume page in parallel. Compare all fields. Log and resolve mismatches. | Written checklist confirms 100% field parity. No Lighthouse regression on LCP, CLS, or SEO scores. | 3 | P0 |
| E3-S5 | **Extract shared utilities to `packages/utils`** — Move `calculateDuration`, `yearsOfExperience`, `formatNumberSuffix`, and `generateLatexResume` into `packages/utils/src/date.ts` and `packages/utils/src/latex.ts`. Update all import sites. | All moved functions pass existing unit tests; no broken imports across monorepo. | 3 | P1 |

---

## EPIC 4 — Dynamic Resume System

**Goal:** Replace all static constant imports with a live NestJS REST API. Build admin CRUD forms for every
resume section, and wire on-demand ISR revalidation so live pages update within 60 seconds of any admin save.

**PRD References:** §8.2–§8.4, §9.2.2, A-04–A-09, Acceptance Criteria (Content Migration + Zero-Redeploy)

**Total Story Points: 34**

| ID | Story | Acceptance Criteria | SP | Priority |
|----|-------|---------------------|----|----------|
| E4-S1 | **NestJS resume module** — Implement `ResumeModule` with service + repository methods for `ResumeProfile`, `ExperienceEntry`, `EducationEntry`, `Skill`, `Patent`, `Certification`, `Award`. Service computes `yearsOfExperienceString` from `careerStartDate`. | Unit tests cover service methods; `GET /v1/resume` returns full `ResumeDTO` with all sub-collections. | 8 | P0 |
| E4-S2 | **Resume REST endpoints** — Wire all endpoints in §9.2.2: `GET /v1/resume` (public), `PATCH /v1/resume/profile` (auth), full CRUD for experience / education / skills with `class-validator` DTOs. Apply `JwtAuthGuard` to all mutation routes. | All endpoints return correct status codes; invalid payloads return 422 RFC 7807 bodies; unauthenticated mutations return 401. | 5 | P0 |
| E4-S3 | **Migrate Next.js pages to Server Components** — Replace all `RESUME.*`/`PROFILE.*` imports across `app/(public)/page.tsx` and `app/(public)/resume/page.tsx` with server-side fetches to `GET /v1/resume`. Keep static file as read-only fallback. | Pages render identical content to pre-migration static version; Lighthouse scores unchanged. | 5 | P0 |
| E4-S4 | **AdminJS resume resource configuration** — Configure `ResumeProfile`, `ExperienceEntry`, `EducationEntry`, `Certification`, `Award`, and `Patent` AdminJS resources with appropriate `editProperties` (profile: character-count hint via custom component; experience: `isCurrent` checkbox, tech-stack multi-select, bullet tasks). Wire `after` hook for ISR revalidation of `/` and `/resume` on save. | Admin can create, edit, delete, and reorder all resume sections via AdminJS; changes persist and appear in `GET /v1/resume` immediately; ISR revalidation fires within 5 s. | 5 | P0 |
| E4-S5 | **On-demand ISR revalidation for resume** — Implement `/api/revalidate` route handler in Next.js. NestJS resume service POSTs to it after every mutation, revalidating `/` and `/resume`. | Editing an experience entry causes `/resume` to reflect the change within 60 seconds; no new Vercel deployment. | 3 | P0 |
| E4-S6 | **Remove static constants (Phase 3)** — Delete `src/constants/index.tsx`. Remove all remaining imports of `RESUME`, `PROFILE`, `CAREER_START_DATE`, `LINKEDIN_URL`, `gravatar()`. Update `generateLatex.ts` to fetch from API snapshot. | `grep -r "constants/index"` returns no matches; `yarn build` succeeds; all pages render correctly. | 5 | P1 |

---

## EPIC 5 — Blog Engine

**Goal:** Full end-to-end blog: NestJS CRUD API, server-side Markdown rendering, SEO-optimised public pages,
and a split-pane Markdown editor with image upload and tag management in the admin.

**PRD References:** §5 (B-01–B-15), §9.2.3, A-10–A-12, Acceptance Criteria (Blog Engine)

**Total Story Points: 50**

| ID | Story | Acceptance Criteria | SP | Priority |
|----|-------|---------------------|----|----------|
| E5-S1 | **NestJS blog module** — Implement `BlogModule` with `BlogPost` + `Tag` entities, repository, service (CRUD, slug generation, tag upsert), and all endpoints in §9.2.3. Markdown → HTML runs server-side via unified pipeline on every create/update; result cached in `htmlContent`. | All §9.2.3 endpoints respond correctly; drafts excluded from public `GET /v1/blog`; `htmlContent` populated on save. | 8 | P0 |
| E5-S2 | **Server-side Markdown pipeline** — Configure `unified` + `remark-gfm` + `rehype-pretty-code` (Shiki) + `rehype-sanitize` + `gray-matter` + `reading-time` in `packages/utils/src/markdown.ts`. Support 10 required languages (B-03). | Code blocks for TypeScript and Python render with syntax highlighting; HTML passes `rehype-sanitize` strict allowlist. | 5 | P0 |
| E5-S3 | **Public `/blog` index page** — Build `app/(public)/blog/page.tsx` (ISR `revalidate: 60`). Render paginated post list (20/page, date DESC): cover image, title, excerpt, tags, date, reading time. Implement tag-filter view (`/blog?tag=...`). | Page renders all published posts; pagination correct; tag filter shows only matching posts; OG tags present. | 5 | P0 |
| E5-S4 | **Public `/blog/[slug]` post page** — SSG + on-demand revalidation. Server-rendered HTML. Sticky ToC from `##`/`###` headings (≥ 1024 px). Related posts card grid (up to 3). Full OG/Twitter Card meta + JSON-LD `BlogPosting` structured data (B-09–B-15). | Google Rich Results Test passes; ToC renders from `##` headings; related posts correct. | 8 | P0 |
| E5-S5 | **AdminJS blog resource + Markdown editor component** — Register `BlogPost` as an AdminJS resource. Wire the `markdown-editor.tsx` custom component (E8-S3) to the `rawMarkdown` field. Configure list view columns: title, published status, tags, dates. Enable built-in bulk publish/unpublish/delete actions. Wire `after` hook for ISR revalidation of `/blog` and `/blog/[slug]` on publish. | Preview updates within 300 ms of typing; all blog fields save correctly; publish toggle triggers ISR revalidation; bulk actions work on multi-selected posts. | 8 | P0 |
| E5-S6 | **Image upload in editor** — Drag-and-drop or file picker uploads to **Cloudinary** via `POST /v1/upload`; the returned Cloudinary CDN URL is inserted as `![alt](url)` at cursor position. | Drop image → Cloudinary upload → CDN URL inserted in Markdown at cursor position. | 5 | P1 |
| E5-S7 | **Tag management UI** — Typeahead input autocompleting from `GET /v1/blog/tags`. Inline new-tag creation. Selected tags rendered as removable `OatBadge` chips. | Existing tags appear in dropdown; new tags created on commit; persist on post save. | 3 | P1 |
| E5-S8 | **Blog ISR revalidation** — NestJS `BlogService` POSTs to `/api/revalidate` after publish/unpublish/save, revalidating `/blog` and `/blog/[slug]`. | Publishing a post makes it live at its URL within 60 seconds; no Vercel deployment triggered. | 3 | P0 |

---

## EPIC 6 — Multimedia Project Showcase

**Goal:** Elevate projects from plain text bullets to media-rich detail pages with Embla Carousel,
lazy-loaded video embeds, client-side skill filtering, and full admin CRUD including media management.

**PRD References:** §6 (P-01–P-15), §9.2.4, A-13–A-14, Acceptance Criteria (Project Showcase)

**Total Story Points: 52**

| ID | Story | Acceptance Criteria | SP | Priority |
|----|-------|---------------------|----|----------|
| E6-S1 | **NestJS projects module** — Implement `ProjectsModule` with `Project`, `ProjectMedia`, `ProjectVideo` entities, service (CRUD, slug generation, skill linking), and all endpoints in §9.2.4 including media upload, reorder, and delete. | All §9.2.4 endpoints respond correctly; unpublished projects excluded from public `GET /v1/projects`. | 8 | P0 |
| E6-S2 | **Public `/projects` index page** — ISR (`revalidate: 60`). Responsive grid (1/2/3-col). Featured strip (up to 3 admin-flagged projects in hero format). Client-side filter by skill/technology. Sort: recent / alphabetical / featured. | Grid renders; featured strip shown; filter shows/hides projects without page reload; sort works. | 8 | P0 |
| E6-S3 | **Public `/projects/[slug]` detail page** — SSG + on-demand revalidation. Structured metadata section (role, timeline, tech stack chips, GitHub/live demo links). Long-form Markdown description (Unified/Rehype pipeline). Full OG/Twitter Card meta + JSON-LD `CreativeWork`. Related projects (up to 3 by shared skills). | Rich Results Test passes; Markdown description renders; related projects correct. | 5 | P0 |
| E6-S4 | **Embla Carousel for project images** — Render carousel on detail page using `embla-carousel-react`. Support keyboard `ArrowLeft`/`ArrowRight`, touch swipe, autoplay (configurable per project), dot indicator. Images served from CDN via `next/image`. | Keyboard and swipe navigation work; autoplay plays and pauses on hover; dot indicator reflects current slide. | 5 | P0 |
| E6-S5 | **Lazy-loaded video embed** — Detect YouTube, Vimeo, or self-hosted MP4 URLs. Render an `<iframe>` or `<video>` inside an Intersection Observer wrapper — only load when within viewport. Video MUST NOT block page LCP. | Videos render for all 3 source types; DevTools Network confirms no video request before scroll-into-view; LCP unaffected. | 5 | P0 |
| E6-S6 | **AdminJS project resource + media uploader** — Register `Project` as an AdminJS resource. Wire `markdown-editor.tsx` to the `description` field and `media-uploader.tsx` (E8-S4) to the `ProjectMedia` relation. Add `featured` checkbox and `published` toggle. Wire `after` hook for ISR revalidation of `/projects` and `/projects/[slug]`. | All project fields save via AdminJS; media uploader stores images in Cloudinary with correct order; publish triggers ISR revalidation. | 5 | P0 |
| E6-S7 | **Admin media manager** — Multi-file image upload (drag-and-drop). Drag-and-drop reorder of uploaded images via sortable list. Per-image alt text and delete. Calls `POST /v1/projects/:id/media`, `PATCH .../reorder`, `DELETE .../media/:mediaId`. | Upload, reorder, and delete all reflected immediately in carousel on detail page. | 8 | P1 |
| E6-S8 | **Admin video manager** — URL input (YouTube / Vimeo) or file upload for self-hosted MP4. Title field per video. Reorder via drag-and-drop. Delete. | All video sources render correctly on public detail page after save. | 5 | P1 |
| E6-S9 | **Tech stack multi-select typeahead** — Shared `Skill` records typeahead (same data as resume skills). Adds/removes `ProjectSkill` join rows. Renders selected skills as `OatBadge` chips on both admin form and public page. | Selecting "React" in the project admin links the project to the `Skill("React")` row; chip appears on detail page. | 3 | P1 |

---

## EPIC 7 — Photography Gallery

**Goal:** Transform the 6-image hobby tab into a standalone full-site gallery with albums, masonry layout,
infinite scroll, full-screen lightbox with keyboard/touch navigation, server-side image processing, and
a complete admin management UI.

**PRD References:** §7 (G-01–G-22), §9.2.5, A-15–A-16, Acceptance Criteria (Photography Gallery)

**Total Story Points: 52**

| ID | Story | Acceptance Criteria | SP | Priority |
|----|-------|---------------------|----|----------|
| E7-S1 | **NestJS gallery module** — Implement `GalleryModule` with `Album` + `Photo` entities, service, and all endpoints in §9.2.5: album CRUD, cursor-based photo listing, bulk photo upload, metadata update, delete, and reorder. | All §9.2.5 endpoints respond correctly; unpublished photos excluded from public listing. | 8 | P0 |
| E7-S2 | **Cloudinary upload & metadata pipeline** — On photo upload (`POST /v1/gallery/photos`): validate file type by magic-byte inspection (NF-07), then upload to **Cloudinary** via SDK v2 (`cloudinary.uploader.upload()`). Cloudinary returns `public_id`, `secure_url`, `width`, `height`, and EXIF metadata. Construct the `lqipUrl` by appending `e_blur:2000,q_1,f_auto` to the Cloudinary transformation URL. Store `publicId`, `originalUrl`, `lqipUrl`, `width`, `height`, and `exif` on the `Photo` entity. Responsive breakpoints (400 w, 800 w, 1200 w, 2400 w) are served on-the-fly via Cloudinary URL parameters — no server-side resize required. | Upload succeeds; `Photo` row contains correct `publicId`, EXIF data, and `lqipUrl`; invalid file types rejected with 422 before reaching Cloudinary. | 8 | P0 |
| E7-S3 | **Public `/gallery` index page** — Album grid (cover thumbnail, name, photo count, location/date). "All Photos" masonry view (Pinterest-style variable-height columns). Layout toggle (masonry ↔ uniform grid, persisted to `localStorage`). Infinite scroll (cursor-based, load within 200 px of bottom). Column counts: 2 mobile / 3 tablet / 4 desktop. | Albums and "All Photos" render; layout toggle persists; infinite scroll loads next batch automatically. | 8 | P0 |
| E7-S4 | **Public `/gallery/[albumSlug]` album page** — Album hero image, title, description, location, date range. Photo grid (masonry or uniform). Full OG meta (cover image). | Album page renders; OG meta uses cover image; layout mode persisted from index. | 5 | P0 |
| E7-S5 | **Full-screen lightbox** — Opens on photo click. Navigation: `chevron_left` / `chevron_right` Material Icons, keyboard `ArrowLeft` / `ArrowRight`, touch swipe left/right, pinch-to-zoom. `Escape` closes. `f` toggles Fullscreen API. Displays: title, location, EXIF panel (make, model, focal length, aperture, ISO, shutter speed), download link (original resolution). Thumbnail strip (60 px, horizontal scroll, current-position indicator). Preloads next + previous images via `<link rel="prefetch">`. | All navigation methods work; EXIF panel shows data; thumbnail strip scroll-to-current works; preload confirmed in DevTools. | 13 | P0 |
| E7-S6 | **Admin album management** — Create/edit/delete albums (name, slug, description, location, date). Set cover photo from album's photo grid. Drag-and-drop album reorder. Publish/unpublish toggle. | Albums created, reordered, and published; cover photo change reflects on gallery index card. | 5 | P1 |
| E7-S7 | **Admin bulk photo upload** — Upload up to 50 photos per batch with per-file progress indicators. Files processed server-side (image pipeline, E7-S2). Uploaded photos appear in album grid immediately after processing. | 50-file batch uploads with correct progress bars; all photos processed and visible after upload. | 8 | P1 |
| E7-S8 | **Admin photo grid & inline editing** — Photo grid within album: click-to-edit title, alt text, location. Drag-and-drop reorder. Published/hidden toggle per photo. | Inline edits save on blur; reorder persists; hidden photos disappear from public gallery without page reload. | 5 | P1 |

---

## EPIC 8 — AdminJS Panel Setup & Custom Components

**Goal:** Integrate AdminJS into the NestJS backend, register all TypeORM entities as resources, build
the custom stats dashboard component, implement the Markdown editor and Cloudinary media-uploader
custom components, and wire ISR revalidation hooks so every admin save propagates to the live site.

**PRD References:** §8.3 (A-01–A-16), §9.4.3, §9.5.1, §9.5.2

**Total Story Points: 21**

| ID | Story | Acceptance Criteria | SP | Priority |
|----|-------|---------------------|----|----------|
| E8-S1 | **AdminJS bootstrap & entity registration** — Install `adminjs`, `@adminjs/nestjs`, `@adminjs/typeorm`, `@adminjs/bundler`. Create `admin.module.ts` using `AdminModule.createAdminAsync()`. Register all 14 content entities as AdminJS resources with sensible `listProperties`, `editProperties`, and `showProperties` field selections. | Navigating to `/admin` shows AdminJS UI with all 14 entities listed in the sidebar; CRUD works for at least `BlogPost` and `ResumeProfile` end-to-end. | 5 | P0 |
| E8-S2 | **Custom dashboard stats component** — Build `dashboard.tsx` React component (registered via `ComponentLoader`) that fetches counts of published posts, draft posts, total projects, total photos, and total albums via the REST API, and renders them as stat cards. Register as the AdminJS dashboard override. | Dashboard page displays live counts that match DB state; refreshing after content changes reflects updated counts. | 3 | P0 |
| E8-S3 | **Markdown editor custom component** — Build `markdown-editor.tsx` (CodeMirror 6 left pane + Rehype preview right pane, debounced 300 ms). Register it as a custom `edit`/`show` component for the `rawMarkdown` field on `BlogPost` and the `description` field on `Project`. | Split-pane renders on the BlogPost edit page; preview updates within 300 ms of typing; rendered HTML matches the public blog page output. | 5 | P0 |
| E8-S4 | **Cloudinary media-uploader component** — Build `media-uploader.tsx`: multi-file drag-and-drop zone that POSTs to `POST /v1/upload`, renders sortable thumbnails, and emits an ordered array of Cloudinary public IDs. Register on `ProjectMedia` relation within the `Project` resource and on `Photo` bulk-upload within the `Album` resource. | Uploading 3 images stores them in Cloudinary and creates `ProjectMedia` rows with correct `displayOrder`; drag-to-reorder updates order on save; per-file upload progress visible. | 5 | P0 |
| E8-S5 | **ISR revalidation `after` hooks** — Add AdminJS `after` hooks on `new`, `edit`, and `delete` actions for `BlogPost`, `Project`, `ResumeProfile`, `ExperienceEntry`, and `Album` resources. Each hook calls `POST /api/revalidate` on the Next.js app with the appropriate path list and `REVALIDATE_SECRET`. | Publishing a blog post via AdminJS triggers Next.js revalidation; the post is accessible at its public URL within 60 s; no redeployment in the Vercel dashboard. | 3 | P1 |

---

## EPIC 9 — OAT UI Component Library

**Goal:** Scaffold `packages/oat-ui`, build all required primitives and complex components, integrate
`next-themes`, and complete the migration of existing custom components to OAT UI equivalents.

**PRD References:** §9.1.3 (U-01–U-04), G7

**Total Story Points: 31**

| ID | Story | Acceptance Criteria | SP | Priority |
|----|-------|---------------------|----|----------|
| E9-S1 | **Scaffold `packages/oat-ui`** — Initialise package with TypeScript, tsup build, exported `index.ts` barrel, and workspace symlink to `apps/web`. Configure Storybook (optional: `--addons essentials`). | `import { OatButton } from '@portfolio/oat-ui'` resolves in `apps/web`; TypeScript types exported and functional. | 2 | P0 |
| E9-S2 | **Core primitives: Button, Card, Badge, Spinner** — Implement `OatButton` (variant: primary/ghost/destructive), `OatCard` (glass variant), `OatBadge` (skill chips), `OatSpinner`. All accept `className` for Tailwind overrides. All WCAG 2.1 AA compliant (keyboard-operable, ARIA-labelled, focus-ring visible). | Storybook stories pass visual check; axe-core accessibility scan returns no violations. | 5 | P0 |
| E9-S3 | **Form controls: Input, Textarea, Select** — Implement `OatInput`, `OatTextarea`, `OatSelect`. Forward ref, `id`/`name`/`aria-*` props, error state variant, disabled state. | Form controls work with React Hook Form; error states display correctly; keyboard-operable. | 5 | P0 |
| E9-S4 | **OatTabs + OatTabPanel** — Compound component pattern. Controlled and uncontrolled modes. Keyboard: `ArrowLeft`/`ArrowRight` cycles tabs, `Enter`/`Space` selects. ARIA roles: `tablist`, `tab`, `tabpanel`. | Replaces `Hobbies.tsx` custom tab strip; keyboard navigation correct; ARIA roles verified by axe-core. | 3 | P0 |
| E9-S5 | **OatModal** — Accessible, focus-trapped modal dialog. `Escape` to close. Scroll-lock on open. `aria-modal="true"`. Animated enter/exit (CSS transitions). Replaces native `<dialog>` lightbox in `Hobbies.tsx`. | Focus trapped inside modal; `Escape` closes; scroll locked on body; axe-core passes. | 5 | P0 |
| E9-S6 | **OatTable** — Sortable columns (click header to toggle asc/desc), server-side pagination controls, row checkbox multi-select, configurable columns via prop. Used in public-facing data displays (project listing, blog index). | Clicking column header sorts; pagination controls call correct page handler; multi-select returns selected row IDs. | 5 | P1 |
| E9-S7 | **Theme integration via `next-themes`** — Integrate `ThemeProvider` from `next-themes` into `apps/web/app/layout.tsx`. Map existing CSS custom properties (`--primary`, `--background`, `--foreground`, `--glow`, `--gradient-primary`) to OAT UI design tokens in both light and dark theme. Preserve existing `localStorage`-based toggle in `Navigation.tsx` (refactored to use `useTheme`). | Dark/light toggle works; no flash-of-unstyled-content (FOUC) on load; all existing CSS variables resolve in both themes. | 3 | P0 |
| E9-S8 | **Migrate existing components to OAT UI** — Replace: custom `<button>` → `OatButton`, `glass`/`glass-hover` card divs → `OatCard`, `skill-chip` spans → `OatBadge`, `Hobbies.tsx` tab strip → `OatTabs`, native `<dialog>` → `OatModal`, manual spinners → `OatSpinner`. | All replaced components render identically to prior implementation; no regressions on Lighthouse scores; E2E smoke test passes. | 3 | P1 |

---

## EPIC 10 — Non-Functional Requirements & Quality

**Goal:** Meet all NF requirements from §12: Lighthouse ≥ 90, API p95 ≤ 200 ms, security hardening,
≥ 80% unit test coverage on NestJS services, WCAG 2.1 AA compliance, and full Swagger/OpenAPI automation.

**PRD References:** §12 (NF-01–NF-12), §9.5.3, §11.3

**Total Story Points: 32**

| ID | Story | Acceptance Criteria | SP | Priority |
|----|-------|---------------------|----|----------|
| E10-S1 | **Content sanitization** — Apply `rehype-sanitize` with a strict custom allowlist to all user-supplied Markdown output (blog posts, project descriptions) both in the NestJS pipeline (on save) and in the Next.js renderer (on display). | Injecting `<script>alert(1)</script>` into a blog post Markdown field results in the tag stripped from rendered HTML. | 2 | P0 |
| E10-S2 | **Magic-byte file type validation** — In `UploadService`, read the first 12 bytes of every uploaded file and compare against known signatures for `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.mp4`, `.mov`. Reject any mismatch with 422. | Uploading a `.html` file renamed as `.jpg` returns 422; valid `.jpg` passes. | 3 | P0 |
| E10-S3 | **Jest unit tests for all NestJS services** — Write unit tests for `AuthService`, `ResumeService`, `BlogService`, `ProjectsService`, `GalleryService`, `UploadService`. Mock repositories and external dependencies. Target ≥ 80% branch coverage (enforced via Jest `coverageThreshold`). | `yarn test --coverage` passes with branch coverage ≥ 80% for all 6 services; CI gate enforced. | 13 | P0 |
| E10-S4 | **Lighthouse CI automation** — Add `@lhci/cli` to GitHub Actions CI workflow. Run Lighthouse audits against Vercel preview URL on every PR. Fail CI if Performance, Accessibility, Best Practices, or SEO scores < 90 on any public route. | PRs with a performance regression below 90 fail the CI check; passing PRs show green badge. | 3 | P0 |
| E10-S5 | **k6 load testing script** — Write a k6 script targeting all public `GET` endpoints (`/v1/resume`, `/v1/blog`, `/v1/projects`, `/v1/gallery/albums`). Simulate 100 concurrent virtual users for 60 seconds. Assert p95 response time ≤ 200 ms. | k6 run passes all assertions under 100 VU; results documented in `documentation/load-test-results.md`. | 3 | P1 |
| E10-S6 | **robots.txt + security headers** — Add `Disallow: /admin` to Next.js `public/robots.txt`. Set `X-Robots-Tag: noindex` on all `/admin/**` responses via NestJS middleware (E2-S5). Configure `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` headers in `next.config.ts`. | `curl -I` on any `/admin/**` route shows `X-Robots-Tag: noindex`; Googlebot excluded by `robots.txt`; security headers present on public Next.js pages. | 2 | P0 |
| E10-S7 | **HTTPS, CORS, and TLS configuration** — Enforce HTTPS-only in Railway (redirect HTTP → HTTPS). Configure NestJS CORS to allow only `NEXT_PUBLIC_API_URL` origin. Verify TLS 1.2+ via `ssllabs.com` scan. | CORS blocks requests from `http://localhost:9999`; `ssllabs.com` returns A rating; HTTP → HTTPS redirect confirmed. | 2 | P0 |
| E10-S8 | **Swagger/OpenAPI spec export + type-safe client** — Export OpenAPI JSON at build time from NestJS (`nest generate openapi`). Commit to `packages/types/api-spec.json`. Run `openapi-typescript` to generate `packages/types/src/api.d.ts`. Use generated types in `apps/web/lib/api-client.ts` for fully type-safe fetch calls. | `packages/types/src/api.d.ts` contains types for all endpoints; TypeScript errors surface on API contract changes. | 2 | P1 |
| E10-S9 | **TypeScript strict mode + ESLint no-any enforcement** — Enable `"strict": true` in all `tsconfig.json` files across the monorepo. Add `@typescript-eslint/no-explicit-any` as an error. Resolve all existing violations. | `yarn tsc --noEmit` passes with zero errors; `yarn lint` passes with zero `no-explicit-any` violations. | 2 | P0 |

---

## Epic Summary & Sprint Plan

### Story Points by EPIC

| EPIC | Name | Stories | Total SP | Priority P0 SP |
|------|------|---------|----------|----------------|
| E1 | Foundation & Infrastructure | 7 | 20 | 20 |
| E2 | Authentication & Authorization | 6 | 18 | 17 |
| E3 | Data Migration | 5 | 21 | 18 |
| E4 | Dynamic Resume System | 6 | 34 | 29 |
| E5 | Blog Engine | 8 | 50 | 39 |
| E6 | Multimedia Project Showcase | 9 | 52 | 34 |
| E7 | Photography Gallery | 8 | 52 | 39 |
| E8 | AdminJS Panel & Custom Components | 5 | 21 | 16 |
| E9 | OAT UI Component Library | 8 | 31 | 26 |
| E10 | Non-Functional Requirements & Quality | 9 | 32 | 27 |
| **TOTAL** | | **71** | **331** | **265** |

### Sprint Breakdown (25 SP / sprint · 2-week sprints · solo developer)

| Sprint | Focus | Stories | SP |
|--------|-------|---------|-----|
| S01 | Foundation | E1-S1, E1-S2, E1-S3, E1-S4 | 15 |
| S02 | Foundation + Auth | E1-S5, E1-S6, E1-S7, E2-S1, E2-S2 | 14 |
| S03 | Auth + AdminJS session + TypeScript baseline | E2-S3, E2-S4, E2-S5, E2-S6, E10-S9 | 13 |
| S04 | Data Migration — entities + migration | E3-S1, E3-S2, E3-S5 | 10 |
| S05 | Data Migration — seed + validation | E3-S3, E3-S4 | 11 |
| S06 | Resume API + endpoints | E4-S1, E4-S2 | 13 |
| S07 | Resume — Next.js migration + ISR | E4-S3, E4-S5, E10-S1, E10-S2 | 13 |
| S08 | Resume admin forms + NestJS tests (part 1) | E4-S4, E10-S3 (partial) | 14 |
| S09 | Blog API + Markdown pipeline + public pages | E5-S1, E5-S2, E5-S3 | 18 |
| S10 | Blog post page + admin editor | E5-S4, E5-S5 (partial) | 13 |
| S11 | Blog editor (complete) + upload + tags + ISR | E5-S5 (remainder), E5-S6, E5-S7, E5-S8 | 14 |
| S12 | Projects API + public pages | E6-S1, E6-S2, E6-S3 | 21 |
| S13 | Projects carousel + video + admin form | E6-S4, E6-S5, E6-S6 | 18 |
| S14 | Projects media/video admin + typeahead | E6-S7, E6-S8, E6-S9 | 16 |
| S15 | Gallery API + image processing pipeline | E7-S1, E7-S2 | 21 |
| S16 | Gallery public pages + lightbox | E7-S3, E7-S4, E7-S5 (partial) | 18 |
| S17 | Gallery lightbox (complete) + admin | E7-S5 (remainder), E7-S6, E7-S7, E7-S8 | 21 |
| S18 | AdminJS bootstrap + dashboard component | E8-S1, E8-S2 | 8 |
| S19 | AdminJS Markdown editor + media uploader | E8-S3, E8-S4 | 10 |
| S20 | AdminJS ISR hooks + OAT UI scaffold + primitives | E8-S5, E9-S1, E9-S2 | 10 |
| S21 | OAT UI form controls + Tabs + Modal | E9-S3, E9-S4, E9-S5 | 13 |
| S22 | OAT UI Table + theme + migration | E9-S6, E9-S7, E9-S8 | 11 |
| S23 | Quality: Lighthouse CI + k6 + Swagger | E10-S4, E10-S5, E10-S8, E4-S6 | 16 |
| S24 | Quality: tests (complete) + security headers + CORS | E10-S3 (remainder), E10-S6, E10-S7 | 11 |
| **TOTAL** | | **71 stories** | **~331 SP** |

> **Duration estimate:** ~24 sprints × 2 weeks = **~48 weeks (≈ 11 months)** for a single developer
> working at full capacity. With a 2-person team at the same velocity, duration halves to **~6 months**.
> P0-only scope (265 SP) reduces the solo estimate to **~21 sprints (≈ 9 months)**.

---

*End of Document — EPICS-AND-STORIES v1.0.0 · Linked to PRD-001 v1.0.0*
