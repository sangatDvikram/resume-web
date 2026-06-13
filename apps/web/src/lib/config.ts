/**
 * API endpoint path constants for the NestJS portfolio backend.
 *
 * All entries are relative paths (no host) — prepend with:
 *   - getApiBase()                  → server-side (api.ts)
 *   - process.env.NEXT_PUBLIC_API_URL → client components
 *
 * Dynamic endpoints are functions that encode their slug argument.
 */
export const ApiEndpoint = {
  // ── Resume ─────────────────────────────────────────────────────────────────
  RESUME: (slug: string) => `/v1/resume/${encodeURIComponent(slug)}`,

  // ── Blog ───────────────────────────────────────────────────────────────────
  BLOG: '/v1/blog',
  BLOG_POST: (slug: string) => `/v1/blog/${encodeURIComponent(slug)}`,

  // ── Projects ───────────────────────────────────────────────────────────────
  PROJECTS: '/v1/projects',
  PROJECT: (slug: string) => `/v1/projects/${encodeURIComponent(slug)}`,

  // ── Gallery ────────────────────────────────────────────────────────────────
  GALLERY_ALBUMS: '/v1/gallery/albums',
  GALLERY_ALBUM: (slug: string) => `/v1/gallery/albums/${encodeURIComponent(slug)}`,
  GALLERY_PHOTOS: '/v1/gallery/photos',
} as const;
