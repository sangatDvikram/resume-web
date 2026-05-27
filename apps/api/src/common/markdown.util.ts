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
 * Strict custom rehype-sanitize allowlist (E10-S1).
 *
 * Only allows the exact HTML elements and attributes needed to render safe
 * GFM Markdown output. Strips <script>, <style>, event handlers, data URIs,
 * and any element not in the list below.
 */
const SANITIZE_SCHEMA = {
  strip: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'button'],
  allowComments: false,
  allowDoctypes: false,
  tagNames: [
    'h1','h2','h3','h4','h5','h6',
    'p','br','hr',
    'strong','em','del','code','pre','blockquote',
    'ul','ol','li',
    'table','thead','tbody','tr','th','td',
    'a','img',
    'div','span',
    'details','summary',
    'sup','sub',
    'kbd',
  ],
  attributes: {
    // anchors: only safe href (no javascript:, no data:)
    a: ['href', 'title', 'target', 'rel'],
    // images: src must be https or relative; no data URIs
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    // table alignment
    th: ['align'],
    td: ['align'],
    // code language class (e.g. language-ts)
    code: ['className'],
    pre: ['className'],
    div: ['className'],
    span: ['className'],
    '*': [],
  },
  protocols: {
    href: ['https', 'http', 'mailto'],
    src:  ['https'],
  },
};

/**
 * Renders a Markdown string to sanitized HTML.
 *
 * Pipeline:
 *   remark-parse → remark-gfm → remark-rehype → rehype-sanitize (strict) → rehype-stringify
 *
 * @param markdown Raw Markdown source.
 * @returns Sanitized HTML string.
 */
export async function renderMarkdown(markdown: string): Promise<string> {
  const { unified }                   = await esmImport('unified');
  const { default: remarkParse }      = await esmImport('remark-parse');
  const { default: remarkGfm }        = await esmImport('remark-gfm');
  const { default: remarkRehype }     = await esmImport('remark-rehype');
  const { default: rehypeSanitize }   = await esmImport('rehype-sanitize');
  const { default: rehypeStringify }  = await esmImport('rehype-stringify');

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSanitize, SANITIZE_SCHEMA)
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
