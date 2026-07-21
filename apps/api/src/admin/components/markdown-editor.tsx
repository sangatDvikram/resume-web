/**
 * E8-S3: AdminJS custom component — split-pane Markdown editor.
 *
 * Bundled by AdminJS's internal Rollup pipeline; runs in the BROWSER.
 * Registered via ComponentLoader in admin.module.ts and mounted on the
 * rawMarkdown field of the BlogPost resource and description on Project.
 *
 * Layout: [CodeMirror editor | live GFM preview via `marked`]
 * Upload flow: file picker → POST /v1/upload → insert ![name](url) at cursor.
 *
 * NOTE ON REACT DUPLICATION CRASHES: any package here that imports React via
 * the *automatic* JSX runtime ('react/jsx-runtime') crashes AdminJS's admin
 * panel with "Cannot read properties of undefined (reading
 * 'recentlyCreatedOwnerStacks')" — a React-19-internals mismatch. AdminJS's
 * Rollup bundler (node_modules/adminjs/lib/backend/bundler/*.js,
 * DEFAULT_EXTERNALS) only externalizes 'react' and 'react-dom', not
 * 'react/jsx-runtime', so that module gets bundled as a second, non-deduped
 * React copy. Both `react-markdown` AND `@uiw/react-codemirror` (its
 * compiled esm/index.js has `import {jsx as _jsx} from "react/jsx-runtime"`)
 * hit this. Grep any candidate replacement for "jsx-runtime" in its compiled
 * output before using it here — it won't show up in source-only greps of a
 * package that ships pre-built dist files.
 * `marked` (preview) is a zero-dependency string-returning parser, and the
 * editor below uses plain `@codemirror/*` + `codemirror` packages driven
 * imperatively (no React wrapper at all) — neither can hit this bug class.
 */
import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { marked } from 'marked';
import { EditorView, keymap, placeholder as cmPlaceholder, type KeyBinding } from '@codemirror/view';
import { EditorSelection } from '@codemirror/state';
import { indentWithTab } from '@codemirror/commands';
import { markdown as markdownLang } from '@codemirror/lang-markdown';
import { basicSetup } from 'codemirror';

// ── Markdown toolbar commands ──────────────────────────────────────────────
// Real CodeMirror commands — `(view) => boolean` dispatched via
// `state.changeByRange`, CodeMirror's own multi-selection-aware transaction
// API — rather than naive fixed-string inserts at a single cursor. Shared
// between the toolbar buttons below and the keymap, so both stay in sync.

function wrapSelection(before: string, after: string = before) {
  return (view: EditorView): boolean => {
    const tr = view.state.changeByRange((range) => {
      const selected = view.state.sliceDoc(range.from, range.to);
      // Toggle off if the selection is already wrapped.
      if (
        range.from >= before.length &&
        view.state.sliceDoc(range.from - before.length, range.from) === before &&
        view.state.sliceDoc(range.to, range.to + after.length) === after
      ) {
        return {
          changes: [
            { from: range.from - before.length, to: range.from, insert: '' },
            { from: range.to, to: range.to + after.length, insert: '' },
          ],
          range: EditorSelection.range(range.from - before.length, range.to - before.length),
        };
      }
      const insert = before + selected + after;
      return {
        changes: [{ from: range.from, to: range.to, insert }],
        range: range.empty
          ? EditorSelection.cursor(range.from + before.length)
          : EditorSelection.range(range.from + before.length, range.from + before.length + selected.length),
      };
    });
    view.dispatch(view.state.update(tr, { scrollIntoView: true, userEvent: 'input' }));
    view.focus();
    return true;
  };
}

function toggleHeading(view: EditorView): boolean {
  const tr = view.state.changeByRange((range) => {
    const line = view.state.doc.lineAt(range.from);
    const match = /^(#{1,6})\s/.exec(line.text);
    if (match) {
      return {
        changes: [{ from: line.from, to: line.from + match[0].length, insert: '' }],
        range: EditorSelection.range(range.from - match[0].length, range.to - match[0].length),
      };
    }
    return {
      changes: [{ from: line.from, insert: '## ' }],
      range: EditorSelection.range(range.from + 3, range.to + 3),
    };
  });
  view.dispatch(view.state.update(tr, { scrollIntoView: true, userEvent: 'input' }));
  view.focus();
  return true;
}

function insertCodeBlock(view: EditorView): boolean {
  const tr = view.state.changeByRange((range) => {
    const selected = view.state.sliceDoc(range.from, range.to);
    const insert = `\`\`\`\n${selected || 'code'}\n\`\`\``;
    return {
      changes: [{ from: range.from, to: range.to, insert }],
      range: selected
        ? EditorSelection.cursor(range.from + insert.length)
        : EditorSelection.range(range.from + 4, range.from + 8),
    };
  });
  view.dispatch(view.state.update(tr, { scrollIntoView: true, userEvent: 'input' }));
  view.focus();
  return true;
}

function insertLink(view: EditorView): boolean {
  const tr = view.state.changeByRange((range) => {
    const selected = view.state.sliceDoc(range.from, range.to) || 'text';
    const insert = `[${selected}](url)`;
    const urlStart = range.from + selected.length + 3;
    return {
      changes: [{ from: range.from, to: range.to, insert }],
      range: EditorSelection.range(urlStart, urlStart + 3),
    };
  });
  view.dispatch(view.state.update(tr, { scrollIntoView: true, userEvent: 'input' }));
  view.focus();
  return true;
}

const TOOLBAR_ACTIONS = [
  { label: 'B', title: 'Bold (Ctrl/Cmd+B)',        run: wrapSelection('**') },
  { label: 'I', title: 'Italic (Ctrl/Cmd+I)',       run: wrapSelection('*') },
  { label: 'H', title: 'Heading (Ctrl/Cmd+H)',      run: toggleHeading },
  { label: '`', title: 'Inline code (Ctrl/Cmd+E)',  run: wrapSelection('`') },
  { label: '≡', title: 'Code block',                run: insertCodeBlock },
  { label: '→', title: 'Link (Ctrl/Cmd+K)',         run: insertLink },
] as const;

const markdownKeymap: readonly KeyBinding[] = [
  { key: 'Mod-b', run: wrapSelection('**') },
  { key: 'Mod-i', run: wrapSelection('*') },
  { key: 'Mod-h', run: toggleHeading, preventDefault: true },
  { key: 'Mod-e', run: wrapSelection('`') },
  { key: 'Mod-k', run: insertLink, preventDefault: true },
];

const lightTheme = EditorView.theme({
  '&': { fontSize: '13px', backgroundColor: '#ffffff', color: '#1f2937' },
  '.cm-content': { fontFamily: '"Fira Code","Cascadia Code","JetBrains Mono",monospace', caretColor: '#1f2937' },
  '.cm-gutters': { backgroundColor: '#f9fafb', color: '#9ca3af', border: 'none' },
  '&.cm-focused': { outline: 'none' },
}, { dark: false });

function esc(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Colors pulled directly from apps/web/src/app/globals.css's light-mode
// `:root` vars (--foreground/--border/--surface/--link/--link-hover), which
// is what the public site's `.wiki-prose` class resolves to. Values
// confirmed via getComputedStyle() against the live blog post page, not
// hand-converted from the hsl() source — keep them in sync if that palette
// changes. Hardcoded (not CSS vars) because this renders in AdminJS, a
// separate app with no access to the web app's stylesheet.
const WIKI = {
  fg: '#202122',      // --foreground
  border: '#a0a8b0',  // --border
  surface: '#f9fafb', // --surface / --muted
  link: '#335ccc',    // --link
} as const;

// Light-theme renderer overrides (marked v18 token-object renderer API).
// Regular `function` (not arrows) so `this.parser` binds correctly — marked
// calls these as `this.renderer.<method>(token)`, per its own extension docs.
// Styled to match apps/web's `.wiki-prose` article rendering (see WIKI above
// and apps/web/src/app/globals.css) so what admins see in this preview is
// what actually ships on the public blog/project pages — not just "some
// readable light theme". AdminJS's global admin CSS also resets font-weight/
// margin on plain tags, so every element needs its own inline style
// regardless — relying on the browser default wouldn't even render bold
// text or paragraph spacing, let alone match the site.
const renderer = new marked.Renderer();

renderer.code = function ({ text }) {
  return `<pre style="background:${WIKI.surface};color:${WIKI.fg};padding:12px;border-radius:6px;overflow:auto"><code>${esc(text)}</code></pre>`;
};

renderer.codespan = function ({ text }) {
  return `<code style="background:${WIKI.surface};color:${WIKI.fg};padding:2px 6px;border-radius:4px;font-size:0.9em">${esc(text)}</code>`;
};

renderer.blockquote = function ({ tokens }) {
  return `<blockquote style="border-left:4px solid ${WIKI.border};background:${WIKI.surface};margin:0.5em 0;padding:0.75rem 1rem;color:${WIKI.fg};font-style:normal">${this.parser.parse(tokens)}</blockquote>`;
};

renderer.hr = function () {
  return `<hr style="border:none;border-top:1px solid ${WIKI.border};margin:1em 0">`;
};

renderer.link = function ({ href, title, tokens }) {
  const text = this.parser.parseInline(tokens);
  return `<a href="${href}" target="_blank" rel="noopener noreferrer"${title ? ` title="${esc(title)}"` : ''} style="color:${WIKI.link};text-decoration:none">${text}</a>`;
};

renderer.image = function ({ href, title, text }) {
  return `<img src="${href}" alt="${esc(text)}"${title ? ` title="${esc(title)}"` : ''} style="max-width:100%;border-radius:6px;margin:0.5em 0">`;
};

renderer.strong = function ({ tokens }) {
  return `<strong style="font-weight:700;color:${WIKI.fg}">${this.parser.parseInline(tokens)}</strong>`;
};

renderer.em = function ({ tokens }) {
  return `<em style="font-style:italic;color:${WIKI.fg}">${this.parser.parseInline(tokens)}</em>`;
};

renderer.del = function ({ tokens }) {
  return `<del style="text-decoration:line-through;color:${WIKI.fg}">${this.parser.parseInline(tokens)}</del>`;
};

renderer.paragraph = function ({ tokens }) {
  return `<p style="margin:0 0 1.25em;color:${WIKI.fg}">${this.parser.parseInline(tokens)}</p>`;
};

// h2/h3/h4 get the wiki bottom-rule + weight 600 (matches
// `.wiki-prose :where(h2, h3, h4)`); h1/h5/h6 aren't specially ruled on the
// site either (post titles render their own <h1> outside the markdown body).
const HEADING_SIZES: Record<number, string> = { 1: '1.8em', 2: '1.5em', 3: '1.25em', 4: '1.1em', 5: '1em', 6: '0.9em' };
const HEADING_MARGINS: Record<number, string> = { 2: '2em 0 0.6em', 3: '1.6em 0 0.5em' };

renderer.heading = function ({ tokens, depth }) {
  const size = HEADING_SIZES[depth] ?? '1em';
  const margin = HEADING_MARGINS[depth] ?? '1em 0 0.5em';
  const rule = depth >= 2 && depth <= 4 ? `border-bottom:1px solid ${WIKI.border};padding-bottom:0.2em;` : '';
  return `<h${depth} style="margin:${margin};font-weight:600;font-size:${size};color:${WIKI.fg};${rule}">${this.parser.parseInline(tokens)}</h${depth}>`;
};

renderer.list = function ({ ordered, start, items }) {
  const tag = ordered ? 'ol' : 'ul';
  const startAttr = ordered && start !== 1 ? ` start="${start}"` : '';
  const body = items.map((item) => this.listitem(item)).join('');
  return `<${tag}${startAttr} style="margin:0 0 1.25em;padding-left:1.5em;color:${WIKI.fg}">${body}</${tag}>`;
};

renderer.listitem = function (item) {
  return `<li style="margin:0.25em 0">${this.parser.parse(item.tokens)}</li>`;
};

marked.setOptions({ gfm: true, breaks: false, renderer });

const MarkdownEditor = ({ property, record, onChange }: any) => {
  const fieldPath: string = property.path;
  const initialValue: string = record?.params?.[fieldPath] ?? '';

  const [value, setValue]         = useState<string>(initialValue);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'split' | 'editor' | 'preview'>('split');
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const fileInputRef  = useRef<HTMLInputElement>(null);

  const previewHtml = useMemo(() => (value ? marked.parse(value, { async: false }) : ''), [value]);

  const handleChange = useCallback((v: string) => {
    setValue(v);
    onChange(fieldPath, v);
  }, [fieldPath, onChange]);

  // Mount CodeMirror once. The container div is always rendered (only its
  // `display` toggles with the tab) so this EditorView is never orphaned by
  // a conditional unmount — see the `editorWrapStyle` display toggle below.
  const handleChangeRef = useRef(handleChange);
  handleChangeRef.current = handleChange;

  useEffect(() => {
    if (!editorContainerRef.current) return;
    const view = new EditorView({
      doc: value,
      extensions: [
        keymap.of([...markdownKeymap, indentWithTab]),
        basicSetup,
        markdownLang(),
        EditorView.lineWrapping,
        lightTheme,
        cmPlaceholder('Write Markdown here…'),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) handleChangeRef.current(update.state.doc.toString());
        }),
      ],
      parent: editorContainerRef.current,
    });
    editorViewRef.current = view;
    return () => { view.destroy(); editorViewRef.current = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync when record changes (page load / re-fetch) — replace the whole doc
  // in the live view rather than remounting CodeMirror.
  useEffect(() => {
    const v = record?.params?.[fieldPath] ?? '';
    setValue(v);
    const view = editorViewRef.current;
    if (view && view.state.doc.toString() !== v) {
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: v } });
    }
  }, [record?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const insertAtCursor = useCallback((text: string) => {
    const view = editorViewRef.current;
    if (!view) return;
    const { from, to } = view.state.selection.main;
    view.dispatch({
      changes: { from, to, insert: text },
      selection: { anchor: from + text.length },
    });
    const next = view.state.doc.toString();
    setValue(next);
    onChange(fieldPath, next);
    view.focus();
  }, [fieldPath, onChange]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/v1/upload', { method: 'POST', body: fd, credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { url } = await res.json();
      insertAtCursor(`![${file.name.replace(/\.[^.]+$/, '')}](${url})`);
    } catch (err: any) {
      alert(`Image upload failed: ${err?.message ?? 'unknown error'}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Styles (light theme, matches AdminJS's default light admin UI) ───────────
  // Both panes stay mounted always; `display` toggles with the active tab so
  // the CodeMirror EditorView (mounted once, imperatively) never gets torn
  // down by a conditional unmount.
  const showEditor  = activeTab !== 'preview';
  const showPreview = activeTab !== 'editor';

  const editorWrapStyle: React.CSSProperties = {
    display: showEditor ? 'block' : 'none',
    flex: 1, border: '1px solid #d1d5db', borderRadius: '6px',
    overflow: 'hidden', boxSizing: 'border-box', minHeight: '460px',
  };
  const previewStyle: React.CSSProperties = {
    display: showPreview ? 'block' : 'none',
    flex: 1, padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '6px',
    background: '#ffffff', color: WIKI.fg, minHeight: '460px',
    overflowY: 'auto', fontSize: '16px', lineHeight: '1.6',
    boxSizing: 'border-box',
  };
  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '5px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
    border: '1px solid #d1d5db', borderRadius: '5px', background: active ? '#3d5af1' : '#ffffff',
    color: active ? '#fff' : '#4b5563',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* View mode tabs */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['split', 'editor', 'preview'] as const).map(t => (
            <button key={t} type="button" style={tabBtn(activeTab === t)} onClick={() => setActiveTab(t)}>
              {t === 'split' ? '⊟ Split' : t === 'editor' ? '✏ Editor' : '👁 Preview'}
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        {/* Markdown shortcuts — same CodeMirror commands bound in markdownKeymap */}
        {TOOLBAR_ACTIONS.map(({ label, title, run }) => (
          <button key={label} type="button" title={title}
            onClick={() => { const view = editorViewRef.current; if (view) run(view); }}
            style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 700, border: '1px solid #d1d5db', borderRadius: '4px', background: '#ffffff', color: '#4b5563', cursor: 'pointer' }}>
            {label}
          </button>
        ))}
        {/* Image upload */}
        <button type="button" disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          style={{ padding: '5px 12px', fontSize: '12px', fontWeight: 600, border: '1px solid #3d5af1', borderRadius: '4px', background: uploading ? '#f3f4f6' : '#eef1fe', color: '#3d5af1', cursor: uploading ? 'not-allowed' : 'pointer' }}>
          {uploading ? '⏳ Uploading…' : '📷 Image'}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
      </div>

      {/* Split pane — both sides always mounted, `display` toggled by tab */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <div ref={editorContainerRef} style={editorWrapStyle} />
        {previewHtml ? (
          <div style={previewStyle} dangerouslySetInnerHTML={{ __html: previewHtml as string }} />
        ) : (
          <div style={previewStyle}>
            <span style={{ color: '#9ca3af' }}>Preview will appear here…</span>
          </div>
        )}
      </div>

      <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
        CodeMirror editor · GFM preview via marked · Ctrl+Z to undo
      </p>
    </div>
  );
};

export default MarkdownEditor;
