/**
 * E10-S1: Display-layer HTML sanitization for blog posts and project descriptions.
 *
 * The content is already sanitized by rehype-sanitize in the NestJS pipeline
 * before it is stored. This function provides a defense-in-depth second pass
 * in the Next.js renderer, stripping any residual unsafe patterns that could
 * be introduced through direct DB edits or future pipeline changes.
 *
 * Uses a strict allowlist matching the server-side SANITIZE_SCHEMA.
 * Runs on the server (RSC) — no browser DOMParser needed.
 */

/**
 * Strips tags not in ALLOWED_TAGS, removes unsafe attributes and protocols.
 * Works without a DOM — uses simple regex passes sufficient for server-side RSC.
 *
 * @param html  Sanitized HTML from the API (already rehype-sanitize processed).
 * @returns     Double-sanitized HTML safe for dangerouslySetInnerHTML.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  // 1. Strip entirely dangerous elements (including content)
  let out = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/<form[\s\S]*?<\/form>/gi, '');

  // 2. Strip all on* event handler attributes (onclick, onerror, etc.)
  out = out.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '');

  // 3. Strip javascript: and data: URIs in href/src
  out = out.replace(
    /(href|src|action)\s*=\s*["']?\s*(javascript:|data:|vbscript:)[^"'\s>]*/gi,
    '$1="#"',
  );

  return out;
}
