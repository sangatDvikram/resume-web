/**
 * Slug utilities shared across apps/api and apps/web.
 *
 * `slugify` is a pure, dependency-free function that converts any string into
 * a URL-safe slug.  It lives here so both the Next.js frontend and the NestJS
 * API use the same normalisation rules.
 *
 * For collision-resistant slugs (title + nanoid suffix) use the
 * `generateSlug` helper in `apps/api/src/common/slug.util.ts` instead —
 * nanoid is kept out of this package to avoid module-system conflicts between
 * ESM (packages/utils) and CommonJS (apps/api).
 */

/**
 * Convert a string to a URL-safe slug.
 *
 * @example
 * slugify('Hello, World!')  // → 'hello-world'
 * slugify('Ångström Units') // → 'angstrom-units'
 */
export function slugify(value: string): string {
  return value
    .normalize('NFD')                 // decompose accented characters
    .replace(/[\u0300-\u036f]/g, '')  // strip combining diacritical marks
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')     // replace non-alphanumeric runs with '-'
    .replace(/^-+|-+$/g, '');        // trim leading / trailing dashes
}
