import { nanoid } from 'nanoid';

/**
 * Convert a string to a URL-safe slug.
 *
 * Mirrors the implementation in `@portfolio-cms/utils` so the API can use it
 * without importing from the shared package (which is ESM-only).
 *
 * @example
 * slugify('Hello, World!')  // → 'hello-world'
 */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate a collision-resistant, URL-safe slug from a title.
 *
 * The slug is composed of:
 *   - a slugified version of the title (up to 60 characters), and
 *   - a nanoid suffix (8 characters, URL-safe alphabet).
 *
 * @example
 * generateSlug('My Blog Post')  // → 'my-blog-post-V1StGXR8'
 *
 * @param title  Human-readable title to derive the slug from.
 * @param size   Length of the nanoid suffix (default: 8).
 */
export function generateSlug(title: string, size = 8): string {
  const base = slugify(title).slice(0, 60);
  const id = nanoid(size);
  return base ? `${base}-${id}` : id;
}
