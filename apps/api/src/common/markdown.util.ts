/**
 * Server-side Markdown → sanitized HTML renderer.
 *
 * `unified`, `remark-*`, and `rehype-*` are ESM-only packages. The API is
 * compiled to CommonJS, so TypeScript's static `import()` is transpiled to
 * `require()`, which cannot load ESM-only modules.
 *
 * The same `new Function('return import(m)')` trick used in admin.module.ts
 * bypasses the TypeScript compiler and keeps the import as a native ESM
 * dynamic import at runtime, where Node.js can load ESM-only packages.
 */

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const esmImport = new Function('m', 'return import(m)') as (m: string) => Promise<any>;

/**
 * Renders a Markdown string to sanitized HTML.
 *
 * Pipeline:
 *   remark-parse → remark-gfm → remark-rehype → rehype-sanitize → rehype-stringify
 *
 * @param markdown Raw Markdown source.
 * @returns Sanitized HTML string.
 */
export async function renderMarkdown(markdown: string): Promise<string> {
  const { unified }        = await esmImport('unified');
  const { default: remarkParse }    = await esmImport('remark-parse');
  const { default: remarkGfm }      = await esmImport('remark-gfm');
  const { default: remarkRehype }   = await esmImport('remark-rehype');
  const { default: rehypeSanitize } = await esmImport('rehype-sanitize');
  const { default: rehypeStringify } = await esmImport('rehype-stringify');

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(markdown);

  return String(file);
}

/**
 * Estimates reading time in minutes for a given text.
 *
 * Uses an average reading speed of 200 words per minute.
 * Returns a minimum of 1 minute.
 *
 * @param text Raw text (Markdown source works fine).
 * @returns Estimated reading time in minutes.
 */
export function estimateReadingTime(text: string): number {
  const wordCount = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(wordCount / 200));
}
