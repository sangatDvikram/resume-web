# Product Requirements Document
## Portfolio & Content Management System Platform
### Evolution of `resume-web` → Full-Stack Dynamic Platform

---

| Field            | Value                                                        |
|------------------|--------------------------------------------------------------|
| **Document ID**  | PRD-001                                                      |
| **Version**      | 1.0.0                                                        |
| **Status**       | Draft                                                        |
| **Author**       | Vikram Sangat                                                |
| **Created**      | 2026-05-03                                                   |
| **Last Updated** | 2026-05-03                                                   |
| **Repository**   | `resume-web` (current) → `portfolio-cms` (target)           |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Non-Goals](#3-goals--non-goals)
4. [High-Level Architecture](#4-high-level-architecture)
5. [Module 1 — Markdown-Based Blog Engine](#5-module-1--markdown-based-blog-engine)
6. [Module 2 — Multimedia Project Showcase](#6-module-2--multimedia-project-showcase)
7. [Module 3 — Photography Gallery](#7-module-3--photography-gallery)
8. [Module 4 — Dynamic Resume System & Admin CMS](#8-module-4--dynamic-resume-system--admin-cms)
9. [Module 5 — Technical Architecture](#9-module-5--technical-architecture)
   - [9.1 Monorepo & Project Structure](#91-monorepo--project-structure)
   - [9.2 API Contract](#92-api-contract)
   - [9.3 Database Schema](#93-database-schema)
   - [9.4 Authentication & Authorization](#94-authentication--authorization)
   - [9.5 Frontend Stack](#95-frontend-stack)
   - [9.6 Backend Stack (NestJS)](#96-backend-stack-nestjs)
10. [Migration Path](#10-migration-path)
11. [Zero-Redeploy Content Strategy](#11-zero-redeploy-content-strategy)
12. [Non-Functional Requirements](#12-non-functional-requirements)
13. [Deployment & Infrastructure](#13-deployment--infrastructure)
14. [Acceptance Criteria](#14-acceptance-criteria)
15. [Appendix — Data Mapping from `constants/index.tsx`](#15-appendix--data-mapping-from-constantsindextsx)

---

## 1. Executive Summary

The `resume-web` project is currently a **static React 18 / Vite single-page application** that renders a personal portfolio from hardcoded TypeScript constants (`src/constants/index.tsx`). While functional, the architecture imposes a fundamental constraint: every content change — updating a job title, adding a new project, publishing a blog post — requires a **code edit, a build, and a full CI/CD redeploy**.

This PRD defines the requirements for evolving `resume-web` into a **Portfolio & Content Management System (CMS)**: a full-stack platform backed by a persistent database, exposing a RESTful API, and governed by a secure Admin Dashboard. The end state is a dynamic, SEO-optimised, content-rich site that can be updated in real time without touching source code.

### Target Stack at a Glance

| Layer         | Current                       | Target                                    |
|---------------|-------------------------------|-------------------------------------------|
| Frontend      | React 18 + Vite + Tailwind    | Next.js 15 (App Router) + Tailwind + OAT UI |
| Backend       | None (static)                 | NestJS 10 + PostgreSQL                    |
| CMS           | Hardcoded `constants/index.tsx` | Admin Dashboard → REST API → PostgreSQL  |
| Hosting       | Vercel (static)               | Vercel (frontend) + Railway/Render (API) |
| Auth          | None                          | JWT (RS256) + HTTP-only refresh cookies   |

---

## 2. Problem Statement

### 2.1 Current Limitations

The existing `resume-web` codebase (commit baseline: May 2026) has the following structural constraints that prevent sustainable content management at scale:

**Content is compile-time only.** All personal data — `RESUME.experience`, `RESUME.projects`, `RESUME.hobbies`, `PROFILE.description`, `yearsOfExperience()` — is computed from TypeScript objects in `src/constants/index.tsx`. Any change requires a developer to edit source files and trigger a new build.

**No blog or long-form content support.** There is no mechanism to write, store, or render Markdown articles. A blog is a high-value SEO surface that the current architecture entirely lacks.

**Photography is confined to a hobby tab.** The `Hobbies.tsx` component implements a minimal 6-image grid with a basic `<dialog>`-based lightbox. It cannot scale to a gallery with hundreds of high-fidelity assets, album groupings, or advanced navigation.

**No multimedia project walkthroughs.** `FreelanceProjects.tsx` renders static text bullets. There is no support for image carousels, embedded demo videos, or live-preview screenshots on the project cards visible in `RESUME.projects`.

**No access control.** The site is fully public. There is no authenticated surface for adding, editing, or archiving content without code changes.

**OAT UI migration is incomplete.** The comment in `src/constants/index.tsx` explicitly states: *"preparing the data structure for Oat UI migration"*. The migration stalled because no server-side data layer existed to drive the new component contracts.

### 2.2 Opportunity

Resolving these constraints positions the portfolio as a living, professionally managed platform — one that demonstrates full-stack engineering competency, serves as an SEO content engine through the blog, and requires zero developer intervention to stay current.

---

## 3. Goals & Non-Goals

### 3.1 Goals

| # | Goal |
|---|------|
| G1 | Migrate all hardcoded content from `src/constants/index.tsx` into a PostgreSQL database accessible via a NestJS REST API. |
| G2 | Build a Markdown blog engine with live-preview authoring, syntax highlighting, front-matter metadata, and server-side rendering for SEO. |
| G3 | Expand the project showcase into a rich multimedia module with image carousels and embedded video walkthroughs. |
| G4 | Evolve the `Hobbies.tsx` photography tab into a standalone, full-site Photography Gallery module with masonry layout, lightbox, and advanced lazy-loading. |
| G5 | Deliver a secure Admin Dashboard for CRUD operations on all content domains (resume entries, projects, blog posts, gallery photos). |
| G6 | Guarantee zero-redeploy content updates: changes made in the Admin Dashboard are served by the API and reflected on the live site without new deployments. |
| G7 | Complete the OAT UI component migration for standardised UI primitives across the Next.js frontend. |
| G8 | Implement JWT-based authentication (RS256) with HTTP-only refresh cookies to secure the Admin Dashboard. |
| G9 | Define a clear, versioned REST API contract between the Next.js frontend and the NestJS backend. |
| G10 | Achieve Lighthouse scores ≥ 90 on Performance, Accessibility, Best Practices, and SEO for all public-facing routes. |

### 3.2 Non-Goals

| # | Non-Goal | Rationale |
|---|----------|-----------|
| NG1 | Multi-tenant CMS (supporting multiple authors/portfolios) | Single-owner platform; multi-tenancy adds complexity without value here. |
| NG2 | Native mobile application | The responsive web application is sufficient. |
| NG3 | E-commerce or payment processing | Out of scope for a portfolio platform. |
| NG4 | Real-time collaborative editing | Single admin user; no collaboration requirement. |
| NG5 | Video hosting / CDN infrastructure | Videos are embedded from YouTube, Vimeo, or a third-party CDN. |
| NG6 | i18n / multi-language support | English-only in v1. |

---

## 4. High-Level Architecture

### 4.1 Monorepo Structure

The project is restructured as a **Yarn Workspace + Lerna monorepo** under the root `portfolio-cms/` directory:

```
portfolio-cms/
├── apps/
│   ├── web/                        # Next.js 15 frontend (public site only)
│   │   ├── app/
│   │   │   └── (public)/           # Public-facing routes (SSR/SSG/ISR)
│   │   │       ├── page.tsx        # Home / portfolio landing
│   │   │       ├── blog/           # Blog index + [slug] post pages
│   │   │       ├── projects/       # Project showcase index + [slug]
│   │   │       ├── gallery/        # Photography gallery module
│   │   │       └── resume/         # Resume print/download page
│   │   ├── components/
│   │   │   ├── ui/                 # OAT UI primitives (Button, Card, etc.)
│   │   │   ├── blog/               # Blog-specific components
│   │   │   ├── gallery/            # Gallery-specific components
│   │   │   └── resume/             # Resume display components
│   │   └── lib/
│   │       ├── api-client.ts       # Type-safe fetch wrapper for NestJS API
│   │       └── markdown.ts         # Unified/Rehype/Remark pipeline config
│   └── api/                        # NestJS backend service (API + AdminJS)
│       ├── src/
│       │   ├── admin/              # AdminJS setup, entity registration, custom components
│       │   │   ├── admin.module.ts # AdminModule.createAdminAsync() configuration
│       │   │   └── components/     # Custom AdminJS React components
│       │   │       ├── markdown-editor.tsx  # Split-pane Markdown editor component
│       │   │       └── media-uploader.tsx   # Cloudinary drag-and-drop uploader component
│       │   ├── auth/               # JWT strategy, Passport guards, decorators
│       │   ├── blog/               # Blog posts module (CRUD)
│       │   ├── projects/           # Projects module (CRUD + media refs)
│       │   ├── gallery/            # Gallery & albums module
│       │   ├── resume/             # Resume data module
│       │   │   ├── experience/     # Work experience entries
│       │   │   ├── education/      # Education entries
│       │   │   ├── skills/         # Languages, frameworks, tools
│       │   │   └── patents/        # Patent records
│       │   ├── upload/             # Multipart image upload → Cloudinary
│       │   └── common/             # Interceptors, filters, DTOs, validators
│       └── src/
│           ├── entities/           # TypeORM entity classes (shared across modules)
│           ├── migrations/         # Auto-generated TypeORM migration files
│           └── database/
│               └── data-source.ts  # TypeORM DataSource config (used by migration CLI)
├── packages/
│   ├── oat-ui/                     # Shared OAT UI component library
│   ├── types/                      # Shared TypeScript interfaces / API contracts
│   └── eslint-config/              # Shared ESLint configuration
├── package.json                    # Yarn workspace root
├── lerna.json                      # Lerna configuration (useWorkspaces: true)
└── .yarnrc.yml                     # Yarn Berry configuration
```

### 4.2 Service Topology

```
┌──────────────────────────────────────────────────────────────┐
│                     Browser / CDN Edge                        │
│  ┌────────────────────────────────────────────────────────┐  │
│  │           Next.js 15  (Vercel Edge Network)            │  │
│  │  ┌────────────────────────────┐  ┌────────────────────┐  │  │
│  │  │       Public Pages         │  │    API Routes      │  │  │
│  │  │  (SSR / ISR / SSG)         │  │  /api/revalidate   │  │  │
│  │  └───────────┬────────────────┘  └─────────┬──────────┘  │  │
│  └──────────────┼───────────────────────────────┼────────────┘  │
└─────────────────┼───────────────────────────────┼───────────────┘
                  │ server fetch                   │ proxy
                  ▼                                ▼
┌──────────────────────────────────────────────────────────────┐
│         NestJS REST API + AdminJS  (Railway / Render)         │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌───────────────┐  │
│  │   Auth   │ │   Blog   │ │ Projects  │ │ Resume/Skills │  │
│  │ /v1/auth │ │ /v1/blog │ │ /v1/proj  │ │  /v1/resume   │  │
│  └────┬─────┘ └────┬─────┘ └─────┬─────┘ └──────┬────────┘  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │        AdminJS  (/admin)  — session-auth, CRUD UI        │ │
│  └──────────────────────────────────────────────────────────┘ │
│       └────────────┴─────────────┴───────────────┘           │
│                          TypeORM                              │
└──────────────────────────────┬───────────────────────────────┘
                               ▼
                     ┌──────────────────┐
                     │   PostgreSQL      │
                     │ (Supabase / RDS)  │
                     └──────────────────┘
                               │
                     ┌──────────────────┐
                     │    Cloudinary     │
                     │  (Media CDN +     │
                     │ Image Processing) │
                     └──────────────────┘
```

### 4.3 Rendering Strategy by Route

| Route Pattern         | Strategy                  | Rationale                                                                              |
|-----------------------|---------------------------|----------------------------------------------------------------------------------------|
| `/`                   | ISR (revalidate: 60 s)    | Resume data changes infrequently; serve cached shell for performance.                  |
| `/blog`               | ISR (revalidate: 60 s)    | Post list invalidated via on-demand revalidation webhook on publish/unpublish.         |
| `/blog/[slug]`        | SSG + on-demand revalidate| Individual posts pre-generated at build; re-generated on CMS save without full deploy. |
| `/projects`           | ISR (revalidate: 60 s)    | Same pattern as blog index.                                                            |
| `/projects/[slug]`    | SSG + on-demand revalidate| Same as blog posts.                                                                    |
| `/gallery`            | SSR                       | Albums and photos are user-managed dynamic content; no stale serving.                  |
| `/resume`             | Static (build-time)       | On-demand revalidation triggered from AdminJS after hook fires on resume entity save.  |
| `/admin/**`           | Served by NestJS (AdminJS)| Session-authenticated; served directly from the NestJS process — not part of Next.js.  |
| `/v1/docs`            | Served by NestJS (Swagger)| OpenAPI 3.1 UI; available in development and staging only.                              |

---

## 5. Module 1 — Markdown-Based Blog Engine

### 5.1 Overview

A first-class blogging system that allows the admin to write long-form technical articles in Markdown with a rich live preview, publish them with structured metadata, and have them served as SEO-optimised, server-rendered HTML pages — with no code changes or redeployments.

### 5.2 Functional Requirements

#### 5.2.1 Markdown Editor (Admin Dashboard)

| ID   | Requirement |
|------|-------------|
| B-01 | The editor MUST provide a **split-pane interface**: a raw Markdown text input on the left and a live rendered HTML preview on the right, updating within 300 ms of each keystroke. |
| B-02 | The editor MUST support **full CommonMark** syntax plus GitHub Flavored Markdown (GFM) extensions: tables, task lists, strikethrough, and autolinks. |
| B-03 | The editor MUST render **fenced code blocks** with syntax highlighting using the **Rehype Pretty Code** plugin (backed by Shiki) supporting at minimum: `javascript`, `typescript`, `python`, `bash`, `json`, `sql`, `css`, `html`, `dart`, and `php`. |
| B-04 | The editor MUST support **front-matter** as a YAML block at the top of each document, parsed by `gray-matter`. The following fields are required: `title`, `slug`, `date`, `tags` (array), `excerpt`, `coverImage`, `published` (boolean). |
| B-05 | A **reading time estimator** MUST compute and display estimated reading time (words ÷ 200 wpm) live within the editor and persist the value as `readingTime` in the database. |
| B-06 | The editor MUST support **image insertion** via drag-and-drop or a file picker, uploading to **Cloudinary** via `POST /v1/upload` and inserting the returned Cloudinary CDN URL as a Markdown image reference. |
| B-07 | The editor MUST provide a **tag management** UI: a typeahead input that auto-completes from existing tags stored in the database and allows creating new tags inline. |
| B-08 | Draft posts MUST be saveable without publishing (`published: false`). A "Publish" action sets `published: true` and triggers on-demand ISR revalidation for `/blog` and `/blog/[slug]`. |

#### 5.2.2 Public Blog Pages (Frontend)

| ID   | Requirement |
|------|-------------|
| B-09 | `/blog` MUST render a paginated index of published posts (20 per page) sorted by `date` descending, displaying: cover image, title, excerpt, tags, date, and reading time. |
| B-10 | `/blog/[slug]` MUST render the full post using **server-side Markdown processing** via the Unified/Remark/Rehype pipeline — never client-side — so that search engines receive fully rendered HTML. |
| B-11 | Each post page MUST inject full **Open Graph** and **Twitter Card** meta tags: `og:title`, `og:description`, `og:image` (cover image), `og:type: article`, `article:published_time`, `article:tag`. |
| B-12 | Each post page MUST include **JSON-LD structured data** (`schema.org/BlogPosting`) with: `headline`, `author`, `datePublished`, `dateModified`, `image`, `keywords`. |
| B-13 | A **table of contents** component MUST be auto-generated from `##` and `###` headings and rendered as a sticky sidebar on screens ≥ 1024 px wide. |
| B-14 | Related posts (up to 3, matched by shared tags) MUST be rendered in a card grid at the bottom of each post page. |
| B-15 | The blog MUST support **tag-filtered views** at `/blog?tag=<tag-name>` (ISR, revalidated with the tag index). |

### 5.3 Data Model (Preview — full schema in §9.3)

```
BlogPost
  id            UUID PK
  slug          TEXT UNIQUE NOT NULL
  title         TEXT NOT NULL
  excerpt       TEXT
  coverImageUrl TEXT
  rawMarkdown   TEXT NOT NULL
  htmlContent   TEXT NOT NULL   -- server-rendered HTML cache
  readingTime   INTEGER         -- minutes (rounded up)
  published     BOOLEAN DEFAULT false
  publishedAt   TIMESTAMPTZ
  updatedAt     TIMESTAMPTZ
  tags          Tag[] (many-to-many via PostTag join table)
```

### 5.4 Technology Selections

| Concern              | Library / Tool                        | Justification |
|----------------------|---------------------------------------|---------------|
| Markdown parsing     | `unified` + `remark-gfm`             | Industry standard; extensible plugin pipeline. |
| HTML transformation  | `rehype-pretty-code` + Shiki          | Zero-runtime syntax highlighting; outputs static HTML. |
| Front-matter parsing | `gray-matter`                         | Battle-tested YAML/TOML front-matter parser. |
| Editor widget        | `@uiw/react-md-editor` or `CodeMirror 6` | Split-pane preview; keyboard shortcuts. |
| Reading time         | `reading-time`                        | Lightweight npm utility; ~500 bytes. |
| Image storage & CDN  | Cloudinary                            | Built-in CDN, on-the-fly image transformations (resize, crop, format), EXIF extraction, and LQIP generation via URL parameters. 25 GB free tier. |

---


## 6. Module 2 — Multimedia Project Showcase

### 6.1 Overview

The current `FreelanceProjects.tsx` and `RESUME.projects` array is a plain text list. This module elevates the project showcase to a rich, media-first experience: each project entry can carry a high-resolution image carousel, embedded video walkthroughs, and structured metadata fields that map directly to the existing `RESUME.frameworks`, `RESUME.languages`, and `RESUME.databases` skill taxonomy.

### 6.2 Functional Requirements

#### 6.2.1 Project Card & Index (`/projects`)

| ID   | Requirement |
|------|-------------|
| P-01 | `/projects` MUST render a responsive grid of project cards (1 column on mobile, 2 on tablet, 3 on desktop). Each card MUST display: thumbnail (first carousel image), project title, company/client name, brief description, primary tech stack chips, and a CTA linking to `/projects/[slug]`. |
| P-02 | Projects MUST be filterable by technology tag (populated from `RESUME.frameworks`, `RESUME.languages`, and `RESUME.databases` — the existing taxonomy in `src/constants/index.tsx`). Filtering MUST occur client-side with no page reload. |
| P-03 | Projects MUST be sortable by: most recent first (default), alphabetical, and featured (admin-curated order). |
| P-04 | The index page MUST support an "Featured Projects" section above the main grid, rendering up to 3 admin-flagged projects in a larger hero card format. |

#### 6.2.2 Project Detail Page (`/projects/[slug]`)

| ID   | Requirement |
|------|-------------|
| P-05 | The detail page MUST render an **image carousel** using Embla Carousel (already a dependency: `embla-carousel-react ^8.6.0`) supporting: keyboard arrow navigation, swipe on touch devices, autoplay (configurable per project), and a dot indicator. Images MUST be stored in and served from **Cloudinary**, with responsive variants delivered via Cloudinary URL transformation parameters. |
| P-06 | If a project has one or more video walkthroughs, the page MUST embed them in a tabbed or sequenced player. Supported sources: **YouTube** (`youtube.com/watch?v=...`), **Vimeo** (`vimeo.com/...`), and **self-hosted** (uploaded `.mp4` served via CDN). The embed MUST be lazy-loaded (Intersection Observer) and MUST NOT block page LCP. |
| P-07 | The detail page MUST display a structured metadata section containing: **Role** (e.g. "Lead Frontend Engineer"), **Timeline** (start/end dates), **Tech Stack** (chips matching the existing `RESUME.frameworks` / `RESUME.languages` taxonomy), **Category** (e.g. Web App, Mobile, Data), **GitHub URL** (optional), and **Live Demo URL** (optional). |
| P-08 | The page MUST render a long-form project description authored in Markdown (same Unified/Rehype pipeline as the Blog Engine, §5). |
| P-09 | Each project page MUST include JSON-LD structured data (`schema.org/SoftwareApplication` or `schema.org/CreativeWork`) and full OG/Twitter Card meta tags. |
| P-10 | A "Related Projects" section (up to 3, matched by shared tech stack tags) MUST appear at the bottom of each detail page. |

#### 6.2.3 Admin — Project CRUD

| ID   | Requirement |
|------|-------------|
| P-11 | The admin MUST be able to create, edit, reorder, publish/unpublish, and delete project entries via the AdminJS panel at `/admin`. |
| P-12 | Media management: The admin MUST be able to upload, reorder, and delete carousel images (multi-file upload with drag-and-drop reordering using a sortable list). |
| P-13 | Video entries MUST accept a URL (YouTube / Vimeo) or a direct file upload (self-hosted), with a title and description field per video. |
| P-14 | A **"Featured" toggle** per project MUST control whether the project appears in the featured strip on the index page. |
| P-15 | Tech stack chips MUST be driven by a multi-select typeahead bound to the same `Skill` records used by the Resume module, ensuring terminology consistency across the platform. |

### 6.3 Data Model (Preview — full schema in §9.3)

```
Project
  id              UUID PK
  slug            TEXT UNIQUE NOT NULL
  title           TEXT NOT NULL
  company         TEXT
  role            TEXT
  startDate       DATE
  endDate         DATE
  description     TEXT              -- Markdown source
  htmlDescription TEXT              -- Rendered HTML cache
  githubUrl       TEXT
  liveDemoUrl     TEXT
  featured        BOOLEAN DEFAULT false
  published       BOOLEAN DEFAULT false
  sortOrder       INTEGER DEFAULT 0
  skills          Skill[] (many-to-many via ProjectSkill)
  media           ProjectMedia[]    -- ordered carousel images
  videos          ProjectVideo[]    -- walkthrough videos

ProjectMedia
  id        UUID PK
  projectId UUID FK → Project
  url       TEXT NOT NULL           -- CDN URL
  altText   TEXT
  sortOrder INTEGER DEFAULT 0

ProjectVideo
  id        UUID PK
  projectId UUID FK → Project
  source    ENUM('youtube','vimeo','self_hosted')
  url       TEXT NOT NULL
  title     TEXT
  sortOrder INTEGER DEFAULT 0
```

---

## 7. Module 3 — Photography Gallery

### 7.1 Overview

The `Hobbies.tsx` photography tab currently renders 6 placeholder images in a fixed 3-column grid with a native `<dialog>` lightbox. This module extracts and expands photography into a **standalone, full-site gallery** at `/gallery`, supporting albums, hundreds of high-fidelity assets, responsive masonry/grid layouts, full-screen lightbox navigation with Material Icons, and aggressive lazy-loading.

### 7.2 Functional Requirements

#### 7.2.1 Gallery Index (`/gallery`)

| ID   | Requirement |
|------|-------------|
| G-01 | `/gallery` MUST render an **album grid** — each album represented by a card showing: cover thumbnail, album name, photo count, and location/date tag. |
| G-02 | A **"All Photos"** view MUST exist alongside the album grid, displaying all published photos in a single masonry layout. |
| G-03 | The layout MUST switch between **masonry** (Pinterest-style variable-height columns) and **uniform grid** (equal-aspect-ratio tiles) modes, persisted to `localStorage`. |
| G-04 | The masonry layout MUST support **2 columns on mobile**, **3 on tablet**, and **4 on desktop** with configurable gutter sizes via Tailwind utilities. |
| G-05 | Gallery pages MUST support **infinite scroll** pagination (cursor-based): new photos load automatically as the user scrolls within 200 px of the bottom, with a spinner indicator during loading. |

#### 7.2.2 Album Detail (`/gallery/[albumSlug]`)

| ID   | Requirement |
|------|-------------|
| G-06 | Album pages MUST display: album hero image, album title, description, location, date range, and the photo grid (masonry or uniform). |
| G-07 | Albums MUST be shareable with canonical URLs (`/gallery/[slug]`) and full OG meta tags (using the album cover image). |

#### 7.2.3 Lightbox Navigation

| ID   | Requirement |
|------|-------------|
| G-08 | Clicking any photo MUST open a **full-screen lightbox overlay** rendering the highest-resolution available version of the image. |
| G-09 | Lightbox navigation MUST use **Material Icons** (already installed: `material-icons ^1.13.14`) for `chevron_left`, `chevron_right`, and `close` controls. |
| G-10 | Lightbox MUST support keyboard navigation: `ArrowLeft` / `ArrowRight` to move between photos, `Escape` to close, `f` to toggle full-screen via the Fullscreen API. |
| G-11 | The lightbox MUST display: photo title, location, camera metadata (EXIF data if available: make, model, focal length, aperture, ISO, shutter speed), and a download link for the original resolution asset. |
| G-12 | The lightbox MUST support **touch gestures** on mobile: swipe left/right to navigate, pinch-to-zoom on the current image. |
| G-13 | A **thumbnail strip** (horizontal scroll, 60 px height) MUST be rendered at the bottom of the lightbox, indicating current position and allowing direct jump to any photo. |

#### 7.2.4 Lazy-Loading & Performance

| ID   | Requirement |
|------|-------------|
| G-14 | All gallery thumbnails MUST use Next.js `<Image>` with `loading="lazy"` and `sizes` attribute. Responsive variants at 400 w, 800 w, 1200 w, and 2400 w MUST be delivered via Cloudinary URL transformation parameters (e.g. `/w_800,c_limit,f_auto,q_auto/`) using a custom Next.js Cloudinary image loader. |
| G-15 | A **Low Quality Image Placeholder (LQIP)** MUST be generated at upload time by constructing a Cloudinary `e_blur:2000,q_1,f_auto` transformation URL from the asset's `publicId`. This URL is stored as `lqipUrl` in the `Photo` entity and passed as the `blurDataURL` of `<Image>`, providing a smooth progressive load experience without any server-side image processing. |
| G-16 | Lightbox MUST preload the next and previous images (`<link rel="prefetch">`) while the current image is displayed. |
| G-17 | The gallery page MUST achieve a First Contentful Paint (FCP) ≤ 1.5 s and Largest Contentful Paint (LCP) ≤ 2.5 s on a simulated 4G connection per Lighthouse audit. |

#### 7.2.5 Admin — Gallery CRUD

| ID   | Requirement |
|------|-------------|
| G-18 | The admin MUST be able to create and manage albums: set album name, cover photo, description, location, and date. |
| G-19 | The admin MUST be able to upload photos in bulk (up to 50 per batch) with progress indicators per file. |
| G-20 | Uploaded images MUST be automatically processed via the **Cloudinary Upload API**: EXIF metadata is returned in the upload response, a Low Quality Image Placeholder (LQIP) is generated using Cloudinary's `e_blur:2000,q_1,f_auto` transformation, and responsive breakpoints (400 w, 800 w, 1200 w, 2400 w) are delivered on-the-fly via Cloudinary URL transformation parameters — no server-side resize required. |
| G-21 | Photos MUST support drag-and-drop reordering within an album via a sortable grid interface. |
| G-22 | Individual photos MUST support metadata editing: title, location, alt text, EXIF override fields, and published/hidden toggle. |

### 7.3 Data Model (Preview — full schema in §9.3)

```
Album
  id          UUID PK
  slug        TEXT UNIQUE NOT NULL
  name        TEXT NOT NULL
  description TEXT
  location    TEXT
  coverId     UUID FK → Photo
  published   BOOLEAN DEFAULT false
  sortOrder   INTEGER DEFAULT 0

Photo
  id          UUID PK
  albumId     UUID FK → Album (nullable — unassigned photos)
  title       TEXT
  altText     TEXT
  location    TEXT
  originalUrl TEXT NOT NULL         -- Full-resolution CDN URL
  thumbUrl    TEXT NOT NULL         -- Cloudinary 400w transformation URL
  lqipUrl     TEXT                  -- Cloudinary LQIP URL (e_blur:2000,q_1,f_auto)
  width       INTEGER
  height      INTEGER
  exif        JSONB                 -- {make, model, focalLength, aperture, iso, shutterSpeed}
  sortOrder   INTEGER DEFAULT 0
  published   BOOLEAN DEFAULT true
```

---


## 8. Module 4 — Dynamic Resume System & Admin CMS

### 8.1 Overview

The current system stores all resume data as hardcoded TypeScript objects in `src/constants/index.tsx`. This module defines the **migration path** from that static structure to a fully database-backed, API-driven resume system, the **Admin Dashboard** for CRUD operations across all content domains, and the **zero-redeploy update strategy**.

---

### 8.2 Migration Path: `src/constants/index.tsx` → PostgreSQL

The migration is executed in three phases to maintain zero downtime.

#### Phase 1 — Schema & Seed (Week 1–2)

1. **Define the TypeORM entity classes** (§9.3) covering all entities: `ResumeProfile`, `ExperienceEntry`, `EducationEntry`, `Skill`, `Patent`, `Certification`, `Award`, `Project`, `BlogPost`, `Album`, `Photo`.
2. **Write a one-time seed script** (`src/seeds/seed.ts` using `typeorm-extension`) that reads every field from `src/constants/index.tsx` and upserts rows into the corresponding tables via TypeORM repositories. The seed is idempotent (uses `save()` with conflict-aware upsert logic).
3. **Key field mappings** from `src/constants/index.tsx`:

| Constant Field                     | Database Table → Column                        |
|------------------------------------|------------------------------------------------|
| `RESUME.name`                      | `ResumeProfile.name`                          |
| `RESUME.position`                  | `ResumeProfile.position`                      |
| `RESUME.description`               | `ResumeProfile.description`                   |
| `RESUME.email`                     | `ResumeProfile.email`                         |
| `RESUME.mobile`                    | `ResumeProfile.phone`                         |
| `RESUME.address`                   | `ResumeProfile.location`                      |
| `RESUME.linkedIn`                  | `ResumeProfile.linkedInUrl`                   |
| `RESUME.github`                    | `ResumeProfile.githubUrl`                     |
| `RESUME.gravatar`                  | `ResumeProfile.avatarUrl`                     |
| `RESUME.languages[]`               | `Skill` rows (`category: 'language'`)         |
| `RESUME.frameworks[]`              | `Skill` rows (`category: 'framework'`)        |
| `RESUME.databases[]`               | `Skill` rows (`category: 'database'`)         |
| `RESUME.tools[]`                   | `Skill` rows (`category: 'tool'`)             |
| `RESUME.experience[]`              | `ExperienceEntry` rows                        |
| `RESUME.experience[].techStack[]`  | `ExperienceEntry` ↔ `Skill` (many-to-many)   |
| `RESUME.education[]`               | `EducationEntry` rows                         |
| `RESUME.certifications[]`          | `Certification` rows                          |
| `RESUME.awards[]`                  | `Award` rows                                  |
| `RESUME.patents[]`                 | `Patent` rows                                 |
| `RESUME.projects[]`                | `Project` rows (seeded as published entries) |
| `RESUME.hobbies.photos[]`          | `Photo` rows (seeded into a default album)   |
| `CAREER_START_DATE`                | `ResumeProfile.careerStartDate`               |
| `yearsOfExperience()` (computed)   | Computed at API response time; not stored.    |

4. **Validate the seed** by running both the legacy static rendering and the new API-driven rendering side-by-side and comparing outputs. All experience entries, education items, and skill lists MUST match exactly.

#### Phase 2 — API-Driven Frontend (Week 3–4)

1. Deploy the NestJS API with all resume endpoints live (see §9.2).
2. Update Next.js server components to fetch from the API instead of importing `src/constants/index.tsx`. The legacy file remains as a fallback during transition.
3. The `yearsOfExperience()` logic (currently computed by `intervalToDuration` in `date.ts`) is re-implemented as a **utility function in the NestJS API response** — the API returns both `careerStartDate` and a pre-computed `yearsOfExperience` string so the frontend remains stateless.
4. Run Lighthouse audits on all migrated pages to confirm there is no regression in LCP, CLS, or SEO scores.

#### Phase 3 — Remove Static Constants (Week 5)

1. Delete or archive `src/constants/index.tsx` (retain `calculateDuration` and `yearsOfExperience` utilities in a shared `packages/utils` workspace package for use in the PDF/LaTeX generator).
2. Update the LaTeX resume generator (`src/utils/generateLatex.ts`) to fetch from the API instead of importing constants, or pre-populate from an API snapshot at build time.
3. Remove all direct imports of `RESUME`, `PROFILE`, `CAREER_START_DATE`, `LINKEDIN_URL`, `gravatar()` etc. across all components.

---

### 8.3 Admin Dashboard (AdminJS)

The Admin Dashboard is powered by **[AdminJS](https://adminjs.co)** (`adminjs` + `@adminjs/nestjs` + `@adminjs/typeorm`), mounted directly on the NestJS server at `/admin`. AdminJS auto-generates a full CRUD UI from the TypeORM entity classes, eliminating the need for a custom Next.js admin app. Authentication is session-based (HTTP-only cookie) using AdminJS's built-in `authenticate` hook backed by the `AdminUser` entity.

#### 8.3.1 AdminJS Setup & Authentication

| ID   | Requirement |
|------|-------------|
| A-01 | AdminJS MUST be registered via `AdminModule.createAdminAsync()` in `apps/api/src/admin/admin.module.ts`, with all 14 content entities (`ResumeProfile`, `ExperienceEntry`, `EducationEntry`, `Skill`, `Patent`, `Certification`, `Award`, `BlogPost`, `Tag`, `Project`, `ProjectMedia`, `ProjectVideo`, `Album`, `Photo`) registered as resources. |
| A-02 | Authentication MUST use AdminJS's `authenticate` function: validates email + bcrypt password against the `AdminUser` entity. On success, AdminJS issues a **session cookie** (HTTP-only, Secure). The `/admin` path MUST be excluded from `robots.txt` and set `X-Robots-Tag: noindex`. |
| A-03 | The AdminJS dashboard landing page MUST be customised with a **summary stats component** (total blog posts published/drafts, total projects, total photos, total albums) rendered as a custom AdminJS React dashboard component. |

#### 8.3.2 Auto-Generated CRUD (AdminJS)

The following requirements are satisfied **automatically** by AdminJS entity registration with appropriate field configuration:

| ID   | Requirement | AdminJS Feature Used |
|------|-------------|----------------------|
| A-04 | Edit profile information (name, position, description, contact, avatar URL). | `edit` view auto-generated from `ResumeProfile` entity columns. |
| A-05 | Experience CRUD: title, company, location, dates, `isCurrent` toggle, tasks array. | `edit`/`list` views from `ExperienceEntry`; `isCurrent` rendered as checkbox. |
| A-06 | Education, certifications, awards — independent CRUD forms. | Separate AdminJS resources per entity. |
| A-07 | Skills CRUD with category filter. | `Skill` resource with `category` enum rendered as select. |
| A-08 | Patents CRUD: title, patent link, URL. | `Patent` resource auto-generated. |
| A-10 | Blog post list table: title, status, tags, dates, actions. | `list` view for `BlogPost`; `published` as toggle; `tags` as relation display. |
| A-11 | Bulk publish / unpublish / delete selected posts. | AdminJS built-in **bulk actions**. |
| A-13 | Project table with "Featured" toggle and media count. | `list` view for `Project`; `featured` as checkbox; `media` count via computed property. |
| A-15 | Album management: create/edit/delete, cover photo, publish toggle. | `Album` resource; `coverId` as relation select. |

#### 8.3.3 Custom AdminJS Components

The following require **custom React components** registered with `ComponentLoader` and bundled by AdminJS:

| ID   | Requirement | Custom Component |
|------|-------------|-----------------|
| A-09 | All resume/blog/project saves MUST trigger on-demand Next.js ISR revalidation. | AdminJS `after` hook in each resource calls `POST /api/revalidate` internally after every `new`/`edit`/`delete` action. |
| A-12 | Markdown editor with split-pane live preview for blog posts and project descriptions. | `markdown-editor.tsx` — CodeMirror 6 left pane + Rehype preview right pane (debounced 300 ms), registered as a custom `show`/`edit` component for `rawMarkdown` field. |
| A-14 | Image carousel uploader with drag-and-drop reorder for project media. | `media-uploader.tsx` — multi-file Cloudinary upload, sortable list, registered as custom component for `ProjectMedia` relation within the `Project` resource. |
| A-16 | Bulk photo upload with per-file progress for gallery. | `media-uploader.tsx` reused on `Photo` resource bulk upload; progress via `XMLHttpRequest` upload events. |

---

### 8.4 Zero-Redeploy Content Strategy

The platform MUST guarantee that **content changes in the Admin Dashboard are live on the public site within 60 seconds** without triggering any CI/CD pipeline, build process, or deployment.

The mechanism is Next.js **On-Demand Incremental Static Regeneration**:

```
Admin Dashboard
      │  PATCH /v1/blog/:id  { published: true }
      ▼
NestJS API
      │  After DB write, calls Next.js revalidation endpoint:
      │  POST https://portfolio.vercel.app/api/revalidate
      │  Body: { paths: ["/blog", "/blog/my-post-slug"], secret: "REVALIDATE_SECRET" }
      ▼
Next.js Revalidation Handler (/app/api/revalidate/route.ts)
      │  Validates secret header
      │  Calls revalidatePath("/blog") + revalidatePath("/blog/my-post-slug")
      ▼
Vercel Edge Cache
      │  Marks stale cached pages for regeneration
      │  Next visitor to those routes triggers server-side re-render
      │  New HTML cached; subsequent visitors get fresh content
      ▼
Public Site — updated within one request cycle (≈ 50–200 ms)
```

**Revalidation triggers per domain:**

| Admin Action                | Paths Revalidated                                      |
|-----------------------------|--------------------------------------------------------|
| Publish/unpublish blog post | `/blog`, `/blog/[slug]`                                |
| Save blog post              | `/blog/[slug]`                                         |
| Publish/unpublish project   | `/projects`, `/projects/[slug]`                        |
| Update resume entry         | `/`, `/resume`                                         |
| Publish/unpublish album     | `/gallery`                                             |

All revalidation requests MUST be authenticated with a shared secret (`REVALIDATE_SECRET` environment variable) to prevent unauthorised cache purges.

---


## 9. Module 5 — Technical Architecture

### 9.1 Frontend Stack

#### 9.1.1 Next.js 15 (App Router)

The frontend migrates from **React 18 + Vite** to **Next.js 15** using the App Router. This change is fundamental to achieving SSR, ISR, and on-demand revalidation without a separate server.

Key Next.js features in use:
- **Server Components** for all data-fetching pages — eliminates client-side waterfall fetches.
- **Streaming + Suspense** — existing pattern from `src/pages/Index.tsx` (section-level `<Suspense>` boundaries) is preserved and enhanced.
- **`next/image`** — replaces raw `<img>` tags throughout for automatic optimization, responsive `srcSet`, and LQIP support.
- **`next/font`** — replaces `webfontloader` dependency for zero-layout-shift web font loading. Lato and Roboto (current fonts in `tailwind.config.ts`) are loaded via `next/font/google`.
- **Metadata API** — replaces `react-helmet-async` for `<head>` tag management. The existing `SEO.tsx` component is refactored into Next.js `generateMetadata()` functions per route.
- **Route Groups** — a single `(public)` route group organises all public-facing routes without affecting URL structure. Admin functionality is served directly by NestJS via AdminJS (see §8.3).

#### 9.1.2 Tailwind CSS (Continuation)

The existing Tailwind configuration (`tailwind.config.ts`) is carried forward with the following additions:

| Addition | Purpose |
|----------|---------|
| `@tailwindcss/typography` plugin | Provides `prose` classes for Markdown-rendered blog post content. |
| Masonry layout utilities | Custom CSS column-count utilities for the gallery masonry grid. |
| OAT UI design token integration | CSS custom properties from OAT UI mapped to Tailwind theme extension. |

The existing CSS custom properties (`--primary`, `--background`, `--foreground`, `--glow`, `--gradient-primary`) in `src/index.css` are migrated to `app/globals.css` unchanged. All existing utility classes (`.glass`, `.glass-hover`, `.glow`, `.text-gradient`, `.section-container`, `.skill-chip`) are retained.

#### 9.1.3 OAT UI Component Library

The comment in `src/constants/index.tsx` — *"preparing the data structure for Oat UI migration"* — identifies an incomplete migration to OAT UI. This PRD mandates its completion.

**OAT UI** is adopted as the standardised component system for the Next.js frontend. The migration plan:

| Current Component / Pattern              | OAT UI Replacement                     |
|------------------------------------------|-----------------------------------------|
| Custom `<button>` with Tailwind variants | `<OatButton variant="primary/ghost">` |
| Inline `glass` + `glass-hover` card divs | `<OatCard>` with glass variant         |
| Manual `skill-chip` span                 | `<OatBadge>`                           |
| Custom tab strip in `Hobbies.tsx`        | `<OatTabs>` / `<OatTabPanel>`          |
| Native `<dialog>` lightbox              | `<OatModal>` (accessible, focus-trapped)|
| Manual spinner divs                      | `<OatSpinner>`                          |


OAT UI components are housed in `packages/oat-ui/` within the monorepo and consumed by the `web` app via workspace dependency.

**Integration requirements:**

| ID   | Requirement |
|------|-------------|
| U-01 | All interactive OAT UI components MUST comply with **WCAG 2.1 AA** accessibility standards: keyboard navigable, ARIA-labelled, and focus-ring visible. |
| U-02 | OAT UI MUST support the existing **dark/light theme toggle** (currently implemented in `Navigation.tsx` via `localStorage` + `document.documentElement.classList`). The theme toggle mechanism is preserved using Next.js `next-themes` package. |
| U-03 | OAT UI components MUST accept Tailwind utility classes via `className` props for layout-level overrides without breaking encapsulation. |
| U-04 | The `packages/oat-ui` package MUST export TypeScript types for all component props. |

---

### 9.2 API Contract

The NestJS backend exposes a versioned REST API at `/v1/`. All endpoints return JSON. Authentication-protected routes require a `Bearer <access_token>` header.

#### 9.2.1 Authentication Endpoints

```
POST   /v1/auth/login          Body: { email, password }       → { accessToken, expiresIn }
POST   /v1/auth/refresh        Cookie: refreshToken            → { accessToken, expiresIn }
POST   /v1/auth/logout         Cookie: refreshToken            → 204 No Content
GET    /v1/auth/me             Auth: Bearer                    → AdminUser
```

#### 9.2.2 Resume Endpoints

```
GET    /v1/resume              Public     → Full ResumeDTO (profile + experience + education + skills + patents)
PATCH  /v1/resume/profile      Auth       → Updated ResumeProfileDTO
POST   /v1/resume/experience   Auth       → Created ExperienceEntryDTO
PATCH  /v1/resume/experience/:id  Auth   → Updated ExperienceEntryDTO
DELETE /v1/resume/experience/:id  Auth   → 204
POST   /v1/resume/education    Auth       → Created EducationEntryDTO
PATCH  /v1/resume/education/:id   Auth   → Updated EducationEntryDTO
DELETE /v1/resume/education/:id   Auth   → 204
GET    /v1/resume/skills       Public     → Skill[] grouped by category
POST   /v1/resume/skills       Auth       → Created SkillDTO
PATCH  /v1/resume/skills/:id   Auth       → Updated SkillDTO
DELETE /v1/resume/skills/:id   Auth       → 204
```

#### 9.2.3 Blog Endpoints

```
GET    /v1/blog                Public     → Paginated BlogPostSummaryDTO[] (published only)
GET    /v1/blog/admin          Auth       → Paginated BlogPostSummaryDTO[] (all, incl. drafts)
GET    /v1/blog/:slug          Public     → BlogPostDTO (published only)
POST   /v1/blog                Auth       → Created BlogPostDTO
PATCH  /v1/blog/:id            Auth       → Updated BlogPostDTO
DELETE /v1/blog/:id            Auth       → 204
GET    /v1/blog/tags           Public     → Tag[]
POST   /v1/blog/tags           Auth       → Created TagDTO
```

#### 9.2.4 Projects Endpoints

```
GET    /v1/projects            Public     → Paginated ProjectSummaryDTO[] (published)
GET    /v1/projects/admin      Auth       → Paginated ProjectSummaryDTO[] (all)
GET    /v1/projects/:slug      Public     → ProjectDetailDTO
POST   /v1/projects            Auth       → Created ProjectDTO
PATCH  /v1/projects/:id        Auth       → Updated ProjectDTO
DELETE /v1/projects/:id        Auth       → 204
POST   /v1/projects/:id/media  Auth       → Multipart upload → ProjectMediaDTO
DELETE /v1/projects/:id/media/:mediaId  Auth  → 204
PATCH  /v1/projects/:id/media/reorder  Auth   → Body: { orderedIds: string[] } → 204
```

#### 9.2.5 Gallery Endpoints

```
GET    /v1/gallery/albums           Public → AlbumSummaryDTO[]
GET    /v1/gallery/albums/:slug     Public → AlbumDetailDTO (with Photo[])
POST   /v1/gallery/albums           Auth   → Created AlbumDTO
PATCH  /v1/gallery/albums/:id       Auth   → Updated AlbumDTO
DELETE /v1/gallery/albums/:id       Auth   → 204
GET    /v1/gallery/photos           Public → Paginated PhotoDTO[] (cursor-based)
POST   /v1/gallery/photos           Auth   → Multipart bulk upload → PhotoDTO[]
PATCH  /v1/gallery/photos/:id       Auth   → Updated PhotoDTO (metadata)
DELETE /v1/gallery/photos/:id       Auth   → 204
PATCH  /v1/gallery/albums/:id/photos/reorder  Auth → { orderedIds: string[] } → 204
```

#### 9.2.6 Upload Endpoint

```
POST   /v1/upload              Auth       → Multipart single file → { url: string, publicId: string, lqipUrl: string, width: number, height: number, exif?: object }
```

#### 9.2.7 Standard Response Envelope

All list endpoints follow a consistent pagination envelope:

```json
{
  "data": [ ...items ],
  "meta": {
    "total": 42,
    "page": 1,
    "perPage": 20,
    "totalPages": 3,
    "nextCursor": "uuid-string-or-null"
  }
}
```

Error responses conform to RFC 7807 (Problem Details):

```json
{
  "type": "https://portfolio-api.example.com/errors/validation",
  "title": "Validation Failed",
  "status": 422,
  "detail": "The 'slug' field must be unique.",
  "instance": "/v1/blog"
}
```

---


### 9.3 Database Schema (PostgreSQL via TypeORM)

Entity classes live in `apps/api/src/entities/`. TypeORM uses decorator-based TypeScript classes — there is no separate schema file. The `DataSource` used by the migration CLI is:

```typescript
// apps/api/src/database/data-source.ts
export const AppDataSource = new DataSource({
  type:        'postgres',
  url:          process.env.DATABASE_URL,
  entities:    [__dirname + '/../**/*.entity.{ts,js}'],
  migrations:  [__dirname + '/../migrations/*.{ts,js}'],
  synchronize: false,   // NEVER true in non-development environments
});
```

All entity files import `Entity`, `PrimaryGeneratedColumn`, `Column`, `ManyToOne`, `OneToMany`, `ManyToMany`, `JoinTable`, `JoinColumn`, `CreateDateColumn`, `UpdateDateColumn`, and `Index` from `typeorm`.

```typescript
// apps/api/src/entities/*.entity.ts

// ─── Enums ───────────────────────────────────────────────────────────────────

export enum SkillCategory { language = 'language', framework = 'framework', database = 'database', tool = 'tool' }
export enum VideoSource   { youtube  = 'youtube',  vimeo    = 'vimeo',    self_hosted = 'self_hosted' }

// ─── Auth ────────────────────────────────────────────────────────────────────

@Entity('admin_users')
export class AdminUser {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true })       email: string;
  @Column()                       passwordHash: string;
  @CreateDateColumn()             createdAt: Date;
  @UpdateDateColumn()             updatedAt: Date;
}

// ─── Resume ──────────────────────────────────────────────────────────────────

@Entity('resume_profile')
export class ResumeProfile {
  @PrimaryGeneratedColumn('uuid')          id: string;
  @Column()                                name: string;           // RESUME.name
  @Column()                                position: string;       // RESUME.position
  @Column({ type: 'text' })                description: string;    // RESUME.description
  @Column()                                email: string;
  @Column()                                phone: string;          // RESUME.mobile
  @Column()                                location: string;       // RESUME.address
  @Column()                                linkedInUrl: string;
  @Column()                                githubUrl: string;
  @Column()                                avatarUrl: string;      // gravatar(400)
  @Column({ type: 'timestamptz' })         careerStartDate: Date;  // CAREER_START_DATE
  @Column({ type: 'timestamptz' })         freelanceStartDate: Date;
  @UpdateDateColumn()                      updatedAt: Date;
}

@Entity('skills')
@Index(['name', 'category'])
export class Skill {
  @PrimaryGeneratedColumn('uuid')                         id: string;
  @Column({ unique: true })                               name: string;
  @Column({ type: 'enum', enum: SkillCategory })          category: SkillCategory;
  @ManyToMany(() => ExperienceEntry, e => e.skills)      experiences: ExperienceEntry[];
  @ManyToMany(() => Project, p => p.skills)              projects: Project[];
}

@Entity('experience_entries')
export class ExperienceEntry {
  @PrimaryGeneratedColumn('uuid')                         id: string;
  @Column()                                               title: string;
  @Column()                                               company: string;
  @Column()                                               location: string;       // exp.area
  @Column({ type: 'timestamptz' })                       startDate: Date;        // exp.duration[0]
  @Column({ type: 'timestamptz', nullable: true })        endDate: Date | null;   // null if isCurrent
  @Column({ default: false })                             isCurrent: boolean;
  @Column({ type: 'text', array: true })                  tasks: string[];
  @Column({ default: 0 })                                 sortOrder: number;
  @ManyToMany(() => Skill)
  @JoinTable({ name: 'experience_skills' })               skills: Skill[];
  @CreateDateColumn()                                     createdAt: Date;
  @UpdateDateColumn()                                     updatedAt: Date;
}

@Entity('education_entries')
export class EducationEntry {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column()                       degree: string;
  @Column()                       university: string;
  @Column()                       duration: string;     // display string e.g. "2008 - 2012"
  @Column({ default: 0 })         sortOrder: number;
  @CreateDateColumn()             createdAt: Date;
  @UpdateDateColumn()             updatedAt: Date;
}

@Entity('patents')
export class Patent {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column()                       link: string;         // e.g. "GB2572361A"
  @Column()                       url: string;          // Full Google Patents URL
  @Column()                       title: string;
  @Column({ default: 0 })         sortOrder: number;
  @CreateDateColumn()             createdAt: Date;
  @UpdateDateColumn()             updatedAt: Date;
}

@Entity('certifications')
export class Certification {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column()                       title: string;
  @Column()                       issuer: string;
  @Column({ nullable: true })     link: string | null;
  @Column({ default: 0 })         sortOrder: number;
  @CreateDateColumn()             createdAt: Date;
  @UpdateDateColumn()             updatedAt: Date;
}

@Entity('awards')
export class Award {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column()                       title: string;
  @Column()                       issuer: string;
  @Column({ default: 0 })         sortOrder: number;
  @CreateDateColumn()             createdAt: Date;
  @UpdateDateColumn()             updatedAt: Date;
}

// ─── Blog ────────────────────────────────────────────────────────────────────

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')             id: string;
  @Column({ unique: true })                   name: string;
  @ManyToMany(() => BlogPost, b => b.tags)   posts: BlogPost[];
}

@Entity('blog_posts')
@Index(['published', 'publishedAt'])
export class BlogPost {
  @PrimaryGeneratedColumn('uuid')                          id: string;
  @Column({ unique: true })                                slug: string;
  @Column()                                                title: string;
  @Column({ type: 'text', nullable: true })                excerpt: string | null;
  @Column({ nullable: true })                              coverImageUrl: string | null;
  @Column({ type: 'text' })                                rawMarkdown: string;
  @Column({ type: 'text' })                                htmlContent: string;   // cached render
  @Column({ nullable: true })                              readingTime: number | null;
  @Column({ default: false })                              published: boolean;
  @Column({ type: 'timestamptz', nullable: true })         publishedAt: Date | null;
  @ManyToMany(() => Tag, t => t.posts, { cascade: true })
  @JoinTable({ name: 'post_tags' })                        tags: Tag[];
  @CreateDateColumn()                                      createdAt: Date;
  @UpdateDateColumn()                                      updatedAt: Date;
}

// ─── Projects ────────────────────────────────────────────────────────────────

@Entity('project_media')
export class ProjectMedia {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column()                       url: string;
  @Column({ nullable: true })     altText: string | null;
  @Column({ default: 0 })         sortOrder: number;
  @ManyToOne(() => Project, p => p.media, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })                     project: Project;
}

@Entity('project_videos')
export class ProjectVideo {
  @PrimaryGeneratedColumn('uuid')                         id: string;
  @Column({ type: 'enum', enum: VideoSource })            source: VideoSource;
  @Column()                                               url: string;
  @Column({ nullable: true })                             title: string | null;
  @Column({ default: 0 })                                 sortOrder: number;
  @ManyToOne(() => Project, p => p.videos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })                     project: Project;
}

@Entity('projects')
@Index(['published', 'sortOrder'])
export class Project {
  @PrimaryGeneratedColumn('uuid')                         id: string;
  @Column({ unique: true })                               slug: string;
  @Column()                                               title: string;
  @Column({ nullable: true })                             company: string | null;
  @Column({ nullable: true })                             role: string | null;
  @Column({ type: 'timestamptz', nullable: true })        startDate: Date | null;
  @Column({ type: 'timestamptz', nullable: true })        endDate: Date | null;
  @Column({ type: 'text', nullable: true })               description: string | null;    // Markdown source
  @Column({ type: 'text', nullable: true })               htmlDescription: string | null; // Rendered HTML cache
  @Column({ nullable: true })                             githubUrl: string | null;
  @Column({ nullable: true })                             liveDemoUrl: string | null;
  @Column({ default: false })                             featured: boolean;
  @Column({ default: false })                             published: boolean;
  @Column({ default: 0 })                                 sortOrder: number;
  @ManyToMany(() => Skill, s => s.projects, { cascade: true })
  @JoinTable({ name: 'project_skills' })                  skills: Skill[];
  @OneToMany(() => ProjectMedia, m => m.project, { cascade: true })
                                                          media: ProjectMedia[];
  @OneToMany(() => ProjectVideo, v => v.project, { cascade: true })
                                                          videos: ProjectVideo[];
  @CreateDateColumn()                                     createdAt: Date;
  @UpdateDateColumn()                                     updatedAt: Date;
}

// ─── Gallery ─────────────────────────────────────────────────────────────────

@Entity('photos')
@Index(['sortOrder'])
export class Photo {
  @PrimaryGeneratedColumn('uuid')                         id: string;
  @Column({ nullable: true })                             title: string | null;
  @Column({ nullable: true })                             altText: string | null;
  @Column({ nullable: true })                             location: string | null;
  @Column()                                               originalUrl: string;
  @Column()                                               thumbUrl: string;
  @Column({ nullable: true })                             lqipUrl: string | null;   // Cloudinary e_blur:2000,q_1,f_auto URL
  @Column({ nullable: true })                             width: number | null;
  @Column({ nullable: true })                             height: number | null;
  @Column({ type: 'jsonb', nullable: true })              exif: Record<string, unknown> | null; // {make, model, focalLength, aperture, iso, shutterSpeed}
  @Column({ default: 0 })                                 sortOrder: number;
  @Column({ default: true })                              published: boolean;
  @ManyToOne(() => Album, a => a.photos, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'album_id' })                       album: Album | null;
  @CreateDateColumn()                                     createdAt: Date;
  @UpdateDateColumn()                                     updatedAt: Date;
}

@Entity('albums')
export class Album {
  @PrimaryGeneratedColumn('uuid')                         id: string;
  @Column({ unique: true })                               slug: string;
  @Column()                                               name: string;
  @Column({ type: 'text', nullable: true })               description: string | null;
  @Column({ nullable: true })                             location: string | null;
  @Column({ nullable: true })                             coverId: string | null;   // FK to photos.id (soft ref)
  @Column({ default: false })                             published: boolean;
  @Column({ default: 0 })                                 sortOrder: number;
  @OneToMany(() => Photo, p => p.album)                   photos: Photo[];
  @CreateDateColumn()                                     createdAt: Date;
  @UpdateDateColumn()                                     updatedAt: Date;
}
```

**Database indexes** (declared via TypeORM `@Index` decorators and auto-applied through migrations):
- `BlogPost(slug)` UNIQUE, `BlogPost(published, publishedAt DESC)` — blog listing queries
- `Project(slug)` UNIQUE, `Project(published, sortOrder)` — project listing queries
- `Photo(album_id, sortOrder)` — gallery album photo listing
- `Skill(name)` UNIQUE, `Skill(name, category)` — skill typeahead lookup

---

### 9.4 Authentication & Authorization

#### 9.4.1 Strategy

JWT-based authentication using **RS256 asymmetric signing** (RSA-2048 key pair):

| Token          | TTL      | Storage                  | Mechanism |
|----------------|----------|--------------------------|-----------|
| Access Token   | 1 day    | In-memory (JS variable)  | `Authorization: Bearer <token>` header |
| Refresh Token  | 30 days  | HTTP-only `Secure` cookie| Auto-sent with every request to `/v1/auth/refresh` |

The asymmetric key strategy means the public key can be distributed to Next.js (Edge Runtime) for **client-side token verification without a database round-trip**.

#### 9.4.2 NestJS Auth Implementation

```
apps/api/src/auth/
  ├── auth.module.ts          # JwtModule, PassportModule, guards
  ├── auth.service.ts         # login(), refresh(), logout(), hashPassword(), verifyToken()
  ├── auth.controller.ts      # POST /v1/auth/login, /refresh, /logout, GET /me
  ├── strategies/
  │   ├── jwt.strategy.ts     # PassportStrategy(Strategy) validates Bearer token
  │   └── local.strategy.ts   # PassportStrategy(Strategy) validates email/password
  ├── guards/
  │   ├── jwt-auth.guard.ts   # @UseGuards(JwtAuthGuard) for protected endpoints
  │   └── local-auth.guard.ts # Used only on POST /v1/auth/login
  └── decorators/
      └── current-user.decorator.ts  # @CurrentUser() param decorator
```

#### 9.4.3 AdminJS Route Protection

The `/admin/**` path is served entirely by the NestJS process via the `@adminjs/nestjs` adapter. Authentication is handled by AdminJS's built-in session mechanism:

- **Login form** is rendered by AdminJS at `/admin/login`; credentials are validated against the `AdminUser` entity (email + bcrypt-hashed password) inside the `authenticate` callback.
- On success, AdminJS sets an **HTTP-only, Secure, SameSite=Strict session cookie** managed by `express-session` (backed by a PostgreSQL session store via `connect-pg-simple` to survive restarts).
- Every subsequent request to `/admin/**` is authenticated by the session middleware before reaching any AdminJS route handler. Unauthenticated requests are redirected to `/admin/login`.
- The Next.js application has **no knowledge of the admin path** and requires no JWT verification for it. The `NEXT_PUBLIC_*` environment variables do not include the RS256 public key.

#### 9.4.4 Rate Limiting

The `/v1/auth/login` endpoint MUST be rate-limited to **10 requests per IP per 15-minute window** using the `@nestjs/throttler` module. Exceeding the limit returns `429 Too Many Requests`.

---

### 9.5 Backend Stack (NestJS)

#### 9.5.1 Module Architecture

```
apps/api/src/
  ├── main.ts                 # Bootstrap: CORS, validation pipe, Swagger, session middleware
  ├── app.module.ts           # Root module: imports all feature modules + AdminModule
  ├── admin/                  # § 8.3 — AdminJS panel
  │   ├── admin.module.ts     # AdminModule.createAdminAsync() — entity registration, auth hook
  │   └── components/         # Custom AdminJS React components (bundled by ComponentLoader)
  │       ├── markdown-editor.tsx  # CodeMirror 6 + Rehype live preview
  │       ├── media-uploader.tsx   # Cloudinary multi-file uploader + sortable list
  │       └── dashboard.tsx        # Custom stats dashboard component
  ├── auth/                   # § 9.4 — JWT strategy, Passport guards, decorators
  ├── resume/
  │   ├── resume.module.ts
  │   ├── resume.service.ts   # @InjectRepository() + yearsOfExperience computation
  │   ├── resume.controller.ts
  │   └── dto/                # CreateExperienceDto, UpdateProfileDto, etc.
  ├── blog/
  │   ├── blog.module.ts
  │   ├── blog.service.ts     # Markdown → HTML pipeline, slug generation, tag management
  │   ├── blog.controller.ts
  │   └── dto/
  ├── projects/
  │   ├── projects.module.ts
  │   ├── projects.service.ts
  │   ├── projects.controller.ts
  │   └── dto/
  ├── gallery/
  │   ├── gallery.module.ts
  │   ├── gallery.service.ts  # Cloudinary upload, EXIF from response, lqipUrl construction
  │   ├── gallery.controller.ts
  │   └── dto/
  ├── upload/
  │   ├── upload.module.ts
  │   ├── upload.service.ts   # Multipart → Cloudinary via cloudinary SDK v2
  │   └── upload.controller.ts
  └── common/
      ├── interceptors/
      │   ├── logging.interceptor.ts
      │   └── transform.interceptor.ts  # Wraps all responses in { data, meta } envelope
      ├── filters/
      │   └── http-exception.filter.ts  # RFC 7807 Problem Details format
      └── pipes/
          └── validation.pipe.ts        # class-validator + class-transformer
```

#### 9.5.2 Key NestJS Library Selections

| Library | Version | Purpose |
|---------|---------|---------|
| `@nestjs/core` | ^10 | Core framework |
| `@nestjs/passport` + `passport-jwt` | ^10 / ^4 | JWT authentication for REST API endpoints |
| `@nestjs/throttler` | ^5 | Rate limiting |
| `@nestjs/swagger` | ^7 | OpenAPI 3.1 documentation (auto-generated from DTOs) |
| `typeorm` + `@nestjs/typeorm` | ^0.3 / ^10 | Decorator-based TypeScript ORM; repository pattern; auto-migration generation |
| `class-validator` + `class-transformer` | ^0.14 | DTO validation |
| `cloudinary` | ^2 | Cloudinary SDK v2 — upload, transformation URL generation, EXIF extraction from upload response, and LQIP via `e_blur:2000,q_1,f_auto` transformation parameter |
| `unified` + `remark-gfm` + `rehype-pretty-code` | latest | Markdown → HTML pipeline (mirrored from frontend) |
| `adminjs` | ^7 | Core AdminJS framework — auto-generates CRUD UI from entity metadata |
| `@adminjs/nestjs` | ^6 | NestJS adapter — mounts AdminJS as a NestJS module with `AdminModule.createAdminAsync()` |
| `@adminjs/typeorm` | ^4 | TypeORM adapter — registers TypeORM entities as AdminJS resources |
| `@adminjs/bundler` | ^3 | Vite-based bundler for AdminJS custom React components (production builds) |
| `express-session` | ^1 | Session middleware backing AdminJS authentication |
| `connect-pg-simple` | ^9 | PostgreSQL-backed session store (survives process restarts) |

#### 9.5.3 Swagger / OpenAPI Documentation

All NestJS controllers and DTOs are annotated with `@nestjs/swagger` decorators to produce a complete **OpenAPI 3.1** specification automatically.

**Controller annotations:**
- `@ApiTags('blog')` — groups endpoints by domain in the UI.
- `@ApiBearerAuth()` — marks protected endpoints; the Swagger UI `Authorize` button accepts a JWT for interactive testing.
- `@ApiOperation({ summary: '...' })` — per-endpoint description.
- `@ApiResponse({ status: 200, type: BlogPostDto })` — typed response schemas.

**DTO annotations:**
- Every DTO property MUST use `@ApiProperty({ description, example, required })` to produce rich schema documentation.
- Enums MUST use `@ApiProperty({ enum: MyEnum, enumName: 'MyEnum' })` to generate named enum schemas.

**Setup in `main.ts`:**
```typescript
const config = new DocumentBuilder()
  .setTitle('Portfolio CMS API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('v1/docs', app, document);
```

**Spec export for client generation:**
At build time, `SwaggerModule.createDocument()` output is serialised to `packages/types/api-spec.json` and committed to the repository. The Next.js `web` app consumes it via `openapi-typescript` to auto-generate a fully type-safe `ApiClient` — eliminating manual type duplication between frontend and backend.

The Swagger UI is served at `/v1/docs` in **development and staging** only. In production the endpoint is disabled via an environment flag (`SWAGGER_ENABLED=false`).

---


## 10. Non-Functional Requirements

| ID    | Category        | Requirement |
|-------|-----------------|-------------|
| NF-01 | Performance     | All public pages MUST score ≥ 90 on Lighthouse Performance, Accessibility, Best Practices, and SEO audits run on a desktop + simulated 4G mobile profile. |
| NF-02 | Performance     | API p95 response time MUST be ≤ 200 ms for all public GET endpoints under a load of 100 concurrent users (tested with k6). |
| NF-03 | Availability    | The API MUST target 99.9% monthly uptime. The frontend (Vercel) inherits Vercel's SLA. |
| NF-04 | Security        | All API requests MUST be served over HTTPS (TLS 1.2+). |
| NF-05 | Security        | The AdminJS panel MUST NOT be indexable by search engines: NestJS MUST set `X-Robots-Tag: noindex` on all `/admin/**` responses, and `robots.txt` (served by Next.js) MUST contain `Disallow: /admin`. |
| NF-06 | Security        | All user-supplied content (Markdown, text fields) MUST be sanitised before HTML rendering using `rehype-sanitize` with a strict allowlist. |
| NF-07 | Security        | Uploaded file types MUST be validated on the server using magic-byte inspection (not just MIME type header) to prevent polyglot attacks. Accepted: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.mp4`, `.mov`. |
| NF-08 | Maintainability | The codebase MUST maintain TypeScript strict mode (`"strict": true`) across all apps and packages. No `any` types without an explicit ESLint disable comment. |
| NF-09 | Maintainability | All NestJS service methods MUST have corresponding unit tests (Jest) with ≥ 80% branch coverage. |
| NF-10 | Scalability     | The database schema MUST support horizontal read scaling via TypeORM's `replication` option inside `TypeOrmModule.forRootAsync()`, pointing separate `master` and `slaves` connection URLs to a read-replica set. |
| NF-11 | SEO             | All public pages MUST include: canonical URL, `robots` meta tag, `og:*` tags, `twitter:*` tags, and appropriate JSON-LD structured data. |
| NF-12 | Accessibility   | All interactive elements MUST be keyboard-operable and ARIA-labelled. Colour contrast ratios MUST meet WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text). |

---

## 11. Deployment & Infrastructure

### 11.1 Environment Matrix

| Environment | Frontend (Next.js)     | API (NestJS)           | Database                      |
|-------------|------------------------|------------------------|-------------------------------|
| Development | `localhost:3000` (dev) | `localhost:3001` (dev) | Local PostgreSQL via Docker   |
| Staging     | Vercel Preview         | Railway (staging svc)  | Supabase (staging project)    |
| Production  | Vercel Production      | Railway (prod svc)     | Supabase (production project) |

### 11.2 Environment Variables

**Next.js (`apps/web/.env.local`):**

```
NEXT_PUBLIC_API_URL=https://api.portfolio.example.com
REVALIDATE_SECRET=<random-256-bit-hex>
JWT_PUBLIC_KEY=<RS256-public-key-PEM>
```

**NestJS (`apps/api/.env`):**

```
DATABASE_URL=postgresql://user:pass@host:5432/portfolio
JWT_PRIVATE_KEY=<RS256-private-key-PEM>
JWT_PUBLIC_KEY=<RS256-public-key-PEM>
NEXT_REVALIDATE_URL=https://portfolio.vercel.app/api/revalidate
REVALIDATE_SECRET=<same-secret-as-above>
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
```

### 11.3 CI/CD Pipeline

```
GitHub Actions Workflow:

On PR open / update:
  ├── Lint (ESLint + TypeScript check) — all packages
  ├── Unit tests (Jest) — apps/api
  ├── Build check — apps/web (next build)
  └── Vercel Preview Deploy (automatic via Vercel GitHub integration)

On merge to main:
  ├── All PR checks (above)
  ├── TypeORM migration (typeorm migration:run) → staging DB
  ├── Railway deploy (staging) — apps/api Docker image
  └── Vercel Production Deploy — apps/web
```

### 11.4 Database Migrations

All schema changes are managed via **TypeORM Migrations**:

1. Developer runs `typeorm migration:generate -d src/database/data-source.ts src/migrations/<MigrationName>` locally to auto-generate a migration from entity diff.
2. Generated migration file is committed to `apps/api/src/migrations/`.
3. CI/CD pipeline runs `typeorm migration:run -d src/database/data-source.ts` against the target environment before the API service is redeployed.
4. Migrations are **never run manually** against production — only via the CI/CD pipeline.
5. `synchronize: false` is enforced in all non-development environments to prevent TypeORM from silently auto-altering the production schema.

---

## 12. Acceptance Criteria

The platform is considered production-ready when all of the following are satisfied:

### Content Migration

- [ ] All 6 experience entries from `RESUME.experience` are queryable via `GET /v1/resume` with full field fidelity (title, company, location, dates, tasks, tech stack).
- [ ] All skills from `RESUME.languages`, `RESUME.frameworks`, `RESUME.databases`, `RESUME.tools` are stored as `Skill` rows with correct `SkillCategory`.
- [ ] All 3 projects from `RESUME.projects` are live at `/projects/[slug]` with tech stack chips rendered.
- [ ] All 6 seed photos from `RESUME.hobbies.photos` are stored in the database and displayed in the `/gallery` module.
- [ ] The `/resume` page renders identically to the pre-migration static version (visual regression test).

### Blog Engine

- [ ] An admin can create a Markdown post with front-matter, publish it, and see it at `/blog/[slug]` within 60 seconds — without redeploying.
- [ ] Published post pages include correct OG meta tags and JSON-LD structured data verified by Google's Rich Results Test.
- [ ] Code blocks in posts render with syntax highlighting for TypeScript and Python.
- [ ] Table of contents renders correctly from `##`-level headings.

### Project Showcase

- [ ] A project with 4+ carousel images renders Embla Carousel with keyboard and swipe navigation.
- [ ] Embedding a YouTube URL renders a lazy-loaded iframe that does not block page LCP.
- [ ] Tech stack filter on `/projects` correctly shows/hides projects by selected technology.

### Photography Gallery

- [ ] The `/gallery` page loads with ≤ 1.5 s FCP on simulated 4G (Lighthouse CI).
- [ ] Clicking a photo opens the lightbox; `ArrowLeft`/`ArrowRight` navigate; `Escape` closes.
- [ ] Lightbox displays EXIF metadata for photos that have it.
- [ ] LQIP placeholders (Cloudinary `e_blur:2000,q_1,f_auto` URLs) are visible before full images load on a throttled connection.

### Admin Dashboard (AdminJS)

- [ ] Navigating to `/admin` without a session redirects to `/admin/login`.
- [ ] Login with valid admin credentials sets an HTTP-only session cookie and grants access to the AdminJS dashboard.
- [ ] Login with invalid credentials returns an error message without revealing whether the email or password was wrong.
- [ ] 11 consecutive failed login attempts within 15 minutes from the same IP return `429 Too Many Requests`.
- [ ] Deleting an experience entry via AdminJS removes it from `GET /v1/resume` within one request.
- [ ] `GET /admin` response headers include `X-Robots-Tag: noindex`.
- [ ] The Swagger UI at `/v1/docs` correctly lists all protected endpoints with the padlock icon; providing a valid Bearer token allows interactive execution.

### Zero-Redeploy

- [ ] Publishing a blog post in the admin results in the post appearing at its public URL within 60 seconds, confirmed with a `curl` check before and after.
- [ ] No new Vercel deployment is triggered by the publish action (confirm via Vercel dashboard deployment log).

---

## 13. Appendix — Data Mapping from `src/constants/index.tsx`

This appendix serves as the definitive reference for the seed migration engineer. Every exported symbol from `src/constants/index.tsx` is mapped to its target in the new system.

### 13.1 Scalar Constants

| Symbol (constants/index.tsx)   | Target                                      | Notes |
|--------------------------------|---------------------------------------------|-------|
| `CAREER_START_DATE`            | `ResumeProfile.careerStartDate`             | `new Date(2016, 6, 1)` → ISO `2016-07-01` |
| `LINKEDIN_URL`                 | `ResumeProfile.linkedInUrl`                 | |
| `URL`                          | `ResumeProfile.websiteUrl` (add field)      | Site's own canonical URL |
| `GITHUB_URL`                   | `ResumeProfile.githubUrl`                   | |
| `GRAVATAR`                     | `ResumeProfile.avatarUrl` (gravatar(400))   | Store generated URL, not the base hash |
| `PATENT_ONE`                   | `Patent.url` (for GB2572361A row)           | |
| `PATENT_TWO`                   | `Patent.url` (for USD870129S1 row)          | |
| `A3ACP`                        | `Project.githubUrl` (for A3 ACP row)        | |
| `TRANSWISE`                    | `Project.githubUrl` (for Transwise row)     | |
| `A3Udater`                     | `Project.githubUrl` (for A3 Updater row)    | |
| `BLOCKCHAIN`                   | `Certification.link`                        | Blockchain Council cert |
| `PRIMARY_COLOR`                | CSS variable `--primary` (keep as-is in CSS)| Not migrated to DB |
| `PRIMARY_FONT`                 | `next/font/google` configuration            | Not migrated to DB |
| `KEYMAPPING` enum              | **Deprecated** — replaced by TypeScript DTO types | Remove in Phase 3 |
| `BLACK_BACKGROUND`, `WHITE`    | CSS / Tailwind config                       | Not migrated to DB |
| `PAGE_WIDTH`, `PAGE_HEIGHT`... | LaTeX generator utility (`packages/utils`)  | Retained for PDF generation |

### 13.2 `PROFILE` Object

| `PROFILE` field              | Target                                  |
|------------------------------|-----------------------------------------|
| `PROFILE.name`               | `ResumeProfile.name`                    |
| `PROFILE.title`              | `ResumeProfile.position`                |
| `PROFILE.description`        | `ResumeProfile.description`             |
| `PROFILE.favicon.url`        | `<head>` favicon config (Next.js `app/favicon.ico`) |
| `PROFILE.contact_details[]`  | Decomposed into individual `ResumeProfile` columns (phone, email, location, linkedInUrl, githubUrl, websiteUrl) |

### 13.3 `RESUME` Object — Computed Fields

| Computed Expression                                                      | API Handling |
|--------------------------------------------------------------------------|--------------|
| `yearsOfExperience()` (industry, from `CAREER_START_DATE`)               | Computed in `resume.service.ts` from `ResumeProfile.careerStartDate` to `now()`. Returned as `yearsOfExperienceString` in `ResumeDTO`. |
| `yearsOfExperience(new Date(2012,2,1), CAREER_START_DATE)` (freelance)   | Computed using hardcoded freelance start `2012-03-01` stored as `ResumeProfile.freelanceStartDate`. |
| `yearsOfExperienceNode()` (JSX variant)                                  | **Deprecated** — replaced by frontend rendering of `yearsOfExperienceString` from API. |
| `calculateDuration({ duration, isCurrent })` (per experience entry)      | Computed in `resume.service.ts` or in the frontend from `startDate`, `endDate`, `isCurrent` fields. |
| `gravatar(size)` URL generator                                            | `ResumeProfile.avatarUrl` stores the pre-generated URL (`gravatar(400)`). Frontend requests specific sizes by appending `?s=<size>`. |

### 13.4 `RESUME.experience[]` → `ExperienceEntry` + `ExperienceSkill`

| RESUME field           | ExperienceEntry column | Notes |
|------------------------|------------------------|-------|
| `exp.title`            | `title`                | |
| `exp.company`          | `company`              | |
| `exp.area`             | `location`             | |
| `exp.duration[0]`      | `startDate`            | Convert `new Date(year, month, day)` → ISO DateTime |
| `exp.duration[1]`      | `endDate`              | Null when `isCurrent: true` |
| `exp.isCurrent`        | `isCurrent`            | Boolean; Tekion entry is `true` |
| `exp.tasks[]`          | `tasks` (String[])     | PostgreSQL text array |
| `exp.techStack[]`      | `ExperienceSkill` join | Each tech string maps to a `Skill.name`; create Skill if not exists |

### 13.5 `RESUME.hobbies` — Photography Photos

The 6 existing photo entries in `RESUME.hobbies.photos` are seeded into:
- A default `Album` named **"General"** with `slug: "general"`.
- Individual `Photo` rows with `thumbUrl` set to the existing Unsplash URL and `originalUrl` set to the same URL with `w=2400&h=1800` parameters.
- `lqipUrl` is set to the Cloudinary LQIP transformation URL (`e_blur:2000,q_1,f_auto`) generated from the uploaded `publicId` — no local image processing required.
- `title` and `location` fields mapped directly from the existing photo object.

### 13.6 Functions Retained in `packages/utils`

The following utility functions are not deleted — they are moved to the shared `packages/utils` package and continue to be used by the LaTeX resume generator:

| Function             | Current Location              | Moved To                        |
|----------------------|-------------------------------|---------------------------------|
| `calculateDuration`  | `src/constants/index.tsx:74`  | `packages/utils/src/date.ts`    |
| `yearsOfExperience`  | `src/constants/index.tsx:23`  | `packages/utils/src/date.ts`    |
| `formatNumberSuffix` | `src/constants/index.tsx:17`  | `packages/utils/src/date.ts`    |
| `generateLatexResume`| `src/utils/generateLatex.ts`  | `packages/utils/src/latex.ts`   |

---

*End of Document — PRD-001 v1.0.0*
