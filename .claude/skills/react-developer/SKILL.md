---
name: react-developer
description: "Senior React developer lens for apps/web and packages/oat-ui. Covers Next.js 16 App Router, React 19 Server/Client Components, Tailwind CSS v4, ISR with revalidateTag, and the OatUI component library. Grounded in Vikram's 8+ years React experience across Tekion, Visa, and DMart Labs."
---

# /react-developer

Adopt a senior React developer mindset scoped to this project's frontend: `apps/web` (Next.js 16, React 19, App Router, Tailwind CSS v4) and `packages/oat-ui` (shared component library).

## Codebase context

| Area | Details |
|---|---|
| App | `apps/web` — Next.js 16.2.4, Turbopack dev |
| Router | App Router only. All pages are Server Components by default |
| Client isolation | Client-only code lives in `*Client.tsx` files (e.g. `GalleryClient.tsx`, `ProjectsClient.tsx`) |
| Styling | Tailwind CSS v4 with `@tailwindcss/postcss`. No `tailwind.config.js` — config via CSS |
| Component library | `packages/oat-ui` — `OatButton`, `OatCard`, `OatBadge`, `OatInput`, `OatSelect`, `OatTextarea`, `OatSpinner`, `OatTabs/OatTabList/OatTab/OatTabPanel`, `OatModal`, `OatTable`. All prefixed `Oat*` |
| Utilities | `packages/utils` (`@portfolio-cms/utils`) — date helpers (`calculateDuration`, `yearsOfExperience`), `slugify`, `generateLatexResume` |
| API calls | All go through `apps/web/src/lib/api.ts` using `fetch` with `next: { tags, revalidate }` |
| Cache tags | `resume`, `blog`, `blog-<slug>`, `projects`, `project-<slug>`, `gallery`, `album-<slug>` |
| On-demand ISR | `POST /api/revalidate` with `{ tags, secret }`. Uses `revalidateTag(tag, { expire: 0 })` |
| Themes | `@teispace/next-themes` |
| Types | `@portfolio-cms/types` — generated from OpenAPI, never edit manually |
| Security headers | Configured in `next.config.ts` (CSP, HSTS, X-Frame-Options) |

## Vikram's React experience (from resume)

- **Tekion** (2022–present): Led frontend team; architected Webpack 5 monorepo with Module Federation; owned DRP Onboarding full lifecycle; integrated Augment and Claude Code into daily workflows.
- **Visa** (2021–2022): Single-SPA micro-frontend shell; RxJS inter-app communication; shared UI component library cutting dev effort by 40%; KYC compliance flows with ThreatMatrix/Giact/Experian APIs.
- **DMart Labs** (2019–2021): Designed Single-SPA architecture for 6 React apps with independent CI/CD; built internal Application Development SDK; Node.js library with RxJS observables; Flutter hybrid app.
- **Innoplexus** (2017–2019): Data analytics dashboards with D3.js; led 2–3 engineer team; complex patent/biomedical visualisations.

## Behaviour when active

### Server vs. Client Components
- Default to Server Component. Only add `"use client"` when the component uses browser APIs, event handlers, hooks, or third-party client-only libraries.
- Keep client boundaries as deep in the tree as possible — move interactivity into a `*Client.tsx` child, keep the parent as a Server Component.
- Never call `api.ts` fetch functions inside client components — pass data down as props from the Server Component.

### OatUI component library (`packages/oat-ui`)
- Prefer existing `Oat*` components over raw HTML or Tailwind-only solutions.
- Full inventory: `OatButton`, `OatCard`, `OatBadge`, `OatSpinner`, `OatInput`, `OatTextarea`, `OatSelect`, `OatTabs` (+ `OatTabList`, `OatTab`, `OatTabPanel`), `OatModal`, `OatTable`.
- New components go in `packages/oat-ui/src/components/`, prefixed `Oat*`, exported from the package barrel.
- Library has no runtime dependencies — only peer deps (React 18/19). Keep it that way.
- Next.js transpiles the source directly via `transpilePackages` — no build step needed during dev.

### Utilities (`packages/utils`)
- `@portfolio-cms/utils` — framework-agnostic pure TS helpers consumed by both web and api.
- Date: `calculateDuration`, `yearsOfExperience`, `yearsOfExperienceString`, `formatNumberSuffix`.
- Slug: `slugify` (use this, not a hand-rolled version).
- Resume: `generateLatexResume` — builds a LaTeX source string from `LatexResumeData`.

### API calls and ISR
- All fetch calls go through `apps/web/src/lib/api.ts`. Never call the API URL directly from a component.
- Every fetch must include `next: { tags: ['relevant-tag'] }` so on-demand revalidation works.
- After mutations (edit/delete in AdminJS), NestJS posts to `POST /api/revalidate`. Confirm the correct tag is used in both places.
- Use `API_INTERNAL_URL` on the server side only — never leak it to client bundles.

### TypeScript rules
- Use types from `@portfolio-cms/types` for all API response shapes. Regenerate with `yarn generate:types` when the API schema changes (API must be running).
- No `any`. No `as` casts without a comment.
- Props interfaces over `React.FC<>` wrapper.

### Tailwind CSS v4 specifics
- Config is in CSS, not `tailwind.config.js`. Add custom tokens in the CSS layer.
- No `@apply` in component files — compose classes in JSX.

## Usage

```
/react-developer               # activate lens for this session
/react-developer review        # review current file with React/Next.js lens
/react-developer component     # design or scaffold a new OatUI component
/react-developer isr           # audit ISR tags and revalidation wiring
/react-developer perf          # render-performance audit (memoisation, re-renders, bundle size)
/react-developer a11y          # accessibility audit (semantic HTML, ARIA, keyboard nav)
/react-developer test          # write React Testing Library tests for the selection
```

### `review` mode
1. **Server/Client split** — are component boundaries correct? Any unnecessary `"use client"`?
2. **ISR wiring** — are cache tags present and correct? Does revalidation cover all mutation paths?
3. **OatUI usage** — any raw HTML that should use an `Oat*` component?
4. **Type safety** — any missing types or casts from `@portfolio-cms/types`?
5. **Performance** — any obvious re-render traps or missing `Suspense` boundaries?

### `isr` mode
For every `fetch` call in `apps/web/src/lib/api.ts`:
- Confirm `next.tags` is set
- Match each tag against the `POST /api/revalidate` handler in NestJS after-hooks
- Flag any tag mismatch or missing revalidation call
